---
title: Infrastructure as Code
description: Production-инфраструктура как версионируемый код — cloud resources, k8s манифесты, IAM, network как PR → review → apply, без click-ops
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Configuration Management / Infrastructure as Code
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Production-инфраструктура (cloud resources, k8s манифесты, network policies, IAM, secrets references) описана как **версионируемый код** в git и применяется декларативно через автоматизированный pipeline. Замена «click-ops в UI облака → нет audit trail → дрейф конфигурации → инцидент» на «PR → review → plan → apply → drift detection». Главная практика внутри L1 `Configuration Management`; соседние практики (GitOps, Policy as Code, Secrets Management) — в «Открытых вопросах».

## Что должен уметь

- **L3** — Понимает разницу declarative vs imperative IaC; читает чужой Terraform / Helm / Kustomize код и понимает, какой ресурс создаётся.
- **L3** — Применяет изменения через CI pipeline (`terraform plan` → review → `apply`); не редактирует state руками, не делает изменений через cloud UI «по-быстрому».
- **L4** — Пишет module / chart для нового ресурса или сервиса: переменные, outputs, README с примером использования, версионирование (semantic versioning).
- **L4** — Управляет remote state: backend config (S3 + DynamoDB, GCS + Cloud Storage, Terraform Cloud), state locking, разделение state по environment / по compose-блокам.
- **L4** — Использует Helm charts / Kustomize для k8s манифестов; понимает разницу (Helm = template + values, Kustomize = patches без шаблонов) и когда использовать какой.
- **L5** — Проектирует структуру IaC repo: per-env directory vs workspace, DRY через модули, секреты через Vault / Secrets Manager / Sealed Secrets с reference в коде.
- **L5** — Внедряет drift detection (regular `terraform plan` на main, alerts на изменения вне pipeline) и periodic reconciliation; рассматривает click-ops в проде как операционный инцидент.
- **L5** — Реализует policy-as-code (OPA / Conftest / Sentinel) в pipeline: compliance / security checks (например, S3 bucket без public access, IAM role без `*:*` permissions) автоматически блокируют PR.
- **L6+** — Дизайнит IaC strategy для org: выбор tooling (Terraform / OpenTofu / Pulumi / Crossplane), структура repos (mono vs multi), workflow (CI-based vs GitOps), интеграция со service catalog.
- **L6+** — Балансирует blast radius IaC-изменений: критические (IAM, network policies, DNS, prod database) — больше gate'ов и явный pre-apply review; routine (k8s deployment scale, simple resource updates) — auto-merge при passing checks.

## Материалы

### Книги

