---
title: Stakeholder Management
description: Работа с не-инженерными стейкхолдерами SRE — про перевод и числа, не про «обещали ничего не ломать»
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Relationship Management / Stakeholder Management
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Я просто хочу делать SRE-работу, не хочу заниматься политикой» — фраза, которую я слышу от senior SRE регулярно, и которая обычно означает, что в следующем квартале команда упрётся в нехватку headcount, отсутствие executive buy-in на reliability-инвестиции, или freeze, который никто наверху не принял всерьёз. Stakeholder Management — это не «политика». Это **работа с не-инженерными людьми, от которых зависят решения, влияющие на reliability**: product management, executives, finance, legal, customer success, sales. Граница с [Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/) явная: тот лист — engineering ↔ engineering (joint rituals, embedded SRE, shared accountability за код); этот — engineering ↔ non-engineering (объяснить error budget product manager'у, обосновать $200k cost-cut перед finance, договориться с legal про public postmortem).

Главный навык внутри этой компетенции — **перевод**: SLO violation → $X revenue impact, toil ratio 60% → 3 engineer-weeks opportunity cost ежемесячно, reliability investment → 18-month payback через avoided incidents. Без перевода SRE-команда остаётся «теми, кто говорит на непонятном языке», и её приоритеты не выигрывают в planning. С переводом — становится понятным голосом, и reliability получает sustainable инвестиции. Я считаю, что это самый недооценённый skill senior SRE: он выглядит как «soft skill», но без него technical excellence не масштабируется.

## Что должен уметь

Главный навык на уровне L5 — **переводить технические показатели в business-релевантные числа** так, чтобы стейкхолдер мог принять решение. Не «у нас burn rate 14×» (стейкхолдер не знает, что это), а «текущее ухудшение означает потерю SLO к концу квартала, что эквивалентно ~$200k revenue impact если запустим feature freeze — или ~$50k если catch up на следующем спринте». Не «toil 70%», а «команда тратит 28 engineer-weeks в год на ручную работу, которую можно автоматизировать за 4». Я регулярно вижу senior SRE, которые приходят к exec с техническими цифрами и удивляются, что решение не принимается — потому что **цифры нерелевантны** для уровня этого стейкхолдера.

- **L4** — Идентифицирует стейкхолдеров для своего сервиса / проекта: product manager, exec sponsor, finance owner, customer success contact. Знает, кто принимает решения о приоритетах, бюджете, доступе.
- **L4** — Переводит технические показатели своего сервиса в business-язык: SLO → customer impact, downtime → revenue impact, toil → opportunity cost. Не использует SRE-жаргон без объяснения.
- **L4** — Готовит short status update для product / exec sync: 2-3 цифры + что они означают + что нужно решить. Не презентация на 20 слайдов; не «всё хорошо / всё плохо» без контекста.
- **L5** — Проектирует stakeholder map для своей SRE-функции: кто, какая роль, какая cadence коммуникации, какие триггеры эскалации. Не «у меня в голове»; явный документ, который можно показать новому инженеру.
- **L5** — Ведёт regular cadence с ключевыми стейкхолдерами: weekly с product, monthly с exec, quarterly с board (где применимо). Каждая встреча имеет повестку, decision points, follow-up.
- **L5** — Говорит «нет» с данными: «эта фича требует X недель reliability work перед запуском; иначе вероятность SEV1 в первом квартале — N%, исторический cost — $Y». Без данных «нет» — это блок; с данными — это negotiation.
- **L5** — Аргументирует reliability-инвестиции (headcount, tooling, infrastructure) в business-логике: payback period, avoided incidents × cost, customer retention impact. Не «нам нужно больше».
- **L6+** — Управляет SRE-функцией как product перед exec stakeholders: roadmap, OKRs, budget, headcount planning, success metrics. Ведёт quarterly business review SRE-функции.
- **L6+** — Ведёт переговоры по reliability с C-level и board: SLA коммитменты для key accounts, regulatory-driven reliability investments, M&A integration reliability assessment, public outage communications strategy.

## Материалы

### Книги

- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/engaging-with-stakeholders/)** (O'Reilly, 2018), глава 32 «Engaging with Stakeholders». Главный SRE-специфичный источник: customer SLOs, internal SLOs, infrastructure SLOs, как stakeholder map определяет, какие SLOs обсуждаются с кем. Лучшая стартовая глава, если читаете один источник по теме.
- Camille Fournier — **[The Manager's Path](https://www.oreilly.com/library/view/the-managers-path/9781491973882/)** (O'Reilly, 2017), главы про tech lead и engineering manager. Не SRE-специфично, но раскрывает skill коммуникации с non-engineering stakeholders на уровне tech lead — что для senior SRE применимо напрямую.
- Will Larson — **[Staff Engineer](https://staffeng.com/book)** (2021). Главы «Writing an engineering strategy» и «Staying technical»: как senior IC (без manager-ladder) влияет на decisions через writing и evidence. Senior SRE, который не хочет в management, должен читать.

### Статьи и доклады

- Charity Majors — **[Engineers and Their Many Hats](https://charity.wtf/2017/01/24/some-management-thoughts/)** (charity.wtf). Не про stakeholder management напрямую, но про **на каких языках говорить с каждой ролью** в org. Главное: разные стейкхолдеры решают разные вопросы, одно и то же сообщение работает по-разному.
- Larson, Daniel & Donskoi — **[Engineering Strategy](https://lethain.com/eng-strategies/)** (lethain.com). Series статей о том, как формулировать инженерную стратегию для exec stakeholders. SRE-функция — частный случай.
- Mathias Lafeldt — **[Communicating SRE: Influence Without Authority](https://medium.com/@mlafeldt/communicating-sre-influence-without-authority-3d3dbeb31e7b)**. Один из немногих публичных материалов на тему conscious SRE stakeholder management. Полезен как ориентир направления, не как методичка.

### Инструменты

- **Stakeholder Map / RACI matrix** — однополосная таблица: стейкхолдер × responsibility (для каких decisions Responsible / Accountable / Consulted / Informed). По моим наблюдениям, это самый дешёвый и при этом самый ценный артефакт практики. Pin'нится в команде; обновляется при изменении ролей или org-структуры.
- **Quarterly Business Review (QBR) template** — структурированный документ для quarterly sync с exec: KPIs (SLO, MTTR, toil ratio, deploy frequency), что улучшилось, что ухудшилось, ключевые риски, requests (headcount, budget, decisions). Не презентация — written narrative с цифрами. Amazon-style 6-pager хорошо подходит как baseline формат.
- **Monthly status update template** — короткий документ для product/exec sync (1 страница): что произошло, что важно, что нужно решить. Cadence: monthly для каждого ключевого стейкхолдера. Без template'а status update'ы становятся ad-hoc и теряют сигнал.
- **Translation cheat sheet (internal)** — короткий внутренний документ: SRE-метрика ↔ business-перевод для типовых ситуаций. SLO violation → $X (если revenue per minute известен), toil ratio → engineer-weeks/quarter, MTTR ratio → customer hours-of-impact. Полезен junior SRE'ам и для быстрой подготовки status update'ов.

## Best practices

Главный публичный кейс, который полезно прочитать рядом с книгой — **Google SRE evolution от «техническая команда» к «business-engaged функция»**, описанный в SRE Workbook гл. 32. На раннем этапе Google SRE общался с product engineering — это покрывалось Dev Team Partnership. По мере роста (десятки сервисов, многомиллионная инфраструктура, regulatory exposure) появилась явная необходимость engagement с не-инженерными stakeholder'ами: VP Engineering, Finance (cost reviews), Legal (incident response), regulatory bodies. SRE Workbook кодифицирует эту эволюцию через концепцию «multiple SLO audiences» — customer SLOs (для customer success / sales), internal SLOs (для product), infrastructure SLOs (для platform consumers). Не «один SLO для всех», а **разные представления одних и тех же данных для разных стейкхолдеров**. Это и есть Stakeholder Management в SRE-контексте.

**Короткие правила:**

- **Stakeholder map — явный документ, не «в голове».** Антипаттерн: каждый senior SRE имеет свой набор контактов, junior'ы не знают, к кому идти. Через год при ротации команды knowledge теряется. Правильно — RACI matrix как однополосный документ, поддерживается в актуальном состоянии, обновляется при org-изменениях.
- **Translation — обязательный навык, не optional.** Антипаттерн: «я инженер, я говорю на технических метриках, пусть exec разбирается». В planning meetings выигрывают те, кто говорит на business-языке. Правильно — каждая метрика, которую SRE приносит к non-engineering stakeholder, переведена в его язык до встречи, не «по запросу».
- **«Нет» без данных — это блок; «нет» с данными — это negotiation.** Антипаттерн: «эту фичу нельзя запустить, она ломает reliability». Стейкхолдер слышит «SRE мешает работать». Правильно — «эту фичу можно запустить через 4 недели reliability work; если запускаем сейчас, исторически в N% случаев будет SEV1 в первом квартале, среднее cost — $X. Какой вариант выбираем?». Это переводит конфликт в trade-off discussion.

Подробнее:

**Translation — самый недооценённый skill senior SRE.** Я регулярно вижу senior инженеров с глубокой технической экспертизой, чьё влияние в org застряло, потому что они «не любят политику». Реальная проблема обычно не в политике — а в том, что они приходят к stakeholder с техническими цифрами, которые тот не может конвертировать в решение. SLO 99.9% не означает ничего для finance director'а; «$50k expected revenue loss в следующем квартале при текущем burn rate» означает решение. Скил перевода выглядит как «soft skill», но это конкретное упражнение: для каждой техметрики команды держать готовый business-перевод. Я считаю, это самое высокое ROI инвестицией skill для SRE на L5+.

**Cadence важнее единичной встречи.** Я наблюдаю устойчивый паттерн: команды, которые встречаются с product / exec stakeholders **регулярно** (weekly product sync, monthly exec update), получают smooth resource allocation и нормальное обсуждение приоритетов. Команды, которые «идут к exec только когда плохо», получают reactive ответы и недополучают инвестиции. Cadence создаёт **trust capital**: stakeholder привык к тому, что SRE приносит структурированный update, поэтому когда нужно «срочное решение» — есть доверие и контекст. Без cadence каждое «срочное» обсуждение начинается с нуля.

**Stakeholder map не одинаков для разных уровней SRE.** Junior SRE взаимодействует с product team своего сервиса; senior SRE — также с finance (cost reviews), legal (incident communications), customer success (SLA conversations); staff SRE — также с C-level и board (strategic reliability decisions). Это не «junior'у не интересоваться остальными», это **разделение труда по уровню решений**. По моим наблюдениям, путаница в этом разделении приводит к двум failure mode'ам: либо junior пытается влиять на decisions, к которым у него нет authority и контекста; либо staff micromanage'ит обсуждения уровня product team. Stakeholder map с явной mapping role × stakeholder снимает эту путаницу.

**Saying no с данными — лучший способ долгосрочно сохранить partnership.** Распространённое опасение: «если я скажу нет, меня перестанут уважать / приглашать». Я устойчиво наблюдаю обратное. SRE, которые систематически говорят «да, мы сделаем» на запросы, которые они не могут выполнить устойчиво, выгорают за 1-2 года, оставляя обещания невыполненными. Команды, которые приучают stakeholder'ов к «нет» **с конкретным обоснованием и альтернативой**, через 2-3 года имеют гораздо больше веса в planning, потому что их «да» означает реальный commitment. Это не «быть негативным» — это **профессионально оперировать своими ресурсами**.

**Cost-translation — отдельный навык, который чаще всего отсутствует.** Я регулярно вижу senior SRE, которые не могут ответить на «сколько стоит для нас downtime X секунд» или «какой payback period от инвестиции $200k в platform tooling». Эти числа не приходят сами по себе — их надо посчитать (revenue per minute из finance + customer churn rate × LTV для downtime; saved engineer-weeks × loaded engineer cost — для tooling). Один раз поработав с finance над этими числами, SRE получает **универсальный business-перевод** для будущих обсуждений. Без этого reliability-инвестиции выглядят перед finance как «расходы без явного return», и просьба о budget уходит в конец очереди.

## Связанные листья

- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — partnership с engineering — частный случай stakeholder management; этот лист — более широкий scope с non-engineering. Чёткое разделение: там — engineering ↔ engineering; здесь — engineering ↔ non-engineering.
- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — основной регулярный ритуал, на котором translation tech ↔ business происходит на практике; качество stakeholder management напрямую виден по составу и качеству этого ритуала.
- **[DORA Metrics](/The-Way-of-SRE/leaves/culture/dora-metrics/)** — DORA-числа — один из лучших источников business-переводимых метрик для non-engineering audience; deployment frequency / lead time понимаются executive легче, чем p99 latency.
- **[Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)** — cost-translation — отдельная подобласть stakeholder management; finance — один из ключевых non-engineering stakeholder'ов, чей язык требует отдельной подготовки.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/)** — stakeholder map для DR-сценариев — частный случай: scenario-specific governance в моменте disaster. Этот лист — про continuous, тот — про crisis-specific.
- **[Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/)** — customer success / sales / public — стейкхолдеры, которые касаются внешней коммуникации; внутренний stakeholder management — предпосылка для качества внешней.
- **[Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/)** — stakeholder management — критерий L5+ в большинстве хороших ladder; staff/principal track напрямую требует cross-org influence. Без stakeholder management в ladder ladder становится плоским.
- **[Team Topologies](/The-Way-of-SRE/leaves/culture/team-topologies/)** — interaction mode (collaboration / X-as-a-Service / facilitating) определяет, какая cadence stakeholder management уместна; platform team имеет другой stakeholder map, чем embedded SRE.

## Открытые вопросы

- **Stakeholder management в startup vs enterprise** — в startup'е SRE часто говорит напрямую с CEO, в enterprise — через несколько уровней. Я не уверен, что universal practice здесь возможна; формат cadence и translation в этих контекстах разный. Если есть рабочая модель — расскажите PR'ом.
- **Written-first vs meeting-first culture** — Amazon-style 6-pager работает хорошо в meeting-driven org; в async-first org (GitLab, etc) тот же контент живёт как handbook page или RFC. Какой формат когда выбирать — отдельная подтема.
- **«Selling» reliability — отдельный навык** — не cost-translation, а нарративный: как объяснить exec, что инвестиция в reliability — это инвестиция в продукт. Charity Majors и Larson писали об этом, но цельной публичной практики я не вижу. Возможно, отдельный лист «Reliability Storytelling» в будущем.
