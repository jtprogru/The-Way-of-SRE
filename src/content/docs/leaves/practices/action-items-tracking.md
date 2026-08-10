---
title: Action Items Tracking
description: Дисциплина доводить action items постмортема до конца, а не до формулировки
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Problem Management / Action Items Tracking
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Action items с прошлого постмортема? Половина закрыта, половина забыта». Я регулярно вижу команды, у которых сам разбор работает как надо: режим blameless соблюдён, причины разобраны, задачи сформулированы. А через полгода возвращается тот же инцидент, потому что до задач руки так и не дошли. Action Items Tracking — это **дисциплина выполнения**. Без неё постмортем превращается в ритуал самообмана: «мы извлекли уроки» при том, что не изменилось ничего. Главная практика внутри L1 `Problem Management`, замыкающая цикл с [Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/).

Граница: blameless postmortem — process generation AIs; action items tracking — process execution and verification. Между ними обычно теряются 30–50% AIs.

## Что должен уметь

Главный навык на уровне L4 — **completion rate как метрика качества всего постмортем-процесса**. По моим наблюдениям, ни одна команда, которая не трекает completion rate, не имеет здорового AI-flow — потому что без метрики невозможно увидеть, что система сломана, пока тот же incident не вернётся. Healthy команда мерит rate ежеквартально; при падении < 70% — root-cause analysis самого AI-process, не уход в «надо лучше стараться».

**L3**
- Каждый AI имеет: owner (named individual, не team), deadline, success criterion («что значит — сделано»). Без всех трёх AI не считается AI.
- AIs живут в issue tracker рядом с обычной работой (Jira / Linear / GitHub Issues), не в постмортем-документе. Документ — статичный snapshot; AIs — живые tickets.

**L4**
- Приоритет AI явно помечается: P0 prevent recurrence vs P3 nice-to-have. Без приоритизации все AI размываются.
- Регулярный AI review ritual (monthly / после каждого крупного incident): что closed, что overdue, что нужно escalate / re-scope / drop.

**L5**
- Трекает completion rate как leading indicator quality постмортем-процесса; при тренде вниз — root-cause AI-process, не давление на исполнителей.
- AI escalation policy: что происходит, если AI overdue на 1 cycle, 2 cycles, 3 cycles. Без явной escalation overdue AIs накапливаются как тихий долг.

**L6+**
- Trend analysis across incidents: какие categories AI repeated (systemic pattern), какие drop (consistent under-prioritisation), какие AI закрываем сознательно как «риск принят».
- Связывает AI program с org incident strategy: budget time на reliability work (включая выполнение AI) явно зарезервирован, иначе AI всегда проигрывают feature work.

## Материалы

### Книги

- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/postmortem-culture/)** (O'Reilly, 2016), глава 15 «Postmortem Culture». Часть про AI — не детальная, но фиксирует canonical position: AI без owner / deadline / criterion — не AI.
- Betsy Beyer et al. (eds) — **[The Site Reliability Workbook](https://sre.google/workbook/postmortem-culture/)** (O'Reilly, 2018), глава 10 «Postmortem Culture: Learning from Failure». Расширяет первую: AI metrics, completion tracking, anti-patterns.
- John Allspaw, Morgan Evans, Daniel Schauenberg — **[Etsy Debriefing Facilitation Guide](https://extfiles.etsy.com/DebriefingFacilitationGuide.pdf)** (Etsy, 2016). Не про tracking напрямую, но описывает original postmortem culture, в которой AI tracking был интегральной частью «learning from incidents».

### Статьи и доклады

- Lorin Hochstein — **[Why I don't like discussing action items during incident reviews](https://surfingcomplexity.blog/2024/09/28/why-i-dont-like-discussing-action-items-during-incident-reviews/)** (Surfing Complexity, 2024). Позиция ровно против того, что описано в этом листе: Хохштейн считает, что обновление картины мира у участников даёт больше, чем список задач. Я с ним не согласен в части «вместо», но согласен в части «список задач не заменяет понимание» — читать как контраргумент к собственной практике.
- John Allspaw — **[Blameless PostMortems and a Just Culture](https://www.etsy.com/codeascraft/blameless-postmortems/)** (Etsy Code as Craft, 2012). Первоисточник словаря; важен здесь тем, что связывает готовность людей честно рассказывать о своих действиях с тем, какие задачи в итоге формулируются.

### Инструменты

- **Jira / Linear / GitHub Issues / Notion** — primary AI tracking. Интегрирован с обычным backlog. По моим наблюдениям, чаще выигрывает выбор «AI в том же tracker, где обычная работа» — потому что separate AI-tracker через полгода стагнирует.
- **[incident.io](https://incident.io/) / [FireHydrant](https://firehydrant.com/) / [Rootly](https://rootly.com/)** — incident-platforms с built-in AI tracking; преимущество — AI создаются в incident timeline и автоматически связываются. По моим наблюдениям, такие платформы чаще берут команды с высоким потоком инцидентов. Команде, у которой один-два инцидента в месяц, отдельная платформа не годится: заводить её дороже, чем вести те же задачи в общем трекере.
- **[Jeli](https://www.pagerduty.com/platform/jeli/)** — narrative-focused подход к разбору: AI tracking интегрирован, но фокус — на richer learning narrative. Самостоятельного продукта больше нет: PagerDuty купила Jeli в 2023 и встроила в свою платформу; методичка Howie, которую Jeli выпускала отдельно, разошлась по копиям в сообществе.
- **Dashboards (Grafana / Datadog / custom)** — AI completion rate, overdue count, time-to-close distribution. Самая важная visibility, которую регулярно забывают сделать.

## Best practices

Главный публичный кейс — **GitLab database incident, January 31 2017**. Команда опубликовала [подробный postmortem](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/) — пример blameless write-up. Менее известна его вторая половина: в конце документа перечислены пятнадцать задач, каждая со ссылкой на публичный issue в их инфраструктурном трекере — «Prometheus monitoring for backups», «Automated testing of recovering PostgreSQL database backups», «Assign an owner for data durability» и так далее. Отдельным пунктом заведён meta-issue со сводным статусом всех остальных: то есть команда сразу построила себе единую точку, по которой видно, что закрыто, а что нет. Это образец того, как **execution side постмортема может быть transparent**: не только «мы написали постмортем», но «вот ticket, вот merged PR, вот изменённый runbook». Сравнить с командами, у которых postmortem публикуется, а AIs исчезают в private project, — разница в trust для клиента и для самой команды.

Из этого вытекают три правила, на которых всё держится. Первое: задача без владельца, срока и критерия «что значит — сделано» задачей не считается. «Команда подумает над улучшением мониторинга» — это не action item, это пожелание, и через полгода оно выглядит ровно так же, как в день написания. Второе: задачи живут в трекере, а не в документе постмортема. Документ — статичный снимок момента, когда команда разобралась; задачи после него идут в общий backlog и конкурируют там со всем остальным. Дублировать «status: done» в двух местах не надо, эти два места разъедутся.

Третье правило — про метрику. Completion rate работает как SLI всей программы разборов: дашборд со счётчиками closed, overdue и dropped за квартал показывает состояние процесса раньше, чем это сделает вернувшийся инцидент. Ниже 70% — разбирать сам процесс, а не давить на исполнителей.

**Owner — individual, не team.** «Backend team will improve monitoring» — типовой failure mode: команда as owner означает no owner. Кто-то конкретно подписывается, даже если работа потом распределится. Без named individual AI становится sub-task feature backlog и проигрывает любой product priority. Я регулярно вижу команды, которые искренне думают, что «team owns it» — и через 6 месяцев AI не сделан, и никто не виноват, потому что виноваты все.

**AI с приоритетом, а не равнозначные.** «Postmortem produced 12 AIs» — нездоровая ситуация без приоритизации: 12 равноценных AIs означают 0 priorities. Healthy подход: 2–3 P0 (prevent recurrence), 3–5 P1 (substantial improvement), остальные — P2/P3 (nice-to-have, можно reasonably drop). Без приоритизации команда тратит ресурсы равномерно — и в результате P0 не закрыт, а P3 закрыт «потому что был проще».

**Сознательный drop — это здоровое решение.** Не все AIs должны быть выполнены. Иногда правильный ответ — «риск принят, мы не будем это делать», и это лучше, чем тихо overdue. Healthy AI process включает явный path «re-scope / drop / accept risk»; нездоровый — только path «complete», поэтому все incomplete AIs становятся тихим долгом. Регулярно (раз в квартал) — review overdue AIs с явным решением: продолжаем / re-scope / закрываем как «принятый риск» с обоснованием.

**Action items theatre — антипаттерн, который трудно увидеть.** Формально AI закрыт: PR смержен, monitoring добавлен, runbook обновлён. Реально incident повторится, потому что закрыли формальность, а не root-cause. По моим наблюдениям, единственный способ ловить theatre — это recurring incident review: тот же incident вернулся через 6 месяцев? Какие AIs были? Что мы сделали с ними? Если AIs «выполнены», но incident вернулся — у нас theatre. Это не повод обвинять — это сигнал переделать класс AI на более глубокий вопрос.

## Связанные листья

- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — постмортем — где AIs генерируются; этот лист — где они выполняются. Без обоих половины cycle отсутствует.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — incident — источник AIs; close-out incident включает создание AIs с owner / deadline / criterion.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — culture-side: org-level норма «AI completion обсуждается на retro, а не молчаливо drop'ается».
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — AI completion rate — leading indicator SLO health: low completion = накапливаются systemic risks = SLO burn быстрее.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — повторяющиеся «manual workaround»-AIs — кандидаты в toil backlog.
- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — overdue AIs обсуждаются с owner на 1:1, а не публично через escalation. 1:1 — первое место для unblocking.

## Открытые вопросы

Порог severity, с которого разбор вообще заводит задачи, я для себя не закрыл: нужны ли action items для P3 и P4 или это уже процесс ради процесса. По моим наблюдениям, ответ сильно зависит от потока инцидентов в команде. Рядом лежит **cross-team ownership** *(TBD)* — что делать, когда задача требует изменений в чужой команде; эскалация тут отдельный набор паттернов, и одним абзацем он не закрывается.

Не хватает и политики устаревания. Через какой срок — полгода, год, полтора — просроченная задача закрывается автоматически с явным обоснованием? Канонического правила я не встречал, у каждой команды свой.

Я не уверен и в том, какой порог completion rate правилен как алертный сигнал. 70% — практическая догадка. Если у вас есть данные, расскажите через PR.
