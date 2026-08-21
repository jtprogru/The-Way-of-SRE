---
title: Access Control & IAM
description: Модель доступа, которая ограничивает атакующего уже после того, как он прошёл первую линию защиты
sfia: [3, 4, 5, 6]
status: draft
---

В сентябре 2022 атакующий вошёл во внутреннюю сеть Uber через MFA fatigue: заваливал подрядчика запросами на подтверждение входа, пока тот не нажал «approve». Дальше началась обычная прогулка по корпоративной сети. В ней нашёлся скрипт на PowerShell с **захардкоженными учётными данными администратора** для системы Privileged Access Management, а через PAM открылось сразу всё — AWS, GCP, Slack admin, HackerOne. Один обход MFA — и всё.

Это не история про «MFA не работает». Это история про **пустой второй рубеж**: после первичной компрометации модель доступа обязана была сузить blast radius, а не выдать ключи от всего. Грамотный IAM строится ровно против такого сценария — phishing-resistant MFA (FIDO2/WebAuthn) на критичных доступах, [наименьшие привилегии](/The-Way-of-SRE/glossary/#least-privilege) с регулярным access review, повышение прав по запросу и на время (JIT) вместо постоянных прав администратора, явное разделение human identity и workload identity. IAM — не «список пользователей», а операционная дисциплина: модель, контроль её дрейфа, мониторинг аномального доступа, повторяемая процедура break-glass.

## Что должен уметь

Главный навык на уровне L5 — **проектирование IAM модели под конкретный threat profile, а не «как у всех»**. RBAC хорошо работает для команды в 20 человек с пятью ролями; ломается на 500 человек с пересечениями (data scientist + on-call + finance approver). ABAC решает scale, но требует attribute hygiene (откуда attributes, кто их валидирует). ReBAC (Zanzibar-style) красив для multi-tenant SaaS, где пользователи сами раздают доступ друг другу. Выбор не доктринёрский — производный от модели threats и операционных ограничений команды.

**L3**
- Различает authentication (кто это) и authorization (что разрешено); знает basic flows OAuth 2.0 / OIDC / SAML на уровне «что куда передаётся».
- Использует MFA для своего account; понимает разницу TOTP / push / phishing-resistant (FIDO2/WebAuthn).

**L4**
- Применяет принцип наименьших привилегий — запрашивает минимальный нужный scope, escalation только при необходимости, не «попроси sysadmin прав на всё, потом разберёмся».
- Конфигурирует RBAC в k8s / cloud IAM для своего сервиса: явные roles, явные bindings, no wildcard `*` в production permissions.
- Внедряет SSO через корпоративный IdP для всех прикладных сервисов; локальные accounts — исключение с задокументированным основанием.

**L5**
- Проектирует IAM модель команды/org: выбор RBAC vs ABAC vs гибрид, role taxonomy, ownership ролей, lifecycle (provisioning при join, revocation при leave / role change).
- Внедряет JIT access для privileged операций — temporal escalation через approval workflow (Teleport / StrongDM / AWS IAM Identity Center session policies); постоянные права администратора остаются только у break-glass accounts.
- Координирует quarterly access review — каждый owner подтверждает или revoke'ает доступ участников команды; orphaned permissions (ушедшие пользователи, role changes) удаляются. Без cadence — privilege creep гарантированно.
- Внедряет phishing-resistant MFA (FIDO2/WebAuthn, hardware keys) для admin и production access; TOTP/SMS — для low-risk операций, не для критики.

**L6+**
- Дизайнит strategy на уровне org: federation между acquired companies, multi-IdP architecture (employees + contractors + клиенты), break-glass policy, governance audit cadence, integration с HRIS для automated provisioning/deprovisioning.
- Принимает trade-off решения — централизованный IAM (один IdP, всё под ним) vs federated (несколько IdP с trust), monolithic vs domain-specific IAM, build vs buy для fine-grained authorization (Zanzibar-style).

## Материалы

### Книги

- Lee Brotherston, Amanda Berlin — **[Defensive Security Handbook](https://www.oreilly.com/library/view/defensive-security-handbook/9781098127237/)** (O'Reilly, 2-е изд., 2024). Главы про IAM, MFA, lateral movement — практический guide для small/medium security team. Без академического overhead.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы 5 (Identity), 6 (Authorization), 8 (Access). Google-perspective на zero-trust + workload identity + BeyondCorp.

### Статьи и доклады

- Google — **[Zanzibar: Google's Consistent, Global Authorization System](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/)** (USENIX ATC 2019). Основополагающая работа для ReBAC модели; на Zanzibar живут проверки доступа в Drive, Calendar, Cloud, Maps, Photos и YouTube — то есть модель проверена на масштабе, который вам почти наверняка не понадобится. Понимать обязательно, если строите multi-tenant SaaS, где доступ раздают сами пользователи.
- Google — **[BeyondCorp: A New Approach to Enterprise Security](https://cloud.google.com/beyondcorp/)** (серия статей 2014–2018). Каноническая реализация zero-trust; убрали VPN, заменили на per-request access decision на базе user + device + context.
- **[Uber's official statement](https://www.uber.com/newsroom/security-update/)** (сентябрь 2022). Главный кейс про MFA fatigue → lateral movement; официальная версия короткая, детали механики разошлись по разборам в отраслевой прессе.
- **[Microsoft — Analysis of Storm-0558 techniques for unauthorized email access](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/)** (июль 2023). Compromise signing key, использование для forge of access tokens. Иллюстрация того, что cryptographic identity тоже компрометируется. Разбор своего же провала от самой Microsoft — читать вместе с их сентябрьским отчётом о том, как ключ вообще утёк.
- **[Twitter — An update on our security incident](https://blog.x.com/en_us/topics/company/2020/an-update-on-our-security-incident)** (инцидент 15 июля 2020, отчёт от 30 июля). Телефонный фишинг сотрудников и админские инструменты: никаких эксплоитов, только IAM weakness и отсутствие MFA на административных действиях. 130 атакованных аккаунтов, 45 из которых успели написать твиты.
- **Серия краж данных у клиентов Snowflake (июнь 2024)**. Атакующие заходили в клиентские аккаунты, где не был включён MFA, — иллюстрация того, что cloud provider не отвечает за клиентскую IAM hygiene, а обязанность включить второй фактор лежит на том, кто заводит аккаунт.

### Стандарты

- **[NIST SP 800-63B — Digital Identity Guidelines, Authentication](https://pages.nist.gov/800-63-3/sp800-63b.html)**. Канонический документ про AAL levels, password requirements, MFA requirements. US gov standard, индустрия использует как baseline.
- **[OAuth 2.0 (RFC 6749)](https://datatracker.ietf.org/doc/html/rfc6749)** + **[OIDC Core spec](https://openid.net/specs/openid-connect-core-1_0.html)**. Канонические спецификации federation. PKCE (RFC 7636) — must для public clients.

### Инструменты

- **Cloud IAM:** [AWS IAM](https://aws.amazon.com/iam/) + [IAM Identity Center](https://aws.amazon.com/iam/identity-center/) (бывший AWS SSO), [GCP IAM](https://cloud.google.com/iam) + [Cloud Identity](https://cloud.google.com/identity), [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id) (бывший Azure AD). Не выбираете — используете по cloud.
- **Identity Providers (workforce):** [Okta](https://www.okta.com/) (доминирует enterprise), [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id), [JumpCloud](https://jumpcloud.com/), [OneLogin](https://www.onelogin.com/). По моим наблюдениям, в startup до 200 человек чаще берут JumpCloud / Google Workspace identity; от 200 — Okta как стандарт.
- **Open-source IdP:** [Keycloak](https://www.keycloak.org/) (Red Hat, classic), [Authentik](https://goauthentik.io/) (modern Python), [ZITADEL](https://zitadel.com/) (Go, multi-tenant). Чаще выбирают для self-hosted scenarios или embedded клиентской auth.
- **Fine-grained authorization (Zanzibar-style):** [AuthZed/SpiceDB](https://authzed.com/), [OpenFGA](https://openfga.dev/) (CNCF, на базе Auth0 implementation Zanzibar), [Permify](https://www.permify.co/), [Topaz](https://www.topaz.sh/). Используются, когда RBAC/ABAC не покрывают relationship-based scenarios (sharing, hierarchies).
- **AuthZ libraries / PDP:** [Cerbos](https://www.cerbos.dev/), [Casbin](https://casbin.org/), [Open Policy Agent](https://www.openpolicyagent.org/) (general policy engine, чаще для k8s admission). OPA-based authorization — частый выбор для k8s-native команд.
- **PAM / JIT access:** [Teleport](https://goteleport.com/), [StrongDM](https://www.strongdm.com/), [HashiCorp Boundary](https://www.boundaryproject.io/), [CyberArk](https://www.cyberark.com/) (enterprise). По моим наблюдениям, в cloud-native командах Teleport чаще, чем CyberArk; CyberArk доминирует там, где есть legacy infrastructure (Windows AD, on-prem databases).
- **Phishing-resistant MFA:** [YubiKey](https://www.yubico.com/) (FIDO2/WebAuthn hardware), [Google Titan](https://store.google.com/us/product/titan_security_key), platform authenticators (Touch ID, Windows Hello). Software FIDO2 (Passkeys) — хорошо для consumer, для workforce — hardware predominant.
- **HRIS integration / SCIM:** интеграция Okta / Entra ID с HRIS (BambooHR / Workday / Rippling) через SCIM — automated provisioning/deprovisioning. Manual provisioning через год начинает копить orphan accounts.

## Best practices

Главный публичный кейс — **Uber 2022** (см. начало листа). Lateral movement через PAM credentials в скрипте — это провал IAM, а не провал MFA. Урок отсюда простой. Первичная компрометация случится: вопрос не «если», а «когда», — и в этот момент модель доступа либо сжимает атакующего в узкий сектор, либо открывает ему всю организацию. Defence in depth в применении к IAM выглядит так: phishing-resistant MFA, узко нарезанные роли, повышение прав на время вместо постоянного администратора, сегментация сети как последний рубеж. Когда MFA — единственная линия, всё за ней лежит нараспашку.

Три вещи из этого списка окупаются раньше остального. Первая — phishing-resistant MFA на административных доступах и на доступах в production. FIDO2/WebAuthn (hardware keys, platform authenticators) — единственная форма второго фактора, которую нельзя выудить фишингом: криптографическая привязка к домену не даёт вклиниться посреднику. TOTP так не умеет, SMS пробивается через SIM swap. Для низкорисковых операций TOTP нормален. Для админа — нет.

Вторая — повышение прав по запросу и на срок вместо постоянного администратора. Постоянный админ — это одновременно вечная цель для атакующего и вечный источник случайных ошибок. Механика: заявка через approval workflow (Teleport, StrongDM, session policies в AWS IAM Identity Center), права на час, запись в audit log на каждое использование, подтверждающий — отдельный человек, не сам заявитель. Break-glass account живёт как исключение, и каждое его использование подсвечивается мониторингом.

Третья — квартальный access review. Без регулярного ритма privilege creep набегает гарантированно: владелец каждой группы подтверждает или отзывает участников, ушедшие сотрудники вычищаются по фиду из HRIS, смена роли запускает пересмотр доступов. SOC 2 CC6.3 требует этого прямым текстом. Но дело не в аудиторе. Это операционная гигиена.

**RBAC vs ABAC vs ReBAC — выбор по threats и масштабу, не по доктрине.** В команде 20 человек с 5 ролями RBAC — простой, понятный, audit'ируемый. От 200 человек RBAC начинает разваливаться: role explosion (роль на каждую комбинацию permissions), implicit permissions через group nesting, невозможность сказать «у пользователя X доступ к ресурсу Y, потому что …». ABAC решает scale через attributes (department + clearance + project), но требует attribute hygiene — откуда attributes берутся, кто их валидирует, что происходит при stale attribute. ReBAC (Zanzibar) ложится на multi-tenant SaaS, где доступ раздают сами пользователи («у пользователя X доступ к документу Y, потому что owner документа добавил X в shared list»), и стоит отдельной базы разрешений. Я регулярно вижу команды, которые переусложняют authorization model в первый год — RBAC хватило бы ещё на 2 года. И вижу обратное — команды, которые в 300 человек ещё на RBAC и тонут в role audit, потому что меняли «потом, когда будет нужно».

**Service identity ≠ human identity.** Это два разных domain'а IAM. Human accounts требуют MFA, SSO, password rotation, access review. Service accounts (CI/CD, app-to-app, scheduled jobs) — workload identity, OIDC federation, mTLS, ephemeral credentials (см. [Workload Identity](/The-Way-of-SRE/practices/workload-identity/) — отдельный лист). Смешивать опасно: long-lived service account password в IdP — атакующий фишит человека и получает права сервиса. У них разный жизненный цикл, разная политика ротации, разный мониторинг аномалий.

**Break-glass policy — отрепетирована, не «runbook есть».** IdP лёг, у Okta авария, администратор уволился без передачи дел — во всех трёх случаях остаётся ровно один путь вернуть себе доступ. Break-glass account: hardware key в физическом сейфе у CISO/CTO, password в отдельном sealed envelope, monitoring каждого использования с paging security team. Раз в полгода — game day: симулируем отказ IdP и смотрим, за сколько команда вернёт себе доступ к критичной системе, не подглядывая в чат с теми, кто уже уволился. Без репетиции это идея в Confluence, а не процедура.

**SSO для всего, исключения — задокументированы.** Каждый локальный account, заведённый прямо в приложении в обход SSO, — тёмный угол. Аудит SOC 2 или ISO 27001 его найдёт. Но настоящая причина держаться SSO не в аудите, а в offboarding: уволили человека, отозвали в IdP — и доступ во все двести SaaS пропал одним движением. Без SSO на этом месте чеклист из двухсот пунктов, который целиком не выполняется никогда.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/practices/secrets-management/)** — IAM решает «кто», secrets решают «чем»; вместе — единая модель authentication + authorization для humans и workloads.
- **[Workload Identity](/The-Way-of-SRE/practices/workload-identity/)** — service-to-service identity без shared secrets; частный случай IAM для нечеловеческих subjects.
- **[Threat Modeling](/The-Way-of-SRE/practices/threat-modeling/)** — IAM как часть trust boundaries; STRIDE elevation-of-privilege категория — основной источник IAM требований.
- **[Vulnerability Management](/The-Way-of-SRE/practices/vulnerability-management/)** — IAM сам по себе — vulnerability surface (excessive permissions, orphan accounts); VM tools часто scan'ят IAM misconfigurations.
- **[Compliance Frameworks](/The-Way-of-SRE/practices/compliance-frameworks/)** — SOC 2 CC6.x — большой блок access controls; IAM реализация маппится на конкретные controls.
- **[Service Ownership](/The-Way-of-SRE/culture/service-ownership/)** — owner сервиса = owner IAM policy для своего сервиса; access review per service.
- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — compromised credentials → IAM playbook (revoke, rotate, audit access logs, lateral check).

## Открытые вопросы

Customer IAM (CIAM) — соседний домен с совсем другими ограничениями: десятки миллионов пользователей, social login, UX восстановления аккаунта, другой тулинг (Auth0, Cognito, Stytch). Отдельный лист напрашивается, но не в первую очередь. Туда же просится Privileged Access Management: у Teleport, StrongDM и CyberArk хватает глубины на самостоятельный текст, пока всё это живёт внутри абзаца про JIT здесь.

Федерация workload identity в multi-cloud частично закроется в [Workload Identity](/The-Way-of-SRE/practices/workload-identity/), но нюансы вроде cross-cloud trust и проверки OIDC issuer туда пока не помещаются. Отдельно интересна объяснимость доступа — вопрос «почему пользователь X получил доступ к ресурсу Y» в разросшейся модели. Платформы ReBAC на него отвечают, в RBAC и ABAC ответ приходится собирать руками.

Я не уверен, что есть хорошая публичная модель для «когда переходить с RBAC на ABAC/ReBAC». Обычно решение принимают по боли — аудит стал невозможен, модель шаринга не помещается, — а не заранее по проекту. Если у вас был такой переход, был бы интересен опыт PR'ом.
