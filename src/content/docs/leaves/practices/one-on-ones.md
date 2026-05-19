---
title: One-on-Ones
description: Регулярные 1:1 встречи с manager / tech lead — пространство для status, обратной связи, обсуждения роста и блокеров; основа performance management
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Performance Management / One-on-Ones
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Регулярные 1:1 встречи (раз в 1–2 недели как норма) с manager или tech lead — пространство, в котором обсуждается то, что не помещается в Slack / standup / retro: личные блокеры, обратная связь, growth conversations, отношения в команде, ожидания. Основа performance management как ритуала, а не процедурного «годового ревью». Главная практика внутри L1 `Performance Management`; соседние практики (Performance Review Cycle, Goal Setting / OKRs, Career Ladders) — в «Открытых вопросах».

## Что должен уметь

- **L3** — Приходит на 1:1 с конкретной повесткой (хотя бы 1–2 темы), а не «ну, что у тебя?»; фиксирует action items со своей стороны после встречи.
- **L3** — Различает 1:1 и status update: 1:1 — про то, что **не покрыто** другими ритуалами (отношения, рост, личные блокеры), а не пересказ заданий из jira.
- **L4** — Готовит focused agenda за день до 1:1: список тем (status, blockers, growth, feedback, personal); делится с собеседником заранее.
- **L4** — Даёт peer-feedback после совместной работы (PR review, инцидент, совместный проект) по модели SBI — Situation / Behavior / Impact — а не «было нормально».
- **L5** — Ведёт 1:1 с менее опытным engineer'ом или mentee: balance professional + technical + personal topics; держит «their meeting, not yours» — повестка ведомого выше повестки ведущего.
- **L5** — Формулирует career growth conversations: где сейчас (текущий SFIA-уровень или competency framework команды), куда хочется (1-2 квартала / год), какие компетенции прокачивать, конкретные next steps.
- **L5** — Даёт structured feedback по SBI или radical candor (care personally + challenge directly); не сваливается ни в «ты молодец», ни в «всё плохо без обоснований».
- **L6+** — Внедряет 1:1 cadence в команде: ожидаемая частота (раз в 1–2 недели), shared notes template, expectations для manager'ов и IC; защищает 1:1 от «cancel-first».
- **L6+** — Связывает 1:1 с performance review cycle (квартальные / годовые рейтинги, calibration): 1:1 — это **не** performance review (no surprises rule); review informed by 1:1 history, но не заменяет её.

## Материалы

### Книги

- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). База: главы про 1:1, mentorship, feedback. Канонический guide для tech leads и engineering managers.
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Дополнительно: 1:1 со стороны staff IC — как готовиться, как использовать для влияния, как давать feedback стейкхолдерам, не имея над ними hierarchical authority.
- Andy Grove — **High Output Management** (Vintage, 1983). База: классическая книга, где 1:1 формализован как ритуал (Grove ввёл идею, что 1:1 — это **встреча сотрудника**, а не manager'а); до сих пор актуальна.
- Kim Scott — **Radical Candor** (St. Martin's Press, 2017). База: модель feedback (care personally + challenge directly), применимая в 1:1.
- Lara Hogan — **Resilient Management** (A Book Apart, 2019). Дополнительно: практический guide по 1:1, feedback, поддержке команды в kризисах.

### Статьи и руководства

- **[Lara Hogan — One-on-Ones Resources](https://larahogan.me/resources/one-on-ones/)**. База: подборка worksheets и статей по подготовке к 1:1, формулировке feedback, check-in вопросам, «questions for our first 1:1».

### Инструменты

- **Shared notes в repo / wiki / Notion / Google Doc** — самый простой формат: один документ на пару `manager + IC`, добавляется новая секция на каждую встречу с датой; видим обеим сторонам, history доступна для review цикла.
- **1:1 templates** — публичные шаблоны от GitLab handbook, Lattice, 15Five как стартовая точка. Минимальный шаблон: previous action items / status / blockers / growth / personal / new action items.
- **Lattice / 15Five / Officevibe** — коммерческие платформы для performance management; полезны, когда команда выходит за неск десятков 1:1 пар и нужен центральный hub с aggregated insights и attribution для review cycle.

## Best practices

- **1:1 — встреча сотрудника, не manager'а.** Антипаттерн: manager превращает 1:1 в pulled-down status update («расскажи, что у тебя по тикетам»). Это убивает purpose ритуала: сотрудник перестаёт нести темы, которые ему важны, потому что «спросит про jira всё равно». Повестка ведомого приоритетнее повестки ведущего; manager слушает 70% времени, говорит 30%.
- **Cancel — последнее средство.** Антипаттерн: 1:1 — первое, что режется при пожарах. Через 3 месяца такого cancel-pattern сотрудник не несёт важные темы (не успели обсудить + ждать ещё месяц = «само рассосётся»). Перенос внутри той же недели — норма, отмена с пометкой «сделаем длиннее в следующий раз» — допустимо разово, постоянный cancel — сигнал, что 1:1 не приоритет.
- **Agenda до встречи, заранее.** Антипаттерн: «расскажи, что у тебя?» — собеседник 30 секунд формулирует темы, забывает важное. Agenda за день в shared doc: 1-2 темы от каждой стороны минимум; ad-hoc темы добавляются на встрече, но из заранее подготовленного списка.
- **Notes сохраняются shared, не «у меня в голове».** Антипаттерн: ничего не пишется. Через неделю никто не помнит, к чему пришли; action items теряются; через квартал нельзя восстановить growth conversation. Shared doc с history — основа.
- **Action items с владельцем и follow-up на следующем 1:1.** Антипаттерн: «обсудили — забыли». Если решение требует действия — явный owner, явный дедлайн (даже «к следующему 1:1»), проверка на следующей встрече первым пунктом. Без follow-up commitments теряют вес.
- **Топики не только tactical (текущая работа), но и strategic (рост, отношения, ожидания, удовлетворённость).** Антипаттерн: все 1:1 про jira-тикеты. Через полгода сотрудник не понимает, как растёт; manager не знает, что его держит / отталкивает; performance review становится сюрпризом. Норма: каждое 1:1 — минимум одна не-tactical тема (раз в месяц глубокая growth conversation).
- **No surprises в performance review.** Антипаттерн: review раз в год с feedback'ом, который ни разу не звучал в 1:1. Это перерождение feedback culture: сотрудник не доверяет позитивным сигналам, потому что негативные приходят по календарю. Любой review-feedback должен быть проявлением того, что обсуждалось в 1:1 в течение цикла — без сюрпризов.

## Связанные листья

- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — onboardee имеет 1:1 со своим mentor'ом еженедельно как часть curriculum; качество 1:1 в первые 12 недель определяет engineer'ского churn.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — engagement contract включает 1:1 cadence между SRE и tech lead'ом product-команды; cross-team 1:1 — паттерн партнёрства.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — обсуждение технических решений на 1:1 даёт contextual sounding board перед формальным ADR; 1:1 — место для рanней проверки направления.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — feedback после инцидента не валится в Slack; формат 1:1 даёт безопасную приватную обратную связь, blameless соблюдается лучше.

## Открытые вопросы

- **Performance Review Cycle** *(TBD)* — квартальный или годовой ритуал с rating, calibration, compensation discussion. Соседняя практика внутри `Performance Management` L1; informed by 1:1 history, но отдельный scope.
- **Goal Setting / OKRs** *(TBD)* — формальная методология постановки целей на квартал / год (OKR / SMART / V2MOM). Соседняя практика; пересекается с 1:1 через growth conversations, но имеет самостоятельный scope.
- **Career Ladders** *(TBD)* — документированные уровни и переходы — было в «Открытых вопросах» `SRE Onboarding` и `Organisational Capability Development`; кросс-цеxовая тема между Performance Management и OCD. Возможный отдельный лист.
- **Skip-level 1:1s** — встреча с manager'ом своего manager'а — отдельная разновидность 1:1, со своими правилами и cadence (квартал — норма). Возможно подтема или отдельная заметка.
