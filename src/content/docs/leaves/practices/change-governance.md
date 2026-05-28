---
title: Change Governance
description: Дисциплина границ изменения в production — change classification, production readiness review, freeze policy, error budget gating
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Change Management / Change Governance
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Мы catit в любой момент, у нас zero-friction culture» — лозунг, за которым часто стоит «у нас нет production readiness, мы катит и надеемся». Change Governance — это **дисциплина границ**, не bureaucracy: какие изменения попадают на fast lane (standard change, без review), какие требуют PRR, какие никогда не катятся в peak season. Я регулярно вижу команды, которые думают, что бинарный выбор — либо «CAB-meeting раз в неделю» (heavy bureaucracy), либо «zero process» (Russian roulette). Между ними — лёгкий, явный classification и явные gates, которые добавляют 30 секунд к standard change и 2 дня к high-risk change. Это и есть здоровое governance.

Граница: [Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/) — *техника* deployment (canary / blue-green / feature flag). Change Governance — *policy и process*: что классифицируется как high-risk, кто approves, когда заморозка. [Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/) — про architectural decisions; change governance — про operational/release decisions с риском в production.

## Что должен уметь

Главный навык на уровне L5 — спроектировать **change classification** так, чтобы 80–90% изменений шли по fast lane (standard change, code review достаточен), 10–15% — по normal lane (PRR / change review для нестандартных изменений), 5% — по freeze-bypass procedure для emergency. По моим наблюдениям, неработающий change governance — это либо «всё normal» (вся работа замирает в CAB-meetings) либо «всё standard» (никакие нестандартные изменения не получают review). Healthy governance — это явная категория «standard» с критериями, чтобы команда знала, когда «не нужен review».

- **L3** — Следует existing change governance: знает, какой класс изменения требует какого review (PR review / RFC / PRR), готовит change request с rollback plan, blast radius assessment, validation steps.
- **L3** — Понимает разницу между standard / normal / emergency change; не маркирует normal change как emergency для bypass review.
- **L4** — Проводит **Production Readiness Review (PRR)** для нового сервиса или major изменения: SLO defined, monitoring + alerts, runbooks, on-call coverage, capacity plan, rollback validated.
- **L4** — Реализует change freeze policy: peak season (Black Friday, end-of-quarter close), major launches, mobile release cuts. Freeze ≠ полный stop — это явный whitelist того, что разрешено.
- **L5** — Проектирует change classification system для команды / org: критерии standard / normal / emergency, approver chain для каждой категории, метрики performance (% standard, time-to-approval normal, post-change incident rate).
- **L5** — Включает **error budget gating**: при сожжённом SLO budget автоматически фриз feature changes; разрешены только reliability fixes. Без gating SLO становится дашбордом, не tool принятия решений.
- **L6+** — Связывает change governance с org SLO program: change risk assessment use SLO data (предыдущие incidents в данной области → выше risk weighting); calibration risk оценок раз в квартал.
- **L6+** — Внедряет PRR program для новых сервисов как gate перед production: written checklist, owner of review process, follow-up на open items до GA.

## Материалы

### Книги

- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/evolving-sre-engagement-model/)** (O'Reilly, 2016), глава 32 «The Evolving SRE Engagement Model». Google's PRR процесс — каноническое описание PRR как gate перед SRE-engagement. Главный публичный источник по PRR.
- Jennifer Davis, Katherine Daniels — **[Effective DevOps](https://www.oreilly.com/library/view/effective-devops/9781491926291/)** (O'Reilly, 2016). Глава про change management в DevOps-контексте: как избежать bureaucracy без потери контроля.
- Mark Schwartz — **[A Seat at the Table](https://itrevolution.com/product/a-seat-at-the-table/)** (IT Revolution, 2017). Не SRE-книга, но фундамент про change governance в продуктовых организациях: почему ITIL-style change management не работает в agile-команде и что вместо.
- Nicole Forsgren, Jez Humble, Gene Kim — **[Accelerate](https://itrevolution.com/product/accelerate/)** (IT Revolution, 2018). Связка change governance ↔ deployment frequency ↔ change failure rate (DORA-метрики). Главный аргумент против heavy change approval boards.

### Статьи и доклады

- **[ITIL 4: Change Enablement](https://www.axelos.com/certifications/itil-service-management/itil-4-foundation)**. Современный ITIL отказался от «Change Management» в пользу «Change Enablement» (subtle, но важный shift). Полезно для словаря и для разговора с enterprise IT.
- Knight Capital Group — **[SEC Filing on August 1 2012 trading loss](https://www.sec.gov/litigation/admin/2013/34-70694.pdf)**. Не статья про governance, но первичный источник кейса (см. ниже).
- John Allspaw — **[On Being a Senior Engineer](https://www.kitchensoap.com/2012/10/25/on-being-a-senior-engineer/)** (Kitchen Soap, 2012). Косвенно: change governance — это senior judgement, а не process; стандарты appropriated for context.

### Инструменты

- **Issue tracker (Jira / Linear / GitHub Issues)** — primary запись change request: classification, owner, approver, status. Без явной записи governance существует только в Slack.
- **[ServiceNow Change Management](https://www.servicenow.com/products/change-management.html)** / **Jira Service Management** — enterprise change platforms; полезны при regulatory compliance (SOX, ISO 27001, PCI-DSS). Для команды до 50 человек обычно overkill.
- **[FireHydrant Change Tracking](https://firehydrant.com/) / [incident.io](https://incident.io/)** — incident platforms с change tracking: видно, какие changes были до incident (forensics + future risk-weighting).
- **PRR checklist as living document** — markdown в repo / Notion. Самый важный инструмент, не technology. По моим наблюдениям, простой checklist выигрывает у любой specialized platform для команд до ~200 инженеров.
- **Анти-инструмент:** weekly CAB meeting как primary mechanism. Если 80% changes идут через meeting — change governance мертв; команда либо обходит, либо саботирует.

## Best practices

Главный публичный кейс — **Knight Capital Group, August 1, 2012**. За 45 минут утром на Уолл-стрит компания потеряла **$440M** из-за deploy-ошибки: deploy script был run на 7 из 8 серверов; восьмой сервер запустил старую версию кода с repurposed feature flag, отправил миллиарды buy/sell orders и обанкротил компанию через 4 дня. SEC-документ детально разбирает: не было PRR для repurposed feature flag, deploy script не проверял consistency между серверами, rollback procedure не валидировалась. Я регулярно вижу команды, у которых такое же сочетание факторов («deploy на N серверов, потом проверим»; «feature flag repurposed без change record») — но без trading-volume Knight Capital impact меньше, и команда не учится. Knight Capital — лучший public reminder того, что governance не nice-to-have.

**Короткие правила:**

- **Classification обязателен.** Без явной разницы «standard / normal / emergency» все changes равнозначны — и команда либо тонет в process, либо обходит его. 80–90% changes должны быть standard (fast lane, code review достаточен).
- **Каждый change имеет rollback plan, validated.** «Rollback задеплоим если что» — не plan. Pre-deployment validation rollback на staging для high-risk changes — обязательна.
- **PRR — обязательный gate для новых сервисов перед production.** Написанный checklist, owner of review, follow-up open items. PRR без follow-up — theatre.

Подробнее:

**Production Readiness Review — checklist, не interview.** В Google PRR — комбинация written review (checklist) + meeting (questions). Команды часто пытаются делать PRR как «meeting раз в неделю» — это не работает, потому что preparation важнее meeting'а. Healthy PRR: команда сервиса заполняет written checklist (SLO defined, monitoring + alerts, runbooks present, on-call configured, capacity plan, dependencies mapped, rollback validated, security review done); meeting — дополнение к review, а не replacement. По моим наблюдениям, если PRR существует только как meeting — checklist деградирует к «формальностям», и через год PRR становится theatre.

**Error budget gating связывает change governance с SLO program.** Без gating SLO — dashboard, который никто не смотрит. С gating SLO становится tool принятия решений: budget сожжён → пауза feature changes, разрешены только reliability fixes. Это не «всем замолчать» — это явный сигнал, что приоритеты смещаются. Я регулярно вижу команды, которые объявили SLO + error budget, но не реализовали gating — и через полгода budget chronically negative, никаких изменений в поведении нет, потому что нет actual consequence.

**Change freeze ≠ полный stop.** Распространённый страх: «freeze = команда простаивает». Healthy freeze — это явный whitelist: «во время Black Friday week разрешены только reliability fixes / security patches с SEV2+; feature changes — отложены на post-freeze». Whitelist + duration + signed-off list — лёгкая дисциплина. Freeze без whitelist становится либо игнорируемым (все продолжают катит), либо болезненно строгим (важные fixes не доезжают).

**Standard change category — главный мускул governance.** Парадоксально: качество governance мерится не тем, как строго проходят high-risk changes, а тем, как много changes квалифицируются как standard (fast lane). Если 50% changes требуют review — governance душит team velocity и саботируется. Healthy ratio: 80–90% standard (proven pattern, low risk: bugfix в одном сервисе, config change validated by tests, dependency bump within minor version), 10–15% normal (требует PRR / review), 1–5% emergency / freeze-bypass.

## Связанные листья

- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — техника deployment; canary / blue-green / feature flag — реализация safe rollout. Этот лист — policy: что катить и кто approves; progressive delivery — как катить безопасно.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — error budget — input для change gating. SLO без gating — дашборд, не tool.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — ADR — для architectural decisions (выбор технологии, design pattern); change governance — для operational decisions (что и когда катит).
- **[Action Items Tracking](/The-Way-of-SRE/leaves/practices/action-items-tracking/)** — PRR open items — это AIs; tracking их выполнения до GA — часть PRR follow-through.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — change as primary suspect: первое, что смотрит IC после page — recent deploys.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog содержит PRR status сервиса (passed / not passed / in progress); это часть «есть ли owner и готовность к prod».
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — change-related incidents → post-mortem AIs часто касаются governance (отсутствие PRR, broken rollback, missed approval).

## Открытые вопросы

- **Production Readiness Review как отдельный лист** *(TBD)* — детальный checklist, ownership, scaling PRR на 50+ сервисов.
- **Change Risk Assessment Frameworks** *(TBD)* — heuristics для оценки risk: blast radius × probability × reversibility. Нет canonical модели; разные команды строят свои.
- **Change Failure Rate как DORA-метрика** — измерение качества change governance через post-change incident rate; связь с deployment frequency (Accelerate). Может стать частью SLO Engineering или separate leaf.
- **Compliance-Driven Change Management** *(TBD)* — SOX / PCI-DSS / SOC2 формальные требования к change records; пересечение с regulatory leaves.
- Я не уверен, **где правильная граница** между Change Governance и Progressive Delivery для команд, где governance lightweight (deploy on push, no explicit review). Если у вас есть рабочая модель — расскажите через PR.
