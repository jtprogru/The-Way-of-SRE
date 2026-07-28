---
title: Postmortem Database
description: Систематический архив постмортемов с поиском и тегированием — про распространение уроков, не про хранение
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Knowledge Management / Postmortem Database
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«У нас есть Confluence-папка с постмортемами» — это не postmortem database, это свалка. Я регулярно вижу команды, в которых архив постмортемов формально существует — Confluence space, Notion database, папка в git — но никто, кроме автора, никогда не открывает оригинал постмортема второй раз. Через год архив становится мусорным: одни и те же contributing factors всплывают в новых инцидентах, потому что прошлые уроки не нашли. Postmortem database — это **систематический архив с поиском, тегированием и регулярным review**, который превращает накопленные постмортемы в actionable knowledge. Граница с [Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/) явная: тот лист — про **норму** разбора (как мы говорим про ошибки); этот — про **систему хранения и извлечения уроков** из того, что норма уже произвела.

Я считаю, что без postmortem database постмортемная практика на 60-70% теряет ценность. Сам разбор полезен в моменте — команда учится, action items закрываются, runbook'и обновляются. Но через 2-3 года, при ротации людей, эти уроки забываются — новый инженер встречает замусоренную базу past incidents и не находит, что нужная информация уже есть. База постмортемов с тегами и поиском — это **временной интерфейс** к опыту команды: уроки доступны не только тем, кто был в incident, но и тем, кто пришёл через два года.

## Что должен уметь

Главный навык на уровне L5 — **проектировать схему тегирования так, чтобы поиск работал**. «Tag по сервису» — недостаточно; через год search «database» вернёт 40 постмортемов, никто не будет читать все. Хорошая схема: service + failure category (data loss / unavailability / degraded / security / config drift) + contributing factor categories (deployment / config / capacity / dependency / human / monitoring gap) + severity. По этим осям ищется «постмортемы про data loss из config drift на сервисе X за последние 2 года» — три PR'ов, не сорок.

**L3**
- Знает, где живёт postmortem database команды; умеет искать прошлые постмортемы по тегам или симптому. Перед написанием нового постмортема проверяет похожие в архиве.
- В каждом новом постмортеме явно ссылается на похожие из архива («это четвёртый раз похожий config drift на сервисе X в этом году») — это превращает single-postmortem в pattern signal.

**L4**
- Тегирует свой постмортем по командной схеме: service, failure category, contributing factors, severity. Не «забыли тег» — без тега postmortem не находится через год.
- Регулярно (например, monthly) reviews recent postmortems команды и фиксирует recurring failure modes; формулирует pattern-level findings, которые шире одного инцидента.

**L5**
- Проектирует схему тегирования для команды или функции: какие оси, какая granularity, как evolve со временем. Без явного дизайна tagging schema становится inconsistent через 6 месяцев.
- Проводит quarterly database review: какие categories доминируют, какие contributing factors повторяются, где systemic patterns. Это **input для priorities** на следующий период (где инвестировать в reliability).
- Использует database как источник сценариев для [Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/): прошлые инциденты — лучший материал для тренировки команды.

