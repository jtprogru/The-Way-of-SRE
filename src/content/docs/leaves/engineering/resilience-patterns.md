---
title: Resilience Patterns
description: Явные правила, по которым сервис выживает при отказах зависимостей и перегрузке
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / Resilience Patterns
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Resilience — не магия, а **набор явных правил**: circuit breaker, retry with backoff + jitter, timeout cascade, bulkhead-изоляция, graceful degradation, [idempotency](/The-Way-of-SRE/glossary/#idempotency). Каждое из этих правил легко описывается, но я регулярно вижу команды, которые знают слова, но не реализуют дисциплинированно: retry без jitter (thundering herd при первом downtime), circuit breaker без recovery strategy («открылся навсегда»), idempotency «допилим потом» (а deploy уже завтра). Лист — про дисциплину применения. Соседний лист к [Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/) и [SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/) под L1 `Reliability Engineering`. Граница: capacity planning — **готовимся** к нагрузке; resilience patterns — **выживаем**, когда подготовка не сработала.

## Что должен уметь

Главный навык на уровне L4 — реализовать **exponential backoff + jitter** правильно. Я регулярно вижу команды, которые написали retry «с backoff», но не добавили jitter — и при первом downtime получили retry-storm, добивший downstream. Marc Brooker написал лучший разбор (AWS Architecture Blog 2015) — full jitter vs equal jitter vs decorrelated jitter с симуляциями. Это материал на час чтения и год пользы.

- **L3** — Знает базовый набор паттернов (circuit breaker, retry, timeout, fallback); применяет их через библиотеки своего стека (Polly / resilience4j / Tenacity / retry-axios), не изобретая велосипед.
- **L3** — Понимает разницу между liveness и readiness probes; пишет адекватные health checks (shallow «процесс жив» vs deep «зависимости доступны»).
- **L4** — Реализует retry с **exponential backoff + jitter**; знает, почему «retry без jitter = thundering herd» и почему «infinite retry без circuit breaker = retry amplification cascade».
- **L4** — Управляет timeouts иерархически: cascading timeouts (внутренний < внешнего с запасом на retry), отказ от bare network defaults, deadline propagation между микросервисами.
- **L5** — Проектирует bulkhead-изоляцию: connection pools / thread pools / queue partitions, чтобы перегрузка одной зависимости не съедала ресурсы остальных.
- **L5** — Реализует graceful degradation с явными criticality levels: feature flags для отключения некритичных функций, fallback responses, кешированные данные. Degraded mode описан и тестируется в game day.
- **L5** — Делает idempotency requirement для всех retry-safe операций: idempotency keys, ETags, conditional writes, transaction outbox.
- **L6+** — Проектирует load shedding и backpressure: criticality-based prioritization, drop low-criticality traffic при overload, queue-depth-based admission control, retry budget на уровне сервиса.
- **L6+** — Внедряет [chaos engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/) как практику проверки resilience patterns в действии.

## Материалы

### Книги

- Michael Nygard — **[Release It! Design and Deploy Production-Ready Software](https://pragprog.com/titles/mnee2/release-it-second-edition/)** (Pragmatic Bookshelf, 2-е изд., 2018). Каноническая книга по resilience: глава 5 «Stability Patterns» (circuit breaker, bulkhead, steady state, fail fast), глава 4 «Stability Antipatterns». После 20 лет — всё ещё лучший single-source.
- Cindy Sridharan — **[Distributed Systems Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)** (O'Reilly, 2018). Связь resilience patterns и observability: как увидеть, что circuit breaker открыт, как поймать retry storm в метриках.

### Статьи и доклады

- **[Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)** — SRE Book гл. 22. Канонический разбор: причины cascading failure, retry amplification, server overload, query-of-death.
- **[Handling Overload](https://sre.google/sre-book/handling-overload/)** — SRE Book гл. 21. Дополняет: client-side throttling, criticality levels, retry budgets, deadlines (deadline propagation в RPC).
- Marc Brooker — **[Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)** (AWS Architecture Blog, 2015). Главный публичный кейс — см. ниже.
- Netflix Tech Blog — **[Making the Netflix API more resilient](https://netflixtechblog.com/making-the-netflix-api-more-resilient-a8ec62159c2d)**. История появления Hystrix и обоснование bulkhead patterns на реальной системе.

### Инструменты

- **[resilience4j](https://resilience4j.readme.io/)** (Java) — современная замена Hystrix. Circuit breaker, retry, rate limiter, bulkhead, timeout как **composable** модули, не монолит. По моим наблюдениям, чаще выбирают именно её для нового Java-кода.
- **[Polly](https://github.com/App-vNext/Polly)** (.NET) — каноническая resilience library. Fluent API, те же patterns.
- **[Tenacity](https://tenacity.readthedocs.io/)** (Python) — простая retry library с обширной конфигурацией backoff / jitter / stop conditions. Если кроме retry больше ничего не нужно — её достаточно.
- **[Envoy / Istio circuit breaking](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking)** — service mesh уровень: circuit breaking, outlier detection, retries на уровне sidecar без изменения кода. Подходит, когда сервис нельзя менять или язык не имеет хорошей resilience-библиотеки.
- **[Chaos Mesh](https://chaos-mesh.org/)** / **[Litmus](https://litmuschaos.io/)** / **[AWS Fault Injection Service](https://aws.amazon.com/fis/)** — chaos engineering tools для проверки resilience patterns в действии.

## Best practices

Главный публичный кейс на тему backoff — **Marc Brooker, «Exponential Backoff and Jitter» (AWS Architecture Blog, 2015)**. В статье симуляциями показано: при общем downtime downstream клиенты с linear retry бьются синхронно одной волной (thundering herd), и downstream не успевает восстановиться. Equal jitter (random между half и full backoff) распределяет нагрузку. Для AWS-style клиентов decorrelated jitter ещё лучше — приведена формула и графики. Если кто-то в команде написал retry без jitter — отправляйте на эту статью первым делом. Один час чтения, который окупается за первый же downtime.

**Короткие правила:**

- **Retry только на idempotent операциях; идемпотентность — пре-условие, а не «допилим потом».** Каждый retry без idempotency key — потенциальный double-write / double-charge. Idempotency либо в API контракте, либо retry отключён. Idempotency keys + dedup window — типовая реализация.
- **Exponential backoff + jitter — обязательны; linear retry даёт thundering herd.** «Retry 5 раз с интервалом 1s» при сбое downstream — все клиенты бьются синхронно. Equal jitter распределяет нагрузку, decorrelated jitter — ещё лучше.
- **Health check ≠ business logic check.** Liveness probe лезет в DB и возвращает fail при DB outage → k8s перезапускает **все** pods → каскад. Liveness отвечает «процесс жив?»; readiness — «готов принимать traffic?». DB outage отключает readiness, но **не** liveness.

Подробнее:

**Circuit breaker без явной recovery strategy = «открылся навсегда».** Написали open → half-open → close, не подумали, **что должно произойти** для перехода. Recovery: после cooldown пропустить 1 пробный запрос; успех → close, fail → обратно в open с увеличенным cooldown. Метрики circuit state — обязательны в дашборде сервиса; без visibility непонятно, когда CB активен.

**Timeouts cascade: внутренний < внешнего с запасом на retry.** Внешний клиент timeout 30s, internal RPC timeout тоже 30s — внутренний всегда «успевает» по своему таймеру, но клиент уже отвалился. Каждый уровень должен timeout раньше родителя на retry-budget + safety margin. Deadline propagation (передача remaining time через gRPC headers / Twirp metadata) — продвинутый уровень, но решает целую категорию проблем cascade.

**Graceful degradation требует явных criticality levels.** «При overload отключим что-нибудь» — без классификации сервисов / запросов на critical / important / shedable невозможно решать, что shed. SRE Book вводит criticality model — critical / shedable+ / shedable. Признак зрелого сервиса: degraded mode явно описан и регулярно тестируется (game day). По моим наблюдениям, без criticality labels graceful degradation существует только на бумаге.

**Resilience patterns без observability — слепое пятно.** Добавили circuit breaker и retry, но не выводим метрики «retry rate», «circuit state», «shed rate» — в инциденте не видно, активны ли patterns; на ревью неясно, помогают они или маскируют проблему. Каждый pattern — отдельный SLI и dashboard panel. Это базовая дисциплина, которую часто откладывают.

## Связанные листья

- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — resilience patterns закрывают ситуацию, когда capacity исчерпан или forecast ошибся. Graceful degradation + load shedding — что делается, пока scaling догоняет (если догонит).
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — patterns поддерживают SLO под нагрузкой и при отказах. Circuit breaker не даёт error budget сгореть на cascade-фейлах.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — timeouts, retry, circuit breaker патчат network unreliability. Service mesh реализует часть patterns на инфра-слое.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — алерты ловят момент активации patterns (circuit open, retry rate up, shed rate ≠ 0).
- **[Chaos Engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/)** — chaos валидирует patterns: circuit breaker реально открывается? retry с backoff не амплифицирует? bulkhead изолирует?
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — canary с health gate использует readiness probes и circuit-breaker метрики.
- **[Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)** — OS-level health (open file descriptors, conntrack, page cache pressure) — то, на что часто реагирует graceful degradation; resilience pattern triggers — kernel signals.

## Открытые вопросы

- **Service Mesh patterns** *(TBD)* — реализация resilience на уровне Envoy/Istio sidecar (circuit breaking, outlier detection, retry policies без изменения кода).
- **Idempotency Patterns** *(TBD)* — отдельный лист: idempotency keys, ETags, conditional writes, transaction outbox, exactly-once illusion.
- **Backpressure & Load Shedding** *(TBD)* — «downstream direction» graceful degradation: criticality classification, admission control, queue management, retry budgets.
- **Resilience SLIs** — какой SLI выбрать для самих patterns (circuit-open ratio, retry success rate, shed rate)?
