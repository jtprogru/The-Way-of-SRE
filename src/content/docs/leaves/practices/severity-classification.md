---
title: Severity Classification & Escalation
description: Рамка измерения серьёзности инцидента через impact × scope и связанные правила escalation
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / Severity Classification & Escalation
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Всё SEV1, потому что страшно» — антипаттерн, который я регулярно вижу в команде без чёткой severity matrix. Severity inflation: всё «критично» → ничего реально не критично, команда выгорает, customers получают неуместные alarmist communications, executive escalation тратится впустую. Severity Classification — это **рамка по критериям**: impact × scope даёт уровень (SEV0..SEV3), уровень определяет — кого пейджит, кого вовлекать, с какой каденцией общаться с клиентами, какой постмортем требуется. Третий лист под L1 `Incident Management` (рядом с [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/) и [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)).

## Что должен уметь

Главный навык на уровне L5 — связывать **SLO burn rate с severity** через автоматическое правило. Severity отдельно от alerting — это субъективная оценка IC «по ощущениям». High burn rate (5% бюджета за час) — это уже сигнал severity 1: customer impact в данный момент. Auto-escalation rule в alerting: burn rate > threshold → page IC + auto-classify SEV1 минимум. Без этого моста severity becomes subjective, и в разных инцидентах одинаковая ситуация получает разный severity.

- **L3** — Знает severity scheme своей команды; применяет корректную severity при declare, не «всё SEV1 потому что страшно».
- **L3** — Знает escalation path для своего сервиса; где это документировано.
- **L4** — Использует severity-based response: SEV0 — war room + leadership notify + customer comms, SEV1 — IC + senior eng, SEV2 — on-call + manager-уведомление, SEV3 — async fix без paging других.
- **L4** — Делает escalation по правилам: time-based (5 мин без ack → secondary, 15 мин → IC, 30 мин → leadership при SEV1+), criteria-based (data integrity / regulatory triggers → CISO / Legal).
- **L5** — Проектирует severity matrix: **impact** (data loss / customer-facing degradation / internal-only) × **scope** (single user / blast radius / global) → severity. Численные пороги (% users affected, $/min revenue impact).
- **L5** — Связывает severity с SLO burn rate: high burn rate автоматически elevates severity; SLO breach с пользовательским impact = минимум SEV1.
- **L5** — Калибрует scheme на основе lookback (квартальный ревью): distribution по severity, false-positives, missed cases.
- **L6+** — Проектирует org-level severity governance: единая scheme через все команды, regulatory hooks (GDPR breach → CISO/Legal), customer comms gates.
- **L6+** — Принимает strategic severity decisions: external comm strategy для major incidents, board-level reporting threshold, regulatory disclosure timing.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/managing-incidents/)** (O'Reilly, 2016), глава 14. Каноническая структура ролей, severity, command-and-control модель.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), глава 9. Прикладные шаблоны severity matrix, examples из Google.

### Статьи и доклады

- **[PagerDuty Incident Response Documentation](https://response.pagerduty.com/)** — open-source playbook. Полная глава по severity definitions, escalation policies, communication cadence. По моим наблюдениям, чаще всего именно её берут как стартовый шаблон. Apache 2.0.
- **[Atlassian Incident Management Handbook](https://www.atlassian.com/incident-management)**. Severity definitions (SEV1..SEV5), escalation policies, customer communication patterns, integrated со Statuspage.
- **[Google Cloud — Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** — главы 17–18. Severity для security-incidents, decision-making под давлением.

### Инструменты

- **[PagerDuty](https://www.pagerduty.com/) / [Opsgenie](https://www.atlassian.com/software/opsgenie) / [incident.io](https://incident.io/) / [FireHydrant](https://firehydrant.com/)** — paging + escalation policies + severity tracking. Auto-escalation по timeout встроена; severity classification конфигурируема per-team.
- **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage) / [Better Stack](https://betterstack.com/status-page)** — customer-facing severity communication. Mapping internal severity → public status.
- **Slack workflows + ChatOps боты** — declare incident через `/incident sev1 <description>`, auto-create war room channel, auto-page on-call. Netflix [Dispatch](https://github.com/Netflix/dispatch) — open-source пример.

## Best practices

**Короткие правила:**

- **Severity = impact + scope, не «громкость крика».** Severity-inflation: всё «критично» → ничего реально не критично. Severity — рамка по критериям: customer impact (data loss > user-facing degradation > internal-only), scope (% users / blast radius), data integrity, regulatory implications.
- **Severity-based response — не уравниловка.** Для каждого incident — full war room и all-hands → burnout, потеря фокуса. SEV0 = war room + leadership + customer comms; SEV1 = IC + senior eng; SEV2 = on-call + manager-уведомление; SEV3 = on-call async fix.
- **Auto-escalation по timeout, не «жду ответа».** Pager сработал, primary не ответил за 30 минут — никто не знает. Auto-escalation в paging tool: 5 мин без ack → secondary; 15 мин → IC; 30 мин → leadership (при SEV1+). Настроить однажды, тестировать на game day.

Подробнее:

**Severity не статична — upgrade/downgrade в ходе incident.** «Один раз declared SEV2 — навсегда SEV2» (стыдно повышать) — реальные incidents меняют scope в ходе investigation. Думали один user → оказалось 50% базы → SEV0. Process: IC явно declare severity change с уведомлением stakeholders; downgrade тоже валиден (initial assessment был алармистский — формальный downgrade с явным обоснованием). По моим наблюдениям, нежелание менять severity в ходе инцидента — частая причина mismatched response.

**SLO burn rate → severity bridge.** «Severity отдельно, alerting отдельно» — high burn rate (5% бюджета за час) — это уже сигнал severity 1. Auto-escalation rules в alerting: burn rate > threshold → page IC + auto-classify SEV1 минимум. Без этого моста severity становится subjective.

**Регуляторные escalations — first 24h critical.** GDPR 72-hour breach notification — стартовый таймер с момента discovery, не с момента подтверждения. Severity matrix должна включать regulatory triggers (data breach / financial data exposure / health data / payment card data) с auto-page CISO / Legal / Compliance — не «оповестим в рабочее время».

**Calibration lookback каждый квартал.** «Severity scheme прописали год назад и не трогаем» — reality drift: распределение incidents меняется. Quarterly review: distribution по severity (если 80% SEV1 — критерии слишком низкие), false-positives, missed cases. Adjust criteria, document examples per level. Я регулярно вижу команды с устаревшей severity matrix, по которой через полгода стало невозможно отличить SEV1 от SEV2.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — severity определяет response intensity (war room, comm cadence, postmortem requirements).
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — escalation paths переплетены с rotation structure.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — severity-based postmortem requirements: SEV0 — обязательный PM с external timeline и executive review; SEV3 — optional / lightweight.
- **[Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/)** — severity определяет audience matrix и cadence customer comms.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — severity matrix часть runbook structure; escalation paths документированы в runbook.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — burn rate как input для severity.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — escalation идёт по service ownership chain.
- **[War Room Patterns](/The-Way-of-SRE/leaves/practices/war-room-patterns/)** — SEV0+ требует структурированного war room.

## Открытые вопросы

- **Customer Communications** уже выделена в отдельный лист.
- **War Room Patterns** уже выделен в отдельный лист.
- **Action Items Tracking** *(TBD)* — severity threshold для action items review.
- **Status Page Management** *(TBD)* — operational practice для public statuspage.
- **Severity vs Priority в trackers** — соотношение incident severity (момент инцидента) и priority в backlog для follow-up.
