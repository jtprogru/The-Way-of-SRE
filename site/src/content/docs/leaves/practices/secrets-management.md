---
title: Secrets Management
description: Управление производственными секретами — passwords, tokens, certs, keys — через централизованный store с least privilege, rotation, audit и emergency revocation
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Secrets Management
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Управление production-секретами — passwords, API tokens, TLS-сертификаты, encryption keys, DB credentials — через **централизованный store с дисциплиной**: least privilege для access, регулярная rotation, полный audit trail, отрепетированная emergency revocation. Главная практика внутри L1 `Information Security`; соседние практики (Threat Modeling, Access Control & IAM, Vulnerability Management, Compliance, Security Code Review) — в «Открытых вопросах».

## Что должен уметь

- **L3** — Понимает, что считается секретом (token / password / private key / cert / SSH key); никогда не коммитит секреты в git; находит секреты своего сервиса в Vault / Secrets Manager команды.
- **L3** — Знает rotation cadence для секретов своего сервиса; использует pre-commit hook (`gitleaks` / `detect-secrets`) локально, чтобы случайно не закоммитить токен.
- **L4** — Настраивает доступ к секретам через IAM/RBAC по принципу least privilege: сервис A не видит секреты сервиса B; разработчик читает prod-secrets только под audit.
- **L4** — Интегрирует Vault / Secrets Manager в сервис: sidecar / SDK / env injection / Kubernetes Secrets через External Secrets Operator; код сервиса работает с reference, не с literal.
- **L5** — Проектирует secret lifecycle: provisioning (как секрет создаётся), rotation (auto- или manual cadence), revocation (как отнять доступ), expiration (TTL); auto-rotation для DB credentials и short-lived tokens — норма.
- **L5** — Внедряет emergency revocation procedure для случая leak: runbook, скрипты, escalation — отрепетированные на game day, не написанные впервые во время инцидента.
- **L5** — Настраивает secrets audit: кто, когда, какой секрет запросил; интегрирует audit log с SIEM или хотя бы централизованным logging; alerting на anomaly access patterns.
- **L6+** — Дизайнит secret management strategy для org: выбор tooling (Vault / cloud-native / гибрид), integration patterns между сервисами, compliance с регуляторными требованиями (SOC2, PCI-DSS, GDPR, HIPAA).
- **L6+** — Применяет zero-trust principles к secret access: service-to-service mTLS вместо shared secrets там, где возможно; ephemeral / short-lived credentials через workload identity (AWS IAM Roles for Service Accounts, GCP Workload Identity); secret-less аутентификация как целевое состояние.

## Материалы

### Книги и руководства

