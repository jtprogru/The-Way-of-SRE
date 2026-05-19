---
title: Programming Languages
description: SRE пишет код — один-два языка на уровне поддерживаемого сервиса плюс shell-уверенность. Концепт; конкретный выбор языка — в материалах
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Programming / Scripting / Programming Languages
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

**SRE пишет код.** Это принципиальное отличие от классических ops. Не «по чуть-чуть всё», а **один-два языка на уровне писать поддерживаемый сервис**, плюс shell-уверенность для скриптовой автоматизации. Здесь — концепт и навыковая модель; конкретный выбор языка — в материалах.

## Что должен уметь

- **L3** — Уверенно пишет shell-скрипты (bash) с обработкой ошибок (`set -euo pipefail`), pipe'ами, циклами и базовой работой с `awk` / `sed` / `jq`.
- **L3** — Читает и поправляет существующий код команды на основном языке (чаще всего Go или Python); понимает базовые идиомы языка — error handling в Go, generators в Python, обработка исключений.
- **L4** — Пишет небольшие сервисы на основном языке: HTTP-handler, экспонирование метрик (Prometheus client), структурированное логирование, базовая работа с конфигом и graceful shutdown.
- **L4** — Пишет тесты: unit, table-driven (Go) / pytest (Python); понимает разницу между unit / integration / e2e и когда нужен какой; знаком с fuzz-тестами для критичных парсеров.
- **L4** — Профилирует код: запускает `pprof` (Go) / `cProfile` / `py-spy` (Python) и интерпретирует flame graph / call tree; не «оптимизирует на глазок».
- **L5** — Поддерживает production-сервис: разбор паник / exception / race condition; обоснованный выбор concurrency-модели (goroutine + channel vs mutex, asyncio vs threads, actor model); чтение трейсов в инциденте.
- **L5** — Дизайнит API сервиса: idempotency на ретраях, versioning, observability hooks (RED-метрики из коробки), graceful shutdown с дренированием соединений, signal handling.
- **L6+** — Принимает технические решения о выборе языка / стека для команды (миграция Python → Go, build vs adopt существующий tool); обосновывает выбор через ограничения (perf, ecosystem, hiring, операционная стоимость).
- **L6+** — Развивает code review культуру: review как обучение и распределение знания, а не gatekeeping; вводит и поддерживает стандарты команды (linter, formatter, тестовое покрытие, conventional commits).

## Материалы

### Книги

