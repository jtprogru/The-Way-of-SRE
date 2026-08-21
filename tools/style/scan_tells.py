#!/usr/bin/env python3
"""Регексный сканер AI-тэллов в русском тексте.

Зачем скрипт, если каталог паттернов есть в самом скилле: поиск экземпляров —
механическая работа. Когда её делает модель, она стоит токенов на каждом проходе
и пропускает вхождения, особенно на длинных текстах. Регекс не пропускает и не
устаёт, а модель занимается тем, что регексу недоступно, — переписыванием.

Второе применение — контроль после правки. Переписывающая модель заносит те же
тэллы обратно в парафразе, и заметить это на глаз тяжело: текст изменился, а
плотность маркеров осталась. Повторный прогон даёт число, а не ощущение.

Что сканер НЕ умеет: видеть ровный ритм, отсутствие конкретики и эмоциональную
плоскость. Ритм считает scan_rhythm.py, остальное — только глазами.

Использование:
  scan_tells.py <файл>              отчёт по тэллам
  scan_tells.py <файл> --json       то же машиночитаемо
  scan_tells.py <файл> --sections   разбивка по секциям (где именно плохо)
  scan_tells.py <до> <после>        сравнение: что ушло, что осталось, что добавилось

Пороги берутся из baseline.json рядом со скриптом, если он есть. Собрать свой:
  calibrate.py <каталог-с-текстами>

Зависимостей нет, Python 3.9+. pymorphy3 подхватывается, если установлен.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import rutext  # noqa: E402

# ─────────────────────────────────────────────────────────────────────────────
# Каталог экземплярных тэллов. Каждый: (код, описание, регекс, вес)
#
# Сюда попадает то, что подозрительно само по себе: конструкция или штамп,
# который живой автор употребляет редко и осознанно. Слова, нормальные
# поодиночке и подозрительные в скоплении, живут ниже, в RATE_TELLS: ловить их
# поштучно означает топить отчёт в шуме.
#
# Вес — сила сигнала. 3 — почти наверняка машина, 2 — тик, который стоит убрать.
# Ни один тэлл не приговор: живой автор тоже пишет «важно отметить». Приговор
# выносит плотность, и та лишь показывает, куда смотреть.
# ─────────────────────────────────────────────────────────────────────────────

TELLS = [
    # A. Слова-подушки и мета-комментарии
    ('A1', 'вводные-подушки',
     r'\b(важно (?:отметить|понимать|помнить)|стоит (?:отметить|подчеркнуть)|'
     r'следует (?:отметить|учитывать)|нельзя не (?:отметить|упомянуть))\b', 3),
    ('A2', 'обобщающие связки',
     r'\b(таким образом|в целом|в конечном (?:счёте|счете|итоге)|подводя итог|'
     r'резюмируя|итак,)\b', 2),
    ('A3', 'безусловно-конечно',
     r'\b(безусловно|несомненно|разумеется|конечно же)\b', 2),

    # B. Канцелярит
    ('B1', 'является/представляет собой',
     r'\b(являет(?:ся|ются)|представля(?:ет|ют) собой)\b', 3),
    ('B2', 'осуществление действия',
     r'\b(осуществля(?:ет|ют|ется)|производит(?:ся)? (?:анализ|оценка|проверка)|'
     r'выполня(?:ет|ется) (?:функци|роль))', 3),
    # Только однозначные формы. Множественное число («данные», «данных»)
    # омонимично существительному и в техническом тексте даёт систематические
    # ложные срабатывания: «в данных образовалось расхождение» — это про data,
    # а не канцелярит. Потеря в полноте сознательная, см. references/tells-ru.md.
    ('B3', 'данный вместо этот',
     r'\bданн(?:ый|ая|ое|ого|ому|ом|ой|ую)\b', 2),

    # C. Маркетинговая лексика
    ('C1', 'мощный-революционный',
     r'\b(мощн(?:ый|ая|ое|ые)|революционн(?:ый|ая|ое)|инновационн(?:ый|ая|ое)|'
     r'уникальн(?:ый|ая|ое)|передов(?:ой|ая|ое)|современн(?:ый|ая|ое) подход)\b', 3),
    ('C3', 'погружение-мир',
     r'\b(давайте (?:погрузимся|разберёмся|рассмотрим)|погрузимся в|'
     r'в мире (?:технологий|разработки|бизнеса)|в современном мире)\b', 3),

    # D. Структурные штампы
    ('D2', 'не просто X, а Y',
     r'\bне просто [^,.\n]{2,40}, а\b', 3),
    ('D3', 'не только X, но и Y',
     r'\bне только [^,.\n]{2,50}, но и\b', 2),
    ('D4', 'это не X, это Y',
     r'\bэто не [^,.\n]{2,40}[,.] это\b', 3),
    ('D5', 'дело не в X, а в Y',
     r'\bдело не в [^,.\n]{2,40}, а в\b', 2),

    # E. Псевдоточность
    ('E2', 'десятки-сотни-тысячи',
     r'\b(десятки|сотни|тысячи) (?:различных|разных|способов|вариантов|причин)\b', 2),

    # F. Хеджирование и обе стороны
    ('F2', 'с одной стороны',
     r'\bс одной стороны\b.{0,400}?\bс другой стороны\b', 2),
    ('F3', 'всё зависит от',
     r'\b(всё зависит от|зависит от (?:конкретной )?ситуации|нет однозначного ответа)\b', 2),

    # H. Обращения к читателю
    ('H1', 'дорогой читатель',
     r'\b(дорог(?:ой|ие) (?:читател|друз)|уважаем(?:ый|ые) читател)', 3),
    ('H2', 'надеюсь, это поможет',
     r'\b(надеюсь,? (?:это|эта)? ?(?:помож|был)|буду рад, если|'
     r'если у вас (?:остались|есть) вопрос)', 3),

    # I. Заключения ни о чём
    ('I1', 'главное — начать',
     r'\b(главное[  ]—[  ]начать|не бойтесь экспериментировать|'
     r'выбор за вами|время покажет)\b', 3),
    ('I2', 'играет важную роль',
     r'\b(игра(?:ет|ют) (?:важную|ключевую) роль|имеет большое значение)\b', 3),
]

COMPILED = [(code, desc, re.compile(rx, re.IGNORECASE | re.MULTILINE), w)
            for code, desc, rx, w in TELLS]

# ─────────────────────────────────────────────────────────────────────────────
# Агрегатные тэллы: сигналом служит частота, а не сам факт.
#
# «Ключевой», «эффективный», «в качестве», «от X до Y» — нормальные обороты.
# Один раз это язык, пять раз на страницу — тик.
#
# Тире считается ТОЛЬКО в прозе. В буллете «— пояснение» это разделитель списка,
# в таблице — тоже, и к авторской ремарке отношения не имеет.
#
# G1 считает не все тире, а парные — вставную конструкцию внутри предложения.
# Общая плотность тире мерит русскую грамматику, а не машину: «X — это Y»,
# неполное предложение, обобщение после однородных ставятся по правилу. У
# автора лонгридов таких тире втрое больше, чем в его же технических текстах,
# так что порог по общему счётчику отделяет жанр от жанра. Калька с
# английского em-dash — именно ремарка в сторону, парой тире там, где русский
# поставил бы запятую, двоеточие или точку. Её и считаем, а общая плотность
# уходит в справочную строку: без порога и без вклада в вердикт.
#
# (код, описание, регекс, порог на 100 слов, вес при превышении, только-проза)
# ─────────────────────────────────────────────────────────────────────────────

RATE_TELLS = [
    ('G1', 'вставные тире (ремарка в сторону)', r'—[^—.!?;:\n]{1,120}—', 0.3, 2, True),
    ('F1', 'скопление хеджирования',
     r'\b(возможно|вероятно|как правило|обычно|зачастую|порой|скорее всего)\b', 1.8, 2, False),
    ('D1', 'однообразные тройные перечисления',
     r'\b\w+, \w+ и \w+[.,]', 1.2, 1, False),
    ('C2', 'скопление «ключевой-важнейший»',
     r'\b(ключев(?:ой|ая|ое|ые|ым|ого)|важнейш(?:ий|ая|ее)|критически важн)', 0.4, 2, False),
    ('C4', 'скопление «эффективный-оптимальный»',
     r'\b(эффективн(?:ый|ая|ое|ые|о)|оптимальн(?:ый|ая|ое|ые))\b', 0.3, 1, False),
    ('B4', 'скопление «в рамках/в качестве»',
     r'\b(в рамках|в целях|с целью|в качестве|при помощи)\b', 0.5, 1, False),
    ('B5', 'скопление «наличие/отсутствие»',
     r'\b(наличи(?:е|я|ем)|отсутстви(?:е|я|ем))\b', 0.4, 1, False),
    ('E1', 'скопление «от X до Y»',
     r'\bот [^.\n]{3,40} до [^.\n]{3,40}[,.]', 0.5, 1, False),
]

RATE_COMPILED = [(code, desc, re.compile(rx, re.IGNORECASE | re.MULTILINE), t, w, p)
                 for code, desc, rx, t, w, p in RATE_TELLS]

# Агрегатный тэлл — про скопление, поэтому одного-двух вхождений мало даже при
# формально превышенном пороге. У автора, который слово почти не употребляет,
# калиброванный порог уходит в ноль, и без этого минимума любое единичное
# употребление становилось бы находкой.
RATE_MIN_HITS = 3

# Пороги вердикта. Значения по умолчанию — грубый ориентир; calibrate.py
# пересчитывает их по реальному корпусу автора и кладёт в baseline.json.
DEFAULT_BANDS = [(1.5, 'чисто'), (3.5, 'следы есть, точечная правка'),
                 (6.0, 'заметно, нужна переработка')]
WORST_BAND = 'плотно, переписывать целиком'

BASELINE_PATH = Path(__file__).resolve().parent / 'baseline.json'


def load_baseline():
    if not BASELINE_PATH.is_file():
        return {}
    try:
        return json.loads(BASELINE_PATH.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return {}


BASELINE = load_baseline()


def _rate_threshold(code, fallback):
    return BASELINE.get('rate_thresholds', {}).get(code, fallback)


def _bands():
    raw = BASELINE.get('bands')
    if not raw:
        return DEFAULT_BANDS
    return [(float(limit), label) for limit, label in raw]


# ─────────────────────────────────────────────────────────────────────────────
# Сканирование
# ─────────────────────────────────────────────────────────────────────────────

def scan(raw_text):
    """Считает тэллы по очищенному тексту.

    Возвращает находки, плотность и словарь: сколько слов реально
    проанализировано против того, сколько было в файле.
    """
    stripped = rutext.strip_markdown(raw_text)
    prose = rutext.prose_text(stripped)

    words = rutext.word_count(stripped)
    prose_words = rutext.word_count(prose)

    findings = []
    for code, desc, rx, weight in COMPILED:
        for m in rx.finditer(stripped):
            findings.append({
                'code': code,
                'tell': desc,
                'weight': weight,
                'line': stripped.count('\n', 0, m.start()) + 1,
                'match': m.group(0).strip()[:80],
            })

    for code, desc, rx, fallback, weight, prose_only in RATE_COMPILED:
        haystack, base = (prose, prose_words) if prose_only else (stripped, words)
        hits = len(rx.findall(haystack))
        if not base or hits < RATE_MIN_HITS:
            continue
        rate = hits / base * 100
        threshold = _rate_threshold(code, fallback)
        if rate > threshold:
            findings.append({
                'code': code,
                'tell': desc,
                'weight': weight,
                'line': 0,
                'match': f'{hits} шт., {rate:.1f} на 100 слов при пороге {threshold}',
            })

    findings.sort(key=lambda f: (-f['weight'], f['line']))
    score = sum(f['weight'] for f in findings)
    return {
        'words': words,
        'prose_words': prose_words,
        'raw_words': rutext.word_count(raw_text),
        'findings': findings,
        'total': len(findings),
        'score': score,
        # Плотность на 100 слов: сравнимая величина для текстов разной длины.
        'density': round(score / words * 100, 2) if words else 0.0,
        # Справочно, без порога: сколько всего тире в прозе. Величина говорит о
        # жанре и о привычке автора, а не о происхождении текста, поэтому в
        # вердикт не входит — см. комментарий к G1.
        'dash_rate': round(prose.count('—') / prose_words * 100, 2) if prose_words else 0.0,
    }


def split_sections(raw_text):
    """Режет текст по заголовкам H2/H3. Возвращает [(заголовок, кусок)]."""
    lines = raw_text.split('\n')
    sections = []
    title = '(вступление)'
    buf = []
    for line in lines:
        if re.match(r'^\s{0,3}#{2,3}\s', line):
            if buf:
                sections.append((title, '\n'.join(buf)))
            title = line.lstrip('# ').strip()
            buf = []
        else:
            buf.append(line)
    if buf:
        sections.append((title, '\n'.join(buf)))
    return sections


def scan_sections(raw_text, min_words=80):
    """Плотность по секциям: длинная статья не должна прятать плохой раздел.

    Секции короче min_words пропускаются — на них плотность скачет от одной
    находки и означает не качество текста, а малую выборку.
    """
    out = []
    for title, body in split_sections(raw_text):
        data = scan(body)
        if data['words'] < min_words:
            continue
        out.append({'title': title, **data})
    out.sort(key=lambda s: -s['density'])
    return out


def verdict(density):
    """Ориентир, а не измерение.

    Назначение порогов — не «доказать», что текст машинный, а показать, куда
    смотреть. Финальное решение всегда за человеком, который читает текст.
    """
    for limit, label in _bands():
        if density < limit:
            return label
    return WORST_BAND


# ─────────────────────────────────────────────────────────────────────────────
# Вывод
# ─────────────────────────────────────────────────────────────────────────────

def report(path, data, as_json, sections=None):
    if as_json:
        payload = {'path': str(path), **data}
        if sections is not None:
            payload['sections'] = sections
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return

    dropped = data['raw_words'] - data['words']
    print(f'📄 {path}')
    print(f'   слов: {data["words"]} (из них проза: {data["prose_words"]}; '
          f'отброшено разметки: {dropped})')
    print(f'   находок: {data["total"]}, плотность: {data["density"]} на 100 слов')
    print(f'   вердикт: {verdict(data["density"])}')
    print(f'   тире в прозе: {data["dash_rate"]} на 100 слов — справочно, порога нет')
    if not rutext.HAS_MORPH:
        print('   (pymorphy3 не установлен — часть проверок сужена)')
    print()

    if not data['findings']:
        print('   Тэллов не найдено.')
    else:
        by_code = {}
        for f in data['findings']:
            by_code.setdefault((f['code'], f['tell']), []).append(f)
        for (code, tell), items in sorted(by_code.items(), key=lambda kv: -len(kv[1])):
            print(f'   [{code}] {tell} — {len(items)}')
            for f in items[:3]:
                where = f'строка {f["line"]}' if f['line'] else 'весь текст'
                print(f'        {where}: {f["match"]}')
            if len(items) > 3:
                print(f'        … ещё {len(items) - 3}')

    if sections:
        print('\n   Плотность по секциям (худшие сверху):')
        for s in sections[:5]:
            print(f'      {s["density"]:5.2f}  {s["words"]:5d} сл.  {s["title"]}')


def compare(before_path, after_path):
    before = scan(Path(before_path).read_text(encoding='utf-8'))
    after = scan(Path(after_path).read_text(encoding='utf-8'))

    def key_set(d):
        return {(f['code'], f['match']) for f in d['findings']}

    b, a = key_set(before), key_set(after)
    removed, added, kept = b - a, a - b, b & a

    print(f'Плотность: {before["density"]} → {after["density"]} на 100 слов')
    print(f'Вердикт:   {verdict(before["density"])} → {verdict(after["density"])}\n')
    print(f'  убрано:   {len(removed)}')
    print(f'  осталось: {len(kept)}')
    print(f'  добавлено при переписывании: {len(added)}')
    if added:
        # Главное, ради чего нужен повторный прогон: правка заносит те же
        # штампы в новой формулировке, и на глаз это почти не видно.
        print('\n  Новые тэллы (появились там, где их не было):')
        for code, match in sorted(added)[:10]:
            print(f'    [{code}] {match}')
    sys.exit(0 if after['density'] <= before['density'] else 2)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    as_json = '--json' in sys.argv
    want_sections = '--sections' in sys.argv
    if not args or '--help' in sys.argv or '-h' in sys.argv:
        print(__doc__)
        return
    if len(args) >= 2:
        compare(args[0], args[1])
        return
    path = Path(args[0]).expanduser()
    if not path.is_file():
        print(f'ошибка: не файл: {path}', file=sys.stderr)
        sys.exit(1)
    raw = path.read_text(encoding='utf-8')
    sections = scan_sections(raw) if want_sections else None
    report(path, scan(raw), as_json, sections)


if __name__ == '__main__':
    main()
