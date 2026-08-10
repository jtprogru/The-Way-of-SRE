#!/usr/bin/env python3
"""Ритм и структура текста: то, чего регексный сканер тэллов не видит.

scan_tells.py ищет штампы — конкретные слова и конструкции. Но самый устойчивый
признак машинного текста не в словах, а в ровности: предложения одной длины,
абзацы одного размера, равномерная плотность информации. Текст можно вычистить
от всех 52 паттернов и оставить мёртвым, потому что он гладкий.

Что меряем и почему:

- **CV длины предложений** (stdev/mean). Главный показатель. У живого автора
  короткие фразы чередуются с длинными, разброс большой. Модель выдаёт ровный
  поток. Абсолютная средняя длина при этом ничего не говорит — важна дисперсия.
- **CV длины абзацев.** То же на уровень выше. Пять секций по четыре абзаца —
  структурная монотонность, она усыпляет даже при рваном ритме фраз.
- **Доля коротких и длинных предложений.** Живой текст позволяет себе фразу в
  три слова и период на сорок. Модель держится середины.
- **Самый длинный ровный участок.** Сколько предложений подряд идут в пределах
  ±25% друг от друга. Средние по тексту могут быть хорошими, а внутри сидеть
  двадцать одинаковых фраз.
- **Сущ./глаг.** (нужен pymorphy3). Чем номинальнее текст, тем сильнее
  канцелярит: действие превращается в «осуществление действия».

Пороги берутся из baseline.json — их считает calibrate.py по корпусу автора.
Без baseline.json используются грубые значения по умолчанию, и им верить не надо:
ритм у каждого автора свой, чужая норма тут бесполезна.

Использование:
  scan_rhythm.py <файл>           отчёт
  scan_rhythm.py <файл> --json    машиночитаемо

Зависимостей нет, Python 3.9+.
"""

import json
import re
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import rutext  # noqa: E402

BASELINE_PATH = Path(__file__).resolve().parent / 'baseline.json'

# Значения по умолчанию — ориентир на случай, если корпуса под рукой нет.
# «lo» означает «тревога, если метрика НИЖЕ», «hi» — «если ВЫШЕ».
DEFAULT_RHYTHM = {
    'sent_cv':      {'lo': 0.45},
    'para_cv':      {'lo': 0.35},
    'short_share':  {'lo': 0.08},
    'long_share':   {'lo': 0.05},
    'flat_run':     {'hi': 8},
    'noun_verb':    {'hi': 3.0},
    'listicle_share': {'hi': 0.30},
}

FLAT_TOLERANCE = 0.25  # ±25% — предложения считаются «той же длины»


