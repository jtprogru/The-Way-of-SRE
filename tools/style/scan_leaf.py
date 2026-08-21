#!/usr/bin/env python3
"""Механическая проверка листа против inventory/style-guide.md.

Зачем отдельный скрипт, если есть scan_tells.py из content-humanizer: тот меряет
общерусские AI-тэллы и ритм, а тут проверяются правила, которые есть только в
этом проекте — чеклист готовности листа (style-guide §5) и запрещённые паттерны
(§3.1–3.8). Ритм не дублируется: он берётся у scan_rhythm.py, пороги — из
baseline.json, откалиброванного по блогу автора.

Что скрипт НЕ умеет и что остаётся человеку: §3.9 (выдуманные источники и числа)
проверяется только открыванием ссылок, §2.1 (конкретный пример из практики)
отличить от синтетического регексом нельзя. Скрипт говорит «этого маркера нет»,
а не «текст плохой».

Использование:
  scan_leaf.py <файл.md> [...]     отчёт по листьям
  scan_leaf.py --all               все листья репозитория, ранжирование
  scan_leaf.py --all --full        то же, но с полным отчётом по каждому
  scan_leaf.py <файл.md> --json    машиночитаемо
  scan_leaf.py --all --ci          только детерминированные правила, ненулевой код возврата

Зависимостей нет, Python 3.9+. Модули ритма лежат рядом; переменная
HUMANIZER_SCRIPTS переключает их на установленный content-humanizer.
"""

import json
import os
import re
import statistics
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
DOCS = REPO / 'src' / 'content' / 'docs'
# Листья лежат вперемешку с hub-страницами L1 в каталоге ветви и отличаются
# расширением: лист — .md, hub — .mdx (он импортирует компоненты).
BRANCHES = ('culture', 'engineering', 'practices')

# Правила, которые проверяются однозначно и потому годятся в CI. Остальные
# (§4.3 личная оценка источников, §2.x пример и граница, ритм) требуют
# человека или суждения и в CI не блокируют.
CI_CODES = {'§3.1', '§3.2', '§3.4', '§3.5', '§3.6', '§3.7', '§3.8', '§3.10'}

HUMANIZER = Path(os.environ.get('HUMANIZER_SCRIPTS', HERE))

rutext = scan_rhythm = None
if HUMANIZER.is_dir():
    sys.path.insert(0, str(HUMANIZER))
    try:
        import rutext            # noqa: E402
        import scan_rhythm       # noqa: E402
    except ImportError:
        rutext = scan_rhythm = None

# Секции, которые списочны по контракту шаблона: их списочность не дефект.
STRUCT_SECTIONS = {'Что должен уметь', 'Материалы', 'Связанные листья'}

# ─────────────────────────────────────────────────────────────────────────────
# Паттерны
# ─────────────────────────────────────────────────────────────────────────────

# §1, чеклист: голос автора. Первое лицо единственного числа, не «мы».
VOICE = re.compile(
    r'\b(я|мне|меня|мной|мо(?:й|я|ё|е|и|его|ему|им|ей|их|ими|ей|ю)'
    r'|по моим наблюдениям|на моей памяти|у нас (?:на|в|была|было|были))\b',
    re.IGNORECASE)

# §2.2: явное мнение. Наблюдение засчитывается, директива — нет (см. §1).
OPINION = re.compile(
    r'(я вижу|я замечаю|я не доверяю|я считаю|я не уверен|мне не заш|не заш(ёл|ла|ло)'
    r'|по мо(?:ему|им) (?:опыту|наблюдени)|переоцен|недооцен|честно говоря'
    r'|я бы не |я регулярно вижу|мне не нрав|я не люблю)', re.IGNORECASE)

# §2.3: граница применимости.
BOUNDARY = re.compile(
    r'(не подходит|не работает|перестаёт работать|ломается|не годится|не масштабируется'
    r'|работает до |до \d+ (?:человек|сервис|команд)|начиная с \d+|за пределами'
    r'|обратная сторона|цена этого|не спасает|бесполезн)', re.IGNORECASE)

# §3.4: безличные конструкции вместо автора.
IMPERSONAL = re.compile(
    r'\b(должн[аыо]?\b|следует\b|необходимо\b|нужно\b|требуется\b|рекомендуется\b)',
    re.IGNORECASE)

