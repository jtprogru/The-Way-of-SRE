---
title: Vendor Management
description: Engineering-практика управления зависимостями от внешних сервисов — vendor SLO, composite math, concentration risk, vendor incident playbook
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Sourcing / Vendor Management
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Cloudflare лежит — мы тоже лежим, ничего не поделаешь» — позиция, легальная для разговора с CEO раз в год, но не для каждый месяц. Vendor management — это **engineering practice**, не «купить контракт у procurement»: понять зависимости, измерить SLO-impact каждого vendor, иметь fallback стратегию для критичных, regularly review portfolio. SRE — естественная точка ответственности, потому что vendor-outage — это incident, и зависимости видно из топологии. По моим наблюдениям, чаще всего vendor management в SRE-команде существует фрагментарно: «AWS bill курирует FinOps, status page Cloudflare смотрит DevOps, Stripe owns billing team», — и в день outage Cloudflare никто не знает, какие сервисы у нас критически зависят и какой emergency playbook применять.

Граница: [Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/) — каталог *наших* сервисов; vendor management — каталог *их* сервисов с *нашей* зависимостью. [Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/) — security-side dependencies (CVE, SBOM, signed artifacts); vendor management — reliability-side (SLA, outage history, fallback). [Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/) — финансовая сторона vendor отношений.

## Что должен уметь

Главный навык на уровне L5 — измерять **vendor's contribution to own SLO** через composite math: если vendor SLA — 99.9%, и vendor — критическая зависимость в request path, наш user-facing SLO не может быть выше 99.9% без явной redundancy / fallback / degraded mode. Я регулярно вижу команды, которые декларируют 99.95% SLO, при этом зависят от 3 vendors с 99.9% SLA — арифметика не сходится с самого начала. Это не значит «не использовать vendor»: это значит признать, что без redundancy наш SLO — composite, и формула должна быть явной.

- **L3** — Знает critical vendors своего сервиса (cloud / DNS / CDN / auth / payment / observability / messaging); читает их public status page и historical incidents.
- **L3** — Подписан на vendor status updates; в incident на vendor — проверяет dashboard через 5 минут, не через час.
- **L4** — Поддерживает **vendor incident playbook** для критичных vendors: что делать, когда Cloudflare / AWS region / Stripe / Auth0 down. Конкретные steps, не «свяжемся с support».
- **L4** — Регулярно проверяет vendor SLA против actual uptime: vendor public commitments vs measured performance. Расхождение — input для review.
- **L5** — Композитный SLO math: какая часть бюджета остаётся под нашу собственную работу после вычитания vendor budget. Без явной арифметики SLO theatre.
- **L5** — Vendor risk assessment: dependency graph, concentration risk (single vendor handles N critical paths), switching cost, vendor lock-in metrics.
- **L6+** — Strategic vendor portfolio: multi-cloud / multi-CDN trade-off (cost vs availability vs ops overhead), vendor diversification policy, escape hatch design.
- **L6+** — Vendor exit planning: что делать, когда vendor acquires / shuts down / radically изменяет pricing. Tested escape path для критичных vendors (не tabletop — реально проверенный).

## Материалы

### Книги

- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/managing-load/)** (O'Reilly, 2016). Не отдельная глава про vendors, но главы про «load balancing» / «addressing cascading failures» содержат принципы, применимые к vendor incidents (graceful degradation, criticality levels).
- Mike Loukides, J. R. Storment, Mike Fuller — **[Cloud FinOps](https://www.finops.org/introduction/what-is-finops/)** (O'Reilly, 2nd ed., 2023). Не reliability-focused, но фундамент про vendor relationship management с финансово-операционной стороны. Полезно для границ ответственности SRE ↔ Procurement.
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Раздел про strategic decisions — vendor selection и concentration risk обсуждаются как пример типичного strategic call для staff IC.

### Статьи и доклады

- Cloudflare — **[Cloudflare outage on June 21, 2022](https://blog.cloudflare.com/cloudflare-outage-on-june-21-2022/)** и **[July 2 2019 outage post-mortem](https://blog.cloudflare.com/cloudflare-outage/)**. Главный публичный кейс — см. ниже.
- Fastly — **[Summary of June 8, 2021 outage](https://www.fastly.com/blog/summary-of-june-8-2021-outage)**. Customer configuration change на Fastly side, который положил большой кусок интернета (NYT, Reddit, Twitch, UK gov). Хороший случай для playbook discussion.
- AWS — **[Summary of the AWS Service Event in the US-EAST-1 Region, December 7 2021](https://aws.amazon.com/message/12721/)**. Связанный кейс: AWS как concentrated vendor; что значит «AWS down».
- **[CrowdStrike outage of July 19, 2024](https://www.crowdstrike.com/falcon-content-update-remediation-and-guidance-hub/)**. Software vendor (security agent), не infrastructure vendor — но показательный кейс того, как vendor change может вывести из строя global IT.
- **[Status Page Aggregators](https://stspg.io/)** и **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage)**. Не статья, но pointer к infrastructure для vendor monitoring.

### Инструменты

- **Vendor inventory in repo / Notion** — самый базовый и самый часто пропускаемый инструмент. Markdown table: vendor / SLA / criticality / SLO impact / fallback / playbook link / contract renewal date. По моим наблюдениям, разница между командами с workingским vendor management и без — наличие этой таблицы.
- **[StatusGator](https://statusgator.com/) / [IsDown](https://isdown.app/)** — aggregators status pages внешних vendors; sends alerts при vendor incident. Полезны для команд с десятками SaaS vendors.
- **Synthetic monitoring (Datadog Synthetics / [Checkly](https://www.checklyhq.com/))** — проактивная проверка vendor endpoint health; ловит partial degradation раньше public status update.
- **[Cloudflare Workers](https://workers.cloudflare.com/) / multi-CDN configuration** — практический инструмент redundancy для CDN tier. Один из немногих vendor-types, где multi-vendor реально работает.
- **Анти-инструмент:** «vendor SLA в PDF контракта, который никто не читал». Если SLA не trackable / measurable / actionable — её эффективно нет.

## Best practices

Главный публичный кейс — **Cloudflare outage, July 2, 2019** (примерно 30 минут, ~50% всего HTTP-трафика интернета affected). Регулярное expression в WAF rule вызвало CPU exhaustion на edge serverах; ошибка попала в production без catching в pre-prod environments. **Что показал инцидент:** даже компании уровня Reddit, Twitch, Discord были effectively down, потому что Cloudflare — concentrated single point of failure для half of internet. Я регулярно вижу команды, у которых «у нас Cloudflare» как полное answer на вопрос «что у вас по DDoS / DNS / CDN», без понимания, что **vendor concentration** — это reliability risk, и в день Cloudflare outage любая redundancy на собственной инфраструктуре уже бесполезна. Это не аргумент против Cloudflare — это аргумент за **vendor incident playbook**: что мы делаем (degraded mode? read-only? bypass CDN?), когда vendor up за пределами нашего контроля.

**Короткие правила:**

- **Vendor inventory обязательна.** Без явного списка critical vendors с SLA / criticality / SLO impact — discussions держатся «в голове». Inventory living: PR при добавлении / удалении vendor.
- **Composite SLO math явная.** «Наш SLO — 99.95%» при зависимости от vendor 99.9% без redundancy — математически невозможно. Либо redundancy, либо honest 99.9% (или ниже), либо явно accepted budget consumption на vendor side.
- **Vendor incident playbook для критичных vendors.** «Что мы делаем, когда Cloudflare / AWS region / Stripe down» — конкретные steps, не «свяжемся с support». Tested в game day минимум раз в год.

Подробнее:

**Concentration risk vs operational simplicity — главный trade-off.** Single vendor (AWS-only / Cloudflare-only / Stripe-only) — operational simplicity, но full exposure to их incidents. Multi-vendor — снижает single-point-of-failure, но требует 2x ops effort, complex routing, payment redundancy и т.д. По моим наблюдениям, разумная граница: для **infrastructure tier** (cloud, DNS, CDN, payment) — multi-vendor оправдан для критичных компаний; для **operational tier** (observability, error tracking, communication tools) — single vendor обычно ОК с явным fallback. Конкретный baseline зависит от business criticality и customer-facing SLO.

**Vendor SLA — нижняя граница, не expectation.** Реальный uptime обычно лучше contractual SLA (vendor consérves credit budget), но в год outage случается. SLO planning должен ассумировать SLA, не observed; иначе любой compliant vendor incident сжигает наш бюджет, и нам нечем покрыть собственные инциденты. Это базовая дисциплина, которую часто откладывают.

**Vendor exit — не theoretical exercise.** Я регулярно вижу команды, у которых «vendor lock-in» обсуждается на ADR, но никогда не тестируется. Tested escape path для критичных vendors — это раз в 1–2 года прокат миграции хотя бы для одного non-critical сервиса между vendors. Без actual experience migration vendor exit — это wish, не plan. Особенно касается auth (Auth0 ↔ Okta ↔ Cognito), payment (Stripe ↔ Adyen ↔ Braintree), observability (Datadog ↔ New Relic ↔ Grafana Cloud).

**Status page checking — automated, не manual.** Я регулярно вижу команды, у которых процесс «vendor incident detection» = «кто-то заметил в Slack» / «увидели на Twitter». Это late signal. Healthy подход: subscribe на vendor status RSS / webhook / API; integrate в свой incident management. Время от vendor announcement до собственного incident response — должно быть минуты, не десятки минут.

**Annual vendor review ritual.** Раз в год — review portfolio: какие vendors используем (некоторые забыты), какие fees растут disproportionate to value, какие vendor SLA не соответствуют наблюдаемой uptime, какие contracts renewing (negotiation window), какие vendors консолидировали (M&A risk). Без ritual portfolio становится bag of accumulated decisions без revisit.

## Связанные листья

- **[Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)** — vendor portfolio — крупный share cost bill; vendor commitment strategy (reserved capacity, multi-year contracts) — часть cost optimization.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — composite SLO math: own SLO = product (vendor SLAs × own reliability). Vendor SLA — input для honest SLO commitment.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — vendor quotas, lead time для scaling, concentration risk в одном vendor region.
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — security-side vendor risk (CVE, SBOM, signed artifacts); этот лист — reliability-side. Соседние практики с общим vendor inventory.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog содержит upstream vendor dependencies; ownership of vendor relationship — explicit.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — vendor incident — отдельный класс incident; IC immediately checks vendor status в первые 5 минут.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — graceful degradation для vendor unavailability: cached responses, fallback providers, degraded mode.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — vendor selection — типичный ADR; концентрация vs diversification — recurring decision.
- **[Composite SLO Methodology](/The-Way-of-SRE/leaves/engineering/composite-slo-methodology/)** — vendor SLAs — input в composite math; этот лист ведёт inventory, composite methodology — использует.

## Открытые вопросы

- **Multi-Cloud Strategy** *(TBD)* — когда multi-cloud оправдан, когда anti-pattern; пересечение с capacity planning и cost management.
- **Vendor Concentration Metrics** *(TBD)* — как количественно мерить vendor concentration risk (% of revenue / % of critical paths / blast radius).
- **Open-source Dependencies как «vendor»** — semi-vendor relationships (Linux distro, k8s, PostgreSQL, etc); похожие governance вопросы, разный контекст.
- **Vendor Negotiation Tactics** — engineering-сторона переговоров (technical evidence для лучших terms); пересечение с procurement role.
- Я не уверен, какая **минимальная granularity** vendor inventory правильна (на уровне vendor / на уровне отдельных endpoints / на уровне feature). Если у вас есть рабочая модель — расскажите через PR.
