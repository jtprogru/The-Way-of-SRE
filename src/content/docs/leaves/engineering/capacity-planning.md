---
title: Capacity Planning
description: Прогнозирование потребности в ресурсах на горизонт N кварталов — demand forecast, saturation thresholds, headroom budget, lead time. Не «купить серверы когда упадёт»
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / Capacity Planning
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Прогнозирование потребности в ресурсах сервиса на горизонт N кварталов вперёд. Не «купим серверы когда упадёт», а **проактивная** дисциплина: demand forecast → saturation thresholds → headroom budget → lead time for acquisition → решение **когда** действовать, а не «уже упало». Главная связь — с SLO Engineering (capacity headroom держит SLO достижимым) и с Toil Tracking (capacity events — крупный класс toil). Соседний лист к [SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/) под L1 `Reliability Engineering`.

## Что должен уметь

- **L3** — Понимает типы ресурсов сервиса (CPU, memory, disk, network, file descriptors, DB connections, IOPS); знает, где смотреть текущую утилизацию своего сервиса (Prometheus / Grafana / cloud console).
- **L3** — Читает forecast / capacity plan для своего сервиса (если он есть в команде); понимает, что значит «headroom 30%», «текущая capacity покрывает next quarter».
- **L4** — Считает headroom: текущее использование vs целевая saturation threshold; оценивает trajectory — когда достигнет limit при текущем growth rate.
- **L4** — Обрабатывает capacity events: знает процедуру scale-up (auto-scaling triggers / manual provisioning / cloud quotas / vendor escalation); пишет capacity request с обоснованием.
- **L5** — Проектирует capacity model для сервиса: какие saturation indicators выбраны (USE-method approach), SLO-driven thresholds (не «80% CPU паника», а «при N% сатурации SLO начинает деградировать»), explicit headroom budget, lead times для cloud / managed / on-prem.
- **L5** — Делает demand forecast на 1-4 квартала вперёд по growth signals: active users, traffic patterns, seasonality, feature rollouts, marketing campaigns, M&A events. Доказательство — не «по ощущениям», а timeseries + assumptions.
- **L5** — Интегрирует с finance: трекит cost-per-unit (per request, per active user, per GB processed) как efficiency-метрику; растущая нагрузка ≠ автоматически растущие траты при efficiency improvements.
- **L6+** — Multi-service / org-level capacity planning: shared resource pools (multi-tenant clusters), cross-service dependencies (один сервис апскейлит → другой получает overload), regional capacity strategy, vendor concentration risk.
- **L6+** — Strategic capacity decisions: vertical vs horizontal scaling в долгую, multi-region growth, build vs buy для capacity-heavy components (managed DB vs self-host, CDN vs origin scale).

## Материалы

### Книги

