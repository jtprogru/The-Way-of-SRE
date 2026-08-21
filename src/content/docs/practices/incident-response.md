---
title: Incident Response
description: Координация реагирования на инцидент — роли (IC / Comms / Ops), escalation, war room
sfia: [3, 4, 5, 6]
status: draft
---

«Работаем вместе» без распределения ролей — [IC](/The-Way-of-SRE/glossary/#ic), Ops Lead и Comms Lead в одном лице — антипаттерн, который я регулярно вижу в командах. Выглядит это всегда одинаково. Решения растворяются в общем чате, стейкхолдерам не пишет никто, MTTR растёт, а клиенты молчат просто потому, что им некуда написать. Incident Response — это **процесс координации**: явные роли, escalation paths, sitrep cadence, structured handoff между сменами. Цель в моменте — **минимизировать MTTR, не нарушая режим blameless** и сохранить достаточно сигнала для последующего постмортема. Не путать с [Blameless Postmortem](/The-Way-of-SRE/practices/blameless-postmortem/) (after-action разбор); здесь — про *during-action*.

## Что должен уметь

Главный навык на уровне L5 — балансировать **mitigation vs investigation** во время инцидента. На 40-й минуте сервис всё ещё лежит, потому что команда копает в код, ищет причину — а цель в моменте вернуть сервис: rollback, failover, graceful degradation, scale out, traffic redirect. Разбор причин — после, в постмортеме. Сначала пациент стабилизирован, потом диагноз. Я регулярно вижу IC, которые позволяют команде уйти в investigation — это путь к 2-часовому MTTR.

**L3**
- Понимает базовые роли (IC, Comms Lead, Ops Lead); знает, кому пинговать в инциденте; зовёт IC при неясности.
- Следует runbook для типового сценария; фиксирует свои действия в incident log с timestamp; эскалирует, если шаги не работают.

**L4**
- Выступает Operations Lead в малых инцидентах: ведёт диагностику, применяет mitigation, координирует с командой; знает rollback procedure для своих сервисов.
- Ведёт incident log как narrative: что произошло, что попробовали, что сработало; этот лог становится основой timeline для постмортема.

**L5**
- Выступает Incident Commander: координирует действия команды, делает общий синк каждые 15–30 минут, принимает решения о rollback / эскалации / привлечении дополнительных людей.
- Балансирует mitigation vs investigation: понимает, когда достаточно временного fix (вернуть сервис → постмортем), а когда нужно копать сразу.
- Проводит structured handoff между сменами в multi-shift инцидентах: краткое summary, текущие активные действия, неясности.

**L6+**
- Внедряет incident response process в команде/организации: формализованные роли, шаблоны коммуникации, training (game day, wheel of misfortune), severity-based response.
- Связывает incident response с org-level: customer communications policy, regulatory disclosure, executive escalation; защищает blameless-tone в high-pressure инцидентах.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/emergency-response/)** (O'Reilly, 2016), глава 13 «Emergency Response». Типология аварий и Google case studies.
- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/managing-incidents/)** (O'Reilly, 2016), глава 14 «Managing Incidents». Канонические роли (IC, Ops, Comms), Incident Command System, шаблон incident document.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), глава 9 «Incident Response». Четыре разбора — три инцидента Google (в том числе откровенно плохо отработанных) и глава про процесс PagerDuty. Оттуда же четыре правила, на которых держится IMAG (Incident Management At Google): держать явную вертикаль управления, распределить роли до начала работы, вести рабочий журнал по ходу дела, объявлять инцидент рано и часто.

### Статьи и руководства

- **[PagerDuty — Incident Response Documentation](https://response.pagerduty.com/)**. Открытый guide по incident response — Before / During / After, шаблоны коммуникации, роли, чек-листы. По моим наблюдениям, чаще всего именно его берут как стартовый шаблон в новых командах. Apache 2.0, переиспользуемое.
- **[Atlassian — Incident Management Handbook](https://www.atlassian.com/incident-management/handbook)**. Практичный handbook от команды, прошедшей через множество публичных инцидентов.
- NIST — **[SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)** (апрель 2025). Актуальная рекомендация по cybersecurity incident response в контексте CSF 2.0; заменила Rev. 2. Для инцидентов надёжности она не заменяет SRE Workbook, но нужна при пересечении с cybersecurity risk management.

### Инструменты

- **Alerting / on-call rotation** — **[PagerDuty](https://www.pagerduty.com/)** как дефолт индустрии; **[Grafana IRM](https://grafana.com/products/cloud/irm/)** для тех, кто уже живёт в Grafana Cloud. Маршрутизация алертов, escalation policies, ротация дежурств. Два бывших фаворита из этого ряда выбывают: Atlassian закрывает Opsgenie (продажи прекращены в 2025, полное отключение — апрель 2027, миграция в Jira Service Management), а Grafana свернула отдельный OnCall в пользу общего IRM и переводит OSS-репозиторий в архив. Если выбираете инструмент сейчас — проверяйте не функциональность, а то, что продукт вообще будет жив через два года.
- **Incident management platforms** — **[incident.io](https://incident.io/)**, **[FireHydrant](https://firehydrant.com/)**. Автоматизация инцидента: создание канала в Slack, ролей, status page, сбор timeline. Полезны, когда команда выходит за десятки инцидентов в месяц. Команде, у которой инцидент раз в две недели, такая платформа не годится — ритуал есть, наполнять его нечем.
- **Status pages** — **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage)**, **[Better Stack](https://betterstack.com/)**. Внешняя коммуникация.
- **Incident log в отдельном канале Slack** — самая базовая форма: один канал на инцидент, timeline в реальном времени с явными timestamp. Достаточно для большинства команд без отдельной платформы.

## Best practices

Роли важнее людей. Назначаются они вслух — даже когда в инциденте два человека, потому что «работаем вместе» звучит по-командному, а на деле означает, что решения растворяются в группе, апдейты не делает никто, MTTR растёт, и через час выясняется, что стейкхолдеры всё это время читали чужую переписку и делали собственные выводы. Все три роли достались одному дежурному? Пусть он произнесёт это как выбор: «я IC, я же Ops, коммуникацию беру на себя». Тогда в голове три отдельных списка задач, а не одна каша.

Дальше — темп. Апдейт каждые 15–30 минут идёт независимо от того, есть новости или нет. Молчание читают двояко: либо «всё совсем плохо», либо «уже починили, можно расходиться». Оба прочтения вредны. «Нового нет, продолжаем митигацию X, следующий синк через двадцать минут» — полноценное сообщение, а не заполнение эфира.

И главное правило момента: митигация важнее причины. «Сначала найдём root cause, потом починим» — вот так и получается, что на сороковой минуте сервис всё ещё лежит, а половина команды читает код. Задача одна — вернуть сервис. Откат, переключение, деградация с сохранением основного сценария, добавление мощностей, увод трафика. Причины разберём потом.

**Один канал на инцидент.** Технические детали в одном чате, апдейты для бизнеса в другом, синк с руководством в третьем — и полной картины нет ни у кого. Канал один: timeline в закреплённом сообщении, текущее действие в теме канала, наружу — страница статуса. Остальное производные. Я регулярно вижу, как рассинхрон между каналами рождает второй инцидент поверх первого: руководитель прочёл соседний тред и решил, что уже починили.

**Разговор с бизнесом — отдельно от разговора инженеров.** В общем техническом канале стейкхолдеры теряются в жаргоне и пугаются фразы «у нас 503 на checkout». Comms Lead держит внешний канал и переводит: не «503 на checkout endpoint», а «оплата недоступна примерно у 15% пользователей». Апдейты по расписанию, технические подробности туда не едут.

**Game day и wheel of misfortune — часть процесса, а не «когда будет время».** Тренировка проверяет роли, путь эскалации, runbook и коммуникации до того, как всё это понадобится всерьёз. Частоту задаёт ротация дежурства и темп изменений, сценарии берутся из публичных постмортемов и своих прошлых инцидентов. Универсального коэффициента снижения MTTR тут нет, и эффект приходится мерить у себя.

## Связанные листья

- **[Blameless Postmortem](/The-Way-of-SRE/practices/blameless-postmortem/)** — обязательный after-action для значимого инцидента; качество incident log напрямую определяет качество timeline в постмортеме.
- **[Runbooks](/The-Way-of-SRE/culture/runbooks/)** — главный инструмент в моменте инцидента.
- **[SLI-based Alerting](/The-Way-of-SRE/engineering/sli-based-alerting/)** — то, что инициирует incident response; качество SLO-алертов влияет на signal/noise.
- **[Postmortem Culture](/The-Way-of-SRE/culture/postmortem-culture/)** — норма *blameless* применяется и в моменте инцидента (incident log без «кто это сделал»), не только после.
- **[Service Ownership](/The-Way-of-SRE/culture/service-ownership/)** — incident commander смотрит в service catalog, чтобы понять owner и эскалационный путь.
- **[Dev Team Partnership](/The-Way-of-SRE/culture/dev-team-partnership/)** — engagement model определяет, кто играет IC / Ops / Comms в зависимости от embedded vs consulting.
- **[Severity Classification](/The-Way-of-SRE/practices/severity-classification/)** — рамка для измерения «насколько серьёзный инцидент»; определяет response intensity.
- **[Customer Communications](/The-Way-of-SRE/practices/customer-communications/)** — внешняя коммуникация во время инцидента.
- **[War Room Patterns](/The-Way-of-SRE/practices/war-room-patterns/)** — operational дисциплина для multi-team high-severity incidents.
- **[On-Call Rotation](/The-Way-of-SRE/practices/on-call-rotation/)** — кто реагирует и в каком состоянии.
- **[Action Items Tracking](/The-Way-of-SRE/practices/action-items-tracking/)** — close-out incident включает создание AIs с owner / deadline / criterion; этот лист — про дисциплину их выполнения.
- **[ChatOps](/The-Way-of-SRE/engineering/chatops/)** — современные инструменты для инцидентов (incident.io, Netflix Dispatch, FireHydrant) — Slack-native ChatOps; declare / coordinate / sitrep живут в chat с встроенным audit trail.
- **[Status Page Management](/The-Way-of-SRE/practices/status-page-management/)** — public status page update — часть IC checklist в моменте инцидента.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/culture/game-day/)** — регулярная проверка ролей, эскалации, runbook и коммуникаций до реального инцидента.
- **[Playbooks](/The-Way-of-SRE/culture/playbooks/)** — главный артефакт incident response practice; коэффициент использования playbook'ов в моменте — прямой индикатор зрелости IR.
- **[Postmortem Database](/The-Way-of-SRE/culture/postmortem-database/)** — incident-management платформы автоматически связывают incident ↔ postmortem ↔ database; tooling-side этой пары практик.

## Открытые вопросы

Почти всё, что раньше висело здесь в открытых вопросах, разъехалось по отдельным листьям внутри Incident Management: Severity Classification, Customer Communications, On-Call Rotation, War Room Patterns, Status Page Management. По основным операционным практикам эта ветка закрыта, и незакрытых кусков в ней я сейчас не вижу.
