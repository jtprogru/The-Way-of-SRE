---
title: One-on-Ones
description: Регулярные 1:1 с manager / tech lead — пространство для feedback, роста, блокеров
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Performance Management / One-on-Ones
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Расскажи, что у тебя по тикетам?» — типичное начало [1:1](/The-Way-of-SRE/glossary/#1-1), после которого встреча перестаёт быть тем, чем должна быть. 1:1 — это **не status update**: status есть в Jira, в standup, в retro. 1:1 — пространство для того, что **не покрыто** другими ритуалами: личные блокеры, обратная связь, growth conversations, отношения в команде, ожидания. Andy Grove сформулировал это в 1983: 1:1 — это **встреча сотрудника**, а не руководителя. Главная практика внутри L1 `Performance Management`; без неё performance review через год становится сюрпризом (no surprises rule).

## Что должен уметь

Главный навык на уровне L5 — формулировать **growth conversations** конкретно. «Хочу расти в seniority» — не conversation, это пожелание. «Я закрываю L4-expectations через X / Y / Z; в L5 expectations N и M я ещё не закрываю — как двинуться в эту сторону на следующий квартал?» — это conversation. Без конкретики 1:1 деградируют в status, потому что говорить про абстрактный рост труднее, чем про абстрактные тикеты.

**L3**
- Приходит на 1:1 с конкретной повесткой (хотя бы 1–2 темы), а не «ну, что у тебя?»; фиксирует action items со своей стороны после встречи.
- Различает 1:1 и status update: 1:1 — про то, что **не покрыто** другими ритуалами, а не пересказ заданий из Jira.

**L4**
- Готовит focused agenda за день до 1:1: список тем (status, blockers, growth, feedback, personal); делится с собеседником заранее.
- Даёт peer-feedback после совместной работы по модели SBI — Situation / Behavior / Impact — а не «было нормально».

**L5**
- Ведёт 1:1 с менее опытным инженером или mentee: balance professional + technical + personal topics; держит «their meeting, not yours» — повестка ведомого выше повестки ведущего.
- Формулирует career growth conversations: где сейчас, куда хочется (1–2 квартала / год), какие компетенции прокачивать, конкретные next steps.
- Даёт structured feedback по SBI или radical candor (care personally + challenge directly); не сваливается ни в «ты молодец», ни в «всё плохо без обоснований».

**L6+**
- Внедряет 1:1 cadence в команде: ожидаемая частота, shared notes template, expectations для руководителя и IC; защищает 1:1 от «cancel-first».
- Связывает 1:1 с performance review cycle: 1:1 — **не** review (no surprises rule); review informed by 1:1 history, но не заменяет её.

## Материалы

### Книги

- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). Главы про 1:1, mentorship, feedback. Канонический guide для tech leads и engineering managers.
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). 1:1 со стороны staff IC — как готовиться, как использовать для влияния, как давать feedback без hierarchical authority.
- Andy Grove — **High Output Management** (Vintage, 1983). Классическая книга, где 1:1 формализован как ритуал. Grove ввёл идею «1:1 — это встреча сотрудника». До сих пор актуальна.
- Kim Scott — **Radical Candor** (St. Martin's Press, 2017). Модель feedback (care personally + challenge directly), применимая в 1:1.
- Lara Hogan — **Resilient Management** (A Book Apart, 2019). Практический guide.

### Статьи

- **[Lara Hogan — One-on-Ones Resources](https://larahogan.me/resources/one-on-ones/)**. Подборка worksheets и статей по подготовке к 1:1, формулировке feedback, «questions for our first 1:1». По моим наблюдениям, главный практический ресурс для tech leads.

### Инструменты

- **Shared notes в repo / wiki / Notion / Google Doc** — самый простой формат: один документ на пару `manager + IC`, добавляется новая секция на каждую встречу. Видим обеим сторонам, history доступна для review.
- **1:1 templates** — публичные шаблоны от GitLab handbook, Lattice, 15Five. Минимальный шаблон: previous action items / status / blockers / growth / personal / new action items.
- **[Team Health 1:1](https://github.com/fadeinflames/team-health)** — open-source платформа специально под 1:1: shared agenda, pulse-метрики (energy / load / clarity / trust), development plans. Self-hosted; полезна, когда хочется структуры между shared doc и тяжёлой коммерческой платформой.
- **Lattice / 15Five / Officevibe** — коммерческие платформы для performance management; полезны, когда команда выходит за несколько десятков 1:1 пар.

## Best practices

**Короткие правила:**

- **1:1 — встреча сотрудника, не руководителя.** Руководитель превращает 1:1 в pulled-down status update — сотрудник перестаёт нести темы, которые ему важны. Повестка ведомого приоритетнее повестки ведущего; руководитель слушает 70% времени, говорит 30%.
- **Cancel — последнее средство.** 1:1 — первое, что режется при пожарах. Через 3 месяца cancel-pattern сотрудник не несёт важные темы. Перенос внутри той же недели — норма; постоянный cancel — сигнал, что 1:1 не приоритет.
- **No surprises в performance review.** Review раз в год с feedback, который ни разу не звучал в 1:1 — перерождение feedback culture. Любой review-feedback должен быть проявлением того, что обсуждалось в 1:1 в течение цикла.

Подробнее:

**Agenda до встречи, заранее.** «Расскажи, что у тебя?» — собеседник 30 секунд формулирует темы, забывает важное. Agenda за день в shared doc: 1–2 темы от каждой стороны минимум; ad-hoc темы добавляются на встрече, но из заранее подготовленного списка. По моим наблюдениям, разница между prep'нутыми и не prep'нутыми 1:1 — это разница между «решили вопрос» и «помолчали полчаса».

**Notes сохраняются shared, не «у меня в голове».** Через неделю никто не помнит, к чему пришли; action items теряются; через квартал нельзя восстановить growth conversation. Shared doc с history — основа. Это базовая дисциплина, которая часто откладывается «у нас же доверие, зачем формальности».

**Action items с владельцем и follow-up на следующем 1:1.** «Обсудили — забыли» — если решение требует действия, явный owner, явный дедлайн (даже «к следующему 1:1»), проверка на следующей встрече первым пунктом. Без follow-up commitments теряют вес — и через 3 цикла никто не верит, что 1:1-обсуждения к чему-то ведут.

**Топики не только tactical, но и strategic.** Все 1:1 про jira-тикеты — через полгода сотрудник не понимает, как растёт; руководитель не знает, что его держит / отталкивает; performance review становится сюрпризом. Норма: каждое 1:1 — минимум одна не-tactical тема (раз в месяц глубокая growth conversation).

## Связанные листья

- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — onboardee имеет 1:1 со своим mentor еженедельно; качество 1:1 в первые 12 недель определяет churn.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — engagement contract включает 1:1 cadence между SRE и tech lead product-команды; cross-team 1:1 — паттерн партнёрства.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — обсуждение технических решений на 1:1 даёт contextual sounding board перед формальным ADR.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — feedback после инцидента не валится в Slack; 1:1 даёт безопасную приватную обратную связь.
- **[Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/)** — ladder — vocabulary growth conversations; 1:1 — ритуал, в котором ladder используется.
- **[Personal Growth Plan](/The-Way-of-SRE/leaves/practices/personal-growth-plan/)** — план обновляется на quarterly 1:1.

## Открытые вопросы

- **Performance Review Cycle** *(TBD)* — квартальный или годовой ритуал с rating, calibration, compensation discussion.
- **Goal Setting / OKRs** *(TBD)* — формальная методология постановки целей (OKR / SMART / V2MOM).
- **Skip-level 1:1s** — встреча с руководителем своего руководителя — отдельная разновидность с собственными правилами (квартал — норма).
