---
title: Status Page Management
description: "Публичная страница статуса как операционная практика: подписки, честный uptime, анонс работ, отдельная инфраструктура"
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / Customer Communications / Status Page Management
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Я регулярно вижу в командах путаницу между двумя разными артефактами: **internal dashboard** (Grafana / Datadog с метриками сервиса для команды) и **public status page** (что клиент видит на `status.<company>.com`). Первый — для on-call, в нём всё про RED-метрики, log volumes, цвета по threshold, нюансы каждого component. Второй — для клиента, и у него совершенно другая роль: дать обещание, что вы честно сообщите об outage; зафиксировать когда был incident; рассказать в ретроспективе что произошло. Команды, которые путают эти два артефакта, либо строят status page для клиентов с инженерным жаргоном («503 spike on api-gw, p99 latency degraded»), либо превращают internal dashboard в публичный и пугают всех. Это уточнение [Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/) под L1 `Incident Management`, и граница с родительским листом чёткая: CC — про *что говорить во время инцидента* (severity → audience matrix, cadence обещание, honest framing); этот лист — про *operational practice самой платформы* (subscriber model, uptime transparency policy, scheduled maintenance pre-announce, decoupled infrastructure, integration с monitoring).

## Что должен уметь

Главный навык на уровне L5 — **проектирование component model status page**. «Всё работает» / «всё лежит» — самая частая ошибка дизайна: один component врёт, public status показывает зелёный, клиенты пишут в support «у вас же зелёное, но не работает». Слишком много components — другая крайность: клиент видит 47 строк, не понимает, какие из них влияют на его use case. Component model производна от architecture (top-level user-facing capabilities, не от internal services) и от severity matrix (mapping internal severity на public component status — `operational / degraded performance / partial outage / major outage`).

**L3**
- Знает, где у команды status page, как клиент её видит; различает public status page и internal monitoring dashboard.
- Умеет обновлять status page как on-call — declare incident, post update с правильным template, mark as resolved.
- Понимает разницу между component status (operational / degraded / outage) и incident status (investigating / identified / monitoring / resolved); знает 5-stage incident lifecycle Atlassian Statuspage / Better Stack.

**L4**
- Настраивает auto-update integration между monitoring (Datadog / Grafana / Prometheus) и status page — критический алерт → автоматическое создание incident в `investigating` state с manual override.
- Управляет subscriber model — email / SMS / RSS / webhook / Slack notifications; знает разницу subscribed-to-component vs subscribed-to-all и UX implications.
- Pre-announces scheduled maintenance минимум за 7 дней для major changes, за 24 часа для minor — с конкретным time window и expected impact.

**L5**
- Проектирует component model — top-level user-facing capabilities (не internal services), severity → component status mapping, granularity trade-off (слишком мало — обман, слишком много — шум).
- Определяет uptime calculation policy — что считается downtime (partial outage = X%? degraded = Y%?), какое окно (rolling 30/60/90 days), кто authorizes recalculation. По моим наблюдениям, это самое политически чувствительное решение в status page management.
- Хостит status page на decoupled infrastructure — отдельный cloud / отдельный provider / CDN-cached static; status page должна жить, когда prod лежит.
- Координирует internal incident lifecycle с public status — статус на public странице обновляется *раньше* Twitter и email; cadence promise per severity явно прописан.

**L6+**
- Дизайнит strategy на уровне org — multi-product portfolio (один общий status или per-product), localization для international клиентов, transparency policy (публичные RCA после major incidents — стиль GitHub / Cloudflare / Stripe vs minimal updates стиль AWS).
- Принимает strategic решения — buy SaaS provider (Atlassian / Better Stack) vs build (OSS Cachet / Gatus + custom UI), regulatory disclosure через status page (financial services, healthcare — где status page становится regulatory artifact).

## Материалы

### Книги и публикации

