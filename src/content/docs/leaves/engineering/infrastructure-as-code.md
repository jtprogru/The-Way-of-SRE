---
title: Infrastructure as Code
description: Production-инфраструктура как версионируемый код в git — PR → review → plan → apply
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Configuration Management / Infrastructure as Code
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Каждый раз, когда команда говорит «у нас [IaC](/The-Way-of-SRE/glossary/#iac)» — мой первый вопрос: «click-ops в проде у вас есть?». Если ответ «иногда, в срочных случаях» — IaC у вас нет, у вас IaC-театр. Production-инфраструктура (cloud resources, k8s манифесты, IAM, network policies, secrets references) описана как **версионируемый код** в git и применяется декларативно через автоматизированный pipeline. PR → review → plan → apply, и никакой «срочно правлю через console облака». Главная практика внутри L1 `Configuration Management`; соседи (GitOps, Policy as Code, Secrets Management) — в открытых вопросах.

## Что должен уметь

Главный навык на уровне L5 — управление **state**. Я регулярно вижу инциденты, начинающиеся с corrupted state file: два параллельных `terraform apply` без locking, локальный state в git, потерянный backend config. Remote state с locking — это не «удобно», это пре-условие безопасной работы с IaC. Если в вашей команде state в локальном файле — это не «пока работает», это таймер до инцидента.

- **L3** — Понимает разницу declarative vs imperative IaC; читает чужой Terraform / Helm / Kustomize код и понимает, какой ресурс создаётся.
- **L3** — Применяет изменения через CI pipeline (`terraform plan` → review → `apply`); не редактирует state руками, не делает изменений через cloud UI «по-быстрому».
- **L4** — Пишет module / chart для нового ресурса или сервиса: переменные, outputs, README с примером использования, semantic versioning.
- **L4** — Управляет remote state: backend config (S3 + DynamoDB, GCS + Cloud Storage, Terraform Cloud), state locking, разделение state по environment.
- **L4** — Использует Helm charts / Kustomize для k8s манифестов; понимает разницу (Helm = template + values, Kustomize = patches без шаблонов) и когда какой.
- **L5** — Проектирует структуру IaC repo: per-env directory vs workspace, DRY через модули, секреты через Vault / Secrets Manager / Sealed Secrets с reference в коде.
- **L5** — Внедряет drift detection (regular `terraform plan` на main, alerts на изменения вне pipeline); рассматривает click-ops в проде как операционный инцидент.
- **L5** — Реализует policy-as-code (OPA / Conftest / Sentinel) в pipeline: compliance / security checks (S3 bucket без public access, IAM role без `*:*` permissions) автоматически блокируют PR.
- **L6+** — Дизайнит IaC strategy для org: выбор tooling, структура repos (mono vs multi), workflow (CI-based vs GitOps), интеграция со service catalog.
- **L6+** — Балансирует blast radius IaC-изменений: критические (IAM, network policies, DNS, prod DB) — больше gate и явный pre-apply review; routine — auto-merge при passing checks.

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

**Короткие правила:**

- **Никаких click-ops в проде, ни разу, никем.** «Быстро поправлю в console облака, потом запишу в код» — через месяц никто не помнит, что менялось; drift растёт; следующий `terraform apply` пытается «починить» руками сделанное и роняет сервис. Click-ops в проде = операционный инцидент с постмортемом, не «срочный фикс».
- **Plan перед apply, всегда; review plan — обязательная часть PR.** Plan показывает точный diff (create / update-in-place / replace / destroy); apply без review плана — гадание с правами root в проде.
- **Remote state с locking, никогда локальный state.** Два параллельных apply → corruption, потеря ресурсов из state, ручное восстановление часами. Backend (S3 + DynamoDB / GCS + native locking / Terraform Cloud) даёт locking и shared visibility.

Подробнее:

**Один environment — один state, без cross-env coupling.** Единый state на dev / staging / prod — случайное изменение или test в dev делает plan в prod ненулевым, и кто-то нажмёт apply. Разделение state по environment физически изолирует blast radius. Это базовая дисциплина, которая часто откладывается «потом разделим, когда вырастем» — а потом разделить становится в разы дороже.

**Secrets никогда в коде, ни в виде, ни в зашифрованном виде в plain repo.** Vault / AWS Secrets Manager / GCP Secret Manager / Sealed Secrets (k8s); в коде — только references. Даже зашифрованный secret в git — это «расшифруется, когда ключ утечёт». Encryption-at-rest для git как backup-механизм, не как primary defense.

**IaC тестируется, не «применили в prod — увидели».** «Тест-стенд = prod» — антипаттерн, который дорого стоит при первой ошибке в IAM или network policy. Unit-tests на module level (`terraform test`, terratest, kuttl для k8s), integration-tests в staging-environment, plan-проверка в PR, policy-checks в pipeline. Стоимость теста IaC ничтожна по сравнению со стоимостью инцидента из-за непроверенного `*` в IAM.

## Связанные листья

- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — push-based CI-applying vs pull-based reconciliation. Соседняя практика внутри `Configuration Management` L1.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса = owner IaC repo / module этого сервиса; catalog связывает service ↔ IaC location.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — IaC изменения сами требуют progressive rollout (особенно для k8s deployments, network policies, IAM).
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и для типичных IaC-инцидентов (state corruption / drift recovery / manual revert) — обязательный набор.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — Pulumi через мейнстрим языки делает IaC частью обычного software engineering.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — network policies, ingress, load balancer config — частая часть IaC.
- **[Cloud Providers](/The-Way-of-SRE/leaves/engineering/cloud-providers/)** — cloud-ресурсы (VPC, IAM, managed-сервисы) — главный target IaC; shared-responsibility модель провайдера определяет, что вообще можно описать кодом.
- **[Containerization & Orchestration](/The-Way-of-SRE/leaves/engineering/container-orchestration/)** — k8s-кластер провижится через IaC; манифесты приложений — следующий декларативный слой того же подхода.

## Открытые вопросы

- **Policy as Code** *(TBD)* — OPA / Conftest / Sentinel — самостоятельная практика на стыке `Configuration Management` и `Information Security`.
- **Secrets Management** *(TBD)* — Vault / Secrets Manager / Sealed Secrets — отдельная подтема на стыке с `Information Security`.
- **Multi-cloud / hybrid IaC strategy** — отдельная тема (когда multi-cloud оправдан, vendor lock-in vs operational simplicity).
- Я не уверен в правильности выбора Terraform vs OpenTofu для команды на 2026. OpenTofu обещает community-driven путь, но по поводу долгосрочной стратегии консенсуса пока не вижу. Команды, которые я наблюдаю, делятся примерно поровну — wait-and-see vs migrated.
