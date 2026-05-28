---
title: Shell & CLI Craft
description: Композиция unix-tools как инструмент SRE — pipelines, awk/sed/jq, дисциплина «когда shell, когда полноценный язык»
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Programming / Scripting / Shell & CLI Craft
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«У нас всё на Python / Go, bash — это legacy для боли» — позиция, после которой команда тратит полчаса на трансформацию, которую `awk '{print $2}' | sort | uniq -c | sort -rn` делает за 5 секунд. Shell — это не «костыли», а **инструмент композиции**: 50 лет unix-tools работают как одинаковые входы и выходы, и их можно собрать в нужный конвейер прямо в терминале, без проекта на 200 строк. SRE без shell-беглости в on-call наполовину слеп: пока он пишет Python-script для парсинга логов, инцидент уже погасили те, кто `grep | jq | sort` за минуту. Лист — про беглость в ~30 ключевых tools и про дисциплину «когда shell — правильный выбор, а когда — программа».

Граница: [Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/) — выбор «настоящего» языка для сервисов и инструментов (Go / Python / Rust); shell — для композиции существующих utilities. [CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/) — где shell-скрипты живут production-style (pinned, linted, tested). Этот лист — про craftsmanship самого shell.

## Что должен уметь

Главный навык на уровне L4 — знать **где shell кончается, а где начинается язык**. Я регулярно вижу обе крайности: одни пишут 200-строчные bash-monsters с `function`, `getopts`, `trap` (это уже Python с худшим синтаксисом — лучше переписать), другие тянут Python для одностроки `awk '{sum += $1} END {print sum}'` (overkill). Правило, которое работает на практике: если в скрипте появляется три или больше команд `if`, или сложная структура данных, или нетривиальные ошибки, — это уже не shell. Если задача — «прогнать поток через 4 трансформации» — это shell, и любой Python будет проигрывать.

