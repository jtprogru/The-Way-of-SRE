---
title: Security Code Review
description: Проверка собственного кода на security-дефекты на этапе review — OWASP Top 10, SAST / SCA / secret scanning как CI-гейты, secure coding
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Security Code Review
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«LGTM» под security-чувствительным PR через 40 секунд после открытия — то, что я регулярно вижу и считаю главным антипаттерном этой темы. Ревью прошло, галочка стоит, а никто не проверил ни авторизацию на новом endpoint, ни экранирование вывода, ни то, что новый dependency не тянет уязвимую транзитивную версию. Security Code Review — это **дисциплина проверки собственного кода на security-дефекты на этапе review**: человеческое ревью на классы багов, которые не ловит линтер (broken access control, логика авторизации), плюс автоматика — [SAST](/The-Way-of-SRE/glossary/#sast), [SCA](/The-Way-of-SRE/glossary/#sca) и secret scanning — как CI-гейт, а не advisory-комментарий. Граница с [Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/): threat modeling на design phase отвечает *что может пойти не так*; security code review на review phase проверяет, *что написанный код этого не допускает*. Граница с [Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/): VM реагирует на known CVE в dependencies (reactive), security code review ловит дефекты в **своём** коде до merge (proactive).

## Что должен уметь

Главный навык на уровне L4 — отличать **security finding от стилистического nitpick** и проверять то, что SAST принципиально не видит. Pattern-matching хорошо ловит конкатенацию SQL-строк или захардкоженный ключ, но broken access control — уязвимость №1 в [OWASP Top 10](/The-Way-of-SRE/glossary/#owasp-top-10) — это **логика**: «на этом endpoint проверяется, что пользователь владеет ресурсом, или любой авторизованный может прочитать чужой объект по id?». Такое находит человек, который читает код с вопросом «как это сломать», а не сканер. Я регулярно вижу команды, которые поставили SAST и считают security review закрытым — automated tooling это пол-дела, вторая половина в голове ревьюера.

- **L3** — Знает категории [OWASP Top 10](/The-Way-of-SRE/glossary/#owasp-top-10) (injection, broken access control, insecure design, ...); находит очевидные дефекты в собственном PR — захардкоженный секрет, конкатенация SQL, отсутствующая проверка авторизации, небезопасная десериализация.
- **L3** — Запускает SAST и secret scanning локально перед push: pre-commit hook (`gitleaks` / `detect-secrets`) + language-линтер (`gosec` / `bandit` / `eslint-plugin-security`).
- **L4** — Проводит security-focused review чужого PR: input validation, авторизация на **каждом** endpoint, output encoding, корректное использование crypto (не самописное), управление секретами. Отличает finding от nitpick.
- **L4** — Встраивает SAST (Semgrep / CodeQL / gosec) + SCA (govulncheck / Snyk / Dependabot) + secret scanning в CI как **gate**, а не advisory; тюнит правила, чтобы срезать false positives до уровня, при котором гейту доверяют.
- **L5** — Проектирует процесс review для команды: когда security review **обязателен** (risk-based — auth / crypto / payment / PII-код), как назначается security-ревьюер, secure-coding guideline, security-критерии в definition of done.
- **L5** — Пишет и поддерживает custom SAST-правила (Semgrep registry) под org-specific анти-паттерны; снижает false-positive fatigue, из-за которого гейты начинают игнорировать.
- **L6+** — Внедряет secure SDLC: threat model → secure coding standard → SAST/SCA gates → security review → pen test; запускает security champions program, чтобы security-экспертиза не была бутылочным горлышком из одной команды.
- **L6+** — Балансирует velocity против gating; ведёт метрики (escaped vulnerabilities, MTTR на review-найденное, покрытие risk-классов) и принимает решения, где гейт hard-fail, а где warning.

## Материалы

### Книги

- Mark Dowd, John McDonald, Justin Schuh — **[The Art of Software Security Assessment](https://www.amazon.com/Art-Software-Security-Assessment-Vulnerabilities/dp/0321444426)** (Addison-Wesley, 2006). Толстая и местами устаревшая по конкретике, но по методу чтения кода «как его сломать» — до сих пор референс. Если выбирать одну книгу именно про ручной audit — эту.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы 12–13 (writing / testing code for security). Google-perspective: security review как часть обычного code review, а не отдельный этап.

### Статьи и стандарты

- **[OWASP Top 10](https://owasp.org/www-project-top-ten/)**. Базовый словарь классов уязвимостей; broken access control — №1 в редакции 2021. Не чеклист, а карта того, на что смотреть в ревью.
- **[OWASP ASVS — Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)**. Структурированный набор требований по уровням (L1/L2/L3) — основа для secure-coding guideline и review-чеклиста, привязанного к risk-уровню сервиса.
- **[OWASP Code Review Guide](https://owasp.org/www-project-code-review-guide/)**. Прямо про процесс ручного security review; методология, чеклисты по технологиям.
- **[Apple goto fail (CVE-2014-1266)](https://www.imperialviolet.org/2014/02/22/applebug.html)** — разбор Adam Langley. Главный публичный кейс листа — см. ниже.

### Инструменты

- **SAST:** [Semgrep](https://semgrep.dev/) (rule-based, fast, custom-правила), [CodeQL](https://codeql.github.com/) (deep semantic, GitHub), [gosec](https://github.com/securego/gosec) (Go), [Bandit](https://bandit.readthedocs.io/) (Python), [SonarQube](https://www.sonarsource.com/products/sonarqube/). По моим наблюдениям, Semgrep чаще берут как первый шаг — низкий порог входа и читаемые правила.
- **SCA:** [govulncheck](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck) (Go, official, фильтрует по реально вызываемым путям), [Snyk](https://snyk.io/), [Dependabot](https://github.com/dependabot), [Trivy](https://trivy.dev/).
- **Secret scanning:** [gitleaks](https://github.com/gitleaks/gitleaks), [trufflehog](https://github.com/trufflesecurity/trufflehog) — в pre-commit и в CI (см. [Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)).
- **DAST** (дополняет, не заменяет): [OWASP ZAP](https://www.zaproxy.org/), [Burp Suite](https://portswigger.net/burp) — динамическая проверка работающего приложения.
- В своём CLI [jtsekret](https://github.com/jtprogru/jtsekret) (менеджер личных секретов на Go) у меня в CI стоит минимальный baseline-гейт — `golangci-lint` + `govulncheck ./...`. Это дешёвый уровень для небольшого проекта: govulncheck ловит уязвимые версии в module graph, причём только если уязвимая функция реально вызывается. Отдельно — secure-coding решения по дизайну: секреты передаются в дочерний процесс через Unix-пайп, а не через argv (где они видны в `ps`) и не через env (где утекают в дочерние процессы и core dumps), локальный кэш шифрованный. Эти решения — ровно то, что должно всплывать в security review, а не оставаться в голове автора.

## Best practices

Главный публичный кейс — **Apple «goto fail» (CVE-2014-1266, февраль 2014)**. В коде проверки TLS-подписи продублировалась одна строка — `goto fail;` — без фигурных скобок вокруг `if`. В результате управление безусловно прыгало на метку, **пропуская финальную проверку подписи целиком**: соединение считалось валидным с любым сертификатом. Любой man-in-the-middle мог подделать TLS для миллионов устройств. Урок не «не дублируйте строки» — а то, что дефект жил в открытом исходнике около полутора лет, и его не поймали ни ревью, ни тесты, ни сборка. Простейший линтер на unreachable code или на «if без скобок» поймал бы за секунды; security-review с вопросом «а что если проверка не выполнится» — тоже. Это аргумент за **defense in depth в самом процессе review**, а не за «достаточно одного умного ревьюера».

**Короткие правила:**

- **SAST / SCA / secret scanning — CI-гейт, не advisory-комментарий.** «Сканер пишет в PR коммент, мержим поверх» — через месяц комменты невидимы как любой шум. Critical-findings блокируют merge; остальное — с явным triage и сроком, не «потом посмотрим».
- **Security review — risk-based, не равномерно по всем PR.** Опечатка в README и новый payment-endpoint не требуют одинакового внимания. Обязательный security-ревьюер — на коде, трогающем auth / crypto / PII / payment / десериализацию; остальное — обычное ревью. Иначе либо все PR ждут security, либо security-внимание размазано в ноль.
- **Secure coding standard записан, а не «в головах сеньоров».** «У нас опытная команда, и так знают» — новичок и LLM-ассистент не знают. Короткий документ (на базе [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)) + custom SAST-правила, кодифицирующие договорённости, — чтобы знание было проверяемым, а не устным.

Подробнее:

**False positives убивают adoption SAST быстрее всего.** Я регулярно вижу один сценарий: команда включает SAST с дефолтным набором правил, получает 400 findings на первом прогоне, 380 из них — false positive или нерелевантны, и через две недели гейт стоит в режиме «не блокировать», то есть его нет. Tuning правил — не разовая настройка, а постоянная работа: baseline существующих findings, отключение нерелевантных правил, custom-правила под свой стек. Гейт, которому не доверяют, хуже отсутствующего — он создаёт ложное чувство покрытия.

**Человеческое ревью ловит то, что pattern-matching не видит в принципе.** SAST силён на синтаксических паттернах (SQL-конкатенация, слабый crypto-алгоритм, захардкоженный ключ). Broken access control — №1 в OWASP Top 10 — это логика владения ресурсом, и её не поймать без понимания домена: «этот endpoint отдаёт объект по id, но проверяет ли он, что объект принадлежит текущему пользователю?». Поэтому security review — это **и** автоматика, **и** человек; убрать одно из двух нельзя, они закрывают разные классы.

**Defense in depth в процессе: pre-commit → SAST/SCA в CI → human review → DAST / pen test.** Ни один слой не полный. Pre-commit ловит секрет до коммита (дешевле всего); CI-гейт — на каждом PR; человек — логику и авторизацию; DAST и периодический pen test — то, что видно только на работающей системе. Кейс goto fail — пример того, как отсутствие нескольких слоёв сразу пропустило тривиальный дефект на полтора года.

**AI-ассистенты генерируют код, который тоже надо ревьюить на security.** Отдельная свежая грань: LLM-сгенерированный код уверенно выглядит и часто содержит классические дефекты (отсутствие валидации, устаревшие crypto-практики из обучающих данных, выдуманные или уязвимые версии пакетов). Я отношусь к AI-сгенерированному PR как к коду джуна, которого не знаю, — security-внимание выше, не ниже.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — secret scanning пересекается напрямую: security code review ловит захардкоженный секрет до merge, а Secrets Management отвечает за lifecycle того, что должно быть в store.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — threat model на design phase говорит, *что* искать в ревью; security code review проверяет, что mitigations реально присутствуют в коде.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — граница: SCR находит дефекты в своём коде до merge (proactive), VM реагирует на known CVE в dependencies (reactive). SAST / SCA tooling общий.
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — SCA-часть security review (проверка dependencies) — частный случай supply chain hygiene; reproducible builds и artifact signing — соседний слой.
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — SAST / SCA / secret-scanning гейты живут в pipeline; именно CI делает их обязательными, а не advisory.
- **[Change Governance](/The-Way-of-SRE/leaves/practices/change-governance/)** — обязательный security review для risk-классов кода — часть change policy наряду с approval-флоу.
- **[Security Chaos Engineering](/The-Way-of-SRE/leaves/practices/security-chaos-engineering/)** — SCR проверяет код на дефекты до деплоя; SCE проверяет, что security-контролы реально работают в проде.

## Открытые вопросы

- **DAST / fuzzing depth** — динамическое тестирование и fuzzing (coverage-guided, например `go-fuzz` / libFuzzer) заслуживают отдельного разбора; здесь они упомянуты как соседний слой, не раскрыты.
- Я не уверен, как корректно мерить **эффективность** security review. «Escaped vulnerabilities» считается только постфактум (когда уязвимость нашли в проде или на pen test), а review-найденные дефекты редко логируются как метрика. Если в вашей команде есть рабочая метрика результативности ревью — расскажите PR'ом.
- **AI-assisted security review** — инструменты, которые ревьюят PR на security через LLM, появляются быстро; их recall / precision на реальных уязвимостях я пока не видел в честном публичном замере.
