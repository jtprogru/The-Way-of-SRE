---
title: Severity Classification & Escalation
description: Рамка для измерения «насколько серьёзный инцидент» через impact × scope и связанные с этим правила эскалации. Не «громкость крика», а конкретные критерии — какой пейджит, кого вовлекать, как часто общаться с клиентами, какой постмортем требуется
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / Severity Classification & Escalation
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Рамка, через которую измеряется «насколько серьёзный инцидент»: **impact × scope** даёт уровень (SEV0..SEV3 или эквивалент), уровень определяет — какой пейджит, кого вовлекать, с какой каденцией общаться с клиентами, какой постмортем требуется. Не «громкость крика», а явные критерии. Третий лист под L1 `Incident Management` (рядом с [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/) и [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)) — оба соседа явно ссылаются на severity-based response как ожидаемый смежный домен.

## Что должен уметь

- **L3** — Знает severity scheme своей команды (SEV0..SEV3 или эквивалент), понимает критерии каждого уровня. Применяет корректную severity при declare incident, не «всё SEV1 потому что страшно».
- **L3** — Знает escalation path для своего сервиса: кто primary, secondary, IC, какие условия и timeout для escalation. Где это документировано (runbook / wiki / on-call playbook).
- **L4** — Использует severity-based response: SEV0 — war room + leadership notify + customer comms, SEV1 — IC + senior eng, SEV2 — on-call + manager-уведомление, SEV3 — async fix без paging других. Калибрует intensity к реальному impact.
- **L4** — Делает escalation по правилам: time-based (5 мин без ack → secondary, 15 мин → IC, 30 мин → leadership при SEV1+), criteria-based (data integrity / regulatory triggers → CISO / Legal). Не «героически решает в одиночку».
- **L5** — Проектирует severity matrix для команды/сервиса: **impact** (data loss / customer-facing degradation / internal-only) × **scope** (single user / blast radius / global) → severity. Конкретные численные пороги (% users affected, $/min revenue impact, error rate threshold).
- **L5** — Связывает severity с SLO burn rate: high burn rate (≥5% бюджета за час) автоматически elevates severity; SLO breach с пользовательским impact = минимум SEV1. Auto-escalation rules в alerting system.
- **L5** — Калибрует severity scheme на основе lookback (квартальный ревью): distribution по severity, false-positives (high severity при low impact), missed cases (low severity при major incident). Adjust criteria с примерами для каждого уровня.
- **L6+** — Проектирует org-level severity governance: единая scheme через все команды (или явное обоснование где разные), regulatory hooks (GDPR breach → CISO/Legal в первые часы, 72h notification), customer comms gates (SEV ≥ X → public statuspage update, executive notify).
- **L6+** — Принимает strategic severity decisions: external comm strategy для major incidents, board-level reporting threshold, regulatory disclosure timing, post-incident review с регуляторами при необходимости.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/managing-incidents/)** (O'Reilly, 2016), гл. 14 «Managing Incidents». **База.** Каноническая структура ролей (IC, Comms Lead, Ops Lead), severity, command-and-control модель в incident'е.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), гл. 9 «Incident Response». **База.** Прикладные шаблоны severity matrix, examples из Google, anti-patterns на real incidents.

### Статьи и доклады

