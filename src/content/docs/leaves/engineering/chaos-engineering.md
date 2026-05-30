---
title: Chaos Engineering
description: Hypothesis-driven эксперименты для проверки reliance-свойств системы — не «сломаем что-нибудь», а ритуал
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / Chaos Engineering
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Первое впечатление о [chaos engineering](/The-Way-of-SRE/glossary/#chaos-engineering) у людей обычно одно: «вы что, прод ломаете намеренно?». Если упростить тезис до этого — да, ломаем. Но между «давайте сломаем что-нибудь» и **«у нас есть гипотеза, мы её проверяем контролируемой инъекцией, измеряем SLI до и после, делаем вывод»** — пропасть. Первое — внеплановый outage. Второе — chaos engineering. Лист про вторую часть. Соседний лист к [Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/): patterns — **что строим**, chaos — **как проверяем, что построенное работает**.

## Что должен уметь

Главный навык на уровне L4 — формулировать **steady-state hypothesis**. Это умение, которое отличает chaos от outage: до начала эксперимента ты пишешь «при инъекции X метрика Y сохранится в пределах Z». Если SSM не зафиксирован до старта — это не chaos engineering. Я наблюдаю, что команды часто пропускают этот шаг («ну ясно же, что сервис должен жить») и в итоге не могут сказать, доказал ли эксперимент что-то.

- **L3** — Понимает, что такое chaos engineering и чем оно не является; знает [Principles of Chaos Engineering](http://principlesofchaos.org/); участвует в game day своей команды.
- **L3** — Знает основные failure modes для своего сервиса: dependency outage, network latency, resource exhaustion, instance kill, region failure. Готов их репродуцировать в dev/staging.
- **L4** — Проводит chaos experiments в staging: формулирует **steady-state hypothesis**, выбирает variables (latency / error rate / dependency kill), задаёт явный blast radius, измеряет SLI до и после, документирует findings.
- **L4** — Использует chaos tooling для своего стека: Chaos Mesh / Litmus в k8s; AWS Fault Injection Service / Azure Chaos Studio для cloud workloads; Chaos Toolkit для declarative experiments. Не «вручную через `iptables` / `kill`».
- **L5** — Проектирует **GameDay как регулярный ритуал** команды: квартальный календарь, scenarios на основе past incidents и known gaps, success criteria, observability checklist, post-game review с action items.
- **L5** — Запускает chaos в production с minimal blast radius: 1% traffic / 1 instance / single region, observability gates с auto-abort, явный runbook для cleanup и rollback. Только после уверенности в staging.
- **L5** — Связывает chaos с SLO и error budget: experiments проводятся в окне budget headroom; results feed back в SLO planning.
- **L6+** — Внедряет continuous chaos: automated experiments в CI/CD pipeline, continuous chaos в production (Netflix-style random instance termination), org-level chaos governance.
- **L6+** — Принимает strategic chaos decisions: chaos vs availability targets, regulatory implications (banking / healthcare / payments — отдельные правила), insurance / liability questions.

## Материалы

### Книги

- Casey Rosenthal, Nora Jones — **[Chaos Engineering: System Resiliency in Practice](https://www.oreilly.com/library/view/chaos-engineering/9781492043858/)** (O'Reilly, 2020). Каноническая книга от авторов Principles of Chaos. Главы про hypothesis-driven design, blast radius management, GameDay structure. Кейсы из Netflix, LinkedIn, Capital One, Slack.
- Russ Miles — **[Learning Chaos Engineering](https://www.oreilly.com/library/view/learning-chaos-engineering/9781492051001/)** (O'Reilly, 2019). Прикладной guide на Chaos Toolkit; хорош как первая практическая книга для команды.

### Статьи и доклады

- **[Principles of Chaos Engineering](https://principlesofchaos.org/)** (2017). Основополагающий документ от Netflix-команды. Короткий, читается за 10 минут.
- **[Netflix Tech Blog — Chaos Engineering Upgraded](https://netflixtechblog.com/chaos-engineering-upgraded-878d341f15fa)** (2015). История эволюции от Chaos Monkey к ChAP. Главный кейс листа — см. ниже.
- Adrian Cockcroft — **[Chaos Engineering: An Antifragile Approach](https://www.infoq.com/presentations/chaos-engineering-antifragile/)** (InfoQ). Связь chaos engineering с антифрагильностью Талеба, обоснование «почему chaos в production».
- Kelly Shortridge, Aaron Rinehart — **[Security Chaos Engineering](https://www.oreilly.com/library/view/security-chaos-engineering/9781098113810/)** (O'Reilly, 2023). Применение chaos к security-controls: validation через эксперименты, не статический audit.

### Инструменты

- **[Chaos Mesh](https://chaos-mesh.org/)** (CNCF, k8s-native) — declarative chaos через CRD (PodChaos / NetworkChaos / IOChaos / StressChaos). Я вижу, что в k8s-сценариях чаще берут именно его.
- **[Litmus](https://litmuschaos.io/)** (CNCF, k8s) — альтернатива Chaos Mesh с богатым каталогом готовых experiments (ChaosHub) и Argo Workflows integration.
- **[AWS Fault Injection Service](https://aws.amazon.com/fis/) / [Azure Chaos Studio](https://learn.microsoft.com/en-us/azure/chaos-studio/)** — managed chaos в cloud providers: EC2 instance termination, EBS pause, API throttling, network disruption. Без своего chaos-operator.
- **[Chaos Toolkit](https://chaostoolkit.org/)** — open-source declarative experiments в JSON/YAML. Multi-provider. Берут, когда нужен инструмент-agnostic к runtime.
- **[Gremlin](https://www.gremlin.com/) / [Steadybit](https://www.steadybit.com/) / [Verica](https://www.verica.io/)** — commercial платформы. Reliable safety controls (auto-abort на SLO), визуальный experiment builder, журнал аудита для regulatory.
- **[Pumba](https://github.com/alexei-led/pumba)** — Docker-focused chaos: pause / kill / netem / stress в локальном Docker. Lightweight для experiments на dev-машине.

## Best practices

Главный публичный кейс — **Netflix Chaos Monkey → ChAP**. Netflix запустил Chaos Monkey в 2010 году с простой идеи: «выключим случайный production-instance, посмотрим что упадёт». Подход шокировал многих, включая их собственную команду. Но через пять лет в blog post «Chaos Engineering Upgraded» (2015) Netflix явно сказал: «kill random instance оказалось недостаточно». Эволюционировали к ChAP (Chaos Automation Platform) с явными гипотезами, blast radius management, auto-abort по SLI. То есть **canonical case самой идеи прошёл собственную эволюцию от «сломаем что-нибудь» к «проверим гипотезу»**. Если читаете этот лист и впервые сталкиваетесь с chaos engineering — сначала статью Netflix 2015 года, потом сюда.

**Короткие правила:**

- **Chaos = hypothesis-driven эксперимент, не «сломаем что-нибудь».** Process: (1) baseline steady-state metric; (2) hypothesis «при injection X метрика Y сохранится в пределах Z»; (3) injection; (4) compare to baseline; (5) findings → action items. Если SSM не зафиксирован до старта — это не chaos engineering, это outage.
- **Start in staging, expand to production через minimal blast radius.** Путь: dev → staging → 1% prod traffic / 1 instance / 1 region → expand с явными success criteria на каждом шаге. Первый chaos сразу в prod = реальный incident, и команда теряет trust в практику.
- **Auto-abort на observability signal, не «оператор нажмёт кнопку».** SLO burn rate threshold, error rate spike, p99 latency above X → experiment автоматически прекращается. Когнитивная нагрузка + reaction time оператора → реальный impact на клиентов. Litmus probes, Chaos Toolkit rollback hooks, Gremlin halt-conditions — все это поддерживают.

Подробнее:

**GameDay — это ритуал, не разовая активность для OKR.** «Провели один game day год назад, отметили в OKR» — single-shot chaos не строит культуру и не находит новые gaps. Регулярный ритуал (квартально / раз в N спринтов), scenarios варьируются (network / dependency / resource / region / human), участвуют разные роли (on-call rotation testing), документируется в общем календаре с post-game review.

**Chaos требует observability как пре-условие — не «подтянем по ходу».** Я регулярно вижу попытки «начнём chaos, observability допилим параллельно». Без метрик / трейсов / логов impact chaos незаметен — критерий «измерить эффект» проваливается, выводов нет. Готовность к chaos: SLI/SLO определены, дашборды собраны, alerts работают, runbook'и существуют. Это **pre-check** перед adoption, не задача в параллель.

**Cultural prerequisites: blameless-постмортем, error budget, runbook-практика.** Я наблюдаю чёткое разделение: команды, у которых эти три практики работают, успешно адоптируют chaos; команды, у которых нет, — либо chaos не приживается, либо превращается в blame после первого выявленного gap. Эксперимент **найдёт** реальную проблему — это его цель. Если в команде сбои караются — feedback loop сломан, найденный gap превращается в «кто виноват», и chaos перестаёт быть инструментом. Pre-check: [blameless-постмортем](/The-Way-of-SRE/leaves/practices/blameless-postmortem/) → error budget → chaos в этом порядке.

**Связь с error budget: chaos в окне budget headroom.** Chaos сам по себе тратит budget. Правило, которое я считаю объективным: запуск только при ≥50% budget headroom; high-risk experiments — ≥75%; experimental chaos in production — никогда при burning budget. Спор не «можно ли запускать», а «есть ли headroom». Это снимает субъективность из решений.

## Связанные листья

- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — patterns = что строим; chaos = как проверяем, что построенное работает. Chaos валидирует: circuit breaker реально открывается? retry с backoff не амплифицирует? bulkhead изолирует?
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLO как baseline и safety gate. Chaos hypothesis формулируется в терминах SLI; budget headroom определяет, можно/нельзя проводить experiment.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — chaos для проверки capacity assumptions: saturation thresholds, headroom budget, auto-scaling reaction time. Без chaos эти числа «по ощущениям».
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — continuous chaos в pipeline (chaos test stage), automated GameDay scenarios; immutable artifacts позволяют быстро rollback после experiment.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — chaos готовит команду к real incidents: runbook walk-through становится muscle memory, IC получает практику в low-stakes условиях.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — game day findings обрабатываются через постмортем-процесс; cultural prerequisite адопции.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — game day валидирует runbook'и: если шаги не сработали, runbook outdated.
- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — game day scenarios варьируются по severity, тренируют correct severity declaration.
- **[Security Chaos Engineering](/The-Way-of-SRE/leaves/practices/security-chaos-engineering/)** — тот же метод, объект — security-контролы вместо reliability-свойств: проверяем, срабатывает ли detection / response, а не остаётся ли система живой.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/)** — chaos engineering = метод проверки гипотез о системе; game day = ритуал тренировки команды. Пересекаются по tooling, но разные по scope: continuous / automated chaos vs scheduled team drill.

## Открытые вопросы

- **Disaster Recovery Testing** *(TBD)* — DR drills (regional failover, DB failure, full data center loss) — большие chaos experiments верхнего уровня со своим scope и cadence.
- **Security Chaos Engineering** — выделен в отдельный лист (Practices / Information Security; см. Связанные листья).
- **Failure Modes Catalog** *(TBD)* — систематический каталог known failure modes для сервиса/системы как корень chaos scenarios.
- Я не знаю, как корректно делать chaos в regulated industries (banking / healthcare / payments) — Federal Reserve guidance / FDA / PCI-DSS накладывают ограничения, и публичной литературы про практику chaos в банках я не видел. Если есть опыт — расскажите PR'ом.
