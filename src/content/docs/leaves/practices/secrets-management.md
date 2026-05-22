---
title: Secrets Management
description: Управление secrets через централизованный store с least privilege, rotation, audit
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Secrets Management
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Закоммитил токен, удалил следующим коммитом — ок» — фраза, после которой я начинаю говорить про ротацию **немедленно**. Токен остался в git history, в reflog, в forks, в CI кэше, в local repo у каждого, кто pull'нул. Удаление коммита не помогает — секрет нужно ротировать **сразу**. Secrets Management — это **дисциплина**: централизованный store (Vault / Secrets Manager / Sealed Secrets), least privilege для access, регулярная rotation, полный audit trail, отрепетированная emergency revocation. Главная практика внутри L1 `Information Security`; соседи (Threat Modeling, Access Control & IAM, Vulnerability Management) — в открытых вопросах.

## Что должен уметь

Главный навык на уровне L6+ — переход к **secret-less аутентификации** где это возможно. Service-to-service mTLS вместо shared secrets, ephemeral / short-lived credentials через workload identity (AWS IRSA, GCP Workload Identity, SPIFFE/SPIRE). Любой long-lived secret — это потенциальная утечка; ephemeral credentials с TTL минуты-часы убирают целый класс рисков. Я регулярно вижу команды, которые ротируют long-lived secrets, вместо того чтобы их вообще не иметь — это правильный шаг, но не финальный.

- **L3** — Понимает, что считается секретом (token / password / private key / cert / SSH key); никогда не коммитит секреты в git; находит secrets своего сервиса в Vault / Secrets Manager команды.
- **L3** — Знает rotation cadence для secrets своего сервиса; использует pre-commit hook (`gitleaks` / `detect-secrets`) локально.
- **L4** — Настраивает доступ к secrets через IAM/RBAC по принципу least privilege: сервис A не видит secrets сервиса B; разработчик читает prod-secrets только под audit.
- **L4** — Интегрирует Vault / Secrets Manager в сервис: sidecar / SDK / env injection / Kubernetes Secrets через External Secrets Operator; код работает с reference, не с literal.
- **L5** — Проектирует secret lifecycle: provisioning, rotation (auto- или manual cadence), revocation, expiration (TTL); auto-rotation для DB credentials и short-lived tokens — норма.
- **L5** — Внедряет emergency revocation procedure для случая leak: runbook, скрипты, escalation — отрепетированные на game day, не написанные впервые во время инцидента.
- **L5** — Настраивает secrets audit: кто, когда, какой секрет запросил; интегрирует с SIEM или централизованным logging; alerting на anomaly access patterns.
- **L6+** — Дизайнит strategy для org: выбор tooling, integration patterns, compliance (SOC2, PCI-DSS, GDPR, HIPAA).
- **L6+** — Применяет zero-trust к secret access: service-to-service mTLS вместо shared secrets; ephemeral credentials через workload identity; secret-less как целевое состояние.

## Материалы

### Книги и руководства

