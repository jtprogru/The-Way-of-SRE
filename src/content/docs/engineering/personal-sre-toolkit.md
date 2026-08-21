---
title: Personal SRE Toolkit
description: Свой набор CLI-утилит и функций в shell под повседневные операционные задачи — самый дешёвый уровень toil reduction
sfia: [3, 4, 5]
status: draft
---

В 2023 я начал [gch](https://github.com/jtprogru/gch) — `Go CLI Helper`, монолитную CLI-утилиту со всем, что мне регулярно нужно: генератор паролей, генератор лицензии, URL-shortener, поиск дубликатов JPG/PNG в каталоге, заготовка для investigation. За это время в команды добавился целый workflow вокруг SRE-артефактов (постмортемы, RFC, runbook'и, SLO-документы, on-call отчёты) — `gch` начал распухать, разные команды стали запутывать друг друга. В 2026 я выделил эти SRE-генераторы в отдельный [srekit](https://github.com/jtprogru/srekit), оставив `gch` для повседневной мелочи. Это типичный путь personal toolkit: один монолит → специализация → разделение. Этот лист — про **самый дешёвый уровень automation**: свой набор aliases, функций в shell и CLI-утилит, который один человек собирает под себя за годы. Цена входа околонулевая, ROI — мгновенный, но toolkit имеет жизненный цикл: накапливает технический долг, требует периодической чистки, перетекает между машинами через [dotfiles](https://dotfiles.github.io/). Сосед [Toil Automation](/The-Way-of-SRE/engineering/toil-automation/) — про *team-level* паттерны; здесь — про *personal-level*. Граница неточная (хороший personal toolkit становится team toolkit и обратно), но фокус разный.

## Что должен уметь

Главный навык на уровне L4 — **знать, когда alias уже не хватает, и пора писать CLI**. Alias или функция выгодна для 1-2 простых команд с фиксированными аргументами; CLI оправдан, когда появляются subcommands, валидация флагов, completions, документация. Я регулярно вижу две крайности — инженер держит 200-строчную функцию на bash с case'ами и вложенными if'ами (надо переписать на Go / Python), либо пишет полноценный CLI с cobra для команды-однострочника (over-engineering). Mental model: если функция начала иметь подкоманды, флаги, exit codes — это уже CLI, оформи её как CLI.

**L3**
- Ведёт собственные dotfiles в git (`.zshrc` / `.bashrc` / `.config/nvim` / `.config/tmux` и т.д.); может развернуть свой setup на новой машине одной командой.
- Знает базовый набор productivity CLI: [fzf](https://github.com/junegunn/fzf), [ripgrep](https://github.com/BurntSushi/ripgrep), [fd](https://github.com/sharkdp/fd), [jq](https://jqlang.org/), [yq](https://mikefarah.gitbook.io/yq); умеет комбинировать через pipe.
- Использует [Taskfile](https://taskfile.dev/) или Makefile для разработки своих проектов (self-documenting commands вместо «как же я тут билдил»).

**L4**
- Пишет небольшие CLI на Go / Python / Rust под повторяющиеся задачи, которых нет в готовых инструментах; знает, когда `alias` уже не хватает, а полный CLI ещё избыточен (промежуточный уровень — функция в shell, лежащая в dotfiles).
- Распространяет свои инструменты (homebrew tap, `go install`, релизы на GitHub) для синхронизации между машинами и в команде.
- Соблюдает CLI design conventions — стандартные флаги (`--help`, `--version`, `--dry-run`, `--json`), правильные exit codes, structured logs / errors на stderr, output на stdout (12-Factor CLI / [clig.dev](https://clig.dev/)).

**L5**
- Эволюционирует личный toolkit как team toolkit — то, что регулярно использую сам, проходит через team retro и становится shared (или отвергается с обоснованием).
- Управляет жизненным циклом toolkit — периодическая чистка устаревших aliases / scripts (например, ≥ 6 месяцев без использования = удалить), обновление зависимостей, миграция на современные альтернативы (eza вместо ls, bat вместо cat, ripgrep вместо grep).
- Знает границы — что НЕ автоматизировать в personal toolkit (критичные для безопасности операции с прод, multi-actor coordination, business logic); делегирует в team-level automation или operator pattern.

## Материалы

### Книги и публикации

- David Thomas, Andrew Hunt — **[The Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)** (2nd ed., 2019), главы про tool sharpening, automation, plain text. Старая, но фундамент mental model «инженер — это тот, кто инвестирует в свой toolkit».
- Brian Ward — **[How Linux Works](https://nostarch.com/howlinuxworks3)** (3rd ed., 2021). Не про toolkit напрямую, но даёт глубину понимания shell / process model / filesystem — фундамент для grounded automation.

### CLI design

- **[clig.dev — Command Line Interface Guidelines](https://clig.dev/)** (2020). Canonical guide CLI conventions — флаги, exit codes, output, человекочитаемость. Open-source publication. Если пишете CLI — обязательно проходить чеклист.
- **[12-Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)** (Jeff Dickey, 2016). Адаптация 12-Factor App principles на CLI tools — config, env vars, stdout/stderr separation.
- **[Heroku CLI Style Guide](https://devcenter.heroku.com/articles/cli-style-guide)** — industry-grade example consistent CLI UX.

### Tool distribution

- **[Homebrew Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)** — distribution на macOS/Linux. Свой [tap](https://github.com/jtprogru/homebrew-tap) — главный способ распространять CLI среди коллег без CGo headaches.
- **[GoReleaser](https://goreleaser.com/)** — automation релизов проектов на Go (build cross-platform binaries, GitHub Release, Homebrew formula update, Docker image). Делает релиз one-command operation.
- **[mise](https://mise.jdx.dev/) / [asdf](https://asdf-vm.com/) / [devbox](https://www.jetify.com/devbox)** — per-project tool version manager; альтернатива глобальной установке.

### Инструменты

- **Базовый productivity stack:** [fzf](https://github.com/junegunn/fzf) (fuzzy finder), [ripgrep](https://github.com/BurntSushi/ripgrep) (быстрый grep), [fd](https://github.com/sharkdp/fd) (быстрый find), [bat](https://github.com/sharkdp/bat) (cat с подсветкой), [eza](https://github.com/eza-community/eza) (modern ls), [zoxide](https://github.com/ajeetdsouza/zoxide) (smart cd), [jq](https://jqlang.org/), [yq](https://mikefarah.gitbook.io/yq). По моим наблюдениям, эта восьмёрка — фактический baseline в современных SRE-toolkits на macOS / Linux.
- **GitHub workflow:** [gh CLI](https://cli.github.com/) — встроенные shortcut'ы вместо открытия браузера. Я также написал [repo-opener](https://github.com/jtprogru/repo-opener) для open-in-browser любого git remote одной командой (там, где `gh browse` не работает — non-GitHub remotes).
- **Cloud CLI ergonomics:** aws-cli + [aws-vault](https://github.com/99designs/aws-vault), gcloud, [yccli](https://github.com/jtprogru/yccli) — мой набор aliases для Yandex Cloud CLI. Pattern переносится на любой длинный cloud-CLI.
- **Templates / generators:** [srekit](https://github.com/jtprogru/srekit) (мой генератор SRE-артефактов: postmortem / RFC / runbook / SLO / capacity plan / changelog), [cookiecutter](https://cookiecutter.readthedocs.io/), [copier](https://copier.readthedocs.io/) — для standardized project skeletons.
- **Personal secrets:** [pass](https://www.passwordstore.org/) (classic GPG-based), [jtsekret](https://github.com/jtprogru/jtsekret) (мой CLI для personal secrets management — пароли, OAuth-токены, API-keys, bot tokens), 1Password CLI / Bitwarden CLI для интеграции с password managers в скриптах.
- **Task runner:** [Taskfile](https://taskfile.dev/) (мой default — YAML, self-documenting через `task --list`), GNU make (для legacy и shell-friendly), [just](https://github.com/casey/just) (modern make-alternative). Мой [taskfiles](https://github.com/jtprogru/taskfiles) — collection переиспользуемых Taskfile templates.
- **Terminal multiplexer + editor:** tmux / zellij + neovim / helix. Personal config через dotfiles. Мой [BearLazyVim](https://github.com/jtprogru/BearLazyVim) — LazyVim-based config.
- **Notification / glue:** [notiflow](https://github.com/jtprogru/notiflow) (мой GitHub Action для Telegram-нотификаций по job complete), [terminal-notifier](https://github.com/julienXX/terminal-notifier) (macOS native), [ntfy](https://ntfy.sh/) (self-hosted push).

## Best practices

Конкретный кейс — эволюция от [gch](https://github.com/jtprogru/gch) к [srekit](https://github.com/jtprogru/srekit). `gch` начинался в 2023 как монолитная утилита на Go со всем, что мне нужно ежедневно: shorten URL, generate password, generate WTFPL license, find duplicate images, get RUB/USD rate, scaffold SRE task. Это всё работало несколько лет. Когда количество SRE-артефактов (постмортемы, RFC, runbook'и, SLO-документы) стало значимым, я вытащил их в [srekit](https://github.com/jtprogru/srekit) как отдельный CLI с собственным релизным циклом. Вывод простой. У личного toolkit есть свой технический долг, и рефакторить его приходится ровно как любую кодовую базу. Признаки, что момент настал, тоже узнаваемые: подкоманды одной утилиты обслуживают разные домены, разные пользователи хотят разного (мне — всё, коллегам — только SRE-генераторы), а объяснение нового флага занимает больше времени, чем его написание.

Dotfiles уезжают в git с первого дня. Без репозитория они не переживут ни переустановку системы, ни смену машины, ни новую работу — и это не гипотеза, а то, что я наблюдаю у каждого второго. Инженер с dotfiles в git разворачивается на новой машине за час, без них теряет неделю на «вспомнить, что я там настраивал». Схема стандартная: `~/.dotfiles` или `~/.config/dotfiles` плюс симлинки в нужные точки через GNU `stow` или собственный `install.sh`.

Распространять свои инструменты лучше через homebrew tap, а не через «скачай и положи». Свой [tap](https://github.com/jtprogru/homebrew-tap) делает личные утилиты устанавливаемыми одной командой `brew install jtprogru/tap/srekit` на любой машине — своей или коллеги. Без него начинается копирование бинарников, чужая сборка и пляски с подписью на macOS. GoReleaser обновляет formula в tap'е на каждый релиз, так что цена поддержки этой схемы почти нулевая.

Чистка идёт по расписанию. Раз в полгода я прохожу по aliases, функциям и установленным CLI и выкидываю то, чем не пользовался. Мёртвые aliases замедляют старт shell, путают поиск через `which` и засоряют diff в dotfiles. Копить дешевле, чем чистить, — ровно поэтому чистку и приходится ставить в календарь.

Дальше про уровни: alias, функция, CLI. Alias — команда с фиксированными аргументами и без логики (`alias k='kubectl'`, `alias ll='ls -la'`). Функция в shell — одна-три строки с переменными и минимальной логикой (`gcp() { git checkout main && git pull && git checkout -b "$1"; }`). CLI начинается там, где появляются подкоманды, валидация, completions и документация. Промежуточный антипаттерн узнаётся сразу: пятидесятистрочная функция на bash с case и вложенными if в dotfiles — она уже стала программой, но не оформлена как программа, без тестов, без help, без обработки ошибок. Переросла 10–15 строк — выноси в отдельный скрипт. У меня личное правило: если код переехал из `.zshrc` в отдельный `.sh`, следующая остановка — CLI на Go или Python.

Taskfile или Makefile в каждом проекте — обязательная гигиена. Минимум `dev`, `build`, `test`, `lint`, `release`, `clean`. Помогает не столько команде, сколько мне самому через три месяца, когда вопрос «как я тут собирал» звучит абсолютно всерьёз. По моим наблюдениям, чем проще запускается dev-loop, тем дольше проект остаётся живым. Я предпочитаю Taskfile: YAML вместо синтаксиса на табах, `task --list` вместо чтения файла, проще include и разделение по неймспейсам. Команды на Make — тоже норма, если он уже устоялся.

Возможность поделиться работает как фильтр качества. Утилита, которую захотели коллеги, почти всегда уже прошла проверку на дизайн: внятный help, разумные значения по умолчанию, никаких зашитых путей вида `/Users/jtprogru/...`. Если коллега поставил из tap'а и пользуется — инструмент оформлен правильно. Если пользоваться могу только я, да и то после чтения исходников, это не инструмент, а код. Делиться обязаны не все утилиты, часть остаётся личной по дизайну, но сама возможность держит код в форме.

Личные секреты — отдельная категория с особыми требованиями. Персональный toolkit почти всегда трогает чувствительное: API-токены, токены ботов, учётные данные OAuth, ключи SSH. Хранение их открытым текстом в dotfiles или в экспортах окружения — антипаттерн, см. [Secrets Management](/The-Way-of-SRE/practices/secrets-management/). Для личного использования рабочий набор небольшой: `pass` поверх GPG, 1Password CLI или Bitwarden CLI, либо собственная минимальная обёртка. Я написал [jtsekret](https://github.com/jtprogru/jtsekret) ровно потому, что разнообразие сервисов перестало помещаться в одно хранилище с устоявшейся структурой. Принципы те же, что и в командном управлении секретами: шифрование на диске, никакого plaintext в коммитах, дисциплина ротации.

## Связанные листья

- **[Toil Tracking](/The-Way-of-SRE/engineering/toil-tracking/)** — personal toolkit устраняет toil индивидуального уровня; tracking даёт baseline для решения «стоит ли writing custom tool».
- **[Toil Automation](/The-Way-of-SRE/engineering/toil-automation/)** — team-level автоматизация; personal toolkit — её самый дешёвый уровень. Хороший personal toolkit может эволюционировать в team toolkit.
- **[Shell & CLI Craft](/The-Way-of-SRE/engineering/shell-cli-craft/)** — shell skills как основа для writing tools; CLI proficiency как пред-условие.
- **[Programming Languages](/The-Way-of-SRE/engineering/programming-languages/)** — Go / Python / Rust как языки выбора для CLI tools; trade-off readiness vs cross-platform binaries.
- **[Secrets Management](/The-Way-of-SRE/practices/secrets-management/)** — personal secrets — частный случай discipline; те же principles, проще scope.
- **[Architecture Decision Records](/The-Way-of-SRE/practices/architecture-decision-records/)** — даже для personal tools полезно вести mini-ADR для significant decisions (выбор lang, distribution model).
- **[ChatOps](/The-Way-of-SRE/engineering/chatops/)** — bot-driven ops как team-level эволюция personal scripts.

## Открытые вопросы

- **Team Toolkit / Internal Tool Library** *(TBD)* — отдельная подобласть: как personal tool становится team standard. Граница с paved roads / platform engineering.
- **Tool Selection Discipline** — методология выбора между OSS-инструментами в personal stack; lock-in vs trying new things. Сейчас в SRE-сообществе доминирует «trial-and-error» вместо явных критериев.
- **Cross-platform vs single-platform** для personal CLI — выбор зависит от парка машин. У меня сейчас preference на macOS + Linux fallback; Windows игнорируется. Это решение зависит от рабочего окружения.
- Я не уверен в оптимальном времени, которое engineer должен тратить на свой toolkit — слышал оценки от «1 час в неделю» до «10% времени». Без хорошей публичной модели; обычно решается по personal preference и tooling maturity. Если у вас явные метрики времени-на-toolkit — был бы интересен опыт PR'ом.
