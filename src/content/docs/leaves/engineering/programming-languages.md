---
title: Programming Languages
description: SRE пишет код — один-два языка на уровне поддерживаемого сервиса плюс shell-уверенность
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Programming / Scripting / Programming Languages
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Это первое, что я говорю людям, переходящим из классических ops в [SRE](/The-Way-of-SRE/glossary/#sre): **придётся писать код**. Не «помогать команде разработки», не «чинить деплои» — писать сервис, который пойдёт в production. Не «по чуть-чуть пять языков» — один-два до уровня поддерживаемого сервиса плюс shell-уверенность для скриптовой автоматизации. Здесь — концепт и навыковая модель; конкретный выбор языка — в материалах.

## Что должен уметь

Главный навык на уровне L3 — shell-скрипты, которые не падают молча. `set -euo pipefail`, явная обработка ошибок, code review для shell-скриптов, которые живут дольше недели. Я регулярно встречаю команды, в которых Go-сервисы тщательно тестируются, а bash-скрипты в crontab живут три года без единого теста и валятся в production с молчаливой ошибкой. Несимметричное отношение к качеству — типичная ловушка перехода в SRE.

**L3**
- Уверенно пишет shell-скрипты (bash) с обработкой ошибок (`set -euo pipefail`), pipe-цепочками, циклами и базовой работой с `awk` / `sed` / `jq`.
- Читает и поправляет существующий код команды на основном языке (чаще всего Go или Python); понимает базовые идиомы языка.

**L4**
- Пишет небольшие сервисы на основном языке: HTTP-handler, экспонирование метрик (Prometheus client), структурированное логирование, базовая работа с конфигом и graceful shutdown.
- Пишет тесты: unit, table-driven (Go) / pytest (Python); знаком с fuzz-тестами для критичных парсеров.
- Профилирует код: запускает `pprof` (Go) / `cProfile` / `py-spy` (Python) и интерпретирует flame graph / call tree; не «оптимизирует на глазок».

**L5**
- Поддерживает production-сервис: разбор паник, exception, race conditions; обоснованный выбор concurrency-модели; чтение трейсов в инциденте.
- Дизайнит API сервиса: idempotency на ретраях, versioning, observability hooks (RED-метрики из коробки), graceful shutdown с дренированием соединений, signal handling.

**L6+**
- Принимает технические решения о выборе языка/стека для команды; обосновывает выбор через ограничения (perf, ecosystem, hiring, operational cost).
- Развивает культуру code review: review как обучение и распределение знания, а не gatekeeping; вводит стандарты команды (linter, formatter, тестовое покрытие, conventional commits).

## Материалы

### Книги

- Alan A. A. Donovan, Brian W. Kernighan — **The Go Programming Language** (Addison-Wesley, 2015). База для основного SRE-языка в индустрии. Первые главы тяжёлые, дальше идёт легче. Если выбираете один источник по Go — этот.
- Luciano Ramalho — **Fluent Python**, 2-е изд. (O'Reilly, 2022). По моим наблюдениям, многие команды берут эту книгу после первых production-багов с asyncio или type-системой — там подробно разобрано то, что в туториалах опускают.
- Jim Blandy, Jason Orendorff, Leonora F. S. Tindall — **Programming Rust**, 2-е изд. (O'Reilly, 2021). Для perf-critical территории (eBPF userspace, инструментирование, безопасный системный код). Rust в SRE пока редок; если у вас eBPF — это вход.
- Brian W. Kernighan, Rob Pike — **The Practice of Programming** (Addison-Wesley, 1999). Классика про дисциплину программирования — debugging, testing, performance, portability. Устарела по примерам, не по принципам.

### Статьи и доклады

- Go team — **[Effective Go](https://go.dev/doc/effective_go)**. Официальный гайд по идиомам. Обязательное чтение перед первым production-сервисом на Go.
- Steve Klabnik, Carol Nichols et al. — **[The Rust Programming Language](https://doc.rust-lang.org/book/)** (бесплатно онлайн). Канонический учебник.
- Adam Wiggins et al. — **[The Twelve-Factor App](https://12factor.net/)**. Методология production-сервисов (config, processes, logs, disposability) — независимо от языка задаёт модель production-готового кода.
- Mike Bland — **[Goto Fail, Heartbleed, and Unit Testing Culture](https://martinfowler.com/articles/testing-culture.html)** (martinfowler.com). Почему unit tests без культуры их писать бесполезны. Хороший аргумент при ревью pipeline без тестов.
- **[Основы алгоритмизации и программирования](https://jtprogru.github.io/mti-oaip-lectures/)** — компактный компендиум по базе: алгоритмические конструкции, языки (Python, Go), процедуры и рекурсия, ООП, работа с файлами/HTTP/regex/БД, отладка и unit-тесты. Полезен переходящим из чистого ops в SRE и тем, кто хочет подтянуть фундамент без академического CS-фона.
- **[Алгоритмы и структуры данных](https://jtprogru.github.io/mti-dsa/)** — лабораторный практикум на Python: массивы и стек, связные списки/очереди/BST, сортировки со счётчиком обменов, линейный и бинарный поиск, хеш-таблицы с разрешением коллизий. Реализации «с нуля», без стандартных контейнеров — полезно, чтобы понимать стоимость структур данных, которые в проде обычно берёшь готовыми (выбор map vs slice, сложность поиска в горячем пути).

### Инструменты

- **Профилирование** — `pprof` (Go, в стандартной библиотеке), `cProfile` + `py-spy` (Python), `cargo bench` + `criterion` (Rust). Профиль перед оптимизацией обязателен.
- **Линтеры и formatter'ы** — `golangci-lint` (Go), `ruff` + `black` (Python), `clippy` + `rustfmt` (Rust), `shellcheck` (bash). Минимум вкуса в стиле, максимум — в проектировании.
- **Тестирование** — встроенные `go test` + `testify` / `gomock`; `pytest` + `pytest-cov`; `cargo test` + `criterion`; `bats` для bash. Тесты на критичные сетевые/IO-пути — не опция.
- **Debugger'ы** — `delve` (Go), `pdb` / `pdbpp` (Python), `gdb` / `lldb` (Rust/C). В большинстве production-инцидентов чтение логов и pprof выигрывают, но debugger обязателен для воспроизводимых багов.

## Best practices

Если посмотреть, на каких языках написана инфраструктура SRE-инструментария — Kubernetes, Prometheus, Docker, Terraform, etcd, HashiCorp stack — **всё это Go**. Data-инструменты, custom automation, ML-обвязка — **Python**. Эти два языка покрывают, по моим наблюдениям, ~90% production-кода в SRE-командах. Rust появляется нишево (eBPF userspace, infra-tools). Совет «выучи пять языков для универсальности» — типичный собеседовательный, не отражает реальной работы.

**Короткие правила:**

- **Один язык до уровня «писать сервис», потом расширяй.** Поверхностное знание трёх языков — каждый из них пишется в стиле первого освоенного, без идиом и инструментария. Глубокое знание одного даёт production-готовность; поверхностное знание трёх — иллюзию универсальности.
- **Профилирование до оптимизации, всегда.** «Здесь медленно, я знаю» — типичный путь оптимизации места, которое не было bottleneck, с потерей недели. Сначала измерь (pprof / py-spy / criterion), потом меняй. Разница между «думаю» и «вижу flame graph» — половина рабочих часов.
- **Graceful shutdown и idempotency — обязательны для любого long-running сервиса.** Без graceful shutdown теряются in-flight запросы и приходит ошибочный RST клиенту; без idempotency ретраи дублируют side-effects. Обработка SIGTERM с дренированием соединений и idempotency на write-операциях — не опция, а контракт.

Подробнее:

**SRE-код — это production-код, а не «временный скрипт».** Это правило ломается чаще всего вокруг shell-скриптов. Я наблюдаю типичный паттерн: трёхлетний bash-скрипт в crontab упал молча, отдал NaN в одну из метрик capacity planning, об этом узнали через две недели, когда поломался дашборд. Скрипт не был покрыт тестами, не запускался в CI, не имел владельца — потому что «временный». Если код запускается на проде регулярно — он живёт по тем же правилам, что код продуктовой команды: репозиторий, тесты, code review, versioning, наблюдаемость своего же tooling.

**Shell-уверенность — отдельная инвестиция, не «приложение к Go».** Хороший Go не заменяет умения написать `for f in $(...); do ...; done`, прочитать `kubectl logs ... | jq | grep` и парсить вывод утилит. В on-call это пишется ежедневно, и плохой bash тратит здесь больше времени, чем плохой Go в коде сервиса. Соседний лист — [Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/).

**Чтение чужого кода — главный навык SRE.** SRE поддерживает чужие сервисы, и читать чужой код приходится больше, чем писать свой. Я наблюдаю чёткое разделение между сильными и слабыми инженерами по этому критерию: сильные — «прочитаю код, чтобы понять, потом задам вопрос автору»; слабые — «вызову автора при каждом непонятном поведении, не открывая код». Регулярная практика — code review соседних сервисов, walkthrough legacy-кода с тех. лидами, шаг «понять прежде, чем менять» — обязателен.

## Связанные листья

- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — реализация retries / circuit breaker / timeouts происходит в коде; знание сетевых библиотек языка — половина resilience-практики.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — observability hooks (Prometheus client, OpenTelemetry SDK) пишутся в коде; качество SLI-метрик упирается в идиомы языка.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — graceful shutdown, idempotency, retries — кодовая основа того, что измеряется SLO.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — скрипты в runbook (одноразовые fixup-инструменты, диагностические выгрузки) — отдельный класс кода; bash здесь часто выигрывает у Go простотой обновления.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — чтение трейсов, exception stack, pprof в инциденте — главный live-use языка.
- **[Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/)** — соседний лист про композицию unix-tools; shell — не «приложение к Go», а отдельный muscle.
- **[Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/)** — pprof / flame graphs / latency budgets — соседний лист про measure-first дисциплину; работает поверх runtime языка.
- **[Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)** — runtime языка живёт поверх OS; GC pauses, scheduler interactions, syscall patterns — intersection.

## Открытые вопросы

- **Async / Concurrency Patterns по языкам** — структурированное сравнение Go-горутин, Python asyncio, Rust async, Java virtual threads. Возможно отдельный лист под Programming / Scripting.
- Я не уверен, где правильно проходит граница между «лист про язык» и «лист про runtime / OS interaction». Часть концепций (GC tuning, scheduler interaction) сейчас распределена между этим листом, Performance & Profiling и Operating Systems — overlap намеренный, но возможно нуждается в более чёткой границе.
