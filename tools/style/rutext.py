"""Разбор русского markdown-текста без зависимостей.

Общий слой для scan_tells.py, scan_rhythm.py и calibrate.py. Решает три задачи,
на которых спотыкался первый сканер:

1. **Что считать текстом.** Frontmatter, code fences, URL внутри ссылок и
   определения сносок — не проза. Раньше они попадали в словарь и разбавляли
   плотность: статья на 3800 слов прозы выглядела как 4700, и вердикт «чисто»
   был частично куплен ссылками.

2. **Где считать.** Строка списка, заголовок, ячейка таблицы и цитата живут по
   другим правилам, чем абзац. Длинное тире в буллете «— пояснение» — разделитель
   списка, а не авторская ремарка, и в плотность тире ему попадать незачем.

3. **Номера строк.** Вырезанное заменяется таким же количеством переводов строки,
   поэтому номера в отчёте совпадают с исходным файлом.

Всё чисто на stdlib. pymorphy3 подхватывается, если установлен, и тогда снимается
омонимия «данные» (существительное) против «данный» (местоимение); без него
соответствующий тэлл сужается до однозначных форм.
"""

from __future__ import annotations

import re

# ─────────────────────────────────────────────────────────────────────────────
# Опциональная морфология
# ─────────────────────────────────────────────────────────────────────────────

try:  # pragma: no cover - зависит от окружения
    import pymorphy3

    _MORPH = pymorphy3.MorphAnalyzer()
except Exception:  # ImportError и падения на несовместимых версиях Python
    _MORPH = None

HAS_MORPH = _MORPH is not None


def pos(word: str) -> str | None:
    """Часть речи по pymorphy3 или None, если морфология недоступна."""
    if _MORPH is None:
        return None
    parsed = _MORPH.parse(word)
    if not parsed:
        return None
    return parsed[0].tag.POS


# ─────────────────────────────────────────────────────────────────────────────
# Очистка markdown
# ─────────────────────────────────────────────────────────────────────────────

_FRONTMATTER = re.compile(r'\A---\n.*?\n---\n', re.S)
_FENCE = re.compile(r'^```.*?^```', re.S | re.M)
_HTML_COMMENT = re.compile(r'<!--.*?-->', re.S)
_FOOTNOTE_DEF = re.compile(r'^\[\^[^\]]+\]:.*$', re.M)
_LINK_URL = re.compile(r'\]\([^)\s]*(?:\s+"[^"]*")?\)')
_BARE_URL = re.compile(r'https?://\S+')
_INLINE_CODE = re.compile(r'`[^`\n]*`')
_IMAGE = re.compile(r'!\[[^\]]*\]')
# Wikilink разворачивается в то, что читатель видит: у [[Файл|подпись]] это
# подпись, у [[Файл]] — имя файла. Иначе служебная половина ссылки попадает в
# счёт слов и знаков: имена заметок в Obsidian длинные и часто с тире.
_WIKILINK_ALIAS = re.compile(r'\[\[[^\]|\n]+\|([^\]\n]+)\]\]')
_WIKILINK_PLAIN = re.compile(r'\[\[([^\]|\n]+)\]\]')


def _blank_out(match: re.Match) -> str:
    """Заменяет совпадение переводами строк, сохраняя нумерацию."""
    return '\n' * match.group(0).count('\n')


def strip_markdown(text: str) -> str:
    """Оставляет только то, что автор написал словами.

    Номера строк не смещаются: многострочные вырезки заменяются переводами строк.
    """
    text = _FRONTMATTER.sub(_blank_out, text)
    text = _FENCE.sub(_blank_out, text)
    text = _HTML_COMMENT.sub(_blank_out, text)
    text = _FOOTNOTE_DEF.sub('', text)
    text = _IMAGE.sub(']', text)
    text = _WIKILINK_ALIAS.sub(r'\1', text)
    text = _WIKILINK_PLAIN.sub(r'\1', text)
    text = _LINK_URL.sub(']', text)
    text = _BARE_URL.sub('', text)
    text = _INLINE_CODE.sub('', text)
    return text


# ─────────────────────────────────────────────────────────────────────────────
# Классификация строк
# ─────────────────────────────────────────────────────────────────────────────

_HEADING = re.compile(r'^\s{0,3}#{1,6}\s')
_LIST_ITEM = re.compile(r'^\s*(?:[-*+•]|\d+[.)])\s+\S')
_TABLE_ROW = re.compile(r'^\s*\|')
_QUOTE = re.compile(r'^\s*>')