- **[PagerDuty Incident Response Documentation](https://response.pagerduty.com/)** — open-source playbook от PagerDuty. **База.** Полная глава по severity definitions, escalation policies, communication cadence. Структура достаточно generic, чтобы взять как стартовый шаблон.
- **[Atlassian Incident Management Handbook](https://www.atlassian.com/incident-management)** — handbook от Atlassian. **База.** Severity definitions (SEV1..SEV5), escalation policies, customer communication patterns, integrated с Statuspage.
- **[Increment — On-Call issue](https://increment.com/on-call/)** — выпуск журнала про on-call practices, включая severity calibration. **Дополнительно.** Cтатьи от Stripe, Slack, Asana о реальных severity-фреймворках в продакшене.
- **[Google Cloud — Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** — главы 17–18 (Crisis Management, Recovery and Aftermath). **Продвинуто.** Severity для security-incidents, decision-making под давлением, regulatory escalations.

### Инструменты

- **[PagerDuty](https://www.pagerduty.com/) / [Opsgenie](https://www.atlassian.com/software/opsgenie) / [incident.io](https://incident.io/) / [FireHydrant](https://firehydrant.com/)** — paging + escalation policies + severity tracking + ChatOps integration. Auto-escalation по timeout встроена; severity classification обычно конфигурируема per-team.
- **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage) / [Statuspage by Better Stack](https://betterstack.com/status-page) / [Instatus](https://instatus.com/)** — customer-facing severity communication. Mapping internal severity → public status (operational / degraded / partial outage / major outage).
- **Slack workflows + ChatOps боты** (Slack Workflow Builder, кастомные Bolt apps, опенсорс [Dispatch](https://github.com/Netflix/dispatch) от Netflix) — declare incident через `/incident sev1 <description>`, auto-create war room channel, auto-page on-call, ведение sitrep'ов.

## Best practices

- **Severity = impact + scope, не «громкость крика».** Антипаттерн: все incidents SEV1 «потому что важно лично». Severity должна быть рамкой по критериям: customer impact (data loss > user-facing degradation > internal-only), scope (% users / blast radius), data integrity, regulatory implications. Без чётких критериев severity inflation: всё «критично» → ничего реально не критично, команда выгорает.
- **Severity-based response — не уравниловка.** Антипаттерн: для каждого incident — full war room и all-hands. Burnout, потеря фокуса, false sense of urgency. Severity-based: SEV0 = war room + leadership notify + customer comms; SEV1 = IC + senior eng; SEV2 = on-call + manager-уведомление; SEV3 = on-call async fix. Калибровка response intensity к real impact.
- **Auto-escalation по timeout, не «жду ответа».** Антипаттерн: pager сработал, primary не ответил за 30 минут — никто не знает. Auto-escalation в paging tool: 5 мин без ack → secondary; 15 мин → IC; 30 мин → leadership (при SEV1+). PagerDuty / Opsgenie / Incident.io это поддерживают из коробки — настроить однажды, тестировать на game day.
- **Severity не статична — upgrade/downgrade в ходе incident.** Антипаттерн: один раз declared SEV2 — навсегда SEV2 («стыдно повышать»). Реальные incidents меняют scope в ходе investigation: «думали один user → оказалось 50% базы → SEV0». Process: IC явно declare severity change с уведомлением stakeholders; downgrade тоже валиден (initial assessment был алармистский — формально downgrade с явным обоснованием).
- **SLO burn rate → severity bridge.** Антипаттерн: severity отдельно, alerting отдельно. High burn rate (5% бюджета за час) — это уже сигнал severity 1: customer impact в данный момент. Auto-escalation rules в alerting: burn rate > threshold → page IC + auto-classify SEV1 минимум. Без этого моста severity становится subjective — IC решает «по ощущениям».
- **Регуляторные escalations — first 24h critical.** Антипаттерн: «security incident, разберёмся, потом скажем legal». GDPR 72-hour breach notification — стартовый таймер с момента discovery, не с момента подтверждения. Severity matrix должна включать regulatory triggers (data breach / financial data exposure / health data / payment card data) с auto-page CISO / Legal / Compliance — не «оповестим в рабочее время».
- **Calibration lookback каждый квартал.** Антипаттерн: severity scheme прописали год назад и не трогаем. Reality drift: распределение incidents меняется (сервис мутирует, traffic растёт, новые регуляции). Quarterly review: distribution по severity (если 80% SEV1 — критерии слишком низкие), false-positives (high severity на самом деле low impact), missed cases (low severity на самом деле major). Adjust criteria, document examples per level.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — severity определяет response intensity (war room, comm cadence, postmortem requirements). Без severity — uniform response к любому incident.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — escalation paths переплетены с rotation structure (primary → secondary → IC → leadership). Severity определяет, кто paged и как глубоко эскалируем.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — severity-based postmortem requirements: SEV0 — обязательный PM с external timeline и executive review, SEV3 — optional / lightweight. Severity threshold для action items tracking.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — severity matrix часть runbook structure для сервиса; escalation paths документированы в runbook'е.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — burn rate как input для severity. SLO breach с пользовательским impact автоматически elevates severity до SEV1+.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — escalation идёт по service ownership chain. Каталог сервиса определяет primary/secondary owners для severity-based paging.

## Открытые вопросы

- **Customer Communications** *(TBD)* — глубокая тема: statuspage best practices, customer-facing severity vs internal, communication cadence (sitrep каждые 30 минут при SEV0+), regulatory comms timing (GDPR / SEC / FDA). Соседний лист под Incident Management.
- **War Room Patterns** *(TBD)* — отдельная тема: virtual war room (Slack channel / Zoom), IC role rotation, sitrep cadence как ритуал, decision logs, transition между shift'ами. Возможно отдельный лист.
- **Action Items Tracking** *(TBD)* — severity threshold для action items review (SEV0 → все AI трекаются в общем backlog с дедлайнами, SEV3 → optional). Сосед под Problem Management.
- **Status Page Management** *(TBD)* — operational practice для публичного statuspage; severity → status page state mapping, customer subscription, post-mortem mode. Из изначального списка соседних листьев.
- **Severity vs Priority в trackers** — отдельная тема: соотношение incident severity (момент инцидента) и priority в backlog для follow-up. Хороший candidate для callout внутри Action Items Tracking, если будет такой лист.