# §3.7: кальки и переводческий канцелярит.
CALQUES = [
    (r'\bпри этом\b', 'при этом'),
    (r'\bтем самым\b', 'тем самым'),
    (r'\bв то время как\b', 'в то время как'),
    (r'\bмы можем сказать\b', 'мы можем сказать'),
    (r'\bследует отметить\b', 'следует отметить'),
    (r'\bважно (?:отметить|учитывать|понимать)\b', 'важно отметить/учитывать'),
    (r'\bявляет?ся\b', 'является'),
    # Только прилагательное («в данном случае»). Формы «данные / данных /
    # данными» — это существительное «data», в SRE-тексте оно законно.
    (r'\bданн(?:ый|ая|ое|ую|ого|ому|ом)\b', 'данный'),
    (r'\bосуществля', 'осуществлять'),
    (r'\bпозволя(?:ет|ют) ошибк', 'позволяет ошибку (калька allowed)'),
    (r'\bв рамках\b', 'в рамках'),
]
CALQUES = [(re.compile(rx, re.IGNORECASE), name) for rx, name in CALQUES]

# §3.1: шаблон «утверждение / антипаттерн / правильно».
BP_TEMPLATE = re.compile(r'(антипаттерн|правильно:)', re.IGNORECASE)
BULLET = re.compile(r'^\s*(?:[-*+]|\d+[.)])\s+\S')

# Тот же шаблон, переехавший из буллета в абзац: жирный тезис, следом расхожая
# фраза в кавычках, которую абзац опровергает. Слов «антипаттерн» и «правильно:»
# там уже нет, поэтому BP_TEMPLATE его не видит, а структура осталась той же —
# и выдаёт себя ровным ритмом (см. #136). Буллетов в Best practices нет у
# большинства листьев, так что без этой проверки §3.1 просто молчит.
BP_PARA_LEAD = re.compile(r'^\*\*.+?\*\*')
BP_PARA_QUOTE = re.compile(r'«[^»]{10,}»')

# §3.5: падежные гибриды латиница-кириллица через дефис.
HYBRID = re.compile(r'\b([A-Za-z][A-Za-z0-9.+]*)-([а-яё]{3,})|\b([а-яё]{3,})-([A-Za-z][A-Za-z0-9.+]*)')
# Латинская часть, для которой сложение легитимно. Источник — terminology.md,
# «Графика составных конструкций», раздел «Что разрешено»: аббревиатура или имя
# собственное плюс русское слово (аббревиатуры ловятся проверкой isupper), а
# также устоявшееся техническое сложение, где у английской части нет компактного
# русского эквивалента. Всё остальное — падежный гибрид и правится.
HYBRID_OK = {
    # устоявшиеся сложения
    'unit', 'e2e', 'shell', 'bash', 'backup', 'managed', 'stateful', 'stateless',
    'blameless', 'exit', 'fuzz', 'smoke', 'ad', 'it', 'sms', 'web',
    # имена собственные
    'telegram', 'go', 'java', 'python', 'rust', 'linux', 'unix', 'kubernetes',
    'k8s', 'docker', 'git', 'github', 'gitlab', 'slack', 'grafana', 'prometheus',
    'jira', 'confluence', 'terraform', 'ansible', 'vault', 'kafka', 'redis',
    'postgres', 'postgresql', 'nginx', 'argo', 'flux', 'yahoo', 'google',
    'aws', 'gcp', 'azure', 'oauth', 'oidc', 'jwt',
}

# §3.6: в «Инструментах» должна быть позиция-наблюдение, а не каталог.
POSITION = re.compile(
    r'(чаще выбирают|чаще берут|берут команды|по моим наблюдениям|я вижу|реже|редко'
    r'|имеет смысл, когда|стандарт для|стандарт в|избыточ|не стоит брать|дефолт'
    r'|первый выбор|если у вас|если команда)', re.IGNORECASE)

# §4.3: личная оценка источника в «Материалах».
MATERIAL_OPINION = re.compile(
    r'(читал|перечитыв|рекомендую|советую|не заш|выкинул|бросил|пробовал|смотрел'
    r'|слушал|обязательно|мо(?:я|й) настольн|держу под рукой|возвращаюсь|по мо(?:ему|им)'
    r'|лучш(?:ая|ий|ее) из|устарел|скучн)', re.IGNORECASE)


# ─────────────────────────────────────────────────────────────────────────────
# Разбор листа
# ─────────────────────────────────────────────────────────────────────────────

