---
title: Action Items Tracking
description: Дисциплина выполнения action items после постмортема — owner, deadline, success criterion, completion rate как метрика
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Problem Management / Action Items Tracking
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Action items с прошлого постмортема? Половина закрыта, половина забыта». Я регулярно вижу команды, у которых постмортем-процесс работает (blameless, корректный RCA, AIs сформулированы) — но через 6 месяцев тот же incident возвращается, потому что AIs так и не были выполнены. Action Items Tracking — это **дисциплина выполнения**, без неё постмортем превращается в ритуал самообмана: «мы извлекли уроки» при том, что ничего не изменилось. Главная практика внутри L1 `Problem Management`, замыкающая цикл с [Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/).

Граница: blameless postmortem — process generation AIs; action items tracking — process execution and verification. Между ними обычно теряются 30–50% AIs.

## Что должен уметь

Главный навык на уровне L4 — **completion rate как метрика качества всего постмортем-процесса**. По моим наблюдениям, ни одна команда, которая не трекает completion rate, не имеет здорового AI-flow — потому что без метрики невозможно увидеть, что система сломана, пока тот же incident не вернётся. Healthy команда мерит rate ежеквартально; при падении < 70% — root-cause analysis самого AI-process, не уход в «надо лучше стараться».

- **L3** — Каждый AI имеет: owner (named individual, не team), deadline, success criterion («что значит — сделано»). Без всех трёх AI не считается AI.
- **L3** — AIs живут в issue tracker рядом с обычной работой (Jira / Linear / GitHub Issues), не в постмортем-документе. Документ — статичный snapshot; AIs — живые tickets.
- **L4** — Приоритет AI явно помечается: P0 prevent recurrence vs P3 nice-to-have. Без приоритизации все AI размываются.
- **L4** — Регулярный AI review ritual (monthly / после каждого крупного incident): что closed, что overdue, что нужно escalate / re-scope / drop.
- **L5** — Трекает completion rate как leading indicator quality постмортем-процесса; при тренде вниз — root-cause AI-process, не давление на исполнителей.
- **L5** — AI escalation policy: что происходит, если AI overdue на 1 cycle, 2 cycles, 3 cycles. Без явной escalation overdue AIs накапливаются как тихий долг.
- **L6+** — Trend analysis across incidents: какие categories AI repeated (systemic pattern), какие drop (consistent under-prioritisation), какие AI закрываем сознательно как «риск принят».
- **L6+** — Связывает AI program с org incident strategy: budget time на reliability work (включая выполнение AI) явно зарезервирован, иначе AI всегда проигрывают feature work.

## Материалы

### Книги

- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/postmortem-culture/)** (O'Reilly, 2016), глава 15 «Postmortem Culture». Часть про AI — не детальная, но фиксирует canonical position: AI без owner / deadline / criterion — не AI.
- Betsy Beyer et al. (eds) — **[The Site Reliability Workbook](https://sre.google/workbook/postmortem-culture/)** (O'Reilly, 2018), глава 10 «Postmortem Culture: Learning from Failure». Расширяет первую: AI metrics, completion tracking, anti-patterns.
- John Allspaw — **[Etsy Debriefing Facilitation Guide](https://extfiles.etsy.com/DebriefingFacilitationGuide.pdf)** (Etsy, 2016). Не про tracking напрямую, но описывает original postmortem culture, в которой AI tracking был интегральной частью «learning from incidents».

### Статьи и доклады

- Lorin Hochstein — **[Action items are unhelpful when they're context-free](https://surfingcomplexity.blog/2024/07/03/action-items-are-unhelpful-when-theyre-context-free/)** (Surfing Complexity blog, 2024). Тонкий разбор того, почему AIs без явного «зачем» не выполняются — даже когда формально все три атрибута на месте. Полезно после first wave AI program.
- John Allspaw — **[How Complex Systems Fail (Cook, 1998) revisited](https://www.adaptivecapacitylabs.com/blog/2017/12/05/john-allspaws-blameless-postmortems-and-a-just-culture/)**. Resilience engineering perspective: AIs не должны быть единственным выводом из incident — они мерят понимание узко.
- Will Gallego — **[Action Items vs Action Theatre](https://www.willgallego.com/action-items-action-theater/)** (личный блог, 2021). Различение «implemented AI» vs «theatre AI» — выполнили formality без real effect.

### Инструменты

- **Jira / Linear / GitHub Issues / Notion** — primary AI tracking. Интегрирован с обычным backlog. По моим наблюдениям, чаще выигрывает выбор «AI в том же tracker, где обычная работа» — потому что separate AI-tracker через полгода стагнирует.
- **[incident.io](https://incident.io/) / [FireHydrant](https://firehydrant.com/) / [Rootly](https://rootly.com/)** — incident-platforms с built-in AI tracking; преимущество — AI создаются в incident timeline и автоматически связываются. По моим наблюдениям, чаще берут такие platforms команды с высоким incident volume; для команд с 1–2 incidents в месяц separate platform — over-engineering.
- **[Jeli](https://www.jeli.io/) / [Howie](https://www.jeli.io/howie)** — narrative-focused postmortem tools; AI tracking интегрирован, но фокус — на richer learning narrative.
- **Dashboards (Grafana / Datadog / custom)** — AI completion rate, overdue count, time-to-close distribution. Самая важная visibility, которую регулярно забывают сделать.

## Best practices

Главный публичный кейс — **GitLab database incident, January 31 2017**. Команда опубликовала [подробный postmortem](https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/) — пример blameless write-up. Менее известно, но публично прослеживается через их issue tracker: GitLab публично трекали выполнение AI («Better backups», «Better monitoring», «Database restore testing») с visible status updates и закрытыми tickets через несколько месяцев. Это образец того, как **execution side постмортема может быть transparent**: не только «мы написали постмортем», но «вот ticket, вот merged PR, вот изменённый runbook». Сравнить с командами, у которых postmortem публикуется, а AIs исчезают в private project, — разница в trust для клиента и для самой команды.

**Короткие правила:**

- **AI без owner / deadline / success criterion — не AI.** «Команда подумает над улучшением мониторинга» через 6 месяцев — не AI, а wish. Named owner + явный deadline + критерий «что значит — сделано» — все три обязательны.
- **AI в issue tracker, не в постмортем-документе.** Документ — статичный snapshot момента learning; AI — живые tickets в обычном backlog. Не дублировать «status: done» в двух местах — это invitation для drift.
- **Completion rate — SLI постмортем-программы.** Дашборд с rate completed / overdue / dropped per quarter. При rate < 70% — root-cause processa, не давление на людей.

Подробнее:

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

- **Severity Threshold для AI review** — нужны ли AIs для P3/P4 incidents, или это over-process? По моим наблюдениям, диапазон сильно зависит от incident volume команды.
- **Cross-team AI Ownership** *(TBD)* — что делать, когда AI требует изменений в чужой команде. Эскалационный процесс — отдельный набор паттернов.
- **AI Aging Policy** — после какого срока (6 / 12 / 18 месяцев) overdue AI автоматически закрывается с явным обоснованием. Нет canonical правила.
- Я не уверен, какая **completion rate threshold** правильна как алертный сигнал. 70% — практический guess; если у вас есть данные, расскажите через PR.
