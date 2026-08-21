---
title: Operating Systems
description: OS как SRE-инструмент — namespaces, cgroups, syscalls, page cache, network stack, eBPF; слой между процессом и железом
sfia: [3, 4, 5, 6]
status: draft
---

«У нас Kubernetes, kernel — это магия» — позиция, которая работает, пока инцидент не звучит как «pod жив, но не отвечает», «container OOM-killed при свободном RAM», «странный TCP timeout, который не воспроизводится в staging». В этот момент инженер без OS knowledge — заложник симптомов. Я регулярно вижу команды, которые держатся на 5 senior'ах с глубоким Linux-bg, и эти senior'ы становятся single point of failure для любого «странного» инцидента. Операционная система — это не «изучать kernel хобби»: это **слой между процессом и железом**, который нужно понимать, чтобы дебажить production. Namespaces / cgroups (на чём стоит Docker / k8s), syscalls (что процесс реально просит у kernel), page cache (почему `free` ничего не говорит про memory), network stack (где между приложением и сетью теряется пакет). eBPF в 2020-х превратился из niche-tech в обязательный observability layer — но без OS knowledge он magic, с — practical tool.

Граница: [Networking](/The-Way-of-SRE/engineering/networking/) — про сетевой стек как отдельный домен; этот лист — про OS целиком (включая kernel network stack как частный случай). [Performance & Profiling](/The-Way-of-SRE/engineering/performance-profiling/) — *как мерить* perf; этот лист — *что мерить и почему так* (kernel context для USE method). [Shell & CLI Craft](/The-Way-of-SRE/engineering/shell-cli-craft/) — интерфейс к OS через terminal; этот лист — то, что под shell.

## Что должен уметь

Главный навык на уровне L4 — читать **`/proc`** как реальный source of truth для процесса: `/proc/[pid]/status`, `/proc/[pid]/maps`, `/proc/[pid]/limits`, `/proc/[pid]/fd/`. По моим наблюдениям, разница между debug'ом «процесс жив, но что-то с ним» — это разница между «знаю, что в /proc лежит» и «использую только `top` / `ps`». В incident под высоким стрессом первый прыгает в /proc сразу, второй стучится в kubernetes UI. Один день на reading `proc(5)` manpage и Reading the Linux Kernel — заметная разница для всех будущих on-call смен.

**L3**
- Понимает processes / threads / fork / exec; разбирается в exit codes, signals (SIGKILL vs SIGTERM); читает `ps`, `top`, `htop`, `pgrep`, `kill`.
- Знает базовые file system concepts: inode, hard link vs symlink, mount points, basic permissions (`chmod`, `chown`); читает `df`, `du`, `lsof`.

**L4**
- Различает **virtual memory vs RSS vs working set**; знает, что show `top` (`VIRT` / `RES` / `SHR`) и почему `free` показывает «used» иначе, чем интуиция. Понимает page cache и почему «high used memory» — обычно норма.
- Использует **`strace`** для syscall debugging: `strace -f -e trace=network nginx`, `strace -p PID`. Понимает overhead и применяет осторожно в prod.
- Понимает **namespaces и cgroups**: что Docker / k8s container — это процесс с собственным mount/network/pid namespace и cgroup limits, а не VM. Знает, как читать `/proc/[pid]/cgroup`, `/sys/fs/cgroup/`.
- Различает signals: `SIGTERM` (graceful), `SIGKILL` (kernel kill), `SIGSEGV` (programming bug); знает, что OOM-killer выбирает victim и как читать `dmesg` для post-mortem.

**L5**
- Применяет **eBPF / bpftrace** для production observability: `execsnoop`, `tcplife`, `runqlat`, `biolatency`. Понимает, что eBPF не magic — это compiled bytecode in kernel sandbox.
- Знает kernel scheduling basics: CFS, run queue, scheduler latency, NUMA affinity, hyper-threading effects.
- Debug containers без `docker exec`: `nsenter` в pid/net namespace, `cat /proc/[container-pid]/...`, attach к stuck container через kernel-level tools.