- **[Atlassian Incident Management Handbook](https://www.atlassian.com/incident-management/handbook)**. Atlassian публикует свой playbook включая status page management discipline. Не academic, но самый практичный публичный guide.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), глава 17 (Crisis Management) — публичная transparency как часть crisis response.

### Статьи и публичные case studies

- **[Atlassian — Incident communication best practices](https://www.atlassian.com/incident-management/incident-communication)** и их [шаблоны сообщений](https://www.atlassian.com/incident-management/incident-communication/templates). Про lifecycle (investigating / identified / monitoring / resolved), tone, частоту обновлений. Написано создателями Statuspage, так что местами это ещё и продуктовый маркетинг — но структура сообщений оттуда рабочая.
- **[GitHub — Bringing more transparency to GitHub's status page](https://github.blog/news-insights/company-news/bringing-more-transparency-to-githubs-status-page/)** + публичный [githubstatus.com](https://www.githubstatus.com/) и [история инцидентов](https://www.githubstatus.com/history). Один из reference examples в индустрии — и редкий случай, когда компания публично объясняет, почему поменяла модель компонентов.
- **[Cloudflare Status](https://www.cloudflarestatus.com/)** + [Cloudflare incident reports](https://blog.cloudflare.com/tag/post-mortem/). Образец transparency-as-brand-strategy — детальные RCA с timeline и technical details становятся отдельным trust-building artifact.
- **[Stripe Status](https://status.stripe.com/)**. Образец component granularity: список API endpoints, dashboard, webhooks, и т.д. отдельно — клиент видит ровно те компоненты, которые влияют на его integration.
- **[Discord Status](https://discordstatus.com/history)** и разборы крупных отказов в их блоге. Один из современных примеров transparency после major outages — детальные technical RCA в blog format, ссылка из status page. Отдельной рубрики под постмортемы у них нет, разборы выходят как обычные посты.

### Антипаттерны и industry critique

- **Критика AWS Health Dashboard** — серия публичных incidents (US-EAST-1 outages 2017, 2020, 2021, 2023), где AWS обновлял public status через десятки минут после того, как клиенты уже репортили downtime. Industry-wide negative example — «status page как marketing tool вместо source of truth». Учат, как НЕ надо. Разборы каждого из этих случаев легко находятся в блогах ThousandEyes и в обсуждениях на Hacker News по дате инцидента.

### Инструменты

- **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage)** — доминирующий enterprise provider; subscriber management (email/SMS/Slack/webhook/RSS), scheduled maintenance, incident lifecycle, custom domains, API для auto-update из monitoring. По моим наблюдениям, чаще всего выбирают для B2B SaaS до 1000 клиентов.
- **[Better Stack Status](https://betterstack.com/status-page)** (бывший Better Uptime) — modern alternative, plus интегрирован с их uptime monitoring; дешевле Atlassian на entry-tier. Часто выбирают startup'ы.
- **[Instatus](https://instatus.com/)** — emphasis на UI/UX, есть виджеты для встраивания; быстрая настройка.
- **[Statuspal](https://statuspal.io/)** — EU-hosted, GDPR-friendly compliance — релевантно для EU-based companies.
- **[Status.io](https://status.io/)** — long-time player; advanced subscriber management.
- **[StatusGator](https://statusgator.com/)** — meta-aggregator: показывает статус ваших vendor'ов (AWS / Stripe / GitHub / Twilio) в одном dashboard. Полезен для команд с большим vendor footprint.
- **[incident.io Status](https://incident.io/status-pages)** — встроенный statuspage в incident.io; auto-update из incident workflow без отдельной integration. Привлекательно для команд уже на incident.io.
- **[FireHydrant](https://firehydrant.com/)** — status page встроен в платформу, отдельно не продаётся; логика та же, что у incident.io.
- **OSS / self-hosted:**
  - **[Cachet](https://cachethq.io/)** — Laravel-based, OG open-source statuspage. Старый, но live; используется в командах с PHP-stack или compliance constraints.
  - **[Gatus](https://github.com/TwiN/gatus)** — Go-based, modern OSS; YAML-конфигурация, built-in synthetic monitoring. По моим наблюдениям, чаще выбирают для команд, готовых к self-hosting.
  - **[Uptime Kuma](https://github.com/louislam/uptime-kuma)** — самая популярная OSS статуспейдж сейчас (под 90 тысяч звёзд на GitHub, с большим отрывом от остальных); self-hosted, modern UI, multiple notification integrations.
- **Minimal viable communication** — для personal проектов или MVP-stage, где dedicated statuspage overkill: RSS-feed от blog'а, канал в Telegram ([jtprogru_channel](https://t.me/+LFsXS2FuZiwwMzky) — как использую сам), отдельная категория для инцидентов в Discourse / GitHub Discussions. Не industry-grade, но работает на масштабе до сотен клиентов.

## Best practices

Конкретный antipattern — **AWS Health Dashboard** на серии US-EAST-1 outages. Несколько раз за последнее десятилетие клиенты первыми узнавали о downtime через Reddit / Twitter / собственные monitors, тогда как AWS public status page показывал зелёный ещё 30-60 минут после начала incident. Industry-wide восприятие: «AWS статус — marketing artifact, real signal — Twitter». Это типичный сбой priorities — на полпути между «marketing wants no red on the page» и «engineering wants accurate signal», marketing выигрывает, доверие клиентов разрушается. Reference в обратную сторону — **GitHub / Cloudflare / Stripe**: они обновляют status быстро (10-15 минут после detection), включая `investigating` state до того, как точно знают причину. Доверие клиентов к их status page высокое, потому что зелёное там действительно зелёное.

Три вещи, которые я проверяю первыми, когда открываю чужую status page. Живёт ли она отдельно от prod. Обновляется ли раньше, чем соцсети. И собрана ли из того, что видит клиент, а не из внутренних сервисов.

Порядок публикации задаётся один раз и не обсуждается в моменте: status page → email по подписчикам → соцсети → customer success. Твит «у нас что-то сломалось» при зелёной странице статуса рассогласует картину и разрушает доверие сильнее, чем сам инцидент. Это та же мысль, что в [Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/) сформулирована как «Statuspage — first source of truth для клиентов».

Компоненты собираются от того, что клиент умеет назвать. Он не знает ваш `api-gw` или `user-svc` и знать не обязан. Он знает «API», «Dashboard», «Webhooks», «Billing» — вот из этого и складывается список, а mapping внутренних сервисов на публичные компоненты остаётся отдельной декларацией, которую можно переопределить.

**Decoupled infrastructure — это не nice-to-have, это hard requirement.** Я регулярно вижу команды, которые ставят self-hosted Cachet на ту же Kubernetes cluster что и main app — «дешевле, удобно, GitOps deployment». В первый же major outage (cluster API down / network outage / cloud zone outage) status page оказывается в тёмной зоне вместе с main app, и клиенты не имеют способа узнать, что вообще происходит. Если выбираете self-hosted, **минимум** — другой cloud provider или CDN-cached static fallback (CloudFront / Cloudflare Pages с pre-rendered HTML, обновляется через external webhook). По моим наблюдениям, командам с serious uptime SLA дешевле взять SaaS-provider Atlassian / Better Stack — они уже решили эту проблему за вас.

**Honest uptime calculation policy — самое политически чувствительное решение.** Что считать downtime? Только `major outage` (≥50% trafic)? Или включать `partial outage` (10% endpoints down)? Окно: rolling 30 / 60 / 90 / 365 дней? Считать ли scheduled maintenance в downtime (большинство — нет, но это compromise)? Кто authorizes recalculation, если вы пропустили обновление status? Я регулярно вижу две крайности: команды, которые считают честно и показывают uptime 99.5% (это нормально, клиенты уважают), и команды, которые «creative accounting» уворачиваются от понижения 99.9% (как только это всплывает в public — trust падает ниже стартовой точки). Хорошая политика — публичная (страница «How we calculate uptime») и применяется автоматически, не «решает marketing team раз в квартал».

**Scheduled maintenance — pre-announce минимум за 7 дней для major.** Major scheduled change (database migration, breaking API change, region migration) — minimum 7 дней с конкретным time window и expected impact. Minor (rolling restart, config update без user impact) — 24 часа. Pre-announce + email + status page entry — standard. Команды, которые «делают maintenance без announce, потому что short», теряют клиентов, у которых критичный workflow попал в этот window. Особенно для B2B SaaS, где integration клиента build assumptions on top of expected availability.

**Severity → component status mapping должен быть формальным, не «по ощущениям».** Internal SEV1 (war room, comm cadence 30 мин) маппится на какой component status — `degraded performance` или `partial outage`? Это решение должно быть в severity matrix явно, не «IC решает в моменте». По моим наблюдениям, без явного mapping разные incidents с одной и той же internal severity получают разный public status — это сбивает клиентов и снижает доверие к статус page как сигналу. Mapping table + auto-update integration с monitoring → consistency.

**Подписка работает на push, не на pull.** Клиент не будет открывать status page каждые 15 минут, чтобы узнать, что происходит, — и правильно сделает. Email для всех, SMS для критичного, RSS и webhook для технических клиентов, Slack через приложение Atlassian Statuspage. По моим наблюдениям, там где подписчиков много, во время инцидента заметно меньше обращений в поддержку: клиент уже знает, что вы знаете.

## Связанные листья

- **[Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/)** — parent: active incident-driven comms (severity → audience matrix, cadence, honest framing). Status page — primary surface для CC, но scope шире (subscriber model, uptime policy, scheduled maintenance).
- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — internal severity → public component status mapping (formal, не «по ощущениям»); cadence обновлений per severity.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — IC отвечает за обновление status page в moment инцидента; status page update — часть incident response checklist.
- **[War Room Patterns](/The-Way-of-SRE/leaves/practices/war-room-patterns/)** — Comms Lead в war room — главный owner status page updates; cadence обновлений координируется с sitrep cadence.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — публичный RCA после major incident — отдельная практика открытости (стиль GitHub / Cloudflare / Stripe); связан с status page через final incident update со ссылкой на post-mortem.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — monitoring data → status page auto-update integration; SLO breach как trigger для automatic incident creation.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каждый component на status page имеет owner — team или инженер, ответственный за уточнение state.
- **[Compliance Frameworks](/The-Way-of-SRE/leaves/practices/compliance-frameworks/)** — для regulated industries (financial / healthcare) status page становится regulatory artifact с явными disclosure requirements.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — `/statuspage create-incident <component> <severity>` как ChatOps команда; современные incident-platforms (incident.io / FireHydrant) автоматизируют status page updates через chat-workflow.

## Открытые вопросы

**Public RCA practice** *(TBD)* — детальные публикации разборов после крупных инцидентов (стиль GitHub October 2018 incident report, Cloudflare regex outage 2019, Discord post-mortems). Сейчас эта тема цепляется к status page только через финальный update со ссылкой. Возможно, из неё вырастет отдельный лист — сосед к Blameless Postmortem (внутренняя дисциплина) и к этому листу (внешняя поверхность).

Локализация страницы статуса — многоязычный UI, локализованные подписки по email, часовой пояс в обещаниях по частоте обновлений; для international SaaS это заметный вопрос, а поддержка со стороны инструментов неровная — у Atlassian Statuspage возможностей меньше, у Better Stack больше. Своего опыта здесь у меня нет.

Отдельный вопрос — один общий statuspage на весь портфель продуктов или по странице на продукт. Atlassian держит общий статус Jira / Confluence / Bitbucket, Stripe — отдельные страницы для Stripe / Atlas / Issuing, и компромисс тут между удобством подписки и шумом для клиента, который пользуется одним продуктом из десяти.

- **AI-generated incident updates** — emerging direction (incident.io, FireHydrant экспериментируют): LLM формирует draft update для IC approval. Полезно для cadence во время long-running incident, но риск неверной подачи — каждый update проходит через IC.

Я не уверен в оптимальном раскрытии SLA по доступности: публиковать конкретное число (99.9%, 99.95%) или не брать публичных обязательств вовсе. Sales обычно хочет число в контракте, engineering боится юридических последствий. Публичный SLA с явной компенсационной политикой — стандарт для B2B SaaS, но границы ответственности в публичных best practices размыты.