PROSE = 'prose'
HEADING = 'heading'
LIST = 'list'
TABLE = 'table'
QUOTE = 'quote'
BLANK = 'blank'


def classify(line: str) -> str:
    if not line.strip():
        return BLANK
    if _HEADING.match(line):
        return HEADING
    if _TABLE_ROW.match(line):
        return TABLE
    if _LIST_ITEM.match(line):
        return LIST
    if _QUOTE.match(line):
        return QUOTE
    return PROSE


def prose_lines(text: str) -> list[str]:
    """Только абзацный текст: без заголовков, списков, таблиц и цитат."""
    return [ln for ln in text.split('\n') if classify(ln) == PROSE]


def prose_text(text: str) -> str:
    return '\n'.join(prose_lines(text))


def prose_segments(text: str) -> list[str]:
    """Куски прозы, разделённые непрозаическим содержимым.

    prose_text склеивает всё в один поток, и метрика, которая смотрит на
    соседство предложений, считает соседями фразы, между которыми в тексте
    стоял заголовок, список или таблица. Читатель такого соседства не видит:
    между ними у него полстраницы структуры.

    Пустая строка кусок не разрывает — соседние абзацы читаются подряд, и
    ровный ритм через их границу настоящий.
    """
    segments: list[str] = []
    buf: list[str] = []
    for line in text.split('\n'):
        kind = classify(line)
        if kind == PROSE:
            buf.append(line)
        elif kind == BLANK:
            continue
        elif buf:
            segments.append('\n'.join(buf))
            buf = []
    if buf:
        segments.append('\n'.join(buf))
    return segments


def prose_blocks(text: str) -> str:
    """То же, но с сохранением разбиения на абзацы.

    Заголовки, списки, таблицы и цитаты заменяются пустой строкой, а не
    выбрасываются: иначе соседние абзацы, разделённые списком, склеиваются в
    один, и разброс длины абзацев считается по мусору.
    """
    out = []
    for line in text.split('\n'):
        out.append(line if classify(line) in (PROSE, BLANK) else '')
    return '\n'.join(out)


# ─────────────────────────────────────────────────────────────────────────────
# Слова и предложения
# ─────────────────────────────────────────────────────────────────────────────

_WORD = re.compile(r'\b[а-яёa-z][а-яёa-z-]*\b', re.IGNORECASE)


def words(text: str) -> list[str]:
    return _WORD.findall(text)


def word_count(text: str) -> int:
    return len(_WORD.findall(text))


# Сокращения, после точки в которых предложение не заканчивается.
_ABBR = {
    'т', 'е', 'д', 'п', 'к', 'др', 'пр', 'см', 'рис', 'табл', 'гл', 'стр',
    'им', 'г', 'гг', 'в', 'вв', 'н', 'э', 'обл', 'руб', 'коп', 'тыс', 'млн',
    'млрд', 'проф', 'акад', 'англ', 'лат', 'рус',
}

_SENT_SPLIT = re.compile(r'(?<=[.!?…])[»"\')\]]*\s+')


def sentences(text: str) -> list[str]:
    """Дробление на предложения. Учитывает сокращения и десятичные дроби.

    razdel точнее, но тянет зависимость. Для метрик ритма (дисперсия длины)
    редкая ошибка дробления погоды не делает: она добавляет шум, а не смещение.
    """
    raw = _SENT_SPLIT.split(text)
    out: list[str] = []
    for chunk in raw:
        chunk = chunk.strip()
        if not chunk:
            continue
        if out and _is_false_break(out[-1]):
            out[-1] = f'{out[-1]} {chunk}'
        else:
            out.append(chunk)
    return [s for s in out if _WORD.search(s)]


def _is_false_break(prev: str) -> bool:
    """Точка в конце prev не заканчивает предложение."""
    tail = prev.rstrip()
    if not tail.endswith('.'):
        return False
    last = re.search(r'([А-Яа-яЁёA-Za-z0-9]+)\.$', tail)
    if not last:
        return False
    token = last.group(1)
    if token.lower() in _ABBR:
        return True
    # Инициал или одиночная цифра: «А.» «5.»
    return len(token) == 1


def sentence_lengths(text: str) -> list[int]:
    return [n for n in (word_count(s) for s in sentences(text)) if n]
