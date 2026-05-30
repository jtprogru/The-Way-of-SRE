---
title: Cost Management
description: SRE-практика управления стоимостью облака — unit economics, cost allocation, FinOps-ритуалы, связь с SLO
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Financial Management / Cost Management
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«У нас всё в облаке, биллинг — проблема CFO» — позиция engineering-команды, после которой через год компания платит за забытые dev-кластеры, лесные node-pools и over-provisioned RDS. Cost Management — это **engineering practice**, не финансовый учёт: тот же FinOps Lifecycle (Inform → Optimize → Operate) опирается на observability, IaC и [auto-scaling](/The-Way-of-SRE/glossary/#auto-scaling) — инструменты, которые уже принадлежат SRE. По моим наблюдениям, чаще именно SRE-команда становится точкой ответственности за облачные траты, потому что у платформенной команды есть нужные данные и нужный доступ.

Граница: [Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/) отвечает на «хватит ли»; cost management — «во что обходится и можно ли дешевле, не теряя SLO».

## Что должен уметь

Главный навык на уровне L4 — считать **unit economics**: cost per request / per active user / per GB processed. Я регулярно вижу команды, которые отчитываются абсолютными числами («в этом квартале потратили $500K на compute»), но не могут ответить на вопрос «а на одного активного пользователя — это сколько и куда движется тренд». Без unit-метрик невозможно отличить здоровый рост (cost-per-user стабилен) от неэффективности (cost-per-user растёт быстрее revenue). Это та точка, где «engineering bill» превращается из чёрного ящика в управляемую величину.

- **L3** — Читает свой cloud bill: структура (compute / storage / data egress / managed services / support), где найти cost per service, как сравнить с прошлым месяцем.
- **L3** — Знает базовые cost levers: rightsizing, schedule off-hours, reserved / savings plans, spot / preemptible.
- **L4** — Считает unit economics для своего сервиса (cost per request / per active user / per GB), сравнивает с прошлыми периодами.
- **L4** — Применяет tagging discipline: каждый ресурс размечен по `team / service / environment / cost-center`; cost allocation reports реально отражают, кто что тратит.
- **L5** — Проектирует cost-aware architecture: storage tiering (hot / warm / cold), auto-scaling policy с учётом cost (не только load), choice managed vs self-hosted с явным TCO calculation.
- **L5** — Внедряет FinOps-ритуалы в команду: monthly review с обсуждением anomalies, cost budget / SLO как явный artifact, anomaly alerts при отклонении ≥ N%.
- **L6+** — Связывает cost decisions с SLO и error budget: где можно деградировать ради economy (low-criticality traffic), где нельзя (revenue-critical paths).
- **L6+** — Vendor commitment strategy: reserved capacity vs on-demand mix, multi-cloud risk, enterprise discount negotiation, exit cost оценка.

## Материалы

### Книги

- J. R. Storment, Mike Fuller — **[Cloud FinOps](https://www.finops.org/introduction/what-is-finops/)** (O'Reilly, 2-е изд., 2023). Канонический guide от основателей FinOps Foundation. Если выбирать одну книгу — эту: framework, vocabulary, разбор anti-patterns.
- Forrest Brazeal — **[The Read Aloud Cloud](https://www.readaloudcloud.com/)** (Wiley, 2020). Не cost-книга, но даёт интуицию о том, как устроен cloud pricing на uncomfortable уровне детализации; полезно перед серьёзным переговором с vendor.

### Статьи и фреймворки

- **[FinOps Foundation — FinOps Framework](https://www.finops.org/framework/)**. Shared vocabulary и lifecycle phases (Inform / Optimize / Operate). Это первое, с чем сверяться при разговоре с финансами — устраняет 80% terminology mismatch.
- **[AWS Well-Architected — Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)**. Несмотря на vendor-specific название, principles переносимы. По моим наблюдениям, чаще ссылаются именно на этот документ при review архитектуры на cost-side.
- **[The S3 Outage of February 28, 2017 — Cost as Reliability Constraint](https://aws.amazon.com/message/41926/)**. Не cost-кейс напрямую, но показывает, как cost-driven decisions (concentrated regional dependencies) превращаются в reliability risk.
- David Heinemeier Hansson — **[Why we're leaving the cloud](https://world.hey.com/dhh/why-we-re-leaving-the-cloud-654b47e0)** (2022) и **[We have left the cloud](https://world.hey.com/dhh/we-have-left-the-cloud-251760fb)** (2023). Публичный кейс — см. ниже.

### Инструменты

- **[Kubecost / OpenCost](https://www.opencost.io/)** — k8s-native cost allocation по namespace / label / workload. По моим наблюдениям, де-факто стандарт там, где cluster shared между командами.
- **AWS Cost Explorer / GCP Cloud Billing / Azure Cost Management** — нативные cloud-tools; минимальный must-have. Для мульти-окружения и сравнения месяц-к-месяцу — хватает на старте.
- **[Vantage](https://www.vantage.sh/)** / **[Cloudability](https://www.apptio.com/products/cloudability/)** / **[CloudHealth](https://cloud.vmware.com/cloudhealth)** — third-party FinOps platforms; выбирают, когда нужен multi-cloud view и продвинутый allocation.
- **[Spot.io](https://spot.io/)** / **[Karpenter](https://karpenter.sh/)** — автоматизация spot / preemptible compute. Karpenter — open-source, k8s-native; чаще выбирают для новых k8s-кластеров вместо Cluster Autoscaler.
- **Анти-инструмент:** «ручной cost review раз в месяц без integration с alerting» — выглядит как practice, но реагирует с lag в месяц.

## Best practices

Главный публичный кейс — **Basecamp / 37signals exit из cloud (2022–2023)**. David Heinemeier Hansson опубликовал серию постов с конкретными числами: AWS bill ~$3.2M/год; после миграции на own hardware экономия порядка $2M/год при том же SLO. Кейс показателен не выбором «cloud vs metal» (для большинства команд правильный ответ — остаться в облаке), а **уровнем визибилити**: они знали exact unit economics для каждой команды, прежде чем принимать решение. Я регулярно вижу команды, которые рассуждают «cloud дорогой» без подобной диагностики — это рассуждение, не решение. До прозрачности unit economics любая «оптимизация» — догадка.

**Короткие правила:**

- **Unit economics, а не absolute spend.** «Потратили $500K» — невозможно интерпретировать. «$0.0012 на активного пользователя, рост 8% при росте пользователей 5%» — управляемая величина с явным «тревожным сигналом».
- **Tagging discipline — пре-условие cost allocation.** Без tags (`team / service / environment / cost-center`) cost report показывает агрегат «по аккаунту» — нельзя обсуждать в команде, нельзя owned. Enforced tags в IaC + drift detection — минимум.
- **Cost — это SLI.** «80% утилизации reserved capacity» / «cost per request < threshold» / «anomaly alert при отклонении ≥ 20%» — SLI с alerting и dashboard, не excel-отчёт раз в квартал.

Подробнее:

**Cost-aware architecture, не post-hoc optimization.** Самые дорогие cost-mistakes принимаются на стадии design — choice of database, region strategy, data egress patterns. Через 2 года их «оптимизировать» означает migration. Я регулярно вижу команды, которые делают ADR без cost section — и потом 6 месяцев борются с storage bill, который был предопределён один раз на schema review. Cost рассматривается на equal footing с latency / availability при design review.

**FinOps как ritual, не реакция.** Cost обсуждается, когда bill «вдруг» вырос — это поздно. Monthly review с фиксированной agenda (last month spend vs forecast, anomalies, что планируем экономить, что планируем тратить больше) + automated anomaly alerts — два механизма, которые делают cost управляемым. По моим наблюдениям, разница между здоровыми и нездоровыми cost-practice — наличие ritual; всё остальное (tools, dashboards) вторично.

**Reserved capacity ≠ free money.** Reserved instances / savings plans дают экономию 30–60%, но создают commitment — under-utilized reservation хуже, чем on-demand. Базовое правило: reserved покрывает stable baseline (predictable 24/7 workload); burst — on-demand или spot. Commit ratio 60–70% baseline — типовая стартовая точка; выше — нужен высокий уровень уверенности в forecast.

**Engineering ≠ Finance, но они говорят одним языком.** Cost-conversation с финансами через engineering-метрики («cores / memory / IOPS») — не работает. Conversion в unit economics + business-результаты (cost per user, cost as % of revenue) — единственный общий язык. Это работа SRE / platform-team, не финансов: преобразовать infrastructure cost в форму, в которой business может принимать решения.

## Связанные листья

- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — capacity-action рассматривается с двух сторон: «хватит ли ресурсов» (capacity) и «сколько это стоит» (cost). Forecast — один.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — cost decisions ограничены SLO. Где можно деградировать ради economy, где нельзя — определяется error budget policy.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — cost section в ADR — место, где cost-implications design решений становятся явными.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — tagging discipline и cost allocation реализуются через IaC; cost-changes — через PR.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — manual cost analysis / monthly bill review — toil; автоматизированные dashboards и alerts — целевая форма.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит cost-метаданные: owner, budget, current spend, trend.
- **[Stakeholder Management](/The-Way-of-SRE/leaves/culture/stakeholder-management/)** — cost-translation для finance — отдельный навык внутри stakeholder management; conversation с CFO требует unit economics, не engineering-метрик.
- **[Cloud Providers](/The-Way-of-SRE/leaves/engineering/cloud-providers/)** — биллинговая модель провайдера — fundamental input в FinOps lifecycle; managed-сервисы vs self-hosted — central cost-trade-off.

## Открытые вопросы

- **Cloud Exit Decisions** *(TBD)* — отдельный лист про TCO calculation для cloud vs own infrastructure; когда action оправдан, когда не оправдан. Кейс Basecamp + Twitter + 37signals.
- **Spot / Preemptible Workload Patterns** *(TBD)* — какие workloads подходят, как handle interruption, чем отличается от auto-scaling.
- **Multi-Cloud Cost Strategy** *(TBD)* — concentrated vendor risk vs operational overhead.
- **Carbon-aware Computing** — sustainability как cost-adjacent dimension; data center location / time-of-day scheduling для green energy.
- Я не разобрался с тем, как **business value attribution** считается в командах, где один сервис обслуживает несколько revenue streams. Если у вас есть рабочий подход — расскажите через PR.
