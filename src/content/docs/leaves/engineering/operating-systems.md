---
title: Operating Systems
description: OS как SRE-инструмент — namespaces, cgroups, syscalls, page cache, network stack, eBPF; слой между процессом и железом
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** IT Infrastructure / Operating Systems
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«У нас Kubernetes, kernel — это магия» — позиция, которая работает, пока инцидент не звучит как «pod жив, но не отвечает», «container OOM-killed при свободном RAM», «странный TCP timeout, который не воспроизводится в staging». В этот момент инженер без OS knowledge — заложник симптомов. Я регулярно вижу команды, которые держатся на 5 senior'ах с глубоким Linux-bg, и эти senior'ы становятся single point of failure для любого «странного» инцидента. Операционная система — это не «изучать kernel хобби»: это **слой между процессом и железом**, который нужно понимать, чтобы дебажить production. Namespaces / cgroups (на чём стоит Docker / k8s), syscalls (что процесс реально просит у kernel), page cache (почему `free` ничего не говорит про memory), network stack (где между приложением и сетью теряется пакет). eBPF в 2020-х превратился из niche-tech в обязательный observability layer — но без OS knowledge он magic, с — practical tool.

Граница: [Networking](/The-Way-of-SRE/leaves/engineering/networking/) — про сетевой стек как отдельный домен; этот лист — про OS целиком (включая kernel network stack как частный случай). [Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/) — *как мерить* perf; этот лист — *что мерить и почему так* (kernel context для USE method). [Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/) — интерфейс к OS через terminal; этот лист — то, что под shell.

## Что должен уметь

Главный навык на уровне L4 — читать **`/proc`** как реальный source of truth для процесса: `/proc/[pid]/status`, `/proc/[pid]/maps`, `/proc/[pid]/limits`, `/proc/[pid]/fd/`. По моим наблюдениям, разница между debug'ом «процесс жив, но что-то с ним» — это разница между «знаю, что в /proc лежит» и «использую только `top` / `ps`». В incident под высоким стрессом первый прыгает в /proc сразу, второй стучится в kubernetes UI. Один день на reading `proc(5)` manpage и Reading the Linux Kernel — заметная разница для всех будущих on-call смен.

- **L3** — Понимает processes / threads / fork / exec; разбирается в exit codes, signals (SIGKILL vs SIGTERM); читает `ps`, `top`, `htop`, `pgrep`, `kill`.
- **L3** — Знает базовые file system concepts: inode, hard link vs symlink, mount points, basic permissions (`chmod`, `chown`); читает `df`, `du`, `lsof`.
- **L4** — Различает **virtual memory vs RSS vs working set**; знает, что show `top` (`VIRT` / `RES` / `SHR`) и почему `free` показывает «used» иначе, чем интуиция. Понимает page cache и почему «high used memory» — обычно норма.
- **L4** — Использует **`strace`** для syscall debugging: `strace -f -e trace=network nginx`, `strace -p PID`. Понимает overhead и применяет осторожно в prod.
- **L4** — Понимает **namespaces и cgroups**: что Docker / k8s container — это процесс с собственным mount/network/pid namespace и cgroup limits, а не VM. Знает, как читать `/proc/[pid]/cgroup`, `/sys/fs/cgroup/`.
- **L4** — Различает signals: `SIGTERM` (graceful), `SIGKILL` (kernel kill), `SIGSEGV` (programming bug); знает, что OOM-killer выбирает victim и как читать `dmesg` для post-mortem.
- **L5** — Применяет **eBPF / bpftrace** для production observability: `execsnoop`, `tcplife`, `runqlat`, `biolatency`. Понимает, что eBPF не magic — это compiled bytecode in kernel sandbox.
- **L5** — Знает kernel scheduling basics: CFS, run queue, scheduler latency, NUMA affinity, hyper-threading effects.
- **L5** — Debug containers без `docker exec`: `nsenter` в pid/net namespace, `cat /proc/[container-pid]/...`, attach к stuck container через kernel-level tools.
- **L6+** — Tuning производственного OS: sysctl baseline (`net.core.somaxconn`, `vm.swappiness`, `fs.file-max`), kernel parameter rationale, аудит изменений после OS upgrades.
- **L6+** — Реагирует на новые kernel CVE / features со знанием контекста: Spectre / Meltdown / Dirty Pipe (CVE-2022-0847), io_uring evolution, eBPF security model.

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

**Короткие правила:**

