---
name: Runbooks
branch: Culture
path: Knowledge Management/Runbooks
sfia_levels: [3, 4, 5, 6]
priority: Must Have
status: draft
---

# Runbooks

> Систематические текстовые инструкции по реагированию на конкретные инциденты или операции. Снижают когнитивную нагрузку on-call инженера и сокращают MTTR. **Алерт без runbook'а — фоновый шум**.

## Что должен уметь

- **L3** — Использует существующие runbooks команды для реагирования на инциденты; следует шагам, не выходит за их пределы без эскалации.
- **L4** — Пишет runbook для известного типа инцидента: симптом → шаги диагностики → шаги mitigation → escalation. Обновляет runbook после новых инцидентов.
- **L5** — Строит культуру runbook-first: алерт без runbook'а в команде не принимается. Проводит аудит runbook'ов на актуальность.
- **L6+** — Внедряет runbook-систему (платформа, шаблоны, метрики использования) в команде/организации. Связывает runbooks с алерт-системой автоматически.

## Материалы

### Книги

- Betsy Beyer et al. — **Site Reliability Engineering** (O'Reilly, 2016), глава 11 «Being On-Call». Раздел «Documenting» обсуждает runbook-культуру. [sre.google/sre-book/being-on-call](https://sre.google/sre-book/being-on-call/).

### Статьи и доклады

- PagerDuty — **[Runbook Templates](https://response.pagerduty.com/training/runbooks/)**. Готовые шаблоны и анти-шаблоны.
- Charity Majors — **[Runbooks Should Be Boring](https://charity.wtf/2018/04/03/observability-the-charity-talk/)**. Доводы за «скучные» runbook'и: чем тривиальнее шаги, тем меньше cognitive load в 3 утра.

## Best practices

- **Runbook = детальные шаги, не нарратив.** Цель — чтобы on-call мог следовать в 3 утра, не думая. Если для понимания шага нужно «знать архитектуру», runbook сломан.
- **Привязка к симптому, а не к причине.** Runbook называется по тому, **что видит дежурный** (например, «p99 latency > 500ms»), а не по предполагаемой причине. Симптомов мало, причин много.
- **Регулярный аудит.** Устаревшие runbooks хуже их отсутствия: они дают ложное чувство уверенности. Установи периодичность пересмотра (квартал/полугодие) и владельца.

## Связанные листья

- **SLI-based Alerting** (`engineering/sli-based-alerting`) — обязательная пара: каждый SLO-алерт ведёт к runbook'у.
- **Incident Response** (`practices/incident-response`) — runbooks — главный инструмент в incident response.
- **Postmortem Culture** (`culture/postmortem-culture`) — постмортем должен порождать обновление runbook'а.
