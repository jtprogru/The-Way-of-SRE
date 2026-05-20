---
title: CI/CD
description: Pipeline сборки, тестов и доставки кода в production как кодовый артефакт. Continuous Integration (быстрый merge в trunk с автотестами) и Continuous Delivery / Deployment (артефакт всегда releaseable, deploy частый и низкорисковый). Платформа, на которой работают progressive delivery, IaC, GitOps
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Programming / Scripting / CI/CD
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Pipeline сборки, тестов и доставки кода в production как **кодовый артефакт** (а не настройки в UI). Continuous Integration — частый merge в trunk с автотестами; Continuous Delivery — артефакт всегда releaseable; Continuous Deployment — каждый успешный pipeline идёт в prod. Не «инструмент DevOps команды», а **платформа**, на которой стоят [Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/), [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/) и [GitOps](/The-Way-of-SRE/leaves/engineering/gitops/). Соседний лист к [Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/) под L1 `Programming / Scripting`.

## Что должен уметь

- **L3** — Различает CI и CD; использует существующий pipeline своего сервиса: запускает job, читает логи, разбирается с failure, делает rerun. Знает branching strategy команды (trunk-based / GitFlow / feature branches) и где это документировано.
- **L3** — Пишет автоматизированные тесты, которые запускаются в CI: unit, integration. Понимает test pyramid (много unit / меньше integration / мало e2e); не «тесты для проформы», а ловят реальные баги до merge.
- **L4** — Настраивает pipeline сервиса с нуля: stages (build → test → security scan → deploy), artifact management (immutable, semantically versioned), environment progression (dev → staging → prod). Pipeline-as-Code (`.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`, `.circleci/config.yml`) — в репо сервиса, ревьюится через PR.
- **L4** — Применяет trunk-based development: small frequent commits в main, feature flags для незаконченной функциональности, branch lifetime — часы/дни, не недели. Знает trade-off против GitFlow и почему long-lived branches масштабно проблематичны (merge hell, дрейф интеграции).
- **L4** — Управляет secrets в pipeline безопасно: OIDC federation вместо long-lived access keys; scoping (минимум прав); маскирование в логах; запрет echo секрета даже на debug. Знает, какие токены ротируются автоматически.
- **L5** — Проектирует CI/CD как **платформу команды/организации**: shared templates (reusable workflows / Jenkins shared libraries / GitLab CI includes), golden paths для типовых сервисов, self-service onboarding для новой команды. Pipeline templates версионируются и имеют явных owners.
- **L5** — Оптимизирует pipeline performance: caching (dependencies, build artefacts, Docker layers), parallelism (по тестовым shard'ам / по сервисам в монорепо), fail-fast на ранних stages, флэйковые тесты немедленно в quarantine. Целевая длительность CI для типового сервиса — **≤ 10 минут до feedback'а на PR**.
- **L5** — Использует DORA метрики как health indicator: deployment frequency, lead time for changes, change failure rate, MTTR (Time to Restore Service). Понимает, что **все четыре одновременно** — иначе оптимизация одной метрики ломает другие (Goodhart's law).
- **L6+** — Проектирует deployment governance в крупных организациях: regulatory constraints (SOX / PCI-DSS / GDPR), audit trails, signed artifacts (Sigstore / cosign), supply chain attestations (SLSA framework, SBOM), reproducible / hermetic builds. CI/CD становится compliance-инструментом, не только delivery-инструментом.

## Материалы

### Книги

- Jez Humble, David Farley — **[Continuous Delivery](https://www.amazon.com/Continuous-Delivery-Deployment-Automation-Addison-Wesley/dp/0321601912)** (Addison-Wesley, 2010). **База.** Каноническая книга, которая ввела сам термин. До сих пор актуальна по принципам (build once / immutable artefacts / pipeline as automation of value stream) — даже если инструменты сменились.
- Nicole Forsgren, Jez Humble, Gene Kim — **[Accelerate](https://itrevolution.com/product/accelerate/)** (IT Revolution, 2018). **База.** Эмпирическое исследование DORA: что отличает high-performers от low-performers. Книга — обоснование, почему четыре DORA-метрики работают вместе.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — **[The DevOps Handbook](https://itrevolution.com/product/the-devops-handbook-second-edition/)** (IT Revolution, 2-е изд., 2021). **Дополнительно.** Прикладной guide: как внедрять CI/CD практики в существующей организации; case studies (Netflix, Google, Amazon).

### Статьи и доклады

- DORA — **[DORA State of DevOps Report](https://dora.dev/research/)**. **База.** Ежегодное исследование с обновляемыми бенчмарками по DORA метрикам. Используйте для калибровки своей команды против индустрии (elite / high / medium / low performers).
- Paul Hammant — **[trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/)**. **База.** Полный referenсe-сайт по trunk-based development: branching patterns, feature flags, scaling до больших команд. Альтернатива GitFlow с обоснованием.
- Mike Bland (ex-Google) — **[Goto Fail, Heartbleed, and Unit Testing Culture](https://martinfowler.com/articles/testing-culture.html)** (martinfowler.com). **Дополнительно.** Кейс из жизни — почему unit tests без culture их писать = бесполезны. Хороший аргумент при ревью pipeline без тестов.
- SLSA project — **[SLSA Framework](https://slsa.dev/)**. **Продвинуто.** Supply chain integrity levels (SLSA 1–4); фреймворк для оценки зрелости supply chain security в CI/CD pipeline.

### Инструменты

- **GitHub Actions / GitLab CI / Jenkins / CircleCI / Buildkite / Drone** — execution engines. Выбор обычно следует за platform-выбором (GitHub → Actions; self-hosted Git → Jenkins или Drone). Pipeline-as-Code должен переноситься между ними с разумным усилием.
- **[Sigstore](https://www.sigstore.dev/) / [cosign](https://github.com/sigstore/cosign)** — keyless signing артефактов через short-lived certs (Fulcio CA). Заменяет long-lived GPG keys. Поддержка signed images, signed SBOM, signed attestations.
- **[Renovate](https://docs.renovatebot.com/) / [Dependabot](https://github.com/dependabot)** — automated dependency updates через PR. Не CI/CD как таковая, но критическая часть здорового pipeline: dependency drift → дыры безопасности.
- **[Buildkite Test Engine](https://buildkite.com/test-engine) / [Datadog CI Visibility](https://docs.datadoghq.com/continuous_integration/)** — pipeline observability: trends по длительности билда, flaky-test detection, DORA metrics из самого pipeline.
- **[trunk.io](https://trunk.io/) / [pre-commit](https://pre-commit.com/)** — linter/formatter aggregation. Гоняется локально (pre-commit hook) и в CI (как одна job) — экономит время на ревью «trailing whitespace».
- **[Argo Workflows](https://argo-workflows.readthedocs.io/) / [Tekton](https://tekton.dev/)** — Kubernetes-native CI/CD. Подходит, когда pipeline сам по себе сложный distributed workflow (ML training, multi-cluster deploy).

## Best practices

- **CI должен быть быстрым (≤10 минут до feedback) и надёжным; флэйки запрещены.** Антипаттерн: pipeline 45 минут с flaky тестами. Разработчики его игнорируют, контекст-свитчат, обратная связь теряется, баги доходят до прода. Целевая длительность — ≤10 минут на PR feedback (через parallelism + caching); zero-tolerance к flaky тестам: flaky test → немедленно в quarantine с тикетом на fix, не игнорируется как «иногда падает».
- **Pipeline-as-Code в репо сервиса, не клики в UI.** Антипаттерн: pipeline настроен через Jenkins UI / GitLab Settings — невоспроизводимо, нельзя ревьюить, нельзя версионировать вместе с кодом. Pipeline-as-Code (`.github/workflows/`, `Jenkinsfile`) в том же репо, где код: ревью через PR, версионирование, история изменений; новый сервис копирует существующий golden-path шаблон.
- **Trunk-based development, не long-lived feature branches.** Антипаттерн: feature branch живёт 3 недели, merge hell на ревью, integration тестируется только перед мержем. Trunk-based: small frequent commits в main (часы/дни жизни branch), feature flags скрывают незаконченное от prod, deploy ≠ release. Это **enabler** для progressive delivery — без trunk-based canary не имеет смысла.
- **Secrets в pipeline через OIDC federation, а не long-lived tokens.** Антипаттерн: GitHub Actions secret = long-lived AWS access key. Утечка из логов → постоянный доступ к prod cloud account. OIDC federation: pipeline получает short-lived token для конкретного job (TTL минуты), не хранится после job. GitHub Actions / GitLab CI / CircleCI / Buildkite поддерживают; AWS / GCP / Azure поддерживают со своей стороны (`AssumeRoleWithWebIdentity` / Workload Identity Federation).
- **Failed deployment ≠ катастрофа; rollback < roll-forward по умолчанию.** Антипаттерн: страх deploy → редкие большие релизы → catastrophic failures. Зрелый pipeline: immutable artifacts с явным версионированием, easy rollback (одна команда / клик возвращает предыдущий tag), auto-rollback по health gates интегрирован в progressive delivery. Deployment frequency — health indicator: команды, деплоящие несколько раз в день, восстанавливаются быстрее команд с monthly release (DORA Accelerate).
- **DORA метрики измеряют, но не оптимизируйте за счёт качества.** Антипаттерн: «увеличим deployment frequency» → отключают тесты → change failure rate взлетает. DORA-набор сбалансирован: deployment frequency + lead time for changes + change failure rate + MTTR — **все четыре одновременно**. Иначе срабатывает Goodhart's law: метрика, ставшая целью, перестаёт быть метрикой. Дашборд DORA — все 4 числа рядом, не порознь.
- **Supply chain security: signed artifacts + SBOM по умолчанию.** Антипаттерн: pulled unsigned images from random Docker Hub. SBOM (Software Bill of Materials) станет обязательным в регулируемых индустриях (EU CRA, US executive orders). Signed artifacts (cosign / Sigstore) ловят tampering между build и deploy. SLSA framework даёт явные уровни зрелости — выбирайте target level и идите к нему пошагово.

## Связанные листья

- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — CI/CD — **платформа**, на которой работает progressive delivery. Canary / blue-green / feature flags невозможны без надёжного pipeline и trunk-based development.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC изменения проходят через CI/CD pipeline: plan stage даёт preview, apply gated approval'ом, drift detection как scheduled job.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — Git как source of truth + CI/CD как execution engine (либо отдельный reconciler как Argo CD / Flux, но всё равно CI генерирует декларацию из кода).
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — тесты, линтеры, build всех языков — часть pipeline. Хороший pipeline безопасно поддерживает несколько языков с минимумом дублирования (shared templates).
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — CI/CD — крупный класс automation, reducing toil (manual builds, manual deploys, manual env setup); зрелый pipeline убирает целую категорию рутинных задач.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — secrets в pipeline через OIDC; scoping; маскирование в логах. CI/CD — один из главных контекстов потенциальной утечки секретов.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service team owns its pipeline. Не «централизованный DevOps team настраивает pipeline для всех», а команда сервиса владеет и эволюционирует свой pipeline на основе golden-path шаблонов.

## Открытые вопросы

- **Test Strategy / Test Automation** *(TBD)* — глубокая самостоятельная тема: test pyramid в деталях, contract testing (Pact), e2e strategy, snapshot testing, mutation testing. Отдельный лист.
- **Supply Chain Security** *(TBD)* — отдельный лист про SLSA framework, Sigstore, SBOM generation/consumption, dependency scanning, transitive vulnerabilities. Сосед к Vulnerability Management (Information Security L1).
- **Pre-Deployment Review** *(TBD)* — production readiness review как gate в pipeline. Сосед к Progressive Delivery под Change Management L1.
- **DORA Metrics как отдельная практика** — этот лист covers базовое использование DORA, но FOUR KEYS как самостоятельная measurement practice (definitions, dashboards, anti-gaming) может стать листом под Measurement L1 в Culture.
- **Build Reproducibility / Hermetic Builds** — отдельная подтема (deterministic builds, Bazel-style hermetic compilation, locked deps). Возможно соседний лист.
