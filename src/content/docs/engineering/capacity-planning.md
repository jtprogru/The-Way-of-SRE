---
title: Capacity Planning
description: Прогнозирование потребности в ресурсах — forecast, saturation thresholds, headroom, lead time
sfia: [3, 4, 5, 6]
status: draft
---

[Auto-scaling](/The-Way-of-SRE/glossary/#auto-scaling) в k8s сам по себе не решает capacity planning. Если кластер не имеет capacity под все auto-scale events — HPA увидит CPU, попробует scale-up, упрётся в node-pool limit или cloud quota, и сервис ляжет ровно так же, как до auto-scaling. Я регулярно вижу команды, считающие, что «у нас всё в k8s с HPA, planning не нужен». Capacity planning — это про **forecast** и **lead time**: какая ресурсная потребность будет через 1–4 квартала, сколько надо времени на приобретение, когда начинать действовать. Соседний лист к [SLO Engineering](/The-Way-of-SRE/engineering/slo-engineering/) под L1 `Reliability Engineering`.

## Что должен уметь

Главный навык на уровне L5 — формулировать **SLO-driven saturation thresholds**, а не «80% CPU = паника». У одного сервиса 95% CPU — норма (CPU-bound batch worker); у другого 50% — уже SLO breach (network-bound, deadline-sensitive). Threshold для capacity action определяется эмпирически: при каком уровне утилизации начинается деградация relevant SLI? Это и есть ваш threshold. Magic numbers из guidelines чужих команд — не работают.

**L3**
- Понимает типы ресурсов (CPU, memory, disk, network, file descriptors, DB connections, IOPS); знает, где смотреть текущую утилизацию.
- Читает forecast / capacity plan для своего сервиса; понимает, что значит «headroom 30%», «текущая capacity покрывает next quarter».

**L4**
- Считает headroom: текущее использование vs целевая saturation threshold; оценивает trajectory — когда достигнет limit при текущем growth rate.
- Обрабатывает capacity events: знает процедуру scale-up (auto-scaling triggers / manual provisioning / cloud quotas / vendor escalation).

**L5**
- Проектирует capacity model: какие saturation indicators (USE-method approach), SLO-driven thresholds, explicit headroom budget, lead times для cloud / managed / on-prem.
- Делает demand forecast на 1–4 квартала: активные пользователи, traffic patterns, seasonality, feature rollouts, marketing campaigns, M&A. Не «по ощущениям», а timeseries + assumptions.
- Интегрирует с finance: трекит cost-per-unit (per request, per active user, per GB) как метрику эффективности.

**L6+**
- Multi-service / org-level capacity planning: shared resource pools, cross-service dependencies, regional capacity strategy, vendor concentration risk.
- Strategic capacity decisions: vertical vs horizontal scaling в долгую, multi-region growth, build vs buy.

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
- **Forecasting libraries** — Facebook Prophet, statsmodels, простые linear regression на pandas. По моим наблюдениям, для большинства команд хватает простой linear regression — Prophet избыточен пока нет явной seasonality.
- **Capacity dashboards (custom)** — комбинация current utilization + 28-day moving average + forecasted trajectory + headroom budget в одном экране.

## Best practices

Планирование начинается с прогноза. Cloud quota поднимается за минуты, а железо в on-prem едет неделями, иногда месяцами, и разрыв между этими двумя цифрами — это, по сути, всё содержание практики: заметить нехватку раньше, чем закончится время, которое нужно на её устранение. Реакция «когда упёрлись» — это уже инцидент. Прогноз плюс знание своих lead time даёт фору начать раньше, чем saturation начнёт рушить SLO.

Пороги выводятся из SLO. Магические числа не работают: у CPU-bound batch worker и 95% CPU — норма, у network-bound сервиса с жёстким дедлайном 50% означает breach, и чужая методичка это за вас не решит. Способ один. Посмотреть эмпирически, при каком уровне утилизации начинает деградировать нужный SLI, и взять это число.

И отдельно про auto-scaling — путаница здесь самая частая. Реактивную часть он закрывает, burst переживёт. Но на вопросы «хватит ли кластеру capacity на все события масштабирования сразу», «когда докупать nodes» и «во что обойдётся следующий spike» auto-scaling не отвечает вообще. Он работает поверх планирования, не вместо.

**Headroom budget явный, не «у нас есть запас».** На «вроде есть запас» решения не принимаются. Headroom — это N% от capacity, обычно 30–50%, зарезервированные под burst, неожиданные spike и failover из соседних регионов. Опустились ниже — alert. Я регулярно вижу команды, у которых headroom — это просто «то, что осталось»; это не бюджет, это случайность.

**Планирование с оглядкой на lead time.** У каждого типа ресурса своё время приобретения: cloud autoscale — минуты, reserved instances — часы, специальное железо — недели, новый кластер со всеми интеграциями — месяцы. Точка действия считается как дата насыщения минус lead time минус safety margin. Для критичных on-prem компонентов запас — недели. Для cloud autoscale — минуты.

**Cost-per-unit как метрика эффективности.** «Мы растём, поэтому траты растут» — позиция, которая прячет неэффективность. Без unit economics не отличить здоровый рост, где cost-per-user стабилен, от ситуации, где стоимость пользователя обгоняет выручку. Cost per request, per active user, per GB — это проверка для решений по capacity, а не только финансовая отчётность.

## Связанные листья

- **[SLO Engineering](/The-Way-of-SRE/engineering/slo-engineering/)** — capacity headroom держит SLO достижимым; saturation thresholds выводятся из SLO-driven анализа. Без явных SLO — capacity numbers произвольны.
- **[SLI-based Alerting](/The-Way-of-SRE/engineering/sli-based-alerting/)** — saturation indicators (latency, error rate, queue depth) — отдельный класс SLI. Алертинг на saturation = early warning перед capacity-induced инцидентом.
- **[Toil Tracking](/The-Way-of-SRE/engineering/toil-tracking/)** — capacity events (manual scale-up, emergency provisioning, quota requests) — крупный класс toil.
- **[Infrastructure as Code](/The-Way-of-SRE/engineering/infrastructure-as-code/)** — capacity provisioning описывается как IaC; capacity decisions реализуются через PR в IaC repo.
- **[Service Ownership](/The-Way-of-SRE/culture/service-ownership/)** — каталог сервиса содержит данные о capacity: текущий resource budget, forecast horizon, owner.
- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — capacity-induced incidents — отдельный класс с собственным response (emergency scale-up, traffic shed, criticality demotion).
- **[Cost Management](/The-Way-of-SRE/engineering/cost-management/)** — capacity рассматривается с двух сторон: «хватит ли» (этот лист) и «во что обходится» (cost management). Forecast — один.
- **[Performance & Profiling](/The-Way-of-SRE/engineering/performance-profiling/)** — две стороны ресурса: «хватит ли» (этот лист) и «правильно ли используем те, что есть» (profiling). Resource efficiency через profiling — input для capacity decisions.

## Открытые вопросы

Два листа-соседа не написаны. **Auto-scaling Patterns** *(TBD)* — HPA, VPA, KEDA, cluster autoscaler, custom metrics, их тюнинг и антипаттерны. **Load Testing** *(TBD)* — как вообще проверять допущения модели capacity: locust, k6, gatling, vegeta.

Дальше идут темы, по которым у меня нет собственного связного ответа. **Multi-region Capacity Strategy** — балансировка между регионами, capacity под failover, изоляция насыщения одним регионом. **Handling Overload Patterns** — graceful degradation, criticality levels, throttling; отправная точка есть в SRE Book гл. 21.