**L6+**
- Внедряет cross-team postmortem sharing: систематический обмен постмортемами между командами, чтобы lessons learned распространялись шире одного team boundary.
- Аргументирует **public postmortems** как стандарт для significant incidents: GitLab / Cloudflare / Stripe модель публикации. Ведёт переговоры с legal / PR в спорных случаях.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/postmortem-culture/)** (O'Reilly, 2016), глава 15. Раздел «Sharing Postmortems Openly» — фундамент distribution practice; Google как пример org с многолетней внутренней базой постмортемов. Конкретики о tagging schema мало, но дисциплина distribution описана.
- John Allspaw — **[Each Necessary, But Only Jointly Sufficient](https://www.kitchensoap.com/2012/02/10/each-necessary-but-only-jointly-sufficient/)** (Kitchen Soap, 2012). Не книга про database, но про подход NBJS, который превращает множество постмортемов в data set для извлечения patterns. Cumulative анализ возможен только при NBJS-формулировке contributing factors.

### Статьи и доклады

- **[Cloudflare Outage Reports](https://blog.cloudflare.com/tag/outage/)** — рубрика постмортемов Cloudflare, размеченная тегом в корпоративном блоге. Ровно тот случай, когда публичный архив собран через tagging, а не через отдельный продукт. Полезно как референс глубины анализа.
- **[GitLab: Postmortem of database outage of January 31](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/)** — их самый цитируемый постмортем. Отдельной рубрики «postmortem» в блоге GitLab нет, документы лежат вперемешку с остальными постами — и это само по себе показательно: даже у компании с сильной культурой разбора архив не обязательно организован.
- Dan Luu — **[Post-mortems](https://github.com/danluu/post-mortems)** (GitHub). Community-curated index публичных постмортемов от разных компаний. По моим наблюдениям — самый полезный единичный источник для поиска real-world cases по категориям. Используется как input для game day и для training.

### Инструменты

- **Markdown в git-репозитории с frontmatter** — самый простой и работающий формат. Один постмортем = один файл; frontmatter содержит tags (service, severity, categories, date); поиск через `grep` или GitHub search. По моим наблюдениям, для команды до 30 человек этого достаточно.
- **[Notion](https://www.notion.so/) / [Confluence](https://www.atlassian.com/software/confluence) database** — структурированная база с полями и фильтрами. Имеет смысл, когда команда уже живёт в этих инструментах и не хочет миграции в git. Главная ловушка — слабая дисциплина tagging, потому что rich-text редактор провоцирует freeform writing.
- **[Incident.io](https://incident.io/) / [FireHydrant](https://firehydrant.com/) / [Rootly](https://rootly.com/)** — incident-management платформы с встроенным postmortem-tracker'ом и tagging. По моим наблюдениям, оправданы в org от 50+ инженеров, у которых incident ≥ еженедельно. Преимущество — автоматическая связь postmortem ↔ source incident ↔ action items.
- **Tag schema в git как первый артефакт** — простой markdown-файл `postmortems/tagging.md` с allowed values для каждого поля. Без явной схемы tagging drift'ит через 6 месяцев, и поиск перестаёт работать.

## Best practices

Главный публичный кейс — **публичные постмортемы Cloudflare**. Разборы значимых инцидентов лежат в корпоративном блоге под тегом `outage`, то есть архив собран ровно тем механизмом, который я описываю в этом листе: не отдельный продукт, а последовательная разметка. Читатель приходит по ссылке из чужой статьи, видит рубрику и уходит читать соседние разборы — это и есть работающая database, только публичная. Ценность не в том, что документы идеально написаны, а в том, что **они доступны и используются**: их цитируют, инженеры читают перед похожими миграциями, авторы новых постмортемов смотрят на старые как на модель.

Контрпример из той же лиги — **GitLab**. Их постмортем database outage 31 января 2017 — вероятно, самый цитируемый публичный разбор в индустрии, но отдельной рубрики для постмортемов в блоге у GitLab нет: документы лежат вперемешку с продуктовыми анонсами и находятся только через внешний поиск. Сильная культура разбора и организованный архив — разные вещи, и второе не появляется автоматически из первого.

**Короткие правила:**

- **Database без tagging — это свалка.** Антипаттерн: «postmortems в Confluence папке, поиск по полному тексту». Через год search «database» возвращает 40 страниц, никто не читает. Правильно: явная tagging schema (service, failure category, contributing factor categories, severity), enforced на review.
- **Quarterly review — обязательная часть практики.** Без regular review database — мусорка, в которой ценные уроки утопают. Правильно — раз в квартал команда читает summary recent postmortems, ищет patterns, формулирует pattern-level findings. Это превращает single-postmortem learning в team-level learning.
- **Public-by-default для significant incidents.** Антипаттерн: «постмортем — внутренний документ». Команда учится только на своих инцидентах; индустрия учится только на коротких новостях. Правильно — public по умолчанию для significant incidents (customer-facing > X минут, data loss, security); private — обоснованное исключение, не дефолт. Модель GitLab / Cloudflare / Stripe.

Подробнее:

**Recurring failure modes — главное, что находит quarterly review.** Я регулярно вижу команды, в которых одни и те же contributing factors всплывают в постмортемах раз за разом — config drift на конкретном сервисе, migration без rollback plan, timeout в external dependency без circuit breaker. Каждый отдельный постмортем закрывает action items, но **pattern-level fix** (например, рефакторинг config management для этого сервиса) не делается, потому что никто не смотрит на 6 постмортемов вместе. Postmortem database с tagging — единственный механизм, которым этот pattern становится виден. Без неё команда обречена «удивляться» одной и той же поломке несколько раз в год.

**Постмортем как input для game day.** Я считаю, что лучший источник сценариев [Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/) — это собственные прошлые постмортемы. Реальный сценарий, реальная команда, реальные runbook'и — gap'ы найдены, надо проверить, что они закрыты. Это превращает postmortem database из архивного документа в **активный resource**, и команда чаще к нему возвращается. По моим наблюдениям, команды, которые используют постмортемы для game day, имеют более активные database (читают, тегают, обновляют), чем команды, которые этого не делают.

**Tag schema эволюционирует, но не chaos'ом.** На старте достаточно 3-4 категорий тегов; через год — добавятся новые, увидите паттерны. Эволюция — это нормально, но **chaos** — нет: если каждый инженер придумывает свои тэги, через полгода schema разваливается. Правило: tag schema — отдельный документ в репо, изменения через PR-review. На каждый запрос «добавить новый tag» — обсуждение, нужна ли категория или это синоним существующей. Без этого через год имеете «db-incident», «database-incident», «db-failure», «database-failure» как разные теги.

**Cross-team sharing — следующий шаг после внутренней database.** Команда А научилась — это победа single-team. Команды B и C продолжают наступать на те же грабли — это потеря org-level. Простой механизм cross-team sharing, который я наблюдаю работающим: monthly «postmortem digest» — короткий internal newsletter с TL;DR последних значимых постмортемов всех команд + ссылки. 15 минут чтения в месяц — окупаются одной предотвращённой репликой проблемы в другой команде. Без этого канала каждая команда заново учится тому же.

## Связанные листья

- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — норма разбора (как мы говорим про ошибки); этот лист — система хранения и извлечения уроков из того, что норма уже произвела. Без культуры database заполняется поверхностными «root cause: human error» документами.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — процедура разбора, которая порождает документы для database; качество шаблона определяет качество таггирования.
- **[Action Items Tracking](/The-Way-of-SRE/leaves/practices/action-items-tracking/)** — postmortem без AIs — незаконченный документ; database связывает postmortem ↔ AIs и помогает увидеть, какие action items систематически не закрываются.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — каждый постмортем должен порождать обновление runbook; database — место, где можно найти, какой runbook был открыт в каком инциденте.
- **[Playbooks](/The-Way-of-SRE/leaves/culture/playbooks/)** — playbook updates — частый артефакт постмортема; pattern-level findings в database часто приводят к новым decision points в playbook.
- **[Game Day / Chaos Drills](/The-Way-of-SRE/leaves/culture/game-day/)** — постмортемы из database — главный источник сценариев game day; реальные инциденты лучше любых вымышленных.
- **[Communities of Practice](/The-Way-of-SRE/leaves/culture/communities-of-practice/)** — CoP по reliability — естественное место cross-team sharing постмортемов; monthly digest часто живёт в CoP.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — incident-management платформы автоматически связывают incident ↔ postmortem ↔ database; tooling-side этой практики.

## Открытые вопросы

- **Pattern detection automation** — AI-ассистент, который читает все постмортемы и предлагает patterns (recurring contributing factors, services with repeated issues, action items, которые систематически не закрываются). На начало 2026 года активная область (incident.io AI Postmortem, FireHydrant Signals), но рабочих кейсов в публичной литературе пока мало.
- **Public-by-default policy в B2B SaaS** — Cloudflare/GitLab/Stripe доказали, что public postmortems совместимы с trust и retention. Я не уверен, как корректно применять policy в B2B SaaS с регулированными industries (финтех, healthtech), где customer SLA содержит NDA на incident details. Если есть рабочая модель — расскажите PR'ом.
- **Срок хранения и архивирование** — постмортем 2018 года про сервис, который мы уже отписали — нужен ли? Я не нашёл публичной литературы по этому вопросу. Скорее всего, lifecycle policy (retain forever / archive after X years / delete after retired service) — отдельная подтема, которую каждая команда решает по-своему.
