---
title: Blameless Postmortem
description: Ритуал разбора инцидента — timeline на фактах, contributing factors, action items с владельцем, дедлайном и критерием готовности
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Problem Management / Blameless Postmortem
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

**Ритуал** разбора инцидента: timeline на фактах, contributing factors, action items с владельцем, дедлайном и критерием готовности. Не путать с [Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/) (Culture/Learning Delivery — **норма** blameless, *почему* команда разбирает инциденты так, а не иначе); здесь — про **процесс**, *что* команда делает на встрече, в каком порядке, с какими артефактами. Один лист про норму, другой про ритуал; они опираются друг на друга и не дублируют scope.

## Что должен уметь

- **L3** — Участвует в постмортеме как факт-репортёр: описывает свои действия в timeline без интерпретаций; не задаёт вопросов «кто это сделал».
- **L3** — Читает чужие постмортемы и понимает структуру: summary, timeline, impact, contributing factors, action items, lessons learned.
- **L4** — Пишет постмортем-документ по шаблону команды: timeline с timestamp-ами событий и решений, impact (что увидели пользователи / в каких числах / сколько времени), contributing factors с явным «почему», action items с метаданными.
- **L4** — Собирает timeline из разных источников: логи, алерты, графики, Slack-треды, голосовые звонки (transcript / notes); сводит в единый narrative, разделяя «что произошло» и «что решили сделать».
- **L5** — Фасилитирует постмортем-встречу: распределяет роли (writer, facilitator, reviewer); удерживает blameless tone; помогает команде формулировать корректные action items, а не «доброе пожелание».
- **L5** — Формулирует action items с владельцем, дедлайном, priority и критерием готовности; защищает от пустых формулировок типа «улучшить мониторинг» (без указания, что именно, к какому числу, и как мы поймём, что это сделано).
- **L5** — Проводит follow-up через 2–4 недели после публикации постмортема: проверяет статус action items, обновляет документ, отчитывается команде; невыполненные пункты возвращаются в список приоритетов с явным решением.
- **L6+** — Внедряет постмортем-process в организации: шаблоны, платформа, severity-based triage (когда нужен полноценный постмортем, а когда — лёгкий retro), метрики (action item completion rate, time-to-postmortem, postmortem read/share rate).
- **L6+** — Защищает blameless-tone от давления «найти виноватого» сверху; ведёт переговоры с менеджментом / юристами / compliance в спорных случаях; формулирует политику публичности постмортемов внутри компании.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/postmortem-culture/)** (O'Reilly, 2016), глава 15 «Postmortem Culture: Learning from Failure». База: фундамент ритуала и канонический шаблон постмортема.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/postmortem-culture/)** (O'Reilly, 2018), глава 10 «Postmortem Culture: Learning from Failure Continued». База: разбор плохого vs хорошего постмортема на реальном инциденте; продолжение SRE Book гл. 15.

### Статьи и доклады

- John Allspaw — **[Blameless PostMortems and a Just Culture](https://www.etsy.com/codeascraft/blameless-postmortems/)** (Etsy Code as Craft, 2012). База: классическая статья, заложившая словарь и подход.
- **[PagerDuty — Postmortems](https://postmortems.pagerduty.com/)**. База: открытый набор руководств по проведению постмортема (cultural framework, writing, meeting facilitation, checklists). Apache 2.0, переиспользуемое в своей документации.

### Инструменты

- **Шаблоны** — **[Google SRE Example Postmortem](https://sre.google/sre-book/example-postmortem/)** (реальный шаблон Google с инцидентом Shakespeare Sonnet++), **[PagerDuty Postmortem Template](https://postmortems.pagerduty.com/resources/post_mortem_template/)**, **[dastergon/postmortem-templates](https://github.com/dastergon/postmortem-templates)** (агрегированная коллекция).
- **Markdown в repo команды** — самый простой формат: один постмортем = один файл в `postmortems/<YYYY-MM-DD>-<slug>.md`. PR-based review, git как audit trail, поиск по тексту через `grep`.
- **Платформы** — **[incident.io](https://incident.io/)**, **[FireHydrant](https://firehydrant.com/)**. Автоматизация сбора timeline из Slack / алертов / status pages, AI-summarization, retrospective workflow, метрики постмортемов. Полезны, когда команда выходит за десяток постмортемов в месяц.

## Best practices

- **Timeline — на фактах, не на интерпретациях.** Антипаттерн: «X не справился с нагрузкой в 14:23» — это уже интерпретация. Правильно: «в 14:23 сервис вернул 503; ответы на нагрузку с такой-то метрикой» — факт, проверяемый по логам. Интерпретации идут в раздел `contributing factors` с явным «почему мы так думаем».
- **Action items — владелец + дедлайн + priority + критерий готовности.** Антипаттерн: «улучшить мониторинг» без указаний — через полгода никто не помнит, что имелось в виду. Action item без всех четырёх атрибутов — «доброе пожелание»; через два-три невыполненных списка команда теряет доверие к ритуалу. Критерий готовности — отдельный пункт: как мы поймём, что action item закрыт.
- **Постмортем = обучение, не наказание.** Антипаттерн: «найти, кто виноват» — на встрече кто-то приходит с таким настроением, остальные замыкаются, факты прячутся. Если это происходит, фасилитатор обязан остановить встречу или явно вернуть к blameless tone; в противном случае одна встреча разрушает культуру быстрее десяти плохих постмортемов.
- **Постмортем пишется по горячим следам, не через месяц.** Антипаттерн: «дадим команде успокоиться» → через две недели память искажена, Slack-треды сложно восстановить, ключевые участники переключились на другое. Норма: timeline собирается в течение 24–72 часов, постмортем-встреча — в течение недели; для крупных инцидентов — extension с явным дедлайном.
- **Severity-based triage: не каждый инцидент равно глубокий постмортем.** Антипаттерн: «постмортем для всего». Лёгкие инциденты (короткие, без user impact) получают облегчённый retro (заметка в команде, 15-минутная синхронизация); полноценные постмортемы — для значимых инцидентов с явными критериями (длительность, impact, регуляторика). Без triage команда выгорает и спамит документы.
- **Один writer на постмортем, не «коллективно напишем».** Антипаттерн: ответственность размазана на всю команду; через две недели документ пустой. Один человек владеет writeup'ом и его дедлайном; команда вносит правки через PR/comments. Без owner'а постмортем не пишется.

## Связанные листья

- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — норма, на которой держится этот ритуал; читать вместе. Этот лист — *что делаем*, родственный — *почему так*.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — постмортем — after-action для инцидента; качество timeline постмортема прямо зависит от качества коммуникации и фиксации событий в момент инцидента.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — каждый постмортем должен порождать обновление runbook'а (новый или правки существующего); иначе lesson learned не закреплён в операционной памяти.
- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — постмортемы выявляют конкретные источники бюджет-сжигания; ревью бюджета — точка, где их lessons learned превращаются в приоритеты.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса — accountable person за постмортем и его action items; без чёткого ownership постмортем не имеет адресата.

## Открытые вопросы

- **Action Items Tracking** *(TBD)* — отдельный лист про дисциплину выполнения action items (платформа, метрики, owner'ы, эскалация при невыполнении). Сейчас входит в этот лист как best practice; при углублении ветви — возможно выделение.
- **Severity-based triage methodology** — детальная схема классификации инцидентов под уровень постмортема (lightweight retro vs полноценный) — самостоятельная подтема. Сейчас упомянуто как best practice; при накоплении опыта команды — отдельный раздел или лист.
