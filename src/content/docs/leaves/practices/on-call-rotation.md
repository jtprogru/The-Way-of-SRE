---
title: On-Call Rotation
description: Организация дежурства команды — кто, когда, при каких условиях на пейджере. Баланс между coverage, fairness, sustainability и effectiveness
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / On-Call Rotation
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Организация дежурства команды: **кто** реагирует на pager, **когда**, в каком режиме (primary / secondary), при каких условиях эскалирует. Дисциплина баланса между coverage (всегда есть on-call), fairness (нагрузка распределена), sustainability (без burnout) и effectiveness (engineer на дежурстве готов реагировать). Соседняя практика к [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/): Incident Response описывает, **что происходит в момент инцидента**; On-Call Rotation описывает, **кто реагирует и в каком состоянии**. Без здоровой ротации даже идеальный incident process разваливается под burnout'ом одного-двух людей.

## Что должен уметь

- **L3** — Понимает структуру ротации своей команды (cadence, primary vs secondary, escalation paths); знает свои следующие смены; умеет принять (acknowledge) page и провести базовую triage.
- **L3** — Перед сменой выполняет короткий pre-shift review: недавние deploys, изменённые runbook'и, активные incidents-in-progress, известные хрупкие подсистемы.
- **L4** — Настраивает свой schedule в paging tool (PagerDuty / Opsgenie / Grafana OnCall); понимает escalation policy и timeouts (`acknowledge → escalate → next person`); знает, как brief заменить если внезапно недоступен.
- **L4** — Выполняет structured post-shift handoff к следующему дежурному: что было, что осталось open, что требует внимания; обновляет runbook'и по итогам нетривиальных pages.
- **L5** — Проектирует rotation для команды: cadence (неделя — норма), follow-the-sun vs single-timezone (при ≥ 6 человек в команде из разных TZ), primary / secondary roles, holidays / vacation handling, comp time.
- **L5** — Ведёт alert hygiene: еженедельный / ежемесячный review pages, удаление false positives, повышение signal-to-noise; шумная смена (≥ N pages в час, не привёдших к действию) — инцидент с постмортемом, а не норма.
- **L5** — Поддерживает on-call health: tracks sleep disruption, fair load distribution, явный recovery day после ночных pages, защищает «no hero» culture (любой pager должен быть ack'нут, не «я разобрался без alert'а»).
- **L6+** — Внедряет org-level on-call policy: who pays on-call comp (часы / деньги / day off), mandatory rest после multi-page nights, sustainability metrics (sleep disruption rate, comp pay totals, churn correlation), правила скидки нагрузки между командами.
- **L6+** — Балансирует scale: новый сервис — это новая ротация или расширение существующей? На каких критериях принимается решение (volume, expertise, ownership)? Защищает команду от unbounded expansion ротации без roster growth.

## Материалы

### Книги

