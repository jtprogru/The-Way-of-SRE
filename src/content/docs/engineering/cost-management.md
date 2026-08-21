---
title: Cost Management
description: Управление стоимостью облака как инженерная практика, а не как отчётность для финансов
sfia: [3, 4, 5, 6]
status: draft
---

«У нас всё в облаке, биллинг — проблема CFO» — позиция инженерной команды, после которой через год компания платит за забытые кластеры в dev, лесные node-pools и over-provisioned RDS. Cost Management — это **engineering practice**, не финансовый учёт: тот же FinOps Lifecycle (Inform → Optimize → Operate) опирается на observability, IaC и [auto-scaling](/The-Way-of-SRE/glossary/#auto-scaling) — инструменты, которые уже принадлежат SRE. По моим наблюдениям, чаще именно SRE-команда становится точкой ответственности за облачные траты, потому что у платформенной команды есть нужные данные и нужный доступ.

Граница: [Capacity Planning](/The-Way-of-SRE/engineering/capacity-planning/) отвечает на «хватит ли»; cost management — «во что обходится и можно ли дешевле, не теряя SLO».

## Что должен уметь

Главный навык на уровне L4 — считать **unit economics**: cost per request / per active user / per GB processed. Я регулярно вижу команды, которые отчитываются абсолютными числами («в этом квартале потратили $500K на compute»), но не могут ответить на вопрос «а на одного активного пользователя — это сколько и куда движется тренд». Без unit-метрик невозможно отличить здоровый рост (cost-per-user стабилен) от неэффективности (cost-per-user растёт быстрее revenue). Это та точка, где «engineering bill» превращается из чёрного ящика в управляемую величину.

**L3**
- Читает свой cloud bill: структура (compute / storage / data egress / managed services / support), где найти cost per service, как сравнить с прошлым месяцем.
- Знает базовые cost levers: rightsizing, schedule off-hours, reserved / savings plans, spot / preemptible.

**L4**
- Считает unit economics для своего сервиса (cost per request / per active user / per GB), сравнивает с прошлыми периодами.
- Применяет tagging discipline: каждый ресурс размечен по `team / service / environment / cost-center`; cost allocation reports реально отражают, кто что тратит.

**L5**
- Проектирует cost-aware architecture: storage tiering (hot / warm / cold), auto-scaling policy с учётом cost (не только load), choice managed vs self-hosted с явным TCO calculation.
- Внедряет ритуалы FinOps в команду: monthly review с обсуждением anomalies, cost budget / SLO как явный artifact, anomaly alerts при отклонении ≥ N%.

**L6+**
- Связывает cost decisions с SLO и error budget: где можно деградировать ради economy (low-criticality traffic), где нельзя (revenue-critical paths).
- Vendor commitment strategy: reserved capacity vs on-demand mix, multi-cloud risk, enterprise discount negotiation, exit cost оценка.

## Материалы

### Книги

- J. R. Storment, Mike Fuller — **[Cloud FinOps](https://www.finops.org/introduction/what-is-finops/)** (O'Reilly, 2-е изд., 2023). Канонический guide от основателей FinOps Foundation. Если выбирать одну книгу — эту: framework, vocabulary, разбор anti-patterns.
- Forrest Brazeal — **[The Read Aloud Cloud](https://www.readaloudcloud.com/)** (Wiley, 2020). Не про деньги напрямую, но даёт интуицию о том, как устроен cloud pricing на uncomfortable уровне детализации; полезно перед серьёзным переговором с vendor.

### Статьи и фреймворки

- **[FinOps Foundation — FinOps Framework](https://www.finops.org/framework/)**. Shared vocabulary и lifecycle phases (Inform / Optimize / Operate). Это первое, с чем сверяться при разговоре с финансами — устраняет 80% terminology mismatch.
- **[AWS Well-Architected — Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)**. Несмотря на vendor-specific название, principles переносимы. По моим наблюдениям, чаще ссылаются именно на этот документ при review архитектуры на cost-side.
- **[The S3 Outage of February 28, 2017 — Cost as Reliability Constraint](https://aws.amazon.com/message/41926/)**. Не про деньги напрямую, но показывает, как cost-driven decisions (concentrated regional dependencies) превращаются в reliability risk.
- David Heinemeier Hansson — **[Why we're leaving the cloud](https://world.hey.com/dhh/why-we-re-leaving-the-cloud-654b47e0)** (2022) и **[We have left the cloud](https://world.hey.com/dhh/we-have-left-the-cloud-251760fb)** (2023). Публичный кейс — см. ниже.

### Инструменты

- **[Kubecost / OpenCost](https://www.opencost.io/)** — k8s-native cost allocation по namespace / label / workload. По моим наблюдениям, де-факто стандарт там, где cluster shared между командами.
- **AWS Cost Explorer / GCP Cloud Billing / Azure Cost Management** — нативные cloud-tools; минимальный must-have. Для мульти-окружения и сравнения месяц-к-месяцу — хватает на старте.
- **[Vantage](https://www.vantage.sh/)** / **[Cloudability](https://www.apptio.com/products/cloudability/)** / **[CloudHealth](https://www.cloudhealthtech.com/)** — third-party FinOps platforms; выбирают, когда нужен multi-cloud view и продвинутый allocation.
- **[Spot.io](https://spot.io/)** / **[Karpenter](https://karpenter.sh/)** — автоматизация spot / preemptible compute. Karpenter — open-source, k8s-native; чаще выбирают для новых кластеров k8s вместо Cluster Autoscaler.
- **Анти-инструмент:** «ручной cost review раз в месяц без integration с alerting» — выглядит как practice, но реагирует с lag в месяц.

## Best practices

Главный публичный кейс — **Basecamp / 37signals exit из cloud (2022–2023)**. David Heinemeier Hansson опубликовал серию постов с конкретными числами: AWS bill ~$3.2M/год; после миграции на own hardware экономия порядка $2M/год при том же SLO. Кейс показателен не выбором «cloud vs metal» (для большинства команд правильный ответ — остаться в облаке), а **уровнем визибилити**: они знали exact unit economics для каждой команды, прежде чем принимать решение. Я регулярно вижу команды, которые рассуждают «cloud дорогой» без подобной диагностики — это рассуждение, не решение. До прозрачности unit economics любая «оптимизация» — догадка.

Дальше три вещи, с которых начинается управляемость. Все скучные.

Считать надо unit economics, а не абсолютные траты. «Потратили $500K» не значит ничего. А вот «$0.0012 на активного пользователя, рост 8% при росте аудитории 5%» — это уже величина, у которой есть тревожный порог и понятный владелец.

Дисциплина тегов — предусловие для любого cost allocation. Без `team`, `service`, `environment` и `cost-center` отчёт показывает агрегат по аккаунту: обсуждать в команде нечего, взять на себя некому. Размётка, которую никто не проверяет, разъезжается за квартал. Минимум — теги, форсируемые в IaC, плюс drift detection.

И третье: стоимость — это SLI. Утилизация reserved capacity, cost per request ниже порога, алерт на отклонение больше 20% — всё это живёт с алертингом и дашбордом, а не в квартальном отчёте.

**Cost-aware architecture, а не post-hoc optimization.** Самые дорогие ошибки в деньгах принимаются на стадии дизайна: выбор базы, стратегия регионов, паттерны исходящего трафика. Через два года «оптимизировать» их означает миграцию. Я регулярно вижу ADR без секции про стоимость, после которых команда полгода борется со счётом за storage, предопределённым однажды на schema review. Стоимость идёт на design review наравне с latency и availability. Так же буднично.

**FinOps как ритуал, а не как реакция.** Если про деньги вспоминают, когда счёт «вдруг» вырос, это уже поздно. Работают два механизма: ежемесячный review с фиксированной повесткой (потратили против прогноза, аномалии, что планируем урезать, что планируем нарастить) и автоматические алерты на аномалии. По моим наблюдениям, разница между здоровой и нездоровой практикой — именно наличие ритуала. Инструменты вторичны.

**Reserved capacity ≠ free money.** Reserved instances / savings plans дают экономию 30–60%, но создают commitment — under-utilized reservation хуже, чем on-demand. Базовое правило: reserved покрывает stable baseline (predictable 24/7 workload); burst — on-demand или spot. Commit ratio 60–70% baseline — типовая стартовая точка; выше — нужен высокий уровень уверенности в forecast.

**Engineering ≠ Finance, но они говорят одним языком.** Разговор с финансами на языке инженерных метрик («cores / memory / IOPS») — не работает. Перевод в unit economics и результаты для бизнеса (cost per user, cost as % of revenue) — единственный общий язык. Это работа SRE / platform-team, не финансов: преобразовать infrastructure cost в форму, в которой business может принимать решения.

## Связанные листья

- **[Capacity Planning](/The-Way-of-SRE/engineering/capacity-planning/)** — capacity-action рассматривается с двух сторон: «хватит ли ресурсов» (capacity) и «сколько это стоит» (cost). Forecast — один.
- **[SLO Engineering](/The-Way-of-SRE/engineering/slo-engineering/)** — cost decisions ограничены SLO. Где можно деградировать ради economy, где нельзя — определяется error budget policy.
- **[Architecture Decision Records](/The-Way-of-SRE/practices/architecture-decision-records/)** — cost section в ADR — место, где cost-implications design решений становятся явными.
- **[Infrastructure as Code](/The-Way-of-SRE/engineering/infrastructure-as-code/)** — tagging discipline и cost allocation реализуются через IaC; cost-changes — через PR.
- **[Toil Tracking](/The-Way-of-SRE/engineering/toil-tracking/)** — manual cost analysis / monthly bill review — toil; автоматизированные dashboards и alerts — целевая форма.
- **[Service Ownership](/The-Way-of-SRE/culture/service-ownership/)** — каталог сервиса содержит данные о стоимости: owner, budget, current spend, trend.
- **[Stakeholder Management](/The-Way-of-SRE/culture/stakeholder-management/)** — cost-translation для finance — отдельный навык внутри stakeholder management; разговор с CFO требует unit economics, а не инженерных метрик.
- **[Cloud Providers](/The-Way-of-SRE/engineering/cloud-providers/)** — биллинговая модель провайдера — fundamental input в FinOps lifecycle; сервисы под управлением провайдера против self-hosted — центральный компромисс по деньгам.
- **[Telemetry Economics](/The-Way-of-SRE/engineering/telemetry-economics/)** — применение unit economics к metrics, logs и traces: ingest, cardinality, sampling, retention и стоимость pipeline.

## Открытые вопросы

Три листа-соседа пока не написаны. **Cloud Exit Decisions** *(TBD)* — расчёт TCO для облака против своего железа и вопрос, когда переезд оправдан; кейсы Basecamp, Twitter, 37signals. **Spot / Preemptible Workload Patterns** *(TBD)* — какие нагрузки туда годятся, как обрабатывать прерывание, чем это отличается от auto-scaling. **Multi-Cloud Cost Strategy** *(TBD)* — концентрация риска на одном вендоре против операционных накладных.

Отдельно висит **Carbon-aware Computing**: устойчивость как измерение, соседнее со стоимостью, — выбор локации датацентра и планирование нагрузки по времени суток под зелёную энергию.

Я не разобрался с тем, как **business value attribution** считается в командах, где один сервис обслуживает несколько revenue streams. Если у вас есть рабочий подход — расскажите через PR.
