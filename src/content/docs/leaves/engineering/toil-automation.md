---
title: Toil Automation
description: Переход от tracking к elimination — паттерны автоматизации повторяющейся operational работы
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Toil Reduction / Toil Automation
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Я писал [zbx2jira](https://github.com/jtprogru/zbx2jira) (Zabbix → Jira ServiceDesk integration) ровно потому, что устал каждое утро видеть, как оператор руками создаёт 5–10 одинаковых тикетов из ночных алертов: открыть Zabbix, найти EventID, скопировать в новый Jira-issue, выставить severity, прицепить ссылку обратно. Тридцать секунд на тикет × 10 тикетов × 365 дней = ≈30 часов в год на одного оператора, и это только видимая часть — невидимая в context-switch'ах и в усталости. После того как [Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/) показал ranked list самого дорогого toil, следующий шаг — **автоматизация прицельно**. Этот лист — про *как*: иерархия уровней (alias → скрипт → CI job → controller / operator), паттерны интеграций (event-driven, scheduled diff, alert-to-ticket), и зрелое отношение к стоимости автоматизации (написать дёшево, поддерживать дорого). Tracking без automation = data graveyard; automation без tracking = clever одноразовые скрипты не там, где боль.

## Что должен уметь

Главный навык на уровне L4 — **выбор правильного уровня автоматизации для конкретной задачи**. Не каждый повторяющийся шаг достоин Kubernetes operator'а; не каждый ежедневный workflow заслуживает только shell-alias. Уровень автоматизации производный от частоты, blast radius, multi-actor coordination и cost of maintenance. Я регулярно вижу две крайности — команды пишут operator там, где хватило бы CronJob, или живут на shell-скриптах там, где уже нужен controller. Оба варианта дороги по-разному.

**L3**
- Понимает иерархию автоматизации (alias / function / CLI utility / scheduled job / event-driven trigger / controller / operator); умеет выбрать минимально достаточный уровень для своего use case.
- Пишет идемпотентные скрипты — повторный запуск даёт тот же результат; явное error handling, exit codes, structured logging для downstream-обработки.

**L4**
- Реализует event-driven automation — alert → ticket / trigger → action / webhook → workflow; знает базовые анти-паттерны (silent retry без bounds, hidden state в скрипте, race condition между параллельными invocations).
- Различает автоматизацию-как-устранение и автоматизацию-как-перенос: «теперь скрипт каждое утро делает то же самое» — это перенос toil из инженера в cron, реального устранения нет.
- Интегрирует automation с tracking — каждое invocation логируется, метрики runtime / success rate / дрейф в дашборде; tracker оперативно показывает, что автоматизация перестала работать.

**L5**
- Проектирует automation strategy команды: матрица «частота × blast radius → уровень automation»; явный budget на поддержку (≈30% от стоимости разработки в год по моим наблюдениям).
- Внедряет paved roads / golden paths — внутренний tooling, который снимает повторяющиеся ops-запросы с team (provisioning, configuration, deployments) через self-service.
- Использует operator pattern грамотно — Kubernetes operators для управления stateful workloads (DB, Kafka, certificates), не для всего. Cost: learning curve + custom CRD ownership + version churn от k8s API.

**L6+**
- Дизайнит strategy на уровне org: platform engineering как формализация paved roads, internal developer portal (Backstage / Port), build vs buy для каждого слоя toolchain.
- Принимает trade-off решения — централизованная platform team vs federated (каждая team пишет свой tooling), build vs adopt OSS, on-premise vs managed automation.

## Материалы

### Книги

- Vivek Rau (ред. Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/eliminating-toil/)** (O'Reilly, 2016), глава 5 «Eliminating Toil». Каноническое определение toil + правило «inflict pain to reduce future pain» (запоминать каждый случай, чтобы автоматизировать в следующий раз).
- David Challoner et al. — **[The Site Reliability Workbook](https://sre.google/workbook/eliminating-toil/)** (O'Reilly, 2018), глава 6. Practical taxonomy automation strategies + два детальных Google case studies (datacenter networks, software-defined infrastructure).
- Jeffrey Geerling — **[Ansible for DevOps](https://www.ansiblefordevops.com/)** (2nd ed., 2020). Несмотря на возраст — лучший практический guide идемпотентной автоматизации server config. Idempotency как mental model переносится на любую automation, не только Ansible.
- Joe Beda et al. — **[Programming Kubernetes](https://www.oreilly.com/library/view/programming-kubernetes/9781492047094/)** (O'Reilly, 2019). Operator pattern, controller loop, custom resources — техническая база для high-end automation.

### Статьи и фреймворки

- **[Operator Framework — Operator Capability Levels](https://operatorframework.io/operator-capabilities/)**. Иерархия зрелости operator'а (Level 1: basic install → Level 5: auto-pilot). Полезно как mental model даже если не пишете operator — те же levels применимы к любой automation.
- **[CNCF Platforms White Paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/)**. Свежий (2023) взгляд CNCF на platform engineering как формализацию automation; полезен для разговора с менеджментом про paved roads.

### Инструменты

- **Уровень alias / function** — shell-функции в `.bashrc` / `.zshrc`, [dotfiles](https://dotfiles.github.io/) в git. Самый дешёвый уровень toil reduction для personal use. См. [Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/).
- **Уровень CLI utility** — собственная Go / Python / Rust утилита для повторяющейся задачи. По моим наблюдениям, чаще всего этот уровень выбирают, когда задача переросла shell-скрипт, но ещё не дозрела до сервиса.
- **Уровень CI/CD automation** — [GitHub Actions](https://docs.github.com/en/actions) + composite actions (как [notiflow](https://github.com/jtprogru/notiflow) — wrap CI-status в Telegram-нотификацию), GitLab CI, Buildkite. Workflow-driven automation как продолжение CI.
- **Уровень scheduled job** — Kubernetes CronJob, AWS EventBridge Scheduler, GitHub Actions schedule, классический cron. Для регулярных diff / cleanup / report.
- **Уровень event-driven** — Lambda / Cloud Functions (cloud), Argo Events / Knative Eventing (k8s), Tekton (pipeline event chains). Webhook → действие.
- **Уровень integration glue** — alert → ticket: классические интеграции типа [zbx2jira](https://github.com/jtprogru/zbx2jira) или industry-grade [PagerDuty Process Automation](https://www.pagerduty.com/platform/process-automation/), [Rundeck](https://www.rundeck.com/open-source), [StackStorm](https://stackstorm.com/). Сюда же — Netflix [Dispatch](https://github.com/Netflix/dispatch) (open-source orchestrator).
- **Уровень controller / operator** — [Kubernetes Operator SDK](https://sdk.operatorframework.io/), [kubebuilder](https://book.kubebuilder.io/), [Metacontroller](https://metacontroller.github.io/metacontroller/) (для простых controllers). По моим наблюдениям, в командах меньше 10 SRE operator чаще берётся готовый (для baseline нужд: postgres-operator, cert-manager, external-secrets) — собственный operator оправдан, когда нет готового и use case реально custom.
- **Configuration automation** — [Ansible](https://www.ansible.com/), [Salt](https://docs.saltproject.io/), [Chef](https://www.chef.io/products/chef-infra). Сюда же — мои [ansible-role-systemd-mounts](https://github.com/jtprogru/ansible-role-systemd-mounts) как пример reusable role, [ansible-role-yc_cli](https://github.com/jtprogru/ansible-role-yc_cli) для install Yandex Cloud CLI.
- **Template generators** — для повторяющихся текстовых артефактов (postmortem, runbook, RFC, SLO doc). Пример — [srekit](https://github.com/jtprogru/srekit), мой CLI-генератор SRE-артефактов. Каждый постмортем по одному и тому же шаблону руками — это toil; одна команда `srekit postmortem --title X --severity SEV1` — нет.

## Best practices

Конкретный кейс — **[zbx2jira](https://github.com/jtprogru/zbx2jira)**. Скрипт интегрирует Zabbix и Jira ServiceDesk: trigger переходит в `PROBLEM` → создаётся issue в Jira с EventID в customfield; переход в `OK` → issue закрывается. Что я понял за время поддержки этой штуки: написать automation — это 20% работы, 80% — это **поддерживать её живой** при изменении внешних систем. Jira workflow поменялся → автоматизация падает. Zabbix API minor update → транзишены ломаются. Если automation поддерживается тем же инженером, кто её написал, и нет документации — через год после первой написавшего сотрудника никто не разберётся, починить нельзя, скрипт удаляют, операторы возвращаются к ручному созданию тикетов. Это классический failure mode automation projects — не «не сработала технически», а «не выдержала organizational time».

**Короткие правила:**

- **Eliminate before automate.** Перед написанием автоматизации вопрос: «можно ли вообще убрать эту работу, изменив систему или контракт?». Альтернативы автоматизации — устранить источник: bad alert → починить SLI-based alerting вместо автоматизации acknowledge; copy-paste configs между env'ами → IaC вместо script; manual rotation → auto-rotation через Vault вместо cron. По моим наблюдениям, ≈30% задач, которые команды собираются автоматизировать, можно вообще удалить — но это требует переосмысления процесса, а не «написать скрипт». См. [Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/) best practice «Eliminate before automate» — здесь та же дисциплина, расширенная до конкретных alternatives.
- **Идемпотентность как контракт автоматизации.** Повторный запуск тех же inputs даёт тот же результат; partial failure recoverable через повторный запуск; нет hidden state в самом скрипте (всё в external system). Без idempotency автоматизация ломается на первой же retry-петле и убивается команды как «нестабильная».
- **Budget на поддержку с первого дня.** ≈30% стоимости разработки в год — на bugfixes, миграции под обновления внешних API, расширение на новые edge cases. Без явного budget — automation становится orphan tooling, ломается тихо, через год её удаляют. Owner per automation = explicit ответственный (не «команда»).

Подробнее:

**Уровень автоматизации = частота × blast radius × multi-actor.** Это mental model, которая хорошо работает в моей практике. Shell-alias оправдан для personal frequent task с zero blast radius («запустить kubectl с правильным контекстом»). CLI-utility — для recurring task, которая нужна 5+ человекам в команде («[srekit postmortem --title X](https://github.com/jtprogru/srekit) вместо копирования шаблона»). Scheduled job — для regular diff / cleanup / report с predictable cadence. Event-driven — когда trigger external и нужна реактивность (alert → ticket, push → deploy). Controller / operator — для stateful workload с complex lifecycle (DB primary/replica failover, certificate rotation). Скакать через уровни вверх — over-engineering; пропустить уровень в обратную сторону — operational debt («скрипт, который никто не понимает»).

**Integration glue ≠ business logic в скрипте.** Я регулярно вижу анти-паттерн: integration script (Zabbix → Jira как [zbx2jira](https://github.com/jtprogru/zbx2jira)) превращается в monster с custom business logic — assignment rules, priority calculation, escalation после двух часов. Тогда либо логика дублирует то, что уже есть в Jira Workflow / Zabbix actions (drift между двумя источниками правды), либо integration становится мини-приложением со своими тестами / документацией / on-call. Граница чёткая: glue делает translation между системами (формат, namespace, references) и оставляет business decisions источникам. Если business logic растёт — это сигнал, что нужен полноценный сервис с собственным lifecycle, не glue-скрипт.

**Notification automation = первый шаг ChatOps.** [notiflow](https://github.com/jtprogru/notiflow) — composite GitHub Action, который шлёт Telegram-сообщение при завершении workflow job. Простейший случай — но устраняет реальный toil «зайти проверить, прошёл ли CI». Это вход в [ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/) — push-уведомления в chat. Дальше — bot-ответы на запросы, потом action-команды через chat. Эволюция от push к pull к action — естественная.

**Operator pattern — мощный, но дорогой инструмент.** Operator (Kubernetes controller с custom CRD) даёт declarative API для управления stateful workload — мечта SRE: `kubectl apply -f postgres-cluster.yaml`, остальное operator делает сам (provision, failover, backup, restore, upgrade). Cost: разработка operator — это самостоятельный software project с Go expertise, k8s API knowledge, controller-runtime patterns, тестированием против реальных кластеров; maintenance — следить за k8s API deprecations, поддерживать совместимость с разными версиями. Готовые operators (postgres-operator от Zalando, [cert-manager](https://cert-manager.io/), [external-secrets-operator](https://external-secrets.io/)) покрывают 80% потребностей; собственный operator оправдан только когда use case реально custom (proprietary protocol, internal architecture, regulatory requirement).

## Связанные листья

- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — пара: tracking даёт ranked list самого дорогого toil; automation реализует elimination. Один без другого не работает.
- **[Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/)** — самый дешёвый уровень automation (alias / CLI / template generator), для personal или small-team frequent task.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — automation через chat-интерфейс; естественное продолжение notification automation в сторону bot-driven ops.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — config-as-code устраняет class of config-toil; самая высокая ROI automation для большинства команд.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — controller pattern (Argo CD / Flux) — controller-уровень automation для deployment-toil.
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — pipeline как automation surface; интеграция notiflow-like custom actions в pipeline.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook automatable steps мигрируют в automation; «runbook говорит сделать X — пусть делает скрипт».
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — canary / auto-rollback — controller-уровень automation для deploy-toil.
- **[Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/)** — auto-remediation как форма automation; «alert → ticket → done» как противоположность «alert → ack → forget».

## Открытые вопросы

- **Auto-Remediation Patterns** *(TBD)* — отдельная подобласть: alert → automatic mitigation (restart, failover, scale-out) без human in the loop. Trade-off: faster MTTR vs blast radius unauthorized actions. Возможный отдельный лист под Reliability Engineering или Toil Reduction.
- **Platform Engineering / Internal Developer Portal** *(TBD)* — формализация paved roads через Backstage / Port / Cortex. Скорее всего отдельный L1 со своим набором листьев, не подкомпетенция Toil Reduction.
- **Self-Service Infrastructure** *(TBD)* — provisioning через UI / chat / API без ticket-to-platform-team. Пересекается с GitOps и platform engineering.
- Я не уверен, какой baseline coverage automation имеет смысл рекомендовать для команды до 5 SRE — у Google в SRE Book правило 50% toil выводится для команд от 20+, но для маленькой team распределение time/automation/projects другое. Если у вас в маленькой команде есть data-driven balance — был бы интересен опыт PR'ом.
