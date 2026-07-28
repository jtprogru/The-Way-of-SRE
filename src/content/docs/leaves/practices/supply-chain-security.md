---
title: Supply Chain Security
description: Защита цепочки build → sign → distribute → verify; не «scanner и галочка»
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Secure Development / Supply Chain Security
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

SolarWinds (2020), Codecov (2021), 3CX (2023), xz-utils (2024) — атака на software supply chain сместилась с runtime на build и distribution. Я наблюдаю, что многие команды думают про supply chain security только в категории «scan на vulnerabilities» — это лишь финальный слой. Real defense — контролируемая цепочка артефактов с криптографически проверяемым **provenance**: signed commits → controlled build → [SBOM](/The-Way-of-SRE/glossary/#sbom) → signed release → verify-on-deploy. Четвёртый лист под L1 `Secure Development`. Граница с [Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/) чёткая: VM реагирует на known CVE — что уже сломано; Supply Chain Security защищает сам процесс — где будущая уязвимость не успеет стать известной CVE, а попадёт в прод через скомпрометированный pipeline.

## Что должен уметь

Главный навык на уровне L5 — проектировать **SLSA-compliant pipeline** под нужный target level. Уровней с версии 1.0 три, а не четыре, как было в черновике 0.1: Build L1 — provenance просто существует; Build L2 — сборка идёт на выделенной площадке и provenance подписан; Build L3 — площадка изолирует сборки друг от друга и не даёт шагам сборки добраться до ключей подписи. Старый Level 4 с требованиями к исходникам из спецификации убрали, разделив её на треки, так что ссылаться на «SLSA 4» сейчас — верный признак, что человек читал документацию три года назад. Достижимый baseline для большинства команд — L2; L3 имеет смысл для production-critical артефактов. По моим наблюдениям, команды без SLSA-фреймворка ставят defenses неконсистентно — что-то pin'нут, что-то не pin'нут, что-то sign'нут, что-то нет.

**L4**
- Понимает scope `software supply chain` — это не только OSS dependencies, а **вся** цепочка: source repository → build runner → artifact registry → deployment → runtime.
- Применяет **signed commits** (GPG / Sigstore gitsign) и **branch protection** (signed-only merge в protected branches).
- Внедряет **Pipeline-as-Code в репо** (не в UI), все CI/CD secrets через **OIDC federation** (короткоживущие токены), а не long-lived PATs. Build steps pinned by digest (`@sha256:...`), не by mutable tag.

**L5**
- Проектирует **SLSA-compliant pipeline** — выбирает target level (Build L1–L3) по compliance/criticality.
- Генерирует и публикует **SBOM** (Software Bill of Materials) — SPDX или CycloneDX, генерация в CI каждого артефакта (Syft / cdxgen), attestation подписан.
- Применяет **artifact signing & verification** — Sigstore cosign для container images и release artifacts, keyless signing через OIDC, admission policies в k8s для verify-on-deploy.
- Защищается от **dependency confusion и typosquatting** — internal packages с reserved namespace в public registry, strict resolver config (no fallback от private к public), allow-list maintained internal-mirror.

**L6+**
- Внедряет org-level supply chain security program — SLSA roadmap по сервисам, centralized signing infrastructure, policy-as-code для verification, vendor security assessment process, regulatory mapping (EO 14028, EU CRA, NIST SSDF).
- Принимает strategic decisions — build-vs-buy для critical OSS dependencies, insurance implications, incident response планирование под supply chain compromise (revoke-and-rotate scope).

## Материалы

### Книги и фреймворки

- **[SLSA — Supply-chain Levels for Software Artifacts](https://slsa.dev/)** (OpenSSF). Канонический фреймворк уровней зрелости. Maintained OpenSSF, реализуется в GitHub Actions, GitLab, BuildKit.
- **[The Update Framework (TUF)](https://theupdateframework.io/)** (CNCF graduated). Спецификация secure software update systems — устойчива к key compromise, registry compromise, replay attacks. Используется как foundation в Sigstore, Notary v2, Datadog Agent.
- **[in-toto framework](https://in-toto.io/)**. Спецификация attestation цепочки supply chain. SLSA использует in-toto attestations как формат.
- **[NIST SSDF (SP 800-218)](https://csrc.nist.gov/Projects/ssdf)**. US federal требования к software vendors после EO 14028.

### Статьи и доклады

- **[The xz-utils backdoor (CVE-2024-3094) — Andres Freund's discovery](https://www.openwall.com/lists/oss-security/2024/03/29/4)**. Главный публичный кейс — см. ниже.
- **[SolarWinds: рекомендации CISA пострадавшим сетям](https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-008a)** (Alert AA21-008A). Переломный инцидент: атакующие вошли через build system и подписали malicious update легитимным cert. Читать для понимания, почему build environment integrity критично — и заодно чтобы оценить масштаб зачистки, которая требуется после такого класса компрометации.
- **[Codecov Bash Uploader Compromise](https://about.codecov.io/security-update/)**. Build pipeline compromise через подменённый Docker image; secrets из CI клиентов утекли.
- **[Reproducible Builds](https://reproducible-builds.org/)**. Movement и tooling за bit-for-bit reproducibility — основа для verifiable build attestations.
- **[OpenSSF Scorecard](https://github.com/ossf/scorecard)**. Automated assessment OSS репозиториев по security practices.
- **[The State of the Software Supply Chain](https://www.sonatype.com/state-of-the-software-supply-chain/introduction)** (Sonatype, ежегодно). Индустриальные данные о malicious packages, time-to-fix.

### Инструменты

- **Signing & verification:** [Sigstore](https://www.sigstore.dev/) (cosign / fulcio / rekor — keyless signing через OIDC). По моим наблюдениям, это де-факто стандарт на 2026 — заменяет long-lived GPG keys. [Notary v2](https://notaryproject.dev/), [GPG](https://gnupg.org/) (classic, для git commits), [SSH commit signing](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification) (новая опция, проще GPG).
- **SBOM generation:** [Syft](https://github.com/anchore/syft) (Anchore, генерация SPDX/CycloneDX), [cdxgen](https://github.com/CycloneDX/cdxgen) (CycloneDX-native), [Trivy](https://trivy.dev/) (SBOM + vuln scan), [GitHub dependency graph](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph).
- **SLSA-compliant build:** [SLSA GitHub Generator](https://github.com/slsa-framework/slsa-github-generator), [BuildKit с rootless mode](https://github.com/moby/buildkit), [Tekton Chains](https://github.com/tektoncd/chains), [Google Cloud Build with provenance](https://cloud.google.com/build/docs/securing-builds/view-build-provenance).
- **Admission control (verify-on-deploy):** [Cosign Policy Controller](https://docs.sigstore.dev/policy-controller/overview/), [Kyverno](https://kyverno.io/) (с verifyImages rule), [OPA Gatekeeper](https://open-policy-agent.github.io/gatekeeper/), [Connaisseur](https://github.com/sse-secure-systems/connaisseur).
- **Dependency management & hygiene:** [Renovate](https://docs.renovatebot.com/) / [Dependabot](https://github.com/dependabot) (auto-updates с cool-off), [Socket.dev](https://socket.dev/) (real-time анализ npm/pypi пакетов на supply chain risk), [Snyk](https://snyk.io/), [deps.dev](https://deps.dev/).
- **Registry security:** [Harbor](https://goharbor.io/) (signed images, Cosign verification, vuln scanning), [JFrog Artifactory](https://jfrog.com/artifactory/) (Xray), [GitHub Packages](https://docs.github.com/en/packages).
- **Reproducible builds:** [Nix](https://nixos.org/) / [NixOS](https://nixos.org/), [Bazel](https://bazel.build/) (hermetic builds), [Guix](https://guix.gnu.org/).

## Best practices

Главный публичный кейс — **xz-utils backdoor (CVE-2024-3094)**, обнаруженный Andres Freund в марте 2024. Атакующий («Jia Tan») провёл многолетнюю social engineering атаку на single-maintainer critical OSS project: построил доверие за несколько лет, стал co-maintainer, постепенно вставил backdoor в production releases. Обнаружено случайно — Freund заметил повышенный CPU в ssh handshake на личной машине и стал копать. Главный урок: даже идеальный pipeline не защитит от backdoor в upstream, если upstream сам скомпрометирован. Защита — dependency hygiene (избегать single-maintainer critical deps), maintained status (last commit / responsive maintainer), multi-maintainer requirements для critical paths, reproducible builds (xz backdoor работал именно потому, что build не был reproducible).

**Короткие правила:**

- **Signed commits + signed releases — обязательная база.** Signed commits (GPG / SSH / Sigstore gitsign) с verification в branch protection — первая защита от compromised developer credentials. Signed releases — гарантия consumers, что артефакт собран legitimate process. Cost — низкий (один раз настроить per-developer + CI), value — protection от целого класса инцидентов.
- **Pin everything by digest, not by tag.** `FROM node:18`, `uses: actions/checkout@v4`, `pip install foo==1.2.3` без hash — tags mutable, атакующий публикует malicious image с тем же tag. Digest immutable. Renovate / Dependabot обновляют digests автоматически. Cost — нулевой после automation; protection — большой.
- **Verify-on-deploy, не verify-on-build.** Между build и deploy артефакт может быть подменён (registry compromise, MITM). Admission controllers проверяют signature в момент deploy — unsigned/untrusted image не запустится. Trust boundary — deploy time, не build time.

Подробнее:

**Build environment как threat surface — ephemeral runners, OIDC federation, no long-lived secrets.** Self-hosted persistent runner с long-lived PAT в env — атакующий получает доступ ко всем последующим builds. OIDC federation выдаёт короткоживущий token per-workflow (TTL минуты), привязанный к specific repo/branch/workflow — украденный token бесполезен для другого pipeline. Ephemeral runners (GitHub-hosted, или self-hosted с clean state per job) — каждый build starts от clean slate. Это самый дешёвый и самый высокоимпактный сдвиг в supply chain security.

**SBOM как foundational artifact — генерируется per-build, attested, archived.** «SBOM сгенерируем когда compliance аудит попросит» — антипаттерн: без historical SBOM невозможно ответить «в какой версии артефакта был vulnerable package» — критично для incident response при обнаружении CVE через 6 месяцев после релиза. SBOM генерируется в CI как artifact каждого build (Syft / cdxgen), attached к release, archived с retention ≥1 год. Format — SPDX (ISO standard) или CycloneDX (богаче на metadata).

**Dependency confusion — реальный риск, защита через namespace reservation.** Internal package `mycompany-utils` существует только во внутреннем registry, public registry не проверяется. Атакующий публикует `mycompany-utils@99.0.0` в public npm/PyPI; resolver с fallback к public берёт его (higher version wins). Защита: scope в public registry (`@mycompany/utils` зарезервирован), strict resolver config (`registry=https://internal/`, no public fallback), либо allow-list через internal-mirror. Класс атак открыл Алекс Бирсан в феврале 2021: он выпустил пакеты с именами внутренних библиотек в публичные реестры и получил выполнение кода внутри Apple, Microsoft, PayPal, Shopify, Netflix, Tesla, Uber и ещё трёх десятков компаний, заработав на этом больше 130 тысяч долларов bug bounty. Обратите внимание, что от него не потребовалось ни одной уязвимости в обычном смысле слова — только имена внутренних пакетов, утёкшие в публичные артефакты.

## Связанные листья

- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — граница: VM реагирует на known CVE (что уже сломано); Supply Chain Security защищает процесс (где будущая уязвимость не успеет стать CVE). Оба используют SBOM как foundation.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — пересечение в OIDC federation и signing keys management. Centralized signing infrastructure = secrets-management discipline применённая к signing keys.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — supply chain — один из trust boundaries в DFD. SLSA Level выбирается с учётом threat model сервиса.
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — pipeline и есть основной surface для supply chain compromise. SLSA Level 2+ требует hosted build service.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — verify-on-deploy admission policies встроены в deployment pipeline.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — Terraform modules / Helm charts / Ansible roles тоже supply chain. Аналогичные практики: signed releases, pinned versions, SBOM.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — supply chain compromise — особый класс инцидентов: огромный blast radius, remediation требует revoke-and-rotate scope.
- **[Vendor Management](/The-Way-of-SRE/leaves/practices/vendor-management/)** — security-side зависимостей (этот лист) и reliability-side (vendor management) — соседние практики с общим vendor inventory.
- **[Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/)** — OIDC federation в CI убирает long-lived credentials в build pipeline; signed artifact ↔ workload identity, который собрал артефакт — часть SLSA chain.
- **[Compliance Frameworks](/The-Way-of-SRE/leaves/practices/compliance-frameworks/)** — SOC 2 / ISO 27001 vendor risk requirements + EU Cyber Resilience Act — первый regulatory mandate с конкретными supply chain requirements. Регламент вступил в силу 10 декабря 2024, но основные обязанности производителей начинают действовать только с 11 декабря 2027, а требования по отчётности об уязвимостях — с сентября 2026. То есть время подготовиться формально есть, и именно поэтому большинство команд к нему ещё не приступало.

## Открытые вопросы

- **Workload Identity** — выделен в отдельный лист (см. Связанные листья).
- **Compliance Frameworks** — выделен в отдельный лист.
- **Bug Bounty Program Economics** *(TBD)* — когда launch, scopes, payout structure. Уже в open questions из Vulnerability Management. Соседний лист.
- **Reproducible Builds** *(TBD)* — Bazel, Nix, Guix lineage; bit-for-bit determinism; cross-language challenges. Может быть отдельным листом под Programming / Scripting либо SLSA Level 4 подсекцией здесь.
- Я не знаю, какой baseline SLSA Level имеет смысл рекомендовать для среднестатистической команды на 2026. SLSA 1 слишком слабо (просто provenance), SLSA 3 уже требует non-forgeable build service. По моим наблюдениям, большинство останавливается где-то на SLSA 2 + cosign + SBOM — но это не явная позиция индустрии, а пока консенсус-по-факту.
