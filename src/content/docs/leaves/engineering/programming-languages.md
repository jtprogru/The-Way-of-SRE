---
title: Programming Languages
description: SRE пишет код — один-два языка на уровне поддерживаемого сервиса плюс уверенность в shell
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Programming / Scripting / Programming Languages
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Это первое, что я говорю людям, переходящим из классических ops в [SRE](/The-Way-of-SRE/glossary/#sre): **придётся писать код**. Не «помогать команде разработки», не «чинить деплои» — писать сервис, который пойдёт в production. Не «по чуть-чуть пять языков» — один-два до уровня поддерживаемого сервиса плюс уверенность в shell для скриптовой автоматизации. Здесь — концепт и навыковая модель; конкретный выбор языка — в материалах.

## Что должен уметь

Главный навык на уровне L3 — shell-скрипты, которые не падают молча. `set -euo pipefail`, явная обработка ошибок, code review для shell-скриптов, которые живут дольше недели. Я регулярно встречаю команды, в которых Go-сервисы тщательно тестируются, а bash-скрипты в crontab живут три года без единого теста и валятся в production с молчаливой ошибкой. Несимметричное отношение к качеству — типичная ловушка перехода в SRE.

**L3**
- Уверенно пишет shell-скрипты (bash) с обработкой ошибок (`set -euo pipefail`), цепочками pipe, циклами и базовой работой с `awk` / `sed` / `jq`.
- Читает и поправляет существующий код команды на основном языке (чаще всего Go или Python); понимает базовые идиомы языка.

**L4**
- Пишет небольшие сервисы на основном языке: HTTP-handler, экспонирование метрик (Prometheus client), структурированное логирование, базовая работа с конфигом и graceful shutdown.
- Пишет тесты: unit, table-driven (Go) / pytest (Python); знаком с fuzz-тестами для критичных парсеров.
- Профилирует код: запускает `pprof` (Go) / `cProfile` / `py-spy` (Python) и интерпретирует flame graph / call tree; не «оптимизирует на глазок».

**L5**
- Поддерживает сервис в production: разбор паник, exception, race conditions; обоснованный выбор модели concurrency; чтение трейсов в инциденте.
- Дизайнит API сервиса: idempotency на ретраях, versioning, observability hooks (RED-метрики из коробки), graceful shutdown с дренированием соединений, signal handling.

**L6+**
- Принимает технические решения о выборе языка/стека для команды; обосновывает выбор через ограничения (perf, ecosystem, hiring, operational cost).
- Развивает культуру code review: review как обучение и распределение знания, а не gatekeeping; вводит стандарты команды (linter, formatter, тестовое покрытие, conventional commits).

## Материалы

### Книги

- Alan A. A. Donovan, Brian W. Kernighan — **The Go Programming Language** (Addison-Wesley, 2015). База для основного SRE-языка в индустрии. Первые главы тяжёлые, дальше идёт легче. Если выбираете один источник по Go — этот.
- Luciano Ramalho — **Fluent Python**, 2-е изд. (O'Reilly, 2022). По моим наблюдениям, многие команды берут эту книгу после первых боевых багов с asyncio или системой типов — там подробно разобрано то, что в туториалах опускают.
- Jim Blandy, Jason Orendorff, Leonora F. S. Tindall — **Programming Rust**, 2-е изд. (O'Reilly, 2021). Для perf-critical территории (eBPF userspace, инструментирование, безопасный системный код). Rust в SRE пока редок; если у вас eBPF — это вход.
- Brian W. Kernighan, Rob Pike — **The Practice of Programming** (Addison-Wesley, 1999). Классика про дисциплину программирования — debugging, testing, performance, portability. Устарела по примерам, не по принципам.

### Статьи и доклады

- Go team — **[Effective Go](https://go.dev/doc/effective_go)**. Официальный гайд по идиомам. Обязательное чтение перед первым боевым сервисом на Go.
- Steve Klabnik, Carol Nichols et al. — **[The Rust Programming Language](https://doc.rust-lang.org/book/)** (бесплатно онлайн). Канонический учебник.
- Adam Wiggins et al. — **[The Twelve-Factor App](https://12factor.net/)**. Методология сервисов в production (config, processes, logs, disposability) — независимо от языка задаёт модель кода, готового к бою.
- Mike Bland — **[Goto Fail, Heartbleed, and Unit Testing Culture](https://martinfowler.com/articles/testing-culture.html)** (martinfowler.com). Почему unit tests без культуры их писать бесполезны. Хороший аргумент при ревью pipeline без тестов.
- **[Основы алгоритмизации и программирования](https://jtprogru.github.io/mti-oaip-lectures/)** — компактный компендиум по базе: алгоритмические конструкции, языки (Python, Go), процедуры и рекурсия, ООП, работа с файлами/HTTP/regex/БД, отладка и unit-тесты. Полезен переходящим из чистого ops в SRE и тем, кто хочет подтянуть фундамент без академического CS-фона.
- **[Алгоритмы и структуры данных](https://jtprogru.github.io/dsa-for-ops/)** — лабораторный практикум на Python: массивы и стек, связные списки/очереди/BST, сортировки со счётчиком обменов, линейный и бинарный поиск, хеш-таблицы с разрешением коллизий. Реализации «с нуля», без стандартных контейнеров — полезно, чтобы понимать стоимость структур данных, которые в проде обычно берёшь готовыми (выбор map vs slice, сложность поиска в горячем пути).

### Инструменты

- **Профилирование** — `pprof` (Go, в стандартной библиотеке), `cProfile` + `py-spy` (Python), `cargo bench` + `criterion` (Rust). Профиль перед оптимизацией обязателен. По моим наблюдениям, из этого списка в SRE-командах ежедневно живут первые два набора, а инструменты Rust встречаются реже — обычно там, где вокруг eBPF.
- **Линтеры и formatter'ы** — `golangci-lint` (Go), `ruff` + `black` (Python), `clippy` + `rustfmt` (Rust), `shellcheck` (bash). Минимум вкуса в стиле, максимум — в проектировании.
- **Тестирование** — встроенные `go test` + `testify` / `gomock`; `pytest` + `pytest-cov`; `cargo test` + `criterion`; `bats` для bash. Тесты на критичные сетевые/IO-пути — не опция.
- **Debugger'ы** — `delve` (Go), `pdb` / `pdbpp` (Python), `gdb` / `lldb` (Rust/C). В большинстве инцидентов в production чтение логов и pprof выигрывают, но debugger обязателен для воспроизводимых багов.

## Best practices

Если посмотреть, на каких языках написана инфраструктура SRE-инструментария — Kubernetes, Prometheus, Docker, Terraform, etcd, HashiCorp stack — **всё это Go**. Инструменты для работы с данными, custom automation, ML-обвязка — **Python**. Эти два языка покрывают, по моим наблюдениям, ~90% боевого кода в SRE-командах. Rust появляется нишево (eBPF userspace, infra-tools). Совет «выучи пять языков для универсальности» — типичный собеседовательный, не отражает реальной работы.

Отсюда три правила, которые я считаю базовыми. Первый язык доводится до уровня «умею писать сервис», и только потом добавляется второй: поверхностное знание трёх языков означает, что на всех трёх человек пишет в стиле первого освоенного, без идиом и без инструментария. Профилирование идёт до оптимизации всегда — «здесь медленно, я знаю» стабильно приводит к неделе, потраченной на место, которое не было узким. И graceful shutdown вместе с idempotency обязательны для любого долгоживущего сервиса: без первого теряются запросы в полёте и клиент получает RST на ровном месте, без второго ретраи спокойно дублируют побочные эффекты.

Код SRE — это код в production, а не «временный скрипт». Чаще всего правило ломается вокруг shell. Типичная история, которую я наблюдаю: трёхлетний скрипт в crontab падает молча, отдаёт NaN в одну из метрик capacity planning, и об этом узнают через две недели, когда ломается дашборд. Тестов нет, в CI не запускается, владельца тоже нет — потому что «временный». Если код регулярно запускается на проде, он живёт по правилам продуктовой команды: репозиторий, тесты, ревью, версионирование и наблюдаемость собственного инструментария.

Уверенность в shell — отдельная инвестиция, а не приложение к Go. Хороший Go не заменяет умения написать `for f in $(...); do ...; done`, прочитать `kubectl logs ... | jq | grep` и разобрать вывод чужой утилиты. На дежурстве это пишется ежедневно, и слабый bash съедает больше времени, чем слабый Go в коде сервиса. Соседний лист — [Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/).

Чтение чужого кода — главный навык. SRE поддерживает чужие сервисы, и читать приходится больше, чем писать. Сильных и слабых инженеров я различаю ровно здесь: первые открывают код, разбираются и приходят к автору с конкретным вопросом; вторые дёргают автора на каждое непонятное поведение, не открыв ни файла. Тренируется это скучно — ревью соседних сервисов, разбор унаследованного кода вместе с техлидами и привычка понять раньше, чем менять.

## Связанные листья

- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — реализация retries / circuit breaker / timeouts происходит в коде; знание сетевых библиотек языка — половина практики устойчивости.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — observability hooks (Prometheus client, OpenTelemetry SDK) пишутся в коде; качество SLI-метрик упирается в идиомы языка.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — graceful shutdown, idempotency, retries — кодовая основа того, что измеряется SLO.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — скрипты в runbook (одноразовые скрипты-починки, диагностические выгрузки) — отдельный класс кода; bash здесь часто выигрывает у Go простотой обновления.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — чтение трейсов, exception stack, pprof в инциденте — главный live-use языка.
- **[Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/)** — соседний лист про композицию unix-tools; shell — не «приложение к Go», а отдельный muscle.
- **[Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/)** — pprof / flame graphs / latency budgets — соседний лист про measure-first дисциплину; работает поверх runtime языка.
- **[Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)** — runtime языка живёт поверх OS; GC pauses, scheduler interactions, syscall patterns — intersection.

## Открытые вопросы

- **Async / Concurrency Patterns по языкам** — структурированное сравнение горутин в Go, Python asyncio, Rust async, Java virtual threads. Возможно отдельный лист под Programming / Scripting.
- Я не уверен, где правильно проходит граница между «лист про язык» и «лист про runtime / OS interaction». Часть концепций (GC tuning, scheduler interaction) сейчас распределена между этим листом, Performance & Profiling и Operating Systems — overlap намеренный, но возможно нуждается в более чёткой границе.
