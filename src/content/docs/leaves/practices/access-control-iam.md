---
title: Access Control & IAM
description: Identity + authorization-модель + JIT-доступ + phishing-resistant MFA как защита от lateral movement
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Access Control & IAM
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

В сентябре 2022 атакующий получил доступ во внутреннюю сеть Uber через MFA fatigue — спамил push-уведомления contractor'у, тот в итоге нажал «approve». Дальше — поиск по корпоративной сети, обнаружение PowerShell-скрипта с **захардкоженными admin-credentials** для PrivilegedAccessManagement системы, и через PAM — доступ ко всему: AWS, GCP, Slack admin, HackerOne. Один MFA bypass → полная компрометация org. Это не про «MFA не работает» — это про **отсутствие lateral defense**: после первичной компрометации IAM-модель должна была ограничить blast radius, а не предоставить атакующему ключи от всего. Грамотный IAM строится против exactly этого сценария: phishing-resistant MFA (FIDO2/WebAuthn) для критичных доступов, [наименьшие привилегии](/The-Way-of-SRE/glossary/#least-privilege) с регулярным access review, JIT (just-in-time) elevation вместо постоянных admin-прав, явное разделение human identity и workload identity. IAM — это не «список users», это операционная дисциплина: модель, контроль её drift, мониторинг anomaly access, repeatable break-glass procedure.

## Что должен уметь

Главный навык на уровне L5 — **проектирование IAM модели под конкретный threat profile, а не «как у всех»**. RBAC хорошо работает для команды в 20 человек с пятью ролями; ломается на 500 человек с пересечениями (data scientist + on-call + finance approver). ABAC решает scale, но требует attribute hygiene (откуда attributes, кто их валидирует). ReBAC (Zanzibar-style) красив для multi-tenant SaaS с sharing-семантикой. Выбор не доктринёрский — производный от модели threats и операционных constraints команды.

- **L3** — Различает authentication (кто это) и authorization (что разрешено); знает basic flows OAuth 2.0 / OIDC / SAML на уровне «что куда передаётся».
- **L3** — Использует MFA для своего account; понимает разницу TOTP / push / phishing-resistant (FIDO2/WebAuthn).
- **L4** — Применяет принцип наименьших привилегий — запрашивает минимальный нужный scope, escalation только при необходимости, не «попроси sysadmin прав на всё, потом разберёмся».
- **L4** — Конфигурирует RBAC в k8s / cloud IAM для своего сервиса: явные roles, явные bindings, no wildcard `*` в production permissions.
- **L4** — Внедряет SSO через corporate IdP для всех app-уровневых сервисов; локальные accounts — exception с задокументированным основанием.
- **L5** — Проектирует IAM модель команды/org: выбор RBAC vs ABAC vs гибрид, role taxonomy, ownership ролей, lifecycle (provisioning при join, revocation при leave / role change).
- **L5** — Внедряет JIT access для privileged операций — temporal escalation через approval workflow (Teleport / StrongDM / AWS IAM Identity Center session policies); standing admin-доступ только у break-glass accounts.
- **L5** — Координирует quarterly access review — каждый owner подтверждает или revoke'ает доступ team members; orphaned permissions (departed users, role changes) удаляются. Без cadence — privilege creep гарантированно.
- **L5** — Внедряет phishing-resistant MFA (FIDO2/WebAuthn, hardware keys) для admin и production access; TOTP/SMS — для low-risk операций, не для критики.
- **L6+** — Дизайнит strategy на уровне org: federation между acquired companies, multi-IdP architecture (employees + contractors + customers), break-glass policy, governance audit cadence, integration с HRIS для automated provisioning/deprovisioning.
- **L6+** — Принимает trade-off решения — централизованный IAM (один IdP, всё под ним) vs federated (несколько IdP с trust), monolithic vs domain-specific IAM, build vs buy для fine-grained authorization (Zanzibar-style).

## Материалы

### Книги

