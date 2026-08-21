---
title: Infrastructure as Code
description: Инфраструктура production как версионируемый код в git — PR → review → plan → apply
sfia: [3, 4, 5, 6]
status: draft
---

Каждый раз, когда команда говорит «у нас [IaC](/The-Way-of-SRE/glossary/#iac)», мой первый вопрос звучит одинаково: click-ops в проде есть? Ответ «иногда, в срочных случаях» означает, что IaC нет, а есть его театр. Инфраструктура production (ресурсы облака, k8s манифесты, IAM, network policies, ссылки на секреты) описана как **версионируемый код** в git и применяется декларативно через автоматизированный pipeline. PR → review → plan → apply, и никакой «срочно правлю через console облака». Главная практика внутри L1 `Configuration Management`; соседи (GitOps, Policy as Code, Secrets Management) — в открытых вопросах.

## Что должен уметь

Главный навык на уровне L5 — управление **state**. Я регулярно вижу инциденты, начинающиеся с corrupted state file: два параллельных `terraform apply` без locking, локальный state в git, потерянный backend config. Remote state с locking — это не «удобно», это пре-условие безопасной работы с IaC. Если в вашей команде state в локальном файле — это не «пока работает», это таймер до инцидента.

**L3**
- Понимает разницу declarative vs imperative IaC; читает чужой Terraform / Helm / Kustomize код и понимает, какой ресурс создаётся.
- Применяет изменения через CI pipeline (`terraform plan` → review → `apply`); не редактирует state руками, не делает изменений через cloud UI «по-быстрому».

**L4**
- Пишет module / chart для нового ресурса или сервиса: переменные, outputs, README с примером использования, semantic versioning.
- Управляет remote state: backend config (S3 + DynamoDB, GCS + Cloud Storage, Terraform Cloud), state locking, разделение state по environment.
- Использует Helm charts / Kustomize для k8s манифестов; понимает разницу (Helm = template + values, Kustomize = patches без шаблонов) и когда какой.

**L5**
- Проектирует структуру IaC repo: per-env directory vs workspace, DRY через модули, секреты через Vault / Secrets Manager / Sealed Secrets с reference в коде.
- Внедряет drift detection (regular `terraform plan` на main, alerts на изменения вне pipeline); рассматривает click-ops в проде как операционный инцидент.
- Реализует policy-as-code (OPA / Conftest / Sentinel) в pipeline: compliance / security checks (S3 bucket без public access, IAM role без `*:*` permissions) автоматически блокируют PR.

**L6+**
- Дизайнит IaC strategy для org: выбор tooling, структура repos (mono vs multi), workflow (CI-based vs GitOps), интеграция со service catalog.
- Балансирует blast radius изменений в коде инфраструктуры: критические (IAM, network policies, DNS, prod DB) — больше gate и явный review перед apply; рутинные — auto-merge при зелёных проверках.

## Материалы

### Книги

- Yevgeniy Brikman — **Terraform: Up & Running**, 3-е изд. (O'Reilly, 2022). Практический гид по Terraform для production: modules, state, testing, CI/CD.
- Kief Morris — **Infrastructure as Code: Dynamic Systems for the Cloud Age**, 2-е изд. (O'Reilly, 2020). Tool-agnostic принципы (declarative, idempotent, versioned, tested); применимо к Terraform / Pulumi / Crossplane.

### Статьи и фреймворки

- Adam Wiggins — **[The Twelve-Factor App](https://12factor.net/)**, фактор III «Config». Принцип хранения конфигурации в environment vs кодовой базе; пересекается с IaC через handling environment variables и secrets.

### Инструменты

- **[Terraform](https://www.terraform.io/)** / **[OpenTofu](https://opentofu.org/)** — cloud-agnostic IaC, declarative HCL. По моим наблюдениям, OpenTofu активно набирает обороты после изменения лицензии HashiCorp в 2023 — Linux Foundation fork с активным community.
- **[Pulumi](https://www.pulumi.com/)** — IaC через мейнстрим языки (TypeScript / Python / Go / C# / Java); альтернатива HCL для команд, у которых уже есть software engineering practices.
- **[Helm](https://helm.sh/)** — package manager для Kubernetes; chart = template + values; стандарт для распространяемого софта.
- **[Kustomize](https://kustomize.io/)** — template-free customization через patches; встроен в `kubectl apply -k`. Альтернатива Helm для команд, не любящих шаблоны.
- **[Crossplane](https://www.crossplane.io/)** — расширение Kubernetes для управления non-k8s ресурсами через k8s API; единый control plane для приложений и инфраструктуры.
- **Policy-as-code** — **OPA / Conftest** (Open Policy Agent), **Sentinel** (HashiCorp); проверка compliance / security в pipeline до apply.
- **State backends** — Terraform Cloud, Spacelift, Atlantis (open-source pull-request automation); централизованное управление state без ручной работы с backend config.

## Best practices

Click-ops в проде не бывает «один разочек». Это всегда система. «Быстро поправлю в консоли облака, потом запишу в код» — фраза, после которой через месяц никто не помнит, что именно менялось, drift растёт, а следующий `terraform apply` бодро «чинит» сделанное руками и роняет сервис. Поэтому у меня правка через консоль в проде — операционный инцидент с постмортемом, а не срочный фикс.

Plan идёт перед apply всегда. Читает его не только автор PR. Plan показывает точный diff: что создастся, что обновится на месте, что пересоздастся, а что будет уничтожено. Apply без прочитанного плана — гадание с правами root в проде. Разница между «мы посмотрели diff» и «мы посмотрели, что CI зелёный» — это разница между изменением и лотереей.

State — удалённый и с блокировкой, локального state не бывает в принципе. Два параллельных apply дают повреждённый файл, потерянные из учёта ресурсы и несколько часов ручного восстановления в самый неудачный момент. Backend вроде S3 с DynamoDB, GCS со штатной блокировкой или Terraform Cloud закрывает сразу две дыры: блокировку и общую видимость того, кто именно сейчас катит изменение. Локальный state этого не даёт никогда.

Один environment — один state, без сцепок между окружениями. Когда dev, staging и prod живут в общем файле, случайный эксперимент в dev делает plan в prod ненулевым, и рано или поздно кто-нибудь нажмёт apply не глядя. Разделение по окружениям физически ограничивает blast radius. Дисциплина простая, но её постоянно откладывают до «вырастем — разделим», а к тому моменту разделение стоит в разы дороже.

Секретов в коде нет ни в открытом, ни в зашифрованном виде. Vault, AWS Secrets Manager, GCP Secret Manager, Sealed Secrets для k8s — в коде остаются только ссылки. Зашифрованный секрет в git — это «расшифруется, когда утечёт ключ». А ключ утечёт не в удобный день, и в этот момент разбираться придётся уже не с одним секретом, а со всей историей коммитов, где он лежал. Шифрование репозитория на диске работает как страховка, а не как защита, и от утечки самого секрета оно не спасает.

Инфраструктурный код тестируется до prod, а не проверяется им. «Тест-стенд у нас prod» стоит дорого ровно один раз. На первой ошибке в IAM или network policy. Модульные проверки (`terraform test`, terratest, kuttl для k8s), интеграционные прогоны в staging, проверка plan в PR и policy checks в pipeline вместе занимают минуты. Стоимость непроверенной звёздочки в IAM измеряется инцидентом.

## Связанные листья

- **[GitOps](/The-Way-of-SRE/engineering/gitops/)** — push-based CI-applying vs pull-based reconciliation. Соседняя практика внутри `Configuration Management` L1.
- **[Service Ownership](/The-Way-of-SRE/culture/service-ownership/)** — owner сервиса = owner IaC repo / module этого сервиса; catalog связывает service ↔ IaC location.
- **[Progressive Delivery](/The-Way-of-SRE/practices/progressive-delivery/)** — IaC изменения сами требуют progressive rollout (особенно для k8s deployments, network policies, IAM).
- **[Runbooks](/The-Way-of-SRE/culture/runbooks/)** — runbook'и для типичных инцидентов с инфраструктурным кодом (state corruption / drift recovery / manual revert) — обязательный набор.
- **[Programming Languages](/The-Way-of-SRE/engineering/programming-languages/)** — Pulumi через мейнстрим языки делает IaC частью обычного software engineering.
- **[Networking](/The-Way-of-SRE/engineering/networking/)** — network policies, ingress, load balancer config — частая часть IaC.
- **[Cloud Providers](/The-Way-of-SRE/engineering/cloud-providers/)** — ресурсы облака (VPC, IAM, managed-сервисы) — главный target IaC; shared-responsibility модель провайдера определяет, что вообще можно описать кодом.
- **[Containerization & Orchestration](/The-Way-of-SRE/engineering/container-orchestration/)** — k8s-кластер провижится через IaC; манифесты приложений — следующий декларативный слой того же подхода.

## Открытые вопросы

- **Policy as Code** *(TBD)* — OPA / Conftest / Sentinel — самостоятельная практика на стыке `Configuration Management` и `Information Security`.
- **Secrets Management** *(TBD)* — Vault / Secrets Manager / Sealed Secrets — отдельная подтема на стыке с `Information Security`.
- **Multi-cloud / hybrid IaC strategy** — отдельная тема (когда multi-cloud оправдан, vendor lock-in vs operational simplicity).

Отдельно висит выбор между Terraform и OpenTofu для команды, которая стартует сейчас. У меня нет уверенного ответа. OpenTofu обещает путь, который ведёт сообщество, но консенсуса по долгосрочной стратегии я пока не вижу, а команды вокруг делятся примерно поровну: одни выжидают, другие уже переехали.
