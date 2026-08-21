---
title: Threat Modeling
description: Систематическое выявление угроз на design phase — STRIDE / PASTA, threat model как living document
sfia: [3, 4, 5, 6]
status: draft
---

«Security ревьюим за неделю до релиза» — типичный антипаттерн, который я регулярно вижу в командах без threat modeling. Код написан, архитектура зафиксирована, security приходит и находит фундаментальные проблемы дизайна — стоимость fix'а сравнима со стоимостью feature, либо релиз сдвигается. Threat Modeling — это **дисциплина на design phase**: четыре вопроса Manifesto (What are we building? What can go wrong? What will we do about it? Did we do enough?), DFD с [trust boundaries](/The-Way-of-SRE/glossary/#trust-boundary), [STRIDE](/The-Way-of-SRE/glossary/#stride) per element, mitigation с явным статусом. Открывает L1 `Secure Development`: разбор угроз на дизайне стоит раньше кода, сборки и зависимостей.

## Что должен уметь

Главный навык на уровне L4 — применять **STRIDE per element of DFD**, не «угрозы вообще». Я регулярно вижу threat models, которые начинаются с brainstorm «какие угрозы возможны в системе» — получается длинный список несвязанных пунктов. STRIDE применяется к **конкретному** элементу DFD (внешний actor, process, data store, data flow) — 6 категорий per element, не все релевантны, но каждая рассматривается systematically. Результат — exhaustive, проверяемый, не «возможно мы что-то забыли».

**L3**
- Понимает базовые threat categories по STRIDE: **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial of Service, **E**levation of Privilege. Различает угрозу и mitigation.
- Читает существующие threat models; понимает trust boundaries в DFD (data flow diagram); идентифицирует свой сервис на карте.

**L4**
- Пишет threat model для нового feature: DFD с trust boundaries → identified threats per STRIDE category для каждого элемента → mitigations с явным статусом (implemented / planned / accepted).
- Участвует в threat modeling sessions соседних команд как peer-reviewer; задаёт вопросы, выявляет упущенное; не «утверждает», а помогает.

**L5**
- Facilitates threat modeling session: собирает нужных людей (разработчик + ops + security), ведёт через STRIDE/PASTA, prioritizing threats по risk = likelihood × impact.
- Связывает threat model с кодом: каждое identified mitigation имеет ссылку на код / config / runbook / test; security tests в CI отвечают за известные категории.
- Применяет attack tree / kill chain analysis для complex multi-step threats; использует MITRE ATT&CK как vocabulary.

**L6+**
- Устанавливает threat modeling как часть SDLC: когда обязателен, какой framework (STRIDE для большинства, PASTA для высокорискового), кто reviews, exit criteria.
- Связывает threat modeling с compliance (SOC 2 / PCI-DSS / ISO 27001 / GDPR), vulnerability management, security incident response.

## Материалы

### Книги

- Adam Shostack — **Threat Modeling: Designing for Security** (Wiley, 2014). Канонический учебник. Саму аббревиатуру STRIDE придумали в Microsoft ещё в 1999 году Лорен Конфельдер и Праерит Гарг, а Шостак довёл её до методики и вынес наружу — из внутренней записки в отраслевой стандарт. Practical guidance по DFD, STRIDE per element, attack trees, requirements analysis. По моим наблюдениям, это «один источник, если выбирать один».

### Статьи и фреймворки

