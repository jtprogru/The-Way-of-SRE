---
title: DR Policy & Stakeholders
description: Политика реагирования на катастрофические сценарии — про decision rights и stakeholder map, не про backup
sfia: [4, 5, 6]
status: draft
---

«У нас есть disaster recovery, мы делаем backup'ы» — фраза, которую я слышу регулярно и которая ничего не означает. Backup — это инженерная практика, она про **технологию**: где данные, какой PITR, какой restore MTTR. См. [Backup & Restore](/The-Way-of-SRE/engineering/backup-restore/), там подробно. DR Policy — это **управленческий документ**: какие сценарии мы планируем (полная потеря региона? компрометация cloud account? cyber-attack? физическое уничтожение DC?), какой RTO/RPO **на уровне org**, кто принимает решение о failover (CTO? service owner? on-call IC?), кого информируем и в каком порядке (executive → board → regulators → customers → public). Лист — про эту вторую часть, которая чаще всего отсутствует или существует в виде слайдов трёхлетней давности.

Граница с backup-restore явная: тот лист — **per-service технические артефакты** (как делать backup'ы PostgreSQL, как тестировать restore, какой PITR). Этот лист — **org-level governance** (какие сценарии в scope DR, какие decision rights, какой stakeholder map). Граница с [Game Day / Chaos Drills](/The-Way-of-SRE/culture/game-day/) — там про training и валидацию реакции команды; здесь про policy, к которой эта реакция привязана. Полный full-scale DR exercise (DiRT-style) — это game day, который **тренирует именно эту policy**.

## Что должен уметь

Главный навык на уровне L5 — **формулировать decision rights явно, до момента disaster**. В моменте disaster никто не открывает policy: телефон звенит, все паникуют, executives ждут ответа. Если до этого не закреплено «failover на secondary region — решение CTO; ad-hoc decisions в моменте — IC принимает; communication to customers — Comms Lead согласует с Legal в течение 30 минут» — каждый из этих вопросов решается ad-hoc, под давлением, с предсказуемо плохими результатами. Я регулярно вижу команды, у которых backup-restore работает, runbook'и actual, но DR policy — это полстраницы из 2019 года, которую никто не читал. В моменте disaster это эквивалентно отсутствию policy.

**L4**
- Знает DR policy своей org / команды: какие сценарии в scope, какие RTO/RPO targets, кто owner. Может найти документ за 30 секунд, не «в Confluence где-то есть».
- Понимает свою роль в stakeholder map'е: при каких сценариях его информируют, что от него ожидается, кому он эскалирует.

**L5**
- Пишет или ревьюит DR policy своей команды: scope (какие сценарии), strategy tier (backup-restore / pilot light / warm standby / multi-site), RTO/RPO targets, decision rights, communication tree, regulatory implications.
- Согласует RTO/RPO targets с business: cost of downtime × duration, customer impact, regulatory exposure. Без quantitative обоснования цифры выглядят произвольно и не выдерживают cost discussion.
- Проектирует annual DR exercise: full-scale tabletop минимум раз в год + functional drill (реальный failover) раз в 6-12 месяцев. Тренировочная сторона разобрана в [Game Day / Chaos Drills](/The-Way-of-SRE/culture/game-day/).
- Поддерживает DR policy как living document: ревизия раз в 6-12 месяцев, после каждого significant incident, при изменении архитектуры / vendors / regulatory requirements.

**L6+**
- Внедряет DR policy на уровне org: согласует с executive team, legal, compliance; интегрирует с broader Business Continuity Plan (BCP); ведёт annual DR programme с budget и executive sponsorship.
- Ведёт переговоры с регуляторами и аудиторами по DR-readiness: SOC 2 Trust Services Criteria (Availability), PCI-DSS req 12, GDPR breach notification, отраслевые требования банков и медицины.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/data-integrity/)** (O'Reilly, 2016), глава 26 «Data Integrity». Не покрывает DR policy напрямую, но описывает внутренний подход Google к ежегодным учениям DiRT на уровне всей организации. Базовое чтение.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://sre.google/books/building-secure-reliable-systems/)** (O'Reilly, 2020), глава 16 «Disaster Planning» (дальше по порядку идут «Crisis Management» и «Recovery and Aftermath» — три главы читаются как одна). Один из немногих публичных источников, объединяющих reliability и security DR (cyber-disaster, не только инфраструктурный). По моим наблюдениям — лучший единичный источник по теме на 2026 год.
- ISO 22301 — **Business Continuity Management Systems** (стандарт). Не книга, а ISO standard, но если ваша org регулируется (banking, healthcare, government) — это referenced framework, который аудиторы будут спрашивать. Платный; есть public summaries.