- Alan A. A. Donovan, Brian W. Kernighan — **The Go Programming Language** (Addison-Wesley, 2015). База для основного SRE-языка в индустрии (Kubernetes, Prometheus, Docker, HashiCorp stack, CNCF).
- Luciano Ramalho — **Fluent Python**, 2-е изд. (O'Reilly, 2022). База для SRE-tooling на Python: data classes, async/await, descriptors, метаклассы — то, что встречается в реальном production-Python.
- Jim Blandy, Jason Orendorff, Leonora F. S. Tindall — **Programming Rust**, 2-е изд. (O'Reilly, 2021). Дополнительно: для команд, выходящих в perf-critical территорию (eBPF userspace, инструментирование, безопасный системный код).
- Brian W. Kernighan, Rob Pike — **The Practice of Programming** (Addison-Wesley, 1999). Дополнительно: классика про дисциплину программирования — debugging, testing, performance, portability — устаревшая по примерам, не по принципам.

### Статьи и доклады

- Go team — **[Effective Go](https://go.dev/doc/effective_go)**. База: официальный гайд по идиомам Go; обязательное чтение перед первым production-сервисом.
- Steve Klabnik, Carol Nichols et al. — **[The Rust Programming Language](https://doc.rust-lang.org/book/)** (бесплатно онлайн). База: канонический учебник Rust от core team.
- Adam Wiggins et al. — **[The Twelve-Factor App](https://12factor.net/)**. База: методология производственных сервисов (config, processes, logs, disposability) — независимо от языка задаёт modeling для production-готового кода.

### Инструменты

- **Профилирование** — `pprof` (Go, в стандартной библиотеке), `cProfile` + `py-spy` (Python), `cargo bench` + `criterion` (Rust). Профиль перед оптимизацией — обязателен.
- **Линтеры и formatter'ы** — `golangci-lint` (Go), `ruff` + `black` (Python), `clippy` + `rustfmt` (Rust), `shellcheck` (bash). Минимум вкуса в стиле, максимум — в проектировании.
- **Тестирование** — встроенные `go test` + `testify`/`gomock`; `pytest` + `pytest-cov`; `cargo test` + `criterion`; `bats` для bash-скриптов. Тесты на критические сетевые/IO-пути — не опция.
- **Debugger'ы** — `delve` (Go), `pdb`/`pdbpp` (Python), `gdb`/`lldb` (Rust/C). В большинстве production-инцидентов чтение логов и pprof выигрывают, но debugger обязателен для воспроизводимых багов.

## Best practices

- **Один язык до уровня «писать сервис», потом расширяй.** Антипаттерн: поверхностное знание трёх языков — каждый из них пишется в стиле первого освоенного, без идиом и инструментария. Глубокое знание одного даёт production-готовность; поверхностное знание трёх — иллюзию универсальности. Дефолт в индустрии: Go или Python в зависимости от стека команды.
- **SRE-код — это production-код, а не «временный скрипт».** Антипаттерн: bash в crontab «на месяц», который живёт три года без тестов, ревью и мониторинга. Если код запускается на проде регулярно — он живёт по тем же правилам, что код продуктовой команды: репозиторий, тесты, code review, versioning, наблюдаемость своего же tooling.
- **Shell-уверенность — отдельная инвестиция, не «приложение к Go».** Антипаттерн: «у меня есть Go, обойдусь без bash». В on-call вы будете писать `for f in $(...); do ...; done`, читать `kubectl logs ... | jq | grep` и парсить вывод утилит. Хороший Go этого не заменит. См. соседний лист `Shell & CLI Craft` *(TBD)*.
- **Профилирование до оптимизации, всегда.** Антипаттерн: «здесь медленно, я знаю» — оптимизировали место, которое не было bottleneck, потеряли неделю. Сначала измерь (pprof / py-spy / criterion), потом меняй; разница между «думаю» и «вижу flame graph» — половина рабочих часов.
- **Чтение чужого кода — главный навык SRE.** Антипаттерн: вызвать владельца сервиса при каждом непонятном поведении в production. SRE поддерживает чужие сервисы, и читать чужой код приходится больше, чем писать свой. Регулярная практика — code review соседних сервисов, walkthrough'и legacy-кода с тех. лидами, шаг «понять прежде, чем менять».
- **Graceful shutdown и idempotency — обязательны для любого long-running сервиса.** Антипаттерн: «убьём процесс, всё перезапустится». Без graceful shutdown теряются in-flight запросы и приходит ошибочный RST клиенту; без idempotency ретраи (внешние, mesh, retries клиентов) дублируют side-effects. Обработка SIGTERM с дренированием соединений и idempotency на write-операциях — не опция, а контракт.

## Связанные листья

- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — реализация retries / circuit breaker / timeouts происходит в коде; знание сетевых библиотек языка — половина resilience-практики.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — observability hooks (Prometheus client, OpenTelemetry SDK) пишутся в коде; качество SLI-метрик упирается в то, как реализованы инструментирующие вызовы.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — graceful shutdown, idempotency, retries — кодовая основа того, что измеряется SLO.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — скрипты в runbook'ах (одноразовые fixup-инструменты, диагностические выгрузки) — отдельный класс кода; bash здесь часто выигрывает у Go простотой обновления.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — чтение трейсов, exception stack, pprof в инциденте — главный live-use языка.

## Открытые вопросы

- **Shell & CLI Craft** — отдельный лист про bash / awk / sed / jq / `grep` идиомы, pipeline-композицию и стиль on-call-скриптов. Сейчас shell сжато упомянут здесь; при углублении ветви — выделить в отдельный лист, оставив здесь только связь.
- **CI/CD** — где SRE-код деплоится и проверяется (pipeline patterns, secrets, artefact storage). Сосед под `Programming / Scripting` L1, отдельный лист.
- **Performance & Profiling как практика** — pprof / flame graphs / latency budgets — возможно отдельный лист под `Reliability Engineering` или `Observability`, не часть Programming Languages. Граница уточняется при углублении соседей.