- **OS — слой между процессом и железом, не commodity.** «У нас всё в k8s, OS не важен» — позиция, которая работает до первого нетривиального инцидента. Container — это процесс с namespaces / cgroups, kernel один на все pods на ноде; tuning одного worker'а влияет на соседей.
- **`/proc` и `dmesg` — первый шаг при «странном» инциденте.** До UI, до dashboards, до Grafana — `cat /proc/[pid]/...`, `dmesg | tail -50`. Часто причина видна сразу.
- **Sysctl не настраиваются «потому что в guide»**. Каждое изменение — explicit rationale в git commit / runbook. Без rationale через год никто не помнит, что и почему.

Подробнее:

**Container ≠ VM, и это формирует debug-стиль.** Трактовка «container — облегчённая VM» создаёт неправильную mental model: внутри container ОЖИДАЮТ изоляции уровня VM, и удивляются, что один container может exhaust kernel resources хоста (file descriptors, conntrack table, ephemeral ports). Healthy model: container — это процесс в namespaces / cgroups, kernel общий, ресурсы могут shared в неочевидных местах. Я регулярно вижу инциденты типа «pod вылетел, но restart не помог» — потому что host-level resource exhausted, и любой новый pod на этом host попадёт в ту же проблему.

**OOM-killer выбирает victim по `oom_score`, не «по фактическому usage».** Распространённая путаница: «у нас 32GB RAM, container ушёл OOM-killed в 2GB — kernel сошёл с ума». Реально: cgroup memory limit стоял 2GB, kernel honored limit. `dmesg` показывает exact details. Я регулярно вижу команды, которые не читают `dmesg` после OOM — и не понимают, что выбор victim'а — deterministic process с `/proc/[pid]/oom_score`.

**eBPF — это не magic, это compiled bytecode в kernel sandbox.** Распространённое впечатление: «bpftrace показывает что-то и работает быстро — это магия». Реально: programmer пишет high-level script → компилится в BPF bytecode → kernel verifies safety → JIT-compiles в native → runs in kernel context. Knowing this — снимает страх «вдруг eBPF положит ноду». В production-ready BPF tools (bcc, bpftrace) verifier гарантирует safety: bounded loops, no unbounded memory, returns within time.

**Kernel tuning без baseline — риск без выгоды.** Я регулярно вижу команды, которые скопировали 30 строк `sysctl` из forum-поста 2014 года в production. Часть параметров уже kernel default, часть — opposed to сегодняшнего workload, часть — legacy fixes для проблем, которых нет. Healthy approach: каждое изменение — обоснованное по profile / observed metric; tested в staging; git commit с rationale; revisit раз в год после kernel upgrade. Без этой дисциплины sysctl превращается в cargo-cult.

**Reading `proc(5)` manpage окупается на годы.** `man 5 proc` — описание формата каждого файла в `/proc`. 200+ файлов на процесс, и большинство SRE знают ~5 из них. Один вечер чтения — и в debug появляется arsenal: `/proc/[pid]/status` (state, threads, signal masks), `/proc/[pid]/maps` (memory mapping, shared libs), `/proc/[pid]/io` (read/write bytes), `/proc/[pid]/wchan` (где процесс sleep'ит в kernel). По моим наблюдениям, разница между OS-беглым SRE и не — почти всегда `/proc`-fluency.

## Связанные листья

- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — kernel network stack — частный случай OS internals; TCP / sockets / netfilter / namespaces — overlap зоны.
- **[Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/)** — profiling tooling (perf, eBPF) — OS-level instruments; глубокий performance невозможен без OS knowledge.
- **[Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/)** — shell — primary interface к OS; беглость в одном требует беглости в другом.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — language runtime sits on OS; GC pauses, scheduler interactions, syscall patterns — это intersection.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — saturation indicators (run queue length, IO wait, page faults) — OS-level metrics.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — health probes на OS-level (TCP listening?, process alive?, file descriptor exhaust?) — overlap.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — non-trivial incident часто требует OS-debugging; первая минута — `dmesg`, `/proc`, `nsenter`.

## Открытые вопросы

- **Containerization & Orchestration как отдельный лист** *(TBD)* — Docker / containerd / runc internals, k8s primitives, OCI specs. Соседняя тема под IT Infrastructure.
- **Service Mesh патчит OS-layer** *(TBD)* — Envoy / Istio sidecar — что реально делают на networking stack. Соседняя тема.
- **macOS / Windows как dev environment** — большинство OS-knowledge линейно переносится на Linux production; некоторые тонкости (file system semantics, signal handling) — другие.
- **eBPF Production Readiness** *(TBD)* — best practices для написания custom eBPF programs (vs using pre-built tools); verifier limits, kernel version compatibility.
- **kernel Tuning Patterns for k8s nodes** *(TBD)* — typical sysctl set для k8s-worker'ов; обоснование, не cargo-cult.
- Я не уверен, какой **минимальный depth OS knowledge** достаточен для on-call в managed-k8s environment (EKS / GKE / AKS). Если у вас есть pragmatic floor — расскажите через PR.
