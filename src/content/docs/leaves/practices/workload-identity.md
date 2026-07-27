---
title: Workload Identity
description: Cryptographic identity для сервисов (SPIFFE, IRSA, OIDC federation) — замена long-lived shared secrets для service-to-service auth
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Access Control & IAM / Workload Identity
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

В апреле 2021 атакующий модифицировал [Codecov bash uploader](https://about.codecov.io/security-update/) — скрипт, который CI-сервисы тысяч компаний запускали для загрузки coverage reports. Изменение было крошечным: добавлен `curl` на endpoint атакующего с дампом environment variables. Большинство CI-pipeline'ов держало в environment **long-lived API tokens** к AWS, GCP, GitHub. Один компрометированный shell-скрипт → ключи от 29 000 организаций. Этот инцидент стал industry-trigger для массового перехода к **OIDC federation** в CI/CD: GitHub Actions выкатил OIDC support через 6 месяцев, остальные подтянулись. Workload Identity решает корневую проблему: long-lived shared secret для нечеловеческого subject (CI runner, pod, Lambda, скрипт) — это credential, который **обязательно** утечёт, потому что хранится в десятках мест, ротируется редко, шарится между средами. Заменяем на cryptographic identity, привязанную к workload, с TTL минуты-часы, без secret в файловой системе. SPIFFE как стандарт, SPIRE как reference implementation, AWS IRSA / GCP Workload Identity / Azure Workload Identity как cloud-native реализации, OIDC federation как мост между ID provider'ами. Прямой сосед [Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/) — но граница чёткая: secrets management управляет shared secret'ами, workload identity делает большинство shared secret'ов ненужными.

## Что должен уметь

Главный навык на уровне L5 — **проектирование service-to-service auth модели для всего стека**. Workload identity — это не «настроим IRSA для одного сервиса», это решение для каждого сервиса в кластере, каждого CI workflow, каждой serverless функции, каждой cron job. Без unified подхода рождается зоопарк: половина сервисов через IRSA, половина через long-lived AWS keys, CI через OIDC, Lambda через resource-based policy. Каждый exception — потенциальный leak surface; unified модель сокращает attack surface на порядок.

**L3**
- Понимает разницу human identity (user account, SSO, MFA) и workload identity (service account, machine credential, ephemeral token).
- Использует cloud-native workload identity для своего сервиса (IRSA на EKS, Workload Identity на GKE, Managed Identity на Azure) вместо long-lived access keys.

**L4**
- Конфигурирует OIDC federation для CI/CD (GitHub Actions OIDC → AWS / GCP / Azure, GitLab JWT → AWS), убирает long-lived CI credentials из repository secrets.
- Различает SPIFFE ID, SVID (X.509 или JWT), trust bundle, attestation; читает SPIFFE spec для понимания, как identity issuance работает «под капотом».
- Настраивает mTLS между сервисами через workload identity (Istio + SPIFFE SVID, Linkerd identity, manual SPIRE integration) — service-to-service authentication без shared secrets.

**L5**
- Проектирует workload identity strategy для всего org: выбор SPIRE (cross-cloud, multi-platform) vs cloud-native (только в одном cloud, но zero ops); model для cross-cloud workloads.
- Внедряет attestation policy — какой workload получает какую identity. Pod-level (k8s service account), node-level (instance metadata), build-attestation (workload identity связана с конкретным CI build artifact).
- Координирует с [Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/) — workload identity в SLSA build pipeline; signed artifact + signed workload = end-to-end trust chain.

**L6+**
- Дизайнит trust federation для multi-cluster / multi-cloud / multi-org scenarios — federated SPIRE servers, cross-trust-domain federation, JWT SVID exchange между federation partners.
- Принимает strategic decisions — SPIRE self-hosted vs managed (HashiCorp HCP Boundary, AWS Roles Anywhere для non-EC2 workloads); buy-vs-build identity infrastructure; integration с existing PKI.

## Материалы

### Стандарты и спецификации

- **[SPIFFE Specification](https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/)** (CNCF graduated). Канонический документ: SPIFFE ID format (`spiffe://trust-domain/path`), SVID (SPIFFE Verifiable Identity Document — X.509 или JWT), trust bundle distribution, attestation framework.
- **[OpenID Connect Federation 1.0](https://openid.net/specs/openid-connect-federation-1_0.html)** + **[OAuth 2.0 Token Exchange (RFC 8693)](https://datatracker.ietf.org/doc/html/rfc8693)**. Технические основы OIDC federation; token exchange — как cloud принимает OIDC token от CI и выдаёт STS credentials.

### Книги

- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), глава 5 (Design for Understanding) и глава 6 (Design for a Changing Landscape). Google-perspective на ALTS (Application Layer Transport Security) — внутренний Google'овский workload identity, концептуальная база для SPIFFE.

### Статьи и доклады

- **[Codecov bash uploader compromise (April 2021)](https://about.codecov.io/security-update/)** + **[Bloomberg coverage](https://www.bloomberg.com/news/articles/2021-04-15/codecov-hackers-breached-hundreds-of-restricted-customer-sites)**. Главный кейс — см. ниже.
- **[GitHub Blog — Secure deployments with OpenID Connect (Nov 2021)](https://github.blog/changelog/2021-10-27-github-actions-secure-cloud-deployments-with-openid-connect/)**. Объявление OIDC support в GitHub Actions; industry-significant событие.
- **[AWS Blog — IAM Roles Anywhere (July 2022)](https://aws.amazon.com/blogs/security/extend-aws-iam-roles-to-workloads-outside-of-aws-with-iam-roles-anywhere/)**. Расширение workload identity на non-AWS workloads через X.509 trust anchor.
- **[Andres Vega — Securing Cloud-Native Apps with SPIFFE/SPIRE](https://www.cncf.io/blog/2020/08/27/securing-cloud-native-applications-with-a-distributed-identity-control-plane-spiffe/)** (CNCF, 2020). Practical introduction в SPIFFE для команд, рассматривающих внедрение.
- **[NIST SP 800-204D — Strategies for the Integration of Software Supply Chain Security in DevSecOps CI/CD Pipelines](https://csrc.nist.gov/pubs/sp/800/204/d/final)** (NIST, 2024). Section 4 — про workload identity в pipeline context.

### Инструменты

- **[SPIRE](https://github.com/spiffe/spire)** (CNCF graduated). Reference implementation SPIFFE. Self-hosted, cross-platform, привязка к Kubernetes / Nomad / VMs / serverless. По моим наблюдениям, выбирают команды с multi-cloud / hybrid (где cloud-native option не подходит) или с сильной zero-trust strategy.
- **AWS IRSA** ([IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)) — workload identity для EKS pods через OIDC provider кластера. Стандарт для AWS-only команд на EKS.
- **AWS IAM Roles Anywhere** — расширение IAM roles на non-AWS workloads через X.509 trust anchor (Azure VMs, on-prem servers, IoT).
- **GCP Workload Identity** ([для GKE](https://cloud.google.com/kubernetes-engine/docs/concepts/workload-identity)) + **[Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)** (для external workloads через OIDC). Стандарт для GCP-нативных команд.
- **[Azure Workload Identity](https://azure.github.io/azure-workload-identity/docs/)** для AKS, **[Federated Identity Credentials](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)** для external. Дополняют Managed Identity (которые работают только для Azure-resources).
- **Service mesh с identity:** [Istio](https://istio.io/latest/docs/concepts/security/) (SPIFFE-compatible SVIDs, mTLS by default), [Linkerd](https://linkerd.io/2/features/automatic-mtls/) (proprietary identity, mTLS by default), [Cilium](https://cilium.io/use-cases/zero-trust/) (через Hubble + mTLS). По моим наблюдениям, Linkerd чаще выбирают для простоты setup, Istio — для глубокого control с trade-off operational complexity.
- **CI/CD OIDC integrations:** GitHub Actions (`id-token: write` permission + cloud trust policy), GitLab CI (JWT через `id_tokens`), CircleCI (OIDC tokens), Bitbucket Pipelines. На 2024–2025 годы — стандарт для cloud deploys; legacy long-lived keys в CI — security debt.
- **[HashiCorp Boundary](https://www.boundaryproject.io/)** — workload identity + access management; alternative подход через just-in-time worker authorization. Полезен в сценариях operator-to-machine access.
- **[Athenz](https://www.athenz.io/)** (Yahoo, Linux Foundation) — старший proprietary workload identity (предшествовал SPIFFE); используется в LinkedIn, Verizon Media. Реже выбирают для green-field, но встречается в legacy.

## Best practices

Главный публичный кейс — **Codecov bash uploader (апрель 2021)**. См. lead. Урок не про «Codecov плохие» — урок про то, что **environment variable в CI с long-lived AWS key — это credential, который утечёт**. Любой третий сторонний скрипт, любой supply chain compromise, любой logging mistake — и токен в руках атакующего. OIDC federation убирает этот класс leaks полностью: в CI environment нет постоянного credential; есть short-lived JWT, действительный 10 минут, выпускаемый только для конкретного workflow run. Compromise бессмысленна — токен expired ещё до того, как attacker его обработал. Это первая практика, которую я бы внедрял в любой команде с cloud deploys — даже если ничего другого из workload identity не делается.

**Короткие правила:**

- **OIDC federation для CI/CD — non-negotiable в 2025.** Long-lived cloud credentials в `secrets.AWS_ACCESS_KEY_ID` — legacy security debt. GitHub Actions OIDC + AWS STS / GCP STS / Azure федерация занимает 2 часа на migration per cloud, окупается одним предотвращённым Codecov-like leak. Если в repository ещё есть `AWS_SECRET_ACCESS_KEY` в repo secrets — это первое, что я бы починил, не обсуждая.
- **Cloud-native workload identity для workloads в одном cloud; SPIRE — для multi-cloud / hybrid.** IRSA / GCP Workload Identity / Azure Workload Identity — zero operational overhead, deep integration с cloud IAM. SPIRE — больше moving parts (server, agents, attestation policy), но единая identity model через AWS + GCP + on-prem + serverless. Не нужно сразу SPIRE для одного cloud; не игнорируйте SPIRE для multi-cloud.
- **Attestation важнее identity issuance.** «Кому выдать identity» опаснее, чем «как выдать identity». Слабая attestation policy (например, любой pod в kube-system namespace получает identity для критичного сервиса) — это `*` permissions в RBAC. Pod-level attestation через k8s service account + namespace + audience — minimum; node-level / build-attestation — defense in depth.

Подробнее:

**Граница со Secrets Management чёткая и важная.** Я регулярно вижу путаницу: «у нас Vault, нам не нужен workload identity». Vault даёт **управление shared secrets** — централизация, rotation, audit. Workload identity делает большинство shared secret'ов **не нужными**: вместо «pod достаёт DB password из Vault через app role» — «pod получает SPIFFE SVID, DB принимает client cert». Это не «или/или» — Vault полезен для secrets, которые невозможно заменить cryptographic identity (third-party API без mTLS, legacy systems). Но если новый сервис designed today и его dependencies поддерживают mTLS — workload identity предпочтительнее. Меньше operations, меньше leak surface.

**Service mesh — экономный путь к workload identity для k8s команд.** Istio / Linkerd дают workload identity + mTLS «из коробки» через sidecar pattern. Pod автоматически получает SPIFFE SVID (Istio) или mesh identity (Linkerd) без изменений в app code; mTLS включается на mesh level. Это reduce barrier к workload identity adoption: команда получает идентичность без интеграции SPIRE напрямую. Trade-off — operational cost of mesh (sidecar overhead, control plane, debugging complexity); для команд от 50+ микросервисов окупается, для 5 микросервисов — overkill.

**Attestation policy — место, где security инжиниринг встречается с операциональностью.** SPIRE attestation flow: agent на ноде доказывает SPIRE server-у, что workload — это именно тот workload, который заявлен (через k8s pod metadata, или binary hash, или конкретный AMI ID для EC2). Policy определяет, какая комбинация атрибутов даёт какую SPIFFE ID. Слабые правила (`workload в namespace X получает ID для critical-service`) → любой pod в namespace получает critical access. Жёсткие правила (`workload с specific binary hash + specific service account + specific node label`) → safer, но breakage при каждом legitimate change. Tuning policy — это операционная работа, которую большинство команд недооценивает; budget на это явно с самого начала.

**OIDC issuer URL — публичный, signing key — нет.** Common misconception: «OIDC = secure, потому что cryptographic». Безопасность OIDC federation зависит от того, что cloud провайдер verify'ает signing key issuer'а (GitHub, GitLab, etc.) через trust policy. Если конфигурация trust policy позволяет любой repository / любой branch / любой actor — federation выдаст credentials любому, кто умеет запросить. Trust policy condition должна быть жёсткой: конкретный repo, конкретный branch (или environment), конкретный workflow file. Default GitHub OIDC trust template от AWS — хороший старт; кастомизируйте под свои requirements.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — workload identity делает большинство shared secrets ненужными; Secrets Management управляет тем, что не заменимо identity-based подходом.
- **[Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)** — workload identity — это identity слой для машин; IAM authorization строится поверх (какой workload identity что может).
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — workload identity в build pipeline (signed artifact ↔ identity, который создал артефакт) — часть SLSA framework.
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — OIDC federation в CI/CD pipeline; ephemeral runners + workload identity убирают целый класс CI security проблем.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — workload identity меняет threat model для service-to-service interactions; trust boundaries смещаются с network perimeter к cryptographic identity.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — mTLS через workload identity заменяет network-perimeter security (zero-trust direction).
- **[Compliance Frameworks](/The-Way-of-SRE/leaves/practices/compliance-frameworks/)** — service account inventory + access review per service — типичные compliance requirements; workload identity упрощает evidence.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — workload identity configuration (IRSA bindings, trust policies, SPIRE attestation rules) — IaC artifact, как и любая другая IAM конфигурация.

## Открытые вопросы

- **SPIRE federation в production at scale** — публичных кейсов больше уровня blog post мало. Adobe, Pinterest, Bloomberg публиковали что-то, но детали скудные. Если ваша команда runs SPIRE federation в production — был бы интересен опыт.
- **Cross-cloud workload identity** для команд, для которых ни SPIRE setup не подходит (overhead), ни cloud-native (нет single cloud) — пробел в tooling. HCP Boundary, Aembit, других managed предложений пока мало.
- **Workload identity для serverless (Lambda, Cloud Functions)** — IRSA-like patterns есть, но short-lived workload life cycle делает attestation сложным (нет долгоживущего agent'а).
- **Identity в edge computing / IoT** — отдельный класс constraints (intermittent connectivity, constrained devices, scale 10M+). SPIFFE формально применим, но patterns ещё формируются.
- Я не разбирался глубоко с **post-quantum workload identity** — миграция X.509 SVID на PQ-safe алгоритмы. Сейчас не приоритет в большинстве команд, но через 5–7 лет станет.
