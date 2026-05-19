---
name: Blameless Postmortem
branch: Practices
path: Problem Management/Blameless Postmortem
sfia_levels: [3, 4, 5, 6]
priority: Must Have
status: draft
---

# Blameless Postmortem

> **Ритуал** разбора инцидента: timeline, contributing factors, action items с владельцем и дедлайном. Не путать с `Postmortem Culture` (Culture/ETDL, **норма** blameless); здесь — про **процесс**, который опирается на эту норму.

## Что должен уметь

- **L3** — Участвует в постмортеме как факт-репортёр. Описывает свои действия в timeline без интерпретаций.
- **L4** — Пишет постмортем-документ по шаблону: summary, timeline, impact, contributing factors, action items. Соблюдает blameless tone.
- **L5** — Фасилитирует постмортем-встречу: распределяет роли, удерживает разговор на системе, помогает командам формулировать корректные action items.
- **L6+** — Внедряет постмортем-process в организации: шаблоны, платформа, кадки приоритезации action items, метрики (action item completion rate, time-to-postmortem).

## Материалы

### Книги

- Betsy Beyer et al. — **Site Reliability Engineering** (O'Reilly, 2016), глава 15 «Postmortem Culture». [sre.google/sre-book/postmortem-culture](https://sre.google/sre-book/postmortem-culture/). Содержит шаблон постмортема.
- Cindy Sridharan — **[Distributed Systems Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)** (O'Reilly). Глава про инциденты и обучение.

### Статьи и доклады

- John Allspaw — **[Blameless PostMortems and a Just Culture](https://www.etsy.com/codeascraft/blameless-postmortems/)** (Etsy, 2012). Классическая база.
- PagerDuty — **[Postmortems](https://postmortems.pagerduty.com/)**. Открытый набор шаблонов и руководств.
- Howie — **[The Post-Incident Guide](https://www.jeli.io/post-incident-guide)** by Jeli.io. Практичный гайд по проведению постмортема как разговора.

### Инструменты

- Шаблоны постмортемов: **[Google SRE template](https://sre.google/sre-book/example-postmortem/)**, **[PagerDuty templates](https://postmortems.pagerduty.com/templates/)**.
- Платформы: **[Jeli.io](https://www.jeli.io/)**, **[Incident.io](https://incident.io/)**, **[FireHydrant](https://firehydrant.com/)** — автоматизация сбора timeline.

## Best practices

- **Timeline на фактах, не на интерпретациях.** «Сервис вернул 503 в 14:23» — факт. «X не справился с нагрузкой» — интерпретация, которой не место в timeline (пойдёт в contributing factors с обоснованием).
- **Action items: владелец + дедлайн + priority.** Без этих трёх атрибутов action item — «доброе пожелание». Через полгода список action items без выполнения убивает доверие к ритуалу.
- **Постмортем = обучение, не наказание.** Если кто-то приходит на постмортем с настроением «найти, кто виноват», заверши встречу. Это разрушит культуру быстрее, чем десять плохих постмортемов.

## Связанные листья

- **Postmortem Culture** (`culture/postmortem-culture`) — норма, на которой держится этот ритуал.
- **Incident Response** (`practices/incident-response`) — постмортем — after-action для инцидента.
- **SLO / Budget Review** (`culture/slo-budget-review`) — постмортемы выявляют конкретные источники бюджет-сжигания.
- **Action Items Tracking** (TBD) — отдельный лист про дисциплину выполнения action items.