- **L3** — Свободно использует базовый набор: `grep` (с `-r`, `-E`, `-l`, `-c`), `find`, `sort`, `uniq`, `wc`, `head/tail`, `cut`, `tr`, `xargs`. Пишет однострочные pipelines для ad-hoc анализа без выхода в редактор.
- **L3** — Знает разницу между `'single'` и `"double"` quoting; не цитирует переменные через `$var`, а через `"$var"` (или `"${var}"`); проверяет результат через ShellCheck.
- **L4** — Бегло пишет `awk` для пост-обработки колоночных данных (одно из самых underused tools в индустрии); читает `sed` без открытия документации для простых замен.
- **L4** — Использует `jq` для JSON (де-факто стандарт в API-driven debugging); понимает `--arg`, `select()`, `map()`, `to_entries`.
- **L4** — Пишет on-call shell scripts с минимальной hygiene: `set -euo pipefail`, `trap` для cleanup, явный exit codes, явная error messages в `stderr` (`>&2`).
- **L5** — Различает interactive shell (короткие команды, alias'ы, history) и scripting shell (defensive style); не путает стиль одного с другим. Pipefail / nounset / errexit — defaults для scripts, не для terminal.
- **L5** — Знает modern alternatives и осознанно выбирает: `rg` (ripgrep) вместо `grep -r`, `fd` вместо `find`, `bat` вместо `cat` для интерактивного просмотра, `duf` вместо `df`. Понимает, когда modern tool оправдан, а когда POSIX-портабельность важнее.
- **L5** — Применяет `xargs -P` для параллелизации; `parallel` для более сложных случаев; понимает, когда concurrency в shell ломает мысль и пора уходить в полноценный язык.
- **L6+** — Выстраивает team-level shell discipline: pinned tool versions в CI / devcontainer, shared profile / aliases, shellcheck в CI, naming convention для on-call scripts.
- **L6+** — Стратегически: какие задачи в org-shell library (shared bin/, terraform exec scripts, monitoring-pull scripts) — а какие настало время мигрировать в полноценный сервис.

## Материалы

### Книги

- Brian Kernighan, Rob Pike — **[The Unix Programming Environment](https://en.wikipedia.org/wiki/The_Unix_Programming_Environment)** (Prentice Hall, 1984). 40 лет, и не устарела. Глава 4 «Filters» — лучший introduction в композицию unix-tools. Если выбирать одну книгу — эту.
- Eric S. Raymond — **[The Art of Unix Programming](http://www.catb.org/~esr/writings/taop/html/)** (Addison-Wesley, 2003). Не tutorial по shell, а философия: «write programs that do one thing well», «text streams are universal interface». Полезно для понимания, почему shell-tooling выживает 50 лет.
- Cameron Newham — **[Learning the bash Shell](https://www.oreilly.com/library/view/learning-the-bash/0596009658/)** (O'Reilly, 3-е изд., 2005). Канонический справочник по bash specifically. Не для линейного чтения, а для lookup.
- Dave Taylor, Brandon Perry — **[Wicked Cool Shell Scripts](https://nostarch.com/wcss2)** (No Starch Press, 2-е изд., 2017). Сборник реальных scripts с разбором; полезен как идиоматический pattern reference.

### Статьи и доклады

- **[Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)**. Если выбирать одну shell style guide — эту. Прагматичная, не «теоретическая». Все рекомендации обоснованы. По моим наблюдениям, чаще всего org-level shell standards вырастают из неё.
- **[ShellCheck Wiki](https://www.shellcheck.net/wiki/)**. Не статья, а коллекция объяснений common shell-ошибок. Каждое предупреждение ShellCheck — отдельная страница с подробным объяснением. Лучший способ учиться bash — читать wiki после первого фейла своего скрипта.
- Robert Mecklenburg — **[Managing Projects with GNU Make](https://www.oreilly.com/library/view/managing-projects-with/0596006101/)** (O'Reilly, 3-е изд., 2004). Make — не shell, но используется вместе. Глава про автоматизацию workflow в команде через Makefile — практическая.
- **[The Art of Command Line](https://github.com/jlevy/the-art-of-command-line)**. Curated cheat sheet на GitHub (~50k stars). Хорошая точка proof-of-knowledge: если 60% содержимого вам не знакомо — есть, что доучить.

### Инструменты

- **bash** — POSIX-совместимый default. Если выбирать один shell для скриптов — bash. Zsh лучше для интерактивной работы, но в scripts лучше bash для portability.
- **[ShellCheck](https://www.shellcheck.net/)** — линтер для shell. Обязательный pre-commit / CI hook для любого репозитория с .sh файлами. Ловит подавляющее большинство bash gotchas.
- **[jq](https://jqlang.github.io/jq/)** — де-факто стандарт для JSON в shell. По моим наблюдениям, навык jq на уровне `select() | map()` отличает рядового SRE от senior'а в on-call ситуациях с REST API.
- **[yq](https://github.com/mikefarah/yq)** — то же для YAML; критично для kubernetes-команд (помогает читать manifests, helm-values).
- **[ripgrep (rg)](https://github.com/BurntSushi/ripgrep)** / **[fd](https://github.com/sharkdp/fd)** / **[bat](https://github.com/sharkdp/bat)** / **[delta](https://github.com/dandavison/delta)** — modern замены `grep -r` / `find` / `cat` / git diff viewer. По моим наблюдениям, чаще выбирают именно эту четвёрку для personal setup.
- **[GNU parallel](https://www.gnu.org/software/parallel/)** / **xargs -P** — параллелизация. `parallel` мощнее, но learning curve выше; `xargs -P` хватает в 80% случаев.
- **[Modern Unix](https://github.com/ibraheemdev/modern-unix)** — curated list современных альтернатив classic unix-tools. Полезно для periodic refresh personal toolchain.
- **Анти-инструмент:** «300-строчный bash-script с function / case / getopts». Это уже не shell — лучше переписать в Python / Go.

## Best practices

Главный публичный кейс — не отдельный инцидент, а феномен **`jq` и `kubectl`**: jq за ~10 лет превратился из niche-tool в обязательный навык для любого, кто работает с REST API; `kubectl ... -o json | jq` — самая частая идиома в kubernetes-on-call. Это пример того, как **композиция простых tools** доминирует над «built-in complex tools»: вместо того чтобы добавлять в kubectl полноценный query-language, индустрия сошлась на «kubectl output JSON → jq делает остальное». Я регулярно вижу команды, в которых senior'ы за минуту получают ответ на сложный k8s-вопрос через `kubectl get ... -o json | jq '...'`, а junior'ы за полчаса пишут Python с k8s client library под тот же вопрос. Это не критика junior'ов — это пример того, насколько мощна «cheap composition» через shell, когда инженер беглый.

**Короткие правила:**

- **`set -euo pipefail` — defaults для каждого scripted файла.** Без `errexit` ошибка в середине ломает invariants; без `nounset` typo в имени переменной превращается в `""`; без `pipefail` failure в начале pipeline теряется. Не нравится — пиши защиту явно, но не молча игнорируй.
- **Quote variables: `"$var"`, не `$var`.** Без кавычек слова со spaces / glob characters ломают код. ShellCheck ловит это автоматически — не игнорируй.
- **Three-`if` правило: если в скрипте появляется три или больше условных ветвей или нетривиальная структура — это уже не shell.** Перепиши в Python / Go. Долгие bash-monsters — это тех-долг, который рос годами; здоровая команда вовремя останавливается.

Подробнее:

**`awk` — самый underused tool в индустрии.** Огромная часть SRE-задач — это «возьми колоночный output, посчитай сумму / уникальные / отсортируй по N-й колонке». В Python это 10 строк, в `awk '{sum[$1] += $2} END {for (k in sum) print k, sum[k]}'` — одна строка прямо в pipe. По моим наблюдениям, разница между беглым и не-беглым в shell — почти всегда `awk`-fluency. Это не «выучить awk целиком» (язык богатый, легко утонуть) — это знать ~10 идиом наизусть. Один день, заметная разница на годы.

**Interactive vs scripted shell — разный стиль.** Распространённая ошибка — писать scripts стилем terminal-сессии (без quoting, без error handling, без `set -e`) или, наоборот, в terminal писать defensive ad-hoc команды (теряется скорость). В terminal: короткие, можно ошибиться, history спасёт. В scripts: pipefail / nounset, явный error handling, ShellCheck'нуто. Я регулярно вижу команды, в которых эта разница не сформулирована — и script-quality плавающая.

**On-call shell-library заменяет «волшебные знания в голове».** В зрелой SRE-команде в shared repo лежит ~20–40 скриптов: «дать список pods в bad state по cluster», «exec в случайный pod по label», «достать last 50 stack traces из service logs». Это **активы команды**, не личный setup. По моим наблюдениям, разница между новичком и senior'ом в той же команде сокращается на месяцы, если такая library существует и поддерживается. Без неё каждый новый человек заново изобретает свои pipelines.

**Pin tool versions для production scripts.** Bash-script, использующий `awk`, работает на BSD `awk` иначе, чем на GNU `awk`. То же с `sed`, `grep -P`, `date` (BSD vs GNU). Production scripts в CI пинуют tooling через container image / asdf / nix; не пинуют — получают «работало на моём ноуте, ломается в CI». Это не bash gotcha — это discipline of supply chain для shell scripts.

## Связанные листья

- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — выбор настоящего языка для сервисов / tools (Go / Python / Rust); shell — для композиции и ad-hoc. Граница: три if'а — переходи в язык.
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — shell-scripts в pipeline должны быть pinned, linted (ShellCheck), tested. CI — где scripted-style critical.
- **[Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)** — shell — главный интерфейс к OS; знание `/proc`, `/sys`, syscall tracing (strace) — overlap с OS knowledge.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — `tcpdump`, `ss`, `dig`, `curl -v`, `mtr` — все сетевые tools — это shell-композиция; shell-беглость — пре-условие для networking-беглости.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook шаги часто включают shell-команды; их качество (правильно ли quoted, есть ли error handling) определяет real-incident usability.
- **[Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/)** — `perf`, `strace`, `ltrace`, `bpftrace` — CLI-инструменты; profiling-беглость требует shell-беглости.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — recurring shell-команды — кандидат на shared script в team library; tracking ловит signal «эту pipeline-команду набирали 20 раз — пора в bin/».

## Открытые вопросы

- **Zsh vs Bash для команды** — для personal terminal zsh обычно выигрывает; для shared scripts — bash для portability. Но граница «где terminal становится скриптом» нечёткая.
- **Modern shell альтернативы** *(TBD)* — fish / nushell / oil. Стоит ли в SRE-команде переходить — открытый вопрос, общепринятой позиции нет.
- **CLI design для собственных tools** — отдельная подтема (когда команда пишет свой CLI: Cobra / Click / argparse, exit codes, output format). Возможно отдельный лист на стыке Programming Languages.
- Я не уверен, как **тестировать shell-scripts** правильно. Bats / shunit2 существуют, но adoption низкий; на практике большинство bash-scripts не имеют tests. Если у вас есть рабочая practice — расскажите через PR.
