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

«Бросим в боевые инциденты с первой недели — научится быстрее». Совет, который я регулярно слышу от старших инженеров, и одна из самых частых причин, по которым новый человек уходит через три-шесть месяцев. SRE Onboarding — это **систематическое** введение в команду и в прод: явный curriculum, закреплённый mentor до выхода в ротацию, понятная последовательность освоения artefacts ([runbook](/The-Way-of-SRE/glossary/#runbook), dashboards, репозитории, [on-call](/The-Way-of-SRE/glossary/#on-call) rotation) и путь до первого дежурства под supervision. Практика базовая, внутри L1 `Organisational Capability Development`. Без неё инженер идёт в продакшен на ощупь. И уходит.

## Что должен уметь

Главный навык на уровне L5 — измерять **time-to-on-call** как метрику. «Выйдет в ротацию, когда будет готов» — без даты инженер тянется, команда не планирует ротацию, mentor не понимает, что подтянуть. Целевая дата (8 недель до supervised on-call, 12 недель до самостоятельного) даёт структуру и accountability. Я регулярно вижу разницу: команды с явным time-to-on-call быстрее выводят новых инженеров в продуктивность.

**L4**
- Следует onboarding curriculum команды как mentor: ведёт pair sessions, code walkthrough, runbook review с onboardee.
- Пишет короткий onboarding plan для конкретного инженера: что осваивает в первые 2 / 4 / 12 недель, какие artefacts, кто mentor.
- Участвует в wheel of misfortune вместе с onboardee как фасилитатор или scribe.

**L5**
- Проектирует onboarding curriculum для команды: список artefacts, последовательность освоения, milestones, требования к mentor, критерий «готов к on-call».
- Оценивает прогресс onboardee через regular check-ins (1 / 2 / 4 / 8 / 12 weeks), корректирует curriculum по фактическому опыту.
- Связывает onboarding с боевой готовностью: до какого момента инженер не дежурит самостоятельно, как первое on-call происходит под supervision.

**L6+**
- Внедряет программу onboarding для нескольких команд: shared baseline + team-specific extension, mentor rotation, метрики time-to-on-call.
- Связывает onboarding с hiring / retention strategy: что должны уметь candidates на входе, как сохраняем инженеров после первых 12 месяцев.
- Защищает onboarding capacity от давления «у нас сейчас инциденты, не до того»; без защиты onboarding деградирует первым.

## Материалы

### Книги

- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). Главы про onboarding, mentorship, 1:1 — общая дисциплина, на которой стоит SRE onboarding.
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Для senior IC, кто становится mentor — описание роли mentor как essential staff-engineer skill.

### Статьи

- Google SRE — **[Accelerating SREs to On-Call and Beyond](https://sre.google/sre-book/accelerating-sre-on-call/)** (SRE Book, глава 28). Канонический описание Google SRE onboarding — curriculum, mentorship, переход к on-call.

### Инструменты

- **Onboarding curriculum (markdown в repo команды)** — простой формат: один документ, чек-лист по неделям, ссылки на runbook, dashboards, репозитории, контакты mentor. Обновляется после каждого onboarding.
- **Wheel of Misfortune** — практика (не tool): фасилитатор разыгрывает прошлый или придуманный инцидент, onboardee играет роль incident commander под наблюдением. Источник кейсов — публикуемые постмортемы (`dastergon/postmortem-templates`). По моим наблюдениям, это самый эффективный способ подготовки перед первым настоящим инцидентом.
- **Pair on-call (shadow shifts)** — стандартный паттерн: onboardee дежурит вместе с опытным SRE в течение N циклов без самостоятельной ответственности.

## Best practices

**Короткие правила:**

- **Mentor определён до выхода инженера, а не «найди кого-нибудь потом».** «У нас все помогут» на практике означает, что не отвечает никто. Mentor — конкретный человек с явно выделенным временем: час-два в неделю минимум на первый месяц.
- **Time-to-on-call — измеримая метрика, а не «когда будет готов».** Без даты инженер тянет, команда не планирует ротацию, mentor не понимает, что подтягивать. Целевая дата (8 недель до supervised, 12 — до самостоятельного дежурства) даёт и структуру, и accountability.

Явный curriculum я ставлю выше обоих правил, потому что без него они повисают в воздухе. «Учитесь на боевых задачах» звучит бодро ровно до третьего месяца, дальше начинается разочарование, а на шестом человек уходит — и уходит он не от сложности, а от ощущения, что его бросили. Curriculum — это контракт: что осваивает, в какие сроки, кто mentor, что считается пройденным.

Подробнее:

**Regular check-ins с явной повесткой.** «Не спрашивает — значит всё нормально». Через два месяца выясняется, что человек стеснялся задавать глупые вопросы и всё это время стоял. Еженедельная 1:1 с явной повесткой — что освоено, что неясно, что блокирует — ловит это рано. Я регулярно вижу, что новые инженеры, которые молчат первый месяц, чаще уходят на испытательном: не потому, что человек не подходит команде, а потому что поддержки он не получил.

**Wheel of misfortune до первого реального инцидента.** Иначе первым incident response для человека станет настоящий отказ прода в три ночи, когда рядом никого, страница алерта незнакомая, а решение надо принимать прямо сейчас. Он паникует. Mentor спит, MTTR растёт, уверенность в себе падает надолго. Разыгранный инцидент в безопасной обстановке формирует мышечную память, и знание наконец превращается в навык.

**Onboarding capacity защищён в planning.** Обучение и менторство режутся первыми, как только приходит давление по срокам, и это выглядит рационально ровно один квартал. Через год команда обнаруживает, что не может вырастить никого, а новые инженеры уходят. Время mentor'а — планируемая часть capacity, а не «свободное время». Позиция политическая, и защищать её приходится старшему инженеру или руководителю в прямом конфликте с продуктовым давлением.

**Knowledge transfer регулярный, не только во время onboarding.** «Учим только новых» — через год знания распределены ровно так же неравномерно, как раньше. Те же практики (brown bag, pair sessions, runbook review) работают и на действующих инженерах. Без этого уход одного человека забирает с собой целую компетенцию.

## Связанные листья

- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook — ключевой artefact onboarding; качество runbook прямо влияет на time-to-on-call.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — wheel of misfortune использует постмортем-формат; качество разборов = качество сценариев для onboarding.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — главный навык, под который готовит onboarding; supervised on-call — мост от curriculum к реальной ротации.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — embedded SRE onboarding включает погружение в продуктовую команду, не только в боевые сервисы.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog — точка входа onboardee в production.
- **[Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/)** — onboarding curriculum обычно maps к L3 → L4 progression в первый год.
- **[Communities of Practice](/The-Way-of-SRE/leaves/culture/communities-of-practice/)** — после первых 12 недель CoP — место, где новый инженер находит cross-team peer learning.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/)** — Wheel of Misfortune для onboardee — частный случай. Здесь — сценарий первых недель; там — continuous calibration команды.
- **[Team Topologies](/The-Way-of-SRE/leaves/culture/team-topologies/)** — сценарий onboarding зависит от того, в какую topology попадает новый инженер (embedded / platform / enabling). Без понимания topology curriculum получается универсальным и неточным.

## Открытые вопросы

Под L1 `Organisational Capability Development` остаются незакрытые темы. Career Ladders уже выделена в отдельный лист, а Competency Framework (матрица навыков SRE на базе SFIA) и Retention пока висят без листа.

Граница с `practices/Personal Growth Plan` меня не до конца устраивает: mentorship и личный рост живут в обоих. Пока договорённость такая — здесь org-level процесс onboarding, там развитие конкретного человека.