- Yevgeniy Brikman — **Terraform: Up & Running**, 3-е изд. (O'Reilly, 2022). База: практический гид по Terraform для production-инфраструктуры — modules, state, testing, CI/CD.
- Kief Morris — **Infrastructure as Code: Dynamic Systems for the Cloud Age**, 2-е изд. (O'Reilly, 2020). База: tool-agnostic принципы IaC (declarative, idempotent, versioned, tested); применимо к Terraform / Pulumi / Crossplane.

### Статьи и фреймворки

- Adam Wiggins — **[The Twelve-Factor App](https://12factor.net/)**, фактор III «Config». База: принцип хранения конфигурации в environment vs кодовой базе; пересекается с IaC через handling environment variables и secrets.

### Инструменты

- **[Terraform](https://www.terraform.io/)** / **[OpenTofu](https://opentofu.org/)** — cloud-agnostic IaC, declarative HCL; OpenTofu — open-source fork под Linux Foundation после изменения лицензии HashiCorp.
- **[Pulumi](https://www.pulumi.com/)** — IaC через мейнстрим языки (TypeScript / Python / Go / C# / Java); альтернатива HCL для команд, у которых уже есть software engineering practices.
- **[Helm](https://helm.sh/)** — package manager для Kubernetes; chart = template + values; стандарт для распространяемого софта.
- **[Kustomize](https://kustomize.io/)** — template-free customization Kubernetes-манифестов через patches; встроен в `kubectl apply -k`. Альтернатива Helm для команд, не любящих шаблоны.
- **[Crossplane](https://www.crossplane.io/)** — расширение Kubernetes для управления non-k8s ресурсами (cloud, SaaS) через k8s API; единый control plane для приложений и инфраструктуры.
- **Policy-as-code** — **OPA / Conftest** (Open Policy Agent), **Sentinel** (HashiCorp); проверка compliance / security в pipeline до apply.
- **State backends** — Terraform Cloud, Spacelift, Atlantis (open-source pull-request automation); централизованное управление state без ручной работы с backend config.

## Best practices

- **Никаких click-ops в проде, ни разу, никем.** Антипаттерн: «быстро поправлю в console облака, потом запишу в код». Через месяц никто не помнит, что менялось; drift растёт; следующий `terraform apply` пытается «починить» руками сделанное и роняет сервис. Click-ops в проде = операционный инцидент с постмортемом.
- **Plan перед apply, всегда; review plan'а — обязательная часть PR.** Антипаттерн: `terraform apply` без `plan` или без review плана reviewer'ом. Plan показывает точный diff (create / update-in-place / replace / destroy); apply без review плана — гадание с правами root в проде.
- **Remote state с locking, никогда локальный state.** Антипаттерн: state в локальном файле или в git без locking. Два параллельных apply → corruption, потеря ресурсов из state, ручное восстановление часами. Backend (S3 + DynamoDB / GCS + native locking / Terraform Cloud) даёт locking и shared visibility.
- **Один environment — один state, без cross-env coupling.** Антипаттерн: единый state на dev / staging / prod. Случайное изменение или test в dev делает plan в prod ненулевым, и кто-то нажмёт apply. Разделение state по environment физически изолирует blast radius.
- **Secrets никогда в коде, ни в виде, ни в зашифрованном виде в plain repo.** Антипаттерн: пароли / токены в `.tf` или `values.yaml`. Используется Vault / AWS Secrets Manager / GCP Secret Manager / Sealed Secrets (k8s); в коде — только references. Даже зашифрованный secret в git — это «расшифруется, когда ключ утечёт».
- **IaC тестируется, не «применили в prod — увидели».** Антипаттерн: тест-стенд = prod. Unit-tests на module level (`terraform test`, terratest, kuttl для k8s), integration-tests в staging-environment, plan-проверка в PR, policy-checks в pipeline. Стоимость теста IaC ничтожна по сравнению со стоимостью инцидента.

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса = owner IaC repo / module этого сервиса; catalog связывает service ↔ IaC location.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — IaC изменения сами требуют progressive rollout (особенно для k8s deployments, network policies, IAM); те же паттерны canary / rollback.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и для типичных IaC-инцидентов (state corruption / drift recovery / manual revert) — обязательный набор для команды.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — Pulumi через мейнстрим языки делает IaC частью обычного software engineering; знание языка определяет качество module-структуры.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — network policies, ingress, load balancer config — частая часть IaC; знание сетевого стека прямо влияет на корректность IaC для networking-слоя.

## Открытые вопросы

- **GitOps** *(TBD)* — pull-based reconciliation модель (Argo CD / Flux): кластер сам подтягивает желаемое состояние из git. Соседняя практика внутри `Configuration Management` L1, противопоставленная push-based CI-applying. Возможный отдельный лист с акцентом на reconciliation guarantees и drift handling.
- **Policy as Code** *(TBD)* — OPA / Conftest / Sentinel — самостоятельная практика на стыке `Configuration Management` и `Information Security`. Сейчас упомянуто как best practice; при углублении ветви — отдельный лист.
- **Secrets Management** *(TBD)* — Vault / Secrets Manager / Sealed Secrets — отдельная подтема на стыке с `Information Security` L1. Здесь упомянуто как принцип «не в коде»; полное покрытие — в отдельном листе.
- **Multi-cloud / hybrid IaC strategy** — отдельная тема организационного дизайна (когда multi-cloud оправдан, как обеспечить consistency, vendor lock-in vs operational simplicity). Возможный соседний лист или часть `IT Management`.
