---
title: Calibration Meeting
description: Регулярная встреча руководителей для согласования общей интерпретации career ladder — cadence, attendees, evidence, output
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Performance Management / Calibration Meeting
- **SFIA-уровни:** 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«У нас в team A это уже senior, у нас в team B он бы тянул на mid» — реплика, которую я регулярно слышу в кулуарах между руководителями двух команд из одного департамента. Calibration meeting — это **регулярная встреча руководителей**, на которой они вместе ревьюят свои recommended levels для инженеров и согласовывают общую интерпретацию ladder. Без неё каждый руководитель читает [career ladder](/The-Way-of-SRE/glossary/#career-ladder) по-своему; через полгода team A и team B имеют несовместимые «L5» с разными expectations; promotion-decisions становятся unfair; salary bands начинают расходиться. Узкая практика внутри L1 `Performance Management`; закрывает gap между [Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/) как документом и реальностью применения.

Сразу границы: [One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/) — feedback continuous между manager и IC; calibration — periodic alignment **между manager'ами**. [Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/) — vocabulary; calibration — ритуал, в котором vocabulary тестируется на конкретных людях. Этот лист — про **calibration mechanics** (cadence, attendees, evidence, output); полный performance review cycle с rating и compensation discussion — шире, отдельная тема.

## Что должен уметь

Главный навык на уровне L5 — приходить на calibration с **evidence**, а не с впечатлениями. «Я считаю, что Лёша на L5» — самое худшее, что можно сказать на calibration. «Лёша закрыл L5 expectations по таким-то пунктам, артефакты — ADR X, инцидент Y, cross-team initiative Z; gap по пункту "mentor at least N junior engineers" — пока 1 mentee» — это calibration-конверсация. По моим наблюдениям, разница между calibration, который работает, и calibration, который превращается в спор интуиций, — именно в том, что участники приходят с заранее подготовленными evidence references.

**L5**
- Готовится к calibration с evidence per engineer: список expectations ladder, конкретные artifacts (ADR, projects, incidents, mentoring) под каждый пункт, явные gap'ы.
- Признаёт собственные biases: recency (последний месяц вытесняет прошлый год), halo effect (один сильный проект перекрывает остальное), affinity (свои в команде кажутся сильнее). Калибрует свою позицию против coллег.
- Различает «согласен» и «не возражаю»: на calibration ритуал — собрать sound disagreement, не consensus performative. Если все «не возражают», calibration не работает.

**L6+**
- Facilitates calibration meeting: agenda, time-box per engineer (типично 5–10 минут), правила обсуждения (evidence-based, not vibes-based), формат фиксации решений и rationale.
- Поддерживает calibration cycle на org-level: cadence (полугодие — норма для зрелых org, квартал — для растущих), attendees, escalation path для спорных случаев, integration с promotion / rating decisions.
- Замечает и корректирует drift между ladder-документом и реальной практикой: если на calibration три квартала подряд возникает «по этому пункту мы все читаем по-разному» — сигнал обновлять ladder, а не интерпретировать в каждом calibration заново.
- Защищает calibration от деградации в performative theater: формальная встреча без real disagreement — хуже, чем её отсутствие (создаёт иллюзию fairness).

## Материалы

### Книги

- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). Главы про performance review и calibration с позиции engineering manager — практический guide. Если читать одну главу — главу «Performance Reviews».
- Lara Hogan — **Resilient Management** (A Book Apart, 2019). Глава про equitable feedback и calibration practices без bias — короткий применимый источник.
- Will Larson — **An Elegant Puzzle: Systems of Engineering Management** (Stripe Press, 2019). Раздел про performance management как system, не как individual decisions; полезен как mental model перед дизайном calibration cycle на org-level.

### Статьи и фреймворки

