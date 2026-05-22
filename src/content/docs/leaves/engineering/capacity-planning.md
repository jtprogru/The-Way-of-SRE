---
title: Capacity Planning
description: Прогнозирование потребности в ресурсах — forecast, saturation thresholds, headroom, lead time
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / Capacity Planning
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

[Auto-scaling](/The-Way-of-SRE/glossary/#auto-scaling) в k8s сам по себе не решает capacity planning. Если кластер не имеет capacity под все auto-scale events — HPA увидит CPU, попробует scale-up, упрётся в node-pool limit или cloud quota, и сервис ляжет ровно так же, как до auto-scaling. Я регулярно вижу команды, считающие, что «у нас всё в k8s с HPA, planning не нужен». Capacity planning — это про **forecast** и **lead time**: какая ресурсная потребность будет через 1–4 квартала, сколько надо времени на приобретение, когда начинать действовать. Соседний лист к [SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/) под L1 `Reliability Engineering`.

## Что должен уметь

Главный навык на уровне L5 — формулировать **SLO-driven saturation thresholds**, а не «80% CPU = паника». У одного сервиса 95% CPU — норма (CPU-bound batch worker); у другого 50% — already SLO breach (network-bound, deadline-sensitive). Threshold для capacity action определяется эмпирически: при каком уровне утилизации начинается деградация relevant SLI? Это и есть ваш threshold. Magic numbers из guidelines чужих команд — не работают.

- **L3** — Понимает типы ресурсов (CPU, memory, disk, network, file descriptors, DB connections, IOPS); знает, где смотреть текущую утилизацию.
- **L3** — Читает forecast / capacity plan для своего сервиса; понимает, что значит «headroom 30%», «текущая capacity покрывает next quarter».
- **L4** — Считает headroom: текущее использование vs целевая saturation threshold; оценивает trajectory — когда достигнет limit при текущем growth rate.
- **L4** — Обрабатывает capacity events: знает процедуру scale-up (auto-scaling triggers / manual provisioning / cloud quotas / vendor escalation).
- **L5** — Проектирует capacity model: какие saturation indicators (USE-method approach), SLO-driven thresholds, explicit headroom budget, lead times для cloud / managed / on-prem.
- **L5** — Делает demand forecast на 1–4 квартала: active users, traffic patterns, seasonality, feature rollouts, marketing campaigns, M&A. Не «по ощущениям», а timeseries + assumptions.
- **L5** — Интегрирует с finance: трекит cost-per-unit (per request, per active user, per GB) как efficiency-метрику.
- **L6+** — Multi-service / org-level capacity planning: shared resource pools, cross-service dependencies, regional capacity strategy, vendor concentration risk.
- **L6+** — Strategic capacity decisions: vertical vs horizontal scaling в долгую, multi-region growth, build vs buy.

## Материалы

### Книги

- Joe Beda et al. (ред. Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/software-engineering-in-sre/)** (O'Reilly, 2016), глава 18 «Software Engineering in SRE». Case study Auxon — Google's intent-based capacity planning; описывает проблемы традиционного capacity planning и intent-based подход.
- Alejandro Forero Cuervo (ред. Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/handling-overload/)** (O'Reilly, 2016), глава 21 «Handling Overload». Что делать, когда forecast ошибся (client throttling, criticality levels, retry budgets).

### Статьи

- Brendan Gregg — **[The USE Method](https://www.brendangregg.com/usemethod.html)**. Канонический systematic подход к performance / capacity: для каждого resource — **Utilization**, **Saturation**, **Errors**. «Solves 80% of server issues with 5% of the effort». Применимо в выборе saturation indicators для capacity model.

### Инструменты

- **Prometheus + Grafana** — мониторинг утилизации/сатурации; recording rules для derived метрик; dashboards для capacity (current + projected). Дополняется alerting на saturation thresholds.
- **Auto-scaling в k8s** — **HPA** (Horizontal Pod Autoscaler) по CPU / memory / custom metrics, **VPA** (Vertical Pod Autoscaler) для resource recommendations, **Cluster Autoscaler** для node-level. Решает **reactive** часть, но не заменяет planning.
- **Cloud cost / capacity tools** — AWS Compute Optimizer, GCP Recommender, Azure Advisor. Дают рекомендации по rightsizing и резервированию.
- **Forecasting libraries** — Facebook Prophet, statsmodels, простые linear regression на pandas. По моим наблюдениям, для большинства команд хватает простой linear regression — Prophet over-kill пока нет явной seasonality.
- **Capacity dashboards (custom)** — комбинация current utilization + 28-day moving average + forecasted trajectory + headroom budget в одном экране.

## Best practices

**Короткие правила:**

- **Forecast-driven, не reactive.** Cloud quotas могут расти minutes, on-prem hardware procurement — недели/месяцы. Запоздалая реакция = инцидент с user impact. Forecasting + lead-time-awareness даёт возможность действовать до того, как saturation начинает рушить SLO.
- **SLO-driven thresholds, не magic numbers.** «80% CPU — паника» без обоснования. У одного сервиса 95% CPU — норма; у другого 50% — already SLO breach. Saturation thresholds определяются эмпирически: при каком уровне начинается деградация relevant SLI?
- **Auto-scaling ≠ capacity planning.** Auto-scaling решает **reactive** часть (быстрая адаптация к burst), но не отвечает на «хватит ли cluster capacity для всех auto-scale events», «когда нужно докупить nodes», «во что нам обойдётся следующий spike». Auto-scale работает поверх planning, не вместо.

Подробнее:

**Headroom budget explicit, не «у нас есть запас».** Vague «вроде есть запас» — невозможно принимать решения. Headroom budget — N% от capacity (типичный N: 30–50%), резервируется под burst traffic, неожиданные spike, failover из соседних регионов. Под бюджетом — alert. Я регулярно вижу команды, у которых «headroom» — это «то, что осталось»; это не headroom, это случайность.

**Lead-time-aware planning.** У каждого resource type — свой lead time для acquisition: cloud autoscale (минуты), reserved instances (часы), специальный hardware (недели), новый кластер с интеграциями (месяцы). Capacity planning явно учитывает: action point = saturation date − lead time − safety margin. Для on-prem критичных компонентов safety margin — недели; для cloud autoscale — минуты.

**Cost-per-unit как efficiency metric.** «Мы растём, поэтому траты растут — нормально» — позиция, которая прячет inefficiency. Без unit economics невозможно отличить healthy growth (cost-per-user стабильный) от неэффективности (cost-per-user растёт быстрее revenue). Tracking cost-per-request / per-active-user / per-GB-processed — обязательная проверка для capacity decisions, не только финансовая метрика.

## Связанные листья

- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — capacity headroom держит SLO достижимым; saturation thresholds выводятся из SLO-driven анализа. Без явных SLO — capacity numbers произвольны.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — saturation indicators (latency, error rate, queue depth) — отдельный класс SLI. Алертинг на saturation = early warning перед capacity-induced инцидентом.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — capacity events (manual scale-up, emergency provisioning, quota requests) — крупный класс toil.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — capacity provisioning описывается как IaC; capacity decisions реализуются через PR в IaC repo.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит capacity-метаданные: текущий resource budget, forecast horizon, owner.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — capacity-induced incidents — отдельный класс с собственным response (emergency scale-up, traffic shed, criticality demotion).

## Открытые вопросы

- **Auto-scaling Patterns** *(TBD)* — HPA / VPA / KEDA / cluster autoscaler / custom metrics; tuning, anti-patterns.
- **Load Testing** *(TBD)* — практика проверки capacity assumptions (locust, k6, gatling, vegeta).
- **Cost Optimization как отдельная practice** *(TBD)* — FinOps tooling, reserved capacity, spot instances, idle resource cleanup.
- **Multi-region Capacity Strategy** — regional balancing, failover capacity, regional saturation isolation.
- **Handling Overload Patterns** — graceful degradation, criticality levels, throttling (cross-ref с SRE Book гл. 21).
