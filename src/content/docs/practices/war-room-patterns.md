---
title: War Room Patterns
description: "Механика инцидента, который тушат несколько команд сразу: роли, ротация IC, ритм sitrep, decision log"
sfia: [4, 5, 6]
status: draft
---

«Созвонились в Zoom, тушим» — типичная реакция на SEV0+ инцидент в команде без [war room](/The-Way-of-SRE/glossary/#war-room) discipline. Через два часа: 10 человек говорят одновременно, никто не помнит, что уже пробовали, нет sitrep для клиентов, IC меняется неявно через «я устал, кто-то другой», а timeline для постмортема потом не восстановить. War Room Patterns — это **дисциплина координации, когда инцидент тушат несколько команд сразу**: явный Incident Commander (IC) с rotation после 2–4 часов, role separation (IC / Ops / Comms / Scribe / SME), sitrep cadence как ритуал (каждые 15–30 минут), decision log как след аудита, shift transition по чек-листу. Уточнение [Incident Response](/The-Way-of-SRE/practices/incident-response/): тот лист описывает lifecycle инцидента целиком, этот — механику фазы mitigation, когда тушат несколько команд сразу.

## Что должен уметь

Главный навык на уровне L5 — проектировать **IC rotation**. IC не может вести инцидент дольше 2–4 часов без потери эффективности — fatigue, tunnel vision, привязанность к гипотезам. Я регулярно вижу инциденты длиной 8+ часов с одним IC, который под конец принимает решения хуже, чем on-call инженер в первый час. Pre-planned handoff на second IC; handoff включает 5-минутный sync (current hypothesis, что попробовано, что не работает). Без rotation IC становится bottleneck.

**L4**
- Понимает роли war room. У Google (SRE Book, гл. 14) их четыре: **IC** — координация и решения, не делает руками; **Ops Lead** — техническая mitigation; **Comms Lead** — внешние и внутренние коммуникации; **Planning Lead** — всё, что живёт дольше текущей смены (баги, передача дежурства, снабжение людьми). У PagerDuty набор другой и шире: к IC добавлены **Deputy** (дублёр и второй взгляд), **Scribe** (фиксирует timeline в реальном времени), **SME** (domain knowledge) и две отдельные роли связи — с клиентами и с внутренними стейкхолдерами. Смешивать наборы можно, но стоит понимать, откуда что взято: Scribe — это PagerDuty, Planning Lead — это Google.
- Выступает как IC для **SEV2+** incident в своём домене — открывает war room channel, объявляет роли, ведёт sitrep cadence. Принимает решения 70/30: ждать 100% уверенности — терять время; 70%+ — действовать, записывать в decision log.
- Применяет **sitrep cadence** как explicit ritual — каждые 15 минут (SEV0/critical) или 30 минут (SEV1/major). Структура: `current status / what we tried / what we're doing now / next step / blockers / next sitrep at HH:MM`.

**L5**
- Проектирует **role rotation** — pre-planned handoff на second IC; 5-минутный sync (current hypothesis, что попробовано, что не работает). Распространяется на Ops Lead, Comms Lead.
- Применяет **decision log** как separate artifact — каждое значимое решение `WHO decided WHAT at WHEN, alternatives considered, rollback plan`. Primary input для post-mortem.
- Проектирует **shift transition** для multi-day incidents — handoff doc, explicit reassignment всех ролей, overlap window (15–30 минут handoff sync).
- Управляет **incident channel hygiene** — единый источник истины, separation `incident-${id}-warroom` (executors) и `incident-${id}-stakeholders` (broadcast). Запрет DM-обсуждений «решений», запрет parallel war rooms.

**L6+**
- Внедряет **org-level war room infrastructure** — incident management tool, recurring IC training, IC certification, review IC performance в post-mortem.
- Принимает strategic decisions — 24×7 IC coverage, executive escalation thresholds, legal/PR involvement, war room compensation.

## Материалы

### Книги

- **[Site Reliability Engineering: How Google Runs Production Systems](https://sre.google/sre-book/managing-incidents/)** (O'Reilly, 2016), Chapter 14. Канонический заход: четыре роли (Incident Command, Operational Work, Communication, Planning), рекурсивное разделение ответственности, шаблон документа инцидента и протокол передачи. Сама глава опирается на ICS пожарных, а не изобретает модель заново. Короткая, читать целиком.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), Chapter 17 «Crisis Management». Шире — security incidents, legal, regulatory, executive coordination.
- **[Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), Chapter 9. Practical examples из Google, разбор role assignments, что пошло не так в координации. Здесь же вводится аббревиатура IMAG (Incident Management At Google) — в SRE Book гл. 14 её ещё нет.

### Статьи и доклады

- **[PagerDuty Incident Response Documentation](https://response.pagerduty.com/)**. Open-source playbook под Apache 2.0, форкается и правится под себя. Включает war room protocols, IC checklist, role templates, sitrep templates, handoff docs. По моим наблюдениям, чаще всего именно её берут как стартовый шаблон.
- **[Atlassian Incident Management Handbook](https://www.atlassian.com/incident-management/handbook)**. Detailed playbook с фокусом на coordination. Альтернативный взгляд к PagerDuty.
- Brent Chapman — **[Incident Command for IT: What We Can Learn from the Fire Department](https://www.usenix.org/legacy/events/lisa05/tech/chapman.pdf)** (LISA 2005). Тот самый доклад, который принёс NIMS / ICS (система командования, которой пожарные США пользуются с 1970-х) в мир IT-эксплуатации. История role separation идёт оттуда — и стоит отметить, что это 2005 год, за одиннадцать лет до того, как SRE-сообщество начало обсуждать роли в инцидентах как что-то новое. [Обновлённая версия доклада](https://www.usenix.org/conference/srecon18americas/presentation/chapman) — SREcon18 Americas.
- **[FEMA Incident Command System (ICS-100, ICS-200 free courses)](https://training.fema.gov/is/courseoverview.aspx?code=is-100.c)**. Original framework, на котором базируется PagerDuty / Google IMAG. Free online courses от 2 часов.
- **[Honeycomb — How We Manage Incident Response](https://www.honeycomb.io/blog/incident-response-at-honeycomb)** (Fred Hebert). Разбор внутренней кухни небольшой команды: кто объявляет инцидент, как устроены роли, когда команда сознательно не разворачивает полную процедуру.

### Шаблоны

- **[PagerDuty Incident Commander training](https://response.pagerduty.com/training/incident_commander/)** — материал под Apache 2.0 для подготовки IC: что делает, чего не делает, как ведёт совещание.
- **[Google SRE Book: Incident State Document](https://sre.google/sre-book/managing-incidents/)** — шаблон живого документа инцидента прямо в главе 14; отдельного репозитория с шаблонами у Google нет.
- **[Atlassian incident communication templates](https://www.atlassian.com/incident-management/incident-communication/templates)** — templates для sitrep, customer updates, internal stakeholder updates.

### Инструменты

- **Incident management platforms (с встроенным war room support):** [incident.io](https://incident.io/) (modern, opinionated, Slack-native), [FireHydrant](https://firehydrant.com/), [Rootly](https://rootly.com/), [PagerDuty](https://www.pagerduty.com/platform/incident-management/) с rooms. Все provide: roles assignment, scribe / timeline auto-export, sitrep templates, integration со Slack/Zoom/Statuspage. Сегмент активно консолидируется — Blameless как отдельный продукт исчез, его купил FireHydrant в 2024, — так что при выборе стоит смотреть не только на функциональность, но и на то, кому платформа принадлежит.
- **Real-time collaboration:** Slack / Microsoft Teams (incident channel как canonical source), Zoom / Google Meet (audio bridge для high-severity), Slack Huddles (lightweight ad-hoc voice).
- **Scribe / timeline tools:** incident.io timeline (auto-export Slack messages в structured timeline), FireHydrant scribe, [Jeli](https://www.pagerduty.com/platform/jeli/) — теперь часть PagerDuty после покупки в 2023. Без tooling scribe role становится ad-hoc.
- **Decision log как plain artifact:** Google Doc / Notion / Confluence page per incident — explicit «Decision log» section. Tool-agnostic, важно что log существует как separate artifact, не embedded в Slack scrollback.

Если инцидентов, ради которых собирают war room, у вас единицы в год, отдельная платформа избыточна: канал в Slack плюс отдельный документ с decision log закрывают ровно ту же потребность. Платформа начинает окупаться там, где ролей много, инциденты идут потоком и timeline нужно собирать не руками.

## Best practices

Главный публичный источник war room patterns — **FEMA Incident Command System (ICS)** и **Google IMAG**. ICS используется пожарной службой США с 1970-х годов в инцидентах, которые длятся днями (лесные пожары, ураганы). Brent Chapman показал это IT-аудитории ещё на LISA 2005: role separation, sitrep cadence, handoff protocol — не SRE-изобретение, а адаптация дисциплины, которой к тому моменту было уже тридцать пять лет, а сейчас больше пятидесяти. Меня в этой истории отрезвляет разрыв: доклад 2005 года, а команды до сих пор изобретают роли в war room заново на каждом втором проекте. Если кто-то скептичен к «формальностям war room» — отправляйте к этим источникам: ICS не работала бы полвека, если бы формальности были лишними.

Явный IC нужен даже там, где тушат двое. «Работаем вместе» без распределения означает, что решения растворяются в группе, а MTTR растёт. IC не делает руками — он координирует и принимает решения; и даже если IC и Ops Lead физически один человек, это должно быть произнесено вслух как выбор, а не получиться само собой.

Sitrep — обещание, а не отчётность. Каждые 15 минут на SEV0 или каждые 30 на SEV1 в канал инцидента уходит одно и то же по структуре сообщение: где мы сейчас, что попробовали, что делаем прямо сейчас, что дальше, что блокирует, когда следующий sitrep. Не «я там что-то писал в Slack в полночь».

Decision log живёт отдельным артефактом. Кто, что и когда решил, какие были альтернативы, как откатываемся — это не размазывается по переписке. Потом на разборе обязательно всплывёт вопрос «почему мы вообще пошли этим путём», и без лога ответ на него будет реконструкцией по памяти.

**IC rotation после 2–4 часов — норма для long incidents.** Я регулярно вижу инциденты длиной 6+ часов с одним IC, который под конец принимает решения хуже, чем on-call инженер в первый час. Это не слабость. Усталость, туннельное зрение и привязанность к собственной гипотезе — физиология, и волевым усилием она не отменяется. Pre-planned handoff на second IC; handoff включает 5-минутный sync (current hypothesis, что попробовано, что не работает, текущий decision pending). Без rotation качество incident management падает экспоненциально.

**Shift transition для multi-day incidents — handoff doc обязателен.** Без shift transition новая смена начинает с нуля каждые 8 часов — incident длится в 2 раза дольше. Handoff doc: current state, hypothesis tree, что попробовано, что работает, что не работает, next steps. Explicit reassignment всех ролей. Overlap window — 15–30 минут handoff sync, не one-line «передаю». Это базовая дисциплина для регулируемых индустрий, но полезна везде.

**Incident channel hygiene — единый источник истины.** Личка убивает координацию. Решения обсуждаются в канале или попадают в decision log, параллельные war room запрещены — иначе получаются две реальности, которые расходятся тем сильнее, чем дольше идёт инцидент. Канал исполнителей и канал стейкхолдеров разводятся: `incident-${id}-warroom` и `incident-${id}-stakeholders`. Так исполнители не отвлекаются на вопросы руководства, а руководство не тонет в жаргоне.

**Game day и IC training регулярно.** Худший вариант первого опыта в роли IC — настоящий SEV0 в три ночи. Команда паникует, IC не уверен в роли, sitrep не выходят, decision log пустой. Tabletop и game day с искусственными SEV0 — единственный способ построить мышечную память заранее. IC certification / on-call IC roster (не каждый on-call может быть IC) — следующий уровень зрелости.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — IR = lifecycle одного инцидента; War Room = внутренняя механика фазы гашения, когда координируются несколько команд.
- **[Severity Classification](/The-Way-of-SRE/practices/severity-classification/)** — SEV0+ автоматически triggers war room; severity определяет sitrep cadence и audience.
- **[Customer Communications](/The-Way-of-SRE/practices/customer-communications/)** — Comms Lead в war room — отдельная роль; pre-staged comm templates живут в runbook.
- **[On-Call Rotation](/The-Way-of-SRE/practices/on-call-rotation/)** — war room rotation может быть отдельной ротацией от service on-call (24×7 IC coverage).
- **[Blameless Postmortem](/The-Way-of-SRE/practices/blameless-postmortem/)** — decision log из war room — основной input для timeline постмортема.
- **[Runbooks](/The-Way-of-SRE/culture/runbooks/)** — IC checklist, sitrep template, handoff template — часть runbook для major incidents.
- **[ChatOps](/The-Way-of-SRE/engineering/chatops/)** — war room канал и есть ChatOps canvas; bots координируют sitrep cadence, scribe role, decision log fixing.

## Открытые вопросы

- **24×7 IC Coverage** — отдельная rotation от service on-call: когда оправдано, как scaling.
- **War Room Compensation** — overtime, on-call IC compensation — связано с On-Call Rotation comp models.

Не разобрана и эскалация наверх: в какой момент IC поднимает CTO или CEO в war room. Формально порог описывают через влияние на клиентов или регуляторные последствия, но живой формулировки, которая работала бы в моменте, я пока не нашёл. Рядом лежит вопрос про legal и PR — когда их подключать и как развести их работу с технической митигацией, чтобы одно не мешало другому.

Я не уверен и в том, в какой момент команда дорастает до отдельной ротации IC вместо «IC — это дежурный старший инженер». По моим наблюдениям, типичный момент — между 50 и 200 инженерами, но зависит это в первую очередь от потока инцидентов, а не от размера штата.