**L6+**
- Tuning производственного OS: sysctl baseline (`net.core.somaxconn`, `vm.swappiness`, `fs.file-max`), kernel parameter rationale, аудит изменений после OS upgrades.
- Реагирует на новые kernel CVE / features со знанием контекста: Spectre / Meltdown / Dirty Pipe (CVE-2022-0847), io_uring evolution, eBPF security model.

## Материалы

### Книги

- Brendan Gregg — **[Systems Performance: Enterprise and the Cloud](https://www.brendangregg.com/systems-performance-2nd-edition-book.html)** (Addison-Wesley, 2-е изд., 2020). Не только perf, а целая mental model Linux internals. Главы 3–7 — observable OS-стороны. Если выбирать одну книгу для SRE — эту.
- Brendan Gregg — **[BPF Performance Tools](https://www.brendangregg.com/bpf-performance-tools-book.html)** (Addison-Wesley, 2019). eBPF как новый класс OS observability; готовые tools (bcc-tools, bpftrace), которые работают в prod.
- W. Richard Stevens, Stephen A. Rago — **[Advanced Programming in the UNIX Environment](https://www.amazon.com/Advanced-Programming-UNIX-Environment-3rd/dp/0321637739)** (Addison-Wesley, 3-е изд., 2013). Если хочется системного introduction в syscall layer / signals / IPC — этот канон. Не для линейного чтения, а для глав по теме.
- Robert Love — **[Linux Kernel Development](https://rlove.org/)** (Addison-Wesley, 3-е изд., 2010). Введение в kernel architecture: scheduler, memory management, virtual filesystem. Не для writing kernel code — для понимания, что происходит «там, внутри».
- Liz Rice — **[Container Security](https://www.oreilly.com/library/view/container-security/9781492056690/)** (O'Reilly, 2020). Несмотря на название — лучшее краткое introduction в namespaces / cgroups / capabilities / seccomp с точки зрения «как работает контейнер». Глава 4 «Containers vs Virtual Machines» — must-read.

### Статьи и доклады

- Brendan Gregg — **[Linux Performance](https://www.brendangregg.com/linuxperf.html)**. Living document с обновлениями; одна страница с tools list, methodologies, references. Главный публичный кейс — см. ниже.
- Julia Evans — **[Wizard Zines on Linux](https://wizardzines.com/zines/)**. Серия short zines (Bite Size Linux, Container Networking, Bite Size Kubernetes) — лучший accessible introduction к Linux internals для тех, кто backed off from 1000-page books. По моим наблюдениям, чаще всего team-level «Linux fluency» расти именно через Julia's материалы.
- Liz Rice — **[Why Container Security Matters](https://www.youtube.com/watch?v=8nVUbF8aJtw)** (KubeCon). 30 минут — namespaces / cgroups / capabilities в живом demo с `unshare`, `nsenter`.
- **[The Linux Programming Interface (TLPI)](https://man7.org/tlpi/)** by Michael Kerrisk. Если книга Stevens / Rago слишком dense — это modern alternative с тем же scope. Доступна частично онлайн.

### Инструменты

- **`/proc`, `/sys`** — primary sources of truth. Каждый running process exposes огромную поверхность через `/proc/[pid]/`. По моим наблюдениям, разница между SRE-беглым и не-беглым в OS — это не книги, это привычка `cat /proc/...` как первый шаг debug.
- **`strace` / `ltrace`** — syscall и library call tracing. `strace` overhead высокий (caution в prod), но в staging — обязательный tool для «что процесс реально делает».
- **`perf`** (Linux native) — CPU profiling, hardware counters, scheduling events. Часть kernel; не требует install в современных дистрах.
- **[bcc-tools](https://github.com/iovisor/bcc) / [bpftrace](https://bpftrace.org/)** — eBPF-based tools. Brendan Gregg's bcc-tools: `execsnoop`, `opensnoop`, `biolatency`, `tcplife`, `runqlat`. Read-only observability в prod без service restart.
- **`nsenter`** — войти в namespace целевого процесса. `nsenter -t [pid] -n ss -tnlp` — посмотреть listening sockets внутри container'а без `docker exec`.
- **`dmesg`** / **`journalctl`** — kernel ring buffer / systemd logs. OOM-killer messages, kernel panic, driver issues — здесь.
- **`sysstat`** (`sar`, `iostat`, `mpstat`, `vmstat`) — classic system monitoring tools. Старые, но bedrock для baseline.
- **[BCC's PostgreSQL probes / eBPF in production](https://github.com/iovisor/bcc)** — concrete examples production-grade eBPF.
- **Анти-инструмент:** «всегда `docker exec` для дебага container'а». `docker exec` запускает новый shell в container — context отличается от target process; `nsenter` даёт actual view.

## Best practices

Главный публичный кейс — **Brendan Gregg's work at Netflix on Linux performance (2015–2020) и его публикации**. Gregg на десятилетие сделал eBPF / perf / flame graphs стандартом индустрии — не через product, а через **demonstration**: серия blog posts «Linux X: How CPU is really used», «60 seconds Linux performance analysis», «execsnoop saved my Saturday». Каждый пост — реальный production случай с командой, профилем, находкой, и исправлением. Я регулярно вижу команды, которые знают слова «eBPF», «flame graph» — но не применяют их, потому что не видели demonstration. Gregg'овские посты — best resource именно для «как реально использовать», не «что это в теории». Один час чтения «60-second Linux Performance Analysis» — материал, который окупается каждый раз при «странном» инциденте.

Три вещи, которые я повторяю чаще всего. Операционная система — слой между процессом и железом, а не commodity: позиция «у нас всё в k8s, OS не важен» работает до первого нетривиального инцидента, потому что kernel на ноде один на все pods и tuning одного worker'а прилетает соседям. При «странном» инциденте первыми открываются `/proc` и `dmesg` — до дашбордов, до Grafana, до чужих графиков; `cat /proc/[pid]/...` и `dmesg | tail -50` часто показывают причину сразу. И ни один `sysctl` не меняется «потому что так в гайде»: без записанного обоснования в коммите или runbook через год никто не вспомнит, что и зачем.

Container — не VM, и от этого зависит вся отладка. Когда контейнер считают облегчённой виртуалкой, от него ждут изоляции уровня VM и удивляются, что один контейнер выжирает ресурсы ядра на всём хосте: файловые дескрипторы, таблицу conntrack, эфемерные порты. Здоровая модель другая: процесс в namespaces и cgroups, ядро общее, ресурсы делятся в неочевидных местах. Инциденты вида «pod вылетел, рестарт не помог» я вижу регулярно, и почти всегда причина одна — исчерпан ресурс хоста, так что любой новый pod на этой ноде попадёт в ту же яму.

OOM-killer выбирает жертву по `oom_score`, а не по фактическому потреблению. Отсюда классическое недоумение: «у нас 32 GB RAM, а контейнер убили на двух гигабайтах, ядро сошло с ума». Ядро не сходило с ума. В cgroup стоял лимит 2 GB, ядро его и соблюдало, а подробности лежат в `dmesg` — там же видно, что выбор жертвы детерминирован и читается через `/proc/[pid]/oom_score`. Команды, которые после OOM не смотрят `dmesg`, обычно и остаются в убеждении, что это лотерея.

eBPF — не магия, а скомпилированный bytecode в песочнице ядра. Впечатление «bpftrace что-то показывает, работает быстро, значит колдовство» держится ровно до момента, когда разбираешь цепочку: высокоуровневый скрипт компилируется в BPF bytecode, verifier проверяет его на безопасность, JIT собирает в нативный код, и всё это исполняется в контексте ядра. Понимание этой цепочки снимает главный страх — «вдруг eBPF положит ноду». В зрелых инструментах вроде bcc и bpftrace verifier гарантирует ограниченные циклы, отсутствие неограниченной памяти и возврат за конечное время.

Kernel tuning без baseline — риск без выгоды. Пример из самых частых. Я регулярно вижу, как в production переносят тридцать строк `sysctl`, скопированных из поста на форуме 2014 года. Часть значений давно стала дефолтом ядра, часть противоречит сегодняшней нагрузке, часть чинит проблемы, которых уже нет. Рабочий порядок скучный: изменение обосновано профилем или наблюдаемой метрикой, проверено в staging, положено в коммит с объяснением и пересмотрено после очередного обновления ядра. Без этого sysctl превращается в карго-культ.

Чтение `proc(5)` окупается годами. Один вечер. `man 5 proc` описывает формат каждого файла в `/proc`, а их на процесс больше двухсот, и большинство инженеров знает от силы пяток. Один вечер — и в отладке появляется арсенал: `/proc/[pid]/status` со состоянием, потоками и масками сигналов, `/proc/[pid]/maps` с картой памяти и загруженными библиотеками, `/proc/[pid]/io` с прочитанными и записанными байтами, `/proc/[pid]/wchan` с точкой, где процесс уснул в ядре. По моим наблюдениям, беглость в `/proc` и отличает того, кто в инциденте идёт к причине, от того, кто ходит по дашбордам.

## Связанные листья

- **[Networking](/The-Way-of-SRE/engineering/networking/)** — kernel network stack — частный случай OS internals; TCP / sockets / netfilter / namespaces — overlap зоны.
- **[Performance & Profiling](/The-Way-of-SRE/engineering/performance-profiling/)** — profiling tooling (perf, eBPF) — OS-level instruments; глубокий performance невозможен без OS knowledge.
- **[Shell & CLI Craft](/The-Way-of-SRE/engineering/shell-cli-craft/)** — shell — primary interface к OS; беглость в одном требует беглости в другом.
- **[Programming Languages](/The-Way-of-SRE/engineering/programming-languages/)** — language runtime sits on OS; GC pauses, scheduler interactions, syscall patterns — это intersection.
- **[Capacity Planning](/The-Way-of-SRE/engineering/capacity-planning/)** — saturation indicators (run queue length, IO wait, page faults) — OS-level metrics.
- **[Resilience Patterns](/The-Way-of-SRE/engineering/resilience-patterns/)** — health probes на OS-level (TCP listening?, process alive?, file descriptor exhaust?) — overlap.
- **[Containerization & Orchestration](/The-Way-of-SRE/engineering/container-orchestration/)** — container = процесс в namespaces/cgroups; дебаг pod'а — это OS-debugging.
- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — non-trivial incident часто требует OS-debugging; первая минута — `dmesg`, `/proc`, `nsenter`.

## Открытые вопросы

- **[Containerization & Orchestration](/The-Way-of-SRE/engineering/container-orchestration/)** — выделен в отдельный лист; OS-knowledge — пре-условие для дебага pod'ов (container = процесс в namespaces/cgroups).
- **[Service Mesh](/The-Way-of-SRE/engineering/service-mesh/)** — выделен в отдельный лист; sidecar-proxy интерактирует с network stack через iptables — OS-debugging применимы.
- **macOS / Windows как dev environment** — большинство OS-knowledge линейно переносится на Linux production; некоторые тонкости (file system semantics, signal handling) — другие.
- **eBPF Production Readiness** *(TBD)* — best practices для написания custom eBPF programs (vs using pre-built tools); verifier limits, kernel version compatibility.
- **kernel Tuning Patterns for k8s nodes** *(TBD)* — typical sysctl set для k8s-worker'ов; обоснование, не cargo-cult.

Отдельно у меня нет ответа на вопрос про минимальную глубину знаний об OS для дежурства в кластере, который держит провайдер: EKS, GKE, AKS. Где-то там проходит разумный пол, ниже которого дежурный превращается в передатчика симптомов, но нащупать его я пока не смог. Если у вас этот пол сформулирован, расскажите через PR.
