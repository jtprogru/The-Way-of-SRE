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

Главный навык на уровне L4 — **измерять качество алертов**, не «у нас вроде нормально». Actionable rate (% pages с реальным действием), alerts/week, time-to-ack p50/p99, MTTR per alert type — это базовый набор. Без чисел невозможно установить target, увидеть ухудшение, объяснить менеджменту, почему нужно инвестировать в alert hygiene.

**L3**
- Различает actionable alert (требует немедленного действия) и informational; знает, что noisy on-call смена — операционная проблема, не норма.
- После своей смены отчитывается о quality: какие alerts были actionable, какие false-positive, какие требовали ненужную escalation.

**L4**
- Измеряет alert quality для своего сервиса: alerts/week, **actionable rate**, time-to-ack p50/p99, MTTR per alert type.
- Удаляет / молчит alerts без runbook или повторяющиеся false-positive (с явным owner и дедлайном «либо исправлен root cause, либо удалён»).

**L5**
- Проектирует team-level alert review ritual: еженедельно или раз в две недели, что обсуждается, какие решения принимаются; ritual интегрирован с SLO Review и постмортемами.
- Реализует шумоподавление на уровне Alertmanager: `group_by` для batch'инга, `inhibition` rules (если упал A, не пейджи об B/C/D зависимостях), silencing для known issues с TTL.
- Связывает повторяющиеся alerts с auto-remediation: где alert срабатывает регулярно и runbook известный — кандидат на automation.

**L6+**
- Внедряет org-level alert hygiene: cross-team метрики (alerts per oncaller, fatigue index, churn correlation), SLO для самого алертинга («≥ 95% pages actionable»).
- Балансирует sensitivity vs noise: при каких условиях допустима меньшая sensitivity vs обязательная high sensitivity (payment-critical).

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/practical-alerting/)** (O'Reilly, 2016), глава 10 «Practical Alerting». Time-series alerting, white-box vs black-box, threshold-with-duration. «May the queries flow, and the pager stay silent» — традиционное SRE-благословение.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/alerting-on-slos/)** (O'Reilly, 2018), глава 5 «Alerting on SLOs». Multi-window multi-burn-rate как способ снизить false-positive rate.

### Статьи