- **[OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)**. Один из самых актуальных публичных guide: централизация, lifecycle, encryption standards, cloud-specific guidance, incident response.
- **[HashiCorp Vault Documentation](https://developer.hashicorp.com/vault)**. Канонический tool для secret management; documentation как референс по архитектуре, secret engines, auth methods, dynamic credentials.

### Статьи

- **[The Twelve-Factor App](https://12factor.net/)**, фактор III «Config». Принцип хранения конфигурации в environment, а не в коде.

### Инструменты

- **[HashiCorp Vault](https://developer.hashicorp.com/vault)** — централизованный secret store с поддержкой dynamic secrets, множества auth methods, audit log. По моим наблюдениям, стандарт для cloud-agnostic команд.
- **AWS Secrets Manager / GCP Secret Manager / Azure Key Vault** — cloud-native альтернативы. Минимум integration overhead для команд внутри одного cloud; auto-rotation для RDS / Cloud SQL через managed-functions.
- **[External Secrets Operator](https://external-secrets.io/latest/)** — Kubernetes operator: синхронизирует secrets из external API в native Kubernetes Secrets. Стандарт для k8s команд.
- **[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)** (Bitnami) — k8s controller для encrypted-at-rest secrets прямо в git. Альтернатива External Secrets для команд без отдельного store.
- **[SOPS](https://github.com/getsops/sops)** — encrypted-files-in-git через age / KMS / PGP; формат-agnostic. Удобно для конфигов с примесью secrets.
- **Detection** — **[gitleaks](https://github.com/gitleaks/gitleaks)** (regex + entropy detection, pre-commit hook, CI integration), `detect-secrets`, `trufflehog`. Обязательны в pre-commit и в CI.

## Best practices

**Короткие правила:**

- **Никогда не коммить секрет в git, даже на минуту, даже в private repo.** Удаление коммита не помогает — секрет в git history, reflog, forks, CI кэше, local repo у каждого, кто pull'нул. Pre-commit hooks (gitleaks / detect-secrets) — обязательная defense-in-depth.
- **Rotation — regular practice, а не «когда взломали».** Auto-rotation для DB credentials, short-lived tokens с TTL минуты/часы, regular cadence для тех, что нельзя автоматизировать (квартал / полгода). Чем старше secret, тем больше копий и mishandling вокруг него.
- **Least privilege для access.** «Всем prod-доступ ко всем secrets на всякий случай» — при компрометации одной учётки атакующий получает всё. Доступ по принципу need-to-know, через IAM/RBAC, с audit log; через временную elevation (just-in-time access).

Подробнее:

**Auto-rotation там, где возможно; manual — exception.** Manual rotation требует discipline, которая ломается через 6 месяцев. По моим наблюдениям, в командах с заявленной policy «ротация раз в квартал» через год реально ротируются только токены, для которых это автоматизировано. Auto-rotation выбирается на дешёвом уровне tooling (Vault dynamic secrets, AWS Secrets Manager rotation Lambda) — это инвестиция, которая окупается за первый incident.

**Detection — defense-in-depth, не «мы аккуратные».** «У нас нет проблем, мы аккуратно коммитим» — один новичок или один debug-момент закоммитит токен. Pre-commit hook (locally), CI scan (gitleaks в pipeline), regular history scan (поиск исторически закоммиченных) — три уровня. Я регулярно вижу команды, в которых secret находят через год после коммита, потому что не было historical scan.

**Emergency revocation отрепетирована, а не «прочитали runbook».** При leak в проде команда первый раз открывает Vault UI и ищет, где «revoke» — минуты теряются, секрет работает у атакующего. Game day: симулируется leak, команда отрабатывает revocation за target time (например, < 10 минут); время фиксируется как метрика. Без репетиции runbook — это документ, а не процедура.

## Связанные листья

- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC хранит **references** на secrets (`vault.lookup("db/prod")`), но никогда literal values.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса = owner его secrets и их ротации.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — TLS-сертификаты — частный случай секрета; mTLS вместо shared secrets — zero-trust direction.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — secret leak — отдельный класс инцидентов с собственным набором действий (revoke, rotate, audit, disclose).
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook для emergency revocation, rotation, recovery после leak — must-have в on-call toolkit.
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — пересечение в OIDC federation; centralized signing infrastructure = secrets-management применённая к signing keys.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — vulnerability часто = secret leak; rotation + scoping снижают impact compromised secret.

## Открытые вопросы

- **Threat Modeling** уже выделен в отдельный лист под Information Security.
- **Access Control & IAM** *(TBD)* — управление identity, ролями, разрешениями (для людей и для сервисов).
- **Compliance** *(TBD)* — SOC2 / PCI-DSS / GDPR / HIPAA как организационная задача.
- **Security Code Review** *(TBD)* — практика проверки кода на security-issues (OWASP Top 10, secure coding patterns).
- **Workload Identity / Service Identity** — частный случай Access Control: SPIFFE/SPIRE, AWS IRSA, GCP Workload Identity.
