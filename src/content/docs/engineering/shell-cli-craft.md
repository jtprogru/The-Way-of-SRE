---
title: Shell & CLI Craft
description: Композиция unix-tools как инструмент SRE — pipelines, awk/sed/jq, дисциплина «когда shell, когда полноценный язык»
sfia: [3, 4, 5, 6]
status: draft
---

«У нас всё на Python / Go, bash — это legacy для боли» — позиция, после которой команда тратит полчаса на трансформацию, которую `awk '{print $2}' | sort | uniq -c | sort -rn` делает за 5 секунд. Shell — это не «костыли», а **инструмент композиции**: 50 лет unix-tools работают как одинаковые входы и выходы, и их можно собрать в нужный конвейер прямо в терминале, без проекта на 200 строк. SRE, который не владеет shell свободно, на дежурстве наполовину слеп: пока он пишет скрипт на Python для разбора логов, инцидент уже погасили те, кто собрал `grep | jq | sort` за минуту. Этот лист — про беглость в примерно тридцати ключевых утилитах и про дисциплину выбора между shell и полноценной программой.

Граница: [Programming Languages](/The-Way-of-SRE/engineering/programming-languages/) — выбор «настоящего» языка для сервисов и инструментов (Go / Python / Rust); shell — для композиции существующих утилит. [CI/CD](/The-Way-of-SRE/engineering/ci-cd/) — где скрипты на shell живут по правилам production (pinned, linted, tested). Этот лист — про craftsmanship самого shell.

## Что должен уметь

Главный навык на уровне L4 — знать **где shell кончается, а где начинается язык**. Я регулярно вижу обе крайности: одни пишут 200-строчные bash-monsters с `function`, `getopts`, `trap` (это уже Python с худшим синтаксисом — лучше переписать), другие тянут Python для одностроки `awk '{sum += $1} END {print sum}'` (overkill). Правило, которое работает на практике: если в скрипте появляется три или больше команд `if`, или сложная структура данных, или нетривиальные ошибки, — это уже не shell. Если задача — «прогнать поток через 4 трансформации» — это shell, и любой Python будет проигрывать.

**L3**
- Свободно использует базовый набор: `grep` (с `-r`, `-E`, `-l`, `-c`), `find`, `sort`, `uniq`, `wc`, `head/tail`, `cut`, `tr`, `xargs`. Пишет однострочные pipelines для ad-hoc анализа без выхода в редактор.
- Знает разницу между `'single'` и `"double"` quoting; не цитирует переменные через `$var`, а через `"$var"` (или `"${var}"`); проверяет результат через ShellCheck.

**L4**
- Бегло пишет `awk` для пост-обработки колоночных данных (одно из самых underused tools в индустрии); читает `sed` без открытия документации для простых замен.
- Использует `jq` для JSON (де-факто стандарт в API-driven debugging); понимает `--arg`, `select()`, `map()`, `to_entries`.
- Пишет on-call shell scripts с минимальной hygiene: `set -euo pipefail`, `trap` для cleanup, явный exit codes, явная error messages в `stderr` (`>&2`).

