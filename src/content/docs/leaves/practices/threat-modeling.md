---
title: Threat Modeling
description: Систематическое выявление угроз на design phase — STRIDE / PASTA, threat model как living document
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Threat Modeling
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Security ревьюим за неделю до релиза» — типичный антипаттерн, который я регулярно вижу в командах без threat modeling. Код написан, архитектура зафиксирована, security приходит и находит фундаментальные проблемы дизайна — стоимость fix'а сравнима со стоимостью feature, либо релиз сдвигается. Threat Modeling — это **дисциплина на design phase**: четыре вопроса Manifesto (What are we building? What can go wrong? What will we do about it? Did we do enough?), DFD с trust boundaries, STRIDE per element, mitigation с явным статусом. Соседний лист к [Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/) под L1 `Information Security`.

## Что должен уметь

Главный навык на уровне L4 — применять **STRIDE per element of DFD**, не «угрозы вообще». Я регулярно вижу threat models, которые начинаются с brainstorm «какие угрозы возможны в системе» — получается длинный список несвязанных пунктов. STRIDE применяется к **конкретному** элементу DFD (внешний actor, process, data store, data flow) — 6 категорий per element, не все релевантны, но каждая рассматривается systematically. Результат — exhaustive, проверяемый, не «возможно мы что-то забыли».

- **L3** — Понимает базовые threat categories по STRIDE: **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial of Service, **E**levation of Privilege. Различает угрозу и mitigation.
- **L3** — Читает существующие threat models; понимает trust boundaries в DFD (data flow diagram); идентифицирует свой сервис на карте.
- **L4** — Пишет threat model для нового feature: DFD с trust boundaries → identified threats per STRIDE category для каждого элемента → mitigations с явным статусом (implemented / planned / accepted).
- **L4** — Участвует в threat modeling sessions соседних команд как peer-reviewer; задаёт вопросы, выявляет упущенное; не «утверждает», а помогает.
- **L5** — Facilitates threat modeling session: собирает нужных people (dev + ops + security), ведёт через STRIDE/PASTA, prioritizing threats по risk = likelihood × impact.
- **L5** — Связывает threat model с кодом: каждое identified mitigation имеет ссылку на код / config / runbook / test; security tests в CI отвечают за известные категории.
- **L5** — Применяет attack tree / kill chain analysis для complex multi-step threats; использует MITRE ATT&CK как vocabulary.
- **L6+** — Устанавливает threat modeling как часть SDLC: когда обязателен, какой framework (STRIDE для большинства, PASTA для высокорискового), кто reviews, exit criteria.
- **L6+** — Связывает threat modeling с compliance (SOC 2 / PCI-DSS / ISO 27001 / GDPR), vulnerability management, security incident response.

## Материалы

### Книги

- Adam Shostack — **Threat Modeling: Designing for Security** (Wiley, 2014). Канонический учебник; автор разработал и популяризовал STRIDE в Microsoft. Practical guidance по DFD, STRIDE per element, attack trees, requirements analysis. По моим наблюдениям, это «один источник, если выбирать один».

### Статьи и фреймворки

