---
title: Compliance Frameworks
description: SOC 2, ISO 27001, PCI-DSS и GDPR как драйверы требований к безопасности, а не самостоятельная цель
sfia: [4, 5, 6]
status: draft
---

Я регулярно вижу две крайности в отношении compliance. Первая — «compliance это бумажки для аудита, инженеров не касается»: команда узнаёт о SOC 2 за две недели до аудита, в панике собирает evidence руками, проходит audit, забывает до следующего года. Вторая — «у нас SOC 2 Type II, значит мы secure»: чек прошёл, контролы зелёные, а в это же время [Capital One](https://krebsonsecurity.com/2019/07/capital-one-data-theft-impacts-106m-people/) теряет данные 106 миллионов человек через неверно настроенный WAF — банк, живущий под непрерывным регуляторным надзором и всеми возможными аудитами. Compliance — это **доказательство соответствия externally-defined requirements**, а не security. Грамотный SRE использует compliance как драйвер для требований, которые команда закрывает и без всякого аудита ([Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/), [Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/), [Backup & Restore](/The-Way-of-SRE/leaves/engineering/backup-restore/), [audit trail](/The-Way-of-SRE/glossary/#audit-trail) во всех системах), и автоматизирует evidence collection до уровня «непрерывно», а не «раз в год вручную».

## Что должен уметь

Главный навык на уровне L5 — **mapping контролов на технические практики**. SOC 2 CC6.1 («logical access controls») — это не «напишем policy документ», это IAM модель + [принцип наименьших привилегий](/The-Way-of-SRE/glossary/#least-privilege) + audit log + access review cadence. PCI-DSS Requirement 8 — это MFA + password policy + session management. Когда compliance читается как обычная инженерная работа, которую команда делает и без аудитора, аудит проходит без героизма. Когда compliance трактуется как «отдельная работа поверх инженерии» — рождается *compliance theater*.

**L3**
- Знает, какие фреймворки compliance применяются к продукту команды (SOC 2 / PCI-DSS / HIPAA / FedRAMP / GDPR), и понимает, какие части кода/инфраструктуры в scope.
- Понимает разницу regulation (закон, GDPR / HIPAA — обязательны при условии applicable) vs framework (стандарт сертификации, SOC 2 / ISO 27001 / PCI-DSS — добровольны, но требуются клиентами).

**L4**
- Mapping компонентов системы на конкретные контролы; знает, какой control покрывается каким техническим артефактом (IaC модулем, IAM policy, runbook'ом, дашбордом).
- Автоматизирует evidence collection — снимок IAM state, screenshot patch SLA дашборда, IaC diff history, audit log export — через cron / event-driven hooks в GRC platform, а не вручную перед аудитом.
- Различает SOC 2 Type I (control design в момент аудита) и Type II (operational effectiveness за период 3–12 месяцев); Type II требует доказательств за весь период, что меняет всё в evidence collection.

**L5**
- Проектирует control framework команды/org — выбор фреймворков по клиентскому спросу, scope definition, control catalogue, ownership matrix (кто ответствен за каждый control), audit cadence.
- Внедряет *compliance-as-code* — policy через OPA / Sentinel / Cloud Custodian, automated drift detection, continuous control testing. «Контроль зелёный» = «automated check прошёл в последние 24 часа», не «policy документ написан год назад».
- Координирует с external auditors — scoping, evidence requests, walkthroughs, finding remediation. Понимает, что auditor может принять *compensating control* (альтернативу) — это переговоры, не команда сверху.

**L6+**
- Дизайнит strategy на уровне org: какие certifications нужны (SOC 2 Type II baseline + ISO 27001 если EU enterprise + HITRUST если healthcare), inheritance модель (parent org аудит покрывает subsidiary), budget audit вендоров vs внутреннее content, board reporting.
- Использует compliance как leverage для приоритизации security investment, который без external pressure не получает support — «PCI-DSS требует, иначе теряем merchant agreement» работает лучше, чем «это правильная security practice».

## Материалы

### Книги

- Eric Schlesinger, Sloane Cohen — **The SOC 2 Compliance Handbook** (Self-published, 2023). Прикладная книга про SOC 2: scoping, evidence, common gotchas. Не academic, читается за выходные.
- Alan Calder — **[Nine Steps to Success: An ISO 27001:2022 Implementation Overview](https://www.itgovernancepublishing.co.uk/product/nine-steps-to-success-an-iso-27001-implementation-overview-fourth-edition)** (ITGP, 4th ed., 2023). Канонический guide по ISO 27001 implementation; сжато, без воды.

### Стандарты и регуляции

- **[AICPA Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)** (AICPA). Источник истины для SOC 2 — Security, Availability, Processing Integrity, Confidentiality, Privacy. Главный документ для compliance team; для инженеров полезен Security section.
- **[ISO/IEC 27001:2022](https://www.iso.org/standard/27001)** (ISO, 2022). Платный стандарт, но контролы (Annex A, 93 controls) — публично доступны и используются как чеклист.
- **[PCI DSS](https://www.pcisecuritystandards.org/document_library/)** (PCI SSC; v4.0 — март 2022, актуальная редакция v4.0.1 — июнь 2024). Если работаете с card data — обязательно. Стандарт жёстче и конкретнее, чем SOC 2: явные требования, не «design appropriate controls».
- **[NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)** (NIST, февраль 2024). Не сертификация, а meta-framework. В версии 2.0 функций стало шесть: к привычным Identify / Protect / Detect / Respond / Recover добавили Govern, и она стоит в центре — то есть NIST явно зафиксировал, что без ответа на вопрос «кто здесь принимает решения о рисках» остальные пять функций повисают в воздухе. Полезен для structuring подхода даже если не нужен formal cert.
- **[FedRAMP Authorization](https://www.fedramp.gov/)** (GSA). Для SaaS, продающего в US федеральные agencies. Высокий barrier (Low / Moderate / High baselines на базе NIST SP 800-53). Не продаёте в US gov — проходите мимо.
- **[GDPR](https://gdpr-info.eu/)** + **[California CCPA/CPRA](https://oag.ca.gov/privacy/ccpa)**. Privacy regulations, не security frameworks; но GDPR требует security controls (Art. 32) — пересекается с SOC 2/ISO 27001.

### Статьи и доклады

- **[Krebs on Security — Capital One 2019 breach](https://krebsonsecurity.com/2019/07/capital-one-data-theft-impacts-106m-people/)**. Главный кейс про «SOC 2 compliant + breached». Полезно как иллюстрация для команды, которая считает, что прохождение аудита = безопасность.
- **[OneTrust DataGuidance Comparison Tool](https://www.dataguidance.com/)**. Удобный matrix для сравнения privacy regulations по jurisdictions.
- **[Cloud Security Alliance — Cloud Controls Matrix (CCM)](https://cloudsecurityalliance.org/research/cloud-controls-matrix/)**. Mapping между cloud security controls и ~20 фреймворками (SOC 2, ISO 27001, PCI-DSS, HIPAA, NIST 800-53 и др.). Сильно сокращает effort при multi-framework compliance.

### Инструменты

- **GRC platforms (automated compliance):** [Vanta](https://www.vanta.com/), [Drata](https://drata.com/), [Secureframe](https://secureframe.com/), [Hyperproof](https://hyperproof.io/), [Sprinto](https://sprinto.com/), [OneTrust](https://www.onetrust.com/) (enterprise). По моим наблюдениям, Vanta и Drata доминируют в сегменте стартапов на первом SOC 2; OneTrust чаще выбирают крупные orgs со сложным privacy scope.
- **Cloud-native compliance:** [AWS Audit Manager](https://aws.amazon.com/audit-manager/), [AWS Security Hub](https://aws.amazon.com/security-hub/), [Google Cloud Compliance Reports Manager](https://cloud.google.com/security/compliance/compliance-reports-manager), [Microsoft Purview Compliance Manager](https://learn.microsoft.com/en-us/purview/compliance-manager). Полезны если 90% инфраструктуры в одном cloud; для multi-cloud — недостаточно.
- **Policy as code:** [Open Policy Agent (OPA)](https://www.openpolicyagent.org/) + [Conftest](https://www.conftest.dev/), [HashiCorp Sentinel](https://www.hashicorp.com/sentinel), [Cloud Custodian](https://cloudcustodian.io/), [Checkov](https://www.checkov.io/), [Kyverno](https://kyverno.io/). Continuous compliance test на каждый IaC PR; Checkov часто берут на старт за низкий barrier.
- **Evidence collection automation:** Vanta/Drata integrations + custom скрипты (boto3 / gcloud / kubectl → JSON snapshots в S3 bucket с retention). По моим наблюдениям, разница между «compliance каторгой» и «compliance в фоне» — именно в этом слое.
- **Vendor risk management:** [Whistic](https://www.whistic.com/), [SecurityScorecard](https://securityscorecard.com/), [BitSight](https://www.bitsight.com/). Для управления third-party риском (PCI-DSS req 12.8, SOC 2 CC9.2).

## Best practices

Главный публичный кейс — **Capital One 2019 breach** (CVE никогда не было; misconfigured WAF). Данные 106 миллионов человек утекли через SSRF на AWS metadata endpoint. Речь про банк с полным набором регуляторных требований, внутренними аудитами безопасности и работающим vulnerability management — то есть про организацию, где формальная сторона была закрыта лучше, чем у большинства читателей этого листа. Что не сработало — control над **configuration drift в WAF rules**: одна misconfiguration на одном WAF не была отловлена ни одним audit-control, потому что аудит проверял «WAF существует и настроен» в момент времени, не «WAF configuration соответствует policy непрерывно». Урок для меня: compliant ≠ secure; *audit моментом времени* ≠ *continuous compliance*. Это второй по силе аргумент в пользу compliance-as-code (первый — снижение audit pain).

Отсюда три рабочих правила. Первое: compliance — драйвер требований, а не самостоятельная цель. Каждый control ложится на техническую практику, которая имеет смысл и без аудитора. Если контроль порождает работу исключительно ради аудита и больше нигде не всплывает, это compliance theater — либо драйвер слабый, либо технический эквивалент уже есть и контроль его дублирует. Раз в год scoping полезно перепроверять целиком.

Второе: сбор evidence автоматизируется с первого дня сертификации, а не после первого болезненного аудита. Ручной сбор накануне — самая трудоёмкая и самая хрупкая часть всей истории. По моим наблюдениям, команды, автоматизировавшие evidence на старте, тратят на следующий аудит пятую часть времени от первого. Те, кто решил «соберём руками, потом подумаем», сидят в этом режиме годами.

Третье: SOC 2 Type II — период, а не момент. Контроль работает **весь** observation period, обычно от полугода до года. Access review, проведённый один раз накануне аудита вместо ежеквартального по политике, превращается в finding. Записанная cadence обязана совпадать с фактической, иначе на выходе будет qualified opinion.

**Choose your frameworks по клиентскому спросу, не по «полнее — лучше».** Я регулярно вижу startup'ы, которые в первый год хотят SOC 2 Type II + ISO 27001 + HIPAA + PCI-DSS «на будущее». Такая стратегия не работает: стоит она половины security headcount за год, а отдачи не даёт, потому что клиенты этого не просили. Сначала клиентский спрос (sales pipeline застревает на «у вас SOC 2?»), потом сертификация. Исключения — regulated industries (healthcare → HIPAA сразу, payments → PCI-DSS сразу).

**Inheritance model — серьёзная экономия в multi-product / multi-subsidiary orgs.** Если parent org сертифицирован по SOC 2, subsidiary могут inherit infrastructure controls (data center physical security, network segmentation), и аудит subsidiary становится дешевле и быстрее. Cloud providers (AWS, GCP, Azure) публикуют SOC reports — их inheritance покрывает часть infra-control'ов для всех клиентов. Это надо явно использовать в scoping; auditor сам не предложит.

**Continuous control testing > point-in-time evidence.** OPA/Sentinel policy в pipeline → каждый PR с IaC проверяется против compliance rules → continuous evidence «control действует на дату X-Y-Z». Это не только дешевле, чем manual evidence, это **обнаруживает drift на следующий PR, а не через год**. Тот же principle что в [GitOps](/The-Way-of-SRE/leaves/engineering/gitops/) drift detection, только применённый к security/compliance policy.

**Read auditor's findings carefully — они полезны независимо от рейтинга.** Qualified opinion (есть findings) не катастрофа: auditor подсветил реальную проблему, которая может вырасти в incident. Unqualified opinion с zero findings часто означает, что либо аудит был поверхностный, либо вы переплатили за compliance theater. Я читаю findings не как «что закрыть до next audit», а как «где security gap, который мы пропустили».

## Связанные листья

- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — patch SLA per severity напрямую следует из SOC 2 CC7.1 / PCI-DSS Req 6 / ISO 27001 A.8.8. Compliance даёт numerical baseline; VM реализует.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — encryption at rest / in transit, key management, access controls — pervasive требования во всех frameworks.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — SOC 2 CC3.x / ISO 27001 A.5.7 требуют risk assessment; threat model — наиболее операциональная форма.
- **[Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)** — SOC 2 CC6.x — большой блок про logical access; IAM лист даёт техническую реализацию.
- **[Supply Chain Security](/The-Way-of-SRE/leaves/practices/supply-chain-security/)** — vendor risk management (SOC 2 CC9.2), third-party assessments, SBOM как evidence.
- **[Backup & Restore](/The-Way-of-SRE/leaves/engineering/backup-restore/)** — SOC 2 Availability category + ISO 27001 A.8.13 требуют tested backups; RPO/RTO — фиксированная часть evidence.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — SOC 2 CC7.3 и применимые breach-notification rules требуют явного routing. Для GDPR Art. 33 учитываются awareness controller о personal data breach и risk exception, а не универсальный таймер для любого security incident.
- **[Change Governance](/The-Way-of-SRE/leaves/practices/change-governance/)** — SOC 2 CC8.1 / ISO 27001 A.8.32 — change management process с approvals, testing, rollback.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — git history как audit trail; continuous reconciliation как evidence для CC6 (access) и CC8 (change).
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — control ownership matrix маппится на service ownership; без явных owners большая часть controls — orphan.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/)** — SOC 2 Availability / PCI-DSS Req 12.10 / ISO 22301 требуют документированную DR / BCP с evidence of testing. DR Policy — mandatory audit artifact в regulated industries.

## Открытые вопросы

HITRUST CSF пока висит без решения: отдельный лист под специфику healthcare или подсекция здесь? Мне кажется, подсекция, но уверенности нет. Похожая история с Continuous Controls Monitoring — рынок инструментов растёт быстро, и через год-два это, возможно, вырастет в самостоятельную практику. Ещё один сосед — change management под SOX и PCI *(TBD)*, где каждое изменение тянет за собой формальное одобрение и evidence; тема сейчас числится за L1 Change Management и с этим листом заметно пересекается.

С SOC 1 я глубоко не разбирался. Это другой класс аудита, про финансовую отчётность, и в SRE-командах он встречается редко. Если он у вас в scope, расскажите PR'ом, как с этим живётся.

Отдельно не хватает честного сравнения GRC-платформ. Публичной модели выбора между Vanta, Drata и Secureframe под конкретный сценарий я не нашёл, а вендорские demo показывают ровно одну сторону. Если у вас была миграция между ними, такой опыт был бы очень к месту.