- Andrea Spadaccini (ред. Betsy Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/being-on-call/)** (O'Reilly, 2016), глава 11 «Being On-Call». База: канонический Google SRE подход к on-call (sustainable cadence, ≤ 25% on-call work, расчёт ротации).
- Hannah Foxwell, Mike Lyons, Mick Jordan (ред.) — **[The Site Reliability Workbook](https://sre.google/workbook/on-call/)** (O'Reilly, 2018), глава 8 «On-Call». Продолжение SRE Book гл. 11: practical anti-patterns, on-call documentation, fairness, training новых членов команды.

### Статьи и руководства

- **[PagerDuty — Incident Response Documentation](https://response.pagerduty.com/)**. База: открытый guide по incident response с разделами Before / During / After; включает on-call best practices (handoff, escalation, comp pay rationale). Apache 2.0.
- Liz Fong-Jones — публикации и talks по теме «sustainable on-call» (SREcon доклады, статьи на honeycomb.io и других площадках). Продвинуто: аргументация за shared on-call между SRE и dev-командами как путь к лучшему code-quality и меньшему alert noise.

### Инструменты

- **[PagerDuty](https://www.pagerduty.com/)**, **[Opsgenie](https://www.atlassian.com/software/opsgenie)**, **[Grafana OnCall](https://grafana.com/products/oncall/)** — paging tools с поддержкой rotation, escalation policy, override'ов, schedule export. Стандарт индустрии.
- **iCalendar / Google Calendar import** — обязательный backup для visibility: ротация в общем календаре команды, видна manager'у и стейкхолдерам; отсутствие — частая причина «не знал, что дежурю».
- **Alert hygiene dashboards** — custom (Grafana / Prometheus) или встроенные в paging tool (PagerDuty Insights): метрики `pages per shift`, `time-to-ack`, `% actionable`, `MTTR`. Без них alert hygiene — субъективная оценка.
- **Sleep / load tracking** — простой spreadsheet или специальные инструменты (например, [Team Health 1:1](https://github.com/fadeinflames/team-health) с pulse-метриками energy/load) для отслеживания нагрузки on-call в долгую.

## Best practices

- **On-call compensation обязателен — деньги, часы или day off.** Антипаттерн: «on-call входит в зарплату». Без явной компенсации — резкое падение мотивации, ratio of senior engineers оставляющих команду растёт, оставшиеся либо burnout'ятся, либо начинают халатно реагировать. Точный механизм (overtime pay / comp time / day off after night pages) — детали; **факт явной компенсации** — обязательное условие здоровой ротации.
- **Каждый pager должен иметь runbook.** Антипаттерн: alert без runbook'а — это «разбуди человека и пусть сам думает в 3 утра». Через 6 месяцев такой alert игнорируется или удаляется без обсуждения. Если runbook'а нет, alert либо немедленно удаляется (false positive по факту), либо ставится в backlog с явным дедлайном «runbook будет написан, иначе мы удалим этот alert».
- **Rotation 1 неделя — norm для большинства команд.** Антипаттерн с одной стороны: 2-week rotation = burnout (две недели подряд под pager'ом). Антипаттерн с другой: daily rotation = no learning (engineer не видит patterns между днями, hand-off overhead сжирает время). Eженедельная ротация — sweet spot: достаточно времени для recovery между сменами, достаточно continuity для observability за неделю.
- **Pre-shift review обязателен.** Антипаттерн: cold start на ночные pages без понимания контекста. Перед сменой engineer тратит 15-30 минут на review: что задеплоено за неделю, какие incidents активны, какие changes ожидаются в смене, какие runbook'и обновились. Без pre-shift engineer тратит первые 15 минут pages на orientation вместо response.
- **Post-shift retrospection — короткая, но обязательная.** Антипаттерн: «прошло, забыли». Без retrospection systemic problems (повторяющиеся alerts, missing runbooks, плохие deploys в нерабочее время) накапливаются. Минимум — короткий handoff message: что произошло, что осталось open, что насторожило. Раз в месяц — командная ретроспектива on-call quality.
- **Alert hygiene — еженедельный ритуал, не «когда-нибудь».** Антипаттерн: false positives накапливаются «ну подождём, может перестанет». Каждую неделю — review pages за неделю: какие были actionable, какие нет, какие требуют изменения порога / удаления / переноса в ticket. Шумная смена (≥ N non-actionable pages за смену) — инцидент с явным следствием.
- **«No hero» culture: любой pager должен быть ack'нут.** Антипаттерн: «я заметил проблему до того, как алерт пришёл, разобрался сам». Это лишает команду visibility, нарушает audit trail, и через 6 месяцев один engineer становится bottleneck'ом. Любая выявленная проблема либо ack'ается через pager, либо логируется как incident, либо превращается в action item на улучшение алертинга.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — Incident Response — что в момент; On-Call Rotation — кто реагирует. Качество rotation прямо влияет на качество response (отдохнувший engineer реагирует лучше, чем burnout'ный).
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — качество alerting определяет on-call sustainability: hi signal/noise → low fatigue → engineer готов к настоящим инцидентам. SLO-based alerting + on-call rotation — пара, друг без друга не работают.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook на каждый pager — обязательное условие здоровой ротации; «runbook-first» policy предотвращает на 50% классы on-call burnout'а.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — шумные / тяжёлые on-call смены — кандидаты на постмортем, не «норма». Анализ через blameless-разбор повышает quality системы и rotation одновременно.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — supervised on-call как мост от curriculum'а к самостоятельной ротации; new engineer не дежурит solo до явного go-live от mentor'а.
- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — discussion on-call health на 1:1 — встроенный sustainability check; tactical и personal topics обсуждаются раньше, чем engineer уходит в churn.

## Открытые вопросы

- **Severity Classification & Escalation Policy** *(TBD)* — уже упоминалось в `Incident Response`. Детализация: SEV-1/2/3/4 c явными critеria, кто эскалируется на каждом уровне (включая manager / VP / executive), какие decisions требуют approval'а. Соседняя практика; возможно отдельный лист или раздел текущего.
- **Customer Communications в инциденте** *(TBD)* — уже упоминалось в `Incident Response`. Template для status page, регуляторные требования (data breach disclosure timelines), как Comms Lead играет роль. Возможный сосед.
- **On-Call Comp Models** — конкретные модели (per-page payment, flat shift rate, comp time, hybrid) — самостоятельная подтема, потенциально часть раздела «Материалы / Инструменты» углублённой версии.
- **Follow-the-Sun Logistics** — рекомендуется при ≥ 6 человек в команде из разных TZ; детали handoff'а между регионами, language barriers, cultural differences — самостоятельная подтема.
- **Alert Fatigue Management** *(TBD)* — уже упоминалось в `SLI-based Alerting`. Тема на стыке Observability и On-Call Rotation: измерение, диагностика, систематическое снижение alert fatigue. Возможный кросс-цеxовой лист.