def split_leaf(raw):
    """Возвращает (frontmatter_dict, lead_строки, {секция: строки})."""
    fm = {}
    body = raw
    m = re.match(r'^---\n(.*?)\n---\n', raw, re.S)
    if m:
        block = m.group(1)
        body = raw[m.end():]
        for key in ('title', 'description', 'sfia', 'status'):
            km = re.search(rf'^{key}:\s*(.*(?:\n[ \t]+.*)*)$', block, re.M)
            if km:
                value = ' '.join(l.strip() for l in km.group(1).split('\n')).strip()
                fm[key] = (value.strip('\'"'), km.group(1).count('\n') + 1)

    sections, current, lead = {}, None, []
    for line in body.split('\n'):
        hm = re.match(r'^##\s+(.*?)\s*$', line)
        if hm:
            current = hm.group(1)
            sections.setdefault(current, [])
            continue
        (sections[current] if current else lead).append(line)
    return fm, lead, sections


def text_of(lines):
    joined = '\n'.join(lines)
    return rutext.strip_markdown(joined) if rutext else joined


def prose_of(lines):
    stripped = text_of(lines)
    if not rutext:
        return stripped
    return rutext.prose_text(stripped)


def lex_of(lines):
    """Текст для лексических проверок: всё, что автор написал словами, кроме
    заголовков. Буллеты нужны — голос и мнение живут в них. Заголовки мешают:
    «Что должен уметь» из шаблона иначе считается безличным «должен»."""
    stripped = text_of(lines)
    if not rutext:
        return stripped
    return '\n'.join(l for l in stripped.split('\n')
                     if rutext.classify(l) != rutext.HEADING)


def bullets_of(lines):
    return [l for l in lines if BULLET.match(l)]


def paragraphs_of(lines):
    """Абзацы секции: блоки непустых строк, кроме буллетов и подзаголовков."""
    out, buf = [], []
    for line in lines:
        if not line.strip():
            if buf:
                out.append(' '.join(buf))
                buf = []
            continue
        if BULLET.match(line) or line.startswith('#'):
            continue
        buf.append(line.strip())
    if buf:
        out.append(' '.join(buf))
    return out


def subsection(lines, title):
    """Строки подсекции `### <title>` внутри секции."""
    out, inside = [], False
    for line in lines:
        m = re.match(r'^###\s+(.*?)\s*$', line)
        if m:
            inside = m.group(1).lower().startswith(title.lower())
            continue
        if inside:
            out.append(line)
    return out


def first_paragraph(lead):
    buf = []
    for line in text_of(lead).split('\n'):
        if line.strip():
            buf.append(line.strip())
        elif buf:
            break
    return ' '.join(buf)


def words_set(text):
    return {w.lower() for w in re.findall(r'[а-яёa-z]{4,}', text, re.IGNORECASE)}


# ─────────────────────────────────────────────────────────────────────────────
# Проверки
# ─────────────────────────────────────────────────────────────────────────────