- **[OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)**. База: централизация, lifecycle management, encryption standards (AES-256-GCM, ChaCha20-Poly1305), cloud-specific guidance, incident response. Один из самых актуальных публичных guide.
- **[HashiCorp Vault Documentation](https://developer.hashicorp.com/vault)**. База: канонический tool для secret management; documentation как референс по архитектуре, secret engines, auth methods, dynamic credentials.

### Статьи

- **[The Twelve-Factor App](https://12factor.net/)**, фактор III «Config». База: принцип хранения конфигурации (включая секреты) в environment, а не в коде. Пересекается с Infrastructure as Code через handling.

### Инструменты

- **[HashiCorp Vault](https://developer.hashicorp.com/vault)** — централизованный secret store с поддержкой dynamic secrets (DB credentials по запросу с TTL), множества auth methods, audit log. Стандарт для cloud-agnostic команд.
- **AWS Secrets Manager / GCP Secret Manager / Azure Key Vault** — cloud-native альтернативы. Минимум integration overhead, если команда внутри одного cloud; auto-rotation для RDS / Cloud SQL через managed-functions.
- **[External Secrets Operator](https://external-secrets.io/latest/)** — Kubernetes operator: синхронизирует секреты из external API (Vault / AWS / GCP / Azure) в native Kubernetes Secrets. Стандарт для k8s команд, чтобы не дублировать секреты.
- **[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)** (Bitnami) — k8s controller для encrypted-at-rest секретов прямо в git: kubeseal CLI шифрует public key'ом кластера, расшифровка только внутри cluster. Альтернатива External Secrets для team без отдельного secret store.
- **[SOPS](https://github.com/getsops/sops)** — encrypted-files-in-git через age / KMS / PGP; формат-agnostic (YAML / JSON / ENV / INI). Удобно для конфигов с примесью секретов.
- **Detection** — **[gitleaks](https://github.com/gitleaks/gitleaks)** (regex + entropy detection в git history, pre-commit hook, CI integration), `detect-secrets`, `trufflehog`. Обязательны в pre-commit и в CI как secondary defense.

## Best practices

- **Никогда не коммить секрет в git, даже на минуту, даже в private repo.** Антипаттерн: «закоммитил токен → удалил следующим коммитом → ок». Токен остался в git history, в reflog, в forks, в CI кэше, в local репозиториях у каждого, кто pull'нул. Удаление коммита не помогает — секрет нужно ротировать **немедленно**. Pre-commit hooks (gitleaks / detect-secrets) — обязательная defense-in-depth.
- **Rotation — regular practice, а не «когда взломали».** Антипаттерн: секреты живут годами. Чем старше секрет, тем больше копий и mishandling вокруг него. Auto-rotation для DB credentials (Vault / AWS Secrets Manager делают это нативно), short-lived tokens (TTL минуты / часы) с auto-renewal, regular cadence для тех, что нельзя автоматизировать (квартал / полгода).
- **Least privilege для access — ни один engineer не имеет доступ ко всем prod-секретам.** Антипаттерн: всем prod-доступ ко всем секретам «на всякий случай». При компрометации одной учётки атакующий получает всё. Доступ — по принципу need-to-know, через IAM/RBAC, с audit log; человек запрашивает доступ к конкретному секрету через временную elevation (just-in-time access).
- **Auto-rotation там, где возможно; manual rotation — exception, не правило.** Антипаттерн: «забыли ротировать токен → токен утёк → инцидент». Manual rotation требует discipline, которая ломается через 6 месяцев. Auto-rotation выбирается на dépauper уровне tooling (Vault dynamic secrets, AWS Secrets Manager rotation Lambda).
- **Detection — defense-in-depth, не «мы аккуратные».** Антипаттерн: «у нас нет проблем, мы аккуратно коммитим». Один новичок или один debug-моментум закоммитит токен. Pre-commit hook (locally), CI scan (gitleaks в pipeline), regular history scan (поиск исторически закоммиченных секретов) — три уровня.
- **Emergency revocation отрепетирована, а не «прочитали runbook».** Антипаттерн: при leak в проде команда первый раз открывает Vault UI и ищет, где «revoke». Минуты теряются, секрет работает у атакующего. Game day: симулируется leak, команда отрабатывает revocation за target time (например, < 10 минут); время фиксируется как метрика secrets-discipline.

## Связанные листья

- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC хранит **references** на секреты (`vault.lookup("db/prod")`, `aws_secretsmanager_secret_version.id`), но никогда literal values; интеграция secret store ↔ IaC — общая практика.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса = owner его секретов и их ротации; catalog связывает service ↔ secret references.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — TLS-сертификаты — частный случай секрета; mTLS вместо shared secrets для service-to-service auth — zero-trust direction.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — secret leak — отдельный класс инцидентов с собственным набором действий (revoke, rotate, audit, disclose); runbook обязателен.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и для emergency revocation, для rotation procedures, для recovery после leak — must-have в on-call toolkit.

## Открытые вопросы

- **Threat Modeling** *(TBD)* — STRIDE / PASTA / Trike methodology для проектирования сервиса с учётом security. Соседняя практика внутри `Information Security` L1.
- **Access Control & IAM** *(TBD)* — управление identity, ролями, разрешениями (включая для людей и для сервисов); отдельный лист на стыке с `Service Ownership`.
- **Vulnerability Management** *(TBD)* — CVE tracking, patch cadence, SBOM, dependency scanning. Соседняя практика, может быть отдельный лист.
- **Compliance** *(TBD)* — SOC2 / PCI-DSS / GDPR / HIPAA как организационная задача — отдельный лист на стыке с `IT Management`.
- **Security Code Review** *(TBD)* — практика проверки кода на security-issues (OWASP Top 10, secure coding patterns). Возможный соседний лист.
- **Workload Identity / Service Identity** — частный случай Access Control, но самостоятельная подтема (AWS IRSA, GCP Workload Identity, SPIFFE/SPIRE).
