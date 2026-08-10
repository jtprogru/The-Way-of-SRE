---
title: Secrets Management
description: Управление secrets через централизованный store с наименьшими привилегиями, ротацией, аудитом
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Secrets Management
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Закоммитил токен, удалил следующим коммитом — ок» — фраза, после которой я начинаю говорить про ротацию **немедленно**. Токен остался в git history, в reflog, в forks, в CI кэше, в local repo у каждого, кто pull'нул. Удаление коммита не помогает — секрет нужно ротировать **сразу**. Secrets Management — это **дисциплина**: централизованный store (Vault / Secrets Manager / Sealed Secrets), [наименьшие привилегии](/The-Way-of-SRE/glossary/#least-privilege) для доступа, регулярная rotation, полный [журнал аудита](/The-Way-of-SRE/glossary/#audit-trail), отрепетированная emergency revocation. Главная практика внутри L1 `Information Security`; соседи по рантайм-периметру — [Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/), Security Chaos Engineering и Compliance Frameworks.

## Что должен уметь

Главный навык на уровне L6+ — переход к **secret-less аутентификации** где это возможно. Service-to-service mTLS вместо shared secrets, ephemeral / short-lived credentials через workload identity (AWS IRSA, GCP Workload Identity, SPIFFE/SPIRE). Любой long-lived secret — это потенциальная утечка; ephemeral credentials с TTL минуты-часы убирают целый класс рисков. Я регулярно вижу команды, которые ротируют long-lived secrets, вместо того чтобы их вообще не иметь — это правильный шаг, но не финальный.

**L3**
- Понимает, что считается секретом (token / password / private key / cert / SSH key); никогда не коммитит секреты в git; находит secrets своего сервиса в Vault / Secrets Manager команды.
- Знает rotation cadence для secrets своего сервиса; использует pre-commit hook (`gitleaks` / `detect-secrets`) локально.

**L4**
- Настраивает доступ к secrets через IAM/RBAC по принципу наименьших привилегий: сервис A не видит secrets сервиса B; разработчик читает секреты прода только под audit.
- Интегрирует Vault / Secrets Manager в сервис: sidecar / SDK / env injection / Kubernetes Secrets через External Secrets Operator; код работает с reference, не с literal.

**L5**
- Проектирует secret lifecycle: provisioning, rotation (auto- или manual cadence), revocation, expiration (TTL); auto-rotation для DB credentials и short-lived tokens — норма.
- Внедряет emergency revocation procedure для случая leak: runbook, скрипты, escalation — отрепетированные на game day, не написанные впервые во время инцидента.
- Настраивает secrets audit: кто, когда, какой секрет запросил; интегрирует с SIEM или централизованным logging; alerting на anomaly access patterns.

**L6+**
- Дизайнит strategy для org: выбор tooling, integration patterns, compliance (SOC2, PCI-DSS, GDPR, HIPAA).
- Применяет zero-trust к secret access: service-to-service mTLS вместо shared secrets; ephemeral credentials через workload identity; secret-less как целевое состояние.

## Материалы

### Книги и руководства