- Michael Lopp (Rands) — **[On Performance Reviews](https://randsinrepose.com/archives/the-deliberate-self-evaluation/)** и связанные посты на randsinrepose.com. Серия про performance management из позиции engineering leader; calibration упоминается как side-effect зрелого review process.
- **[Progression.fyi](https://progression.fyi/)**. 75+ публичных career ladders разных компаний. По моим наблюдениям, перед дизайном calibration полезно посмотреть 5–10 ladder и заметить разницу в формулировке expectations — это лучшая подготовка к разговору «у нас здесь читается по-разному».
- **[GitLab Engineering Handbook — Performance Indicators](https://handbook.gitlab.com/handbook/engineering/performance-indicators/)** и связанные страницы про calibration в публичном handbook. Хороший пример полностью описанного процесса для распределённой компании; меньшие org могут адаптировать примерно треть.
- **[Spotify Engineering Steps](https://github.com/Spotify/engineering-steps)** (открытая публикация). Один из публичных примеров ladder, к которому шёл регулярный calibration — полезен как референс структуры.

### Инструменты

- **Spreadsheet или structured doc** — самый простой формат: таблица «инженер × текущий уровень × recommended × evidence references × calibration notes». По моим наблюдениям, разница между «работающим» и «бутафорным» calibration — в том, заполнена ли колонка evidence до встречи или impromptu во время.
- **Lattice, 15Five, Culture Amp** — коммерческие performance management платформы со встроенным calibration view. Полезны на масштабе 100+ инженеров, где spreadsheet становится узким местом; до этого порога — overengineering.
- **Anonymous peer feedback inputs** (через формы или платформу) — опционально, как evidence для calibration. По моим наблюдениям, попытка сделать peer feedback обязательным input для calibration в большинстве команд деградирует в performative «всё хорошо» или поляризованные «у меня с ним конфликт». Полезно для validation, не как primary source.

## Best practices

Самый частый сценарий неудачного calibration, который я наблюдаю: руководители собираются, поочерёдно зачитывают своих инженеров, никто никого не оспаривает, через 90 минут все расходятся «откалиброванные». Через полгода выясняется, что team A и team B по-прежнему имеют разные «L5», salary bands расходятся, при cross-team transfer инженер падает в level — никто не понимает почему. Calibration без real disagreement — это не calibration, это галочка.

**Короткие правила:**

- **Evidence перед calibration, не во время.** Каждый руководитель приходит с заполненной evidence-таблицей per engineer (expectations × artifacts × gaps). Без этого calibration вырождается в impressions, intuitions и halo effects. «Я считаю, что он на L5» — антипаттерн; «вот expectations L5, вот closed через X / Y / Z, вот gap по N» — правильно.
- **Cadence: полугодие — норма, квартал — для растущих org.** Год — слишком редко (drift накапливается, calibration становится тяжёлой пересборкой). Месяц — слишком часто (нет успевает накопиться evidence). По моим наблюдениям, для зрелых команд 30–80 инженеров полугодовая cadence — sweet spot.
- **Disagreement — главный output, не consensus.** Calibration, где никто никого не оспаривает — performative. Цель — выявить, где руководители читают ladder по-разному, и договориться о shared interpretation; либо обновить ladder, если различие структурное.

Подробнее:

**Attendees: все engineering manager'ы одного scope + один senior facilitator.** Optimal состав — все руководители одного org-уровня (например, все team lead'ы одного департамента) + senior facilitator (director / staff IC, не сам руководитель в обсуждаемом scope). Слишком узкий состав (manager + его боcc) — это не calibration, это 1-on-1 manager-review. Слишком широкий (вся org на 50 manager'ов) — calibration деградирует в performative заседание. Я регулярно вижу sweet spot 4–8 manager'ов на одной встрече.

**Time-box per engineer: 5–10 минут.** Calibration на 30 инженеров с 30 минутами на каждого — это не calibration, это deathmarch на 15 часов. 5–10 минут заставляют руководителей готовиться заранее: evidence сжато, gap явный, рекомендация чёткая. Если по конкретному инженеру нужно больше — это сигнал, что либо calibration этого инженера готовился плохо, либо это спорный promotion-кейс, который заслуживает отдельной встречи. Calibration не место для глубокого разбора одного человека.

**Фиксировать решения и rationale, а не только итог.** «Лёша оставлен на L4» — это decision без rationale; через полгода никто не помнит, почему. Calibration notes сохраняют **что обсуждалось, какое evidence приводилось, что стало решающим фактором** — versioned, accessible для следующей calibration. Через 2–3 цикла эта документация — главный артефакт zrelosti performance management процесса; и единственный способ сделать promotion decisions defensible перед всем engineering org.

**Drift между ladder и реальностью — сигнал обновлять ladder, не каждый calibration интерпретировать заново.** Если на трёх calibration подряд один и тот же пункт ladder читается всеми по-разному — проблема не в калибровке, а в формулировке ladder. Норма: после calibration — короткий retrospective на 30 минут, что в ladder требует уточнения. Без retrospective ladder остаётся «как у нас написано», calibration каждый раз переделывает интерпретацию с нуля. Это самая тонкая дисциплина и самая ценная: она превращает calibration в **feedback loop для ladder**, а не в одноразовый компромисс на конкретный цикл.

**Anti-pattern: calibration как rubber stamp для уже принятых promotion decisions.** Руководитель приходит с «я уже договорился с N о promotion на L5, нужна формальная calibration». Calibration превращается в театр. Норма: calibration — **до** финального решения, не после; результаты calibration входят в decision, не наоборот. Если promotion уже обещан кому-то до calibration — это перевёрнутый процесс с предсказуемыми последствиями (calibration без weight, ladder без vocabulary, manager promises без backing).

## Связанные листья

- **[Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/)** — vocabulary, которое calibration применяет. Без явной ladder calibration сводится к спорам интуиций; без calibration ladder остаётся документом-альбатросом, который не используется между промоушнами.
- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — continuous feedback, которое подпитывает evidence для calibration. «No surprises rule» в review — побочный эффект того, что 1:1 регулярно обсуждают прогресс по ladder; calibration без 1:1-history превращается в impressions.
- **[Personal Growth Plan](/The-Way-of-SRE/leaves/practices/personal-growth-plan/)** — personal-level артефакт, который mentee приносит на 1:1; collectively эти планы — input для calibration (что инженеры сами считают своими target levels).
- **[Mentoring as Practice](/The-Way-of-SRE/leaves/practices/mentoring-as-practice/)** — calibration оценивает evidence; mentoring — один из transfer mechanisms, через который evidence накапливается (особенно «mentor at least N» как expected behaviour L5+).
- **[Stakeholder Management](/The-Way-of-SRE/leaves/culture/stakeholder-management/)** — критерий L5+ в большинстве ladder; calibration regularly возвращается к «есть ли cross-org influence как evidence».

## Открытые вопросы

- **Performance Review Cycle (full)** *(TBD)* — calibration — только часть полного review cycle. Полный cycle включает self-assessment, manager review, calibration, rating decision, compensation discussion, delivery feedback. Заслуживает отдельного листа; этот покрывает только calibration mechanics.
- **Compensation discussion** *(TBD)* — связь calibration → level → salary bands. HR-territory, отдельная подтема со своими правилами (transparency vs confidentiality, market data, geographic differentiation).
- **Promotion case formats** *(TBD)* — детальная схема one-pager перед calibration: evidence references, peer endorsements, manager rationale. Упоминается в [Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/), заслуживает отдельного листа.
- **Calibration на distributed org** — distributed manager'ы, async culture, разные timezone — calibration meeting на 90 минут становится тяжёлым ритуалом. GitLab handbook предлагает async calibration как альтернативу; я не пробовал, не могу оценить trade-offs. Расскажите через PR, если работает.
- **Calibration для специалистов уровня staff/principal** — обычная calibration не справляется (выборка 1–2 человека, евидение качественно другое). Я регулярно вижу, что staff+ calibration делается отдельным процессом с разными attendees, но не видел публичных описаний.
