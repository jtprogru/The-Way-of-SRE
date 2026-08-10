---
title: On-Call Rotation
description: Организация дежурства команды — кто, когда, под каким режимом; баланс coverage / fairness / sustainability
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / On-Call Rotation
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«[On-call](/The-Way-of-SRE/glossary/#on-call) входит в зарплату» — эту фразу я регулярно слышу от компаний, где явной компенсации за дежурство нет. Она же стоит за уходом старших инженеров чаще, чем принято признавать. Дежурство — работа в нерабочее время, и когда её никак не оплачивают, команда сначала теряет самых опытных, а оставшиеся либо выгорают, либо начинают реагировать вполсилы. On-Call Rotation — это **дисциплина баланса** между coverage (дежурный есть всегда), fairness (нагрузка распределена), sustainability (без выгорания) и effectiveness (дежурный в состоянии реагировать). Без здоровой ротации даже идеально выстроенный incident response разваливается под выгоранием одного-двух человек.

## Что должен уметь

Главный навык на уровне L5 — **поддерживать on-call health** как метрику, а не «когда заметим». Sleep disruption rate, comp pay totals, fair load distribution — это объективные сигналы, которые видны до того, как инженер уходит. «No hero» culture (любой pager должен быть ack'нут, не «я разобрался без alert'а») — это часть этой дисциплины: без visibility один инженер становится bottleneck, и команда не видит проблем до его ухода.

**L3**
- Понимает структуру ротации команды (cadence, primary vs secondary, escalation paths); знает свои следующие смены; принимает (acknowledge) page и проводит базовую triage.
- Перед сменой выполняет короткий pre-shift review: недавние deploys, изменённые runbook, активные incidents-in-progress, известные хрупкие подсистемы.

**L4**
- Настраивает свой schedule в paging tool; понимает escalation policy и timeouts (acknowledge → escalate → next person); знает, как brief заменить если внезапно недоступен.
- Выполняет structured post-shift handoff: что было, что осталось open, что требует внимания; обновляет runbook по итогам нетривиальных pages.

**L5**
- Проектирует rotation: cadence (неделя — норма), follow-the-sun vs single-timezone, primary / secondary roles, holidays / vacation handling, comp time.
- Ведёт alert hygiene: еженедельный / ежемесячный review pages, удаление false positives, повышение signal-to-noise; шумная смена (≥ N pages в час, не привёдших к действию) — инцидент с постмортемом.
- Поддерживает on-call health: tracks sleep disruption, fair load distribution, явный recovery day после ночных pages, защищает «no hero» culture.

**L6+**
- Внедряет org-level on-call policy: who pays on-call comp, mandatory rest после multi-page nights, sustainability metrics, правила скидки нагрузки между командами.
- Балансирует scale: новый сервис — это новая ротация или расширение существующей? Защищает команду от unbounded expansion ротации без roster growth.

## Материалы

### Книги

- Andrea Spadaccini — **[Site Reliability Engineering](https://sre.google/sre-book/being-on-call/)** (O'Reilly, 2016), глава 11 «Being On-Call». Канонический подход Google SRE. Оттуда же норматив, который стоит помнить дословно: не меньше половины времени SRE уходит на инженерию, а из оставшегося на дежурства — не больше 25%.
- Ollie Cook, Sara Smollett, Andrea Spadaccini и др. — **[The Site Reliability Workbook](https://sre.google/workbook/on-call/)** (O'Reilly, 2018), глава 8 «On-Call». Practical anti-patterns, on-call documentation, fairness, training новых членов команды.

### Статьи и руководства

- **[PagerDuty — Incident Response Documentation](https://response.pagerduty.com/)**. Открытый guide с разделами Before / During / After; включает on-call best practices (handoff, escalation, comp pay rationale). Apache 2.0.
- Liz Fong-Jones — публикации и talks по теме «sustainable on-call» (SREcon, honeycomb.io). Аргументация за shared on-call между SRE и dev как путь к лучшему code-quality.

### Инструменты

- **[PagerDuty](https://www.pagerduty.com/)** — paging tool с поддержкой rotation, escalation policy, override, schedule export; по-прежнему дефолт индустрии. Из тех, что были рядом с ним в этом ряду ещё недавно, **Opsgenie** закрывается (Atlassian прекратила продажи в 2025, полное отключение — апрель 2027, миграция в Jira Service Management), а **Grafana OnCall** свёрнут в общий [Grafana IRM](https://grafana.com/products/cloud/irm/), OSS-репозиторий уходит в архив. Ротация дежурств — это то, что команда настраивает один раз и живёт с этим годами, поэтому смерть инструмента здесь дороже, чем в большинстве других категорий.
- **iCalendar / Google Calendar import** — обязательный backup для visibility: ротация в общем календаре команды; отсутствие — частая причина «не знал, что дежурю».
- **Alert hygiene dashboards** — custom (Grafana / Prometheus) или встроенные в paging tool: метрики `pages per shift`, `time-to-ack`, `% actionable`, `MTTR`. Без них alert hygiene — субъективная оценка.
- **Sleep / load tracking** — простой spreadsheet или специальные инструменты (например, [Team Health 1:1](https://github.com/fadeinflames/team-health) с короткими регулярными опросами) для отслеживания нагрузки в долгую.

## Best practices

Компенсация за дежурство обязательна, и форма тут вторична. Деньги, отгул, дополнительный выходной — механизм команда выбирает под себя. Важно, что он есть и назван вслух. Иначе среди старших инженеров копится глухое раздражение, которое наружу выходит уже заявлением об уходе, и разговаривать поздно.

Второе условие такое же жёсткое: на каждый pager есть runbook. Алерт без runbook — это «разбуди человека в три ночи и пусть сам соображает», и заканчивается это предсказуемо: через полгода такой алерт либо молча игнорируют, либо удаляют, причём никто уже не помнит, что именно перестали мониторить и почему когда-то решили, что это важно.

Неделя — нормальная длина смены для большинства команд. Две недели подряд не работают: к концу второй дежурный просто выключен. Ежедневная ротация ломается с другой стороны — человек не успевает ничему научиться, а накладные расходы на передачу съедают весь выигрыш.

**Pre-shift review стоит потраченного времени.** Холодный старт на ночной page — это первые пятнадцать минут на то, чтобы понять, где ты вообще находишься, вместо реакции. Пятнадцать-тридцать минут перед сменой закрывают вопрос: что задеплоено за неделю, какие инциденты активны, какие изменения ожидаются, какие runbook поменялись. Я регулярно вижу команды без такого ритуала, и у них MTTR в начале смены заметно выше, чем в середине.

**Post-shift retrospection — короткая, но обязательная.** «Прошло, забыли» — и системные проблемы копятся: повторяющиеся алерты, отсутствующие runbook, деплои в пятницу вечером. Минимум — короткое сообщение о передаче смены: что произошло, что осталось открытым, что насторожило. Раз в месяц имеет смысл собирать командную ретроспективу по качеству дежурств. Без этого alert fatigue растёт незаметно, пока кто-нибудь не сломается.

**Alert hygiene — еженедельный ритуал, не «когда-нибудь».** False positives копятся под соусом «ну подождём, может само перестанет». Не перестанет. Раз в неделю — разбор pages: какие были actionable, какие нет, где менять порог, что удалять, что переносить в тикеты. Шумная смена — это тоже инцидент, и разбирать её надо как инцидент.

**«No hero» culture: любой pager должен быть ack'нут.** «Я заметил проблему раньше алерта и разобрался сам» звучит как героизм, а работает как потеря видимости: в журнале ничего нет, команда не знает, что происходило, и через полгода один инженер становится узким местом. Это политическая позиция. Защищает её team lead, больше некому. Без неё здоровье команды деградирует незаметно для всех, кроме самого героя.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — Incident Response — что в момент; On-Call Rotation — кто реагирует и в каком состоянии.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — качество alerting определяет sustainability. SLO-based alerting + on-call rotation — пара.
- **[Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/)** — measure & reduce. Пара к этому листу для здорового алертинга.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook на каждый pager — обязательное условие здоровой ротации.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — шумные / тяжёлые on-call смены — кандидаты на постмортем.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — supervised on-call как мост от curriculum к самостоятельной ротации.
- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — discussion on-call health на 1:1 — встроенный sustainability check.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — `/oncall`, `/escalate`, `/page` через chat — стандартные ChatOps queries и actions для on-call workflow.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/)** — game day с participation новых on-call инженеров — основная подготовка перед первой неделей; снижает MTTR и тревожность.

## Открытые вопросы

- **On-Call Comp Models** *(TBD)* — конкретные модели: оплата за каждый page, фиксированная ставка за смену, отгулы, гибрид.
- **Follow-the-Sun Logistics** *(TBD)* — передача смены между регионами и языковой барьер; схему имеет смысл заводить, когда в команде набирается хотя бы шесть человек из разных часовых поясов.

Severity Classification и политика эскалации из этого листа уже уехали в отдельный. Здесь — про то, кто дежурит и в каком состоянии, а не про то, как размечать инциденты по тяжести.
