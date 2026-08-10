---
title: Change Governance
description: Дисциплина границ — что катится в production без review, что через PRR, а что не катится вовсе
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Change Management / Change Governance
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Мы катим в любой момент, у нас zero-friction culture» — лозунг, за которым часто стоит «у нас нет production readiness, мы катим и надеемся». Change Governance — это **дисциплина границ**, а не бюрократия: какие изменения идут по быстрой полосе без review, какие требуют PRR, какие вообще не катятся в высокий сезон. Я регулярно вижу команды, уверенные, что выбор бинарный: либо еженедельный CAB, либо полное отсутствие процесса. Между этими полюсами лежит нормальная жизнь — явная классификация и явные gates, которые добавляют полминуты к рядовому изменению и пару дней к рискованному. Это и есть здоровое governance.

Граница: [Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/) — *техника* deployment (canary / blue-green / feature flag). Change Governance — *policy и process*: что классифицируется как high-risk, кто approves, когда заморозка. [Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/) — про architectural decisions; change governance — про operational/release decisions с риском в production.

## Что должен уметь

Главный навык на уровне L5 — спроектировать **change classification** так, чтобы 80–90% изменений шли по fast lane (standard change, code review достаточен), 10–15% — по normal lane (PRR / change review для нестандартных изменений), 5% — по freeze-bypass procedure для emergency. По моим наблюдениям, неработающий change governance — это либо «всё normal» (вся работа замирает в CAB-meetings) либо «всё standard» (никакие нестандартные изменения не получают review). Healthy governance — это явная категория «standard» с критериями, чтобы команда знала, когда «не нужен review».

**L3**
- Следует existing change governance: знает, какой класс изменения требует какого review (PR review / RFC / PRR), готовит change request с rollback plan, blast radius assessment, validation steps.
- Понимает разницу между standard / normal / emergency change; не маркирует normal change как emergency для bypass review.

**L4**
- Проводит **Production Readiness Review (PRR)** для нового сервиса или major изменения: SLO defined, monitoring + alerts, runbooks, on-call coverage, capacity plan, rollback validated.
- Реализует change freeze policy: peak season (Black Friday, end-of-quarter close), major launches, mobile release cuts. Freeze ≠ полный stop — это явный whitelist того, что разрешено.

**L5**
- Проектирует change classification system для команды / org: критерии standard / normal / emergency, approver chain для каждой категории, метрики performance (% standard, time-to-approval normal, post-change incident rate).
- Включает **error budget gating**: при сожжённом SLO budget автоматически фриз feature changes; разрешены только reliability fixes. Без gating SLO становится дашбордом, не tool принятия решений.

**L6+**
- Связывает change governance с org SLO program: change risk assessment use SLO data (предыдущие incidents в данной области → выше risk weighting); calibration risk оценок раз в квартал.
- Внедряет PRR program для новых сервисов как gate перед production: written checklist, owner of review process, follow-up на open items до GA.

## Материалы

### Книги

- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/evolving-sre-engagement-model/)** (O'Reilly, 2016), глава 32 «The Evolving SRE Engagement Model». Google's PRR процесс — каноническое описание PRR как gate перед SRE-engagement. Главный публичный источник по PRR.
- Jennifer Davis, Katherine Daniels — **[Effective DevOps](https://www.oreilly.com/library/view/effective-devops/9781491926291/)** (O'Reilly, 2016). Глава про change management в контексте DevOps: как избежать bureaucracy без потери контроля.
- Mark Schwartz — **[A Seat at the Table](https://itrevolution.com/product/a-seat-at-the-table/)** (IT Revolution, 2017). Не SRE-книга, но фундамент про change governance в продуктовых организациях: почему ITIL-style change management не работает там, где команда живёт по agile, и что ставить вместо.
- Nicole Forsgren, Jez Humble, Gene Kim — **[Accelerate](https://itrevolution.com/product/accelerate/)** (IT Revolution, 2018). Связка change governance ↔ deployment frequency ↔ change failure rate (DORA-метрики). Главный аргумент против heavy change approval boards.

### Статьи и доклады

- **[ITIL 4: Change Enablement](https://www.axelos.com/certifications/itil-service-management/itil-4-foundation)**. Современный ITIL отказался от «Change Management» в пользу «Change Enablement» (subtle, но важный shift). Полезно для словаря и для разговора с enterprise IT.
- Knight Capital Group — **[распоряжение SEC по итогам разбора событий 1 августа 2012 года](https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf)** (Release 34-70694). Не статья про governance, но первичный источник кейса: там по шагам расписано, что именно пошло не так с выкаткой (см. ниже).
- John Allspaw — **[On Being a Senior Engineer](https://www.kitchensoap.com/2012/10/25/on-being-a-senior-engineer/)** (Kitchen Soap, 2012). Косвенно: change governance — это senior judgement, а не process; стандарты appropriated for context.

### Инструменты

- **Issue tracker (Jira / Linear / GitHub Issues)** — primary запись change request: classification, owner, approver, status. Без явной записи governance существует только в Slack.
- **[ServiceNow Change Management](https://www.servicenow.com/products/change-management.html)** / **Jira Service Management** — enterprise change platforms; полезны при regulatory compliance (SOX, ISO 27001, PCI-DSS). Для команды до 50 человек обычно overkill.
- **[FireHydrant Change Tracking](https://firehydrant.com/) / [incident.io](https://incident.io/)** — incident platforms с change tracking: видно, какие changes были до incident (forensics + future risk-weighting).
- **PRR checklist as living document** — markdown в repo / Notion. Самый важный инструмент, не technology. По моим наблюдениям, простой checklist выигрывает у любой specialized platform для команд до ~200 инженеров.
- **Анти-инструмент:** weekly CAB meeting как primary mechanism. Если 80% changes идут через meeting — change governance мертв; команда либо обходит, либо саботирует.

## Best practices

Главный публичный кейс — **Knight Capital Group, August 1, 2012**. За 45 минут утром на Уолл-стрит компания потеряла **$440M** из-за ошибки выкатки: deploy script был run на 7 из 8 серверов; восьмой сервер запустил старую версию кода с repurposed feature flag и отправил на биржу миллионы ошибочных заявок. Компания не обанкротилась в прямом смысле — через четыре дня её спасли экстренным вливанием капитала, но самостоятельным бизнесом она быть перестала и в следующем году была поглощена. Разница между «умерла» и «перестала себе принадлежать» в этой истории невелика. SEC-документ детально разбирает: не было PRR для repurposed feature flag, deploy script не проверял consistency между серверами, rollback procedure не валидировалась. Я регулярно вижу команды, у которых такое же сочетание факторов («deploy на N серверов, потом проверим»; «feature flag repurposed без change record») — но без trading-volume Knight Capital impact меньше, и команда не учится. Knight Capital — лучший public reminder того, что governance не nice-to-have.

Минимум, который отделяет живое governance от его отсутствия, состоит из трёх вещей. Классификация: пока нет явной разницы между standard, normal и emergency, все изменения равнозначны, и команда либо тонет в процессе, либо обходит его целиком. Ориентир — 80–90% изменений в быстрой полосе, где хватает code review.

Дальше — откат. У каждого изменения он есть, и для рискованных он проверен заранее, на staging. «Откатим, если что» планом не считается: в момент, когда откат понадобится, выяснять его работоспособность уже поздно.

И PRR как обязательный gate перед выходом нового сервиса в production: письменный checklist, владелец процесса, доведение открытых пунктов до конца. Без последнего PRR превращается в театр — пункты записали, никто к ним не вернулся.

**Production Readiness Review — checklist, не interview.** В Google PRR — комбинация written review (checklist) + meeting (questions). Команды часто пытаются делать PRR как «meeting раз в неделю» — это не работает, потому что preparation важнее meeting'а. Healthy PRR: команда сервиса заполняет written checklist (SLO defined, monitoring + alerts, runbooks present, on-call configured, capacity plan, dependencies mapped, rollback validated, security review done); meeting — дополнение к review, а не replacement. По моим наблюдениям, если PRR существует только как meeting — checklist деградирует к «формальностям», и через год PRR становится theatre.

**Error budget gating связывает change governance с SLO program.** Без gating SLO — dashboard, который никто не смотрит. С gating SLO становится tool принятия решений: budget сожжён → пауза feature changes, разрешены только reliability fixes. Это не «всем замолчать» — это явный сигнал, что приоритеты смещаются. Я регулярно вижу команды, которые объявили SLO + error budget, но не реализовали gating — и через полгода budget chronically negative, никаких изменений в поведении нет, потому что нет actual consequence.

**Change freeze ≠ полный stop.** Распространённый страх: «freeze = команда простаивает». Healthy freeze — это явный whitelist: «во время Black Friday week разрешены только reliability fixes / security patches с SEV2+; feature changes — отложены на post-freeze». Whitelist + duration + signed-off list — лёгкая дисциплина. Freeze без whitelist становится либо игнорируемым (все продолжают катить), либо болезненно строгим (важные fixes не доезжают).

**Standard change category — главный мускул governance.** Парадоксально: качество governance мерится не тем, как строго проходят high-risk changes, а тем, как много changes квалифицируются как standard (fast lane). Если 50% changes требуют review — governance душит team velocity и саботируется. Healthy ratio: 80–90% standard (proven pattern, low risk: bugfix в одном сервисе, config change validated by tests, dependency bump within minor version), 10–15% normal (требует PRR / review), 1–5% emergency / freeze-bypass.

## Связанные листья

- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — техника deployment; canary / blue-green / feature flag — реализация safe rollout. Этот лист — policy: что катить и кто approves; progressive delivery — как катить безопасно.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — error budget — input для change gating. SLO без gating — дашборд, не tool.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — ADR — для architectural decisions (выбор технологии, design pattern); change governance — для operational decisions (что и когда катит).
- **[Action Items Tracking](/The-Way-of-SRE/leaves/practices/action-items-tracking/)** — PRR open items — это AIs; tracking их выполнения до GA — часть PRR follow-through.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — change as primary suspect: первое, что смотрит IC после page — recent deploys.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog содержит PRR status сервиса (passed / not passed / in progress); это часть «есть ли owner и готовность к prod».
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — change-related incidents → post-mortem AIs часто касаются governance (отсутствие PRR, broken rollback, missed approval).
- **[DORA Metrics](/The-Way-of-SRE/leaves/culture/dora-metrics/)** — change failure rate и lead time для changes — прямой DORA-сигнал о качестве governance: heavy approval gates растят lead time, слабая review-discipline растит change failure rate.

## Открытые вопросы

Production Readiness Review просится в отдельный лист *(TBD)*: подробный checklist, кто им владеет, как эта практика масштабируется на полсотни сервисов. Рядом — оценка риска изменения *(TBD)*, где нужны рабочие эвристики уровня «blast radius × вероятность × обратимость». Канонической модели тут нет, каждая команда строит свою, и сравнить их между собой негде.

Третья дыра — change management под регуляторику *(TBD)*: формальные требования SOX, PCI-DSS и SOC 2 к записям об изменениях. Это пересечение с листьями про compliance, и писать его нужно вместе с ними.

Я не уверен и в том, где проходит правильная граница между Change Governance и Progressive Delivery в командах с совсем лёгким процессом — деплой по пушу, явного review нет вообще. Если у вас есть рабочая модель, расскажите через PR.
