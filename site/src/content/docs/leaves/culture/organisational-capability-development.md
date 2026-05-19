---
title: Organisational Capability Development
description: Развитие организационных способностей — onboarding, knowledge transfer, communities of practice, competency frameworks, career ladders
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Organisational Capability Development
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Nice to have
- **Статус:** draft
:::

Развитие способностей организации в области SRE: onboarding новых инженеров, передача знаний между командами, communities of practice, явные competency frameworks и career ladders. Отвечает на вопрос «как организация **выращивает** SRE-инженеров, а не только нанимает их». Без этого слоя любая SRE-практика держится на нескольких ключевых людях и распадается при их уходе.

## Что должен уметь

- **L4** — Участвует в knowledge-transfer событиях команды (brown bag, pair sessions, recorded walkthroughs); пишет короткие заметки после освоения новой области для команды.
- **L4** — Ведёт часть onboarding для нового engineer'а: pair sessions, code walkthrough, runbook review, первые post-incident reviews.
- **L4** — Участвует в wheel of misfortune — играет роль incident commander или scribe; разбирает чужие сценарии без боевой обстановки.
- **L5** — Проектирует onboarding curriculum для своей команды: что должен знать новый engineer в первые 2 / 4 / 12 недель; какие artefacts (runbook'и, dashboards, репо) он должен освоить и в каком порядке.
- **L5** — Запускает или ведёт community of practice (cross-team) по одной из SRE-тем: SLO-практика, observability, incident response, capacity planning.
- **L5** — Применяет competency framework (SFIA или собственный) для self-assessment и обсуждения карьерных шагов; не превращает framework в чек-лист для performance review.
- **L6+** — Внедряет capability development как программу: skill matrix по командам, training budget, документированные career ladders, mentorship-программа.
- **L6+** — Связывает capability development с hiring / retention strategy: какие компетенции ищем на найме, какие развиваем внутри, как удерживаем сильных engineer'ов через рост.
- **L6+** — Защищает long-term capability investment от давления «дайте людей на текущие задачи»: training, ротации, communities — не «когда будет время», а планируемый процент capacity.

## Материалы

### Книги

- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). База: career progression и engineering management как смежная дисциплина для senior IC.
- Will Larson — **[Staff Engineer: Leadership beyond the management track](https://staffeng.com/)** (2021). База: путь staff/principal engineer для IC, отдельный от management. Сайт содержит публичные интервью и guides.
- Matthew Skelton, Manuel Pais — **Team Topologies** (IT Revolution, 2019). Раздел про **enabling teams**: команда, чья функция — повышение capability других команд. Прямая модель для SRE как enabling-функции. Дополнительно.

### Статьи и фреймворки

- **[SFIA — Skills Framework for the Information Age](https://sfia-online.org/en)**. Канонический фреймворк IT-компетенций (на нём построен этот roadmap). База для self-assessment и проектирования собственного skill matrix.
- **[Progression.fyi](https://progression.fyi/)** — публичная коллекция career ladders 75+ компаний (Circle CI, Medium, Monzo, GOV.UK и др.). Дополнительно. Полезно как референс перед написанием собственной ladder.
- Google SRE — **[Accelerating SREs to On-Call and Beyond](https://sre.google/sre-book/accelerating-sre-on-call/)** (SRE Book, глава 28). Onboarding-программа Google SRE: curriculum, mentorship, оценка прогресса. Дополнительно.

### Инструменты

- **Skill matrix (markdown в repo команды)** — самый простой формат: компетенции по горизонтали, engineer'ы по вертикали, уровни SFIA в ячейках. Без отдельного tooling.
- **Wheel of Misfortune** — практика (не инструмент): фасилитатор разыгрывает прошлый или придуманный инцидент, команда отрабатывает incident response. Источник кейсов — публикуемые постмортемы (`dastergon/postmortem-templates` как стартовая точка для шаблонов).
- **Internal knowledge base (Confluence / Notion / Obsidian)** — корпоративная wiki для документации, learning paths, recorded sessions. Главное — единое место и поиск; конкретный инструмент менее важен.

## Best practices

- **Onboarding curriculum явный, а не «учитесь на боевых задачах».** Антипаттерн: новый engineer бросается в production-инциденты с первой недели без подготовки. Через 3 месяца имеем разочарование и churn. Curriculum — это контракт: что engineer должен освоить, в какие сроки, кто mentor.
- **Knowledge transfer регулярный, не «когда понадобится».** Антипаттерн: один человек знает legacy-систему, остальные нет. Уход → деградация. Регулярные pair sessions, ротация on-call, brown bag о подсистемах распределяют знание заранее.
- **Wheel of misfortune — практика, не теория.** Антипаттерн: «прочитали статью о incident response, готовы». Реакция в инциденте — мышечная память, не интеллектуальная; тренируется только повторением сценариев. Wheel — еженедельно или ежемесячно, не «раз в год».
- **Competency framework — ориентир, а не чек-лист.** Антипаттерн: SFIA-уровни превращены в формальный grading для performance review. Engineer'ы геймифицируют под уровни, теряют связь с реальной работой. Framework — для self-assessment и обсуждения, не для оценки.
- **Communities of practice — cross-team, не внутри команды.** Антипаттерн: знания заперты в одной команде; cross-team learning происходит случайно. CoP по теме SRE собирает носителей знания из нескольких команд, обеспечивает обмен и стандартизацию практик.
- **Career ladders документированы и публичны внутри компании.** Антипаттерн: «вырастешь — посмотрим», уровень и компенсация — закрытая информация. Engineer'ы не понимают, что от них требуется, и уходят туда, где это видно.
- **Long-term capability investment — планируемый процент capacity, не «когда будет время».** Антипаттерн: training/ротации/CoP — первое, что режется при давлении бизнеса. Через 2 года команда теряет способность учиться и адаптироваться. Минимум 10–20% capacity на capability work — норма, защищаемая на уровне planning.

## Связанные листья

- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — wheel of misfortune использует постмортем-формат; качество разборов на capability development прямо опирается.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и — основной артефакт knowledge transfer; их актуальность — proxy-метрика capability команды.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — partnership-модель опирается на shared capability: SRE учит dev надёжности, dev учит SRE domain'у.
- **[IT Management](/The-Way-of-SRE/leaves/culture/it-management/)** — capability development — стратегическая инвестиция в operations capability; виден в org-level planning.
- **Professional Development** *(TBD)* — personal-level рост engineer'а (в SRE Practices); этот лист — про organisational-level. Граница уточняется при углублении соседнего листа.
- **Methods & Tools** *(TBD)* — выбор и стандартизация инструментов; capability development обеспечивает компетентное использование выбранного tooling.

## Открытые вопросы

- Граница между этим листом (organisational) и `practices/professional-development` (personal): пересечение по теме career ladders, mentorship, learning. В этом листе — org-level (программа, framework, процент capacity); там — personal-level (что делает engineer для своего роста). Окончательное разделение — при углублении соседнего листа.
- Connection с hiring strategy: capability development влияет на «what to build vs what to buy» в командной композиции, но это пограничная тема между SRE Culture и HR / Talent. Скорее всего, выходит за scope SRE-roadmap и остаётся фоновым контекстом.
