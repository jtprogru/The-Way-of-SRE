---
title: Alert Fatigue Management
description: Систематическое измерение, диагностика и снижение alert-fatigue — actionable rate, alert review ritual, grouping/inhibition/auto-remediation. Шум вытесняет сигнал
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Observability / Alert Fatigue Management
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Дисциплина систематического **измерения**, **диагностики** и **снижения** alert fatigue — состояния, когда команда теряет способность отличать актуальные сигналы от шума. Без deliberate management шум вытесняет signal: важные алерты тонут в потоке false-positives и known-issues, response time растёт, доверие к alerting падает. Соседний к [SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/) под L1 `Observability`; вместе с [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/) формируют тройку **design (SLI-based) → measure & reduce (Alert Fatigue) → cope (On-Call)** для здорового alerting'а.

## Что должен уметь

- **L3** — Различает actionable alert (требует немедленного действия) и informational (нужен для контекста, не для пейджа); знает, что noisy on-call смена — операционная проблема, не норма.
- **L3** — После своей смены отчитывается о quality: какие alerts были actionable, какие — false-positive, какие требовали unnecessary escalation; фиксирует это в weekly review.
- **L4** — Измеряет alert quality для своего сервиса: alerts/week, **actionable rate** (% pages с реальным действием), time-to-ack p50/p99, MTTR per alert type; basic dashboards в Prometheus/Grafana или PagerDuty Insights.
- **L4** — Удаляет / молчит alerts без runbook'а или повторяющиеся false-positive (с явным owner'ом и дедлайном на «либо исправлен root cause, либо удалён»); не оставляет «возможно ещё пригодится».
- **L5** — Проектирует team-level alert review ritual: weekly или biweekly, формализованный (что обсуждается, какие decisions принимаются); ritual интегрирован с SLO Review и postmortems.
- **L5** — Реализует Alertmanager-уровень шумоподавление: `group_by` для batch'инга related alerts, `inhibition` rules (если упал A, не пейджи об B/C/D зависимостях), silencing для known issues с TTL; настраивает severity routing — `critical` → page, `warning` → ticket.
- **L5** — Связывает повторяющиеся alerts с auto-remediation: где alert срабатывает регулярно и runbook известный — кандидат на automation (Lambda / k8s operator / Argo Workflow); auto-remediation = path к удалению alert'а из ротации.
- **L6+** — Внедряет org-level alert hygiene: cross-team метрики (alerts per oncaller, fatigue index, churn correlation), escalation patterns анализ, sustainability tracking; SLO для самого alerting'а («≥ 95% pages actionable», «p99 time-to-ack < N минут»).
- **L6+** — Балансирует sensitivity vs noise: при каких условиях допустима меньшая sensitivity (low-priority service) vs обязательная high sensitivity (payment-critical); явная политика, документированная.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/practical-alerting/)** (O'Reilly, 2016), глава 10 «Practical Alerting». База: time-series alerting, white-box vs black-box monitoring, threshold-with-duration для предотвращения flapping. «May the queries flow, and the pager stay silent» — традиционное SRE-благословение.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/alerting-on-slos/)** (O'Reilly, 2018), глава 5 «Alerting on SLOs». База: multi-window multi-burn-rate как канонический способ снизить false-positive rate; математика отделения signal от noise через SLO.

### Статьи

