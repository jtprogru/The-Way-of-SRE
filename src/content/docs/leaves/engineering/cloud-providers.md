---
title: Cloud Providers
description: Облако как platform с собственным shared-responsibility, managed-сервисами и quota-моделью — что отдаётся провайдеру, что остаётся у команды
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** IT Infrastructure / Cloud Providers
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«У нас AWS, всё managed, провайдер за это отвечает» — позиция, которая ломается на первом региональном outage'е или превышении квоты в момент пиковой нагрузки. Облако — это не «дата-центр, который кто-то админит за тебя»: это **platform** со своей моделью shared responsibility, своими failure modes (region down, zone down, quota throttling, API rate limits) и своей quota-моделью, которая существует независимо от твоего capacity planning. Я регулярно вижу команды, которые знают «AWS / GCP / Yandex Cloud», но не знают **shared-responsibility-границу** для конкретного сервиса — где заканчивается uptime, который гарантирует провайдер, и где начинается зона ответственности команды. Этот лист — про эту границу: что облако делает за тебя, что — нет, и как строить надёжность в облачной среде с учётом обоих.

У меня есть несколько petproject'ов в Yandex Cloud-стеке: [`yccli`](https://github.com/jtprogru/yccli) — zsh-плагин с 60+ алиасами и 80+ функциями поверх `yc` CLI, покрывает iam / vpc / managed-k8s / lockbox / KMS / managed DB; [`yc-quotas-exporter`](https://github.com/jtprogru/yc-quotas-exporter) — Prometheus-экспортер квот Yandex Cloud (типичная operational задача в облаке: квота — это не «справочная информация», это hard limit); [`evo-tf-argocd`](https://github.com/jtprogru/evo-tf-argocd) — demo инфра под Cloud.ru Evolution Managed Kubernetes. Лист написан с упором на yc-стек, но концепты (shared responsibility, managed vs self-hosted, quota-as-SLI, multi-region) переносятся на любого hyperscaler'а.

Граница: [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/) — про *как провижить* облачные ресурсы (Terraform / Pulumi); этот лист — про *как они устроены и как ломаются*. [Containerization & Orchestration](/The-Way-of-SRE/leaves/engineering/container-orchestration/) — про k8s как abstraction; этот лист — про managed-k8s как сервис провайдера. [Financial Management](/The-Way-of-SRE/leaves/engineering/cost-management/) — про экономику облака; этот лист — про техническую сторону тех же сервисов.

## Что должен уметь

Главный навык на уровне L4 — **читать shared-responsibility матрицу** провайдера для каждого сервиса, который команда использует. У AWS, GCP, Azure, Yandex Cloud — у всех есть публичная документация о том, кто отвечает за уровень. Managed Kubernetes: провайдер гарантирует uptime control plane, ты — worker nodes, addons, workload'ы. Managed Postgres: провайдер — backup retention, patching, failover; ты — query performance, connection pool, application-level integrity. Объектное хранилище: провайдер — durability (11 девяток), ты — bucket policy, encryption at rest, lifecycle. Эта матрица меняет capacity planning, incident response, runbook структуру. Я регулярно вижу команды, для которых «облако = надёжно», и они узнают границу через инцидент.

