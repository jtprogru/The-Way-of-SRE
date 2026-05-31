---
title: Personal SRE Toolkit
description: Свой набор CLI-утилит и shell-функций под повседневные операционные задачи — самый дешёвый уровень toil reduction
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Toil Reduction / Personal SRE Toolkit
- **SFIA-уровни:** 3, 4, 5
- **Приоритет:** Nice to have
- **Статус:** draft
:::

В 2023 я начал [gch](https://github.com/jtprogru/gch) — `Go CLI Helper`, монолитную CLI-утилиту со всем, что мне регулярно нужно: генератор паролей, lic-генератор, URL-shortener, поиск дубликатов JPG/PNG в каталоге, скелет investigation-таска для SRE. За это время в команды добавился целый workflow вокруг SRE-артефактов (постмортемы, RFC, runbook'и, SLO-документы, on-call отчёты) — `gch` начал распухать, разные команды стали запутывать друг друга. В 2026 я выделил эти SRE-генераторы в отдельный [srekit](https://github.com/jtprogru/srekit), оставив `gch` для повседневной мелочи. Это типичный путь personal toolkit: один монолит → специализация → разделение. Этот лист — про **самый дешёвый уровень automation**: свой набор aliases / shell-функций / CLI-утилит, который один человек собирает под себя за годы. Цена входа околонулевая, ROI — мгновенный, но toolkit имеет жизненный цикл: накапливает технический долг, требует периодической чистки, перетекает между машинами через [dotfiles](https://dotfiles.github.io/). Сосед [Toil Automation](/The-Way-of-SRE/leaves/engineering/toil-automation/) — про *team-level* паттерны; здесь — про *personal-level*. Граница неточная (хороший personal toolkit становится team toolkit и обратно), но фокус разный.

## Что должен уметь

Главный навык на уровне L4 — **знать, когда shell-alias уже не хватает, и пора писать CLI**. Alias или функция выгодна для 1-2 простых команд с фиксированными аргументами; CLI оправдан, когда нужны subcommands, валидация флагов, completions, документация. Я регулярно вижу две крайности — engineer держит 200-строчную bash-функцию с case'ами и nested-if'ами (надо переписать на Go / Python), либо пишет полноценный CLI с cobra для команды-однострочника (over-engineering). Mental model: если функция начала иметь подкоманды, флаги, exit codes — это уже CLI, оформи её как CLI.

**L3**
- Ведёт собственные dotfiles в git (`.zshrc` / `.bashrc` / `.config/nvim` / `.config/tmux` и т.д.); может развернуть свой setup на новой машине одной командой.
- Знает базовый набор productivity CLI: [fzf](https://github.com/junegunn/fzf), [ripgrep](https://github.com/BurntSushi/ripgrep), [fd](https://github.com/sharkdp/fd), [jq](https://jqlang.org/), [yq](https://mikefarah.gitbook.io/yq); умеет комбинировать через pipe.
- Использует [Taskfile](https://taskfile.dev/) или Makefile для разработки своих проектов (self-documenting commands вместо «как же я тут билдил»).

**L4**
- Пишет небольшие CLI на Go / Python / Rust под повторяющиеся задачи, которых нет в готовых инструментах; знает, когда `alias` уже не хватает, а полный CLI ещё избыточен (промежуточный уровень — shell-функция в dotfiles).
- Распространяет свои инструменты (homebrew tap, `go install`, релизы на GitHub) для синхронизации между машинами и в команде.
- Соблюдает CLI design conventions — стандартные флаги (`--help`, `--version`, `--dry-run`, `--json`), правильные exit codes, structured logs / errors на stderr, output на stdout (12-Factor CLI / [clig.dev](https://clig.dev/)).

**L5**
- Эволюционирует личный toolkit как team toolkit — то, что регулярно использую сам, проходит через team retro и становится shared (или отвергается с обоснованием).
- Управляет жизненным циклом toolkit — периодическая чистка устаревших aliases / scripts (например, ≥ 6 месяцев без использования = удалить), обновление зависимостей, миграция на современные альтернативы (eza вместо ls, bat вместо cat, ripgrep вместо grep).
- Знает границы — что НЕ автоматизировать в personal toolkit (security-критичные операции с прод, multi-actor coordination, business logic); делегирует в team-level automation или operator pattern.

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
- **[GoReleaser](https://goreleaser.com/)** — automation релизов Go-проектов (build cross-platform binaries, GitHub Release, Homebrew formula update, Docker image). Делает релиз one-command operation.
- **[mise](https://mise.jdx.dev/) / [asdf](https://asdf-vm.com/) / [devbox](https://www.jetify.com/devbox)** — per-project tool version manager; альтернатива глобальной установке.

### Инструменты

- **Базовый productivity stack:** [fzf](https://github.com/junegunn/fzf) (fuzzy finder), [ripgrep](https://github.com/BurntSushi/ripgrep) (быстрый grep), [fd](https://github.com/sharkdp/fd) (быстрый find), [bat](https://github.com/sharkdp/bat) (cat с подсветкой), [eza](https://github.com/eza-community/eza) (modern ls), [zoxide](https://github.com/ajeetdsouza/zoxide) (smart cd), [jq](https://jqlang.org/), [yq](https://mikefarah.gitbook.io/yq). По моим наблюдениям, эта восьмёрка — фактический baseline в современных SRE-toolkits на macOS / Linux.
- **GitHub workflow:** [gh CLI](https://cli.github.com/) — встроенные shortcut'ы вместо открытия браузера. Я также написал [repo-opener](https://github.com/jtprogru/repo-opener) для open-in-browser любого git remote одной командой (там, где `gh browse` не работает — non-GitHub remotes).
- **Cloud CLI ergonomics:** aws-cli + [aws-vault](https://github.com/99designs/aws-vault), gcloud, [yccli](https://github.com/jtprogru/yccli) — мой набор aliases для Yandex Cloud CLI. Pattern переносится на любой длинный cloud-CLI.
- **Templates / generators:** [srekit](https://github.com/jtprogru/srekit) (мой генератор SRE-артефактов: postmortem / RFC / runbook / SLO / capacity plan / changelog), [cookiecutter](https://www.cookiecutter.io/), [copier](https://copier.readthedocs.io/) — для standardized project skeletons.
- **Personal secrets:** [pass](https://www.passwordstore.org/) (classic GPG-based), [jtsekret](https://github.com/jtprogru/jtsekret) (мой CLI для personal secrets management — пароли, OAuth-токены, API-keys, bot tokens), 1Password CLI / Bitwarden CLI для интеграции с password managers в скриптах.
- **Task runner:** [Taskfile](https://taskfile.dev/) (мой default — YAML, self-documenting через `task --list`), GNU make (для legacy и shell-friendly), [just](https://github.com/casey/just) (modern make-alternative). Мой [taskfiles](https://github.com/jtprogru/taskfiles) — collection переиспользуемых Taskfile templates.
- **Terminal multiplexer + editor:** tmux / zellij + neovim / helix. Personal config через dotfiles. Мой [BearLazyVim](https://github.com/jtprogru/BearLazyVim) — LazyVim-based config.
- **Notification / glue:** [notiflow](https://github.com/jtprogru/notiflow) (мой GitHub Action для Telegram-нотификаций по job complete), [terminal-notifier](https://github.com/julienXX/terminal-notifier) (macOS native), [ntfy](https://ntfy.sh/) (self-hosted push).

## Best practices

Конкретный кейс — эволюция от [gch](https://github.com/jtprogru/gch) к [srekit](https://github.com/jtprogru/srekit). `gch` начинался в 2023 как монолитная Go-утилита со всем, что мне нужно ежедневно: shorten URL, generate password, generate WTFPL license, find duplicate images, get RUB/USD rate, scaffold SRE task. Это все работало несколько лет. Когда количество SRE-артефактов (постмортемы, RFC, runbook'и, SLO-документы) стало значимым, я вытащил их в [srekit](https://github.com/jtprogru/srekit) как отдельный CLI с собственным релизным циклом. Что я понял: personal toolkit имеет свой технический долг, и его периодически нужно рефакторить как любую кодовую базу. Признаки, что пора рефакторить: подкоманды одной утилиты обслуживают разные домены; разные пользователи (я vs коллеги) хотят разное (мне нужно всё, им — только SRE-генераторы); время на онбординг нового флага становится большим.

**Короткие правила:**

- **Dotfiles в git с первого дня.** Без git-репозитория dotfiles не переживут переустановку OS / смену машины / новую работу. По моим наблюдениям, engineer с git'нутыми dotfiles разворачивается на новой машине за час; без — теряет неделю на «вспомнить, что я там настраивал». Стандарт — `~/.dotfiles` или `~/.config/dotfiles` + symlink в нужные точки (GNU `stow` или собственный `install.sh`).
- **Distribution через homebrew tap, не «скачай и положи».** Свой [tap](https://github.com/jtprogru/homebrew-tap) делает personal tools установимыми одной командой `brew install jtprogru/tap/srekit` на любой машине — своей или коллеги. Без tap'а — копирование binary, чужая сборка, проблемы с подписью на macOS. GoReleaser автоматизирует update formula в tap'е на каждый release.
- **Periodically prune, не накапливай.** Каждые 6 месяцев — пройти по aliases / shell-functions / installed CLI и убрать то, что не использовал. Накопление мёртвых aliases замедляет shell startup, путает поиск через `which`, обременяет dotfiles diff'ами.

Подробнее:

**Уровень alias vs функция vs CLI — mental model.** Alias — для команды с фиксированными аргументами без логики (`alias k='kubectl'`, `alias ll='ls -la'`). Shell-функция — для 1-3 строки с простой логикой / переменными (`gcp() { git checkout main && git pull && git checkout -b "$1"; }`). CLI — когда появляются subcommands, валидация, completions, documentation. Промежуточный анти-паттерн: 50-строчная bash-функция с case'ом и nested-if'ами в dotfiles — она уже превратилась в скрипт, но не оформлена как программа (нет тестов, нет help, нет error handling). Если функция переросла 10-15 строк — выноси в отдельный script или CLI. У меня личное правило: если код переехал из `.zshrc` в отдельный `.sh`-файл, следующая итерация — это уже CLI на Go / Python.

**Taskfile / Makefile per project — обязательная гигиена.** В каждом своём проекте — `Taskfile.yml` с минимум `dev` / `build` / `test` / `lint` / `release` / `clean`. Помогает не только команде, но и самому себе через 3 месяца («как я тут билдил?»). По моим наблюдениям, чем простее тулза для запуска dev-loop, тем чаще проект остаётся живым. Я предпочитаю Taskfile перед Makefile (YAML вместо tab-only синтаксиса, нативный self-documenting `task --list`, легче include / namespacing) — но команды Make'ом тоже норма, если он уже устоялся.

**Shareability как фильтр качества.** Личная утилита, которую коллеги тоже захотели — обычно проходит test design (хороший help, разумные defaults, без personal hardcoding путей `/Users/jtprogru/...`). Если коллега смог установить из tap'а и пользоваться — это сигнал, что tool оформлен правильно. Если только я могу пользоваться и для этого нужно прочитать source — это код, не tool. Не каждая личная утилита должна стать shared (часть остаётся personal по дизайну), но возможность shareability держит код в форме.

**Personal secrets — отдельная категория с особыми требованиями.** Личный toolkit часто включает доступ к чувствительным вещам — API-tokens, bot-tokens, OAuth credentials, SSH keys. Их хранение в plain text в dotfiles или environment exports — анти-паттерн (см. [Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)). Для personal use стандарт — `pass` (GPG-based), 1Password CLI / Bitwarden CLI, либо свой минимальный wrapper. Я написал [jtsekret](https://github.com/jtprogru/jtsekret) ровно из-за того, что разнообразие сервисов перестало помещаться в одну password store с устоявшейся структурой. Принципы те же, что в team secrets management — encryption at rest, no commit of plaintext, rotation discipline.

## Связанные листья

- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — personal toolkit устраняет toil индивидуального уровня; tracking даёт baseline для решения «стоит ли writing custom tool».
- **[Toil Automation](/The-Way-of-SRE/leaves/engineering/toil-automation/)** — team-level автоматизация; personal toolkit — её самый дешёвый уровень. Хороший personal toolkit может эволюционировать в team toolkit.
- **[Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/)** — shell skills как основа для writing tools; CLI proficiency как пред-условие.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — Go / Python / Rust как языки выбора для CLI tools; trade-off readiness vs cross-platform binaries.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — personal secrets — частный случай discipline; те же principles, проще scope.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — даже для personal tools полезно вести mini-ADR для significant decisions (выбор lang, distribution model).
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — bot-driven ops как team-level эволюция personal scripts.

## Открытые вопросы

- **Team Toolkit / Internal Tool Library** *(TBD)* — отдельная подобласть: как personal tool становится team standard. Граница с paved roads / platform engineering.
- **Tool Selection Discipline** — методология выбора между OSS-инструментами в personal stack; lock-in vs trying new things. Сейчас в SRE-сообществе доминирует «trial-and-error» вместо явных критериев.
- **Cross-platform vs single-platform** для personal CLI — выбор зависит от парка машин. У меня сейчас preference на macOS + Linux fallback; Windows игнорируется. Это решение зависит от рабочего окружения.
- Я не уверен в оптимальном времени, которое engineer должен тратить на свой toolkit — слышал оценки от «1 час в неделю» до «10% времени». Без хорошей публичной модели; обычно решается по personal preference и tooling maturity. Если у вас явные метрики времени-на-toolkit — был бы интересен опыт PR'ом.
