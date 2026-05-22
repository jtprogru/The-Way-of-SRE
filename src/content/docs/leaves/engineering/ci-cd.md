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

Если у вас pipeline 45 минут с flaky тестами — не показывайте мне диаграммы Continuous Delivery. Это уже не CI/CD, это batch-обработка с ритуалом. CI/CD — про **fast feedback** на каждый PR (≤10 минут до результата), **immutable artifacts** с явным versioning и **zero-trust** к flaky тестам. Это не «инструмент DevOps команды», а **платформа**, на которой стоят [Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/), [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/) и [GitOps](/The-Way-of-SRE/leaves/engineering/gitops/). Соседний лист к [Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/) под L1 `Programming / Scripting`.

## Что должен уметь

Главный навык на уровне L4 — настраивать pipeline сервиса с нуля так, чтобы он давал feedback на PR за 10 минут. Это не «прочитать туториал и сделать stages». Это понимать caching (dependencies, build artefacts, Docker layers), parallelism (тесты по shard'ам), fail-fast на ранних stages, и zero-tolerance к flaky тестам. Я регулярно вижу команды с 30-минутным pipeline, в котором 60% времени — повторное скачивание зависимостей.

- **L3** — Различает CI и CD; использует существующий pipeline сервиса: запускает job, читает логи, разбирается с failure, делает rerun. Знает branching strategy команды.
- **L3** — Пишет автоматизированные тесты в CI: unit, integration. Понимает test pyramid (см. [Test Strategy](/The-Way-of-SRE/leaves/engineering/test-strategy/)).
- **L4** — Настраивает pipeline сервиса с нуля: stages (build → test → security scan → deploy), artifact management (immutable, semantically versioned), environment progression. Pipeline-as-Code в репо сервиса, ревьюится через PR.
- **L4** — Применяет trunk-based development: small frequent commits в main, feature flags для незаконченной функциональности, branch lifetime — часы/дни. Знает trade-off против GitFlow.
- **L4** — Управляет secrets в pipeline безопасно: OIDC federation вместо long-lived access keys; scoping; маскирование в логах.
- **L5** — Проектирует CI/CD как **платформу команды/организации**: shared templates, golden paths для типовых сервисов, self-service onboarding.
- **L5** — Оптимизирует pipeline performance: caching, parallelism, fail-fast, flaky тесты в quarantine. Целевая длительность — **≤ 10 минут до feedback на PR**.
- **L5** — Использует DORA метрики как health indicator: deployment frequency, lead time for changes, change failure rate, MTTR. Понимает, что **все четыре одновременно** — иначе Goodhart's law ломает оптимизацию.
- **L6+** — Проектирует deployment governance в крупных организациях: regulatory constraints (SOX / PCI-DSS / GDPR), журнал аудита, signed artifacts (Sigstore / cosign), SLSA / SBOM, reproducible builds. CI/CD становится compliance-инструментом.

## Материалы

### Книги

- Jez Humble, David Farley — **[Continuous Delivery](https://www.amazon.com/Continuous-Delivery-Deployment-Automation-Addison-Wesley/dp/0321601912)** (Addison-Wesley, 2010). Каноническая книга, которая ввела сам термин. Актуальна по принципам (build once / immutable artefacts / pipeline as automation of value stream).
- Nicole Forsgren, Jez Humble, Gene Kim — **[Accelerate](https://itrevolution.com/product/accelerate/)** (IT Revolution, 2018). Эмпирическое исследование DORA. Обоснование, почему четыре метрики работают вместе.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — **[The DevOps Handbook](https://itrevolution.com/product/the-devops-handbook-second-edition/)** (IT Revolution, 2-е изд., 2021). Прикладной guide: как внедрять CI/CD в существующей организации; case studies.

### Статьи и доклады

- DORA — **[DORA State of DevOps Report](https://dora.dev/research/)**. Ежегодное исследование. Используйте для калибровки команды против индустрии (elite / high / medium / low performers).
- Paul Hammant — **[trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/)**. Полный reference-сайт по trunk-based development; альтернатива GitFlow с обоснованием.
- Mike Bland — **[Goto Fail, Heartbleed, and Unit Testing Culture](https://martinfowler.com/articles/testing-culture.html)** (martinfowler.com). Почему unit tests без культуры их писать — бесполезны.
- SLSA project — **[SLSA Framework](https://slsa.dev/)**. Supply chain integrity levels (1–4); см. [Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/).

### Инструменты

- **GitHub Actions / GitLab CI / Jenkins / CircleCI / Buildkite / Drone** — execution engines. Выбор обычно следует за platform-выбором (GitHub → Actions; self-hosted Git → Jenkins или Drone). Pipeline-as-Code должен переноситься между ними с разумным усилием.
- **[Sigstore](https://www.sigstore.dev/) / [cosign](https://github.com/sigstore/cosign)** — keyless signing артефактов через short-lived certs.
- **[Renovate](https://docs.renovatebot.com/) / [Dependabot](https://github.com/dependabot)** — automated dependency updates через PR. По моим наблюдениям, в зрелых командах настройка либо одного, либо другого — стандарт; dependency drift = дыры безопасности.
- **[Buildkite Test Engine](https://buildkite.com/test-engine) / [Datadog CI Visibility](https://docs.datadoghq.com/continuous_integration/)** — pipeline observability: trends по длительности билда, flaky-test detection, DORA из самого pipeline.
- **[trunk.io](https://trunk.io/) / [pre-commit](https://pre-commit.com/)** — linter/formatter aggregation. Гоняется локально и в CI — экономит время на ревью «trailing whitespace».
- **[Argo Workflows](https://argo-workflows.readthedocs.io/) / [Tekton](https://tekton.dev/)** — Kubernetes-native CI/CD. Подходит, когда pipeline сам по себе сложный distributed workflow (ML training, multi-cluster deploy).

## Best practices

Главный публичный кейс — **DORA State of DevOps Report** (Forsgren / Humble / Kim, 2014–настоящее). Эмпирически показано: команды-elite performers деплоят несколько раз в день, lead time часы, change failure rate 0–15%, MTTR минуты. Low performers — раз в месяц, lead time месяцы, change failure rate 16–30%, MTTR дни. Разница не «чуть лучше» — порядки величин. И что важно для CI/CD-планирования: **эти команды не оптимизировали одну метрику** — все четыре растут вместе, потому что они выводятся из одной и той же инженерной дисциплины. Если в команде кто-то предлагает «давайте увеличим deployment frequency, остальное потом» — это путь к Goodhart's law: ускорите deploys без тестов, change failure rate взлетит.

**Короткие правила:**

- **CI должен быть быстрым (≤ 10 минут до feedback) и надёжным; флэйки запрещены.** Pipeline 45 минут с flaky тестами разработчики игнорируют, контекст-свитчат, обратная связь теряется. Целевая длительность — ≤ 10 минут через parallelism + caching. Flaky test → немедленно в quarantine с тикетом на fix.
- **Pipeline-as-Code в репо сервиса, не клики в UI.** Pipeline настроен через UI — невоспроизводимо, нельзя ревьюить, нельзя версионировать с кодом. Pipeline-as-Code (`.github/workflows/`, `Jenkinsfile`) в том же репо: ревью через PR, версионирование, история.
- **Trunk-based development, не long-lived feature branches.** Feature branch живёт 3 недели → merge hell, integration тестируется только перед мержем. Trunk-based: small frequent commits в main (часы/дни жизни branch), feature flags скрывают незаконченное. Это **enabler** для progressive delivery.

Подробнее:

**Secrets в pipeline через OIDC federation, а не long-lived tokens.** GitHub Actions secret = long-lived AWS access key — утечка из логов означает постоянный доступ к prod cloud account. OIDC federation: pipeline получает short-lived token для конкретного job (TTL минуты), не хранится после job. GitHub Actions / GitLab CI / CircleCI / Buildkite поддерживают; AWS / GCP / Azure поддерживают со своей стороны (`AssumeRoleWithWebIdentity` / Workload Identity Federation). Это самый дешёвый сдвиг в supply chain security.

**Failed deployment ≠ катастрофа; rollback < roll-forward по умолчанию.** Страх deploy → редкие большие релизы → catastrophic failures. Зрелый pipeline: immutable artifacts с явным versioning, easy rollback (одна команда возвращает предыдущий tag), auto-rollback по health gates. Deployment frequency — health indicator: команды, деплоящие несколько раз в день, восстанавливаются быстрее команд с monthly release (DORA Accelerate). Это не корреляция, это causation через одни и те же практики.

**DORA метрики измеряют, но не оптимизируйте за счёт качества.** «Увеличим deployment frequency» → отключают тесты → change failure rate взлетает. Goodhart's law в чистом виде: метрика, ставшая целью, перестаёт быть метрикой. Дашборд DORA — все 4 числа рядом, не порознь. Один растёт за счёт другого — сигнал, что улучшения иллюзорны.

**Supply chain security: signed artifacts + SBOM по умолчанию.** SBOM (Software Bill of Materials) станет обязательным в регулируемых индустриях (EU CRA уже в силе с 2024). Signed artifacts (cosign / Sigstore) ловят tampering между build и deploy. SLSA framework даёт явные уровни зрелости — см. [Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/) для деталей.

## Связанные листья

- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — CI/CD как платформа для canary / blue-green / feature flags. Невозможны без надёжного pipeline и trunk-based development.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC изменения проходят через CI/CD: plan stage даёт preview, apply gated approval'ом.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — Git как source of truth + CI/CD как execution engine.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — тесты, линтеры, build всех языков — часть pipeline.
- **[Test Strategy](/The-Way-of-SRE/leaves/engineering/test-strategy/)** — пара к CI/CD: тесты live в pipeline; без strategy CI green = false confidence.
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — SLSA, Sigstore, SBOM, ephemeral runners. CI/CD pipeline — главный surface для supply chain.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — OIDC; CI/CD — один из главных контекстов потенциальной утечки.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service team owns its pipeline; не «централизованный DevOps team настраивает за всех».

## Открытые вопросы

- **Supply Chain Security** *(TBD)* — отдельный лист про SLSA framework, Sigstore, SBOM. Сосед к Vulnerability Management.
- **Pre-Deployment Review** *(TBD)* — production readiness review как gate в pipeline.
- **DORA Metrics как отдельная практика** — FOUR KEYS как самостоятельная measurement practice (definitions, dashboards, anti-gaming) может стать листом под Measurement L1 в Culture.
- **Build Reproducibility / Hermetic Builds** — отдельная подтема (deterministic builds, Bazel-style, locked deps).
