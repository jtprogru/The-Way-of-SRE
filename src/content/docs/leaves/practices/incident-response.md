---
title: Incident Response
description: Координация реагирования на инцидент — роли (IC / Comms / Ops), escalation, war room
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / Incident Response
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Работаем вместе» без распределения ролей — [IC](/The-Way-of-SRE/glossary/#ic), Ops Lead и Comms Lead в одном лице — антипаттерн, который я регулярно вижу в командах. Решения утекают в группу, никто не делает sync-апдейты для стейкхолдеров, MTTR растёт, клиенты молчат, потому что нет channel. Incident Response — это **процесс координации**: явные роли, escalation paths, sitrep cadence, structured handoff между сменами. Цель в моменте — **минимизировать MTTR при соблюдении blameless-принципов** и сохранить достаточно сигнала для последующего постмортема. Не путать с [Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/) (after-action разбор); здесь — про *during-action*.

## Что должен уметь

Главный навык на уровне L5 — балансировать **mitigation vs investigation** во время инцидента. На 40-й минуте сервис всё ещё лежит, потому что команда копает в код, ищет причину — а цель в моменте вернуть сервис: rollback, failover, graceful degradation, scale out, traffic redirect. Разбор причин — после, в постмортеме. Сначала пациент стабилизирован, потом диагноз. Я регулярно вижу IC, которые позволяют команде уйти в investigation — это путь к 2-часовому MTTR.

**L3**
- Понимает базовые роли (IC, Comms Lead, Ops Lead); знает, кому пинговать в инциденте; зовёт IC при неясности.
- Следует runbook для типового сценария; фиксирует свои действия в incident log с timestamp; эскалирует, если шаги не работают.

**L4**
- Выступает Operations Lead в малых инцидентах: ведёт диагностику, применяет mitigation, координирует с командой; знает rollback procedure для своих сервисов.
- Ведёт incident log как narrative: что произошло, что попробовали, что сработало; этот лог становится основой timeline для постмортема.

**L5**
- Выступает Incident Commander: координирует действия команды, делает sync-апдейты каждые 15–30 минут, принимает решения о rollback / эскалации / привлечении дополнительных людей.
- Балансирует mitigation vs investigation: понимает, когда достаточно временного fix (вернуть сервис → постмортем), а когда нужно копать сразу.
- Проводит structured handoff между сменами в multi-shift инцидентах: краткое summary, текущие активные действия, неясности.

**L6+**
- Внедряет incident response process в команде/организации: формализованные роли, шаблоны коммуникации, training (game day, wheel of misfortune), severity-based response.
- Связывает incident response с org-level: customer communications policy, regulatory disclosure, executive escalation; защищает blameless-tone в high-pressure инцидентах.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/emergency-response/)** (O'Reilly, 2016), глава 13 «Emergency Response». Типология аварий и Google case studies.
- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/managing-incidents/)** (O'Reilly, 2016), глава 14 «Managing Incidents». Канонические роли (IC, Ops, Comms), Incident Command System, шаблон incident document.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), глава 9. Четыре case studies (effective и ineffective), три принципа ICS — coordinate, communicate, maintain control.

### Статьи и руководства

- **[PagerDuty — Incident Response Documentation](https://response.pagerduty.com/)**. Открытый guide по incident response — Before / During / After, шаблоны коммуникации, роли, чек-листы. По моим наблюдениям, чаще всего именно его берут как стартовый шаблон в новых командах. Apache 2.0, переиспользуемое.
- **[Atlassian — Incident Management Handbook](https://www.atlassian.com/incident-management/handbook)**. Практичный handbook от команды, прошедшей через множество публичных инцидентов.

### Инструменты

- **Alerting / on-call rotation** — **[PagerDuty](https://www.pagerduty.com/)**, **[Opsgenie](https://www.atlassian.com/software/opsgenie)**, **[Grafana OnCall](https://grafana.com/products/oncall/)**. Маршрутизация алертов, escalation policies, ротация дежурств.
- **Incident management platforms** — **[incident.io](https://incident.io/)**, **[FireHydrant](https://firehydrant.com/)**. Автоматизация инцидента: создание Slack-канала, ролей, status page, сбор timeline. Полезны, когда команда выходит за десятки инцидентов в месяц.
- **Status pages** — **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage)**, **[Better Stack](https://betterstack.com/)**. Внешняя коммуникация.
- **Incident log в Slack-канале** — самая базовая форма: один канал на инцидент, timeline в реальном времени с явными timestamp. Достаточно для большинства команд без отдельной платформы.

## Best practices

**Короткие правила:**

- **Роли важнее людей, и назначаются явно даже в команде из двух человек.** «Работаем вместе» без распределения — решения утекают в группу, никто не делает sync-апдейты, MTTR растёт. Явное распределение (даже если все три роли — один человек, это явный выбор) снимает cognitive ambiguity.
- **Tempo updates каждые 15–30 минут, даже «без изменений».** Молчание = «всё плохо» (паника) или «всё уже починили» (стейкхолдеры выходят). Update «нет нового, продолжаем mitigation X, следующий sync через 20 минут» — валидный сигнал и часть incident discipline.
- **Mitigation > root cause во время инцидента.** «Найдём причину, потом будем чинить» — на 40-й минуте сервис всё ещё лежит, команда копает в код. Цель в моменте — вернуть сервис: rollback, failover, graceful degradation, scale out, traffic redirect. Разбор — после.

Подробнее:

**Один канал коммуникации на инцидент.** Технические детали в одном чате, business updates в другом, executive sync в третьем — никто не имеет полной картины. Один Slack-канал на инцидент (с явной структурой: timeline в pinned message, current action в topic) и один external status page; всё остальное — производные. Я регулярно вижу инциденты, в которых рассинхрон между каналами создаёт второй инцидент поверх первого (executive думает что починили, потому что прочёл другой канал).

**Stakeholder communications отделена от technical communications.** Бизнес-стейкхолдеры в общем техническом канале путаются в жаргоне, паникуют от «у нас 503 на checkout endpoint». Comms Lead владеет внешним каналом: переводит технические события в business language («оплата временно недоступна 15% пользователей»), даёт sync-апдейты по расписанию, не дублирует технические детали без необходимости.

**Game day / wheel of misfortune — обязательная подготовка, не «когда будет время».** Первый incident response — реальный production-инцидент в 3 ночи: команда паникует, теряет минуты на ориентацию, IC не уверен в своей роли. Регулярные тренировки (раз в месяц на команду; роли играют по очереди; сценарии — из публичных постмортемов или прошлых инцидентов) превращают knowledge в мышечную память. По моим наблюдениям, разница между командами, делающими game day, и без — это разница в MTTR в 2–3 раза.

## Связанные листья

- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — обязательный after-action для значимого инцидента; качество incident log напрямую определяет качество timeline в постмортеме.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — главный инструмент в моменте инцидента.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — то, что инициирует incident response; качество SLO-алертов влияет на signal/noise.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — норма *blameless* применяется и в моменте инцидента (incident log без «кто это сделал»), не только после.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — incident commander смотрит в service catalog, чтобы понять owner и эскалационный путь.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — engagement model определяет, кто играет IC / Ops / Comms в зависимости от embedded vs consulting.
- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — рамка для измерения «насколько серьёзный инцидент»; определяет response intensity.
- **[Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/)** — внешняя коммуникация во время инцидента.
- **[War Room Patterns](/The-Way-of-SRE/leaves/practices/war-room-patterns/)** — operational дисциплина для multi-team high-severity incidents.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — кто реагирует и в каком состоянии.
- **[Action Items Tracking](/The-Way-of-SRE/leaves/practices/action-items-tracking/)** — close-out incident включает создание AIs с owner / deadline / criterion; этот лист — про дисциплину их выполнения.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — современные incident-инструменты (incident.io, Netflix Dispatch, FireHydrant) — Slack-native ChatOps; declare / coordinate / sitrep живут в chat с встроенным audit trail.
- **[Status Page Management](/The-Way-of-SRE/leaves/practices/status-page-management/)** — public status page update — часть IC checklist в моменте инцидента.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/)** — регулярная тренировка этого процесса до того, как он понадобится; разница в MTTR между командами с game day и без — 2–3 раза.
- **[Playbooks](/The-Way-of-SRE/leaves/culture/playbooks/)** — главный артефакт incident response practice; коэффициент использования playbook'ов в моменте — прямой индикатор зрелости IR.
- **[Postmortem Database](/The-Way-of-SRE/leaves/culture/postmortem-database/)** — incident-management платформы автоматически связывают incident ↔ postmortem ↔ database; tooling-side этой пары практик.

## Открытые вопросы

- Большая часть «открытых вопросов» этого листа выделена в отдельные листы под Incident Management: Severity Classification, Customer Communications, On-Call Rotation, War Room Patterns, Status Page Management. L1 полностью раскрыта по основным операционным практикам.
