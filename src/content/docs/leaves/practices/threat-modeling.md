---
title: Threat Modeling
description: Систематическое выявление угроз, attack vectors и уязвимостей сервиса/фичи на design phase — STRIDE/PASTA как фреймворки, threat model как living document
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Threat Modeling
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Дисциплина систематического выявления угроз, attack vectors и уязвимостей сервиса или фичи **на design phase**, не «security review за день до релиза». Четыре вопроса Threat Modeling Manifesto: **What are we building? What can go wrong? What will we do about it? Did we do enough?** Фреймворки (STRIDE / PASTA / OCTAVE) дают структуру; threat model — living document, привязанный к коду и архитектуре. Соседний лист к [Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/) под L1 `Information Security`; вместе закрывают значительную часть security-практики на уровне сервиса.

## Что должен уметь

- **L3** — Понимает базовые threat categories по STRIDE: **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial of Service, **E**levation of Privilege. Различает угрозу и mitigation.
- **L3** — Читает существующие threat models в команде; понимает trust boundaries в DFD (data flow diagram); идентифицирует свой сервис на карте.
- **L4** — Пишет threat model для нового feature: DFD с trust boundaries → identified threats per STRIDE category для каждого элемента → mitigations с явным statusом (implemented / planned / accepted).
- **L4** — Участвует в threat modeling sessions соседних команд как peer-reviewer; задаёт вопросы, выявляет упущенное; не «утверждает», а помогает.
- **L5** — Facilitates threat modeling session: assembling нужных people (dev + ops + security), guiding через STRIDE/PASTA, prioritizing threats по risk = likelihood × impact, ведение записей.
- **L5** — Связывает threat model с кодом: каждое identified mitigation имеет ссылку на код / config / runbook / test; security tests в CI отвечают за известные категории.
- **L5** — Применяет attack tree / kill chain analysis для complex multi-step threats; использует MITRE ATT&CK как vocabulary для реалистичных attack patterns.
- **L6+** — Устанавливает threat modeling как часть SDLC: when обязателен (новый сервис / major feature / regulatory change), который framework (STRIDE для большинства, PASTA для высокорискового), who reviews, exit criteria.
- **L6+** — Connects threat modeling с compliance (SOC 2 / PCI-DSS / ISO 27001 / GDPR), vulnerability management, security incident response; threat model становится artifact в compliance audit.

## Материалы

### Книги

- Adam Shostack — **Threat Modeling: Designing for Security** (Wiley, 2014). База: канонический учебник; автор разработал и популяризовал STRIDE в Microsoft. Содержит practical guidance по DFD, STRIDE per element, attack trees, requirements analysis.

### Статьи и фреймворки

