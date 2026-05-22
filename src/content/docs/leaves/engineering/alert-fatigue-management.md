---
title: Alert Fatigue Management
description: Систематическое снижение alert fatigue — actionable rate, review ritual, шумоподавление
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Observability / Alert Fatigue Management
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Я регулярно вижу команды, у которых 200+ active алертов в Prometheus и actionable rate ниже 30%. Это симптом, не норма. [Alert fatigue](/The-Way-of-SRE/glossary/#alert-fatigue) — операционная проблема, которую можно измерить (alerts/week, actionable rate, time-to-ack) и можно лечить (review ritual, grouping/inhibition в Alertmanager, auto-remediation). Лист — про это лечение. Соседний к [SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/) под L1 `Observability`; вместе с [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/) формируют тройку **design (SLI-based) → measure & reduce (Alert Fatigue) → cope (On-Call)** для здорового алертинга.

## Что должен уметь

Главный навык на уровне L4 — **измерять качество алертов**, не «у нас вроде нормально». Actionable rate (% pages с реальным действием), alerts/week, time-to-ack p50/p99, MTTR per alert type — это базовый набор. Без чисел невозможно установить target, увидеть deterioration, объяснить менеджменту, почему нужно инвестировать в alert hygiene.

- **L3** — Различает actionable alert (требует немедленного действия) и informational; знает, что noisy on-call смена — операционная проблема, не норма.
- **L3** — После своей смены отчитывается о quality: какие alerts были actionable, какие false-positive, какие требовали unnecessary escalation.
- **L4** — Измеряет alert quality для своего сервиса: alerts/week, **actionable rate**, time-to-ack p50/p99, MTTR per alert type.
- **L4** — Удаляет / молчит alerts без runbook или повторяющиеся false-positive (с явным owner и дедлайном «либо исправлен root cause, либо удалён»).
- **L5** — Проектирует team-level alert review ritual: weekly или biweekly, что обсуждается, какие decisions принимаются; ritual интегрирован с SLO Review и постмортемами.
- **L5** — Реализует Alertmanager-уровень шумоподавление: `group_by` для batch'инга, `inhibition` rules (если упал A, не пейджи об B/C/D зависимостях), silencing для known issues с TTL.
- **L5** — Связывает повторяющиеся alerts с auto-remediation: где alert срабатывает регулярно и runbook известный — кандидат на automation.
- **L6+** — Внедряет org-level alert hygiene: cross-team метрики (alerts per oncaller, fatigue index, churn correlation), SLO для самого алертинга («≥ 95% pages actionable»).
- **L6+** — Балансирует sensitivity vs noise: при каких условиях допустима меньшая sensitivity vs обязательная high sensitivity (payment-critical).

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/practical-alerting/)** (O'Reilly, 2016), глава 10 «Practical Alerting». Time-series alerting, white-box vs black-box, threshold-with-duration. «May the queries flow, and the pager stay silent» — традиционное SRE-благословение.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/alerting-on-slos/)** (O'Reilly, 2018), глава 5 «Alerting on SLOs». Multi-window multi-burn-rate как способ снизить false-positive rate.

### Статьи