- **[OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)**. Structured reference с STRIDE / PASTA / OCTAVE / LINDDUN / VAST; четыре foundational questions из Threat Modeling Manifesto.
- **[Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/)**. Ценности и принципы от индустрии (Shostack, Brook Schoenfield и др.); подчёркивает early analysis, dialog over documentation. **Antipatterns** (Hero Threat Modeler, Admiration for Problem, Tendency to Overfocus, Perfect Representation) — обязательное чтение.
- **[MITRE ATT&CK](https://attack.mitre.org/)**. Knowledge base of adversary tactics & techniques; 15 tactics × hundreds techniques; vocabulary для описания complex / multi-step threats.

### Инструменты

- **DFD-инструмент** — draw.io / diagrams.net / Excalidraw / Microsoft Threat Modeling Tool. Главный артефакт threat model — DFD с trust boundaries.
- **Markdown threat model template** в repo команды/сервиса (`docs/threat-model.md` рядом с архитектурой). По моим наблюдениям, в зрелых командах именно так и хранят — PR-based review, история через git, cross-ref на код.
- **Microsoft Threat Modeling Tool** — desktop tool с STRIDE-templates и auto-generated threat suggestions из DFD. Полезен новичкам как обучающий вход; зрелые команды чаще ведут markdown.
- **OWASP Threat Dragon** — open-source threat modeling tool с STRIDE / LINDDUN; web-based или desktop.

## Best practices

Порядок здесь важнее содержания. Модель пишется до кода. Переделать фундаментальное решение после того, как код написан, стоит примерно столько же, сколько стоила сама фича. Security или старший инженер сидит в этой сессии как равный участник, а не как приёмка на выходе.

Сначала DFD, потом угрозы. Без диаграммы потоков данных разговор скатывается к «вот код, найди уязвимости», а на этот вопрос никто честно не ответит: непонятно, что входит в систему, какие границы пересекают данные и кому мы вообще доверяем. Компоненты, потоки, границы доверия — и только после этого STRIDE по каждому элементу.

Именно по элементу, а не «по системе». Свободный brainstorm на тему «какие угрозы у нас возможны» даёт длинный список несвязанных пунктов, который невозможно ни проверить, ни закрыть. Шесть категорий на каждый элемент дают результат, про который видно, что он полный.

**Trust boundaries explicit, не «всё внутри сети безопасно».** Zero-trust на бумаге и perimeter-trust по факту — частая пара. Каждое пересечение границы (сетевая зона, единица деплоя, роль) — точка, где угрозы размножаются, поэтому граница рисуется явно, а угрозы на ней получают повышенный вес при приоритизации. Я регулярно вижу threat models без явных boundaries: там не видно, где именно нужны аутентификация и авторизация, и всё «как-то проверяется».

**Mitigation per threat с явным статусом.** «Мы знаем про SQL injection, надо учесть» — формулировка, которая через полгода превращается в инцидент. У каждой выявленной угрозы есть mitigation со статусом: implemented, planned с дедлайном, либо accepted-with-risk с явным владельцем риска. Без статуса threat model — список желаний.

**Re-threat-modeling при major changes, не «однажды сделали — навсегда».** Модель написана два года назад, архитектура с тех пор уехала, предсказания устарели. Триггеры на пересмотр: крупная фича, изменение границы доверия, новая зависимость, инцидент безопасности, изменение регуляторики. По умолчанию — раз в год плюс по триггеру.

**Threat model = living document, не artifact для compliance.** Модель, которая заводится ради аудита и после этого не открывается, — театр. Живой документ выглядит иначе: правки идут через PR, в тексте есть ссылки на код, тесты безопасности привязаны к конкретным угрозам, а при изменении архитектуры про модель вспоминают на обсуждении дизайна. Мёртвая модель хуже отсутствующей. Она даёт ложное ощущение, что вопрос закрыт.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — Information Disclosure / Tampering threats нередко mitigated через secret management practices.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — граница: threat modeling identifies what could go wrong (proactive); VM addresses what already is wrong (reactive).
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — supply chain — один из trust boundaries в DFD; SLSA Level выбирается с учётом threat model.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — security trade-offs (auth model, encryption boundary, network topology) фиксируются как ADR, опираясь на threat model.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит ссылку на текущую threat model; owner отвечает за её актуальность.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — security controls (IAM policies, network policies, encryption) описываются как IaC.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — threat model informs incident response: classes of incidents predictable из threat model.
- **[Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)** — STRIDE категория Elevation of Privilege — основной источник IAM-требований; trust boundaries проводятся по identity границам.
- **[Compliance Frameworks](/The-Way-of-SRE/leaves/practices/compliance-frameworks/)** — SOC 2 CC3.x / ISO 27001 A.5.7 требуют risk assessment; threat model — наиболее операциональная форма.
- **[Security Code Review](/The-Way-of-SRE/leaves/practices/security-code-review/)** — threat model говорит, *что* искать в ревью; security code review проверяет, что mitigations присутствуют в коде.

## Открытые вопросы

Vulnerability Management, Access Control & IAM, Compliance Frameworks и Security Code Review уехали отсюда в отдельные листья — ссылки в разделе выше.

Осталось одно живое направление: **DAST / SAST tooling**. Автоматические проверки (SonarQube, Snyk, Semgrep) дополняют threat modeling статическим и динамическим анализом. Разбор на дизайне не спасает от уязвимости, которая приедет в готовой библиотеке через полгода после релиза; для этого есть Vulnerability Management, и граница между двумя практиками проходит ровно здесь.
