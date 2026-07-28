---
title: Performance & Profiling
description: Измерение перед оптимизацией — pprof, perf, flame graphs, USE method; дисциплина против «оптимизирую то, что first comes to mind»
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Programming / Scripting / Performance & Profiling
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Сервис тормозит, нужно оптимизировать» — самая частая фраза, после которой инженер начинает менять код наугад. Performance & Profiling — это **дисциплина измерения перед оптимизацией**: запустить pprof / perf / flame graph, увидеть реальные hotspots (не предполагаемые), и только потом трогать код. Я регулярно вижу циклы «оптимизировали неделю → сделали хуже» именно потому, что hotspot был не там, где казалось. Don Knuth известное «premature optimization is the root of all evil» — про это: оптимизация без измерения почти всегда трата времени. Brendan Gregg's flame graph (2011) и pprof из Google's gperftools — два самых видимых инструмента; USE method (Utilization / Saturation / Errors) — самая практичная methodology.

Граница: [Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/) — «хватит ли ресурсов»; этот лист — «правильно ли используем те, что есть». [SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/) — *что* мерить (SLI как business-facing метрика); profiling — *как именно* копать, когда SLI деградировал. [Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/) — language-specific perf-tooling (pprof для Go, py-spy для Python); этот лист — universal methodology.

## Что должен уметь

Главный навык на уровне L4 — **измерять до того, как трогать код**. По моим наблюдениям, разница между junior'ом и senior'ом в perf-задачах — не в знании tooling (Гугл найдёт), а в дисциплине «сначала flame graph, потом гипотеза». Junior читает код, формулирует гипотезу «вот тут O(n²)», переписывает — оказывается, hotspot в другом месте. Senior запускает profile, смотрит реальное распределение, потом формулирует гипотезу. Это разница в одну привычку, которая экономит часы каждую неделю.

**L3**
- Знает, что профилировать (CPU / memory / I/O / network); понимает разницу между sampling profilers (perf, async-profiler) и instrumenting profilers (pprof для Go runtime); запускает базовый pprof / py-spy / async-profiler.
- Читает flame graph: где burning width (количество samples), где stack depth, какие функции в top.

**L4**
- Применяет **USE method**: для каждого ресурса (CPU, memory, disk, network) — utilization (% времени busy), saturation (queue depth / wait time), errors (drop / retransmit). Brendan Gregg's checklist — стандартная отправная точка.
- Профилирует **перед** изменением кода, не **после**. Формулирует optimization hypothesis на основе измеренных данных, проверяет гипотезу повторным profile.
- Знает classic perf anti-patterns: N+1 queries, hot lock contention, unbounded GC, allocation in hot loop, memory leak vs memory growth, false sharing.

**L5**
- Применяет **continuous profiling** в production (Pyroscope / Parca / Grafana Cloud Profiles / Datadog Continuous Profiler): regression detection, on-demand drill-down, без impact на сервис.
- Использует **differential profiling**: snapshot до и после release, сравнение через `pprof -base`. Каждый release — потенциальный perf regression; без differential profiling regressions копятся незаметно.
- Профилирует **production**, не «локально на ноуте». Microbenchmarks и synthetic load дают неправильные hotspots в 50% случаев — locality, GC pressure, IO patterns отличаются.

**L6+**
- Строит perf budget / latency budget программу: каждый сервис имеет latency budget по компонентам (network / CPU / IO / downstream), tracked over time, regression alerts при отклонении.
- Связывает performance discipline с SLO program: profile-driven optimization targets SLI deltas, а не «общую скорость»; resource efficiency как explicit metric (cost-per-request, см. [Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)).

## Материалы

### Книги

