---
title: War Room Patterns
description: Operational дисциплина multi-team incident response — IC, role rotation, sitrep cadence, decision log
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / War Room Patterns
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Созвонились в Zoom, тушим» — типичная реакция на SEV0+ инцидент в команде без [war room](/The-Way-of-SRE/glossary/#war-room) discipline. Через два часа: 10 человек говорят одновременно, никто не помнит, что уже пробовали, нет sitrep для customers, IC меняется неявно через «я устал, кто-то другой», постмортем-timeline восстановить невозможно. War Room Patterns — это **operational дисциплина multi-team incident response**: явный Incident Commander (IC) с rotation после 2–4 часов, role separation (IC / Ops / Comms / Scribe / SME), sitrep cadence как ритуал (каждые 15–30 минут), decision log как след аудита, shift transition по чек-листу. Пятый лист под L1 `Incident Management` — самая плотная L1 на сайте, рядом с [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/), [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/), [Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/), [Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/).

## Что должен уметь

Главный навык на уровне L5 — проектировать **IC rotation**. IC не может вести инцидент дольше 2–4 часов без потери эффективности — fatigue, tunnel vision, привязанность к гипотезам. Я регулярно вижу инциденты длиной 8+ часов с одним IC, который под конец принимает решения хуже, чем on-call engineer в первый час. Pre-planned handoff на second IC; handoff включает 5-минутный sync (current hypothesis, что попробовано, что не работает). Без rotation IC становится bottleneck.

- **L4** — Понимает роли war room по PagerDuty / Google IRT model: **IC** — координация и решения, не делает руками; **Ops Lead** — техническая mitigation; **Comms Lead** — внешние и внутренние комms; **Scribe** — фиксирует timeline в реальном времени; **SME** — domain knowledge.
- **L4** — Выступает как IC для **SEV2+** incident в своём домене — открывает war room channel, объявляет роли, ведёт sitrep cadence. Принимает решения 70/30: ждать 100% уверенности — терять время; 70%+ — действовать, записывать в decision log.
- **L4** — Применяет **sitrep cadence** как explicit ritual — каждые 15 минут (SEV0/critical) или 30 минут (SEV1/major). Структура: `current status / what we tried / what we're doing now / next step / blockers / next sitrep at HH:MM`.
- **L5** — Проектирует **role rotation** — pre-planned handoff на second IC; 5-минутный sync (current hypothesis, что попробовано, что не работает). Распространяется на Ops Lead, Comms Lead.
- **L5** — Применяет **decision log** как separate artifact — каждое значимое решение `WHO decided WHAT at WHEN, alternatives considered, rollback plan`. Primary input для post-mortem.
- **L5** — Проектирует **shift transition** для multi-day incidents — handoff doc, explicit reassignment всех ролей, overlap window (15–30 минут handoff sync).
- **L5** — Управляет **incident channel hygiene** — единый источник истины, separation `incident-${id}-warroom` (executors) и `incident-${id}-stakeholders` (broadcast). Запрет DM-обсуждений «решений», запрет parallel war rooms.
- **L6+** — Внедряет **org-level war room infrastructure** — incident management tool, recurring IC training, IC certification, review IC performance в post-mortem.
- **L6+** — Принимает strategic decisions — 24×7 IC coverage, executive escalation thresholds, legal/PR involvement, war room compensation.

## Материалы

### Книги

- **[Site Reliability Engineering: How Google Runs Production Systems](https://sre.google/sre-book/managing-incidents/)** (O'Reilly, 2016), Chapter 14. Канонический заход — IMAG model (Incident Management at Google), 5 roles, sitrep template, handoff protocol. Глава короткая, читать целиком.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), Chapter 17 «Crisis Management». Шире — security incidents, legal, regulatory, executive coordination.
- **[Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), Chapter 9. Practical examples из Google, разбор role assignments, что пошло не так в координации.

### Статьи и доклады

- **[PagerDuty Incident Response Documentation](https://response.pagerduty.com/)**. Open-source playbook — Creative Commons, fork-able. Включает war room protocols, IC checklist, role templates, sitrep templates, handoff docs. По моим наблюдениям, чаще всего именно её берут как стартовый шаблон.
- **[Atlassian Incident Management Handbook](https://www.atlassian.com/incident-management/handbook)**. Detailed playbook с фокусом на coordination. Альтернативный взгляд к PagerDuty.
- Brent Chapman — **[Incident Command for IT — What We Can Learn from the Fire Department](https://www.usenix.org/conference/srecon16/program/presentation/chapman)** (SREcon 2016). Original talk applying NIMS / ICS (US Federal Incident Command System used by fire departments since 1970s) к IT incidents. История role separation идёт оттуда.
- **[FEMA Incident Command System (ICS-100, ICS-200 free courses)](https://training.fema.gov/is/courseoverview.aspx?code=is-100.c)**. Original framework, на котором базируется PagerDuty / Google IMAG. Free online courses от 2 часов.
- **[Honeycomb — The Cost of Incident Response](https://www.honeycomb.io/blog/the-cost-of-incident-response)** (Charity Majors). Argues что incident response costs реальные деньги.

### Шаблоны

- **[PagerDuty incident response training](https://response.pagerduty.com/training/courses/)** — CC-licensed material для подготовки IC.
- **[Google IRT templates](https://github.com/google/codoma-tic)** — Open templates.
- **[Atlassian incident communication templates](https://www.atlassian.com/incident-management/handbook/customer-communications)** — templates для sitrep, customer updates, internal stakeholder updates.

### Инструменты

- **Incident management platforms (с встроенным war room support):** [incident.io](https://incident.io/) (modern, opinionated, Slack-native), [FireHydrant](https://firehydrant.com/), [Rootly](https://rootly.com/), [Blameless](https://www.blameless.com/), [PagerDuty Status](https://www.pagerduty.com/platform/incident-management/) с rooms. Все provide: roles assignment, scribe / timeline auto-export, sitrep templates, integration со Slack/Zoom/Statuspage.
- **Real-time collaboration:** Slack / Microsoft Teams (incident channel как canonical source), Zoom / Google Meet (audio bridge для high-severity), Slack Huddles (lightweight ad-hoc voice).
- **Scribe / timeline tools:** incident.io timeline (auto-export Slack messages в structured timeline), [Jeli](https://www.jeli.io/) (PagerDuty acquisition), FireHydrant scribe, [Hourly](https://hourly.io/). Без tooling scribe role становится ad-hoc.
- **Decision log как plain artifact:** Google Doc / Notion / Confluence page per incident — explicit «Decision log» section. Tool-agnostic, важно что log существует как separate artifact, не embedded в Slack scrollback.

## Best practices

Главный публичный источник war room patterns — **FEMA Incident Command System (ICS)** и **Google IMAG**. ICS используется пожарной службой США с 1970-х годов в инцидентах, которые длятся днями (лесные пожары, ураганы). Brent Chapman в SREcon 2016 показал, что role separation, sitrep cadence, handoff protocol — это не SRE-изобретение, а адаптация 50-летней дисциплины из crisis management. Если в команде кто-то скептичен к «формальностям war room» — отправляйте к этим источникам: ICS не работала бы, если бы формальности были лишними.

**Короткие правила:**

- **Явный IC даже в команде из двух человек.** «Работаем вместе» без распределения — решения утекают в группу, MTTR растёт. IC не делает руками — координирует и принимает decisions. Даже если IC и Ops Lead — один человек, это явный выбор.
- **Sitrep cadence как обещание.** Каждые 15 (SEV0) или 30 (SEV1) минут — explicit рекуррентное сообщение в incident channel. Структура: status / tried / doing / next / blockers / next sitrep at HH:MM. Не «я там в Slack писал что-то в полночь».
- **Decision log как separate artifact.** Каждое значимое решение — `WHO decided WHAT at WHEN, alternatives considered, rollback plan`. Не размешан в Slack scrollback. Primary input для post-mortem; «почему мы выбрали этот approach» — частый question в RCA, без log — guess.

Подробнее:

**IC rotation после 2–4 часов — норма для long incidents.** Я регулярно вижу инциденты длиной 6+ часов с одним IC, который под конец принимает решения хуже, чем on-call engineer в первый час. Fatigue + tunnel vision + привязанность к гипотезам — это не «слабость», это physiology. Pre-planned handoff на second IC; handoff включает 5-минутный sync (current hypothesis, что попробовано, что не работает, текущий decision pending). Без rotation качество incident management падает экспоненциально.

**Shift transition для multi-day incidents — handoff doc обязателен.** Без shift transition новая смена начинает с нуля каждые 8 часов — incident длится в 2 раза дольше. Handoff doc: current state, hypothesis tree, что попробовано, что работает, что не работает, next steps. Explicit reassignment всех ролей. Overlap window — 15–30 минут handoff sync, не one-line «передаю». Это базовая дисциплина для регулируемых индустрий, но полезна везде.

**Incident channel hygiene — единый источник истины.** Запрет DM-обсуждений «решений» — всё в channel либо в decision log. Запрет parallel war rooms (split-brain coordination). Separation `incident-${id}-warroom` (executors only) и `incident-${id}-stakeholders` (broadcast) — executors не отвлекаются на executive questions, stakeholders не путаются в jargon.

**Game day и IC training регулярно.** Первый IC-experience — реальный SEV0 в 3 ночи: команда паникует, IC не уверен в роли, sitrep не выходят, decision log пустой. Tabletop exercises и game day с искусственными SEV0 — единственный способ построить мышечную память. IC certification / on-call IC roster (не каждый on-call может быть IC) — следующий уровень зрелости.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — IR = lifecycle одного инцидента; War Room = внутренняя механика mitigation-фазы при multi-team coordination.
- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — SEV0+ автоматически triggers war room; severity определяет sitrep cadence и audience.
- **[Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/)** — Comms Lead в war room — отдельная роль; pre-staged comm templates живут в runbook.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — war room rotation может быть отдельной ротацией от service on-call (24×7 IC coverage).
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — decision log из war room — основной input для timeline постмортема.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — IC checklist, sitrep template, handoff template — часть runbook для major incidents.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — war room канал и есть ChatOps canvas; bots координируют sitrep cadence, scribe role, decision log fixing.

## Открытые вопросы

- **24×7 IC Coverage** — отдельная rotation от service on-call: когда оправдано, как scaling.
- **War Room Compensation** — overtime, on-call IC compensation — связано с On-Call Rotation comp models.
- **Executive Escalation Thresholds** — когда IC поднимает CTO / CEO в war room (обычно при customer impact > $X или regulatory implications).
- **Legal / PR involvement в war room** — когда подключать, как разграничить с technical mitigation.
- Я не уверен, в какой момент команда дорастает до отдельной IC rotation vs IC = duty senior on-call. По моим наблюдениям, типичный момент — между 50 и 200 engineers, но это очень контекстно зависит от incident volume.