- Joe Beda et al. (ред. Betsy Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/software-engineering-in-sre/)** (O'Reilly, 2016), глава 18 «Software Engineering in SRE». База: case study Auxon — Google's intent-based capacity planning tool (declarative service requirements → mixed-integer linear program → optimal resource allocation). Описывает проблемы традиционного capacity planning («brittle by nature») и intent-based подход.
- Alejandro Forero Cuervo (ред. Betsy Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/handling-overload/)** (O'Reilly, 2016), глава 21 «Handling Overload». Дополнительно: graceful degradation при capacity-overrun (client throttling, criticality levels, retry budgets). Важная пара к capacity planning — что делать, когда forecast ошибся.

### Статьи

- Brendan Gregg — **[The USE Method](https://www.brendangregg.com/usemethod.html)**. База: канонический systematic подход к performance / capacity analysis — для каждого resource проверь **Utilization**, **Saturation**, **Errors**; «solves 80% of server issues with 5% of the effort». Применимо в выборе saturation indicators для capacity model.

### Инструменты

- **Prometheus + Grafana** — мониторинг resource utilization / saturation; recording rules для derived метрик (RPS, p99, error rate); dashboards для capacity (current + projected). Дополняется alerting'ом на saturation thresholds.
- **Auto-scaling в k8s** — **HPA** (Horizontal Pod Autoscaler) по CPU / memory / custom metrics, **VPA** (Vertical Pod Autoscaler) для resource recommendations, **Cluster Autoscaler** для node-level scaling. Auto-scaling решает **reactive** часть, но не replaces capacity planning.
- **Cloud cost / capacity tools** — AWS Compute Optimizer, GCP Recommender, Azure Advisor. Дают рекомендации по rightsizing и резервированию; интегрируются в forecast.
- **Forecasting libraries** — Facebook Prophet, statsmodels, простые linear regression на pandas. Для команд, которым нужны formal time-series forecasts (не «вручную в Excel»).
- **Capacity dashboards (custom)** — комбинация current utilization + 28-day moving average + forecasted trajectory + headroom budget в одном экране; обновляется auto + ревьюится на capacity review meeting.

## Best practices

- **Forecast-driven, не reactive.** Антипаттерн: «запас закончился — паника». Capacity вырабатывается медленно (cloud quotas могут расти minutes, on-prem hardware procurement — недели или месяцы); запоздалая реакция = инцидент с user impact. Forecasting + lead-time-awareness даёт возможность действовать до того, как saturation начинает рушить SLO.
- **SLO-driven thresholds, не magic numbers.** Антипаттерн: «80% CPU — паника» без обоснования. У одного сервиса 95% CPU — норма (CPU-bound batch worker); у другого 50% — already SLO breach (network-bound, deadline-sensitive). Saturation thresholds для capacity action определяются эмпирически: при каком уровне начинается деградация relevant SLI? Это и есть threshold.
- **Headroom budget explicit, не «у нас есть запас».** Антипаттерн: vague «вроде есть запас». Без явного числа невозможно принимать решения. Headroom budget — N% от capacity (типичный N: 30-50%), резервируется под burst traffic, неожиданные spike'и, failover из соседних регионов. Под бюджетом — alert.
- **Lead-time-aware planning.** Антипаттерн: те же решения для cloud (минуты на scale) и on-prem (недели на procurement). У каждого resource type — свой lead time для acquisition. Capacity planning явно учитывает lead time: action point = saturation date − lead time − safety margin. Для on-prem критичных компонентов safety margin недели, для cloud autoscale — минуты.
- **Cost-per-unit как efficiency metric.** Антипаттерн: «мы растём, поэтому траты растут — нормально». Без unit economics невозможно отличить healthy growth (cost-per-user стабильный) от inefficiency (cost-per-user растёт быстрее revenue). Tracking cost-per-request / per-active-user / per-GB-processed — обязательный compliance check для capacity decisions.
- **Auto-scaling ≠ capacity planning.** Антипаттерн: «у нас всё в k8s с HPA, capacity planning не нужен». Auto-scaling решает **reactive** часть (быстрая адаптация к burst'у), но не отвечает на «хватит ли cluster capacity для всех auto-scale events» или «когда нужно докупить nodes», или «во что нам обойдётся следующий spike». Auto-scale работает поверх capacity planning, не вместо.

## Связанные листья

- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — capacity headroom держит SLO достижимым; saturation thresholds для capacity action выводятся из SLO-driven анализа. Без явных SLO — capacity numbers произвольны.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — saturation indicators — отдельный класс SLI (latency, error rate, queue depth). Алертинг на saturation = early warning system перед capacity-induced инцидентом.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — capacity events (manual scale-up, emergency provisioning, quota requests) — крупный класс toil; tracking ловит signal «слишком много manual capacity work → автоматизировать».
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — capacity provisioning (компоненты cluster'а, RDS instance class, ECS task count) описывается как IaC; capacity decisions реализуются через PR в IaC repo.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит capacity-метаданные: текущий resource budget, forecast horizon, owner для capacity decisions.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — capacity-induced incidents — отдельный класс с собственным response (emergency scale-up, traffic shed, criticality demotion); граница с handling-overload patterns.

## Открытые вопросы

- **Auto-scaling Patterns** *(TBD)* — детальная подтема (HPA / VPA / KEDA / cluster autoscaler / custom metrics; tuning, anti-patterns auto-scaling). Соседняя практика, возможно отдельный лист.
- **Load Testing** *(TBD)* — практика проверки capacity assumptions (locust, k6, gatling, vegeta); подтверждает или опровергает saturation thresholds. Соседняя практика на стыке Reliability Engineering и Performance.
- **Cost Optimization как отдельная practice** *(TBD)* — FinOps tooling, reserved capacity, spot instances, idle resource cleanup. Граница с capacity planning через cost-per-unit; возможно отдельный лист.
- **Multi-region Capacity Strategy** — отдельная подтема: regional balancing, failover capacity, regional saturation isolation. Возможно отдельный лист.
- **Handling Overload Patterns** — graceful degradation, criticality levels, throttling — отдельная практика (cross-ref с SRE Book гл. 21). Соседний лист.
