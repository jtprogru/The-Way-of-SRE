---
title: SRE Onboarding
description: Систематическое введение нового SRE-инженера в команду и production — curriculum, mentorship, путь до первого on-call под supervision
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Organisational Capability Development / SRE Onboarding
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Nice to have
- **Статус:** draft
:::

Систематическое введение нового SRE-инженера в команду и production: явный curriculum, mentorship-связь до выхода, последовательность освоения artefacts (runbook'и, dashboards, репозитории, on-call rotation), путь до первого on-call под supervision. Базовая практика внутри L1 `Organisational Capability Development` — без неё новый engineer выходит «в продакшен на ощупь», тратит 3–6 месяцев на разрозненные знания и churn'ит. Соседние листья этого же L1 могут возникнуть в будущем: Career Ladders, Competency Framework, Communities of Practice.

## Что должен уметь

- **L4** — Следует onboarding curriculum команды как mentor: ведёт pair sessions, code walkthrough, runbook review с onboardee'ом.
- **L4** — Пишет короткий onboarding plan для конкретного engineer'а: что осваивает в первые 2 / 4 / 12 недель, какие artefacts (репозитории, runbook'и, dashboards), кто mentor.
- **L4** — Участвует в wheel of misfortune вместе с onboardee'ом как фасилитатор или scribe, разбирая прошлые или придуманные инциденты.
- **L5** — Проектирует onboarding curriculum для команды: список artefacts, последовательность освоения, milestones, требования к mentor'у, критерий «готов к on-call».
- **L5** — Оценивает прогресс onboardee'а через regular check-ins (1 / 2 / 4 / 8 / 12 weeks), корректирует curriculum по фактическому опыту.
- **L5** — Связывает onboarding с production-готовностью: до какого момента engineer не дежурит самостоятельно, как первое on-call происходит под supervision и как фиксируется переход к самостоятельной ротации.
- **L6+** — Внедряет onboarding-программу для нескольких команд: shared baseline curriculum + team-specific extension, mentor rotation, метрики time-to-on-call, ретроспектива каждого onboarding'а.
- **L6+** — Связывает onboarding с hiring / retention strategy: что должны уметь candidates на входе, какие пробелы закрываются onboarding'ом, как сохраняем engineer'ов после первых 12 месяцев.
- **L6+** — Защищает onboarding capacity (mentor time, training budget) от давления «у нас сейчас инциденты, не до того»; без защиты onboarding деградирует первым.

## Материалы

### Книги

- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). База: главы про onboarding, mentorship, 1:1 формат — общая дисциплина, на которой стоит SRE onboarding.
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Дополнительно: для senior IC, кто становится mentor, описание роли mentor'а как essential staff-engineer-skill.

### Статьи

- Google SRE — **[Accelerating SREs to On-Call and Beyond](https://sre.google/sre-book/accelerating-sre-on-call/)** (SRE Book, глава 28). База: канонический описание Google SRE onboarding — curriculum, mentorship, переход к on-call, метрики прогресса.

### Инструменты

- **Onboarding curriculum (markdown в repo команды)** — самый простой формат: один документ, в нём чек-лист по неделям, ссылки на runbook'и, dashboards, репозитории, контакты mentor'а. Обновляется после каждого onboarding'а.
- **Wheel of Misfortune** — практика (не tool): фасилитатор разыгрывает прошлый или придуманный инцидент, onboardee играет роль incident commander под наблюдением. Источник кейсов — публикуемые постмортемы и `dastergon/postmortem-templates` как шаблоны для собственных сценариев.
- **Pair on-call (shadow shifts)** — стандартный паттерн: onboardee дежурит вместе с опытным SRE в течение N циклов без самостоятельной ответственности. Не tool, а практика, требующая явного планирования.

## Best practices

- **Curriculum явный, а не «учитесь на боевых задачах».** Антипаттерн: новый engineer бросается в production-инциденты с первой недели без подготовки. Через 3 месяца имеем разочарование и churn; через 6 — увольнение. Curriculum — это контракт между командой и onboardee: что осваивает, в какие сроки, кто mentor.
- **Mentor определён до выхода engineer'а, а не «найди кого-нибудь потом».** Антипаттерн: «у нас все помогут» — фактически никто не отвечает, onboardee стесняется задавать вопросы, mentor занят. Mentor — конкретный человек, с явно выделенным временем (1–2 часа в неделю минимум на первый месяц).
- **Time-to-on-call — измеримая метрика, а не «когда готов».** Антипаттерн: «выйдет в ротацию, когда будет готов» — без даты engineer тянется, команда не планирует ротацию, mentor не понимает, что подтянуть. Целевая дата (например, 8 недель до supervised on-call, 12 — до самостоятельного) даёт всем структуру и accountability.
- **Regular check-ins с явной повесткой.** Антипаттерн: «не спрашивает — значит ОК». Через 2 месяца выясняется, что engineer стесняется задавать «глупые» вопросы и зашёл в тупик. 1:1 еженедельно с явной повесткой (что освоено, что неясно, что блокирует) ловит проблемы рано.
- **Knowledge transfer регулярный, не только во время onboarding.** Антипаттерн: «учим только новых». Через год знания распределены так же неравномерно, как до. Onboarding-практики (brown bag, pair sessions, runbook review) применяются и к существующим engineer'ам — иначе при уходе одного человека команда теряет компетенцию.
- **Wheel of misfortune до первого реального инцидента.** Антипаттерн: первое incident response — настоящий production-инцидент в 3 утра. Engineer паникует, mentor спит, MTTR растёт, onboardee теряет уверенность. Тренировка реакции в безопасной среде — мышечная память; без неё knowledge не превращается в skill.
- **Onboarding capacity защищён в planning.** Антипаттерн: training/mentorship режутся первыми при давлении бизнеса («сейчас инцидент, не до того»). Через год команда не может вырастить никого; новые engineer'ы уходят. Mentor time — планируемая часть capacity, не «свободное время».

## Связанные листья

- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и — ключевой artefact onboarding: первое, что осваивает новый engineer; качество runbook'ов прямо влияет на time-to-on-call.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — wheel of misfortune использует постмортем-формат; качество разборов на сценарии для onboarding напрямую опирается.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — incident response — главный навык, под который готовит onboarding; supervised on-call — мост от curriculum к реальной ротации.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — embedded SRE onboarding включает погружение в product-команду, не только в production-сервисы.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog — точка входа onboardee'а в production: что владеет команда, что — соседи, где мои зоны ответственности.

## Открытые вопросы

- Под L1 `Organisational Capability Development` остаются темы, которые могут стать отдельными листьями: **Career Ladders** (документированные уровни и переходы), **Competency Framework** (SFIA-adapted skill matrix для SRE), **Communities of Practice** (cross-team learning по темам observability, SLO, incident response), **Retention** (что удерживает сильных engineer'ов после onboarding). SRE Onboarding — фундамент для всех четырёх, но каждый имеет самостоятельный scope.
- Граница со `practices/professional-development` (Mandatory): пересечение по теме mentorship и личного роста. Здесь — org-level процесс onboarding (что делает команда для нового engineer'а); там — personal-level развитие engineer'а в долгую. Окончательное разделение — при углублении соседнего листа.