- **[OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)**. База: structured reference с STRIDE / PASTA / OCTAVE / LINDDUN / VAST; четыре foundational questions из Threat Modeling Manifesto; интеграция в SDLC.
- **[Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/)**. База: values и principles от индустрии (Shostack, Brook Schoenfield и др.); подчёркивает early analysis, dialog over documentation, stakeholder value. Antipatterns (Hero Threat Modeler, Admiration for Problem, Tendency to Overfocus, Perfect Representation) — обязательное чтение.
- **[MITRE ATT&CK](https://attack.mitre.org/)**. Дополнительно: knowledge base of adversary tactics & techniques (real-world observed); 15 tactics × hundreds techniques; используется как vocabulary при описании complex / multi-step threats и mapping mitigation-coverage.

### Инструменты

- **DFD-инструмент** — draw.io / diagrams.net / Excalidraw / Microsoft Threat Modeling Tool. Главный артефакт threat model — DFD с trust boundaries.
- **Markdown threat model template** в repo команды/сервиса (`docs/threat-model.md` рядом с архитектурой). PR-based review; история через git; cross-ref на код и mitigation tests.
- **Microsoft Threat Modeling Tool** — desktop tool с STRIDE-templates и auto-generated threat suggestions из DFD. Полезен новичкам как обучающий вход; зрелые команды чаще ведут markdown.
- **OWASP Threat Dragon** — open-source threat modeling tool с STRIDE / LINDDUN; web-based или desktop.

## Best practices

- **Threat model на design phase, не «security review за день до релиза».** Антипаттерн: команда пишет код, security приходит за неделю до production, находит фундаментальные проблемы дизайна. Стоимость fix'а сравнима со стоимостью feature. Norma: threat model — первый артефакт design phase, до написания кода; security или senior engineer участвует в session как peer.
- **DFD first, threat second — не «вот код, найди уязвимости».** Антипаттерн: «security ревьюим код». Без data flow diagram непонятно, что входит в систему, какие boundaries пересекают данные, кому доверяем. DFD — основа: components → data flows → trust boundaries → STRIDE per element. Threats без DFD — vague list «возможных проблем».
- **STRIDE per element of DFD, не «угрозы вообще».** Антипаттерн: brainstorm «какие угрозы вообще существуют» — получается длинный список несвязанных пунктов. STRIDE применяется к **конкретному** elementу DFD (внешний actor, process, data store, data flow) — 6 категорий per element, не все будут релевантны, но каждая рассматривается systematically. Результат — exhaustive, проверяемый.
- **Trust boundaries explicit, не «всё внутри сети безопасно».** Антипаттерн: zero-trust на бумаге, perimeter-trust по факту. Каждое пересечение boundaries (network zone, deployment unit, role) — point, где threats умножаются. Boundary должен быть нарисован явно; threats per boundary получают повышенный вес в prioritization.
- **Mitigation per threat с явным статусом.** Антипаттерн: «мы знаем про SQL injection, надо учесть». Через 6 месяцев не реализовано, инцидент. Каждое identified threat имеет mitigation с status (implemented / planned + дедлайн / accepted-with-risk + явным владельцем риска). Без status threat model — wish list.
- **Re-threat-modeling при major changes, не «однажды сделали — навсегда».** Антипаттерн: threat model написан два года назад, с тех пор архитектура поменялась, security predictions устарели. Triggers: major feature, изменение trust boundary, новый dependency, security incident, regulatory change. Cadence по-default — раз в год + по trigger'ам.
- **Threat model = living document, не artifact для compliance.** Антипаттерн: threat model заводится «для аудита», после никто не открывает. Это compliance-театр. Living document: PR-flow, cross-references в код, security tests привязаны, обсуждение на 1:1 при изменении архитектуры. Когда документ живёт — он polezen; иначе — risk false sense of security.

## Связанные листья

- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — Information Disclosure / Tampering threats нередко mitigated через secret management practices. Threat model выявляет, **где** secrets под угрозой; Secrets Management — **как** их защитить.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — security trade-offs (выбор auth model, encryption boundary, network topology) фиксируются как ADR, опираясь на threat model. Threat model — input для ADR.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит ссылку на текущую threat model; owner отвечает за её актуальность.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — security controls (IAM policies, network policies, encryption) описываются как IaC; threat model выводит требования к этим controls.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — threat model informs incident response: classes of incidents predictable из threat model, response patterns готовятся заранее.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — policy enforcement (Kyverno / OPA Gatekeeper / Argo CD CMP) реализует mitigation requirements из threat model; threat model → policy translation.

## Открытые вопросы

- **Vulnerability Management** *(TBD)* — CVE tracking, patch cadence, SBOM, dependency scanning (Snyk / Dependabot / Trivy). Соседняя практика под `Information Security` L1, упомянута в open questions у `Secrets Management`.
- **Access Control & IAM** *(TBD)* — управление identity, RBAC, привилегиями; пересекается с Threat Modeling (Spoofing / Elevation of Privilege категории).
- **Security Code Review** *(TBD)* — практика проверки кода на security-issues (OWASP Top 10, secure coding); пересекается с Threat Modeling через mitigation verification.
- **Compliance** *(TBD)* — SOC 2 / PCI-DSS / GDPR / HIPAA как организационная задача; threat model — обязательный artifact в большинстве compliance frameworks.
- **DAST / SAST tooling** — automated security testing (SonarQube, Snyk, Semgrep) — самостоятельная подтема, дополняет threat modeling через runtime / static verification.
