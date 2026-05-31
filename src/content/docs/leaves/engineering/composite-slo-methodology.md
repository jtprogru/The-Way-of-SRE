---
title: Composite SLO Methodology
description: Математика multi-component SLO — серийные / параллельные пути, vendor SLA как input, critical path, не «99.95% потому что хочется четыре девятки»
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / Composite SLO Methodology
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Наш SLO — 99.95%» — типичная декларация после quarterly planning. Если посмотреть на сервис-граф: 4 зависимости с vendor SLA 99.9% ([auth](/The-Way-of-SRE/glossary/#auth), payment, CDN, managed DB), 2 internal-сервиса с 99.99%, shared DNS / TLS layer. Простая арифметика для последовательного пути: `0.999⁴ × 0.9999² × 0.9999 ≈ 0.9956` — наш достижимый SLO ceiling **99.56%**, не 99.95%. Composite SLO Methodology — это **математика multi-component систем**: когда «хочется четыре девятки» сталкивается с реальностью composite, и нужно либо снизить commitment, либо добавить redundancy, либо явно принять honest baseline. Я регулярно вижу команды, которые декларируют SLO без composite math — и потом первый dependency outage сжигает квартальный error budget целиком.

Граница: [SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/) — *как формулировать* SLO для одного компонента (SLI, target, window); этот лист — *как складывать* SLO для multi-component system. [Vendor Management](/The-Way-of-SRE/leaves/practices/vendor-management/) — vendor SLA как input в composite math; reliability-side зависимостей от внешних сервисов. [Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/) — что делать, чтобы composite SLO **превысить** математический ceiling через redundancy / graceful degradation.

## Что должен уметь

Главный навык на уровне L5 — отличать **serial** от **parallel** dependencies и применять правильную формулу. Я регулярно вижу команды, которые перемножают SLA всех зависимостей подряд — но если CDN имеет fallback на origin, это **parallel** (отказ только при двойном отказе), и формула совсем другая: `1 − (1 − SLA_cdn)(1 − SLA_origin)`. Различить serial vs parallel — это не «формальность», это разница между 99.5% и 99.99% при том же наборе компонентов. Если граф нарисован, формула механическая; если граф «в голове» — composite math всегда оптимистичнее реальности.

**L4**
- Понимает базовую арифметику: для serial dependencies own SLO ≤ product(deps SLAs); знает, что vendor SLA — нижняя граница (worst case), а не expectation.
- Идентифицирует **critical path** через service graph своего сервиса: какие dependencies в request-path каждого user-facing endpoint.
- Считает composite math для своего user journey: serial path × required-uptime parallel components × shared infrastructure.

**L5**
- Различает serial vs parallel dependencies и применяет правильные формулы. Parallel: `1 − ∏(1 − SLA_i)`, serial: `∏ SLA_i`.
- Включает **vendor SLAs как нижнюю границу** в composite math, не как ожидаемый uptime. SLA — contractual floor (vendor готов вернуть credit); real uptime может быть выше, но planning под SLA, не под наблюдаемое.
- Разделяет **mandatory vs best-effort dependencies**: observability backplane / logging pipeline / async analytics — не часть user-facing composite (их падение не означает «пользователь страдает»); auth / payment / DB — часть.
- Применяет multi-burn-rate alerting **per critical path / per journey**, не только per service. SLI собирается на journey-уровне (synthetic / RUM / business event), не только на endpoint.

**L6+**
- Org-level composite portfolio: какие user journeys получают SLO commitment, какие остаются best-effort. Не каждый journey стоит SLO — обоснование выбора явное.
- Composite math как **input для capacity и cost decisions**: где redundancy оправдана (revenue-critical journey), где нет (low-traffic admin tool). Связь с [Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/) явная.
- Refresh composite math после каждой major dependency change (new vendor, removed redundancy, schema change затрагивающий fan-out). Без refresh composite SLO становится stale за квартал.

## Материалы

### Книги

- Alex Hidalgo — **[Implementing Service Level Objectives](https://www.alex-hidalgo.com/the-slo-book)** (O'Reilly, 2020). Глава 11 «Service Level Objectives and Probability» — единственная книжная глава, посвящённая composite math явно. Если выбирать одну ссылку — эту.
- Betsy Beyer et al. (eds) — **[The Site Reliability Workbook](https://sre.google/workbook/implementing-slos/)** (O'Reilly, 2018), глава 2 «Implementing SLOs». Раздел про dependencies upstream / downstream — Google's подход. Не как глубоко как Hidalgo, но canonical.
- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/embracing-risk/)** (O'Reilly, 2016), глава 3 «Embracing Risk». Не composite напрямую, но фундамент для понимания, что «target uptime — это decision с trade-offs», не aspirational число.

### Статьи и доклады

- Marc Brooker — **[Combining SLAs](https://brooker.co.za/blog/2022/05/13/sla.html)** (личный блог, 2022). Marc Brooker (AWS Principal Engineer) пишет про combined SLA arithmetic для distributed systems. Самый сжатый практический resource по теме.
- Stephen Thorne — **[Composite SLOs aren't as scary as they seem](https://blog.alexewerlof.com/p/composite-slo)** / **[Composite SLOs in practice](https://medium.com/@alexewerlof/composite-slo-bd84a9697f6c)** (Medium, 2020+). Несколько блог-постов по теме с конкретными формулами и diagrams. Полезно как practical complement к Hidalgo's главе.
- Charity Majors — **[SLO Math](https://charity.wtf/2022/01/05/slos-math-fundamentals/)** (личный блог, 2022). Критический взгляд на «multiply everything» подход; обоснование, почему journey-level SLI лучше, чем component-level composite.
- Google Cloud — **[SLI and SLO best practices](https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-slis-slas-and-slos)**. Не глубоко по composite, но canonical reference для vocabulary.

### Инструменты

- **[OpenSLO](https://openslo.com/)** — vendor-agnostic YAML spec для SLO; поддерживает composite через `objectives[]` с многими SLI. Используется в Sloth / Pyrra / Nobl9.
- **[Sloth](https://sloth.dev/)** — SLO-as-code для Prometheus; multi-window multi-burn-rate alert rules генерируются автоматически. Composite SLO собирается через несколько SLO definitions + custom recording rules.
- **[Pyrra](https://github.com/pyrra-dev/pyrra)** — alternative к Sloth, более opinionated. По моим наблюдениям, чаще выбирают Sloth для existing setups, Pyrra — для greenfield.
- **[Nobl9](https://www.nobl9.com/)** — коммерческая SLO platform, лучшая native поддержка composite SLO в индустрии. Если SLO program critical и есть бюджет — рассматривать.
- **[error-budget-policy](https://github.com/google/error-budget-policy)** — open-source шаблон error budget policy с composite-considerations.
- **Анти-инструмент:** «composite SLO в Excel-sheet, обновляемый раз в квартал вручную». Это не tool, это invitation к stale math. Composite живёт в коде (OpenSLO YAML / Sloth definitions) — обновляется PR'ом при изменении dependency graph.

## Best practices

Главный публичный кейс — не отдельный инцидент, а **широко документированная статистика AWS SLA**. AWS публикует SLA на каждый сервис (S3 — 99.9% для standard storage, EC2 — 99.99% для regional fleet, RDS — 99.95% для Multi-AZ). Если построить типовое веб-приложение в AWS — Application Load Balancer (99.99%) → EC2 fleet (99.99%) → RDS Multi-AZ (99.95%) → S3 (99.9%) для статики, всё в одном регионе — composite serial SLA: `0.9999 × 0.9999 × 0.9995 × 0.999 ≈ 0.9983`. Это **99.83%** — ceiling, который AWS contractually готов компенсировать через credits. Многие команды декларируют 99.95% или выше, не глядя на эту арифметику. Я регулярно вижу архитектурные обсуждения «как нам достичь 99.99% uptime», в которых composite math никогда не появляется — и достижение 99.99% становится либо реалистическим (если добавлены multi-region failover, multi-AZ, redundancy), либо wishful (если просто декларация поверх той же топологии). Один лист бумаги с composite math перед SLO-commitment — час работы и год честности.

**Короткие правила:**

- **Critical path сначала, math потом.** Без идентифицированного critical path через сервис-граф composite math — это произвольная сумма SLA. Нарисовать граф, отметить «без чего пользователь страдает» — пре-условие.
- **Vendor SLA — floor, не ceiling.** Vendor SLA — то, что vendor готов compensate (credits) при нарушении. Не «реальный uptime»; не «ожидание». Composite math на SLA — conservative baseline; реальность обычно лучше, но planning под worst case.
- **Mandatory vs best-effort dependencies явно.** Observability backplane / logging / async analytics — best-effort (их down ≠ пользователь страдает); auth / payment / DB / CDN — mandatory. Включать в composite только mandatory; иначе SLO ceiling drops без user-facing reason.

Подробнее:

**Serial vs parallel — главное место ошибок.** Распространённая ошибка: считать все dependencies в одну формулу `∏ SLA_i`. Реально: если CDN имеет fallback на origin, это **parallel** — отказ только при двойном отказе, формула `1 − (1 − SLA_cdn)(1 − SLA_origin) ≈ 1 − 0.001 × 0.0001 = 99.99999%`. Если auth имеет primary + secondary identity provider — то же. Если DB Multi-AZ — это уже parallel внутри одного «AZ-level» SLA, и vendor SLA включает Multi-AZ в свой 99.95%. По моим наблюдениям, серьёзная composite math для типовой команды занимает 1–2 дня (рисование графа + classification + формулы); результат — картина, которая меняет SLO-committee discussions.

**Composite SLO — это не «потолок 99.X%», это семейство SLO per user journey.** Сервис обычно обслуживает несколько user journeys (login, purchase, browse, support). У каждого journey свой critical path и свой composite math. Login может иметь 99.95% (мало dependencies), purchase — 99.5% (payment processor добавляет 99.9% × ...), browse — 99.9%. Команда не commit'ит **один** SLO на сервис — она commit'ит per journey. Я регулярно вижу команды, у которых один service-level SLO, и в день любого incident команда не может понять «какая часть продукта затронута».

**Vendor SLA включается с conservatism, не optimism.** Vendor может иметь observed uptime 99.99%, но SLA — 99.9%. Использовать SLA как input в composite, не observed. **Why:** vendor может изменить infrastructure, нагружать других клиентов, иметь региональный incident — observed uptime прошлого квартала не предсказывает следующий. SLA — это нижняя граница, которую vendor готов защищать contractually. Conservatism на vendor side освобождает internal budget на собственные инциденты.

**Refresh composite math после каждой major dependency change.** Service graph меняется: новый vendor (Stripe → Adyen migration), removed redundancy (closed second region for cost), added intermediate cache (Redis layer перед DB). После каждой такой change composite math должна быть пересчитана и SLO commitment пересмотрен. Я регулярно вижу команды, у которых composite SLO документ датирован 18 месяцев назад, а сервис-граф за это время изменился 3 раза — math не отражает реальности.

**Multi-burn-rate per journey, не per component.** Classical multi-burn-rate alerting часто строится per individual SLI (latency, error rate каждого endpoint). Composite world требует journey-level SLI: synthetic user journey, RUM event chain, business transaction (order placed). Алерт срабатывает при burn на journey-уровне — то есть «пользователи реально не могут купить», а не «один из 12 backend endpoints деградировал». По моим наблюдениям, разница между mature SLO program и developing — наличие journey-level SLI как primary, component-level — как diagnostic.

## Связанные листья

- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — *как формулировать* SLO для одного компонента; этот лист — *как складывать* SLO для multi-component system. Читать вместе.
- **[Vendor Management](/The-Way-of-SRE/leaves/practices/vendor-management/)** — vendor SLAs — input в composite math. Vendor management ведёт inventory, composite methodology — использует.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — что делать, чтобы composite SLO **превысить** математический ceiling: redundancy, graceful degradation, fallbacks. Resilience patterns превращают serial dependencies в parallel.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — composite SLO определяет, какие компоненты требуют redundancy (parallel paths), а это — capacity decisions с lead time.
- **[Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)** — redundancy для composite SLO improvement имеет cost; trade-off «one more nine» vs cost доллар-on-доллар.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** / **[Symptom vs Cause Alerting](/The-Way-of-SRE/leaves/engineering/symptom-vs-cause-alerting/)** — journey-level SLI требует multi-burn-rate alerting на composite path, не только per component.
- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — ритуал, на котором composite math пересматривается: что изменилось в graph, осталась ли арифметика честной, нужно ли скорректировать commitment.

## Открытые вопросы

- **Composite SLO для async / batch systems** *(TBD)* — formulae для freshness / lag-based SLI в composite. Классическая теория покрывает online; batch (Airflow / Dagster pipelines, Kafka streams) — отдельная подобласть с собственными формулами.
- **Probabilistic composite vs worst-case** — current approach — multiply / sum (worst case); probabilistic подход (Monte Carlo с distribution per dependency) точнее, но adoption низкий. Если у вас есть practice — расскажите через PR.
- **SLO Decomposition** — обратная задача: «нам нужен 99.95% user-facing, какой SLO budget per component». Не аддитивна, требует optimization.
- **Composite SLO ↔ Error Budget Policy integration** — как несколько journey-level error budgets взаимодействуют (один journey burning не должен блокировать deploys другого).
- Я не уверен, как **корректно учитывать correlated failures** в composite (один cloud region down → все зоны в регионе затронуты, math не аддитивна). Hidalgo упоминает, но не даёт canonical answer. Если есть practical model — расскажите через PR.