**L5**
- Различает interactive shell (короткие команды, alias'ы, history) и scripting shell (defensive style); не путает стиль одного с другим. Pipefail / nounset / errexit — defaults для scripts, не для terminal.
- Знает modern alternatives и осознанно выбирает: `rg` (ripgrep) вместо `grep -r`, `fd` вместо `find`, `bat` вместо `cat` для интерактивного просмотра, `duf` вместо `df`. Понимает, когда modern tool оправдан, а когда POSIX-портабельность важнее.
- Применяет `xargs -P` для параллелизации; `parallel` для более сложных случаев; понимает, когда concurrency в shell ломает мысль и пора уходить в полноценный язык.

**L6+**
- Выстраивает team-level shell discipline: pinned tool versions в CI / devcontainer, shared profile / aliases, shellcheck в CI, naming convention для on-call scripts.
- Стратегически: какие задачи в org-shell library (shared bin/, terraform exec scripts, monitoring-pull scripts) — а какие настало время мигрировать в полноценный сервис.

## Материалы

### Книги

- Brian Kernighan, Rob Pike — **[The Unix Programming Environment](https://en.wikipedia.org/wiki/The_Unix_Programming_Environment)** (Prentice Hall, 1984). 40 лет, и не устарела. Глава 4 «Filters» — лучший introduction в композицию unix-tools. Если выбирать одну книгу — эту.
- Eric S. Raymond — **The Art of Unix Programming** (Addison-Wesley, 2003; полный текст выложен автором на catb.org). Не tutorial по shell, а философия: «write programs that do one thing well», «text streams are universal interface». Полезно для понимания, почему shell-tooling выживает 50 лет.
- Cameron Newham — **[Learning the bash Shell](https://www.oreilly.com/library/view/learning-the-bash/0596009658/)** (O'Reilly, 3-е изд., 2005). Канонический справочник по bash specifically. Не для линейного чтения, а для lookup.
- Dave Taylor, Brandon Perry — **[Wicked Cool Shell Scripts](https://nostarch.com/wcss2)** (No Starch Press, 2-е изд., 2017). Сборник реальных scripts с разбором; полезен как идиоматический pattern reference.

### Статьи и доклады

- **[Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)**. Если выбирать одну shell style guide — эту. Прагматичная, не «теоретическая». Все рекомендации обоснованы. По моим наблюдениям, чаще всего org-level shell standards вырастают из неё.
- **[ShellCheck Wiki](https://www.shellcheck.net/wiki/)**. Не статья, а коллекция объяснений типовых ошибок в shell. Каждое предупреждение ShellCheck — отдельная страница с подробным объяснением. Лучший способ учиться bash — читать wiki после первого фейла своего скрипта.
- Robert Mecklenburg — **[Managing Projects with GNU Make](https://www.oreilly.com/library/view/managing-projects-with/0596006101/)** (O'Reilly, 3-е изд., 2004). Make — не shell, но используется вместе. Глава про автоматизацию workflow в команде через Makefile — практическая.
- **[The Art of Command Line](https://github.com/jlevy/the-art-of-command-line)**. Curated cheat sheet на GitHub (~50k stars). Хорошая точка proof-of-knowledge: если 60% содержимого вам не знакомо — есть, что доучить.

### Инструменты

- **bash** — POSIX-совместимый default. Если выбирать один shell для скриптов — bash. Zsh лучше для интерактивной работы, но в scripts лучше bash для portability.
- **[ShellCheck](https://www.shellcheck.net/)** — линтер для shell. Обязательный pre-commit / CI hook для любого репозитория с .sh файлами. Ловит подавляющее большинство bash gotchas.
- **[jq](https://jqlang.github.io/jq/)** — де-факто стандарт для JSON в shell. По моим наблюдениям, навык jq на уровне `select() | map()` отличает рядового SRE от senior'а в on-call ситуациях с REST API.
- **[yq](https://github.com/mikefarah/yq)** — то же для YAML; критично для команд, живущих в Kubernetes (помогает читать manifests, helm-values).
- **[ripgrep (rg)](https://github.com/BurntSushi/ripgrep)** / **[fd](https://github.com/sharkdp/fd)** / **[bat](https://github.com/sharkdp/bat)** / **[delta](https://github.com/dandavison/delta)** — modern замены `grep -r` / `find` / `cat` / git diff viewer. По моим наблюдениям, чаще выбирают именно эту четвёрку для personal setup.
- **[GNU parallel](https://www.gnu.org/software/parallel/)** / **xargs -P** — параллелизация. `parallel` мощнее, но learning curve выше; `xargs -P` хватает в 80% случаев.
- **[Modern Unix](https://github.com/ibraheemdev/modern-unix)** — curated list современных альтернатив classic unix-tools. Полезно для periodic refresh personal toolchain.
- **Анти-инструмент:** «300-строчный bash-script с function / case / getopts». Это уже не shell — лучше переписать в Python / Go.

## Best practices

Главный публичный кейс — не отдельный инцидент, а феномен **`jq` и `kubectl`**: jq за ~10 лет превратился из niche-tool в обязательный навык для любого, кто работает с REST API; `kubectl ... -o json | jq` — самая частая идиома в kubernetes-on-call. Это пример того, как **композиция простых tools** доминирует над «built-in complex tools»: вместо того чтобы добавлять в kubectl полноценный query-language, индустрия сошлась на «kubectl output JSON → jq делает остальное». Я регулярно вижу команды, где опытный инженер получает ответ на сложный вопрос про k8s за минуту через `kubectl get ... -o json | jq '...'`, а вчерашний джуниор полчаса пишет под тот же вопрос Python с клиентской библиотекой. Дело не в том, что джуниор плохой. Дело в том, насколько дёшево обходится композиция в shell, когда рука набита.

Дальше — правила, которые я считаю обязательными. `set -euo pipefail` идёт в начало каждого скрипта: без `errexit` ошибка в середине ломает инварианты, без `nounset` опечатка в имени переменной тихо превращается в пустую строку, без `pipefail` падение в начале конвейера просто теряется. Не нравится такое поведение — напишите защиту явно, но не игнорируйте молча. Переменные всегда в кавычках: `"$var"`, а не `$var`, иначе пробелы и глоб-символы разносят логику; ShellCheck ловит это сам, надо только его слушать.

И правило трёх `if`. Появилось в скрипте три условные ветки, или нетривиальная структура данных, или обработка ошибок сложнее одной строки — здесь shell перестаёт работать как инструмент, перепишите на Python или Go. Bash-монстры на триста строк не пишутся за один вечер, они растут годами; здоровая команда успевает остановиться раньше.

**`awk` — самый underused tool в индустрии.** Огромная часть SRE-задач — это «возьми колоночный output, посчитай сумму / уникальные / отсортируй по N-й колонке». В Python это 10 строк, в `awk '{sum[$1] += $2} END {for (k in sum) print k, sum[k]}'` — одна строка прямо в pipe. По моим наблюдениям, беглого от небеглого в shell почти всегда отличает именно `awk`. Это не «выучить awk целиком» (язык богатый, легко утонуть) — это знать ~10 идиом наизусть. Один день, заметная разница на годы.

**Интерактивный shell и скриптовый — это разные стили.** Частая ошибка: писать скрипты так, как набираешь в терминале — без кавычек, без обработки ошибок, без `set -e`. Обратная ошибка тоже встречается: набирать в терминале оборонительные конструкции и терять на этом скорость. В терминале команды короткие, ошибиться не страшно, history спасёт. В скрипте — pipefail, nounset, явная обработка ошибок, прогон через ShellCheck. Там, где эта разница не проговорена вслух, качество скриптов гуляет от автора к автору.

**On-call shell-library заменяет «волшебные знания в голове».** В зрелой SRE-команде в shared repo лежит ~20–40 скриптов: «дать список pods в bad state по cluster», «exec в случайный pod по label», «достать last 50 stack traces из service logs». Это **активы команды**, не личный setup. По моим наблюдениям, разница между новичком и senior'ом в той же команде сокращается на месяцы, если такая library существует и поддерживается. Без неё каждый новый человек заново изобретает свои pipelines.

**Версии утилит для production фиксируются.** Скрипт с `awk` ведёт себя на BSD не так, как на GNU. То же с `sed`, `grep -P` и `date`. Поэтому в CI набор утилит пинуется образом контейнера, asdf или nix; без этого получаете классику «на ноуте работало, в CI сломалось». Это не причуда bash. Это та же дисциплина supply chain, только применённая к скриптам.

## Связанные листья

- **[Programming Languages](/The-Way-of-SRE/engineering/programming-languages/)** — выбор настоящего языка для сервисов / tools (Go / Python / Rust); shell — для композиции и ad-hoc. Граница: три if'а — переходи в язык.
- **[CI/CD](/The-Way-of-SRE/engineering/ci-cd/)** — shell-scripts в pipeline должны быть pinned, linted (ShellCheck), tested. CI — где scripted-style critical.
- **[Operating Systems](/The-Way-of-SRE/engineering/operating-systems/)** — shell — главный интерфейс к OS; знание `/proc`, `/sys`, syscall tracing (strace) — overlap с OS knowledge.
- **[Networking](/The-Way-of-SRE/engineering/networking/)** — `tcpdump`, `ss`, `dig`, `curl -v`, `mtr` — вся сетевая диагностика собирается в shell; без свободного shell в неё не войти.
- **[Runbooks](/The-Way-of-SRE/culture/runbooks/)** — шаги runbook часто состоят из команд shell; их качество (кавычки, обработка ошибок) решает, сработает ли runbook в реальном инциденте.
- **[Performance & Profiling](/The-Way-of-SRE/engineering/performance-profiling/)** — `perf`, `strace`, `ltrace`, `bpftrace` — инструменты командной строки; профилирование без свободного shell не начнётся.
- **[Toil Tracking](/The-Way-of-SRE/engineering/toil-tracking/)** — регулярно повторяемые команды — кандидаты в общий скрипт командной библиотеки; учёт ловит сигнал «этот конвейер набирали двадцать раз, пора в bin/».

## Открытые вопросы

Zsh против bash в команде: для личного терминала zsh обычно выигрывает, для общих скриптов лучше bash ради переносимости. Только вот граница, на которой терминальная команда становится скриптом, размыта, и жёсткого ответа у меня нет. Рядом — современные альтернативы *(TBD)*: fish, nushell, oil; стоит ли на них переходить командой, общепринятой позиции я не встречал. Третья тема — дизайн собственных CLI *(TBD)*, когда команда пишет свой инструмент на Cobra, Click или argparse: коды возврата, формат вывода, флаги. Это, возможно, отдельный лист на стыке с Programming Languages.

И то, в чём я не разобрался: как правильно тестировать скрипты на shell. Bats и shunit2 существуют, но берут их редко, и на практике у большинства скриптов тестов нет вовсе. Если у вас есть работающая практика — расскажите через PR.