- Lee Brotherston, Amanda Berlin — **[Defensive Security Handbook](https://www.oreilly.com/library/view/defensive-security-handbook/9781098127237/)** (O'Reilly, 2-е изд., 2024). Главы про IAM, MFA, lateral movement — практический guide для small/medium security team. Без академического overhead.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы 5 (Identity), 6 (Authorization), 8 (Access). Google-perspective на zero-trust + workload identity + BeyondCorp.

### Статьи и доклады

- Google — **[Zanzibar: Google's Consistent, Global Authorization System](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/)** (USENIX ATC 2019). Основополагающая работа для ReBAC модели; ReadGuard для Google Drive / Calendar / Cloud. Понимать обязательно если строите multi-tenant SaaS с sharing-семантикой.
- Google — **[BeyondCorp: A New Approach to Enterprise Security](https://cloud.google.com/beyondcorp/)** (серия статей 2014–2018). Каноническая реализация zero-trust; убрали VPN, заменили на per-request access decision на базе user + device + context.
- **[Krebs on Security — Uber breach (Sept 2022)](https://krebsonsecurity.com/2022/09/breach-exposes-users-of-microleaves-proxy-service/)** + **[Uber's official statement](https://www.uber.com/newsroom/security-update/)**. Главный кейс про MFA fatigue → lateral movement.
- **[Mandiant — Microsoft Storm-0558 analysis (2023)](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/)**. Compromise signing key, использование для forge of access tokens. Иллюстрация того, что cryptographic identity тоже компрометируется.
- **[Twitter 2020 incident report (Sept 2020)](https://blog.twitter.com/en_us/topics/company/2020/an-update-on-our-security-incident)**. Social engineering admin-tools, никаких эксплоитов, только IAM weakness + lack of MFA on admin actions.
- **[Snowflake customer breaches (June 2024)](https://www.snowflake.com/en/blog/detecting-investigating-protecting-against-recent-cyber-threats/)**. Серия краж данных через customer accounts без MFA — иллюстрация, что cloud provider не отвечает за customer-side IAM hygiene.

### Стандарты

- **[NIST SP 800-63B — Digital Identity Guidelines, Authentication](https://pages.nist.gov/800-63-3/sp800-63b.html)**. Канонический документ про AAL levels, password requirements, MFA requirements. US gov standard, индустрия использует как baseline.
- **[OAuth 2.0 (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749)** + **[OIDC Core spec](https://openid.net/specs/openid-connect-core-1_0.html)**. Канонические спецификации federation. PKCE (RFC 7636) — must для public clients.

### Инструменты

- **Cloud IAM:** [AWS IAM](https://aws.amazon.com/iam/) + [IAM Identity Center](https://aws.amazon.com/iam/identity-center/) (бывший AWS SSO), [GCP IAM](https://cloud.google.com/iam) + [Cloud Identity](https://cloud.google.com/identity), [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id) (бывший Azure AD). Не выбираете — используете по cloud.
- **Identity Providers (workforce):** [Okta](https://www.okta.com/) (доминирует enterprise), [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id), [JumpCloud](https://jumpcloud.com/), [OneLogin](https://www.onelogin.com/). По моим наблюдениям, в startup до 200 человек чаще берут JumpCloud / Google Workspace identity; от 200 — Okta как стандарт.
- **Open-source IdP:** [Keycloak](https://www.keycloak.org/) (Red Hat, classic), [Authentik](https://goauthentik.io/) (modern Python), [ZITADEL](https://zitadel.com/) (Go, multi-tenant). Чаще выбирают для self-hosted scenarios или embedded customer auth.
- **Fine-grained authorization (Zanzibar-style):** [AuthZed/SpiceDB](https://authzed.com/), [OpenFGA](https://openfga.dev/) (CNCF, на базе Auth0 implementation Zanzibar), [Permify](https://www.permify.co/), [Topaz](https://www.topaz.sh/). Используются, когда RBAC/ABAC не покрывают relationship-based scenarios (sharing, hierarchies).
- **AuthZ libraries / PDP:** [Cerbos](https://www.cerbos.dev/), [Casbin](https://casbin.org/), [Open Policy Agent](https://www.openpolicyagent.org/) (general policy engine, чаще для k8s admission). OPA-based authorization — частый выбор для k8s-native команд.
- **PAM / JIT access:** [Teleport](https://goteleport.com/), [StrongDM](https://www.strongdm.com/), [HashiCorp Boundary](https://www.boundaryproject.io/), [CyberArk](https://www.cyberark.com/) (enterprise). По моим наблюдениям, в cloud-native командах Teleport чаще, чем CyberArk; CyberArk доминирует там, где есть legacy infrastructure (Windows AD, on-prem databases).
- **Phishing-resistant MFA:** [YubiKey](https://www.yubico.com/) (FIDO2/WebAuthn hardware), [Google Titan](https://store.google.com/us/product/titan_security_key), platform authenticators (Touch ID, Windows Hello). Software FIDO2 (Passkeys) — хорошо для consumer, для workforce — hardware predominant.
- **HRIS integration / SCIM:** интеграция Okta / Entra ID с HRIS (BambooHR / Workday / Rippling) через SCIM — automated provisioning/deprovisioning. Manual provisioning через год начинает копить orphan accounts.

## Best practices

Главный публичный кейс — **Uber 2022** (см. lead). Lateral movement через PAM credentials в скрипте — это IAM failure, не MFA failure. Реальный урок: после первичной компрометации (которая случится — это не «если», это «когда»), модель должна **ограничить** атакующего, а не открыть ему весь org. Это и есть principle defence in depth применённый к IAM: phishing-resistant MFA, scoped IAM roles, JIT escalation вместо standing admin, network segmentation как backstop. Если первая линия — MFA — единственная, всё, что находится за ней, открыто.

**Короткие правила:**

- **Phishing-resistant MFA для admin/production, не TOTP/SMS.** FIDO2/WebAuthn (hardware keys, platform authenticators) — единственная форма MFA, которую нельзя phish: cryptographic binding на domain исключает man-in-the-middle. TOTP — не phishing-resistant; SMS — пробивается SIM swap. Для admin доступа hardware keys — baseline; для low-risk операций TOTP допустим.
- **JIT (just-in-time) elevation вместо standing admin-прав.** Standing admin = постоянная цель для атакующего и постоянный источник misuse. JIT через approval workflow (Teleport / StrongDM / AWS IAM Identity Center session policies) — time-bound elevation (1 час), audit log на каждое использование, approver — отдельный человек, не self-approve. Break-glass account — exception с monitoring каждого его использования.
- **Quarterly access review — без cadence privilege creep гарантирован.** Owner каждой group/role подтверждает или revoke'ает members; departed users (через HRIS feed) автоматически removed; role changes triggers access re-evaluation. SOC 2 CC6.3 явно требует — но даже без compliance это операционная гигиена.

Подробнее:

**RBAC vs ABAC vs ReBAC — выбор по threats и scale, не по доктрине.** В команде 20 человек с 5 ролями RBAC — простой, понятный, audit'ируемый. От 200 человек RBAC начинает разваливаться: role explosion (роль на каждую комбинацию permissions), implicit permissions через group nesting, невозможность сказать «у пользователя X доступ к ресурсу Y, потому что …». ABAC решает scale через attributes (department + clearance + project), но требует attribute hygiene — откуда attributes берутся, кто их валидирует, что происходит при stale attribute. ReBAC (Zanzibar) — natural fit для multi-tenant SaaS с sharing-семантикой («у пользователя X доступ к документу Y, потому что owner документа добавил X в shared list»); накладывает infrastructural cost (отдельная permissions database). Я регулярно вижу команды, которые over-engineer authorization model в первый год — RBAC хватило бы ещё на 2 года. И вижу обратное — команды, которые в 300 человек ещё на RBAC и тонут в role audit, потому что меняли «потом, когда будет нужно».

**Service identity ≠ human identity.** Это два разных domain'а IAM. Human accounts требуют MFA, SSO, password rotation, access review. Service accounts (CI/CD, app-to-app, scheduled jobs) — workload identity, OIDC federation, mTLS, ephemeral credentials (см. [Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/) — отдельный лист). Смешивать опасно: long-lived service account password в IdP — атакующий phish'ит human → получает service permissions. Должны быть отдельные lifecycle, отдельная rotation policy, отдельный monitoring anomaly.

**Break-glass policy — отрепетирована, не «runbook есть».** Когда IdP лежит / Okta outage / администратор уволился без передачи — нужен путь восстановить доступ. Break-glass account: hardware key в физическом сейфе у CISO/CTO, password в отдельном sealed envelope, monitoring каждого использования с paging security team. Game day раз в полгода: симулируется отказ IdP, команда восстанавливает доступ к критичной системе за target time. Без репетиции — это идея в Confluence, не процедура.

**SSO для всего, исключения — задокументированы.** Каждый локальный account (создан в app, обходит SSO) — потенциальная dark corner. SOC 2 / ISO 27001 audit это поймает. Реальная же причина — централизованный offboarding: уволили человека → revoke в IdP → доступ во все 200 SaaS пропадает. Без SSO — checklist на 200 пунктов, который никогда не выполняется полностью.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — IAM решает «кто», secrets решают «чем»; вместе — единая модель authentication + authorization для humans и workloads.
- **[Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/)** — service-to-service identity без shared secrets; частный случай IAM для нечеловеческих subjects.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — IAM как часть trust boundaries; STRIDE elevation-of-privilege категория — основной источник IAM требований.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — IAM сам является vulnerability surface (excessive permissions, orphan accounts); VM tools часто scan'ят IAM misconfigurations.
- **[Compliance Frameworks](/The-Way-of-SRE/leaves/practices/compliance-frameworks/)** — SOC 2 CC6.x — большой блок access controls; IAM реализация маппится на конкретные controls.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса = owner IAM policy для своего сервиса; access review per service.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — compromised credentials → IAM playbook (revoke, rotate, audit access logs, lateral check).

## Открытые вопросы

- **Customer IAM (CIAM)** — отдельный домен с другими constraints (scale 10M+ users, social login, account recovery UX). Тулинг другой (Auth0, Cognito, Stytch). Стоит ли отдельный лист? Скорее да, но не топ-приоритет.
- **Workload Identity Federation patterns** для multi-cloud — частично покроется в [Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/), но есть нюансы (cross-cloud trust, OIDC issuer verification).
- **Privileged Access Management (PAM)** как отдельная подобласть — Teleport / StrongDM / CyberArk имеют достаточно глубины для отдельного листа? Сейчас покрывается через JIT в этом листе.
- **Authorization audit / explainability** — «почему пользователь X получил доступ к ресурсу Y» в complex IAM системах. ReBAC платформы это поддерживают (Zanzibar zlookups); в RBAC/ABAC — нетривиально. Возможно отдельный технический под-лист.
- Я не уверен, что есть хорошая публичная модель для «когда переходить с RBAC на ABAC/ReBAC» — обычно это решение принимается по pain (audit стал невозможен, sharing model не помещается), не по proactive design. Если у вас был такой переход — был бы интересен опыт PR'ом.