- **L3** — Понимает базовые primitives облака: compute (VM, container instance, lambda/function), storage (block / object / file), networking (VPC, subnet, security group, load balancer), IAM (service accounts, roles, policies). Знает, что у каждого провайдера — свои названия для одних и тех же концептов.
- **L3** — Использует CLI провайдера для базовых операций: `aws` / `gcloud` / `az` / `yc`. На petproject [`yccli`](https://github.com/jtprogru/yccli) — пример обвязки `yc` алиасами для частых операций.
- **L4** — Различает managed vs self-hosted сервисы. Знает, какие части операций уходят к провайдеру (control plane, patching, backup), какие остаются (configuration, workload-level monitoring, capacity).
- **L4** — Понимает quota-модель: квота — это hard limit, а не «справочная информация». На petproject [`yc-quotas-exporter`](https://github.com/jtprogru/yc-quotas-exporter) — типичная operational задача: вытаскивать квоты как Prometheus-метрику и алертить на «осталось <20%».
- **L4** — Различает региональную / zonal архитектуру: что такое AZ, как сервисы себя ведут при zone down, что значит «multi-AZ» для managed-сервисов конкретного провайдера. Знает, что разные сервисы у одного провайдера имеют разные failure isolation модели.
- **L4** — Работает с IAM осознанно: principle of least privilege, service accounts вместо длинноживущих ключей, audit log включён по умолчанию. Не использует root account / owner role для рутины.
- **L5** — Дизайнит multi-AZ архитектуру: load balancer + minimum 2 AZ, managed services с автоматическим failover, состояние без single AZ. Различает, какие сервисы провайдера действительно multi-AZ, а какие zonal с replication поверх.
- **L5** — Проектирует DR-стратегию для cloud-environment: cross-region backup'ы (managed DBs, object storage), runbook на «полный regional outage», RPO/RTO с учётом ограничений конкретного провайдера. См. [DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/).
- **L5** — Понимает биллинговую модель: что списывается посекундно, что почасово, что фиксировано в месяц; egress traffic как hidden cost; reserved/spot/preemptible как trade-off (см. [Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)).
- **L5** — Различает control plane vs data plane инциденты провайдера. Control plane down (API не отвечает) часто не убивает existing workloads, но блокирует deploy / scale. Data plane down кладёт сервисы. Знает, что мониторить разное.
- **L6+** — Оценивает trade-off single-provider vs multi-cloud для конкретной системы. Готов аргументировать, что multi-cloud для большинства команд — это «увеличение operational complexity без снижения провайдер-рисков»; знает, в каких сценариях оправдано иначе.
- **L6+** — Ведёт диалог с провайдером: enterprise support tickets, escalation для региональных инцидентов, RCA от провайдера при postmortem. Различает «провайдер не отвечает» (open ticket) и «мы делаем плохо» (внутренний root cause).

## Материалы

### Книги

- Mike Julian — **[Practical Cloud Security](https://www.oreilly.com/library/view/practical-cloud-security/9781492037504/)** (O'Reilly, 2-е изд., 2023). Cloud security как самостоятельная дисциплина: IAM, network isolation, encryption, audit. Полезно для понимания, что «облако» добавляет/убирает в security model.
- Sam Newman — **[Building Microservices](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)** (O'Reilly, 2-е изд., 2021). Не cloud-specific, но главы про распределённые системы с фокусом на failure modes — фундамент для cloud-архитектуры.
- AWS / Google / Microsoft — Well-Architected Frameworks (см. ниже). Не книги в строгом смысле, но самые подробные публичные руководства.

### Статьи и доклады

- AWS — **[AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)**. Шесть «pillars» (operational excellence, security, reliability, performance, cost, sustainability). Чтение по диагонали — несколько часов; ROI высокий даже для не-AWS команд, потому что концепты переносимые.
- Google Cloud — **[Site Reliability Engineering](https://sre.google/books/)** (полные SRE Book + Workbook). Глава Workbook'а про «Reliability in Cloud» — best material про то, как SRE-практики работают в cloud-context.
- Microsoft — **[Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/)**. Каталог reference architectures; ищется по pattern'у, а не по сервису.
- Yandex Cloud — **[Архитектурные практики](https://yandex.cloud/ru/docs/overview/concepts/architecture-practices)**. Аналог Well-Architected для Yandex-стека. Меньше материала, чем у hyperscaler'ов, но русскоязычный и cloud-specific.
- **[AWS S3 outage 2017-02-28 postmortem](https://aws.amazon.com/message/41926/)** — публичный case study cloud-инцидента — см. ниже.
- Cindy Sridharan — **[Cloud Native Reliability](https://copyconstruct.medium.com/)** (серия постов). Критический взгляд на «cloud-native по умолчанию надёжно».

### Инструменты

- **CLI провайдера** — `aws`, `gcloud`, `az`, `yc`. По моим наблюдениям, разница между cloud-беглым SRE и не — это привычка делать operations через CLI / API, а не Web UI. Web UI хорош для exploration; для repeatable operations — CLI / IaC.
- **[`yccli`](https://github.com/jtprogru/yccli)** — zsh-плагин с алиасами для `yc`. Покрывает iam, vpc, compute, managed-k8s, lockbox, KMS, managed DBs. Использую сам как примеры того, как сократить «cognitive overhead» от длинных CLI-команд.
- **[`yc-quotas-exporter`](https://github.com/jtprogru/yc-quotas-exporter)** — Prometheus-экспортер квот Yandex Cloud. Образец паттерна «quota-as-SLI»: тащим квоты как метрику, алертим на пороге.
- **[Terraform](https://www.terraform.io/)** / **[Pulumi](https://www.pulumi.com/)** — primary tool для cloud IaC. Подробнее — в [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/).
- **[CloudFormation](https://aws.amazon.com/cloudformation/)** (AWS) / **[Deployment Manager](https://cloud.google.com/deployment-manager)** (GCP) — нативные IaC от провайдеров. По моим наблюдениям, чаще выбирают Terraform — потому что мультиоблачный и community-богатый, нативные tools — когда нужны provider-specific фичи.
- **[CloudTrail](https://aws.amazon.com/cloudtrail/)** / **[Cloud Audit Logs](https://cloud.google.com/audit-logs)** / **[Yandex Cloud Audit Trails](https://yandex.cloud/en/services/audit-trails)** — audit log API-вызовов. Включать по умолчанию для всех окружений; в инциденте «кто что сделал» — primary source of truth.
- **[Steampipe](https://steampipe.io/)** / **[CloudQuery](https://www.cloudquery.io/)** — SQL поверх cloud API. Useful для inventory, compliance queries, ad-hoc audit.

## Best practices

Главный публичный кейс облачного инцидента — **AWS S3 outage 2017-02-28**. Инженер запустил debug-команду с опечаткой в параметре, которая удалила больше серверов из subsystem index'а, чем планировалось. Перезапуск index subsystem занял часы; в это время лёг весь S3 в US-East-1 — а с ним половина интернета, потому что S3 в этом регионе был зависимостью для AWS Console, dashboards многих SaaS, image CDN. Postmortem публичен и подробно разобран. Я регулярно ссылаюсь на этот case как иллюстрацию двух уроков: (1) **облако ломается** — даже AWS, даже S3, даже primary region; (2) **региональные зависимости — это hidden coupling**: команды, которые думали, что у них «multi-region», узнали, что их frontend всё ещё резолвит CDN через US-East-1. Healthy approach — explicit inventory зависимостей от провайдера на уровне регионов и сервисов, не «всё managed, всё надёжно».

**Короткие правила:**

- **Квота — это hard limit, не справочная информация.** Я регулярно вижу инциденты «сервис не масштабируется в пиковую нагрузку» из-за упёртой квоты на VM count, public IP, VPC peering — а заявка на повышение от провайдера приходит через 24–48 часов. Мониторинг квот как метрика + алерт на «осталось <20%» — обязательный baseline. На petproject [`yc-quotas-exporter`](https://github.com/jtprogru/yc-quotas-exporter) я делал это для Yandex Cloud; для AWS/GCP — Service Quotas API + кастомный exporter или готовые решения вроде prometheus-aws-quota-exporter.
- **IAM least privilege — это не «сделаем после MVP».** Service account с `roles/owner` для удобства — типичный source утечек («test ключ попал в git»). Каждая роль — explicit list permissions, отдельные SA для разных компонентов. Это disciplined upfront, дорого ретроспективно.
- **Audit log включён по умолчанию для всех окружений.** Provider audit log (CloudTrail / Cloud Audit Logs / Yandex Audit Trails) — primary source для «кто что сделал когда». Включается одной командой, стоит копейки относительно value. Я регулярно вижу команды, для которых post-incident вопрос «кто удалил bucket» — это «никто не знает», потому что audit включается **после** инцидента, а не до.

Подробнее:

**Multi-AZ ≠ multi-region, и эти два решают разные задачи.** Multi-AZ защищает от зональных отказов (один data center внутри региона); это relatively cheap и часто включается дефолтом для managed-сервисов. Multi-region защищает от регионального отказа (как S3 us-east-1 2017); это значительно дороже и operationally сложнее (data replication latency, conflict resolution, DNS failover). По моим наблюдениям, multi-AZ для production — стандартный baseline; multi-region — осознанное решение под конкретные RTO/RPO требования. Команды, которые ставят «multi-region на всякий случай», часто получают complexity без benefit'а, потому что DR-runbook никогда не тестируется.

**Managed services — это convenience с tax'ом.** Managed Postgres экономит часы на patching и backup, но добавляет vendor lock-in, ограничение версий, иногда отсутствие feature'ов (например, некоторые extensions). Healthy approach — explicit cost/benefit на каждый managed сервис, не «всё managed по умолчанию». Для core-data сервисов lock-in особенно болезнен — миграция БД между провайдерами занимает месяцы. Я регулярно вижу команды, для которых выбор «managed Postgres vs self-hosted на VM» — это not decision, а default («ну конечно managed»). Иногда оправдано, иногда нет.

**Region down — это не «провайдер виноват», это реальность.** Каждый hyperscaler имеет публичную историю региональных отказов: AWS us-east-1 (несколько раз), GCP us-central1 (2019, 2022), Azure (множество). Регион — это не атомарная единица; внутри него связанные services (IAM, control plane, networking) могут падать каскадом. Healthy позиция — **каждый critical workload имеет explicit plan на regional outage**, даже если этот план «принимаем downtime до 4 часов, потому что multi-region нам не оправдан по cost». Plan с осознанным trade-off лучше, чем «надеемся, что не случится».

**Provider CLI / API — primary surface, Web UI — secondary.** «Сделаем через консоль, это же один раз» — частая фраза, после которой через год никто не помнит, что и зачем настроено. Любая non-trivial operation должна оставлять след: либо в IaC (Terraform commit), либо в скрипте (commit-able CLI команда), либо в audit log (если ad-hoc). Web UI — для exploration и read-only debugging. Я держу [`yccli`](https://github.com/jtprogru/yccli) именно для того, чтобы CLI-операции были как можно более ergonomic — если CLI комфортнее, чем кликать в UI, выбор делается сам.

## Связанные листья

- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — Terraform / Pulumi — primary способ управления cloud-ресурсами; CLI/UI — для exploration, не для repeatable ops.
- **[Containerization & Orchestration](/The-Way-of-SRE/leaves/engineering/container-orchestration/)** — managed Kubernetes (EKS / GKE / AKS / Yandex Managed Kubernetes) — частный случай managed-сервиса со своей shared-responsibility границей.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — VPC / subnet / load balancer / VPC peering — cloud-специфичные network primitives; в каждом провайдере свои абстракции.
- **[Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)** — биллинговая модель провайдера — fundamental input в FinOps lifecycle.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — квоты провайдера — отдельная axis capacity planning; quota-as-SLI — паттерн оттуда.
- **[Backup & Restore](/The-Way-of-SRE/leaves/engineering/backup-restore/)** — managed backup провайдера ≠ ваш runbook; tested restore — обязательно.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/)** — multi-region / cross-region DR — стратегическое решение, не техническое.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — provider-native KMS / Secrets Manager — обычно правильный выбор vs self-hosted.

## Открытые вопросы

- **Yandex Cloud как primary стек** для русскоязычных команд — личный опыт у меня преимущественно тут, поэтому примеры yc-стека. Концепты переносимы, но конкретика (имена сервисов, лимиты, behavior) — provider-specific. Если у вас опыт в AWS/GCP/Azure и вы готовы расширить лист — PR приветствуется.
- **Multi-cloud для compliance** (некоторые regulators требуют отсутствие single-vendor dependency) — отдельный класс задач, я туда не заходил. Если у вас есть production multi-cloud по compliance-причинам — расскажите через PR.
- **Cloud-native vs cloud-agnostic** — спектр от «использовать только Kubernetes + Postgres, чтобы можно было съехать» до «использовать managed-DynamoDB / S3 / Lambda везде, где можно». Я не уверен, где правильная точка для большинства команд; в моих проектах баланс был ближе к cloud-native (брать managed-сервисы там, где tax'ы оправданы).
