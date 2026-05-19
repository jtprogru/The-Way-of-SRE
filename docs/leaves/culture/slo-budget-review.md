---
name: SLO / Budget Review
branch: Culture
path: Measurement/SLO / Budget Review
sfia_levels: [3, 4, 5, 6]
priority: Must Have
status: draft
---

# SLO / Budget Review

> Регулярный ритуал ревью состояния SLO и расходования error budget. Не «отчётность», а разговор о **приоритетах**: накопленный долг по надёжности через burn rate, решения по балансу feature work vs reliability work.

## Что должен уметь

- **L3** — Различает SLI / SLO / SLA, читает чужие SLO-дашборды и понимает текущее состояние бюджета.
- **L4** — Составляет короткий отчёт по SLO одного сервиса для регулярного ревью: текущий burn rate, динамика, причины расхода.
- **L5** — Проводит SLO Review в своей команде: фасилитирует разговор, формулирует **решения** по бюджету (заморозить релизы, отдать спринт на reliability, прокачать SLI).
- **L6+** — Внедряет SLO Review как регулярный ритуал в команде/организации; согласует формат и аудиторию с продуктовыми стейкхолдерами.

## Материалы

### Книги

- Alex Hidalgo — **Implementing Service Level Objectives** (O'Reilly, 2020), глава 8 «Establishing an SLO Review».
- Betsy Beyer et al. — **The Site Reliability Workbook**, глава 4 «Service Level Objectives». [sre.google/workbook/implementing-slos](https://sre.google/workbook/implementing-slos/).

### Статьи и доклады

- Google SRE — **[Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)**. База для понимания, какие данные приходят в SLO Review.
- Nobl9 — **[Building an Error Budget Policy](https://www.nobl9.com/resources/blog/building-an-error-budget-policy)**. Шаблон Error Budget Policy, на которой строится ревью.

## Best practices

- **SLO Review — это разговор о приоритетах, а не отчёт о состоянии.** Без явных решений по бюджету (что меняем, что отложили) ревью теряет смысл и деградирует в формальность за пару месяцев.
- **Регулярность важнее перфекционизма.** Лучше еженедельные 15-минутные ревью, чем ежеквартальные двухчасовые. Burn rate набегает быстрее, чем месяц.
- **Включай продукт.** SLO без бизнес-контекста — техническое упражнение. Если решения по бюджету не доходят до владельцев продукта, ревью не работает: команда снижает надёжность, продукт об этом не знает.

## Связанные листья

- **SLI-based Alerting** (`engineering/sli-based-alerting`) — алерты на burn rate дают входные данные для SLO Review.
- **Blameless Postmortem** (`practices/blameless-postmortem`) — постмортемы выявляют конкретные источники бюджет-сжигания.
- **Runbooks** (`culture/runbooks`) — runbooks по SLO-нарушениям позволяют отрабатывать инциденты без расходования бюджета на ручной разбор.
