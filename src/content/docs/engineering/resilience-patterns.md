---
title: Resilience Patterns
description: Явные правила, по которым сервис выживает при отказах зависимостей и перегрузке
sfia: [3, 4, 5, 6]
status: draft
---

Resilience — не магия, а **набор явных правил**: circuit breaker, retry with backoff + jitter, timeout cascade, изоляция bulkhead, graceful degradation, [idempotency](/The-Way-of-SRE/glossary/#idempotency). Каждое из этих правил легко описывается, но я регулярно вижу команды, которые знают слова, но не реализуют дисциплинированно: retry без jitter (thundering herd при первом downtime), circuit breaker без recovery strategy («открылся навсегда»), idempotency «допилим потом» (а deploy уже завтра). Лист — про дисциплину применения. Соседний лист к [Capacity Planning](/The-Way-of-SRE/engineering/capacity-planning/) и [SLO Engineering](/The-Way-of-SRE/engineering/slo-engineering/) под L1 `Reliability Engineering`. Граница: capacity planning — **готовимся** к нагрузке; resilience patterns — **выживаем**, когда подготовка не сработала.

## Что должен уметь

Главный навык на уровне L4 — реализовать **exponential backoff + jitter** правильно. Я регулярно вижу команды, которые написали retry «с backoff», но не добавили jitter — и при первом downtime получили retry-storm, добивший downstream. Marc Brooker написал лучший разбор (AWS Architecture Blog 2015) — full jitter vs equal jitter vs decorrelated jitter с симуляциями. Это материал на час чтения и год пользы.

**L3**
- Знает базовый набор паттернов (circuit breaker, retry, timeout, fallback); применяет их через библиотеки своего стека (Polly / resilience4j / Tenacity / retry-axios), не изобретая велосипед.
- Понимает разницу между liveness и readiness probes; пишет адекватные health checks (shallow «процесс жив» vs deep «зависимости доступны»).

**L4**
- Реализует retry с **exponential backoff + jitter**; знает, почему «retry без jitter = thundering herd» и почему «infinite retry без circuit breaker = retry amplification cascade».
- Управляет timeouts иерархически: cascading timeouts (внутренний < внешнего с запасом на retry), отказ от bare network defaults, deadline propagation между микросервисами.

**L5**
- Проектирует изоляцию bulkhead: connection pools / thread pools / queue partitions, чтобы перегрузка одной зависимости не съедала ресурсы остальных.
- Реализует graceful degradation с явными criticality levels: feature flags для отключения некритичных функций, fallback responses, кешированные данные. Degraded mode описан и тестируется в game day.
- Делает idempotency requirement для всех retry-safe операций: idempotency keys, ETags, conditional writes, transaction outbox.

**L6+**
- Проектирует load shedding и backpressure: criticality-based prioritization, drop low-criticality traffic при overload, queue-depth-based admission control, retry budget на уровне сервиса.
- Внедряет [chaos engineering](/The-Way-of-SRE/engineering/chaos-engineering/) как практику проверки resilience patterns в действии.

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

- **[resilience4j](https://resilience4j.readme.io/)** (Java) — современная замена Hystrix. Circuit breaker, retry, rate limiter, bulkhead, timeout как **composable** модули, не монолит. По моим наблюдениям, для нового кода на Java чаще выбирают именно её.
- **[Polly](https://github.com/App-vNext/Polly)** (.NET) — каноническая resilience library. Fluent API, те же patterns.
- **[Tenacity](https://tenacity.readthedocs.io/)** (Python) — простая retry library с обширной конфигурацией backoff / jitter / stop conditions. Если кроме retry больше ничего не нужно — её достаточно.
- **[Envoy / Istio circuit breaking](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking)** — service mesh уровень: circuit breaking, outlier detection, retries на уровне sidecar без изменения кода. Подходит, когда сервис нельзя менять или в языке нет хорошей библиотеки устойчивости.
- **[Chaos Mesh](https://chaos-mesh.org/)** / **[Litmus](https://litmuschaos.io/)** / **[AWS Fault Injection Service](https://aws.amazon.com/fis/)** — chaos engineering tools для проверки resilience patterns в действии.

## Best practices

Главный публичный кейс на тему backoff — **Marc Brooker, «Exponential Backoff and Jitter» (AWS Architecture Blog, 2015)**. В статье симуляциями показано: при общем downtime downstream клиенты с linear retry бьются синхронно одной волной (thundering herd), и downstream не успевает восстановиться. Equal jitter (random между half и full backoff) распределяет нагрузку. Для AWS-style клиентов decorrelated jitter ещё лучше — приведена формула и графики. Если кто-то в команде написал retry без jitter — отправляйте на эту статью первым делом. Один час чтения, который окупается за первый же downtime.

Три правила, вокруг которых крутится всё остальное. Retry живёт только на идемпотентных операциях, и идемпотентность — предусловие, а не «допилим потом»: каждый повтор без ключа идемпотентности рано или поздно превращается в двойную запись или двойное списание. Либо идемпотентность зашита в контракт API, либо retry выключен, третьего нет. Экспоненциальный backoff с jitter обязателен, потому что «пять раз с интервалом в секунду» при сбое downstream означает, что все клиенты бьются синхронно. И health check — не проверка бизнес-логики: liveness, который лезет в базу, при её недоступности заставит Kubernetes перезапустить все pods разом и превратит частный отказ в каскад. Liveness отвечает на вопрос «процесс жив», readiness — «готов принимать трафик»; отказ базы гасит второе и не трогает первое.

Circuit breaker без явной стратегии восстановления открывается навсегда. Схему open → half-open → close пишут все, а вот условие перехода обратно продумывают редко. Работает так: после cooldown пропускается один пробный запрос, успех закрывает цепь, неудача возвращает в open с увеличенным интервалом. Метрики состояния — обязательная часть дашборда сервиса, иначе в инциденте никто не понимает, активен breaker или нет.

Таймауты выстраиваются каскадом: внутренний меньше внешнего с запасом на повторы. Классическая ошибка — 30 секунд у внешнего клиента и те же 30 секунд у внутреннего RPC: внутренний вызов всегда «успевает» по своему таймеру, но отвечать уже некому, клиент отвалился. Каждый уровень отсекается раньше родителя на величину бюджета повторов плюс запас. Deadline propagation, когда остаток времени передаётся дальше через заголовки gRPC или метаданные Twirp, — уровень повыше, но он закрывает целый класс каскадных проблем.

Graceful degradation требует явных уровней критичности. «При перегрузке что-нибудь отключим» — не план: пока запросы и сервисы не разложены на critical, important и shedable, решать, чем жертвовать, попросту нечем. SRE Book предлагает свою модель — critical, shedable+, shedable. Признак зрелого сервиса простой: degraded mode описан словами и регулярно проверяется на game day. По моим наблюдениям, без разметки критичности деградация существует только на бумаге и в перегрузке не работает.

Паттерны без наблюдаемости — слепое пятно. Circuit breaker и retry добавили, а метрик «retry rate», «circuit state» и «shed rate» нет; в инциденте не видно, работают ли они вообще, а на ревью не понять, помогают они или маскируют настоящую проблему. Каждый паттерн заслуживает отдельного SLI и панели на дашборде. Дисциплина базовая. Откладывают её постоянно.

## Связанные листья

- **[Capacity Planning](/The-Way-of-SRE/engineering/capacity-planning/)** — resilience patterns закрывают ситуацию, когда capacity исчерпан или forecast ошибся. Graceful degradation + load shedding — что делается, пока scaling догоняет (если догонит).
- **[SLO Engineering](/The-Way-of-SRE/engineering/slo-engineering/)** — patterns поддерживают SLO под нагрузкой и при отказах. Circuit breaker не даёт error budget сгореть на каскадных отказах.
- **[Networking](/The-Way-of-SRE/engineering/networking/)** — timeouts, retry, circuit breaker патчат network unreliability. Service mesh реализует часть patterns на инфра-слое.
- **[SLI-based Alerting](/The-Way-of-SRE/engineering/sli-based-alerting/)** — алерты ловят момент активации patterns (circuit open, retry rate up, shed rate ≠ 0).
- **[Chaos Engineering](/The-Way-of-SRE/engineering/chaos-engineering/)** — chaos валидирует patterns: circuit breaker реально открывается? retry с backoff не амплифицирует? bulkhead изолирует?
- **[Progressive Delivery](/The-Way-of-SRE/practices/progressive-delivery/)** — canary с health gate использует readiness probes и circuit-breaker метрики.
- **[Operating Systems](/The-Way-of-SRE/engineering/operating-systems/)** — OS-level health (open file descriptors, conntrack, page cache pressure) — то, на что часто реагирует graceful degradation; resilience pattern triggers — kernel signals.
- **[Service Mesh](/The-Way-of-SRE/engineering/service-mesh/)** — Envoy/Istio sidecar реализует circuit breaking / outlier detection / retry policies без изменения кода; mesh — одна из инфра-реализаций паттернов из этого листа.
- **[Containerization & Orchestration](/The-Way-of-SRE/engineering/container-orchestration/)** — PDB / HPA / topology spread / liveness-readiness probes — k8s-native реализации resilience patterns.

## Открытые вопросы

- **Idempotency Patterns** *(TBD)* — отдельный лист: idempotency keys, ETags, conditional writes, transaction outbox, exactly-once illusion.
- **Backpressure & Load Shedding** *(TBD)* — «downstream direction» graceful degradation: criticality classification, admission control, queue management, retry budgets.
- **Resilience SLIs** — какой SLI выбрать для самих patterns (circuit-open ratio, retry success rate, shed rate)?
