---
title: SRE Onboarding
description: Систематическое введение нового SRE — curriculum, mentor, путь до первого on-call под supervision
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Organisational Capability Development / SRE Onboarding
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Nice to have
- **Статус:** draft
:::

«Бросим в боевые инциденты с первой недели — научится быстрее» — типичный совет, который я слышу от senior-инженеров, и типичная причина churn'а нового инженера через 3–6 месяцев. SRE Onboarding — это **систематическое** введение в команду и production: явный curriculum, mentor-связь до выхода, последовательность освоения artefacts ([runbook](/The-Way-of-SRE/glossary/#runbook), dashboards, репозитории, [on-call](/The-Way-of-SRE/glossary/#on-call) rotation), путь до первого on-call под supervision. Базовая практика внутри L1 `Organisational Capability Development`; без неё новый инженер выходит «в продакшен на ощупь» и churn'ит через 6 месяцев.

## Что должен уметь

Главный навык на уровне L5 — измерять **time-to-on-call** как метрику. «Выйдет в ротацию, когда будет готов» — без даты инженер тянется, команда не планирует ротацию, mentor не понимает, что подтянуть. Целевая дата (8 недель до supervised on-call, 12 недель до самостоятельного) даёт структуру и accountability. Я регулярно вижу разницу: команды с явным time-to-on-call быстрее выводят новых инженеров в продуктивность.

- **L4** — Следует onboarding curriculum команды как mentor: ведёт pair sessions, code walkthrough, runbook review с onboardee.
- **L4** — Пишет короткий onboarding plan для конкретного инженера: что осваивает в первые 2 / 4 / 12 недель, какие artefacts, кто mentor.
- **L4** — Участвует в wheel of misfortune вместе с onboardee как фасилитатор или scribe.
- **L5** — Проектирует onboarding curriculum для команды: список artefacts, последовательность освоения, milestones, требования к mentor, критерий «готов к on-call».
- **L5** — Оценивает прогресс onboardee через regular check-ins (1 / 2 / 4 / 8 / 12 weeks), корректирует curriculum по фактическому опыту.
- **L5** — Связывает onboarding с production-готовностью: до какого момента инженер не дежурит самостоятельно, как первое on-call происходит под supervision.
- **L6+** — Внедряет onboarding-программу для нескольких команд: shared baseline + team-specific extension, mentor rotation, метрики time-to-on-call.
- **L6+** — Связывает onboarding с hiring / retention strategy: что должны уметь candidates на входе, как сохраняем инженеров после первых 12 месяцев.
- **L6+** — Защищает onboarding capacity от давления «у нас сейчас инциденты, не до того»; без защиты onboarding деградирует первым.

## Материалы

### Книги

- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). Главы про onboarding, mentorship, 1:1 — общая дисциплина, на которой стоит SRE onboarding.
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Для senior IC, кто становится mentor — описание роли mentor как essential staff-engineer skill.

### Статьи

- Google SRE — **[Accelerating SREs to On-Call and Beyond](https://sre.google/sre-book/accelerating-sre-on-call/)** (SRE Book, глава 28). Канонический описание Google SRE onboarding — curriculum, mentorship, переход к on-call.

### Инструменты

- **Onboarding curriculum (markdown в repo команды)** — простой формат: один документ, чек-лист по неделям, ссылки на runbook, dashboards, репозитории, контакты mentor. Обновляется после каждого onboarding.
- **Wheel of Misfortune** — практика (не tool): фасилитатор разыгрывает прошлый или придуманный инцидент, onboardee играет роль incident commander под наблюдением. Источник кейсов — публикуемые постмортемы (`dastergon/postmortem-templates`). По моим наблюдениям, это самый эффективный training-инструмент перед первым real incident.
- **Pair on-call (shadow shifts)** — стандартный паттерн: onboardee дежурит вместе с опытным SRE в течение N циклов без самостоятельной ответственности.

## Best practices

**Короткие правила:**

- **Curriculum явный, а не «учитесь на боевых задачах».** Через 3 месяца бесструктурного onboarding имеем разочарование и churn; через 6 — увольнение. Curriculum = контракт между командой и onboardee: что осваивает, в какие сроки, кто mentor.
- **Mentor определён до выхода инженера, а не «найди кого-нибудь потом».** «У нас все помогут» = никто не отвечает. Mentor — конкретный человек с явно выделенным временем (1–2 часа в неделю минимум на первый месяц).
- **Time-to-on-call — измеримая метрика, а не «когда готов».** Без даты инженер тянется, команда не планирует ротацию. Целевая дата (8 недель до supervised, 12 — до самостоятельного) даёт структуру и accountability.

Подробнее:

**Regular check-ins с явной повесткой.** «Не спрашивает — значит ОК» — через 2 месяца выясняется, что инженер стесняется задавать «глупые» вопросы и зашёл в тупик. 1:1 еженедельно с явной повесткой (что освоено, что неясно, что блокирует) ловит проблемы рано. Я регулярно вижу: новые инженеры, которые не задают вопросов в первый месяц, чаще уходят на испытательном сроке — не потому, что они не подходят, а потому что не получили нужной поддержки.

**Wheel of misfortune до первого реального инцидента.** Первое incident response — настоящий production-инцидент в 3 ночи. Engineer паникует, mentor спит, MTTR растёт, onboardee теряет уверенность. Тренировка реакции в безопасной среде формирует мышечную память; без неё knowledge не превращается в skill.

**Onboarding capacity защищён в planning.** «Training/mentorship режутся первыми при давлении бизнеса» — через год команда не может вырастить никого; новые инженеры уходят. Mentor time — планируемая часть capacity, не «свободное время». Это политическая позиция, которую защищает senior-инженер / EM в конфликте с product-pressure.

**Knowledge transfer регулярный, не только во время onboarding.** «Учим только новых» — через год знания распределены так же неравномерно, как до. Onboarding-практики (brown bag, pair sessions, runbook review) применяются и к существующим инженерам — иначе при уходе одного человека команда теряет компетенцию.

## Связанные листья

- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook — ключевой artefact onboarding; качество runbook прямо влияет на time-to-on-call.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — wheel of misfortune использует постмортем-формат; качество разборов = качество сценариев для onboarding.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — главный навык, под который готовит onboarding; supervised on-call — мост от curriculum к реальной ротации.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — embedded SRE onboarding включает погружение в product-команду, не только в production-сервисы.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog — точка входа onboardee в production.
- **[Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/)** — onboarding curriculum обычно maps к L3 → L4 progression в первый год.
- **[Communities of Practice](/The-Way-of-SRE/leaves/culture/communities-of-practice/)** — после первых 12 недель CoP — место, где новый инженер находит cross-team peer learning.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/)** — Wheel of Misfortune для onboardee — частный случай. Здесь — onboarding-скрипт первых недель; там — continuous calibration команды.
- **[Team Topologies](/The-Way-of-SRE/leaves/culture/team-topologies/)** — onboarding-скрипт зависит от того, в какую topology попадает новый инженер (embedded / platform / enabling). Без понимания topology curriculum получается универсальным и неточным.

## Открытые вопросы

- Под L1 `Organisational Capability Development` остаются темы — Career Ladders уже выделена; Competency Framework (SFIA-adapted skill matrix для SRE), Retention.
- Граница со `practices/Personal Growth Plan`: пересечение по mentorship и личному росту. Здесь — org-level процесс onboarding; там — personal-level развитие.
