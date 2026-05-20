---
title: Resilience Patterns
description: Набор явных правил, позволяющих сервису продолжать работать «прилично» при отказах зависимостей, перегрузке и временных сетевых проблемах — не магия, а composable приёмы. Не подменяет capacity planning, а закрывает «что делать, когда forecast ошибся»
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / Resilience Patterns
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Сервис, который продолжает работать «прилично» при отказах зависимостей, перегрузке и временных сетевых проблемах. Не отказоустойчивость как магия, а **набор явных правил**: circuit breaker, retry with backoff + jitter, timeout cascade, bulkhead-изоляция, graceful degradation, idempotency. Соседний лист к [Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/) и [SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/) под L1 `Reliability Engineering`. Граница: capacity planning — **готовимся** к нагрузке; resilience patterns — **выживаем**, когда подготовка не сработала.

## Что должен уметь

- **L3** — Знает базовый набор паттернов (circuit breaker, retry, timeout, fallback); применяет их через библиотеки своего стека (Polly / resilience4j / Tenacity / retry-axios), не изобретая велосипед.
- **L3** — Понимает разницу между liveness и readiness probes; пишет адекватные health checks для своего сервиса (shallow «процесс жив» vs deep «зависимости доступны»).
- **L4** — Реализует retry с **exponential backoff + jitter**; знает, почему «retry без jitter = thundering herd» и почему «infinite retry без circuit breaker = retry amplification cascade».
- **L4** — Управляет timeouts иерархически: cascading timeouts (внутренний < внешнего с запасом на retry), отказ от bare network defaults (часто бесконечные), идея deadline propagation между микросервисами.
- **L5** — Проектирует bulkhead-изоляцию: connection pools / thread pools / queue partitions, чтобы перегрузка одной зависимости не съедала ресурсы остальных. Анализирует blast radius для каждой критичной зависимости.
- **L5** — Реализует graceful degradation с явными criticality levels: feature flags для отключения некритичных функций, fallback responses, кешированные данные при отказе primary source. Degraded mode описан и тестируется в game day.
- **L5** — Делает idempotency requirement для всех retry-safe операций: idempotency keys, ETags, conditional writes (compare-and-swap), transaction outbox. Без этого retry превращается в double-write / double-charge.
- **L6+** — Проектирует load shedding и backpressure: criticality-based prioritization, drop low-criticality traffic при overload, queue-depth-based admission control, retry budget на уровне сервиса (запрет неограниченных retry).
- **L6+** — Внедряет chaos engineering как practice проверки resilience patterns: failure injection (network partition, latency injection, dependency kill), game day сценарии с явными success criteria, observability на failure modes (метрики circuit-breaker state, retry rate, shed-rate).

## Материалы

### Книги

