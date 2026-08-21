---
title: Workload Identity
description: Криптографическая идентичность сервисов вместо долгоживущих общих секретов — SPIFFE, IRSA, OIDC federation
sfia: [4, 5, 6]
status: draft
---

В апреле 2021 атакующий модифицировал [Codecov bash uploader](https://about.codecov.io/security-update/) — скрипт, который CI-сервисы тысяч компаний запускали для загрузки coverage reports. Изменение было крошечным: добавлен `curl` на endpoint атакующего с дампом environment variables. Большинство CI-pipeline'ов держало в environment **long-lived API tokens** к AWS, GCP, GitHub. Подменённый скрипт больше двух месяцев собирал переменные окружения у более чем двадцати тысяч клиентов Codecov, а дальше атакующие автоматически перебрали собранные креды и проникли в сотни клиентских сетей. Один скрипт в чужом сервисе — и компрометация расходится по всей отрасли. Этот инцидент стал industry-trigger для массового перехода к **OIDC federation** в CI/CD: GitHub Actions выкатил OIDC support через полгода, остальные подтянулись. Workload Identity решает корневую проблему: long-lived shared secret для нечеловеческого subject (CI runner, pod, Lambda, скрипт) — это credential, который **обязательно** утечёт, потому что хранится в десятках мест, ротируется редко, шарится между средами. Заменяем на cryptographic identity, привязанную к workload, с TTL минуты-часы, без secret в файловой системе. SPIFFE как стандарт, SPIRE как reference implementation, AWS IRSA / GCP Workload Identity / Azure Workload Identity как cloud-native реализации, OIDC federation как мост между ID provider'ами. Прямой сосед [Secrets Management](/The-Way-of-SRE/practices/secrets-management/) — но граница чёткая: secrets management управляет shared secret'ами, workload identity делает большинство shared secret'ов ненужными.

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
- Координирует с [Supply Chain Security](/The-Way-of-SRE/practices/supply-chain-security/) — workload identity в SLSA build pipeline; signed artifact + signed workload = end-to-end trust chain.

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
- **[SPIFFE и SPIRE выпущены из инкубатора CNCF](https://www.cncf.io/announcements/2022/09/20/spiffe-and-spire-projects-graduate-from-cloud-native-computing-foundation-incubator/)** (CNCF, сентябрь 2022). Формальная веха, после которой стандарт можно спокойно предлагать в проде: оба проекта в статусе graduated с августа 2022.
- **[NIST SP 800-204D — Strategies for the Integration of Software Supply Chain Security in DevSecOps CI/CD Pipelines](https://csrc.nist.gov/pubs/sp/800/204/d/final)** (NIST, 2024). Section 4 — про workload identity в pipeline context.

### Инструменты

- **[SPIRE](https://github.com/spiffe/spire)** (CNCF graduated). Reference implementation SPIFFE. Self-hosted, cross-platform, привязка к Kubernetes / Nomad / VMs / serverless. По моим наблюдениям, выбирают команды с multi-cloud / hybrid (где cloud-native option не подходит) или с сильной zero-trust strategy.
- **AWS IRSA** ([IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)) — workload identity для EKS pods через OIDC provider кластера. Стандарт для AWS-only команд на EKS.
- **AWS IAM Roles Anywhere** — расширение IAM roles на non-AWS workloads через X.509 trust anchor (Azure VMs, on-prem servers, IoT).
- **GCP Workload Identity** ([для GKE](https://cloud.google.com/kubernetes-engine/docs/concepts/workload-identity)) + **[Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)** (для external workloads через OIDC). Стандарт для GCP-нативных команд.
- **[Azure Workload Identity](https://azure.github.io/azure-workload-identity/docs/)** для AKS, **[Federated Identity Credentials](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)** для external. Дополняют Managed Identity (которые работают только для Azure-resources).
- **Service mesh с identity:** [Istio](https://istio.io/latest/docs/concepts/security/) (SPIFFE-compatible SVIDs, mTLS by default), [Linkerd](https://linkerd.io/2/features/automatic-mtls/) (proprietary identity, mTLS by default), [Cilium](https://cilium.io/) (mutual authentication поверх SPIFFE-идентичностей). По моим наблюдениям, Linkerd чаще выбирают для простоты setup, Istio — для глубокого control с trade-off operational complexity.
- **CI/CD OIDC integrations:** GitHub Actions (`id-token: write` permission + cloud trust policy), GitLab CI (JWT через `id_tokens`), CircleCI (OIDC tokens), Bitbucket Pipelines. На 2024–2025 годы — стандарт для cloud deploys; legacy long-lived keys в CI — security debt.
- **[HashiCorp Boundary](https://www.boundaryproject.io/)** — workload identity + access management; alternative подход через just-in-time worker authorization. Полезен в сценариях operator-to-machine access.
- **[Athenz](https://www.athenz.io/)** (изначально Yahoo, сейчас под Linux Foundation) — ветеран темы, появившийся раньше SPIFFE. Реже выбирают для green-field, но встречается там, где инфраструктура строилась вокруг стека Yahoo.

## Best practices

Главный публичный кейс — **Codecov bash uploader (апрель 2021)**. См. lead. Урок не про «Codecov плохие». Урок про то, что **environment variable в CI с long-lived AWS key — это credential, который утечёт**. Любой третий сторонний скрипт, любой supply chain compromise, любой logging mistake — и токен в руках атакующего. OIDC federation убирает этот класс leaks полностью: в CI environment нет постоянного credential; есть short-lived JWT, действительный 10 минут, выпускаемый только для конкретного workflow run. Compromise бессмысленна — токен expired ещё до того, как attacker его обработал. Это первая практика, которую я бы внедрял в любой команде с cloud deploys — даже если ничего другого из workload identity не делается.

Отсюда первое правило, и оно не обсуждается: OIDC federation для CI/CD. Долгоживущие облачные ключи в `secrets.AWS_ACCESS_KEY_ID` — это унаследованный долг по безопасности, а не «пока и так работает». Связка GitHub Actions OIDC с AWS STS, GCP STS или федерацией Azure настраивается за вечер на облако и окупается одной предотвращённой утечкой того же класса, что у Codecov. Если в репозитории до сих пор лежит `AWS_SECRET_ACCESS_KEY`, чинить я начал бы с него.

Второе — выбор реализации. Для нагрузок внутри одного облака cloud-native вариант (IRSA, GCP Workload Identity, Azure Workload Identity) выигрывает у всего остального: нулевой операционный оверхед и глубокая интеграция с IAM провайдера. SPIRE — больше движущихся частей, зато единая модель идентичности поверх AWS, GCP, on-prem и serverless сразу. Тащить SPIRE в одно облако незачем, игнорировать его в multi-cloud — тоже.

Третье правило неочевидное. Вопрос «кому выдать identity» опаснее вопроса «как выдать identity». Слабая attestation policy — скажем, когда любой pod в служебном namespace получает identity критичного сервиса — по последствиям равна звёздочке в правах RBAC. Минимум — привязка к service account, namespace и audience; уровень ноды и привязка к конкретной сборке — это уже эшелонированная защита.

**Граница со Secrets Management чёткая и важная.** Я регулярно вижу путаницу: «у нас Vault, нам не нужен workload identity». Vault даёт **управление shared secrets** — централизация, rotation, audit. Workload identity делает большинство shared secret'ов **не нужными**: вместо «pod достаёт DB password из Vault через app role» — «pod получает SPIFFE SVID, DB принимает client cert». Это не «или/или». Vault остаётся нужен там, где секрет ничем не заменить: сторонний API без mTLS, старая система, которая умеет только пароль. Но если сервис проектируется сегодня и его зависимости говорят по mTLS, идентичность выигрывает: меньше операционной возни и меньше мест, откуда может утечь.

**Service mesh — экономный путь к workload identity для k8s команд.** Istio и Linkerd дают идентичность и mTLS из коробки. Pod получает SPIFFE SVID или mesh identity без единой правки в коде приложения, а mTLS включается на уровне меша — то есть команда приходит к workload identity, вообще не притрагиваясь к SPIRE. Платить приходится операционной сложностью: sidecar на каждый pod, отдельный control plane, заметно более муторная отладка. На полусотне микросервисов это окупается, на пяти — overkill.

**Attestation policy — место, где security инжиниринг встречается с операциональностью.** SPIRE attestation flow: agent на ноде доказывает SPIRE server-у, что workload — это именно тот workload, который заявлен (через k8s pod metadata, или binary hash, или конкретный AMI ID для EC2). Policy определяет, какая комбинация атрибутов даёт какую SPIFFE ID. Слабые правила (`workload в namespace X получает ID для critical-service`) → любой pod в namespace получает critical access. Жёсткие правила (`workload с specific binary hash + specific service account + specific node label`) → safer, но breakage при каждом legitimate change. Tuning policy — это операционная работа, которую большинство команд недооценивает; budget на это явно с самого начала.

**OIDC issuer URL — публичный, signing key — нет.** Частое заблуждение звучит так: «OIDC безопасен, там же криптография». Криптография тут гарантирует только подлинность подписи issuer'а, а всё остальное решает trust policy на стороне облака — и если она разрешает любой репозиторий, любую ветку и любого автора, federation честно выдаст credentials любому, кто умеет сформировать запрос. Условие должно быть жёстким: конкретный репозиторий, конкретная ветка или environment, конкретный workflow. Шаблон trust policy от AWS — нормальная стартовая точка, но дальше его правят под себя.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/practices/secrets-management/)** — workload identity делает большинство shared secrets ненужными; Secrets Management управляет тем, что не заменимо identity-based подходом.
- **[Access Control & IAM](/The-Way-of-SRE/practices/access-control-iam/)** — workload identity — это identity слой для машин; IAM authorization строится поверх (какой workload identity что может).
- **[Supply Chain Security](/The-Way-of-SRE/practices/supply-chain-security/)** — workload identity в build pipeline (signed artifact ↔ identity, который создал артефакт) — часть SLSA framework.
- **[CI/CD](/The-Way-of-SRE/engineering/ci-cd/)** — OIDC federation в CI/CD pipeline; ephemeral runners + workload identity убирают целый класс CI security проблем.
- **[Threat Modeling](/The-Way-of-SRE/practices/threat-modeling/)** — workload identity меняет threat model для service-to-service interactions; trust boundaries смещаются с network perimeter к cryptographic identity.
- **[Networking](/The-Way-of-SRE/engineering/networking/)** — mTLS через workload identity заменяет network-perimeter security (zero-trust direction).
- **[Compliance Frameworks](/The-Way-of-SRE/practices/compliance-frameworks/)** — service account inventory + access review per service — типичные compliance requirements; workload identity упрощает evidence.
- **[Infrastructure as Code](/The-Way-of-SRE/engineering/infrastructure-as-code/)** — workload identity configuration (IRSA bindings, trust policies, SPIRE attestation rules) — IaC artifact, как и любая другая IAM конфигурация.

## Открытые вопросы

Публичных разборов **SPIRE federation в проде** мало, и почти все они не идут дальше блог-поста. Adobe, Pinterest и Bloomberg что-то публиковали, но деталей там скудно. Если ваша команда держит federation в проде — расскажите, это редкий опыт.

- **Cross-cloud workload identity** для команд, для которых ни SPIRE setup не подходит (overhead), ни cloud-native (нет single cloud) — пробел в tooling. HCP Boundary, Aembit, других managed предложений пока мало.
- **Workload identity для serverless (Lambda, Cloud Functions)** — IRSA-like patterns есть, но short-lived workload life cycle делает attestation сложным (нет долгоживущего agent'а).

Отдельно стоит идентичность на edge и в IoT. Там свой набор ограничений: связь рвётся, устройства слабые, счёт узлов идёт на миллионы. SPIFFE формально применим, но устоявшихся практик я не вижу.

Глубоко не разбирался с **post-quantum workload identity** — переводом X.509 SVID на устойчивые к квантовым атакам алгоритмы. Сейчас это мало для кого приоритет, но через несколько лет станет.
