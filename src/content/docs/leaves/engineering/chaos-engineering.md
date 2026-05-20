---
title: Chaos Engineering
description: Hypothesis-driven эксперименты, в которых система вводится в контролируемый сбой ради проверки её reliance-свойств. Не «давайте сломаем что-нибудь», а явная гипотеза → инъекция → измерение → вывод. Граница с Resilience Patterns зафиксирована — patterns строят, chaos проверяет, что построенное работает
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / Chaos Engineering
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Hypothesis-driven эксперименты, в которых система вводится в контролируемый сбой ради проверки её reliance-свойств. **Не** «давайте сломаем что-нибудь», а явная steady-state hypothesis → инъекция переменной (latency / error / dependency kill / resource starvation) → измерение деградации → вывод о gaps. Соседний лист к [Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/) под L1 `Reliability Engineering`; граница чёткая: **patterns — что строим, chaos — как проверяем, что построенное работает**. Без observability и blameless-культуры не приживается.

## Что должен уметь

- **L3** — Понимает, что такое chaos engineering и **чем оно не является** (не «outage по расписанию», а hypothesis-driven эксперимент). Знает [Principles of Chaos Engineering](http://principlesofchaos.org/). Участвует в game day своей команды.
- **L3** — Знает основные failure modes для своего сервиса: dependency outage, network latency, resource exhaustion, instance kill, region failure. Готов их репродуцировать в dev/staging.
- **L4** — Проводит chaos experiments в staging: формулирует **steady-state hypothesis** (что должно сохраниться при инъекции), выбирает variables (latency / error rate / dependency kill), задаёт явный blast radius, измеряет SLI до и после, документирует findings.
- **L4** — Использует chaos tooling для своего стека: Chaos Mesh / Litmus в k8s; AWS Fault Injection Service / Azure Chaos Studio для cloud workloads; Chaos Toolkit для declarative experiments. Не «вручную через `iptables` / `kill`».
- **L5** — Проектирует **GameDay как регулярный ритуал** команды: квартальный календарь, scenarios на основе past incidents и known gaps, success criteria, observability checklist, post-game review с action items. Не разовая активность для OKR.
- **L5** — Запускает chaos в production с minimal blast radius: 1% traffic / 1 instance / single region, observability gates с auto-abort, явный runbook для cleanup и rollback. Только после уверенности в staging.
- **L5** — Связывает chaos с SLO и error budget: experiments проводятся в окне budget headroom; results feed back в SLO planning (если budget сгорает в chaos — небезопасно для production).
- **L6+** — Внедряет continuous chaos: automated experiments в CI/CD pipeline (chaos test stage), continuous chaos в production (Netflix-style random instance termination), org-level chaos governance (peak time / launches / regulatory windows — `chaos: forbidden`).
- **L6+** — Принимает strategic chaos decisions: chaos vs availability targets (high-SLO services получают continuous chaos), regulatory implications (banking / healthcare / payments — отдельные правила), insurance / liability questions для chaos в production финансовых сервисов.

## Материалы

### Книги

- Casey Rosenthal, Nora Jones — **[Chaos Engineering: System Resiliency in Practice](https://www.oreilly.com/library/view/chaos-engineering/9781492043858/)** (O'Reilly, 2020). **База.** Каноническая книга от авторов Principles of Chaos. Главы про hypothesis-driven design, blast radius management, GameDay structure, continuous chaos. Кейсы из Netflix, LinkedIn, Capital One, Slack.
- Russ Miles — **[Learning Chaos Engineering](https://www.oreilly.com/library/view/learning-chaos-engineering/9781492051001/)** (O'Reilly, 2019). **Дополнительно.** Прикладной guide на Chaos Toolkit; хорош как первая практическая книга для команды, начинающей chaos.

### Статьи и доклады

- **[Principles of Chaos Engineering](https://principlesofchaos.org/)** (2017). **База.** Основополагающий документ от Netflix-команды (Casey Rosenthal et al.). Короткий, читается за 10 минут, формулирует 4 principles: build hypothesis, vary real-world events, run in production, automate.
- **[Netflix Tech Blog — Chaos Engineering Upgraded](https://netflixtechblog.com/chaos-engineering-upgraded-878d341f15fa)** (2015). **База.** История эволюции от Chaos Monkey к ChAP (Chaos Automation Platform): почему «kill random instance» недостаточно, как пришли к hypothesis-driven подходу.
- Adrian Cockcroft — **[Chaos Engineering: An Antifragile Approach](https://www.infoq.com/presentations/chaos-engineering-antifragile/)** (InfoQ talk). **Дополнительно.** Cвязь chaos engineering с антифрагильностью Талеба, обоснование «почему chaos в production».
- Kelly Shortridge, Aaron Rinehart — **[Security Chaos Engineering](https://www.oreilly.com/library/view/security-chaos-engineering/9781098113810/)** (O'Reilly, 2023). **Продвинуто.** Применение chaos engineering к security: validation security controls через эксперименты, не статический audit. Цитата для контекста: «availability и security должны быть выясняемыми, а не предполагаемыми».

### Инструменты

- **[Chaos Mesh](https://chaos-mesh.org/)** (CNCF, k8s-native) — declarative chaos через CustomResourceDefinitions (PodChaos / NetworkChaos / IOChaos / StressChaos). Dashboard, workflow engine, scheduling. Production-ready для k8s workloads.
- **[Litmus](https://litmuschaos.io/)** (CNCF, k8s) — альтернатива Chaos Mesh с богатым каталогом готовых experiments (ChaosHub) и Argo Workflows integration.
- **[AWS Fault Injection Service](https://aws.amazon.com/fis/) / [Azure Chaos Studio](https://learn.microsoft.com/en-us/azure/chaos-studio/)** — managed chaos в cloud providers: EC2 instance termination, EBS pause, API throttling, network disruption — без своего chaos-operator'а.
- **[Chaos Toolkit](https://chaostoolkit.org/)** — open-source declarative experiments в JSON/YAML. Multi-provider (AWS / GCP / k8s / Istio / custom drivers). Подходит когда нужен инструмент-agnostic к runtime.
- **[Gremlin](https://www.gremlin.com/) / [Steadybit](https://www.steadybit.com/) / [Verica](https://www.verica.io/)** — commercial платформы. Реliable safety controls (auto-abort на SLO), визуальный experiment builder, audit trail для regulatory.
- **[Pumba](https://github.com/alexei-led/pumba)** — Docker-focused chaos: pause / kill / netem / stress в локальном Docker. Lightweight для experiments на dev-машине.

## Best practices

- **Chaos = hypothesis-driven эксперимент, не «давайте сломаем что-нибудь».** Антипаттерн: «давайте убьём instance и посмотрим». Без явной hypothesis невозможно понять, доказал ли experiment что-то. Process: (1) baseline steady-state metric; (2) hypothesis «при injection X SSM сохранится в пределах Y»; (3) injection; (4) compare to baseline; (5) findings → action items. Если SSM не зафиксирован до старта — это не chaos engineering, это outage.
- **Start in staging, expand to production через minimal blast radius.** Антипаттерн: «у нас staging слабый, давайте сразу в проде». Без validation в staging первый chaos в prod = реальный incident, и команда теряет trust в практику. Путь: dev → staging → 1% prod traffic / 1 instance / 1 region → expand с явными success criteria на каждом шаге.
- **Auto-abort на observability signal, не «оператор нажмёт кнопку».** Антипаттерн: человек смотрит дашборд во время chaos и решает в моменте остановить. Когнитивная нагрузка + reaction time → real customer impact. Auto-abort: SLO burn rate threshold, error rate spike, p99 latency above X → experiment автоматически прекращается, restoring change reverts. Tooling это поддерживает (Litmus probes, Chaos Toolkit rollback hooks, Gremlin halt-conditions).
- **GameDay — это ритуал, не разовая активность для OKR.** Антипаттерн: «провели один game day год назад, отметили в OKR». Single-shot chaos не строит culture и не находит новые gaps. Регулярный ритуал (квартально / раз в N спринтов), scenarios варьируются (network / dependency / resource / region / human), участвуют разные роли (on-call rotation testing), документируется в общем календаре с post-game review.
- **Chaos требует observability как пре-условие — не «подтянем по ходу».** Антипаттерн: «начнём chaos, observability допилим». Без метрик / трейсов / логов impact chaos незаметен — критерий «измерить эффект» проваливается, выводов нет. Готовность к chaos: SLI/SLO определены, дашборды собраны, alerts работают, runbook'и существуют. Pre-check перед adoption, не «начнём, observability подтянется».
- **Связь с error budget: chaos в окне budget headroom.** Антипаттерн: «у нас error budget на исходе, но всё равно запустим chaos для галочки». Chaos сам по себе тратит budget. Правило: запуск только при ≥50% budget headroom; high-risk experiments — ≥75%; experimental chaos in production — никогда при burning budget. Это объективное правило, спор не «можно ли», а «есть ли headroom».
- **Cultural prerequisites: blameless, error budget, postmortem-практика.** Антипаттерн: chaos в команде, где сбои karмаются. Эксперимент найдёт реальную проблему — кто-то «виноват», feedback loop сломан. Chaos не приживается без [blameless-постмортемов](/The-Way-of-SRE/leaves/practices/blameless-postmortem/) (findings → action items, не blame); без error budget — нет легитимного «бюджета на risk»; без постмортем-ритуала — findings не превращаются в действия. Pre-check перед adoption.

## Связанные листья

- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — патерны — **что строим**; chaos — **как проверяем что построенное работает**. Chaos валидирует: circuit breaker реально открывается? retry с backoff не амплифицирует? bulkhead изолирует? graceful degradation срабатывает?
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLO как baseline и safety gate. Chaos hypothesis формулируется в терминах SLI; budget headroom определяет можно/нельзя проводить experiment.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — chaos для проверки capacity assumptions: saturation thresholds, headroom budget, auto-scaling reaction time. Без chaos эти числа «по ощущениям».
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — continuous chaos в pipeline (chaos test stage), automated GameDay scenarios; immutable artifacts позволяют быстро rollback после experiment.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — chaos готовит команду к real incidents: runbook walk-through становится muscle memory, IC получает практику в low-stakes условиях.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — game day findings обрабатываются через постмортем-процесс (gap → action item → fix → re-test). Cultural prerequisite — без blameless адопция стопорится.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — game day валидирует runbook'и: если шаги не сработали, runbook outdated и нуждается в обновлении.
- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — game day scenarios варьируются по severity, тренируют corrrect severity declaration в условиях с подсказкой («это SEV1 потому что …»).

## Открытые вопросы

- **Continuous Chaos vs GameDay** — тактическое разделение: scheduled monthly GameDay (low-cost / high-engagement / good for muscle memory) vs continuous chaos в pipeline (high-confidence / catches regressions). Возможно отдельный лист на детализацию, или достаточно callout'а.
- **Disaster Recovery Testing** *(TBD)* — DR drills (regional failover, DB failure, full data center loss) — большие chaos experiments верхнего уровня, но со своим scope и cadence. Возможно отдельный лист.
- **Security Chaos Engineering** *(TBD)* — validation security controls через эксперименты (Shortridge / Rinehart). Сосед под Information Security L1 (а не Reliability Engineering), потому что главный объект — security controls, не reliability.
- **Failure Modes Catalog** *(TBD)* — систематический каталог known failure modes для сервиса / системы как корень chaos scenarios. Возможно подсекция в Service Ownership или отдельный лист.
- **Chaos в regulated industries** — banking / healthcare / payments имеют ограничения (Federal Reserve guidance, FDA, PCI-DSS); chaos в production финансовых сервисов требует governance. Может стать частью этого листа при углублении или отдельный callout.
