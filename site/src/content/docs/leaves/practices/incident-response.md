---
title: Incident Response
description: Процесс координации реагирования на инциденты — роли (IC, Comms, Ops), escalation paths, war room, коммуникация со стейкхолдерами
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / Incident Response
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Процесс координации реагирования на инциденты: роли (Incident Commander, Communications Lead, Operations Lead), escalation paths, war room, коммуникация со стейкхолдерами. Цель в моменте — **минимизировать MTTR при соблюдении blameless-принципов** и сохранить достаточно сигнала для последующего постмортема. Не путать с [Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/) (Practices/Problem Management — after-action разбор); здесь — про *during-action*.

## Что должен уметь

- **L3** — Понимает базовые роли incident response (IC, Comms Lead, Ops Lead); знает, кому пинговать в инциденте; зовёт IC при неясности.
- **L3** — Следует runbook'у для типового сценария; фиксирует свои действия в incident log (Slack-канал инцидента / документ) с timestamp-ами; эскалирует, если шаги не работают.
- **L4** — Выступает Operations Lead в малых инцидентах: ведёт диагностику, применяет mitigation, координирует с командой; знает rollback procedure для своих сервисов и применяет её безопасно.
- **L4** — Ведёт incident log как narrative: что произошло, что попробовали, что сработало; этот лог становится основой timeline для постмортема и снижает cognitive load в моменте.
- **L5** — Выступает Incident Commander: координирует действия команды, делает sync-апдейты для стейкхолдеров каждые 15–30 минут, принимает решения о rollback / эскалации / привлечении дополнительных людей.
- **L5** — Балансирует mitigation vs investigation: понимает, когда достаточно временного fix (вернуть сервис → постмортем), а когда нужно копать сразу (повторение приведёт к большему ущербу).
- **L5** — Проводит structured handoff между сменами в multi-shift инцидентах: краткое summary, текущие активные действия, неясности, на которые нужен ответ; без handoff'а смена начинает с нуля и теряет 30 минут.
- **L6+** — Внедряет incident response process в команде/организации: формализованные роли, шаблоны коммуникации, training (game day, wheel of misfortune), интеграция с monitoring/paging, severity-based response (что = SEV-1 / 2 / 3).
- **L6+** — Связывает incident response с org-level: customer communications policy (что и когда говорим клиентам), regulatory disclosure (data breach / availability), executive escalation; защищает blameless-tone в high-pressure инцидентах.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/emergency-response/)** (O'Reilly, 2016), глава 13 «Emergency Response». База: типология аварий (test-induced, change-induced, process-induced) и Google case studies.
- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/managing-incidents/)** (O'Reilly, 2016), глава 14 «Managing Incidents». База: канонические роли (IC, Ops, Comms), Incident Command System, шаблон incident document.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), глава 9 «Incident Response». База: четыре case studies (effective и ineffective), три принципа ICS — coordinate, communicate, maintain control.

### Статьи и руководства

- **[PagerDuty — Incident Response Documentation](https://response.pagerduty.com/)**. База: открытый guide по incident response — Before / During / After incident, шаблоны коммуникации, роли, чек-листы. Apache 2.0, переиспользуемое в своей документации.
- **[Atlassian — Incident Management Handbook](https://www.atlassian.com/incident-management/handbook)**. Дополнительно: практичный handbook от команды, прошедшей через множество публичных инцидентов; полезен как cross-reference для своих процессов.

### Инструменты

- **Alerting / on-call rotation** — **[PagerDuty](https://www.pagerduty.com/)**, **[Opsgenie](https://www.atlassian.com/software/opsgenie)**, **[Grafana OnCall](https://grafana.com/products/oncall/)**. Маршрутизация алертов, escalation policies, ротация дежурств.
- **Incident management platforms** — **[incident.io](https://incident.io/)**, **[FireHydrant](https://firehydrant.com/)**. Автоматизация инцидента: создание Slack-канала, ролей, status page, сбор timeline, integration с retro. Полезны, когда команда выходит за десятки инцидентов в месяц.
- **Status pages** — **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage)**, **[Better Stack](https://betterstack.com/)**. Внешняя коммуникация: что видят пользователи / клиенты во время инцидента.
- **Incident log в Slack-канале** — самая базовая форма: один канал на инцидент, timeline пишется в реальном времени с явными timestamp-ами и chevron-форматом (`⚠️ start`, `🔍 investigating`, `🛠 mitigation`, `✅ resolved`). Без платформы достаточно для большинства команд.

## Best practices

- **Роли важнее людей, и назначаются явно даже в команде из двух человек.** Антипаттерн: «работаем вместе» без распределения ролей — IC, Ops Lead и Comms Lead в одном лице. Решения утекают в группу, никто не делает sync-апдейты, MTTR растёт, стейкхолдеры замолкают. Явное распределение (даже если все три роли — один человек, это явный выбор) снимает cognitive ambiguity.
- **Tempo updates каждые 15–30 минут, даже «без изменений».** Антипаттерн: молчание во время инцидента. Стейкхолдеры интерпретируют молчание либо как «всё плохо» (паника), либо как «всё уже починили» (выходят из калинга). Update «нет нового, продолжаем mitigation X, следующий sync через 20 минут» — это валидный сигнал и часть incident discipline.
- **Mitigation > root cause во время инцидента.** Антипаттерн: «найдём причину, потом будем чинить» — на 40-й минуте сервис всё ещё лежит, потому что команда копает в код. Цель в моменте — вернуть сервис: rollback, failover, graceful degradation, scale out, traffic redirect. Разбор причин — после, в постмортеме. Сначала пациент стабилизирован, потом диагноз.
- **Один канал коммуникации на инцидент.** Антипаттерн: технические детали в одном чате, business updates в другом, executive sync в третьем — никто не имеет полной картины. Один Slack-канал на инцидент (с явной структурой: timeline в pinned message, current action в topic) и один external status page; всё остальное — производные от них.
- **Stakeholder communications отделена от technical communications.** Антипаттерн: бизнес-стейкхолдеры в общем техническом канале, путаются в jargon, паникуют от «у нас 503 на checkout endpoint». Comms Lead владеет внешним каналом: переводит технические события в business language («оплата временно недоступна 15% пользователей»), даёт sync-апдейты по расписанию, не дублирует технические детали без необходимости.
- **Game day / wheel of misfortune — обязательная подготовка, не «когда будет время».** Антипаттерн: первый incident response — реальный production-инцидент. Команда паникует, теряет минуты на ориентацию в инструментах, IC не уверен в своей роли. Регулярные тренировки (раз в месяц на команду; роли играют по очереди; сценарии — из публичных постмортемов или прошлых инцидентов) превращают knowledge в мышечную память.

## Связанные листья

- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — обязательный after-action для значимого инцидента; качество incident log напрямую определяет качество последующего timeline в постмортеме.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — главный инструмент в моменте инцидента; runbook'и для типовых сценариев снижают cognitive load и MTTR.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — то, что инициирует incident response; качество SLO-алертов прямо влияет на signal/noise ratio и на скорость распознавания серьёзного инцидента.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — норма blameless применяется и в моменте инцидента (incident log без «кто это сделал»), не только после.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — incident commander смотрит в service catalog, чтобы понять, кто owner и каков эскалационный путь; без catalog'а escalation работает по знакомству.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — engagement model определяет, кто играет IC / Ops Lead / Comms Lead в зависимости от того, embedded SRE или consulting; partnership-контракт фиксирует эскалационные пути.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — incident response — главный навык, под который готовит onboarding; supervised on-call — мост от training к самостоятельной ротации.

## Открытые вопросы

- **On-Call Rotation** *(TBD)* — отдельный лист про дисциплину дежурства: ротация, follow-the-sun, compensation, alert hygiene, on-call health. Сосед под Incident Management L1.
- **Severity Classification & Escalation Policy** *(TBD)* — детальная схема классификации (SEV-1/2/3/4), кто эскалируется на каждом уровне, какие decisions требуют executive approval. Сейчас упомянуто как best practice; при углублении ветви — возможно отдельный лист или раздел.
- **Customer Communications в инциденте** — отдельная подтема: какой template для status page, как составляется внешний message, регуляторные требования (data breach disclosure). Возможный соседний лист или часть `IT Management`.
