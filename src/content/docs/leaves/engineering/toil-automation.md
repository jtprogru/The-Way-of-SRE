---
title: Toil Automation
description: Переход от tracking к elimination — паттерны автоматизации повторяющейся operational работы
sfia: [3, 4, 5, 6]
status: draft
---

Я писал [zbx2jira](https://github.com/jtprogru/zbx2jira) (Zabbix → Jira ServiceDesk integration) ровно потому, что устал смотреть, как оператор каждое утро руками создаёт 5–10 одинаковых тикетов из ночных алертов: открыть Zabbix, найти EventID, скопировать в новый Jira-issue, выставить severity, прицепить ссылку обратно. Тридцать секунд на тикет × 10 тикетов × 365 дней ≈ 30 часов в год на одного оператора. И это только видимая часть, невидимая сидит в переключениях контекста и в усталости. После того как [Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/) показал ranked list самого дорогого toil, следующий шаг — автоматизировать прицельно. Этот лист про *как*: иерархия уровней (alias → скрипт → CI job → controller / operator), паттерны интеграций (event-driven, scheduled diff, alert-to-ticket) и трезвое отношение к стоимости автоматизации, которую написать дёшево, а поддерживать дорого. Tracking без automation — data graveyard. Automation без tracking — ловкие одноразовые скрипты не там, где болит.

## Что должен уметь

Главный навык на уровне L4 — **выбор правильного уровня автоматизации для конкретной задачи**. Не каждый повторяющийся шаг достоин Kubernetes operator'а, и не каждый ежедневный workflow заканчивается на shell-alias. Уровень производный от частоты, blast radius, координации нескольких участников и стоимости поддержки. Я регулярно вижу две крайности: operator там, где хватило бы CronJob, и жизнь на скриптах в shell там, где давно нужен controller. Дороги обе, только по-разному.

**L3**
- Понимает иерархию автоматизации (alias / function / CLI utility / scheduled job / event-driven trigger / controller / operator); умеет выбрать минимально достаточный уровень для своего use case.
- Пишет идемпотентные скрипты — повторный запуск даёт тот же результат; явное error handling, exit codes, structured logging для обработки дальше по цепочке.

**L4**
- Реализует event-driven automation — alert → ticket / trigger → action / webhook → workflow; знает базовые анти-паттерны (silent retry без bounds, hidden state в скрипте, race condition между параллельными invocations).
- Различает автоматизацию-как-устранение и автоматизацию-как-перенос: «теперь скрипт каждое утро делает то же самое» — это перенос toil из инженера в cron, реального устранения нет.
- Интегрирует automation с tracking — каждое invocation логируется, метрики runtime / success rate / дрейф в дашборде; tracker оперативно показывает, что автоматизация перестала работать.

**L5**
- Проектирует automation strategy команды: матрица «частота × blast radius → уровень automation»; явный budget на поддержку (≈30% от стоимости разработки в год по моим наблюдениям).
- Внедряет paved roads / [golden paths](/The-Way-of-SRE/leaves/engineering/golden-paths/) — внутренний tooling, который снимает с команды повторяющиеся операционные запросы (provisioning, configuration, deployments) через self-service.
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

- **Уровень alias / function** — функции shell в `.bashrc` / `.zshrc`, [dotfiles](https://dotfiles.github.io/) в git. Самый дешёвый уровень toil reduction для personal use. См. [Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/).
- **Уровень CLI utility** — собственная Go / Python / Rust утилита для повторяющейся задачи. По моим наблюдениям, чаще всего этот уровень выбирают, когда задача переросла скрипт на shell, но ещё не дозрела до сервиса.
- **Уровень CI/CD automation** — [GitHub Actions](https://docs.github.com/en/actions) + composite actions (как [notiflow](https://github.com/jtprogru/notiflow) — заворачивает статус CI в уведомление в Telegram), GitLab CI, Buildkite. Workflow-driven automation как продолжение CI.
- **Уровень scheduled job** — Kubernetes CronJob, AWS EventBridge Scheduler, GitHub Actions schedule, классический cron. Для регулярных diff / cleanup / report.
- **Уровень event-driven** — Lambda / Cloud Functions (cloud), Argo Events / Knative Eventing (k8s), Tekton (pipeline event chains). Webhook → действие.
- **Уровень integration glue** — alert → ticket: классические интеграции типа [zbx2jira](https://github.com/jtprogru/zbx2jira) или industry-grade [PagerDuty Process Automation](https://www.pagerduty.com/platform/automation/), [Rundeck](https://www.rundeck.com/open-source), [StackStorm](https://stackstorm.com/). Сюда же — Netflix [Dispatch](https://github.com/Netflix/dispatch) (open-source orchestrator).
- **Уровень controller / operator** — [Kubernetes Operator SDK](https://sdk.operatorframework.io/), [kubebuilder](https://book.kubebuilder.io/), [Metacontroller](https://metacontroller.github.io/metacontroller/) (для простых controllers). По моим наблюдениям, в командах меньше 10 SRE operator чаще берётся готовый (для baseline нужд: postgres-operator, cert-manager, external-secrets) — собственный operator оправдан, когда нет готового и use case реально custom.
- **Configuration automation** — [Ansible](https://www.ansible.com/), [Salt](https://docs.saltproject.io/), [Chef](https://www.chef.io/products/chef-infra). Сюда же — мои [ansible-role-systemd-mounts](https://github.com/jtprogru/ansible-role-systemd-mounts) как пример reusable role, [ansible-role-yc_cli](https://github.com/jtprogru/ansible-role-yc_cli) для install Yandex Cloud CLI.
- **Template generators** — для повторяющихся текстовых артефактов (postmortem, runbook, RFC, SLO doc). Пример — [srekit](https://github.com/jtprogru/srekit), мой CLI-генератор SRE-артефактов. Каждый постмортем по одному и тому же шаблону руками — это toil; одна команда `srekit postmortem --title X --severity SEV1` — нет.

## Best practices

Конкретный кейс — **[zbx2jira](https://github.com/jtprogru/zbx2jira)**. Скрипт интегрирует Zabbix и Jira ServiceDesk: trigger переходит в `PROBLEM` → создаётся issue в Jira с EventID в customfield; переход в `OK` → issue закрывается. Что я понял за время поддержки этой штуки: написать automation — это 20% работы. Остальные 80% — держать её живой, пока внешние системы вокруг меняются. Поменялся Jira workflow — автоматизация падает. Прилетел minor update Zabbix API — ломаются транзишены. А если поддерживает её только тот, кто написал, и документации нет, то через год после его ухода никто не разберётся: починить нельзя, скрипт удаляют, операторы возвращаются к ручному созданию тикетов. Это классический failure mode таких проектов — не «не сработала технически», а «не пережила организационное время».

Дальше идут три правила, которые я считаю обязательными, и первое из них — eliminate before automate. Прежде чем писать автоматизацию, стоит спросить: можно ли убрать эту работу, поменяв систему или контракт? Плохой алерт лечится починкой SLI-based alerting, а не автоматическим acknowledge. Копипаста конфигов между окружениями — IaC, а не скриптом. Ручная ротация секретов — авторотацией через Vault, а не cron'ом. По моим наблюдениям, ≈30% задач, которые команды собираются автоматизировать, можно просто удалить, но это разговор о процессе, а не про «написать скрипт». Та же дисциплина в [Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/), здесь она разложена до конкретных альтернатив.

Второе — идемпотентность как контракт. Повторный запуск на тех же входах даёт тот же результат, частичный сбой лечится повторным запуском, скрытого состояния внутри скрипта нет, всё живёт во внешней системе. Без этого автоматизация разваливается на первом же повторе, и команда объявляет её нестабильной. После такого приговора её уже не чинят.

Третье — **budget на поддержку с первого дня**. ≈30% стоимости разработки в год уходит на bugfixes, миграции под обновления внешних API и новые edge cases. Без явного бюджета automation превращается в orphan tooling: ломается тихо, а через год её удаляют. Владелец у каждой автоматизации — конкретный человек, не «команда».

**Уровень автоматизации = частота × blast radius × число участников.** Эта mental model хорошо работает в моей практике. Shell-alias оправдан для частой личной задачи с нулевым blast radius («запустить kubectl с правильным контекстом»). CLI-утилита — для повторяющейся задачи, которая нужна пятерым и больше («[srekit postmortem --title X](https://github.com/jtprogru/srekit) вместо копирования шаблона»). Scheduled job — для регулярного diff, cleanup или отчёта с предсказуемой периодичностью. Event-driven — когда триггер снаружи и нужна реактивность: alert → ticket, push → deploy. Controller или operator — для stateful workload со сложным жизненным циклом вроде failover primary/replica или ротации сертификатов. Перескочить уровень вверх — over-engineering. Застрять на уровень ниже — operational debt в виде скрипта, который никто не понимает.

**Integration glue ≠ business logic в скрипте.** Я регулярно вижу анти-паттерн: integration script (Zabbix → Jira как [zbx2jira](https://github.com/jtprogru/zbx2jira)) превращается в monster с custom business logic — assignment rules, priority calculation, escalation после двух часов. Тогда либо логика дублирует то, что уже есть в Jira Workflow / Zabbix actions (drift между двумя источниками правды), либо integration становится мини-приложением со своими тестами / документацией / on-call. Граница тут чёткая. Связка переводит данные между системами — формат, namespace, ссылки — и оставляет решения источникам. Если бизнес-логика в ней растёт, это сигнал, что пора заводить полноценный сервис со своим жизненным циклом, а не тянуть связку дальше.

**Уведомления — первый шаг к ChatOps.** [notiflow](https://github.com/jtprogru/notiflow) — composite GitHub Action, который шлёт сообщение в Telegram по завершении workflow job. Случай простейший, но он снимает реальный toil: «зайти и проверить, прошёл ли CI». Отсюда начинается [ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/): сначала уведомления в чат, потом ответы бота на запросы, потом команды, которые из чата что-то делают. Путь от push к pull и дальше к действию — естественный.

**Operator pattern — мощный, но дорогой инструмент.** Operator (Kubernetes controller с custom CRD) даёт декларативный API для управления stateful workload. Мечта SRE: `kubectl apply -f postgres-cluster.yaml`, дальше provision, failover, backup, restore и upgrade он делает сам. Дальше начинается цена. Разработка operator'а — самостоятельный software project: Go, знание k8s API, controller-runtime patterns, тестирование против реальных кластеров. Поддержка — следить за deprecations в k8s API и держать совместимость с разными версиями. Готовые operators (postgres-operator от Zalando, [cert-manager](https://cert-manager.io/), [external-secrets-operator](https://external-secrets.io/)) покрывают 80% потребностей; собственный operator оправдан только когда use case реально custom (proprietary protocol, internal architecture, regulatory requirement).

## Связанные листья

- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — пара: tracking даёт ranked list самого дорогого toil; automation реализует elimination. Один без другого не работает.
- **[Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/)** — самый дешёвый уровень automation (alias / CLI / template generator), для personal или small-team frequent task.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — автоматизация через интерфейс чата; естественное продолжение уведомлений в сторону bot-driven ops.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — config-as-code снимает целый класс toil вокруг конфигураций; самая окупаемая автоматизация для большинства команд.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — Argo CD и Flux работают как controller; это уровень controller для toil вокруг деплоя.
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — pipeline как automation surface; интеграция notiflow-like custom actions в pipeline.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook automatable steps мигрируют в automation; «runbook говорит сделать X — пусть делает скрипт».
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — canary и auto-rollback — тот же уровень controller, только для выкладки.
- **[Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/)** — auto-remediation как форма automation; «alert → ticket → done» как противоположность «alert → ack → forget».

## Открытые вопросы

Auto-remediation *(TBD)* — отдельная подобласть: alert сразу переходит в автоматическую митигацию (restart, failover, scale-out) без человека в цикле. Здесь честный trade-off между более коротким MTTR и blast radius несанкционированного действия, и он тянет на отдельный лист под Reliability Engineering или Toil Reduction. Рядом лежит self-service infrastructure *(TBD)* — provisioning через UI, чат или API без обращения в платформенную команду; тема пересекается с GitOps и просится в L1 `Platform Engineering`, который вынесен отдельно от Toil Reduction, см. [Platform as a Product](/The-Way-of-SRE/leaves/engineering/platform-as-a-product/).

Чего у меня нет — ответа про маленькие команды. Правило 50% toil в SRE Book выведено для команд от 20 человек, а в команде до пяти SRE баланс времени между операциями, автоматизацией и проектами другой, и какой там разумный baseline покрытия автоматизацией, я не знаю. Если у вас такой опыт посчитан — присылайте PR.
