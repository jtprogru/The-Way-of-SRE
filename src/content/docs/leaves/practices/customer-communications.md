---
title: Customer Communications
description: Внешняя коммуникация во время инцидента — severity, cadence, honest framing
sfia: [3, 4, 5, 6]
status: draft
---

Я регулярно вижу две крайности communication during incident. Одна — молчание: команда тушит, никто наружу не пишет, клиенты читают Twitter и пишут в support. Вторая — overcommunication: каждые 5 минут update «всё ещё расследуем», клиенты устают и отписываются от status page. Между ними — дисциплина: [severity](/The-Way-of-SRE/glossary/#severity) определяет audience, cadence — обещание (а не «когда есть что сказать»), honest framing без alarm. Четвёртый лист под L1 `Incident Management` (рядом с [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/), [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/), [Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)).

## Что должен уметь

Главный навык на уровне L4 — выдерживать **sitrep cadence как обещание**, даже когда «нечего сказать». Клиенты видят молчание как «они растеряны / не работают над проблемой». Update вида «в 14:30 — статус: расследуем; пробовали X (не помогло); сейчас проверяем Y; следующее сообщение в 15:00» — это валидное сообщение, и оно строит trust лучше, чем 20-минутное молчание с последующим «всё починили».

**L3**
- Знает channel/audience матрицу команды — какие incidents идут на public statuspage, какие на internal Slack, какие на email customer success.
- Знает базовые правила тона: honest без alarm; acknowledge impact; what we know; what we don't know; ETA только при ≥80% уверенности.

**L4**
- Ведёт customer comms во время incident в роли Comms Lead — sitrep cadence ≤30 минут при SEV0+ active, обновления статусов `investigating / identified / monitoring / resolved` в правильном lifecycle.
- Координирует с customer success и sales — уведомление key accounts, шаблоны «что говорить клиенту, который звонит», сегментированные уведомления (только affected клиенты).

**L5**
- Проектирует severity → communications matrix для команды — какой SEV → какие channels (statuspage / email / in-app banner / executive notify / regulators); cadence per severity; templates per комбинация, ревьюнутые legal / customer success.
- Вместе с Legal/CISO применяет точные regulatory triggers: по GDPR Article 33 — awareness о personal data breach и risk exception; по SEC Item 1.05 Form 8-K — determination, что cybersecurity incident material для registrant.
- Использует statuspage стратегически — subscriber management, uptime history transparency trade-off, localization для international клиентской базы.

**L6+**
- Проектирует org-level customer comms framework — coordination с регуляторами через legal/CISO, board-level reporting threshold, post-mortem публикация как deliberate trust-building.
- Принимает strategic comms decisions — когда incident `public vs private`, pre-emptive comms до confirmed impact, post-incident «what we learned» публикация как часть бренда.

## Материалы

### Книги

- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы 17–18 (Crisis Management, Recovery and Aftermath). Crisis communications в SRE-контексте, internal vs external messaging, regulatory escalations.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), глава 9, секция Communications. Comms Lead role в incident structure, sitrep cadence, audience separation.
- Kathleen Fearn-Banks — **Crisis Communications: A Casebook Approach** (Routledge, 5-е изд.). Academic crisis communications. Не SRE-specific, но даёт обоснование подходов.

### Статьи и доклады