### Статьи и доклады

- AWS — **[Disaster Recovery (DR) Architecture on AWS, Part I: Strategies for Recovery in the Cloud](https://aws.amazon.com/blogs/architecture/disaster-recovery-dr-architecture-on-aws-part-i-strategies-for-recovery-in-the-cloud/)**. Канонический референс 4-tier strategy: Backup & Restore / Pilot Light / Warm Standby / Multi-Site Active-Active. По смыслу от облака не зависит, даже если вы читаете его не на AWS.
- **[Atlassian April 2022 outage retrospective](https://www.atlassian.com/engineering/post-incident-review-april-2022-outage)**. Public postmortem: сайты 775 клиентов были удалены, полное восстановление заняло две недели — backup'ы существовали, но процедуру восстановления к такому масштабу кризиса не готовили. Главный публичный кейс «backup-strategy на бумаге vs реальный RTO». См. ниже в Best practices.
- **Пожар в дата-центре OVH в Страсбурге (март 2021)**. Здание SBG2 сгорело физически за несколько часов. Клиенты без off-site backup потеряли всё; клиенты с backup в другом регионе восстановились. Самый яркий публичный кейс «physical disaster — реальный сценарий, не мысленный».
- Kripa Krishnan — **[Weathering the Unexpected](https://queue.acm.org/detail.cfm?id=2371516)** (ACM Queue, 2012). DiRT в Google как annual full-scale DR exercise; единственный долго живущий публичный референс на org-level DR programme.

### Инструменты

- **DR Policy как markdown в репозитории** — основной артефакт практики. Один документ на org / business unit; PR-based review; история через git. По моим наблюдениям, это самый частый формат для tech-driven org'ов; для регулируемых — параллельно Word / PDF для compliance audit.
- **Stakeholder Map / RACI matrix** — простая таблица: сценарий × роль × responsibility (Responsible / Accountable / Consulted / Informed). По моим наблюдениям, в кризисе RACI на полстраницы ценится выше, чем policy на двенадцать страниц.
- **Communication tree (decision tree)** — кого и когда информируют: executive (immediate), board (1 hour for SEV1), regulators (по типу + jurisdiction), customers (status page + email), public (PR-coordinated). Без явного tree decisions «звать ли legal?» принимаются ad-hoc.
- **[AWS Resilience Hub](https://aws.amazon.com/resilience-hub/) / [Azure Site Recovery](https://azure.microsoft.com/en-us/products/site-recovery)** — managed-platform для DR orchestration: definition RTO/RPO targets per app, automated runbook'и failover, drill scheduling. Имеет смысл, когда DR strategy — это warm standby / multi-site с явным failover automation.
- **Annual DR drill calendar** — фиксированный календарь tabletop'ов и functional drills с executive sponsorship. Без календаря drills деградируют в «когда будет время» = никогда.

## Best practices

Главный публичный кейс — **Atlassian outage 5 апреля 2022**. За двадцать три минуты, с 07:38 до 08:01 UTC, скрипт удаления устаревшего приложения снёс 883 сайта, принадлежавших 775 клиентам. Backup'ы существовали (Atlassian активно инвестировал в backup strategy), но процедуру восстановления никто не проверял на масштабе кризиса: одного клиента поднимали часами вручную, параллелить получалось плохо. Первых клиентов вернули 8 апреля, последних — только 18-го, то есть до **14 дней** для части пострадавших. В собственном разборе Atlassian признаёт, что RPO в один час они выдержали, а RTO — нет: заявленная цель измерялась часами, фактическое восстановление — двумя неделями. Главный урок — не «backup'ы не работали» (они работали), а «**DR policy не была validated на realistic disaster scale**». Я считаю, это самый ценный публичный кейс последних лет для конкретно DR policy: показывает разницу между «у нас есть DR» и «у нас есть protected RTO под realistic crisis».

Первое различение — самое частое. DR Policy не равна backup strategy, хотя «у нас же делаются backup'ы, значит DR есть» я слышу постоянно. Backup живёт в технологическом слое, а policy отвечает за управление: какие сценарии в scope, у кого какие права решения, как выглядит stakeholder map. Backup без policy — это технология без правил применения.

Права решения фиксируются до катастрофы, а не «когда понадобится». В момент, когда телефоны разрываются и executive ждёт ответа, policy не открывает никто. Значит, заранее записано: решение о failover принимает CTO, ad-hoc решения в моменте — IC, а сообщение клиентам Comms Lead согласует с Legal в течение 30 минут.

Отдельно про цифры. «Как можно быстрее, как можно меньше потерь» — это не RTO и не RPO, это пожелание. Работают конкретные числа: RTO 4 часа для tier-1, 24 часа для tier-2, 7 дней для tier-3, — и каждое обосновано через стоимость простоя за единицу времени, регуляторные требования и SLA перед клиентами. Без чисел стратегия резервного копирования строится по ощущениям.

**Масштаб учений должен совпадать с масштабом катастрофы.** Кейс Atlassian ровно об этом: тренировка на восстановление одного клиента не равна способности восстановить семьсот с лишним одновременно. Я регулярно вижу команды, у которых restore-drill для одного сервиса проходит за 30 минут — и в policy стоит RTO в один час. Настоящая катастрофа означает одновременное восстановление десятка сервисов с параллельной нагрузкой на runbook'и, людей и инструменты. RTO в кризисе и RTO в учении на одном сервисе — разные величины. Честное число — это MTTR полного сценария на реалистичном масштабе, измеренный на ежегодных учениях. Без него RTO в policy остаётся оптимистичной фантазией.

**4-tier strategy — это про cost, не про защиту.** AWS 4-tier framework (Backup & Restore / Pilot Light / Warm Standby / Multi-Site Active-Active) часто читают как «выберите свой уровень». Это полу-правда. Реальный выбор — это **trade-off cost × RTO**. Multi-Site Active-Active даёт RTO ≈ 0 ценой удвоения инфраструктуры; Backup & Restore — RTO часы / дни ценой почти нулевой дополнительной стоимости. Решение принимается **per service tier**, не как глобальная политика: tier-1 (revenue-critical, regulatory-required) — Warm Standby или Multi-Site; tier-2 (internal-facing, important) — Pilot Light; tier-3 (batch, analytics) — Backup & Restore. Единый уровень для всех сервисов либо разоряет (всё Multi-Site), либо оставляет риск на самом видном месте (всё Backup & Restore). И вот здесь у практики есть чёткая граница: пока у команды один сервис и один регион, отдельная DR policy не работает как инструмент — выбор всё равно один, и он умещается в пару строк рядом с runbook. Смысл появляется с момента, когда сервисов несколько и они разного веса для бизнеса.

**Stakeholder map важнее точных runbook'ов в момент crisis.** В моменте disaster ключевой вопрос — не «как восстановить», а «кому позвонить и кто решает». Я наблюдаю это устойчиво: команды, у которых **runbook'и идеальные** но **stakeholder map отсутствует**, теряют 1-2 часа на «кто принимает решение об failover», «звать ли CEO», «когда public statement». Команды с **half-page RACI matrix** + **simple communication tree** реагируют быстрее с runbook'ами среднего качества. Это не значит, что runbook'и не важны (см. соседние листья); это значит, что **отсутствие stakeholder map'а — самый дешёвый и самый частый failure mode**.

**Annual DR exercise — единственный способ валидации policy.** Я регулярно вижу policy документы, которые «звучат разумно» на ревью, но в момент disaster обнаруживается, что они нерабочие: ссылаются на людей, которых давно нет; на инструменты, которые сменились; на decision rights, которые перешли к другой команде. Ежегодное full-scale DR exercise — единственный способ это найти **до** реального disaster. Формат: tabletop на 4-8 часов без инъекции отказов, только обсуждение, минимум раз в год; functional drill с реальным failover в резервный регион — раз в 6-12 месяцев. Тренировочная часть подробно разобрана в [Game Day / Chaos Drills](/The-Way-of-SRE/culture/game-day/).

**Regulatory implications — не «прихоть compliance»**. SOC 2 Trust Services Criteria (Availability), PCI-DSS requirement 12.10, GDPR Article 32 (security of processing) — все требуют документированную DR / BCP с **доказательствами testing**. Auditor спросит не «есть ли policy», а «когда был последний drill и какие были findings». В regulated industries (banking, healthcare, payments) DR policy — это **mandatory artifact с audit trail**, не optional. Я регулярно вижу startup'ы, которые откладывают DR policy «до Series B» — и обнаруживают, что enterprise клиент требует доказательств DR-readiness как условие contract. Откладывать дальше первого разговора про compliance — это технический долг с явным дедлайном.

## Связанные листья

- **[Backup & Restore](/The-Way-of-SRE/engineering/backup-restore/)** — техническая основа DR strategy; per-service backup mechanisms / restore drills / RPO/RTO. Без работающего backup-restore любая DR policy — обещание. Без DR policy backup-restore не имеет org-level правил применения.
- **[Service Ownership](/The-Way-of-SRE/culture/service-ownership/)** — service catalog содержит per-service tier (1/2/3), RTO/RPO targets, DR strategy. DR policy задаёт **рамки**; service catalog — **per-service инстанциация**.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/culture/game-day/)** — annual DR exercise как полномасштабный game day. Здесь — policy и stakeholder map; там — тренировочная сторона проверки.
- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — DR scenario — особый класс инцидентов (SEV1+ с long-running response); incident response process в DR-scope расширен (executive escalation, regulatory notification, prolonged war room).
- **[Customer Communications](/The-Way-of-SRE/practices/customer-communications/)** — communication tree — часть DR policy; частота сообщений в зависимости от severity и выбор каналов живут на пересечении.
- **[Playbooks](/The-Way-of-SRE/culture/playbooks/)** — DR scenario playbook — отдельный артефакт; роли (CTO, IC, Comms, Legal), first 60 minutes, decision points, regulatory notifications.
- **[Vendor Management](/The-Way-of-SRE/practices/vendor-management/)** — DR policy включает vendor-dependent сценарии (cloud provider outage, SaaS vendor incident); vendor exit strategy — DR concern.
- **[Compliance Frameworks](/The-Way-of-SRE/practices/compliance-frameworks/)** — SOC 2 Availability, PCI-DSS 12.10, ISO 22301 требуют документированную DR policy с testing evidence; DR policy — артефакт audit.
- **[Status Page Management](/The-Way-of-SRE/practices/status-page-management/)** — DR scenario требует extended status page cadence (часы → дни), стратегия communications должна быть задана policy заранее.
- **[Stakeholder Management](/The-Way-of-SRE/culture/stakeholder-management/)** — DR stakeholder map — scenario-specific governance в моменте disaster; тот лист — про continuous stakeholder relationship, этот — про crisis-specific.

## Открытые вопросы

- **Business Continuity Plan (BCP)** — более широкий документ, включающий people, processes, facilities (не только IT). DR — часть BCP. Я не уверен, что BCP должен быть отдельным листом в SRE-карте: широкая часть — про HR / facilities, не SRE-domain. Возможно, осмысленно покрыть как short section в DR Policy.
- **Cyber-disaster recovery** *(TBD)* — ransomware, account compromise, supply-chain attack как DR-сценарии. Пересечение с Information Security; см. [Security Chaos Engineering](/The-Way-of-SRE/practices/security-chaos-engineering/) и [Supply Chain Security](/The-Way-of-SRE/practices/supply-chain-security/). Возможно отдельный лист «Cyber-Disaster Recovery» под Information Security.
- **Multi-cloud DR** — резервная копия у другого облачного провайдера как защита от компрометации всего аккаунта. На начало 2026 года практика частая в финтехе и enterprise; в стартап-сегменте — редкая (cost / complexity). Я не нашёл хорошей публичной литературы по проектированию multi-cloud DR architecture; рабочих case-studies мало.