- **[Prometheus Alertmanager — Configuration](https://prometheus.io/docs/alerting/latest/configuration/)**. База: документация по grouping (`group_by`, `group_wait`, `group_interval`), inhibition rules (alert A inhibits alert B при заданных matchers), silencing — три основных механизма управления шумом на уровне Alertmanager.

### Инструменты

- **Prometheus Alertmanager** — встроенные механизмы: **grouping** (batch related alerts), **inhibition** (A inhibits B по labels), **silencing** (TTL-based mute для known issues), **routing tree** (severity-based routing — `critical` → pager, `warning` → ticket).
- **PagerDuty Insights / Opsgenie Analytics** — метрики качества alerting'а: pages per oncaller, time-to-ack, % actionable, repeat offenders. Встроены в коммерческие paging tools.
- **Custom alert quality dashboards** в Grafana: actionable rate per service, alerts/week trend, time-to-ack distribution, top noisy alerts. Без них — субъективная оценка, не management.
- **Auto-remediation orchestration** — AWS Lambda / Argo Workflow / StackStorm — runtime для автоматических ответов на повторяющиеся alerts; превращает «alert + runbook» в «automated action», убирает alert из ротации.
- **Pulse-surveys** на on-call health (тот же подход, что в `One-on-Ones` / `Team Health 1:1`) — субъективная оценка fatigue, дополняет объективные метрики.

## Best practices

- **Measure alert quality — what gets measured gets fixed.** Антипаттерн: «у нас вроде нормально с алертами». Без чисел улучшения невозможны: невозможно установить target, невозможно увидеть deterioration, невозможно объяснить менеджменту, почему нужно инвестировать в alert hygiene. Минимум: actionable rate per service, alerts/week trend; review ежемесячно.
- **Actionable rate ≥ 95% — реалистичный target для зрелого alerting'а.** Антипаттерн: 50% false-positive принимается как норма. На таком уровне engineer перестаёт верить alerts, ack'ает на автомате, пропускает реальные инциденты. Каждый non-actionable alert — это либо false positive (fixable through tuning), либо informational (move to ticket), либо известный неисправленный baseline issue (fix the underlying issue).
- **No-runbook alert либо получает runbook, либо удаляется.** Антипаттерн: «потом напишем runbook». Через 6 месяцев alert либо забывается (никто не реагирует), либо пейджит — engineer тратит 30 минут на разбор, чтобы понять, что это и как. Каждый alert на review получает либо runbook + owner, либо deadline на mute / delete (явный, в трекере).
- **Alert grouping и inhibition rules обязательны для distributed систем.** Антипаттерн: один инцидент → 50 PagerDuty pings (каждая микросервис задымила). Engineer тонет в шуме первые 15 минут response'а. `group_by` в Alertmanager batch'ит related; `inhibition` правила («если упал DB, не пейджи о connection errors во всех сервисах») сводят 50 pages к 1-2 диагностическим. Без них любой incident = alert storm.
- **Hysteresis / dampening в threshold'ах, не «бегущий пейджер».** Антипаттерн: alert срабатывает каждые 5 минут — система около границы threshold, переходит туда-обратно. Engineer получает 12 pages/час «о том же». Hysteresis (alert загорается на A%, тушится на A-N%), dampening (минимальный sustained interval перед alert), `for: 5m` clause в Prometheus — стандартные техники против edge oscillation.
- **Alert review ritual еженедельно или biweekly, не «после инцидента подумаем».** Антипаттерн: alerts обсуждаются только после крупного incident'а («почему столько шума было?»). К этому моменту команда уже выгорела. Norma: weekly или biweekly review — что было за неделю, какие false-positive, какие требуют fix, какие удаляются. Часть sprint retro или отдельный 30-минутный ритуал.
- **Auto-remediation для повторяющихся alerts — путь к удалению alert'а из ротации.** Антипаттерн: alert срабатывает 5 раз в неделю, engineer выполняет 3-шаговый runbook. Через год потрачены сотни часов на «нажать кнопку», alert остаётся в ротации. Norma: повторяющийся alert + известный runbook = automation candidate; реализуется через Lambda / operator / workflow; на review исключается из rotation после verification.

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — alert design. Без правильного SLI-based design (multi-window burn rate, симптомы а не причины) даже идеальный alert hygiene не спасёт — будут шуметь корректно настроенные false-positive.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — где fatigue manifests (engineer на смене страдает); alert hygiene — основной инструмент защиты sustainable on-call. Этот лист и On-Call Rotation — пара.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — каждый alert ведёт к runbook'у (best practice пересекается); качество runbook'а определяет actionability alert'а.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — alert fatigue — крупный класс toil; tracking ловит signal «слишком много manual response → automate». Auto-remediation = toil-reduction action.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — noisy on-call смена — кандидат на постмортем (системная проблема, не «норма»); постмортем порождает action items по alert hygiene.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLO для alerting'а как мета-практика («≥ 95% pages actionable») — output этого листа становится SLO для самого процесса alerting'а.

## Открытые вопросы

- **Symptom vs Cause Alerting** *(TBD)* — упоминалось в open questions у `SLI-based Alerting`. Подтема alert design'а; пересекается с Alert Fatigue Management через root-cause-driven alerts vs symptom-driven (symptom-based reduces false-positive rate).
- **Auto-Remediation Patterns** *(TBD)* — детальные паттерны (Lambda / k8s operator / Argo Workflow / StackStorm); как safely прогрессивно автоматизировать; rollback при auto-remediation failure. Соседняя практика.
- **Alert Routing & Escalation Patterns** — детализация Alertmanager routing trees, criticality levels (SHEDDABLE / CRITICAL_PLUS из SRE Book гл. 21), escalation timing — самостоятельная подтема.
- **Maintenance Window / Silencing Practices** — как правильно делать planned silences без потери visibility; TTL hygiene; alert resumption после maintenance — отдельная mini-practice.
- **Real-time vs Synthetic monitoring** — уже упоминалось в `SLO Engineering` open questions; пересекается с Alert Fatigue (synthetic checks даёт цельные signals vs noisy real-time).