- **[Atlassian Statuspage Best Practices](https://www.atlassian.com/incident-management/incident-communication)** — guide от создателей Statuspage. Когда обновлять, какой tone, как handle ETA.
- **[GitHub October 21, 2018 Incident Report](https://github.blog/news-insights/company-news/oct21-post-incident-analysis/)**. Главный публичный кейс — см. ниже.
- **[Cloudflare incident reports](https://blog.cloudflare.com/tag/post-mortem/)**. Регулярные public post-mortems от Cloudflare. По моим наблюдениям, один из лучших benchmark'ов «public-ready» post-mortem.
- Honeycomb — **[How We Manage Incident Response](https://www.honeycomb.io/blog/incident-response-at-honeycomb)** (Fred Hebert). Про внутреннюю механику, но с честным разделом о том, кто и когда говорит с клиентами в маленькой команде, где выделенного Comms Lead просто нет.
- Increment — **[Incident Response issue](https://increment.com/on-call/)**. Статьи от Stripe / Slack / Asana о customer comms.
- **[GDPR, Article 33](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A02016R0679-20160504)** — первичный текст: notification supervisory authority без неоправданной задержки и, где это возможно, в течение 72 часов после awareness; также содержит risk exception.
- U.S. SEC — **[Cybersecurity incident disclosure rules](https://www.sec.gov/newsroom/press-releases/2023-139)**. Первичный источник для точной формулировки: Item 1.05 Form 8-K обычно подаётся в течение четырёх рабочих дней после determination, что incident material, а не через четыре дня после обнаружения любого события.

### Инструменты

- **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage)** — наиболее установленный provider; subscriber management, scheduled maintenance, incident lifecycle, custom domains, API для auto-update из monitoring.
- **[Better Stack Status](https://betterstack.com/status-page) / [Instatus](https://instatus.com/) / [Statuspal](https://statuspal.io/)** — альтернативы Statuspage. По моим наблюдениям, чаще выбирают за свежий UX и более низкую цену. Statuspal — European-based, для GDPR-aware клиентской базы.
- **Email / SMS broadcast** — Customer.io, Braze, Mailchimp + transactional SendGrid/Mailgun. Должны быть pre-configured с templates для разных incident scenarios.
- **In-app banners / system notifications** — feature flags + UI компонент для broadcast'а внутри продукта. Подходит, когда клиентская база — authenticated users (B2B SaaS).

## Best practices

Главный публичный кейс — **GitHub October 21, 2018 Incident Report**. Сервис работал с деградацией 24 часа 11 минут: 43-секундный разрыв связи между сетевым узлом на восточном побережье и основным дата-центром запустил автоматический failover MySQL, после чего в кластерах на двух побережьях оказались расходящиеся записи. Вернуться назад без потери данных было нельзя, и GitHub сознательно выбрал долгое восстановление вперёд вместо быстрого. Часть платформы всё это время работала штатно, а часть отдавала устаревшие данные, не доставляла webhooks и не публиковала Pages. Их post-mortem — эталон того, как делать public communication: detailed timeline, конкретные contributing factors (не одна «причина»), список того, что они меняют, и прямое объяснение, почему выбрали медленный путь. Обратите внимание на подачу: нигде не сказано «мы лежали 24 часа», везде описано, что именно не работало — это честнее и одновременно мягче, чем формулировка, которую за них потом придумала пресса. По моим наблюдениям, это один из 3–4 публичных post-mortems, которые в SRE-индустрии цитируют десятки раз — если читаете лист и впервые в теме, сначала туда.

Дальше — три вещи, которые проще решить до инцидента, чем во время. Первая: матрица «severity → аудитория» пишется заранее и целиком. SEV0 — статусная страница, письмо и уведомление руководства в первые пятнадцать минут; SEV1 — статусная страница плюс customer success через полчаса; SEV2 — статусная страница, если клиент это видит; SEV3 — только внутрь. Под давлением инцидента вопрос «писать наружу или нет» решается субъективно, и решают его каждый раз по-разному: то промолчат там, где надо было сказать, то поднимут панику на пустом месте.

Вторая: ритм обновлений — обещание, а не «когда будет что сказать». Молчание клиент читает как растерянность. Sitrep каждые полчаса, пока SEV0 активен, даже с текстом «всё ещё расследуем», сообщает ровно одно: мы работаем и держим вас в курсе. Прерывается этот ритм только статусом `resolved`.

Третья: статусная страница — первый источник правды, и обновляется она раньше почты и соцсетей. Порядок такой: страница, потом рассылка, потом Twitter, потом точечная работа customer success. Твит «мы лежим» при зелёной статусной странице бьёт по доверию сильнее самого инцидента.

**Honest framing без alarm; acknowledge без blame.** Я регулярно вижу `we are investigating an issue`, висящее четыре часа без единой детали. Клиент из такого сообщения не понимает blast radius и не может принять ни одного решения: ни переключиться на запасной вариант, ни предупредить собственных клиентов. Работает другой шаблон. Признать импакт — что именно не работает. Сказать, что известно. Сказать, что пока неизвестно. ETA давать только при уверенности выше 80%, а не в режиме `we will be back in 15 minutes`, если это догадка. Невыполненный ETA бьёт по доверию сильнее честного «не знаем».

**Customer-facing severity ≠ internal severity.** «Internal SEV1 → public banner red» — типичная путаница. Internal severity отражает team mobilization (war room, comm cadence); customer-facing — actual user impact. SEV1 для команды (war room) может быть `degraded performance` для клиента (10% reads slower, no data loss, transparent fallback). Public statuspage state — отдельная классификация (`operational / degraded performance / partial outage / major outage`), mapped from internal severity И customer-facing impact.

**Regulatory comms начинаются с применимости, а не с одного таймера.** GDPR Article 33 привязывает срок к awareness controller о personal data breach и содержит risk exception. SEC Item 1.05 Form 8-K обычно отсчитывает четыре рабочих дня от determination registrant, что cybersecurity incident material. Это разные триггеры для разных субъектов и юрисдикций; pre-staged templates и routing к Legal/CISO должны ссылаться на первичный текст, а не на сокращённую памятку «72 часа / 4 дня».

**Trust building через transparency, не через тишину.** GitHub, Cloudflare, Stripe, Discord публикуют detailed public post-mortems после major incidents — по моим наблюдениям, **это строит trust на годы**. Honest «here's what happened, here's what we learned» = клиенты видят профессионализм. Hidden post-mortems → клиенты догадываются, и слухи хуже фактов. Decision: any incident с customer-facing impact > X получает public post-mortem в течение N дней.

## Связанные листья

- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — severity определяет audience matrix и cadence. Без severity classification audience-decisions делаются субъективно «в моменте».
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — Comms Lead role в incident command structure. В small team Comms — обязанность IC; в big team — выделенный человек.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — post-incident comm = публичный sanitized постмортем; blameless framing translates наружу как professional reflection.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — pre-staged comm templates живут в runbook для типовых сценариев (data breach / regional outage / security event).
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service owner отвечает за customer comms своего сервиса; key accounts знает CSM, кого уведомлять.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — security incidents имеют специфические regulatory comms; threat modeling определяет, какие данные требуют какого уведомления.
- **[Status Page Management](/The-Way-of-SRE/leaves/practices/status-page-management/)** — operational practice самой платформы: subscriber model, uptime transparency policy, scheduled maintenance pre-announce, decoupled infrastructure. Этот лист — про *что говорить*; SPM — про *как устроен канал*.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/)** — communication tree для DR-сценариев (executive → board → regulators → customers → public) — часть DR policy; обычная severity-based audience matrix отсюда расширяется до DR-scope.

## Открытые вопросы

Status Page Management отсюда уже уехал в отдельный лист (см. «Связанные листья»), и вместе с ним — вопрос локализации статусной страницы для международной клиентской базы. Осталось два незакрытых.

Первый — заранее заготовленные шаблоны сообщений *(TBD)*, прошедшие ревью юристов, под типовые сценарии: утечка данных, отказ региона, инцидент безопасности. Пока не решил, подсекция это здесь или самостоятельный лист. Второй — практика публичных постмортемов как осознанная работа с доверием, как это делают Cloudflare, GitHub и Stripe. Она может стать подсекцией в соседнем листе про разбор инцидентов. А может вырасти в отдельный.
