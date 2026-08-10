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

«У нас [coverage](/The-Way-of-SRE/glossary/#coverage) 80%, с тестами всё нормально» — каждый раз, когда я это слышу, у меня появляется один встречный вопрос. Покрытие чего именно, и сколько багов оно поймало? Coverage — диагностика, а не цель. Этот лист про **архитектуру** портфолио тестов: какие слои (unit / integration / contract / e2e), какой ценой они поддерживаются и какие регрессии ловят. Третий лист под L1 `Programming / Scripting`, сосед к [Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/) и [CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/).

## Что должен уметь

Главный навык на уровне L4 — проектировать testing portfolio под конкретную систему. Test pyramid (много unit → меньше integration → мало e2e) — ориентир для большинства систем, но не догма. Для распределённых систем, по моим наблюдениям, лучше работает honeycomb с упором на integration и contract. Для backend без сложного UI — trophy (Kent C. Dodds). Ошибка в выборе формы стоит дорого и оплачивается годами: медленный и хрупкий suite накапливается незаметно.

**L3**
- Пишет unit-тесты для своего кода (фокус — public API, не private internals); понимает разницу `unit` / `integration` / `e2e`.
- Применяет table-driven tests / property-based testing для покрытия input space; не пишет N однотипных копий с разными константами.

**L4**
- Проектирует testing portfolio для сервиса: какие слои, какие dependencies реальные vs замокированные, где живут интеграционные тесты (in-process testcontainers vs shared staging vs ephemeral env).
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

Канонический публичный аргумент против e2e-heavy approach — **Google Testing Blog «Just Say No to More End-to-End Tests» (2015)**. В нём Google публично объяснил, почему даже их огромная инфраструктура не справляется с поддержкой большого набора e2e: тесты постоянно мигают, обратная связь занимает часы вместо минут, а поддержка стоит непропорционально дорого. Аргумент простой. Если кто-то в команде предлагает «давайте больше e2e, они же ближе к пользователю» — отправляйте читать эту статью первым делом. Test pyramid (много дешёвых unit → меньше дорогих integration → мало e2e) — guideline именно из этого опыта.

Отсюда первое правило: coverage — диагностика, а не цель. Стоит объявить «80% обязательно», и закон Гудхарта срабатывает мгновенно: появляются тесты без assertions и тесты на геттеры. Цифра растёт, сигнала нет. Полезен coverage ровно в обратную сторону: он неплохо показывает, что **не** покрыто вообще, и позволяет сравнить между собой модули, которые писали разные люди в разное время и с разным отношением к тестам. Честнее его меряет **mutation score**, но и считать его дороже: каждый прогон CI умножается на число мутаций.

Contract testing я считаю обязательным слоем в распределённых системах, а не задачей «когда-нибудь потом». Unit'ы проверяют сервис изолированно, e2e медленные и нестабильные, а consumer ломается на breaking change в provider'е только при совместном деплое — то есть постфактум и обычно в проде. Pact и Spring Cloud Contract переносят эту проверку в CI каждой стороны отдельно. Внедрение стоит примерно час на сервис, а взамен из жизни уходит целый класс интеграционных багов.

**Окружение для тестов — эфемерное на каждый прогон, не общий staging.** Общий staging копит test data debt, а тесты в нём сталкиваются друг с другом: данные грязные после соседнего прогона, порты заняты, гонки возникают на ровном месте и воспроизводятся раз в десять запусков. Отдельное окружение на PR (Docker Compose, Testcontainers, namespace в k8s на ветку) даёт изоляцию. При нормальном tooling стоит это вменяемых денег.

**Test pyramid — baseline, а не догма: форма выбирается под систему.** Ice cream cone (много e2e, мало unit) даёт обратную связь через часы, хрупкость и дорогую поддержку. Базовая пирамида подходит большинству. Для распределённых систем, по моим наблюдениям, лучше ложится **honeycomb** — упор на integration и contract, туда, где эти баги и появляются. Для backend без сложного UI — **trophy** (Kent C. Dodds). Главное, чтобы форма была выбрана осознанно, а не по принципу «у всех пирамида, и у нас пирамида».

**Flake rate измеряется, flaky tests изолируются.** «Retry помог, идём дальше» — короткая дорога к тому, что красному CI перестают верить вообще: инженер видит red, жмёт retry не глядя, а настоящая регрессия проезжает мимо. Лечится это метрикой на каждый тест, дашбордом и еженедельным разбором. Дальше жизненный цикл: карантин (тест не блокирует merge) → разбор причины → починить или удалить. Trunk, BuildPulse и Datadog CI Visibility делают flake видимым, без них это слепое пятно.

**Тестовые данные — отдельное решение, а не «выгрузим из прода».** Я регулярно вижу два антипаттерна. Первый — дамп прода в staging без анонимизации: чистый провал по PII, о котором юристы узнают последними и очень некстати. Второй — руками написанные fixtures в каждом тесте, которые расползаются, дублируются и превращают поддержку в кошмар. Дальше выбор по вкусу. Factories дают композируемые данные, builder — читаемость, golden datasets — baseline для регрессий, эфемерная база на тест через Testcontainers — изоляцию.

**Тесты — такой же production code: review, владелец, рефакторинг, удаление.** Позиция «код тестов неважен, как-нибудь работает» превращает половину репозитория в скрытую стоимость поддержки. Тест, который ничего не ловит, но дорого живёт, — кандидат на удаление. Тест, который поймал баг дважды, — оставляем и углубляем. Сломанный тест — это баг либо в коде, либо в самом тесте, и в обоих случаях он идёт в триаж, а не под `@Disabled` без тикета и срока.

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

Четыре темы я держу в уме, но пока не написал. Build reproducibility и hermetic builds *(TBD)* — детерминированная сборка в духе Bazel; это либо отдельный лист под Programming / Scripting, либо подсекция Supply Chain Security, и я не решил, куда честнее. Fuzzing *(TBD)* — libFuzzer, AFL, jazzer, OSS-Fuzz, нативный fuzz в Go: пахнет security, а по технике это property-based testing с генеративным пространством входов. TDD *(TBD)* — граница с этим листом проходит по тому, что TDD задаёт workflow (red-green-refactor), а Test Strategy — архитектуру портфолио. И shadow traffic *(TBD)*: запись прод-трафика и его повтор против новой версии в staging, штука, которая одновременно про chaos, load, регрессию и контракты.