- **[OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)**. Один из самых актуальных публичных guide: централизация, lifecycle, encryption standards, cloud-specific guidance, incident response.
- **[HashiCorp Vault Documentation](https://developer.hashicorp.com/vault)**. Канонический tool для secret management; документация как референс по архитектуре, secret engines, auth methods, dynamic credentials.

### Статьи

- **[The Twelve-Factor App](https://12factor.net/)**, фактор III «Config». Принцип хранения конфигурации в environment, а не в коде.

### Инструменты

- **[HashiCorp Vault](https://developer.hashicorp.com/vault)** — централизованный secret store с поддержкой dynamic secrets, множества auth methods, audit log. По моим наблюдениям, стандарт для cloud-agnostic команд.
- **AWS Secrets Manager / GCP Secret Manager / Azure Key Vault** — cloud-native альтернативы. Минимум integration overhead для команд внутри одного cloud; auto-rotation для RDS / Cloud SQL через managed-functions.
- **[External Secrets Operator](https://external-secrets.io/latest/)** — Kubernetes operator: синхронизирует secrets из external API в native Kubernetes Secrets. Стандарт для k8s команд.
- **[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)** (Bitnami) — k8s controller для encrypted-at-rest secrets прямо в git. Альтернатива External Secrets для команд без отдельного store.
- **[SOPS](https://github.com/getsops/sops)** — encrypted-files-in-git через age / KMS / PGP, не привязан к формату файла. Удобно для конфигов с примесью secrets.
- **Detection** — **[gitleaks](https://github.com/gitleaks/gitleaks)** (regex + entropy detection, pre-commit hook, CI integration), `detect-secrets`, `trufflehog`. Обязательны в pre-commit и в CI.

## Best practices

Секрет не коммитится в git никогда. Ни на минуту, ни в приватный репозиторий, ни «я сразу удалю». Удаление коммита не помогает: секрет остаётся в истории, в reflog, в форках, в кэше CI и в локальной копии у каждого, кто успел сделать pull. Pre-commit hooks с gitleaks или detect-secrets — не паранойя, а обязательный нижний слой защиты.

Ротация — регулярная практика, а не реакция на взлом. Динамические credentials для баз, короткоживущие токены с TTL в минуты и часы, календарный ритм для того, что автоматизировать не вышло. Логика простая. Чем старше секрет, тем больше вокруг него накопилось копий и небрежного обращения: он лежит в чьём-то локальном `.env`, всплывает в старом тикете, куда его вставили для воспроизведения бага, попадает в переписку и в скриншот из чата, про который забыли все, кроме поисковой индексации.

Про наименьшие привилегии всё известно, и всё равно я регулярно вижу «дадим всем доступ в прод ко всем секретам, чтобы не блокировать людей». Цена такого решения выясняется при компрометации одной учётки: атакующий получает сразу всё. Правильная схема скучная и известная: доступ выдаётся по need-to-know через IAM/RBAC, каждое обращение к секрету пишется в audit log с именем и временем, а повышение прав выдаётся под конкретную задачу и живёт минуты, а не до следующей инвентаризации.

**Автоматическая ротация там, где возможно; ручная — исключение.** Ручная ротация держится на дисциплине, а дисциплина ломается примерно через полгода. По моим наблюдениям, в командах с заявленной политикой «ротируем раз в квартал» через год реально ротируются только те токены, для которых это делает машина. Инструменты дешёвые — dynamic secrets в Vault, rotation Lambda в AWS Secrets Manager — и окупаются они на первом же инциденте.

**Detection — это защита в глубину, а не «мы аккуратные».** Достаточно одного новичка или одного отладочного захода в три часа ночи, чтобы токен уехал в коммит. Уровней три: pre-commit локально, скан в CI, регулярный скан истории. Последний забывают чаще всего, и я регулярно вижу команды, где секрет находят через год после коммита именно потому, что все три года настроенный gitleaks смотрел только на новые изменения, а до накопленной истории ни у кого не доходили руки.

**Emergency revocation отрепетирована, а не «прочитали runbook».** Утечка в проде — и команда первый раз в жизни открывает UI Vault в поисках кнопки revoke. Минуты уходят, а секрет всё это время работает на атакующего. Лечится это game day: симулируем утечку, отрабатываем отзыв на время, фиксируем это время как метрику. Непроверенный runbook — документ, а не процедура.

## Связанные листья

- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC хранит **references** на secrets (`vault.lookup("db/prod")`), но никогда literal values.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса = owner его secrets и их ротации.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — TLS-сертификаты — частный случай секрета; mTLS вместо shared secrets — zero-trust direction.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — secret leak — отдельный класс инцидентов с собственным набором действий (revoke, rotate, audit, disclose).
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook для emergency revocation, rotation, recovery после leak — must-have в on-call toolkit.
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — пересечение в OIDC federation; centralized signing infrastructure = secrets-management применённая к signing keys.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — vulnerability часто = secret leak; rotation + scoping снижают impact compromised secret.
- **[Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)** — IAM решает «кто», secrets — «чем»; вместе единая модель authentication + authorization.
- **[Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/)** — делает большинство shared secrets ненужными: cryptographic identity вместо API token / mTLS вместо bearer.
- **[Compliance Frameworks](/The-Way-of-SRE/leaves/practices/compliance-frameworks/)** — encryption / key management / access controls — pervasive требования во всех frameworks; SOC 2 CC6.6 / PCI-DSS Req 3.
- **[Security Code Review](/The-Way-of-SRE/leaves/practices/security-code-review/)** — secret scanning (gitleaks / trufflehog) — общий слой: SCR ловит захардкоженный секрет до merge, Secrets Management отвечает за его lifecycle в store.

## Открытые вопросы

Большая часть того, что раньше висела здесь как открытые вопросы, уже разъехалась по отдельным листьям. Threat Modeling ушёл под `Secure Development`. Access Control & IAM и Security Code Review стоят рядом и слинкованы выше. Workload Identity забрал SPIFFE/SPIRE, AWS IRSA, Workload Identity в GCP и Azure, OIDC federation в CI/CD. Compliance Frameworks — SOC 2, PCI-DSS, GDPR и HIPAA как драйверы требований к шифрованию, ротации ключей и журналу аудита.

Что осталось открытым лично у меня — как жить с секретами, которые физически нельзя ротировать без простоя. Ключ, зашитый в прошивку устройства, или сертификат, который принимает контрагент по договору, ломают всю красивую схему с TTL в минуты. Готового ответа нет.
