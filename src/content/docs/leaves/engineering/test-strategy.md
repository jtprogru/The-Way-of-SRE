---
title: Test Strategy
description: Дисциплина проектирования testing portfolio — что тестируется и на каком уровне
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Programming / Scripting / Test Strategy
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Каждый раз, когда я слышу «у нас [coverage](/The-Way-of-SRE/glossary/#coverage) 80%, всё нормально с тестами», у меня появляется один вопрос: «80% — это покрытие чего, и какое количество багов это покрытие реально ловит?». Coverage — diagnostic, не target. Лист — про **архитектуру** портфолио тестов: какие слои (unit / integration / contract / e2e), какой ценой поддерживаются, какой полнотой ловят регрессии. Третий лист под L1 `Programming / Scripting`, сосед к [Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/) и [CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/).

## Что должен уметь

Главный навык на уровне L4 — проектировать testing portfolio под конкретную систему. Test pyramid (много unit → меньше integration → мало e2e) — guideline для большинства систем, но не догма. Для distributed systems по моим наблюдениям лучше работает honeycomb (упор на integration / contract). Для backend без сложной UI — trophy (Kent C. Dodds). Цена ошибки в выборе формы — годы накопления медленного / хрупкого suite.

**L3**
- Пишет unit-тесты для своего кода (фокус — public API, не private internals); понимает разницу `unit` / `integration` / `e2e`.
- Применяет table-driven tests / property-based testing для покрытия input space; не пишет N однотипных копий с разными константами.

**L4**
- Проектирует testing portfolio для сервиса: какие слои, какие dependencies реальные vs замокированные, где живут integration-тесты (in-process testcontainers vs shared staging vs ephemeral env).
- Применяет **contract testing** между сервисами (Pact / Spring Cloud Contract / Hoverfly) — consumer-driven contracts проверяются обеими сторонами в CI.
- Управляет **flaky tests** как operational задачей: измеряет flake rate, изолирует / quarantine'ит flaky tests, докладывает root cause не «retry'ем покрыли».

**L5**
- Проектирует **test data strategy** — fixtures vs factories vs builders vs golden data sets; persistent test DB vs ephemeral per-test; PII / GDPR considerations.
- Внедряет **mutation testing** как метрику качества test suite (Pitest / Stryker / Cosmic Ray / `go-mutesting`).
- Проектирует **non-functional testing** — performance / load / stress / soak как отдельные категории со своими environments, baselines и acceptance criteria.

**L6+**
- Внедряет org-level testing standards — minimum bar (coverage / mutation thresholds per criticality bucket), CI gates, shared test infrastructure, test ownership и maintenance ritual.

## Материалы

### Книги

- Kent Beck — **[Test-Driven Development: By Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)** (Addison-Wesley, 2002). Канон TDD, но шире — про дисциплину малых шагов. Читать даже если не делаешь strict-TDD.
- Lisa Crispin, Janet Gregory — **[Agile Testing](https://www.amazon.com/Agile-Testing-Practical-Guide-Testers/dp/0321534468)** (Addison-Wesley, 2008). Test quadrants, test pyramid, whole-team approach.
- Roy Osherove — **[The Art of Unit Testing](https://www.artofunittesting.com/)** (Manning, 3rd ed. 2024). Прикладная книга по unit-testing patterns, mock / stub / spy distinction, test smells. Третье издание под современный стек.
- Vladimir Khorikov — **[Unit Testing Principles, Practices, and Patterns](https://www.manning.com/books/unit-testing)** (Manning, 2020). Schools of thought (London vs Detroit), что есть unit, integration vs unit boundaries. Более глубокий заход после Osherove.

### Статьи и доклады

- Mike Cohn — **[The Forgotten Layer of the Test Automation Pyramid](https://www.mountaingoatsoftware.com/blog/the-forgotten-layer-of-the-test-automation-pyramid)** (2009). Оригинал test pyramid concept.
- Martin Fowler — **[Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)** и **[On the Diverse And Fantastical Shapes of Testing](https://martinfowler.com/articles/2021-test-shapes.html)**. Fowler рефлексирует над pyramid 12 лет спустя — альтернативные shapes для разных систем. Полезно понимать, что pyramid — guideline, не догма.
- Google Testing Blog — **[Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)** (2015). Главный кейс листа — см. ниже.
- Martin Fowler — **[Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html)**. Канонический разбор причин flake'а и стратегий устранения. Читать перед тем, как начать quarantine'ить тесты.
- **[Pact docs intro](https://docs.pact.io/)**. Объяснение consumer-driven contracts.
- Stryker — **[An introduction to mutation testing](https://stryker-mutator.io/docs/mutation-testing-elements/supported-mutators/)**. Mutation score как метрика дополняет coverage.
- Spotify Labs — **[Testing of Microservices](https://engineering.atspotify.com/2018/01/testing-of-microservices/)**. Test honeycomb как ребаланс pyramid для microservices.
- Andrew Trenk, Adam Bender — **[Software Engineering at Google: Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html)** (O'Reilly, 2020). Google's testing philosophy at scale.

### Инструменты

- **Unit / integration runners:** [JUnit](https://junit.org/) (Java/Kotlin), [pytest](https://pytest.org/) (Python), [Jest](https://jestjs.io/) / [Vitest](https://vitest.dev/) (JS/TS), [go test](https://pkg.go.dev/testing) + [testify](https://github.com/stretchr/testify) (Go), [cargo test](https://doc.rust-lang.org/cargo/commands/cargo-test.html) (Rust).
- **Property-based:** [Hypothesis](https://hypothesis.readthedocs.io/) (Python), [proptest](https://github.com/proptest-rs/proptest) (Rust), [jqwik](https://jqwik.net/) (Java), [fast-check](https://fast-check.dev/) (JS/TS).
- **Test doubles / mocking:** [Mockito](https://site.mockito.org/) (Java), [unittest.mock](https://docs.python.org/3/library/unittest.mock.html) (Python), [WireMock](https://wiremock.org/) (HTTP), [gomock](https://github.com/uber-go/mock) (Go).
- **Integration / testcontainers:** [Testcontainers](https://testcontainers.com/) — ephemeral DB / Kafka / Redis в Docker per test. По моим наблюдениям, стандарт во всех языках с приличной поддержкой Docker. [LocalStack](https://www.localstack.cloud/) для AWS services локально.
- **Contract testing:** [Pact](https://pact.io/) (consumer-driven, broker), [Spring Cloud Contract](https://docs.spring.io/spring-cloud-contract/reference/), [Hoverfly](https://hoverfly.io/).
- **E2E / UI:** [Playwright](https://playwright.dev/) — на 2026 это current default для web; [Cypress](https://www.cypress.io/) — альтернатива; [Selenium](https://www.selenium.dev/) — legacy, но всё ещё нужный backstop.
- **Coverage:** [Coverage.py](https://coverage.readthedocs.io/), [JaCoCo](https://www.jacoco.org/jacoco/), [Istanbul/nyc](https://istanbul.js.org/), `go test -coverprofile`.
- **Mutation testing:** [PIT (Pitest)](https://pitest.org/) (JVM), [Stryker](https://stryker-mutator.io/) (JS / .NET / Scala), [mutmut](https://mutmut.readthedocs.io/) (Python).
- **Performance / load:** [k6](https://k6.io/) — modern default по моим наблюдениям; [Locust](https://locust.io/) (Python), [Gatling](https://gatling.io/), [Vegeta](https://github.com/tsenart/vegeta).
- **Flake management:** [BuildPulse](https://buildpulse.io/), [Trunk Flaky Tests](https://trunk.io/flaky-tests), [Datadog CI Visibility](https://docs.datadoghq.com/continuous_integration/). Без tooling flake rate не измеряется — это слепое пятно.

## Best practices

Канонический публичный аргумент против e2e-heavy approach — **Google Testing Blog «Just Say No to More End-to-End Tests» (2015)**. В нём Google публично объяснил, почему даже их огромная инфраструктура не справляется с поддержкой большого e2e-suite: dramatic flake rates, длинный feedback loop (часы вместо минут), высокая стоимость maintenance. Если в вашей команде кто-то предлагает «давайте больше e2e, они ближе к пользователю» — отправляйте на эту статью первым делом. Test pyramid (много дешёвых unit → меньше дорогих integration → мало e2e) — guideline именно из этого опыта.

**Короткие правила:**

- **Coverage — diagnostic, не target.** Goodhart's law: «80% coverage обязательно» → developer пишет тесты без assertions / тесты на trivial code (геттеры). Coverage growth есть, signal value — нет. Coverage полезен как обратный сигнал (что **не** покрыто) и сравнение модулей. **Mutation score** — гораздо более честная метрика качества, но дороже считать (CI run × N мутаций).
- **Contract testing — обязательный слой в distributed systems, не «когда-нибудь».** Unit'ы проверяют изолированно, e2e медленно и нестабильно; consumer ломается на breaking change в provider'е только при совместном деплое (часто = постфактум, в проде). Pact / Spring Cloud Contract проверяют compatibility в CI каждой стороны независимо. Cost внедрения — час на сервис; ROI — class of integration bugs устранён.
- **Test environment management — ephemeral per CI run, не shared staging.** Shared staging накапливает test data debt, тесты сталкиваются (data pollution, port conflicts, race conditions). Ephemeral env per PR (Docker Compose / Testcontainers / k8s namespace per branch) даёт isolation. Cost управляемый при правильном tooling.

Подробнее:

**Test pyramid как baseline, но не догма — выбирай shape под систему.** Антипаттерн ice cream cone (много e2e, мало unit) — медленный feedback (часы), хрупкость, высокая стоимость поддержки. Базовая pyramid подходит большинству; для distributed systems по моим наблюдениям лучше работает **honeycomb** (упор на integration / contract — те классы багов, где они появляются); для backend без сложной UI — **trophy** (Kent C. Dodds). Решение должно быть обдуманным под характеристики системы, не cargo cult «у всех pyramid и у нас».

**Flake rate измеряется, flaky tests изолируются.** «Retry помог, идём дальше» — путь к 5% flake rate, что равно 100% trust loss в CI: developer видит red → нажимает retry, не глядя на root cause; реальный regression проходит мимо. Метрика — flake rate per test, dashboard, weekly review. Lifecycle: quarantine (не блокирует merge) → root cause analysis → fix или delete. Trunk / BuildPulse / Datadog CI Visibility делают это видимым; без tooling — слепое пятно.

**Test data strategy — explicit decision, не «выгрузим из прода».** Я регулярно вижу два антипаттерна. Первый: prod dump в staging без анонимизации — GDPR / PII fail в чистом виде, юристы вашей компании не одобрят, когда узнают. Второй: ручные fixtures в каждом тесте — drift, дублирование, кошмар поддержки. Factories (FactoryBot / factory_boy / mommy_factories) дают composable test data; builder pattern даёт читаемость; golden datasets — regression baseline; ephemeral DB per test (Testcontainers) — изоляция.

**Tests как production code — review, ownership, refactor, deletion.** «Test code не важен, как-нибудь работает» — типичная позиция, которая приводит к 30–50% test code volume как хидденному maintenance cost. Тесты, которые ничего не ловят, но дорого maintain'ить — кандидаты на deletion; тесты, которые ловят bug дважды — keep и углублять; broken tests — bug в коде или в тесте (всегда триаж, никогда `@Disabled` без followup ticket с дедлайном).

## Связанные листья

- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — тесты живут в pipeline (CI ≤ 10 минут + zero flaky tests). Без testing strategy CI green = false confidence. Сосед под одним L1.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — language-specific testing tools (`go test` table-driven, `pytest` fixtures, JUnit annotations). Сосед под одним L1.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — canary с health gate = runtime test; pre-deploy tests — compile/build/staging. Граница: тесты до деплоя, canary после.
- **[Chaos Engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/)** — chaos = hypothesis-driven experiments на real system; load / performance tests — known forcing function в staging. Дополняют, не заменяют друг друга.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — testability = атрибут архитектуры: idempotency, dependency injection, side effects на границах. Resilient design ↔ testable design.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — performance / load tests генерируют baselines для SLI / SLO. Без load testing SLO targets — guess.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — manual test execution = toil; automation тестов — toil reduction.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — security testing (SAST / DAST / fuzzing) — отдельная категория в test portfolio.
- **[Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/)** — load / performance testing — runtime-side проверки; profile-driven optimization — продолжение измерения после first deploy. Соседние листы.

## Открытые вопросы

- **Build Reproducibility / Hermetic Builds** *(TBD)* — Bazel-style hermetic compilation, deterministic builds. Может стать отдельным листом под Programming / Scripting либо подсекцией Supply Chain Security.
- **Fuzzing как отдельная подобласть** *(TBD)* — libFuzzer / AFL / jazzer / OSS-Fuzz / Go native fuzz. Security-flavoured, но техника — property-based testing с генеративным input space.
- **TDD как practice vs principle** *(TBD)* — граница к этому листу: TDD = workflow (red-green-refactor); Test Strategy = portfolio architecture.
- **Shadow Traffic / Traffic Replay testing** *(TBD)* — запись prod traffic и replay против new version в staging. Polyglot между chaos / load / regression / contract.
