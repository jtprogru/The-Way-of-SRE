---
title: CI/CD
description: Pipeline сборки и доставки кода как кодовый артефакт; платформа для progressive delivery, IaC, GitOps
sfia: [3, 4, 5, 6]
status: draft
---

Я регулярно вижу pipeline, настолько медленный и нестабильный, что разработчик успевает переключиться на другую задачу раньше, чем придёт результат. Диаграмма Continuous Delivery тут уже ничего не объясняет. [CI/CD](/The-Way-of-SRE/glossary/#ci-cd) — про измеримую скорость обратной связи, **immutable artifacts** с явным versioning и системную работу с flaky tests. Это не «инструмент DevOps команды», а **платформа**, на которой стоят [Progressive Delivery](/The-Way-of-SRE/practices/progressive-delivery/), [Infrastructure as Code](/The-Way-of-SRE/engineering/infrastructure-as-code/) и [GitOps](/The-Way-of-SRE/engineering/gitops/). Соседний лист к [Programming Languages](/The-Way-of-SRE/engineering/programming-languages/) под L1 `Programming / Scripting`.

## Что должен уметь

Главный навык на уровне L4 — настраивать pipeline сервиса с нуля и укладываться в согласованный командой target обратной связи, измеряя не только среднее, но и хвост распределения. Это не «прочитать туториал и сделать stages». Это понимать caching (dependencies, build artefacts, Docker layers), parallelism (тесты по shard'ам), fail-fast на ранних stages и системно устранять flaky tests.

**L3**
- Различает CI и CD; использует существующий pipeline сервиса: запускает job, читает логи, разбирается с failure, делает rerun. Знает branching strategy команды.
- Пишет автоматизированные тесты в CI: unit, integration. Понимает test pyramid (см. [Test Strategy](/The-Way-of-SRE/engineering/test-strategy/)).

**L4**
- Настраивает pipeline сервиса с нуля: stages (build → test → security scan → deploy), artifact management (immutable, semantically versioned), environment progression. Pipeline-as-Code в репо сервиса, ревьюится через PR.
- Применяет trunk-based development: small frequent commits в main, feature flags для незаконченной функциональности, branch lifetime — часы/дни. Знает trade-off против GitFlow.
- Управляет secrets в pipeline безопасно: OIDC federation вместо long-lived access keys; scoping; маскирование в логах.

**L5**
- Проектирует CI/CD как **платформу команды/организации**: shared templates, golden paths для типовых сервисов, self-service onboarding.
- Оптимизирует pipeline performance: caching, parallelism, fail-fast, flaky тесты в quarantine. Target длительности выводит из baseline и потребностей команды, а не из универсального числа.
- Использует пять текущих DORA-метрик как совместный health indicator: change lead time, deployment frequency, failed deployment recovery time, change fail rate и deployment rework rate.

**L6+**
- Проектирует deployment governance в крупных организациях: regulatory constraints (SOX / PCI-DSS / GDPR), журнал аудита, signed artifacts (Sigstore / cosign), SLSA / SBOM, reproducible builds. CI/CD превращается в инструмент compliance.

## Материалы

### Книги

- Jez Humble, David Farley — **[Continuous Delivery](https://www.amazon.com/Continuous-Delivery-Deployment-Automation-Addison-Wesley/dp/0321601912)** (Addison-Wesley, 2010). Каноническая книга, которая ввела сам термин. Актуальна по принципам (build once / immutable artefacts / pipeline as automation of value stream).
- Nicole Forsgren, Jez Humble, Gene Kim — **[Accelerate](https://itrevolution.com/product/accelerate/)** (IT Revolution, 2018). Эмпирическая основа исходной четырёхметричной модели DORA; актуальный состав метрик сверяется с текущим руководством DORA.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — **[The DevOps Handbook](https://itrevolution.com/product/the-devops-handbook-second-edition/)** (IT Revolution, 2-е изд., 2021). Прикладной guide: как внедрять CI/CD в существующей организации; case studies.

### Статьи и доклады

- DORA — **[Software delivery performance metrics](https://dora.dev/guides/dora-metrics/)**. Актуальные определения пяти метрик, их область применения и типовые ошибки измерения.
- Paul Hammant — **[trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/)**. Полный справочный сайт по trunk-based development; альтернатива GitFlow с обоснованием.
- Mike Bland — **[Goto Fail, Heartbleed, and Unit Testing Culture](https://martinfowler.com/articles/testing-culture.html)** (martinfowler.com). Почему unit tests без культуры их писать — бесполезны.
- SLSA project — **[SLSA specification v1.2](https://slsa.dev/spec/v1.2/)**. Текущие Build и Source tracks; старая единая шкала 1–4 больше не описывает актуальную спецификацию. См. [Supply Chain Security](/The-Way-of-SRE/practices/supply-chain-security/).

### Инструменты

- **GitHub Actions / GitLab CI / Jenkins / CircleCI / Buildkite / Drone** — execution engines. Выбор обычно следует за выбором платформы (GitHub → Actions; self-hosted Git → Jenkins или Drone). Pipeline-as-Code должен переноситься между ними с разумным усилием.
- **[Sigstore](https://www.sigstore.dev/) / [cosign](https://github.com/sigstore/cosign)** — keyless signing артефактов через short-lived certs.
- **[Renovate](https://docs.renovatebot.com/) / [Dependabot](https://github.com/dependabot)** — automated dependency updates через PR. По моим наблюдениям, в зрелых командах настройка либо одного, либо другого — стандарт; dependency drift = дыры безопасности.
- **[Buildkite Test Engine](https://buildkite.com/test-engine) / [Datadog CI Visibility](https://docs.datadoghq.com/continuous_integration/)** — pipeline observability: trends по длительности билда, flaky-test detection, DORA из самого pipeline.
- **[trunk.io](https://trunk.io/) / [pre-commit](https://pre-commit.com/)** — linter/formatter aggregation. Гоняется локально и в CI — экономит время на ревью «trailing whitespace».
- **[Argo Workflows](https://argo-workflows.readthedocs.io/) / [Tekton](https://tekton.dev/)** — Kubernetes-native CI/CD. Подходит, когда pipeline сам по себе сложный distributed workflow (ML training, multi-cluster deploy).

## Best practices

Актуальное руководство DORA группирует пять метрик в throughput и instability и отдельно предупреждает: не оптимизируйте один показатель и не устраивайте соревнование между командами. Для CI/CD это удобная проверка границ. Изменение pipeline оценивается не только по частоте деплоя, но и по времени восстановления, доле неудачных изменений и незапланированному rework.

Дальше три вещи, без которых остальное не держится. Порядок неслучаен.

Первая — скорость и надёжность самого CI. Универсального «десять минут» не существует: команда фиксирует baseline, смотрит p50 и p95, договаривается, куда двигаться. Дальше важнее другое. Flaky test не перезапускается до зелёного — он изолируется, получает владельца и срок, потому что иначе rerun превращается в способ не видеть, что pipeline сломан.

Вторая — pipeline живёт кодом. Настроенный мышкой в UI, он невоспроизводим: его нельзя отревьюить, нельзя версионировать вместе с сервисом и нельзя восстановить после ухода человека, который его собирал. `.github/workflows/` или `Jenkinsfile` рядом с кодом дают и ревью через PR, и историю.

Третья — trunk-based development. Ветка, которая живёт три недели, оплачивается merge hell, и интеграция в ней впервые проверяется прямо перед мержем, то есть в самый неудачный момент. Короткие коммиты в main плюс feature flags — не вкусовщина. Без них progressive delivery не собирается.

**Secrets в pipeline через OIDC federation, а не long-lived tokens.** GitHub Actions secret с долгоживущим AWS access key — это постоянный доступ к прод-аккаунту для всякого, кто вытащит его из логов. OIDC federation выдаёт короткоживущий токен на конкретный job, с TTL в минуты, и после job он мёртв. Поддержка есть везде: GitHub Actions, GitLab CI, CircleCI, Buildkite со стороны CI, `AssumeRoleWithWebIdentity` и Workload Identity Federation со стороны облаков. На мой взгляд, это самый дешёвый шаг в supply chain security из возможных.

**Failed deployment ≠ катастрофа.** Rollback и roll-forward — это спроектированные заранее пути, а не импровизация в три ночи. Зрелый pipeline хранит immutable artifacts с явным versioning, проверяет health gates и даёт быстро выбрать безопасный вариант восстановления. Осторожность здесь одна: DORA показывает связь скорости и стабильности на уровне результатов исследования, а не доказывает, что именно ваша конкретная правка pipeline что-то улучшила.

**DORA-метрики измеряют, но не заменяют цель продукта.** «Увеличим deployment frequency» без взгляда на instability — это стимул оптимизировать счётчик, и я такое вижу регулярно. Лечится тем, что на дашборде рядом живут все пять текущих метрик и указана версия их определений.

**Supply chain security: signed artifacts и SBOM по умолчанию.** Конкретные обязательства и сроки зависят от того, какое регулирование к вам применимо, и это единственная часть темы, которую нельзя списать из чужого блога. Механика же одинаковая для всех: подписанные артефакты и SBOM дают проверяемые данные о происхождении и составе того, что вы кладёте в прод. Актуальные tracks SLSA разобраны в [Supply Chain Security](/The-Way-of-SRE/practices/supply-chain-security/).

## Связанные листья

- **[Progressive Delivery](/The-Way-of-SRE/practices/progressive-delivery/)** — CI/CD как платформа для canary / blue-green / feature flags. Невозможны без надёжного pipeline и trunk-based development.
- **[Infrastructure as Code](/The-Way-of-SRE/engineering/infrastructure-as-code/)** — IaC изменения проходят через CI/CD: plan stage даёт preview, apply gated approval'ом.
- **[GitOps](/The-Way-of-SRE/engineering/gitops/)** — Git как source of truth + CI/CD как execution engine.
- **[Programming Languages](/The-Way-of-SRE/engineering/programming-languages/)** — тесты, линтеры, build всех языков — часть pipeline.
- **[Test Strategy](/The-Way-of-SRE/engineering/test-strategy/)** — пара к CI/CD: тесты live в pipeline; без strategy CI green = false confidence.
- **[Supply Chain Security](/The-Way-of-SRE/practices/supply-chain-security/)** — SLSA, Sigstore, SBOM, ephemeral runners. CI/CD pipeline — главный surface для supply chain.
- **[Secrets Management](/The-Way-of-SRE/practices/secrets-management/)** — OIDC; CI/CD — один из главных контекстов потенциальной утечки.
- **[Workload Identity](/The-Way-of-SRE/practices/workload-identity/)** — OIDC federation в pipeline убирает long-lived cloud credentials из repo secrets; pipeline получает короткоживущий STS-токен per workflow.
- **[Service Ownership](/The-Way-of-SRE/culture/service-ownership/)** — service team owns its pipeline; не «централизованный DevOps team настраивает за всех».
- **[Change Governance](/The-Way-of-SRE/practices/change-governance/)** — PRR / production readiness review реализуется как gate в pipeline; classification standard / normal change опирается на pipeline-level evidence.

## Открытые вопросы

**Supply Chain Security** и **DORA Metrics** уже уехали в отдельные листья, ссылки в «Связанных». Открытым остаётся **Build Reproducibility / Hermetic Builds** — детерминированные сборки, подход в духе Bazel, залоченные зависимости. Своего опыта здесь у меня мало, поэтому лист пока не написан.
