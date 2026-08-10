---
title: Chaos Engineering
description: Проверка устойчивости системы гипотезой и контролируемой инъекцией, а не «сломаем что-нибудь и посмотрим»
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

**L3**
- Понимает, что такое chaos engineering и где проходит граница с обычной поломкой прода; знает [Principles of Chaos Engineering](http://principlesofchaos.org/); участвует в game day своей команды.
- Знает основные failure modes для своего сервиса: dependency outage, network latency, resource exhaustion, instance kill, region failure. Готов их репродуцировать в dev/staging.

**L4**
- Проводит chaos experiments в staging: формулирует **steady-state hypothesis**, выбирает variables (latency / error rate / dependency kill), задаёт явный blast radius, измеряет SLI до и после, документирует findings.
- Использует chaos tooling для своего стека: Chaos Mesh / Litmus в k8s; AWS Fault Injection Service / Azure Chaos Studio для cloud workloads; Chaos Toolkit для declarative experiments. Не «вручную через `iptables` / `kill`».

**L5**
- Проектирует **GameDay как регулярный ритуал** команды: квартальный календарь, scenarios на основе past incidents и known gaps, success criteria, observability checklist, post-game review с action items.
- Запускает chaos в production с minimal blast radius: 1% traffic / 1 instance / single region, observability gates с auto-abort, явный runbook для cleanup и rollback. Только после уверенности в staging.
- Связывает chaos с SLO и error budget: experiments проводятся в окне budget headroom; results feed back в SLO planning.

**L6+**
- Внедряет continuous chaos: automated experiments в CI/CD pipeline, continuous chaos в production (Netflix-style random instance termination), org-level chaos governance.
- Принимает strategic chaos decisions: chaos vs availability targets, regulatory implications (banking / healthcare / payments — отдельные правила), insurance / liability questions.

## Материалы

### Книги

- Casey Rosenthal, Nora Jones — **[Chaos Engineering: System Resiliency in Practice](https://www.oreilly.com/library/view/chaos-engineering/9781492043858/)** (O'Reilly, 2020). Каноническая книга от авторов Principles of Chaos. Главы про hypothesis-driven design, blast radius management, GameDay structure. Кейсы из Netflix, LinkedIn, Capital One, Slack.
- Russ Miles — **[Learning Chaos Engineering](https://www.oreilly.com/library/view/learning-chaos-engineering/9781492051001/)** (O'Reilly, 2019). Прикладной guide на Chaos Toolkit; хорош как первая практическая книга для команды.

### Статьи и доклады

- **[Principles of Chaos Engineering](https://principlesofchaos.org/)** (2015). Основополагающий документ от команды Netflix, которым дисциплина и была формально названа. Короткий, читается за 10 минут.
- **[Netflix Tech Blog — Chaos Engineering Upgraded](https://netflixtechblog.com/chaos-engineering-upgraded-878d341f15fa)** (2015). История эволюции от Chaos Monkey к ChAP. Главный кейс листа — см. ниже.
- Casey Rosenthal — **[Principles of Chaos Engineering](https://www.usenix.org/conference/srecon17americas/program/presentation/rosenthal)** (SREcon17 Americas). Доклад одного из авторов манифеста: откуда взялись принципы и почему эксперимент ставится именно в проде.
- Kelly Shortridge, Aaron Rinehart — **[Security Chaos Engineering](https://www.oreilly.com/library/view/security-chaos-engineering/9781098113810/)** (O'Reilly, 2023). Применение chaos к security-controls: validation через эксперименты, не статический audit.

### Инструменты

- **[Chaos Mesh](https://chaos-mesh.org/)** (CNCF, k8s-native) — declarative chaos через CRD (PodChaos / NetworkChaos / IOChaos / StressChaos). Я вижу, что в сценариях с k8s чаще берут именно его.
- **[Litmus](https://litmuschaos.io/)** (CNCF, k8s) — альтернатива Chaos Mesh с богатым каталогом готовых experiments (ChaosHub) и Argo Workflows integration.
- **[AWS Fault Injection Service](https://aws.amazon.com/fis/) / [Azure Chaos Studio](https://learn.microsoft.com/en-us/azure/chaos-studio/)** — managed chaos в cloud providers: EC2 instance termination, EBS pause, API throttling, network disruption. Без своего chaos-operator.
- **[Chaos Toolkit](https://chaostoolkit.org/)** — open-source declarative experiments в JSON/YAML. Multi-provider. Берут, когда нужен инструмент, не привязанный к конкретному runtime.
- **[Gremlin](https://www.gremlin.com/) / [Steadybit](https://www.steadybit.com/)** — commercial платформы. Reliable safety controls (auto-abort на SLO), визуальный experiment builder, журнал аудита для regulatory.
- **[Pumba](https://github.com/alexei-led/pumba)** — Docker-focused chaos: pause / kill / netem / stress в локальном Docker. Lightweight для экспериментов на локальной машине разработчика.

## Best practices

Главный публичный кейс — **Netflix Chaos Monkey → ChAP**. Netflix запустил Chaos Monkey в 2010 году с простой идеи: «выключим случайный production-instance, посмотрим что упадёт». Подход шокировал многих, включая их собственную команду. Но через пять лет в blog post «Chaos Engineering Upgraded» (2015) Netflix явно сказал: «kill random instance оказалось недостаточно». Эволюционировали к ChAP (Chaos Automation Platform) с явными гипотезами, blast radius management, auto-abort по SLI. То есть **canonical case самой идеи прошёл собственную эволюцию от «сломаем что-нибудь» к «проверим гипотезу»**. Если читаете этот лист и впервые сталкиваетесь с chaos engineering — сначала статью Netflix 2015 года, потом сюда.

Отсюда три правила, на которых держится вся практика.

Эксперимент начинается с гипотезы, а не с инъекции. Порядок такой: зафиксировать baseline steady-state метрики, написать гипотезу «при инъекции X метрика Y останется в пределах Z», сделать инъекцию, сравнить с baseline, превратить находки в action items. Если SSM не записан до старта — это не chaos engineering. Это outage, которому задним числом придумали смысл.

Дальше — маршрут: dev, staging, потом 1% продового трафика или один instance в одном регионе, и на каждом шаге явные success criteria для перехода к следующему. Первый chaos сразу в проде — это просто инцидент. После него команда теряет доверие к практике, и вернуть его дороже, чем было бы подождать один квартал.

Третье правило про остановку. Эксперимент прерывается автоматически по сигналу от observability — burn rate SLO, всплеск error rate, p99 выше порога, — а не «оператор нажмёт кнопку». Пока оператор осознаёт и реагирует, клиенты уже получают impact. Litmus probes, rollback hooks в Chaos Toolkit, halt-conditions в Gremlin — всё это умеют.

**GameDay — это ритуал, не разовая активность для OKR.** «Провели один game day год назад, отметили в OKR» — так культура не строится и новые gaps не находятся. Норма — квартально или раз в N спринтов, с варьирующимися сценариями (network, dependency, resource, region, человеческий фактор), с разными ролями в дежурстве и с post-game review. И всё это в общем календаре, иначе не случится.

**Chaos требует observability как пре-условие — не «подтянем по ходу».** Я регулярно вижу попытки «начнём chaos, observability допилим параллельно». Без метрик / трейсов / логов impact chaos незаметен — критерий «измерить эффект» проваливается, выводов нет. Готовность к chaos: SLI/SLO определены, дашборды собраны, alerts работают, runbook'и существуют. Это **pre-check** перед adoption, не задача в параллель.

**Культурные предусловия — blameless, error budget и живые runbook'и.** Я наблюдаю чёткое разделение: команды, у которых эти три практики работают, успешно адоптируют chaos; команды, у которых нет, — либо chaos не приживается, либо превращается в blame после первого выявленного gap. Эксперимент **найдёт** реальную проблему — это его цель. Если в команде сбои караются — feedback loop сломан, найденный gap превращается в «кто виноват», и chaos перестаёт быть инструментом. Порядок такой: [постмортем без поиска виноватых](/The-Way-of-SRE/leaves/practices/blameless-postmortem/) → error budget → chaos.

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
- **[Security Chaos Engineering](/The-Way-of-SRE/leaves/practices/security-chaos-engineering/)** — тот же метод, объект — механизмы защиты вместо свойств надёжности: проверяем, срабатывает ли detection / response, а не остаётся ли система живой.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/)** — chaos engineering = метод проверки гипотез о системе; game day = ритуал тренировки команды. Пересекаются по tooling, но разные по scope: continuous / automated chaos vs scheduled team drill.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/)** — DR drills (regional failover, DB failure, full data center loss) — большие chaos experiments верхнего уровня; здесь — про метод, там — про policy и stakeholder map, под которые они проводятся.

## Открытые вопросы

**Security Chaos Engineering** уехал в отдельный лист (Practices / Information Security, см. «Связанные листья»). Остался **Failure Modes Catalog** *(TBD)* — систематический каталог известных режимов отказа сервиса, из которого потом растут сценарии экспериментов.

Я не знаю, как корректно делать chaos в regulated industries (banking / healthcare / payments) — Federal Reserve guidance / FDA / PCI-DSS накладывают ограничения, и публичной литературы про практику chaos в банках я не видел. Если есть опыт — расскажите PR'ом.