def check(path, baseline):
    raw = path.read_text(encoding='utf-8')
    fm, lead, sections = split_leaf(raw)
    findings = []

    def add(level, code, msg):
        findings.append({'level': level, 'code': code, 'msg': msg})

    # Лексические проверки идут по всему тексту, включая буллеты: голос автора
    # живёт и в оценке источника, и в пункте best practice. Ритм — отдельно, он
    # считается только по прозе, иначе списки съедают разброс.
    whole_prose = lex_of(raw.split('\n'))

    # §5: голос автора минимум в трёх местах
    voice_hits = VOICE.findall(whole_prose)
    zones = sum(1 for lines in [lead] + list(sections.values())
                if VOICE.search(lex_of(lines)))
    if len(voice_hits) < 3 or zones < 2:
        add('!', 'голос', f'первое лицо: {len(voice_hits)} вхождений в {zones} секциях '
                          f'(нужно ≥3 в ≥2 секциях, §1)')

    # §2.2: явное мнение
    if not OPINION.search(whole_prose):
        add('!', 'мнение', 'нет маркеров явного мнения-наблюдения (§2.2)')

    # §2.3: граница применимости
    if not BOUNDARY.search(whole_prose):
        add('~', 'граница', 'не нашёл границы применимости или контр-примера (§2.3)')

    # §3.4: безличные конструкции
    impersonal = IMPERSONAL.findall(whole_prose)
    if len(impersonal) > 3:
        add('!', '§3.4', f'безличных «должен/следует/нужно»: {len(impersonal)} (лимит 3)')

    # §3.10: метаданные листа приходят из данных, а не из текста. Диапазон
    # уровней и словарь статусов проверяет схема коллекции при сборке
    # (src/content.config.ts) — здесь только наличие полей и отсутствие
    # рукописного блока, который эти поля когда-то заменял.
    if re.search(r':::\w+\[[^\]]*Метаданные', raw):
        add('!', '§3.10', 'рукописный блок «Метаданные листа»: ветвь, путь и '
                          'приоритет рендерятся из roadmap.ts, дубль в тексте расходится')
    for key in ('sfia', 'status'):
        if key not in fm:
            add('!', '§3.10', f'нет `{key}` во фронт-маттере (§3.10)')

    # §3.8: description
    if 'description' in fm:
        desc, desc_lines = fm['description']
        if len(desc) > 200:
            add('!', '§3.8', f'description {len(desc)} символов (лимит 200)')
        if desc_lines > 1:
            add('!', '§3.8', f'description в {desc_lines} строк — нужна одна фраза')

        # §3.2: лид дублирует description
        lead_p = first_paragraph(lead)
        if lead_p:
            a, b = words_set(desc), words_set(lead_p[:len(desc) + 80])
            overlap = len(a & b) / len(a) if a else 0
            if overlap > 0.5:
                add('!', '§3.2', f'первый абзац повторяет description на {overlap:.0%} слов')

    # §3.1: шаблон в Best practices
    bp = sections.get('Best practices', [])
    bp_bullets = bullets_of(bp)
    templated = [b for b in bp_bullets if BP_TEMPLATE.search(b)]
    if bp_bullets and len(templated) / len(bp_bullets) > 0.5:
        add('!', '§3.1', f'«утверждение/антипаттерн/правильно»: {len(templated)} из '
                         f'{len(bp_bullets)} bullets (лимит половина)')

    # §3.1 в прозе: тот же шаблон без слов-маркеров. Наблюдение, не нарушение —
    # жирный тезис с цитатой сам по себе законен, вопрос в его доле.
    bp_paras = paragraphs_of(bp)
    templated_paras = [p for p in bp_paras
                       if BP_PARA_LEAD.match(p) and BP_PARA_QUOTE.search(p)]
    if bp_paras and len(templated_paras) / len(bp_paras) > 0.5:
        add('~', '§3.1', f'прозаический шаблон «жирный тезис + расхожая фраза в кавычках»: '
                         f'{len(templated_paras)} из {len(bp_paras)} абзацев (лимит половина)')

    # §3.5: падежные гибриды
    hybrids = []
    for m in HYBRID.finditer(text_of(raw.split('\n'))):
        latin = (m.group(1) or m.group(4) or '')
        if latin.isupper() or latin.lower() in HYBRID_OK:
            continue
        hybrids.append(m.group(0))
    if hybrids:
        uniq = sorted(set(hybrids))
        add('!', '§3.5', f'гибриды через дефис ({len(hybrids)}): ' + ', '.join(uniq[:6]))

    # §3.6: «Инструменты» без позиции автора = каталог
    tools = subsection(sections.get('Материалы', []), 'Инструменты')
    if tools:
        if not POSITION.search(lex_of(tools)):
            add('!', '§3.6', 'в «Инструментах» нет позиции-наблюдения — '
                             'что чаще выбирают на практике и почему')

    # §3.7: кальки
    calques = []
    for rx, name in CALQUES:
        n = len(rx.findall(whole_prose))
        if n:
            calques.append(f'{name}×{n}')
    if calques:
        level = '!' if len(calques) > 2 else '~'
        add(level, '§3.7', 'кальки и канцелярит: ' + ', '.join(calques))

    # §4.3: личная оценка в «Материалах»
    mat_bullets = bullets_of(sections.get('Материалы', []))
    if mat_bullets:
        rated = [b for b in mat_bullets if MATERIAL_OPINION.search(b)]
        share = len(rated) / len(mat_bullets)
        if share < 0.5:
            # Ниже четверти — аннотированная библиография, а не оценка; между
            # четвертью и половиной правило недотянуто, но голос уже есть.
            add('!' if share < 0.25 else '~', '§4.3',
                f'личная оценка у {len(rated)} из {len(mat_bullets)} '
                f'источников ({share:.0%}, нужно ≥50%)')

    # Ритм: считаем по прозаической зоне, структурные секции не мешают
    rhythm = {}
    if scan_rhythm:
        prose_zone = list(lead)
        for name, lines in sections.items():
            if name not in STRUCT_SECTIONS:
                # Заголовок возвращается в поток: сам он в метрики не попадает
                # (rutext выбрасывает его как непрозаическую строку), но именно
                # по нему рвётся цепочка ровного ритма. Без него конец одной
                # секции и начало следующей выглядят соседними фразами.
                prose_zone.append(f'## {name}')
                prose_zone += lines
        rhythm = scan_rhythm.measure('\n'.join(prose_zone))
        lo_cv = baseline.get('rhythm', {}).get('sent_cv', {}).get('lo')
        if lo_cv and rhythm.get('sent_cv', 0) < lo_cv:
            add('!', 'ритм', f'разброс длин фраз {rhythm["sent_cv"]:.3f} < {lo_cv} '
                             f'(норма по блогу) — текст ровный')
        hi_flat = baseline.get('rhythm', {}).get('flat_run', {}).get('hi')
        if hi_flat and rhythm.get('flat_run', 0) > hi_flat:
            add('~', 'ритм', f'{rhythm["flat_run"]} фраз подряд одной длины (норма ≤{hi_flat:.0f})')
        hi_li = baseline.get('rhythm', {}).get('listicle_share', {}).get('hi')
        if hi_li and rhythm.get('listicle_share', 0) > hi_li:
            add('!', 'ритм', f'списочность прозаических секций {rhythm["listicle_share"]:.2f} '
                             f'> {hi_li:.2f} — лист рассыпан в буллеты')

    return {'path': path, 'findings': findings, 'rhythm': rhythm,
            'voice': len(voice_hits), 'words': len(re.findall(r'\S+', whole_prose))}