- Brendan Gregg — **[Systems Performance: Enterprise and the Cloud](https://www.brendangregg.com/systems-performance-2nd-edition-book.html)** (Addison-Wesley, 2-е изд., 2020). Каноническая книга. Если выбирать одну — эту. USE method, методологии, конкретные tools для Linux. 800+ страниц, но используется главами, не линейно.
- Brendan Gregg — **[BPF Performance Tools](https://www.brendangregg.com/bpf-performance-tools-book.html)** (Addison-Wesley, 2019). eBPF-revolution в profiling — следующий шаг после classical perf. Practical, с готовыми инструментами (bcc-tools).
- Дональд Кнут, **«преждевременная оптимизация — корень всех зол»** (Computing Surveys, 1974). Цитату знают все, продолжение — почти никто: Кнут там же говорит, что оставшиеся три процента кода оптимизировать необходимо, и что решать, какие именно, должны измерения. Ровно эта половина фразы и есть содержание профилирования.
- Andrei Alexandrescu — **[Modern C++ Design](https://erdani.com/index.php/books/modern-c-design/)** (Addison-Wesley, 2001). C++-specific, но раздел про template-based optimization — про дисциплину «measure first».

### Статьи и доклады

- Brendan Gregg — **[Flame Graphs](https://www.brendangregg.com/flamegraphs.html)** (2011 — настоящее время). Главный практический tool. Полностью описан в одной странице. Если выбирать одну статью — эту. Главный публичный кейс — см. ниже.
- Brendan Gregg — **[The USE Method](https://www.brendangregg.com/usemethod.html)**. Канонический systematic подход. «Solves 80% of server issues with 5% of the effort». Применимо к любой системе.
- Google — **[pprof README](https://github.com/google/pprof/blob/main/doc/README.md)**. Документация tool'а — лучший introduction в profile analysis вообще.
- Netflix Tech Blog — **[Java in Flames](https://netflixtechblog.com/java-in-flames-e763b3d32166)** (2015). Showcase того, как flame graph меняет debug-стиль; classic.
- Charity Majors — **[Observability Is a Many Splendored Definition](https://charity.wtf/2020/03/03/observability-is-a-many-splendored-thing/)**. Не perf-статья прямо, но контекст: continuous profiling как часть observability stack, не отдельный остров.

### Инструменты

- **[pprof](https://github.com/google/pprof)** (Go native, есть библиотеки для большинства языков) — де-факто стандарт для CPU / memory / blocking / mutex profiling. По моим наблюдениям, чаще всего инфраструктура «`/debug/pprof/` endpoint» — первое, что подключают к новому Go-сервису.
- **[perf](https://perf.wiki.kernel.org/)** (Linux native) — kernel-level profiling: `perf record` / `perf report`. CPU profiling на любом языке через sampling; обязательно для serious perf work.
- **[eBPF / bcc-tools / bpftrace](https://github.com/iovisor/bcc)** — kernel observability без instrumentation. Brendan Gregg's bcc-tools — готовые scripts: `execsnoop`, `biolatency`, `tcplife`, `runqlat`. Когда нужно «что именно делает kernel прямо сейчас» — это инструмент.
- **[async-profiler](https://github.com/async-profiler/async-profiler)** — JVM sampling profiler, де-факто стандарт для Java. Поддерживает CPU / allocation / lock-contention.
- **[py-spy](https://github.com/benfred/py-spy)** — Python sampling profiler, runs out-of-process. Без overhead на target service.
- **[Pyroscope](https://pyroscope.io/)** / **[Parca](https://www.parca.dev/)** / **[Grafana Cloud Profiles](https://grafana.com/docs/grafana-cloud/monitor-applications/profiles/)** — continuous profiling platforms. Pyroscope (теперь часть Grafana) — open-source; Datadog Continuous Profiler — коммерческий. По моим наблюдениям, чаще всего команды берут Pyroscope для self-hosted, Datadog/New Relic — если уже там.
- **[FlameGraph](https://github.com/brendangregg/FlameGraph)** (Brendan Gregg) — генератор flame graphs из perf output. Командная строка, ничего лишнего.
- **Анти-инструмент:** «оптимизация по интуиции без profile». Это не инструмент, это antipattern; самый частый источник «оптимизировали → сделали хуже».

## Best practices

Главный публичный кейс — **работа Брендана Грегга и Мартина Спира над Java-профилированием в Netflix, статья «Java in Flames» (2015)**. Сам flame graph Грегг придумал раньше, в 2011 году, но Java долго оставалась для него слепой зоной: системные профайлеры вроде `perf` видели системные стеки, но не видели Java-методов (JIT не отдаёт таблицу символов), а JVM-профайлеры видели ровно наоборот. Пока картина была разорвана пополам, спорить о том, где на самом деле горит CPU, можно было бесконечно. Решение оказалось прозаичным до обидного: флаг `-XX:+PreserveFramePointer`, появившийся в JDK 8u60, — и стек снова стал целым, а профиль — смешанным, от ядра до прикладного метода.

Мне этот кейс нравится тем, что он не про героическую находку, а про инструмент, которого просто не было. Пока его нет, команда обсуждает производительность гипотезами: «наверное, тормозит сериализация», «давай перепишем этот сервис на другом языке». Как только появляется целый профиль, обсуждение сводится к одному вопросу — где реальный hotspot и стоит ли его вообще трогать. Я регулярно вижу команды, которые читали про flame graph, но ни разу его не запускали, и продолжают решать perf-задачи через code review. Flame graph не требует экспертизы; требует только привычки открыть его раньше, чем редактор кода.

**Короткие правила:**

- **Profile до изменения, profile после.** Без before/after — это не optimization, это случайный change. Differential profiling (`pprof -base` / Pyroscope diff view) — обязательная дисциплина.
- **Profile production, не local microbenchmark.** Locality, GC pressure, allocator behavior, IO patterns — всё другое. Microbenchmark — для алгоритмических hot loops; production profile — для system-level.
- **USE method как первый pass.** При непонятном «тормозит» — пробежать USE по CPU / memory / disk / network перед уходом в код. 80% инцидентов resolved на этом шаге.

Подробнее:

**Sampling vs instrumenting — выбор по контексту.** Sampling profilers (perf, async-profiler, py-spy) — low overhead, можно запускать на prod; не видят функции, которые быстро выполняются много раз (если sample interval больше function duration). Instrumenting profilers (pprof Go runtime, gprof) — точные counts / timings, но overhead до 30%+. Для prod use sampling; для targeted analysis отдельного workflow — instrumenting в staging. По моим наблюдениям, типовая ошибка — пытаться использовать instrumenting на prod и получать неправильную картину из-за overhead-induced contention.

**Flame graph читать справа налево, не сверху вниз.** Распространённая ошибка чтения: ищут «top function» на flame graph. Top — это «непосредственно where CPU is now», но это часто рутинное (memory allocator, GC, stdlib). Ширина function на любом уровне — % CPU, проведённого «в этой функции и её callees». Сначала смотреть **wide functions in the middle** (это main hotspots) — потом drill down. Несколько `--reverse` graphs (bottom-up) дополняют сверху-вниз picture.

**Continuous profiling меняет cadence perf-work.** Classical approach — «когда что-то сломается, профилируй». Continuous — «всегда профилируешь, regression detection автоматический». Разница: regression от release ловится в день release, не через 2 месяца, когда уже три release легло поверх. По моим наблюдениям, разница между здоровой и нездоровой perf-culture — наличие continuous profiling; не tool sophistication.

**Latency budget per component — практический шаг от SLO к profiling.** Сервис обещает 99-й percentile latency < 100ms. Куда уходит этот бюджет: 20ms — network round-trip, 5ms — JSON parsing, 30ms — DB query, 40ms — business logic, 5ms — response serialization. Когда какой-то компонент превышает свой sub-budget, profile-driven debugging имеет очевидную точку входа. Без budget perf-debug становится поиском в темноте.

**Memory profiling — про allocation rate, не total RSS.** RSS растёт у любого работающего процесса (caches, GC heap, mmap). Hot question — **allocation rate**: сколько MB/s аллокируется. Высокий allocation rate → GC pressure → latency spikes. pprof's `alloc_objects` / `alloc_space` показывает именно это. Я регулярно вижу команды, которые мерят `RSS over time` и не понимают, почему «память вроде не растёт, а latency дёргается» — потому что allocation churn выше capacity GC.

## Связанные листья

- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — каждый язык имеет own perf-tooling (pprof для Go, async-profiler для JVM, py-spy для Python); фундамент языка определяет, какие perf-проблемы вообще возможны (GC pressure, lock contention).
- **[Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/)** — `perf`, `strace`, `bpftrace` — CLI-инструменты; performance work требует беглости в shell.
- **[Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)** — kernel-level profiling (eBPF, perf events, ftrace) — это OS-внутренности; performance L5+ невозможен без понимания OS.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — «хватит ли ресурсов» (capacity) vs «правильно ли используем» (profiling) — две стороны одной задачи.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLI определяет, что мерить; profiling — как именно копать, когда SLI деградировал.
- **[Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)** — resource efficiency через profiling — input для cost-aware decisions; cost-per-request reflects perf engineering quality.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — network-side profiling (tcpdump, packet capture, mtr) — отдельная под-область с собственными tools.

## Открытые вопросы

- **Continuous Profiling Adoption Strategy** *(TBD)* — как внедрить в команду, которая работает без него; что мерить как success.
- **DB Performance Tuning** *(TBD)* — index design, query plans, connection pooling, vacuum/compaction — соседняя practice под Database Reliability.
- **Front-end Performance** *(TBD)* — Core Web Vitals, RUM, browser profiling. Не SRE-traditional, но в продуктовых командах SRE часто партнёрит.
- **Microbenchmark Discipline** *(TBD)* — JMH (Java), `testing.B` (Go), pytest-benchmark (Python). Как избежать стандартных pitfalls (warm-up, statistical noise, dead-code elimination).
- Я не уверен, как **правильно делать ML-profiling** (training step time vs GPU utilization). Если у вас есть practice — расскажите через PR.
