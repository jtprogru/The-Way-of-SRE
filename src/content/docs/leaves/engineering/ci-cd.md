---
title: CI/CD
description: Pipeline сборки и доставки кода как кодовый артефакт; платформа для progressive delivery, IaC, GitOps
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Programming / Scripting / CI/CD
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Если pipeline настолько медленный и нестабильный, что разработчики переключаются на другую работу до результата, диаграмма Continuous Delivery уже мало что объясняет. [CI/CD](/The-Way-of-SRE/glossary/#ci-cd) — про измеримую скорость обратной связи, **immutable artifacts** с явным versioning и системную работу с flaky tests. Это не «инструмент DevOps команды», а **платформа**, на которой стоят [Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/), [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/) и [GitOps](/The-Way-of-SRE/leaves/engineering/gitops/). Соседний лист к [Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/) под L1 `Programming / Scripting`.

## Что должен уметь

Главный навык на уровне L4 — настраивать pipeline сервиса с нуля и укладываться в согласованный командой target обратной связи, измеряя не только среднее, но и хвост распределения. Это не «прочитать туториал и сделать stages». Это понимать caching (dependencies, build artefacts, Docker layers), parallelism (тесты по shard'ам), fail-fast на ранних stages и системно устранять flaky tests.

**L3**
- Различает CI и CD; использует существующий pipeline сервиса: запускает job, читает логи, разбирается с failure, делает rerun. Знает branching strategy команды.
- Пишет автоматизированные тесты в CI: unit, integration. Понимает test pyramid (см. [Test Strategy](/The-Way-of-SRE/leaves/engineering/test-strategy/)).

**L4**
- Настраивает pipeline сервиса с нуля: stages (build → test → security scan → deploy), artifact management (immutable, semantically versioned), environment progression. Pipeline-as-Code в репо сервиса, ревьюится через PR.
- Применяет trunk-based development: small frequent commits в main, feature flags для незаконченной функциональности, branch lifetime — часы/дни. Знает trade-off против GitFlow.
- Управляет secrets в pipeline безопасно: OIDC federation вместо long-lived access keys; scoping; маскирование в логах.

**L5**
- Проектирует CI/CD как **платформу команды/организации**: shared templates, golden paths для типовых сервисов, self-service onboarding.
- Оптимизирует pipeline performance: caching, parallelism, fail-fast, flaky тесты в quarantine. Target длительности выводит из baseline и потребностей команды, а не из универсального числа.
- Использует пять текущих DORA-метрик как совместный health indicator: change lead time, deployment frequency, failed deployment recovery time, change fail rate и deployment rework rate.

**L6+**
- Проектирует deployment governance в крупных организациях: regulatory constraints (SOX / PCI-DSS / GDPR), журнал аудита, signed artifacts (Sigstore / cosign), SLSA / SBOM, reproducible builds. CI/CD становится compliance-инструментом.

## Материалы

### Книги

- Jez Humble, David Farley — **[Continuous Delivery](https://www.amazon.com/Continuous-Delivery-Deployment-Automation-Addison-Wesley/dp/0321601912)** (Addison-Wesley, 2010). Каноническая книга, которая ввела сам термин. Актуальна по принципам (build once / immutable artefacts / pipeline as automation of value stream).
- Nicole Forsgren, Jez Humble, Gene Kim — **[Accelerate](https://itrevolution.com/product/accelerate/)** (IT Revolution, 2018). Эмпирическая основа исходной четырёхметричной модели DORA; актуальный состав метрик сверяется с текущим руководством DORA.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — **[The DevOps Handbook](https://itrevolution.com/product/the-devops-handbook-second-edition/)** (IT Revolution, 2-е изд., 2021). Прикладной guide: как внедрять CI/CD в существующей организации; case studies.

### Статьи и доклады

- DORA — **[Software delivery performance metrics](https://dora.dev/guides/dora-metrics/)**. Актуальные определения пяти метрик, их область применения и типовые ошибки измерения.
- Paul Hammant — **[trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/)**. Полный reference-сайт по trunk-based development; альтернатива GitFlow с обоснованием.
- Mike Bland — **[Goto Fail, Heartbleed, and Unit Testing Culture](https://martinfowler.com/articles/testing-culture.html)** (martinfowler.com). Почему unit tests без культуры их писать — бесполезны.
- SLSA project — **[SLSA specification v1.2](https://slsa.dev/spec/v1.2/)**. Текущие Build и Source tracks; старая единая шкала 1–4 больше не описывает актуальную спецификацию. См. [Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/).

### Инструменты

- **GitHub Actions / GitLab CI / Jenkins / CircleCI / Buildkite / Drone** — execution engines. Выбор обычно следует за platform-выбором (GitHub → Actions; self-hosted Git → Jenkins или Drone). Pipeline-as-Code должен переноситься между ними с разумным усилием.
- **[Sigstore](https://www.sigstore.dev/) / [cosign](https://github.com/sigstore/cosign)** — keyless signing артефактов через short-lived certs.
- **[Renovate](https://docs.renovatebot.com/) / [Dependabot](https://github.com/dependabot)** — automated dependency updates через PR. По моим наблюдениям, в зрелых командах настройка либо одного, либо другого — стандарт; dependency drift = дыры безопасности.
- **[Buildkite Test Engine](https://buildkite.com/test-engine) / [Datadog CI Visibility](https://docs.datadoghq.com/continuous_integration/)** — pipeline observability: trends по длительности билда, flaky-test detection, DORA из самого pipeline.
- **[trunk.io](https://trunk.io/) / [pre-commit](https://pre-commit.com/)** — linter/formatter aggregation. Гоняется локально и в CI — экономит время на ревью «trailing whitespace».
- **[Argo Workflows](https://argo-workflows.readthedocs.io/) / [Tekton](https://tekton.dev/)** — Kubernetes-native CI/CD. Подходит, когда pipeline сам по себе сложный distributed workflow (ML training, multi-cluster deploy).

## Best practices

Актуальное руководство DORA группирует пять метрик в throughput и instability и отдельно предупреждает против оптимизации одного показателя или соревнования между командами. Для CI/CD это полезная проверка границ: изменение pipeline оценивается не только по частоте deploy, но и по recovery, failed changes и незапланированному rework.

**Короткие правила:**

- **CI должен укладываться в измеримый target обратной связи и быть надёжным.** Универсального десятиминутного порога нет: команда фиксирует baseline, p50/p95 и целевое улучшение. Flaky test изолируется с владельцем и сроком исправления, чтобы rerun не маскировал качество pipeline.
- **Pipeline-as-Code в репо сервиса, не клики в UI.** Pipeline настроен через UI — невоспроизводимо, нельзя ревьюить, нельзя версионировать с кодом. Pipeline-as-Code (`.github/workflows/`, `Jenkinsfile`) в том же репо: ревью через PR, версионирование, история.
- **Trunk-based development, не long-lived feature branches.** Feature branch живёт 3 недели → merge hell, integration тестируется только перед мержем. Trunk-based: small frequent commits в main (часы/дни жизни branch), feature flags скрывают незаконченное. Это **enabler** для progressive delivery.

Подробнее:

**Secrets в pipeline через OIDC federation, а не long-lived tokens.** GitHub Actions secret = long-lived AWS access key — утечка из логов означает постоянный доступ к prod cloud account. OIDC federation: pipeline получает short-lived token для конкретного job (TTL минуты), не хранится после job. GitHub Actions / GitLab CI / CircleCI / Buildkite поддерживают; AWS / GCP / Azure поддерживают со своей стороны (`AssumeRoleWithWebIdentity` / Workload Identity Federation). Это самый дешёвый сдвиг в supply chain security.

**Failed deployment ≠ катастрофа; rollback и roll-forward — заранее спроектированные пути.** Зрелый pipeline хранит immutable artifacts с явным versioning, проверяет health gates и позволяет быстро выбрать безопасное восстановление. DORA показывает связь скорости и стабильности на уровне результатов, но отдельный дашборд не доказывает причинность конкретного изменения pipeline.

**DORA-метрики измеряют, но не заменяют цель продукта.** «Увеличим deployment frequency» без проверки instability создаёт стимул оптимизировать счётчик. На дашборде рядом живут все пять текущих метрик и версия их определений.

**Supply chain security: signed artifacts + SBOM по умолчанию.** Конкретные обязательства и даты зависят от применимого регулирования. Signed artifacts и SBOM дают проверяемые данные о происхождении и составе; актуальные tracks SLSA разобраны в [Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/).

## Связанные листья

- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — CI/CD как платформа для canary / blue-green / feature flags. Невозможны без надёжного pipeline и trunk-based development.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC изменения проходят через CI/CD: plan stage даёт preview, apply gated approval'ом.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — Git как source of truth + CI/CD как execution engine.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — тесты, линтеры, build всех языков — часть pipeline.
- **[Test Strategy](/The-Way-of-SRE/leaves/engineering/test-strategy/)** — пара к CI/CD: тесты live в pipeline; без strategy CI green = false confidence.
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — SLSA, Sigstore, SBOM, ephemeral runners. CI/CD pipeline — главный surface для supply chain.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — OIDC; CI/CD — один из главных контекстов потенциальной утечки.
- **[Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/)** — OIDC federation в pipeline убирает long-lived cloud credentials из repo secrets; pipeline получает короткоживущий STS-токен per workflow.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service team owns its pipeline; не «централизованный DevOps team настраивает за всех».
- **[Change Governance](/The-Way-of-SRE/leaves/practices/change-governance/)** — PRR / production readiness review реализуется как gate в pipeline; classification standard / normal change опирается на pipeline-level evidence.

## Открытые вопросы

- **Supply Chain Security** — уже выделена в отдельный лист (см. Связанные листья).
- **DORA Metrics** уже выделена в отдельный лист (см. Связанные листья).
- **Build Reproducibility / Hermetic Builds** — отдельная подтема (deterministic builds, Bazel-style, locked deps).
