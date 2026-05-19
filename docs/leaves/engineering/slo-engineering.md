---
name: SLO Engineering
branch: Engineering
path: Reliability Engineering/SLO Engineering
sfia_levels: [3, 4, 5, 6]
priority: Must Have
status: draft
---

# SLO Engineering

> Инженерная сторона SLO: **определение SLI**, формализация SLO, инструментирование сервиса, расчёт error budget. Не путать с `SLO Governance` (Culture/ITMG, организационная сторона — SLA с внешними, политика бюджета) и `SLO Review Ritual` (Practices, регулярный ритуал ревью).

## Что должен уметь

- **L3** — Различает SLI, SLO и SLA. Читает чужие SLO-описания и понимает, что они формализуют.
- **L4** — Записывает SLI как отношение `good events / valid events`. Обосновывает выбор знаменателя (что считать «валидным»). Определяет простой SLO для одного сервиса.
- **L5** — Проектирует набор SLI для сервиса целиком (latency, availability, freshness, correctness). Инструментирует сервис на стороне клиента, где это возможно.
- **L6+** — Внедряет SLO-инфраструктуру в команде: recording rules в Prometheus или аналог, дашборды, error budget calculation. Поднимает SLO-методологию в нескольких командах.

## Материалы

### Книги

- Alex Hidalgo — **Implementing Service Level Objectives** (O'Reilly, 2020). Главы 1–6: от определения SLI до error budget calculations.
- Betsy Beyer et al. — **The Site Reliability Workbook**, глава 2 «Implementing SLOs». [sre.google/workbook/implementing-slos](https://sre.google/workbook/implementing-slos/).

### Статьи и доклады

- Google SRE — **[Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)** (SRE Book, глава 4). База терминологии.
- Štěpán Davidovič — **Reliable Math** (SREcon). Математика SLO и burn rate: что значат 99.9%, как считать сложные SLI.

### Инструменты

- **[Prometheus](https://prometheus.io/)** — recording rules для SLI; алертинг по burn rate. Канонический стек.
- **[Sloth](https://sloth.dev/)** — генератор PromQL для SLO и burn-rate алертов из YAML-спецификации.
- **[Pyrra](https://github.com/pyrra-dev/pyrra)** — открытая платформа для управления SLO поверх Prometheus.
- **[Nobl9](https://nobl9.com/)** — коммерческая платформа управления SLO поверх любого мониторинга.

## Best practices

- **Знаменатель SLI важнее числителя.** «Good events» обсуждают, «valid events» забывают. Не отфильтровав ботов, healthcheck'и, известно-плохие клиенты и операции в maintenance window, получаешь SLO, который **никогда не нарушается или нарушается всегда**.
- **SLI считается на стороне клиента, когда это возможно.** Серверные метрики не знают про DNS, балансировщик, сетевую деградацию. Синтетика или RUM ближе к реальному пользовательскому опыту.
- **Начинай с одного SLI на один сервис.** Не пытайся покрыть всё сразу. Запусти один корректный SLI, проведи через первый SLO Review, отшлифуй процесс. Потом добавляй.

## Связанные листья

- **SLI-based Alerting** (`engineering/sli-based-alerting`) — алертинг строится поверх SLO Engineering.
- **SLO / Budget Review** (`culture/slo-budget-review`) — ритуал, потребляющий данные SLO Engineering.
- **Capacity Planning** (TBD) — capacity planning опирается на SLO как на reliability-таргет.
