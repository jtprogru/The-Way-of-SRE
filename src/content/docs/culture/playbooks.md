---
title: Playbooks
description: Сценарии реагирования на класс инцидентов с явными ролями, decision points и cadence — про координацию, не про команды
sfia: [3, 4, 5, 6]
status: draft
---

«Playbook и [runbook](/The-Way-of-SRE/glossary/#runbook) — это одно и то же?» — вопрос, который я слышу почти от каждой команды, у которой первый раз появляется инцидент с двумя командами в war room. Терминология в индустрии действительно плавающая: Google SRE Workbook называет «playbook» то, что в индустрии DevOps обычно зовут runbook. Я придерживаюсь различения, которое закрепилось в incident-response сообществе после PagerDuty / incident.io в 2020-х: **runbook — это конкретные шаги для одного симптома** («увидел 5xx > 1% → выполни шаги 1-N»); **playbook — это сценарий реагирования для класса инцидентов** с ролями, decision points, cadence, escalation. Лист — про playbook'и; про runbook'и — соседний лист [Runbooks](/The-Way-of-SRE/culture/runbooks/), который явно вынес обсуждение границы как TBD; этот лист её закрывает.

Один способ почувствовать разницу: на инциденте «data corruption в primary DB» runbook ответит на вопросы «как проверить целостность? как переключиться на реплику?». Playbook ответит на вопросы «кого позвать? что говорим клиентам сейчас и через час? в какой момент решаем не восстанавливать данные, а пересоздать таблицу? кто принимает решение?». Это разные документы и разные навыки. Runbook читает on-call инженер; playbook читает Incident Commander.

## Что должен уметь

Главный навык на уровне L5 — **проектировать playbook так, чтобы он работал при стрессе IC, а не выглядел красиво на ревью**. Я регулярно вижу 12-страничные playbook'и с decision matrix на 30 строк — они не открываются в моменте инцидента, потому что IC не успевает их прочитать. Хороший playbook помещается на одну страницу для quick reference: роли (2-3 строки), первые действия (5-7 шагов), decision points (3-4 явных вопроса), escalation (когда + кому), comms cadence (когда обновлять статус). Всё остальное — в приложениях, которые открываются по ссылке.

**L3**
- Понимает разницу между playbook и runbook; знает, какие playbook'и команда использует; следует роли, назначенной в playbook (responder, scribe, comms).

**L4**
- Пишет playbook для известного класса инцидентов своего сервиса: роли, первые действия, decision points, escalation criteria, comms cadence. Обновляет после каждого инцидента, в котором playbook использовался.
- Различает playbook'и по severity: SEV1 и SEV3 — это разные роли, разная интенсивность и разные коммуникации. Не использует один документ на все уровни.

**L5**
- Проектирует семейство playbook'ов для команды/сервиса: incident response, security incident, data corruption, capacity emergency, vendor outage. Согласует общую структуру между ними.
- Встраивает playbook в поток работы с инцидентом: команда ChatOps (`/incident declare`) подтягивает нужный документ в канал war room, роли распределяются автоматически, чеклист рендерится сам.
- Проводит quarterly review playbook'ов: какие открывались и как часто, какие шаги работали, какие — нет. Playbook без использования за полгода либо удаляется, либо инспектируется.

**L6+**
- Внедряет практику playbook на уровне всей организации: единая структура, шаблоны, обмен между командами, управление актуальностью.
- Связывает playbook с regulatory обязательствами там, где они есть (PCI-DSS incident response, GDPR breach notification, SOC 2): playbook — артефакт compliance, не только operational tool.

## Материалы

### Книги

- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/on-call/)** (O'Reilly, 2018), глава 8 «On-Call». Google использует «playbook» как обобщённый термин, но описанная структура (severity, impact, debugging suggestions, mitigation) практически совпадает с тем, что incident.io / PagerDuty называют playbook сегодня. Полезно как baseline.
- Atlassian — **[Incident Management Handbook](https://www.atlassian.com/incident-management)** (живой документ). Самый детальный публичный гайд по структуре playbook'а в индустрии 2020-х. Главы по severity playbook, communications playbook, postmortem playbook читаются как референс.

### Статьи и доклады

- **[PagerDuty Incident Response Documentation](https://response.pagerduty.com/)**. Публично выложенный playbook PagerDuty: роли (IC, Deputy, Scribe, Subject Matter Experts), severity playbook, training playbook. По моим наблюдениям — самый часто адаптируемый референс в индустрии. Команды берут как стартовый template и подгоняют под себя.
- **[Google SRE Book, Chapter 14 «Managing Incidents»](https://sre.google/sre-book/managing-incidents/)**. Принципы incident command (заимствованы из ICS — Incident Command System пожарной службы): clear roles, working in concert, calm under pressure. Это **философская основа** playbook'ов, читается до конкретных шаблонов.
- **[Материалы incident.io](https://incident.io/guide)** — их руководство по управлению инцидентами с разбором типовых сценариев. По моим наблюдениям, полезнее всего именно как набор стартовых точек, а не готовых документов: скопировать чужой playbook целиком не выйдет, он всегда про чужую систему.

### Инструменты

- **Markdown в репозитории команды** — базовый формат, как и для runbook'ов. PR-based review, git history, легко искать. Я регулярно вижу, что зрелые команды держат playbook'и в одном репо с runbook'ами, под разными директориями.
- **[incident.io](https://incident.io/) / [FireHydrant](https://firehydrant.com/) / [Rootly](https://rootly.com/)** — incident management платформы, в которых playbook — first-class entity: декларация инцидента → автоматический выбор playbook → роли распределяются в Slack → checklist рендерится в war room channel. По моим наблюдениям, оправданы в org от 50+ инженеров, где инциденты ≥ еженедельно. В команде из 10 человек — overengineering, markdown справится.
- **[Netflix Dispatch](https://github.com/Netflix/dispatch)** — open-source альтернатива managed platforms. Playbook как код, интеграция со Slack / PagerDuty / Jira. Берут команды, которые не хотят зависеть от SaaS.
- **Команда ChatOps `/incident declare <type>`** — самый частый способ привязать playbook к инциденту в моменте. Bot создаёт war room, постит первый чеклист, тегает IC. См. [ChatOps](/The-Way-of-SRE/engineering/chatops/) для деталей.

## Best practices

Главный публичный кейс — **PagerDuty Incident Response Documentation**. PagerDuty опубликовала свои внутренние playbook'и в 2017 году как open-source. На момент написания листа это самый цитируемый референс в индустрии: роли IC / Deputy / Scribe / SME, training playbook (как готовить новых IC), severity playbook с явной decision matrix, communications playbook. Уникальность этого источника не в том, что они «правильные» — а в том, что они **публично доступны и адаптируемы**. Команды берут их как baseline, подрезают под свою специфику (часть ролей объединяется, шкала severity упрощается), и через 2-3 итерации получают свой рабочий playbook без необходимости изобретать структуру с нуля. Если читаете лист и впервые внедряете playbook — начните с PagerDuty, дальше — incident.io библиотека.

Playbook пишется на класс инцидентов, а не на один конкретный. Единый документ «на любой инцидент» не работает: нужно семейство по типу — база, сеть, безопасность, поставщик, исчерпание ёмкости — и внутри него разделение по severity. Один playbook равен одному повторяющемуся сценарию, а не одному случаю из прошлого квартала.

Дальше — размер. Двенадцать страниц с матрицами в моменте инцидента не читает никто, тем более IC, у которого параллельно горят три чата. На быстрый доступ отводится ровно одна страница: роли, первые шаги, точки принятия решения, эскалация, коммуникации. Всё остальное уезжает в приложения за ссылками.

И третье — связь с severity должна быть явной. SEV1 тянет за собой уведомление руководства, публичную статус-страницу, war room на десяток человек. SEV3 — это IC и один эксперт, которые тихо чинят без всякой эскалации. Применить документ SEV1 к SEV3 значит выжечь команду на ровном месте, а обратная ошибка стоит пропущенной эскалации.

**Playbook без тренировки работает только один раз.** Я регулярно вижу команды, у которых playbook'и записаны качественно, но в моменте инцидента IC не открывает их — потому что никогда не открывал раньше, не помнит структуры, ищет в Confluence по поиску. Playbook — это **muscle memory**: его открывают на каждом game day, прогоняют по ролям, обнаруживают пропуски. Без game day playbook остаётся знанием, не навыком. Тренировочная сторона практики разобрана в [Game Day / Chaos Drills](/The-Way-of-SRE/culture/game-day/).

**Decision points — главное, что отличает playbook от runbook.** Runbook отвечает на вопрос «что делать» (конкретные команды). Playbook отвечает на вопрос «**в какой момент** что решать» (decision points). Примеры decision points из playbook'ов, которые я видел работающими: «через 30 минут без mitigation — escalate к executive». «Если data loss > 5 минут — рассмотреть переключение на secondary с потерей данных vs восстановление primary». «Если customer impact > 10% и > 15 минут — public status page update». Это не шаги runbook, а **явные точки принятия решения IC**, которые без документа принимаются на ходу.

**Playbook — артефакт постмортема, не запасной документ.** Самый частый источник update'ов playbook'а — это постмортемы. Шаг, который IC не помнил → новый decision point в playbook. Communication, которая дошла поздно → cadence updated. Эскалация, которая случилась поздно → escalation criteria уточнены. Playbook без regular updates устаревает быстрее runbook'а, потому что структура инцидентов меняется с изменением org. Я регулярно вижу playbook'и, которые ссылаются на роли (Director of Engineering), которых в org больше нет, или на каналы Slack, которые archived. Это не playbook, это исторический документ.

**Роль IC зависит от severity.** На SEV3 IC может быть on-call инженер, который ведёт инцидент сам. На SEV1 IC должен быть **выделенный человек**, не вовлечённый в техническое расследование. Это правило из ICS, которое чаще всего нарушают: IC и Ops Lead — один человек, в результате coordination проседает, communications отстают, escalation запаздывают. Playbook SEV1 явно фиксирует разделение ролей; SEV3 playbook — допускает совмещение.

## Связанные листья

- **[Runbooks](/The-Way-of-SRE/culture/runbooks/)** — runbook отвечает «как делать», playbook — «что решать и кого звать». Runbook'и встраиваются в playbook'и как ссылки на конкретные шаги; playbook без runbook — обещание, runbook без playbook — фрагмент.
- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — playbook'и — главный артефакт incident response practice; коэффициент использования playbook'ов — прямой индикатор зрелости IR.
- **[Severity Classification](/The-Way-of-SRE/practices/severity-classification/)** — playbook выбирается по severity; чёткая матрица severity — предпосылка работающего семейства playbook'ов.
- **[Customer Communications](/The-Way-of-SRE/practices/customer-communications/)** — ритм коммуникаций — часть playbook'а; матрица «severity → канал → частота» живёт там же.
- **[War Room Patterns](/The-Way-of-SRE/practices/war-room-patterns/)** — playbook включает war room setup (когда открывать, кого звать, как закрывать); pattern'ы war room — деталь playbook'а.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/culture/game-day/)** — playbook'и тренируются в game day; неоткрываемый playbook = не-навык.
- **[ChatOps](/The-Way-of-SRE/engineering/chatops/)** — playbook привязывается к инциденту командой вида `/incident declare`; современные платформы управления инцидентами и есть ChatOps, живущий прямо в Slack.
- **[Status Page Management](/The-Way-of-SRE/practices/status-page-management/)** — обновление публичной статус-страницы — шаг в коммуникационной секции playbook'а; частота обновлений задаётся там же.

## Открытые вопросы

Терминология в индустрии так и не сошлась. Сообщество вокруг реагирования на инциденты различает runbook и playbook явно, а Google SRE Workbook пользуется словами как синонимами. Если в вашей команде закрепился свой вариант — это нормально: важно, чтобы определение было записано, а не совпадало с чужим. Терминологический холивар точно не стоит того, чтобы из-за него playbook остался ненаписанным.

Второй вопрос — playbook как обязательный артефакт для регуляторов. PCI-DSS, GDPR и SOC 2 требуют документированного плана реагирования, и я не уверен, как правильно совмещать короткий рабочий документ с формальным и подробным. Скорее всего, это два документа с перекрёстными ссылками. Рабочей публичной практики на эту границу я не встречал, так что если у вас есть опыт — расскажите через PR.

Отдельно наблюдаю за генерацией playbook'ов ассистентом на основе сервиса, архитектуры и прошлых инцидентов. На начало 2026 года это активная область экспериментов (incident.io AI, FireHydrant AI), но рабочих кейсов в публичной литературе пока мало.
