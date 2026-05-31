---
title: On-Call Rotation
description: Организация дежурства команды — кто, когда, под каким режимом; баланс coverage / fairness / sustainability
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / On-Call Rotation
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«[On-call](/The-Way-of-SRE/glossary/#on-call) входит в зарплату» — позиция, которую я регулярно слышу от компаний без явной on-call compensation, и одна из самых сильных причин churn senior-инженеров. Дежурство — это работа в нерабочее время; без явной компенсации (деньги / часы / day off) ratio of senior-инженеров, оставляющих команду, растёт линейно, а оставшиеся либо выгорают, либо начинают халатно реагировать. On-Call Rotation — это **дисциплина баланса** между coverage (всегда есть on-call), fairness (нагрузка распределена), sustainability (без burnout) и effectiveness (инженер на дежурстве готов реагировать). Без здоровой ротации даже идеальный incident response разваливается под burnout одного-двух людей.

## Что должен уметь

Главный навык на уровне L5 — **поддерживать on-call health** как метрику, а не «когда заметим». Sleep disruption rate, comp pay totals, fair load distribution — это объективные сигналы, которые видны до того, как инженер уходит. «No hero» culture (любой pager должен быть ack'нут, не «я разобрался без alert'а») — это часть этой дисциплины: без visibility один инженер становится bottleneck, и команда не видит проблем до его ухода.

**L3**
- Понимает структуру ротации команды (cadence, primary vs secondary, escalation paths); знает свои следующие смены; принимает (acknowledge) page и проводит базовую triage.
- Перед сменой выполняет короткий pre-shift review: недавние deploys, изменённые runbook, активные incidents-in-progress, известные хрупкие подсистемы.

**L4**
- Настраивает свой schedule в paging tool; понимает escalation policy и timeouts (acknowledge → escalate → next person); знает, как brief заменить если внезапно недоступен.
- Выполняет structured post-shift handoff: что было, что осталось open, что требует внимания; обновляет runbook по итогам нетривиальных pages.

**L5**
- Проектирует rotation: cadence (неделя — норма), follow-the-sun vs single-timezone, primary / secondary roles, holidays / vacation handling, comp time.
- Ведёт alert hygiene: еженедельный / ежемесячный review pages, удаление false positives, повышение signal-to-noise; шумная смена (≥ N pages в час, не привёдших к действию) — инцидент с постмортемом.
- Поддерживает on-call health: tracks sleep disruption, fair load distribution, явный recovery day после ночных pages, защищает «no hero» culture.

**L6+**
- Внедряет org-level on-call policy: who pays on-call comp, mandatory rest после multi-page nights, sustainability metrics, правила скидки нагрузки между командами.
- Балансирует scale: новый сервис — это новая ротация или расширение существующей? Защищает команду от unbounded expansion ротации без roster growth.

## Материалы

### Книги

- Andrea Spadaccini (ред. Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/being-on-call/)** (O'Reilly, 2016), глава 11 «Being On-Call». Канонический Google SRE подход (sustainable cadence, ≤ 25% on-call work, расчёт ротации).
- Hannah Foxwell, Mike Lyons, Mick Jordan (ред.) — **[The Site Reliability Workbook](https://sre.google/workbook/on-call/)** (O'Reilly, 2018), глава 8. Practical anti-patterns, on-call documentation, fairness, training новых членов команды.

### Статьи и руководства

- **[PagerDuty — Incident Response Documentation](https://response.pagerduty.com/)**. Открытый guide с разделами Before / During / After; включает on-call best practices (handoff, escalation, comp pay rationale). Apache 2.0.
- Liz Fong-Jones — публикации и talks по теме «sustainable on-call» (SREcon, honeycomb.io). Аргументация за shared on-call между SRE и dev как путь к лучшему code-quality.

### Инструменты

- **[PagerDuty](https://www.pagerduty.com/)**, **[Opsgenie](https://www.atlassian.com/software/opsgenie)**, **[Grafana OnCall](https://grafana.com/products/oncall/)** — paging tools с поддержкой rotation, escalation policy, override, schedule export. Стандарт индустрии.
- **iCalendar / Google Calendar import** — обязательный backup для visibility: ротация в общем календаре команды; отсутствие — частая причина «не знал, что дежурю».
- **Alert hygiene dashboards** — custom (Grafana / Prometheus) или встроенные в paging tool: метрики `pages per shift`, `time-to-ack`, `% actionable`, `MTTR`. Без них alert hygiene — субъективная оценка.
- **Sleep / load tracking** — простой spreadsheet или специальные инструменты (например, [Team Health 1:1](https://github.com/fadeinflames/team-health) с pulse-метриками) для отслеживания нагрузки в долгую.

## Best practices

**Короткие правила:**

- **On-call compensation обязателен — деньги, часы или day off.** Без явной компенсации resentful drift среди senior-инженеров; точный механизм — детали, но **факт явной компенсации** — обязательное условие здоровой ротации.
- **Каждый pager должен иметь runbook.** Alert без runbook = «разбуди и пусть сам думает в 3 ночи». Через 6 месяцев такой alert игнорируется или удаляется без обсуждения.
- **Rotation 1 неделя — норма для большинства команд.** 2-week rotation = burnout; daily rotation = no learning + hand-off overhead. Еженедельная — sweet spot.

Подробнее:

**Pre-shift review обязателен.** Cold start на ночные pages без понимания контекста — инженер тратит первые 15 минут pages на orientation вместо response. Перед сменой 15–30 минут на review: что задеплоено за неделю, какие incidents активны, какие changes ожидаются, какие runbook обновились. Я регулярно вижу команды без pre-shift — у них MTTR в начале смены значительно выше.

**Post-shift retrospection — короткая, но обязательная.** «Прошло, забыли» — systemic problems (повторяющиеся alerts, missing runbooks, плохие deploys в нерабочее время) накапливаются. Минимум — короткий handoff message: что произошло, что осталось open, что насторожило. Раз в месяц — командная ретроспектива on-call quality. Без этого alert fatigue растёт незаметно.

**Alert hygiene — еженедельный ритуал, не «когда-нибудь».** False positives накапливаются «ну подождём, может перестанет». Каждую неделю — review pages: какие были actionable, какие нет, какие требуют изменения порога / удаления / переноса в ticket. Шумная смена (≥ N non-actionable pages за смену) — инцидент с явным следствием.

**«No hero» culture: любой pager должен быть ack'нут.** «Я заметил проблему до того, как alert пришёл, разобрался сам» лишает команду visibility, нарушает журнал аудита, и через 6 месяцев один инженер становится bottleneck. Это политическая позиция, которую защищает team lead — без неё team health деградирует незаметно для всех, кроме hero.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — Incident Response — что в момент; On-Call Rotation — кто реагирует и в каком состоянии.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — качество alerting определяет sustainability. SLO-based alerting + on-call rotation — пара.
- **[Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/)** — measure & reduce. Пара к этому листу для здорового алертинга.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook на каждый pager — обязательное условие здоровой ротации.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — шумные / тяжёлые on-call смены — кандидаты на постмортем.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — supervised on-call как мост от curriculum к самостоятельной ротации.
- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — discussion on-call health на 1:1 — встроенный sustainability check.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — `/oncall`, `/escalate`, `/page` через chat — стандартные ChatOps queries и actions для on-call workflow.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/)** — game day с participation новых on-call инженеров — основная подготовка перед первой неделей; снижает MTTR и тревожность.

## Открытые вопросы

- **Severity Classification & Escalation Policy** — уже выделена в отдельный лист.
- **On-Call Comp Models** — конкретные модели (per-page payment, flat shift rate, comp time, hybrid).
- **Follow-the-Sun Logistics** — рекомендуется при ≥ 6 человек в команде из разных TZ; handoff между регионами, language barriers.
