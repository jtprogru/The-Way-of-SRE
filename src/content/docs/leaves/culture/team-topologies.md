---
title: Team Topologies
description: Сознательный дизайн команд и режимов их взаимодействия — про когнитивную нагрузку и обратный манёвр Конвея, не про реорг
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Organisational Capability Development / Team Topologies
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Мы внедрили Team Topologies» обычно означает «мы переименовали часть команд в Platform и Stream-Aligned». Это не Team Topologies, это реорг с новой табличкой. Skelton и Pais построили **диагностическую рамку**: четыре фундаментальных типа команд и три режима взаимодействия. Ценность — не в том, как назвать команды, а в том, чтобы (а) дизайнить **team API** и режимы взаимодействия осознанно, (б) удерживать [когнитивную нагрузку](/The-Way-of-SRE/glossary/#cognitive-load) команды в пределах её способности, (в) использовать **inverse Conway maneuver** — структурировать команды так, чтобы получить желаемую архитектуру. Лист — про применение рамки в SRE-контексте: где платформенная SRE-команда работает, где embedded, где enabling-режим.

Я считаю, что без понимания этого фреймворка любая дискуссия о «централизованная vs embedded SRE» бессмысленна — потому что эти два варианта не альтернативы, а **разные interaction modes**, которые могут сосуществовать в одной org. Граница с [SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/) — там про вход одного инженера в SRE-практику; здесь — про дизайн SRE-команд на уровне организации. Граница с [Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/) — там про динамику отношений с product-командой в моменте; здесь — про формальную структуру и режим, в котором эта динамика происходит.

## Что должен уметь

Главный навык на уровне L5 — **распознавать, какой interaction mode уместен в моменте**, и явно выбирать его, а не сваливаться в дефолтный «как привыкли». Collaboration на полгода с продукт-командой выглядит близко и быстро, но через квартал блокирует обе команды и съедает их когнитивную ёмкость. X-as-a-Service выглядит холодно и формально, но масштабируется на 20+ команд без блокировок. Facilitating-режим выглядит как «помощь», но если у enabling-команды нет exit-критерия, она становится постоянным костылём. Каждый режим уместен в своих условиях; путать их — корень большинства org-level пробуксовок, которые я наблюдаю.

- **L4** — Различает четыре типа команд (stream-aligned, platform, enabling, complicated-subsystem) и три interaction mode (collaboration, X-as-a-Service, facilitating). Читает org-структуру через эту рамку.
- **L4** — Описывает **team API** своей команды: что мы делаем, как с нами связаться, какой response time, какие интерфейсы (service catalog, runbook'и, request flow, on-call channel).
- **L5** — Проектирует interaction между своей SRE-командой и product-командами: какой режим (collaboration на старте → X-as-a-Service на масштабе), какие exit-критерии, какие SLA коммуникации.
- **L5** — Применяет **inverse Conway maneuver**: формулирует, какая архитектура нужна, отсюда — какие team boundaries. Например: микросервисная архитектура → stream-aligned teams с end-to-end ownership; общий runtime/observability — platform team.
- **L5** — Удерживает когнитивную нагрузку команды в пределах её ёмкости: если команда владеет более чем 7±2 сервисами или знаком технологий, это сигнал на split или на platform-инвестицию.
- **L5** — Распознаёт сигналы misalignment'а: затянутая collaboration без exit, platform-team как bottleneck, enabling-team превратившаяся в permanent ops-команду.
- **L6+** — Внедряет Team Topologies на уровне SRE-функции в org: какие SRE-команды нужны, в каком режиме они работают с продуктовыми, как растут с ростом org.
- **L6+** — Ведёт переговоры с руководством о реорганизации команд в логике topology, а не «по головам»: обоснование через когнитивную нагрузку, flow metrics ([DORA](/The-Way-of-SRE/leaves/culture/dora-metrics/)), team API stability.

## Материалы

### Книги

- Matthew Skelton, Manuel Pais — **[Team Topologies](https://teamtopologies.com/book)** (IT Revolution, 2019). Основной источник. Если читать одну книгу — эту. Главы 5 (four team types) и 7 (interaction modes) — рабочая база; остальное полезно для контекста.
- Mel Conway — **[How Do Committees Invent?](https://www.melconway.com/Home/Committees_Paper.html)** (Datamation, 1968). Оригинальная статья Conway's Law. Не Team Topologies, но фундамент — без понимания «структура коммуникации → структура системы» рамка Skelton/Pais висит в воздухе.
- Nicole Forsgren, Jez Humble, Gene Kim — **[Accelerate](https://itrevolution.com/product/accelerate/)** (IT Revolution, 2018). Глава 4 «Architecture» — эмпирическое подтверждение, что loosely coupled teams + loosely coupled architecture коррелируют с высокой производительностью. Книга-предтеча Team Topologies; вместе читаются лучше, чем по отдельности.

### Статьи и доклады

- Matthew Skelton, Manuel Pais — **[teamtopologies.com](https://teamtopologies.com/)** (живой сайт + блог). Регулярные кейсы и уточнения; полезен в первую очередь раздел «Industry examples». Skelton сам публикует ответы на типичные неверные интерпретации.
- Charles Betz — **[Team Topologies in the Real World](https://www.forrester.com/blogs/team-topologies-in-the-real-world/)** (Forrester). Критический взгляд: где рамка работает, где упрощает реальность. Не подмена книге, но полезный counter-balance.
- Henrik Kniberg — **[Spotify Engineering Culture](https://blog.crisp.se/2014/03/27/henrikkniberg/spotify-engineering-culture-part-1)** (2014). Не Team Topologies, но Spotify-model часто упоминают рядом. Skelton явно пишет, что Spotify-model часто неверно копируют — статья помогает понять разницу.

### Инструменты

- **Team API Canvas** — однополосный документ команды: purpose, communications channels, response time, dependencies, on-call schedule. Я регулярно вижу, что это самый дешёвый и при этом самый ценный артефакт Team Topologies — превращает «мы платформенная команда» в конкретный контракт с потребителями.
- **[Conway's Law Inversion exercise](https://teamtopologies.com/key-concepts-content/inverse-conway-maneuver)** — упражнение от Skelton/Pais: на whiteboard рисуем желаемую архитектуру, отсюда выводим team boundaries. Полезен на старте реструктуризации.
- **Cognitive load assessment** — qualitative оценка («сколько сервисов и технологий держит команда в голове, чтобы продолжать работать»). Skelton предлагает шкалу 1–5; на практике достаточно red/yellow/green. Без assessment platform-инвестиции делаются вслепую.
- **Service catalog с явным владельцем и team API** — [Backstage](https://backstage.io/) и аналоги. Без catalog'а stream-aligned teams тратят время на «кому это принадлежит» — это прямой проигрыш Team Topologies на масштабе.

## Best practices

Главный публичный кейс, который полезно прочитать рядом с книгой — **эволюция SRE в Google** в логике topology. Google SRE в isolation начинался как embedded в продукт-команды (с явным production readiness review), потом стандартизовался в централизованную SRE-функцию (по сути platform team со своим API: SLO framework, on-call infrastructure, postmortem templates), затем эволюционировал в смешанный режим: централизованная platform SRE + embedded SRE в крупнейших продуктах + consulting/enabling для меньших. Это не «у Google нет одной модели», это иллюстрация того, что **разные продукты требуют разного interaction mode** с SRE, и зрелая org это допускает. Если читаете лист и думаете «у нас должна быть одна модель» — эта траектория Google — главное возражение.

**Короткие правила:**

- **Четыре типа команд — это диагностика, не названия должностей.** Антипаттерн: переименовали инфраструктурную команду в «Platform» — Team Topologies «внедрены». Правильно — задать вопрос: эта команда **действительно** поставляет self-serve платформу для сокращения когнитивной нагрузки stream-aligned teams? Если нет — она не platform team, как бы её не называли.
- **Collaboration — временный режим, не дефолт.** Антипаттерн: «работаем близко с product-командой постоянно». Правильно — collaboration в окне высокой неопределённости (новый продукт, незнакомая область) с явным exit-критерием перехода к X-as-a-Service. Permanent collaboration — съедающая cognitive load обеих команд.
- **Enabling-команда обязана иметь exit-критерий.** Антипаттерн: enabling team как permanent helper («они помогают нам с тестами уже два года»). Правильно — каждое engagement enabling-команды с stream-aligned имеет timeline и success criteria: stream-aligned team приобрела способность и продолжает без помощи.

Подробнее:

**Cognitive load — главный constraint, который я наблюдаю в SRE-командах.** Стандартный путь: SRE-команда из 4 человек начинает поддерживать 5 сервисов, потом 12, потом 25. На 12-25 проявляется паттерн «никто не знает всего», incidents лечатся через «спросить того, кто помнит этот сервис», runbook'и устаревают, on-call становится lottery. Это не проблема «нужно больше людей», это проблема **превышения когнитивной ёмкости**. Решений два: либо split на stream-aligned teams (каждая владеет 3-5 сервисами end-to-end), либо инвестиция в platform — observability, deploy, SLO tooling — чтобы поднять «эффективную ёмкость» команды. По моим наблюдениям, большинство SRE-команд выбирают «больше людей», что не решает проблему: при 8 людях на 50 сервисов когнитивная нагрузка распределена, но каждый отдельный человек всё равно не помещается в свою область.

**Platform team без клиентоориентации = bureaucratic blocker.** Один из самых частых failure mode'ов, которые я вижу: централизованная SRE-команда становится «attestation team», которая review'ит запросы product-команд и блокирует прод-changes. Это не Platform Team по Skelton/Pais. Платформа должна быть **самообслуживаемой**: stream-aligned teams используют её через документированный team API без ticket-flow и личного вмешательства. Если каждый запрос требует Slack-pinga в платформенный канал — это не платформа, это IT Operations с новым названием. Тест простой: уберите всех людей из платформенной команды на неделю — что сломается? Если ничего критичного — платформа есть. Если всё — платформы нет, есть ops.

**Inverse Conway maneuver работает только при executive buy-in.** Skelton/Pais описывают изменение структуры команд под желаемую архитектуру как первичное действие. На практике это означает реорганизацию людей, что требует CTO/VP-level решения. Я регулярно вижу попытки сделать inverse Conway «снизу вверх» — engineers рисуют team API, проводят retrospective, договариваются о boundaries — и упираются в существующие HR/reporting lines. Без executive buy-in рамка остаётся артефактом whiteboard-сессий и не превращается в реальные изменения. Если у вас нет sponsorship на уровне выше — начните с **малого**: один team API document для своей SRE-команды, опубликованный для product-команд. Это уже Team Topologies в действии, без реструктуризации.

**SRE-функция эволюционирует через типы команд, не отбрасывает их.** Я наблюдаю траекторию роста SRE-функции, которая повторяется в разных org'ах: (1) **embedded SRE** в каждой продукт-команде (start-up phase, 1-2 продукта); (2) **enabling SRE** — небольшая команда, которая помогает product-командам adoption'ить SRE-практики (рост 5-15 продуктов); (3) **platform SRE** — централизованная команда, поставляющая reliability-платформу как self-serve (15+ продуктов); (4) **гибрид** — platform SRE как ядро + embedded SRE в самых критичных продуктах + enabling SRE для onboarding новых команд. Каждый шаг — не отказ от предыдущего, а добавление нового типа. Реальный антипаттерн — пытаться зафиксироваться на одной модели на всех этапах.

## Связанные листья

- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — этот лист описывает **динамику** партнёрства; Team Topologies задаёт **режим** (collaboration / X-as-a-Service / facilitating), в котором эта динамика происходит. Без topology partnership остаётся подразумеваемым.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — onboarding-скрипт зависит от того, в какую topology попадает новый инженер: embedded vs platform vs enabling — разные curriculum'ы, разные первые недели.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service ownership — артефакт topology: stream-aligned team владеет сервисом end-to-end, platform team владеет инфраструктурой; без явной topology service catalog становится неполным.
- **[Communities of Practice](/The-Way-of-SRE/leaves/culture/communities-of-practice/)** — CoP — механизм sharing knowledge **поперёк** topology, особенно когда stream-aligned teams работают изолированно; платформенная команда часто фасилитирует CoP по reliability.
- **[Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/)** — career path SRE-инженера часто пересекает topology types: junior в embedded → senior в platform → staff в enabling. Без понимания topology ladder читается плоско.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — часть team API: runbook'и stream-aligned team на свои сервисы, runbook'и platform team на использование платформы.
- **[DORA Metrics](/The-Way-of-SRE/leaves/culture/dora-metrics/)** — DORA измеряет flow stream-aligned team; ухудшение lead time часто сигнализирует о неправильно настроенной topology (platform-bottleneck, missing X-as-a-Service interface).

## Открытые вопросы

- **SRE Maturity Assessment** *(TBD)* — соседний L2-концепт под этим L1; включает оценку, в каком topology-режиме org сейчас и куда движется. Кандидат на отдельный лист.
- **SRE Model Adoption** *(TBD)* — практическая часть выбора и перехода между topology-режимами (embedded → platform → hybrid); может быть отдельным листом или частью этого.
- **Platform Engineering / Internal Developer Portal** *(TBD)* — практическая реализация platform team через Backstage / Port / Cortex; кандидат на отдельный лист под Engineering.
- Я не уверен, как корректно применять Team Topologies в малых org (до 20 человек), где формальные team boundaries размыты. Skelton/Pais фокусируются на средних и крупных org; для startup-фазы рамка часто превращается в overhead. Если есть рабочая практика — расскажите PR'ом.
