---
name: Incident Response
branch: Practices
path: Incident Management/Incident Response
sfia_levels: [3, 4, 5, 6]
priority: Must Have
status: draft
---

# Incident Response

> Процесс координации реагирования на инциденты. Роли (Incident Commander, Communications Lead, Operations Lead), escalation paths, war room процессы, коммуникация со стейкхолдерами. Цель — **минимизировать MTTR при соблюдении blameless-принципов**.

## Что должен уметь

- **L3** — Понимает базовые роли (IC, Comms Lead, Ops Lead). Знает, кому пинговать в инциденте. Следует runbook'у; эскалирует при неясности.
- **L4** — Выступает Operations Lead в малых инцидентах: диагностика, mitigation, координация с командой. Ведёт incident log.
- **L5** — Выступает Incident Commander: координирует действия команды, делает sync-апдейты для стейкхолдеров, принимает решения о rollback / эскалации.
- **L6+** — Внедряет incident response process в команде: формализованные роли, шаблоны коммуникации, training (game day), интеграция с monitoring/paging.

## Материалы

### Книги

- Betsy Beyer et al. — **Site Reliability Engineering** (O'Reilly, 2016), глава 13 «Emergency Response» и глава 14 «Managing Incidents». [sre.google/sre-book/managing-incidents](https://sre.google/sre-book/managing-incidents/).
- PagerDuty — **[Incident Response Documentation](https://response.pagerduty.com/)**. Полный набор шаблонов, ролей, процессов. Бесплатно, открыт.

### Статьи и доклады

- Atlassian — **[Incident management for high-velocity teams](https://www.atlassian.com/incident-management/handbook)**. Практичный handbook.
- Google SRE — **[Incident Command System](https://sre.google/workbook/incident-response/)** (SRE Workbook, глава 9). Адаптация военного ICS под IT-инциденты.

### Инструменты

- **[PagerDuty](https://www.pagerduty.com/)** / **[Opsgenie](https://www.atlassian.com/software/opsgenie)** / **[Grafana OnCall](https://grafana.com/products/oncall/)** — alerting и on-call rotation.
- **[Statuspage](https://www.atlassian.com/software/statuspage)** / **[Better Stack](https://betterstack.com/)** — public status page для коммуникации с пользователями.

## Best practices

- **Роли важнее людей.** Назначай IC / Comms / Ops Lead в каждом инциденте явно, даже если команда из двух человек. Без явного IC решения «утекают» в группу, MTTR растёт.
- **Tempo updates — каждые 15–30 минут** для стейкхолдеров. Молчание интерпретируется как «всё плохо» или «всё уже починили». Update даже «без изменений» — нужен.
- **Mitigation > root cause во время инцидента.** Цель в моменте — вернуть сервис, не найти причину. Rollback / failover / graceful degradation — приоритет; разбор — после, в постмортеме.

## Связанные листья

- **Blameless Postmortem** (`practices/blameless-postmortem`) — обязательный after-action на серьёзный инцидент.
- **Runbooks** (`culture/runbooks`) — главный инструмент в моменте инцидента.
- **SLI-based Alerting** (`engineering/sli-based-alerting`) — то, что инициирует incident response.
- **On-Call Rotation** (TBD) — кто дежурит и принимает первый удар.