def _load_thresholds():
    if not BASELINE_PATH.is_file():
        return DEFAULT_RHYTHM, False
    try:
        data = json.loads(BASELINE_PATH.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return DEFAULT_RHYTHM, False
    thresholds = data.get('rhythm')
    if not thresholds:
        return DEFAULT_RHYTHM, False
    return thresholds, True


def _cv(values):
    values = [v for v in values if v]
    if len(values) < 2:
        return 0.0
    mean = statistics.mean(values)
    if not mean:
        return 0.0
    return statistics.pstdev(values) / mean


def _longest_flat_run(lengths):
    """Максимальная цепочка подряд идущих предложений в пределах ±25%."""
    if not lengths:
        return 0
    best = run = 1
    anchor = lengths[0]
    for n in lengths[1:]:
        if anchor and abs(n - anchor) <= anchor * FLAT_TOLERANCE:
            run += 1
        else:
            run = 1
            anchor = n
        best = max(best, run)
    return best


_LIST_MARK = re.compile(r'^\s*(?:[-*+•]|\d+[.)])\s+\S')


def measure(raw_text):
    stripped = rutext.strip_markdown(raw_text)
    prose = rutext.prose_text(stripped)

    lengths = rutext.sentence_lengths(prose)
    n = len(lengths)

    blocks = rutext.prose_blocks(stripped)
    paragraphs = [p for p in re.split(r'\n\s*\n', blocks) if p.strip()]
    para_lengths = [len(rutext.sentences(p)) for p in paragraphs]

    lines = [ln for ln in stripped.split('\n') if ln.strip()]
    list_items = sum(1 for ln in lines if _LIST_MARK.match(ln))

    prose_words = rutext.word_count(prose)
    sentences_text = rutext.sentences(prose)

    stats = {
        'sentences': n,
        'prose_words': prose_words,
        'sent_mean': round(statistics.mean(lengths), 1) if lengths else 0.0,
        'sent_stdev': round(statistics.pstdev(lengths), 1) if n > 1 else 0.0,
        'sent_cv': round(_cv(lengths), 3),
        'sent_min': min(lengths) if lengths else 0,
        'sent_max': max(lengths) if lengths else 0,
        'short_share': round(sum(1 for x in lengths if x < 6) / n, 3) if n else 0.0,
        'long_share': round(sum(1 for x in lengths if x > 25) / n, 3) if n else 0.0,
        'flat_run': _longest_flat_run(lengths),
        'paragraphs': len(para_lengths),
        'para_cv': round(_cv(para_lengths), 3),
        'para_mean': round(statistics.mean(para_lengths), 1) if para_lengths else 0.0,
        'list_items': list_items,
        'listicle_share': round(list_items / len(lines), 3) if lines else 0.0,
        'dash_rate': round(prose.count('—') / prose_words * 100, 2) if prose_words else 0.0,
        'question_share': round(
            sum(1 for s in sentences_text if s.rstrip().endswith('?')) / n, 3) if n else 0.0,
    }

    nv = noun_verb_ratio(prose)
    if nv is not None:
        stats['noun_verb'] = round(nv, 2)
    return stats


_VERBAL = {'VERB', 'INFN', 'GRND', 'PRTF', 'PRTS'}


def noun_verb_ratio(text):
    """Отношение существительных к глагольным формам. None без pymorphy3.

    У номинального текста действие спрятано в существительное: не «проверяем»,
    а «осуществляется проверка». Отношение растёт — растёт канцелярит.
    """
    if not rutext.HAS_MORPH:
        return None
    nouns = verbs = 0
    for w in rutext.words(text):
        if not re.search(r'[а-яё]', w, re.IGNORECASE):
            continue
        tag = rutext.pos(w)
        if tag == 'NOUN':
            nouns += 1
        elif tag in _VERBAL:
            verbs += 1
    if not verbs:
        return float(nouns)
    return nouns / verbs


# Порядок вывода. Метрика показывается, даже если порога для неё нет: цифра
# полезна сама по себе, а молча пропадать она не должна.
DISPLAY = ['sent_cv', 'para_cv', 'short_share', 'long_share', 'flat_run',
           'noun_verb', 'listicle_share', 'dash_rate']


def check(stats, thresholds):
    """Сверяет метрики с порогами. Возвращает [(ключ, значение, тревога|None)]."""
    rows = []
    for key in DISPLAY:
        if key not in stats:
            continue
        value = stats[key]
        rule = thresholds.get(key) or {}
        alarm = None
        if 'lo' in rule and value < rule['lo']:
            alarm = f'ниже нормы (≥{rule["lo"]})'
        if 'hi' in rule and value > rule['hi']:
            alarm = f'выше нормы (≤{rule["hi"]})'
        rows.append((key, value, alarm, bool(rule)))
    return rows


LABELS = {
    'sent_cv': 'разброс длины предложений (CV)',
    'para_cv': 'разброс длины абзацев (CV)',
    'short_share': 'доля коротких фраз (<6 слов)',
    'long_share': 'доля длинных фраз (>25 слов)',
    'flat_run': 'самый длинный ровный участок, предл.',
    'noun_verb': 'существительных на глагол',
    'listicle_share': 'доля строк-пунктов',
    'dash_rate': 'тире на 100 слов прозы',
}


def report(path, stats, rows, calibrated, as_json):
    if as_json:
        print(json.dumps({'path': str(path), 'calibrated': calibrated, **stats},
                         ensure_ascii=False, indent=2))
        return

    print(f'📐 {path}')
    print(f'   предложений: {stats["sentences"]}, абзацев: {stats["paragraphs"]}, '
          f'слов прозы: {stats["prose_words"]}')
    print(f'   длина предложения: среднее {stats["sent_mean"]}, '
          f'разброс {stats["sent_stdev"]}, от {stats["sent_min"]} до {stats["sent_max"]}')
    if not calibrated:
        print('   ⚠ baseline.json не найден, пороги взяты по умолчанию — верить им не стоит')
    if not rutext.HAS_MORPH:
        print('   (pymorphy3 не установлен — сущ./глаг. не считается)')
    print()

    alarms = [r for r in rows if r[2]]
    for key, value, alarm, has_rule in rows:
        mark = '⚠' if alarm else ('✓' if has_rule else '·')
        note = f'  — {alarm}' if alarm else ('' if has_rule else '  — порога нет')
        print(f'   {mark} {LABELS.get(key, key):<38} {value}{note}')

    print()
    if not alarms:
        print('   Ритм в норме автора.')
    else:
        print(f'   Отклонений: {len(alarms)}. Это не приговор — смотри, '
              f'что именно выровнялось, и ломай там.')


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    as_json = '--json' in sys.argv
    if not args or '--help' in sys.argv or '-h' in sys.argv:
        print(__doc__)
        return
    path = Path(args[0]).expanduser()
    if not path.is_file():
        print(f'ошибка: не файл: {path}', file=sys.stderr)
        sys.exit(1)
    thresholds, calibrated = _load_thresholds()
    stats = measure(path.read_text(encoding='utf-8'))
    report(path, stats, check(stats, thresholds), calibrated, as_json)


if __name__ == '__main__':
    main()
