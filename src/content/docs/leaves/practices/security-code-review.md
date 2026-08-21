---
title: Security Code Review
description: Проверка своего кода на дефекты безопасности на этапе review — OWASP Top 10, SAST / SCA / secret scanning как CI-гейты, secure coding
sfia: [3, 4, 5, 6]
status: draft
---

«LGTM» через сорок секунд после открытия PR, который трогает авторизацию. Вижу такое регулярно и считаю главным антипаттерном темы. Ревью прошло, галочка стоит, а никто не проверил ни авторизацию на новом endpoint, ни экранирование вывода, ни то, что свежий dependency не тянет за собой уязвимую транзитивную версию. Security Code Review — это **дисциплина проверки собственного кода на дефекты безопасности на этапе review**: человеческое ревью на классы багов, которые линтер не ловит в принципе (broken access control, логика авторизации), плюс автоматика — [SAST](/The-Way-of-SRE/glossary/#sast), [SCA](/The-Way-of-SRE/glossary/#sca) и secret scanning — поставленная как CI-гейт, а не как необязательный комментарий в PR. Граница с [Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/): threat modeling на design phase отвечает *что может пойти не так*; security code review на review phase проверяет, *что написанный код этого не допускает*. Граница с [Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/): VM реагирует на known CVE в dependencies (reactive), security code review ловит дефекты в **своём** коде до merge (proactive).

## Что должен уметь

Главный навык на уровне L4 — отличать **security finding от стилистического nitpick** и проверять то, что SAST принципиально не видит. Pattern-matching хорошо ловит конкатенацию SQL-строк или захардкоженный ключ, но broken access control — уязвимость №1 в [OWASP Top 10](/The-Way-of-SRE/glossary/#owasp-top-10) — это **логика**: «на этом endpoint проверяется, что пользователь владеет ресурсом, или любой авторизованный может прочитать чужой объект по id?». Такое находит человек, который читает код с вопросом «как это сломать», а не сканер. Я регулярно вижу команды, которые поставили SAST и считают security review закрытым — automated tooling это пол-дела, вторая половина в голове ревьюера.

**L3**
- Знает категории [OWASP Top 10](/The-Way-of-SRE/glossary/#owasp-top-10) (injection, broken access control, insecure design, ...); находит очевидные дефекты в собственном PR — захардкоженный секрет, конкатенация SQL, отсутствующая проверка авторизации, небезопасная десериализация.
- Запускает SAST и secret scanning локально перед push: pre-commit hook (`gitleaks` / `detect-secrets`) + линтер языка (`gosec` / `bandit` / `eslint-plugin-security`).

**L4**
- Проводит security-focused review чужого PR: input validation, авторизация на **каждом** endpoint, output encoding, корректное использование crypto (не самописное), управление секретами. Отличает finding от nitpick.
- Встраивает SAST (Semgrep / CodeQL / gosec) + SCA (govulncheck / Snyk / Dependabot) + secret scanning в CI как **gate**, а не advisory; тюнит правила, чтобы срезать false positives до уровня, при котором гейту доверяют.

**L5**
- Проектирует процесс review для команды: когда security review **обязателен** (risk-based — auth / crypto / payment / PII-код), как назначается ревьюер по безопасности, secure-coding guideline, критерии безопасности в definition of done.
- Пишет и поддерживает custom SAST-правила (Semgrep registry) под org-specific анти-паттерны; снижает false-positive fatigue, из-за которого гейты начинают игнорировать.

**L6+**
- Внедряет secure SDLC: threat model → secure coding standard → SAST/SCA gates → security review → pen test; запускает security champions program, чтобы экспертиза по безопасности не была бутылочным горлышком из одной команды.
- Балансирует velocity против gating; ведёт метрики (escaped vulnerabilities, MTTR на найденное в ревью, покрытие классов риска) и принимает решения, где гейт hard-fail, а где warning.

## Материалы

### Книги

- Mark Dowd, John McDonald, Justin Schuh — **[The Art of Software Security Assessment](https://www.amazon.com/Art-Software-Security-Assessment-Vulnerabilities/dp/0321444426)** (Addison-Wesley, 2006). Толстая и местами устаревшая по конкретике, но по методу чтения кода «как его сломать» — до сих пор референс. Если выбирать одну книгу именно про ручной audit — эту.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы 12–13 (writing / testing code for security). Google-perspective: security review как часть обычного code review, а не отдельный этап.

### Статьи и стандарты

- **[OWASP Top 10](https://owasp.org/www-project-top-ten/)**. Базовый словарь классов уязвимостей; broken access control держит первое место и в редакции 2021, и в свежей 2025. Из заметных изменений 2025 года — отдельная категория под сбои цепочки поставок ПО, чего в прошлой редакции не было. Не чеклист, а карта того, на что смотреть в ревью.
- **[OWASP ASVS — Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)**. Структурированный набор требований по уровням (L1/L2/L3) — основа для secure-coding guideline и чеклиста для ревью, привязанного к уровню риска сервиса.
- **[OWASP Code Review Guide](https://owasp.org/www-project-code-review-guide/)**. Прямо про процесс ручного security review; методология, чеклисты по технологиям.
- **[Apple goto fail (CVE-2014-1266)](https://www.imperialviolet.org/2014/02/22/applebug.html)** — разбор Adam Langley. Главный публичный кейс листа — см. ниже.

### Инструменты

- **SAST:** [Semgrep](https://semgrep.dev/) (rule-based, fast, собственные правила), [CodeQL](https://codeql.github.com/) (deep semantic, GitHub), [gosec](https://github.com/securego/gosec) (Go), [Bandit](https://bandit.readthedocs.io/) (Python), [SonarQube](https://www.sonarsource.com/products/sonarqube/). По моим наблюдениям, Semgrep чаще берут как первый шаг — низкий порог входа и читаемые правила.
- **SCA:** [govulncheck](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck) (Go, official, фильтрует по реально вызываемым путям), [Snyk](https://snyk.io/), [Dependabot](https://github.com/dependabot), [Trivy](https://trivy.dev/).
- **Secret scanning:** [gitleaks](https://github.com/gitleaks/gitleaks), [trufflehog](https://github.com/trufflesecurity/trufflehog) — в pre-commit и в CI (см. [Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)).
- **DAST** (дополняет, не заменяет): [OWASP ZAP](https://www.zaproxy.org/), [Burp Suite](https://portswigger.net/burp) — динамическая проверка работающего приложения.
- В своём CLI [jtsekret](https://github.com/jtprogru/jtsekret) (менеджер личных секретов на Go) у меня в CI стоит минимальный базовый гейт — `golangci-lint` + `govulncheck ./...`. Это дешёвый уровень для небольшого проекта: govulncheck ловит уязвимые версии в module graph, причём только если уязвимая функция реально вызывается. Отдельно — secure-coding решения по дизайну: секреты передаются в дочерний процесс через pipe, а не через argv (где они видны в `ps`) и не через env (где утекают в дочерние процессы и core dumps), локальный кэш шифрованный. Эти решения — ровно то, что должно всплывать в security review, а не оставаться в голове автора.

## Best practices

Главный публичный кейс — **Apple «goto fail» (CVE-2014-1266, февраль 2014)**. В коде проверки TLS-подписи продублировалась одна строка — `goto fail;` — без фигурных скобок вокруг `if`. В результате управление безусловно прыгало на метку, **пропуская финальную проверку подписи целиком**: соединение считалось валидным с любым сертификатом. Любой man-in-the-middle мог подделать TLS для миллионов устройств. Урок не «не дублируйте строки» — а то, что дефект жил в открытом исходнике около полутора лет, и его не поймали ни ревью, ни тесты, ни сборка. Простейший линтер на unreachable code или на «if без скобок» поймал бы за секунды; security-review с вопросом «а что если проверка не выполнится» — тоже. Это аргумент за **defense in depth в самом процессе review**, а не за «достаточно одного умного ревьюера».

SAST, SCA и secret scanning стоят как гейт, а не как совет. «Сканер напишет коммент в PR, а мы посмотрим» работает ровно месяц: дальше комменты сливаются с остальным шумом и перестают читаться. Критические findings блокируют merge. Всё остальное проходит через явный triage со сроком, а не через «потом посмотрим».

Само ревью распределяется по риску, а не равномерно по всем PR. Опечатка в README и новый endpoint приёма платежей не заслуживают одинакового внимания, а попытка проверять всё одинаково тщательно ломается сразу в обе стороны: получается либо очередь из PR, ждущих безопасника, либо внимание, размазанное до нуля. Обязательный ревьюер по безопасности нужен там, где код трогает auth, crypto, PII, платежи или десериализацию. Остальное едет обычным ревью.

Отдельно — стандарт secure coding, записанный, а не живущий в головах старших. «У нас опытная команда, и так всё знают» перестаёт работать в тот день, когда приходит новичок или когда заметную часть кода начинает предлагать LLM-ассистент. Хватает короткого документа на базе [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) и собственных правил SAST, которые кодифицируют договорённости. Тогда знание проверяемо, а не устно.

**False positives убивают adoption SAST быстрее всего.** Я регулярно вижу один сценарий: команда включает SAST с дефолтным набором правил, получает 400 findings на первом прогоне, 380 из них — false positive или нерелевантны, и через две недели гейт стоит в режиме «не блокировать», то есть его нет. Tuning правил — не разовая настройка, а постоянная работа: baseline существующих findings, отключение нерелевантных правил, собственные правила под свой стек. Гейт, которому не доверяют, хуже отсутствующего — он создаёт ложное чувство покрытия.

**Человеческое ревью ловит то, что pattern-matching не видит в принципе.** SAST силён на синтаксических паттернах (SQL-конкатенация, слабый криптоалгоритм, захардкоженный ключ). Broken access control — №1 в OWASP Top 10 — это логика владения ресурсом, и её не поймать без понимания домена: «этот endpoint отдаёт объект по id, но проверяет ли он, что объект принадлежит текущему пользователю?». Поэтому security review — это **и** автоматика, **и** человек; убрать одно из двух нельзя, они закрывают разные классы.

**Defense in depth в процессе: pre-commit → SAST/SCA в CI → human review → DAST / pen test.** Ни один слой не полный. Pre-commit ловит секрет до коммита (дешевле всего); CI-гейт — на каждом PR; человек — логику и авторизацию; DAST и периодический pen test — то, что видно только на работающей системе. Кейс goto fail — пример того, как отсутствие нескольких слоёв сразу пропустило тривиальный дефект на полтора года.

**AI-ассистенты генерируют код, который тоже надо ревьюить на security.** Отдельная свежая грань: LLM-сгенерированный код уверенно выглядит и часто содержит классические дефекты (отсутствие валидации, устаревшие криптопрактики из обучающих данных, выдуманные или уязвимые версии пакетов). Я отношусь к AI-сгенерированному PR как к коду незнакомого джуна: внимания к безопасности больше, а не меньше.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — secret scanning пересекается напрямую: security code review ловит захардкоженный секрет до merge, а Secrets Management отвечает за lifecycle того, что должно быть в store.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — threat model на design phase говорит, *что* искать в ревью; security code review проверяет, что mitigations реально присутствуют в коде.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — граница: SCR находит дефекты в своём коде до merge (proactive), VM реагирует на known CVE в dependencies (reactive). SAST / SCA tooling общий.
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — SCA-часть security review (проверка dependencies) — частный случай supply chain hygiene; reproducible builds и artifact signing — соседний слой.
- **[CI/CD](/The-Way-of-SRE/leaves/engineering/ci-cd/)** — SAST / SCA / secret-scanning гейты живут в pipeline; именно CI делает их обязательными, а не advisory.
- **[Change Governance](/The-Way-of-SRE/leaves/practices/change-governance/)** — обязательный security review для рискованных классов кода — часть change policy наряду со схемой согласования.
- **[Security Chaos Engineering](/The-Way-of-SRE/leaves/practices/security-chaos-engineering/)** — SCR проверяет код на дефекты до деплоя; SCE проверяет, что контроли безопасности реально работают в проде.

## Открытые вопросы

- **DAST / fuzzing depth** — динамическое тестирование и fuzzing (coverage-guided, например `go-fuzz` / libFuzzer) заслуживают отдельного разбора; здесь они упомянуты как соседний слой, не раскрыты.
- Я не уверен, как корректно мерить **эффективность** security review. «Escaped vulnerabilities» считается только постфактум (когда уязвимость нашли в проде или на pen test), а найденные в ревью дефекты редко логируются как метрика. Если в вашей команде есть рабочая метрика результативности ревью — расскажите PR'ом.
- **AI-assisted security review** — инструменты, которые ревьюят PR на security через LLM, появляются быстро; их recall / precision на реальных уязвимостях я пока не видел в честном публичном замере.