- **[OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)**. Structured reference с STRIDE / PASTA / OCTAVE / LINDDUN / VAST; четыре foundational questions из Threat Modeling Manifesto.
- **[Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/)**. Values и principles от индустрии (Shostack, Brook Schoenfield и др.); подчёркивает early analysis, dialog over documentation. **Antipatterns** (Hero Threat Modeler, Admiration for Problem, Tendency to Overfocus, Perfect Representation) — обязательное чтение.
- **[MITRE ATT&CK](https://attack.mitre.org/)**. Knowledge base of adversary tactics & techniques; 15 tactics × hundreds techniques; vocabulary для описания complex / multi-step threats.

### Инструменты

- **DFD-инструмент** — draw.io / diagrams.net / Excalidraw / Microsoft Threat Modeling Tool. Главный артефакт threat model — DFD с trust boundaries.
- **Markdown threat model template** в repo команды/сервиса (`docs/threat-model.md` рядом с архитектурой). По моим наблюдениям, в зрелых командах именно так и хранят — PR-based review, история через git, cross-ref на код.
- **Microsoft Threat Modeling Tool** — desktop tool с STRIDE-templates и auto-generated threat suggestions из DFD. Полезен новичкам как обучающий вход; зрелые команды чаще ведут markdown.
- **OWASP Threat Dragon** — open-source threat modeling tool с STRIDE / LINDDUN; web-based или desktop.

## Best practices

**Короткие правила:**

- **Threat model на design phase, не «security review за день до релиза».** Стоимость fix фундаментальной проблемы дизайна после написания кода сравнима со стоимостью feature. Threat model — первый артефакт design phase, до написания кода; security или senior engineer участвует как peer.
- **DFD first, threat second — не «вот код, найди уязвимости».** Без data flow diagram непонятно, что входит в систему, какие boundaries пересекают данные, кому доверяем. DFD — основа: components → data flows → trust boundaries → STRIDE per element.
- **STRIDE per element of DFD, не «угрозы вообще».** Brainstorm «какие угрозы возможны» даёт длинный список несвязанных пунктов. STRIDE применяется к конкретному element — exhaustive, проверяемый результат.

Подробнее:

**Trust boundaries explicit, не «всё внутри сети безопасно».** Zero-trust на бумаге, perimeter-trust по факту — частая ситуация. Каждое пересечение boundaries (network zone, deployment unit, role) — point, где threats умножаются. Boundary должен быть нарисован явно; threats per boundary получают повышенный вес в prioritization. Я регулярно вижу threat models без явных boundaries — там не видно, где именно требуется auth/auth, и всё «как-то проверяется».

**Mitigation per threat с явным статусом.** «Мы знаем про SQL injection, надо учесть» — через 6 месяцев не реализовано, инцидент. Каждое identified threat имеет mitigation с status (implemented / planned + дедлайн / accepted-with-risk + явным владельцем риска). Без status threat model — wish list.

**Re-threat-modeling при major changes, не «однажды сделали — навсегда».** Threat model написан два года назад, с тех пор архитектура поменялась, security predictions устарели. Triggers: major feature, изменение trust boundary, новый dependency, security incident, regulatory change. Cadence по-default — раз в год + по trigger.

**Threat model = living document, не artifact для compliance.** «Threat model заводится для аудита, после никто не открывает» — это compliance-театр. Living document: PR-flow, cross-references в код, security tests привязаны, обсуждение на 1:1 при изменении архитектуры. Когда документ живёт — он полезен; иначе — risk false sense of security.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — Information Disclosure / Tampering threats нередко mitigated через secret management practices.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — граница: threat modeling identifies what could go wrong (proactive); VM addresses what already is wrong (reactive).
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — supply chain — один из trust boundaries в DFD; SLSA Level выбирается с учётом threat model.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — security trade-offs (auth model, encryption boundary, network topology) фиксируются как ADR, опираясь на threat model.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит ссылку на текущую threat model; owner отвечает за её актуальность.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — security controls (IAM policies, network policies, encryption) описываются как IaC.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — threat model informs incident response: classes of incidents predictable из threat model.

## Открытые вопросы

- **Vulnerability Management** уже выделена в отдельный лист.
- **Access Control & IAM** *(TBD)* — управление identity, RBAC, привилегиями.
- **Security Code Review** *(TBD)* — практика проверки кода на security-issues (OWASP Top 10, secure coding).
- **Compliance** *(TBD)* — SOC 2 / PCI-DSS / GDPR / HIPAA как организационная задача.
- **DAST / SAST tooling** — automated security testing (SonarQube, Snyk, Semgrep) — дополняет threat modeling через runtime / static verification.