- **[Prometheus Alertmanager — Configuration](https://prometheus.io/docs/alerting/latest/configuration/)**. Документация по grouping, inhibition, silencing — три основных механизма управления шумом.
- Charity Majors / Honeycomb — **[The Cost of Incident Response](https://www.honeycomb.io/blog/the-cost-of-incident-response)**. Argues что incident response costs реальные деньги (engineering time, opportunity cost, burnout); structured alert hygiene = investment в reducing cost-per-incident.

### Инструменты

- **Prometheus Alertmanager** — встроенные механизмы: **grouping** (batch related alerts), **inhibition** (A inhibits B по labels), **silencing** (TTL-based mute для known issues), **routing tree** (severity-based routing — `critical` → пейджер, `warning` → тикет).
- **PagerDuty Insights / Opsgenie Analytics** — встроенные метрики качества алертинга: pages per oncaller, time-to-ack, % actionable, repeat offenders. По моим наблюдениям, в командах, использующих PagerDuty/Opsgenie, эти dashboards чаще остаются непросмотренными, чем используются — стоит хотя бы раз в квартал открывать.
- **Custom alert quality dashboards** в Grafana: actionable rate per service, alerts/week trend, time-to-ack distribution, top noisy alerts. Без них — субъективная оценка.
- **Auto-remediation orchestration** — AWS Lambda / Argo Workflow / StackStorm — runtime для автоматических ответов на повторяющиеся alerts.

## Best practices

**Короткие правила:**

- **Measure alert quality — what gets measured gets fixed.** Без чисел улучшения невозможны: невозможно установить target, увидеть deterioration, объяснить менеджменту необходимость инвестиций. Минимум: actionable rate per service, alerts/week trend; review ежемесячно.
- **No-runbook alert либо получает runbook, либо удаляется.** Через 6 месяцев alert без runbook либо забывается, либо пейджит — engineer тратит 30 минут на разбор, чтобы понять, что это. Каждый alert на review получает либо runbook + owner, либо deadline на mute / delete.
- **Alert grouping и inhibition rules обязательны для distributed систем.** Один инцидент → 50 PagerDuty pings (каждый микросервис задымил) — engineer тонет в шуме первые 15 минут response. `group_by` в Alertmanager batch'ит related; `inhibition` («если упал DB, не пейджи о connection errors во всех сервисах») сводит 50 pages к 1–2 диагностическим.

Подробнее:

**Actionable rate ≥ 95% — реалистичный target для зрелого алертинга.** Я регулярно вижу 50% false-positive принимаемым как норма. На таком уровне engineer перестаёт верить alerts, ack'ает на автомате, пропускает реальные инциденты. Каждый non-actionable alert — это либо false positive (fixable through tuning), либо informational (move to ticket), либо известный неисправленный baseline issue. 95% — не «недостижимый идеал», а зрелый baseline, под который надо постепенно вырастать.

**Alert review ritual еженедельно или biweekly, не «после инцидента подумаем».** По моим наблюдениям, команды, которые обсуждают alerts только после крупного инцидента, доходят до выгорания первыми. К моменту крупного инцидента команда уже на грани, и качество response падает. Норма: weekly или biweekly review — что было за неделю, какие false-positive, какие требуют fix, какие удаляются. Часть sprint retro или отдельный 30-минутный ритуал.

**Hysteresis / dampening в threshold, не «бегущий пейджер».** Alert срабатывает каждые 5 минут — система около границы threshold, переходит туда-обратно. Engineer получает 12 pages/час о том же. Hysteresis (alert загорается на A%, тушится на A-N%), dampening (минимальный sustained interval перед alert), `for: 5m` clause в Prometheus — стандартные техники против edge oscillation. Базовая гигиена.

**Auto-remediation для повторяющихся alerts — путь к удалению alert из ротации.** Alert срабатывает 5 раз в неделю, engineer выполняет 3-шаговый runbook — за год потрачены сотни часов на «нажать кнопку», alert остаётся в ротации. Повторяющийся alert + известный runbook = automation candidate; реализуется через Lambda / operator / workflow; на review исключается из rotation после verification. Это самый эффективный способ снижения toil из всех, что я наблюдал.

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — alert design. Без правильного SLI-based дизайна (multi-window burn rate, симптомы а не причины) даже идеальная alert hygiene не спасёт.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — где fatigue manifests; alert hygiene — основной инструмент защиты sustainable on-call. Этот лист и On-Call Rotation — пара.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — каждый alert ведёт к runbook; качество runbook определяет actionability alert.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — alert fatigue — крупный класс toil; tracking ловит signal «слишком много manual response → automate».
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — noisy on-call смена — кандидат на постмортем (системная проблема, не «норма»).
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLO для алертинга как мета-практика («≥ 95% pages actionable»).

## Открытые вопросы

- **Symptom vs Cause Alerting** *(TBD)* — подтема alert design, пересекается с Alert Fatigue Management через symptom-based reduces false-positive rate.
- **Auto-Remediation Patterns** *(TBD)* — детальные паттерны (Lambda / k8s operator / Argo Workflow); как safely прогрессивно автоматизировать.
- **Alert Routing & Escalation Patterns** — детализация Alertmanager routing trees, criticality levels (SHEDDABLE / CRITICAL_PLUS из SRE Book гл. 21).
- **Maintenance Window / Silencing Practices** — как правильно делать planned silences без потери visibility; TTL hygiene.