def load_baseline():
    p = HUMANIZER / 'baseline.json'
    if p.is_file():
        return json.loads(p.read_text(encoding='utf-8'))
    return {}


def report(res):
    rel = res['path'].relative_to(DOCS) if DOCS in res['path'].parents else res['path']
    hard = sum(1 for f in res['findings'] if f['level'] == '!')
    soft = len(res['findings']) - hard
    print(f"\n{rel}  — нарушений {hard}, наблюдений {soft}")
    if not res['findings']:
        print('  чисто по механическим правилам (§3.9 и §2.1 всё равно глазами)')
    for f in res['findings']:
        print(f"  {f['level']} {f['code']:<8} {f['msg']}")
    r = res['rhythm']
    if r:
        print(f"  · ритм прозы: sent_cv {r.get('sent_cv')}, para_cv {r.get('para_cv')}, "
              f"коротких {r.get('short_share')}, длинных {r.get('long_share')}, "
              f"списочность {r.get('listicle_share')}")


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    flags = {a for a in argv if a.startswith('--')}
    baseline = load_baseline()

    if '--all' in flags:
        paths = sorted(p for b in BRANCHES for p in (DOCS / b).glob('*.md'))
    else:
        paths = [Path(a).resolve() for a in args]
    if not paths:
        print(__doc__)
        return 1

    results = [check(p, baseline) for p in paths]

    if '--ci' in flags:
        # Уровень '~' означает «решает человек» — такие находки в CI не блокируют,
        # даже если код правила детерминированный.
        hits = [(r, f) for r in results for f in r['findings']
                if f['code'] in CI_CODES and f['level'] == '!']
        if not hits:
            print(f'стиль-чек: {len(results)} листьев, детерминированные правила чисты')
            return 0
        print(f'стиль-чек: {len(hits)} нарушений в {len(results)} листьях\n')
        for r, f in hits:
            rel = r['path'].relative_to(DOCS) if DOCS in r['path'].parents else r['path']
            print(f"  {rel}: {f['code']} — {f['msg']}")
        print('\nПравила — в inventory/style-guide.md. Здесь проверяется только то, '
              'что проверяется однозначно; §4.3, §2.1, §2.3 и ритм остаются человеку.')
        return 1

    if '--json' in flags:
        print(json.dumps([{**r, 'path': str(r['path'])} for r in results],
                         ensure_ascii=False, indent=2))
        return 0

    if '--all' in flags and '--full' not in flags:
        ranked = sorted(results, key=lambda r: (
            -sum(1 for f in r['findings'] if f['level'] == '!'), -len(r['findings'])))
        print(f"листьев: {len(results)}")
        cvs = [r['rhythm'].get('sent_cv') for r in results if r['rhythm']]
        if cvs:
            print(f"медиана sent_cv прозы: {statistics.median(cvs):.3f} "
                  f"(норма по блогу ≥ {baseline.get('rhythm', {}).get('sent_cv', {}).get('lo')})")
        by_code = {}
        for r in results:
            for f in r['findings']:
                by_code.setdefault(f['code'], 0)
                by_code[f['code']] += 1
        print('\nсводка по правилам:')
        for code, n in sorted(by_code.items(), key=lambda x: -x[1]):
            print(f"  {code:<8} {n} листьев")
        print('\nхудшие:')
        for r in ranked[:15]:
            hard = sum(1 for f in r['findings'] if f['level'] == '!')
            codes = ' '.join(f['code'] for f in r['findings'] if f['level'] == '!')
            print(f"  {hard:>2}!  {r['path'].relative_to(DOCS)}  [{codes}]")
        return 0

    for r in results:
        report(r)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