- **[Prometheus Alertmanager — Configuration](https://prometheus.io/docs/alerting/latest/configuration/)**. Документация по grouping, inhibition, silencing — три основных механизма управления шумом.
- Fred Hebert / Honeycomb — **[How We Manage Incident Response](https://www.honeycomb.io/blog/incident-response-at-honeycomb)**. Про то, во что реально обходится реагирование в небольшой команде — инженерное время, переключения контекста, износ дежурных; отсюда же следует, что гигиена алертов окупается не «качеством мониторинга», а сохранёнными людьми.

### Инструменты

- **Prometheus Alertmanager** — встроенные механизмы: **grouping** (batch related alerts), **inhibition** (A inhibits B по labels), **silencing** (TTL-based mute для known issues), **routing tree** (severity-based routing — `critical` → пейджер, `warning` → тикет).
- **PagerDuty Insights / Opsgenie Analytics** — встроенные метрики качества алертинга: pages per oncaller, time-to-ack, % actionable, repeat offenders. По моим наблюдениям, в командах, использующих PagerDuty/Opsgenie, эти dashboards чаще остаются непросмотренными, чем используются — стоит хотя бы раз в квартал открывать.
- **Custom alert quality dashboards** в Grafana: actionable rate per service, alerts/week trend, time-to-ack distribution, top noisy alerts. Без них — субъективная оценка.
- **Auto-remediation orchestration** — AWS Lambda / Argo Workflow / StackStorm — runtime для автоматических ответов на повторяющиеся alerts.

## Best practices

Начинать приходится с измерения. Скучно, зато без чисел улучшения невозможны в принципе: нечего поставить как target, не видно ухудшения, нечем объяснить менеджменту, почему на разгребание алертов надо потратить спринт вместо фич. Минимум — actionable rate per service и alerts/week trend, review раз в месяц. Что измеряют, то и чинят.

Alert без runbook либо получает runbook, либо удаляется. Третьего состояния нет. Через полгода такой alert либо забыт всеми, либо пейджит ночью, и инженер тратит тридцать минут просто на то, чтобы понять, что это вообще было и стоит ли на это реагировать. На review каждый alert уходит в одну из двух корзин: runbook плюс owner, или дедлайн на mute / delete.

Grouping и inhibition в распределённой системе — не тюнинг, а условие выживания. Один инцидент превращается в 50 PagerDuty pings, потому что задымил каждый микросервис, и первые пятнадцать минут response уходят на разгребание шума вместо диагностики. `group_by` в Alertmanager собирает related в один пакет. `inhibition` («упала DB — не пейджи о connection errors во всех сервисах») сводит те же 50 pages к одной-двум диагностическим.

**Actionable rate ≥ 95% — реалистичный target для зрелого алертинга.** Я регулярно вижу, как 50% false-positive принимают за норму. На таком уровне инженер перестаёт верить alerts, ack'ает на автомате и пропускает реальные инциденты. Каждый non-actionable alert — это либо false positive (лечится тюнингом), либо informational (переезжает в тикеты), либо известный неисправленный baseline issue. 95% — не «недостижимый идеал», а baseline, под который вырастают постепенно.

**Alert review ritual еженедельно или раз в две недели, не «после инцидента подумаем».** По моим наблюдениям, команды, которые обсуждают alerts только после крупного инцидента, доходят до выгорания первыми. К этому моменту команда уже на грани, и качество реакции падает вместе с ней. Нормальный ритм — раз в неделю или в две: что прилетело, что было false-positive, что требует fix, что удаляем. Хоть куском sprint retro, хоть отдельным получасом.

**Hysteresis и dampening в threshold, а не «бегущий пейджер».** Alert срабатывает каждые пять минут, потому что система ходит туда-обратно около границы, и инженер получает 12 pages в час об одном и том же событии, которое само себя чинит между срабатываниями. Лечится тремя стандартными приёмами. Hysteresis: загорается на A%, тушится на A-N%. Dampening: минимальный sustained interval перед alert. Плюс `for: 5m` в Prometheus.

**Повторяющийся alert с известным runbook — кандидат на автоматизацию, а не на ротацию.** Он срабатывает пять раз в неделю, инженер выполняет три шага из runbook, за год набегают сотни часов на «нажать кнопку». Дальше просто. Реализуется через Lambda, operator или workflow, а на review alert исключается из ротации после verification. Это самый эффективный способ снижения toil из всех, что я наблюдал.

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — alert design. Без правильного SLI-based дизайна (multi-window burn rate, симптомы а не причины) даже идеальная alert hygiene не спасёт.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — где fatigue manifests; alert hygiene — основной инструмент защиты sustainable on-call. Этот лист и On-Call Rotation — пара.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — каждый alert ведёт к runbook; качество runbook определяет actionability alert.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — alert fatigue — крупный класс toil; tracking ловит signal «слишком много manual response → automate».
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — noisy on-call смена — кандидат на постмортем (системная проблема, не «норма»).
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLO для алертинга как мета-практика («≥ 95% pages actionable»).
- **[Symptom vs Cause Alerting](/The-Way-of-SRE/leaves/engineering/symptom-vs-cause-alerting/)** — alert hygiene начинается с правильного выбора что алертить: symptom-side reduces false-positive rate в принципе, не post-hoc.

## Открытые вопросы

Самая большая дыра — **Auto-Remediation Patterns** *(TBD)*: детальные паттерны на Lambda, k8s operator и Argo Workflow есть, а внятного ответа, как автоматизировать прогрессивно и безопасно, у меня нет.

Ещё два долга поменьше. **Alert Routing & Escalation Patterns** — детализация Alertmanager routing trees и criticality levels (SHEDDABLE / CRITICAL_PLUS из SRE Book гл. 21). И **Maintenance Window / Silencing Practices**: как делать planned silences без потери visibility и не копить вечные silence без TTL.