- Michael Nygard — **[Release It! Design and Deploy Production-Ready Software](https://pragprog.com/titles/mnee2/release-it-second-edition/)** (Pragmatic Bookshelf, 2-е изд., 2018). **База.** Каноническая книга по resilience: глава 5 «Stability Patterns» (circuit breaker, bulkhead, steady state, fail fast), глава 4 «Stability Antipatterns» (chain reactions, cascading failures, blocked threads). После 20 лет — всё ещё лучший single-source.
- Cindy Sridharan — **[Distributed Systems Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)** (O'Reilly, 2018). **Дополнительно.** Связь resilience patterns и observability: как увидеть что circuit breaker открыт, как поймать retry storm в метриках, какие SLI выбрать для failure modes.

### Статьи и доклады

- **[Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)** — SRE Book гл. 22. **База.** Канонический разбор: причины cascading failure, retry amplification, server overload, query-of-death; как resilience patterns её предотвращают.
- **[Handling Overload](https://sre.google/sre-book/handling-overload/)** — SRE Book гл. 21. **База.** Дополняет предыдущую: client-side throttling, criticality levels, retry budgets, deadlines (deadline propagation в RPC).
- Marc Brooker — **[Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)** (AWS Architecture Blog, 2015). **База.** Один из лучших explainer'ов про jitter: full jitter vs equal jitter vs decorrelated jitter с симуляциями. Объясняет, почему linear backoff даёт thundering herd.
- Netflix Tech Blog — **[Making the Netflix API more resilient](https://netflixtechblog.com/making-the-netflix-api-more-resilient-a8ec62159c2d)**. **Дополнительно.** История появления Hystrix и обоснование bulkhead patterns на реальной системе (бубен, который пара 10+ команд могла случайно зацепить).

### Инструменты

- **[resilience4j](https://resilience4j.readme.io/)** (Java) — современная замена Hystrix. Circuit breaker, retry, rate limiter, bulkhead, timeout как **composable** модули, не монолит.
- **[Polly](https://github.com/App-vNext/Polly)** (.NET) — каноническая resilience library для .NET. Fluent API, те же patterns. Хорошая документация с обоснованиями.
- **[Tenacity](https://tenacity.readthedocs.io/)** (Python) — простая retry library с обширной конфигурацией backoff / jitter / stop conditions. Если кроме retry больше ничего не нужно — её достаточно.
- **[Envoy / Istio circuit breaking](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking)** — service mesh уровень: circuit breaking, outlier detection, retries на уровне sidecar — без изменения кода приложения. Подходит, когда сервис не может быть изменён или язык не имеет хорошей resilience-библиотеки.
- **[Chaos Mesh](https://chaos-mesh.org/)** / **[Litmus](https://litmuschaos.io/)** / **[AWS Fault Injection Service](https://aws.amazon.com/fis/)** — chaos engineering tools для проверки resilience patterns в действии. Без них patterns остаются «должно работать» на бумаге.

## Best practices

- **Retry только на idempotent операциях; идемпотентность — пре-условие, а не «допилим потом».** Антипаттерн: «добавим retry на этот payment endpoint, idempotency сделаем в следующем спринте». Каждый retry без idempotency key — потенциальный double-write / double-charge. Idempotency либо в API контракте, либо retry отключён. Idempotency keys + dedup window — типовая реализация.
- **Exponential backoff + jitter — обязательны; linear retry даёт thundering herd.** Антипаттерн: «retry 5 раз с интервалом 1s». При сбое downstream'а все клиенты бьются синхронно одной волной, и downstream не успевает восстановиться. Equal jitter (random между half и full backoff) распределяет нагрузку. Для AWS-style клиентов — decorrelated jitter ещё лучше.
- **Circuit breaker без явной recovery strategy = «открылся навсегда».** Антипаттерн: написали open → half-open → close, не подумали, **что должно произойти** для перехода. Recovery: после `cooldown` пропустить 1 пробный запрос; успех → close, fail → обратно в open с увеличенным cooldown. Метрики circuit state — обязательны в дашборде сервиса.
- **Timeouts cascade: внутренний < внешнего с запасом на retry.** Антипаттерн: внешний клиент timeout 30s, internal RPC timeout тоже 30s — внутренний всегда «успевает» по своему таймеру, но клиент уже отвалился. Каждый уровень должен timeout раньше родителя на retry-budget + safety margin. Deadline propagation (передача remaining time через gRPC headers / Twirp metadata) — продвинутый уровень.
- **Health check ≠ business logic check.** Антипаттерн: liveness probe лезет в DB и возвращает fail, если DB недоступна. При DB outage k8s перезапускает **все** pods — каскад. Liveness отвечает «процесс жив?», readiness — «готов принимать traffic?». DB outage отключает readiness (трафик не идёт), но **не** liveness (pod не рестартят бессмысленно).
- **Graceful degradation требует явных criticality levels.** Антипаттерн: «при overload отключим что-нибудь». Без классификации сервисов / запросов на critical / important / shedable невозможно решать, что shed-нуть. SRE Book вводит criticality model — critical / shedable+ / shedable. Признак зрелого сервиса: degraded mode явно описан и регулярно тестируется (game day).
- **Resilience patterns без observability — слепое пятно.** Антипаттерн: добавили circuit breaker и retry, но не выводим метрики «retry rate», «circuit state», «shed rate». В инциденте не видно, активны ли patterns; на ревью неясно, помогают или маскируют проблему. Каждый pattern — отдельный SLI и dashboard panel.

## Связанные листья

- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — resilience patterns закрывают ситуацию, когда capacity исчерпан или forecast ошибся. Graceful degradation + load shedding — что делается на ту секунду, пока scaling догоняет (если вообще догонит).
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — patterns поддерживают SLO под нагрузкой и при отказах. Circuit breaker не даёт error budget сгореть на cascade-фейлах: dependency недоступна — отдаём fallback быстро, не накапливаем латенси.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — timeouts, retry, circuit breaker патчат network unreliability. Service mesh реализует часть patterns на инфра-слое (Envoy retry/timeout policies, outlier detection).
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — алерты ловят момент, когда resilience patterns активировались (circuit open, retry rate up, shed rate ≠ 0). Это **сигнал**, что зависимость или сам сервис нездоровы, и symptom-based алертинг через SLO burn rate ловит downstream impact.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — patterns снижают вероятность инцидента **и** упрощают response. Если circuit открыт — runbook сразу видит, какая dependency недоступна; не нужно искать симптомы.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — canary с health gate использует readiness probes и circuit-breaker метрики. Новая версия продвигается, только если resilience-сигналы зелёные.

## Открытые вопросы

- **Chaos Engineering as practice** *(TBD)* — отдельный лист про game day, fault injection как ритуал (а не разовая активность), история Chaos Monkey, GameDays Amazon-style. Граница: Resilience Patterns — что строим в коде; Chaos Engineering — как проверяем что построенное работает.
- **Service Mesh patterns** *(TBD)* — реализация resilience на уровне Envoy/Istio sidecar (circuit breaking, outlier detection, retry policies без изменения кода). Может стать частью отдельного листа Service Mesh под IT Infrastructure.
- **Idempotency Patterns** *(TBD)* — отдельный лист: idempotency keys, ETags, conditional writes, transaction outbox, exactly-once illusion. Глубокая самостоятельная тема.
- **Backpressure & Load Shedding** *(TBD)* — «downstream direction» graceful degradation: criticality classification, admission control, queue management, retry budgets. Возможно отдельный лист, если накопится материал.
- **Resilience SLIs** — какой SLI выбрать для самих patterns (circuit-open ratio, retry success rate, shed rate)? Граница с SLI-based Alerting — там общий фреймворк, здесь — конкретный набор для resilience-патернов.
