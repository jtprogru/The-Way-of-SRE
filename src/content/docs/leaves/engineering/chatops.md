---
title: ChatOps
description: Операции через чат — уведомления, запросы статуса и команды с встроенным audit trail
sfia: [3, 4, 5, 6]
status: draft
---

Практика родилась в GitHub: в 2011 году они открыли [Hubot](https://hubot.github.com/) — фреймворк на Node.js для ботов, которые жили в Campfire, а позже в Slack, и через текстовые команды деплоили, мониторили, рестартили сервисы. Само слово «ChatOps» закрепилось за подходом чуть позже, когда Джесси Ньюленд из той же компании начал рассказывать про это на конференциях. Идея с тех пор сильно эволюционировала: от «прикольный bot, который отвечает на @hubot deploy» к платформам, построенным вокруг incident management, — [incident.io](https://incident.io/) и [Netflix Dispatch](https://github.com/Netflix/dispatch), где chat стал primary surface для всего жизненного цикла инцидента. Я для своих нужд писал серию ботов для Telegram — [owl_clerk_bot](https://github.com/jtprogru/owl_clerk_bot) (личный секретарь), [py-tg-moder](https://github.com/jtprogru/py-tg-moder) (модерация чата), плюс пара закрытых: аналитика каналов и админские инструменты. Каждый закрывал свой класс toil. Главная ценность ChatOps не в «прикольно тыкать команды в chat», а в трёх вещах: **встроенный audit trail** (всё видно в канале и доступно для поиска), **low-friction access** (zero context switch для команды, которая и так в chat), **shared visibility** (5 человек видят, что 6-й делает действие — встроенный peer review). Этот лист — про когда и как строить ChatOps уровень, и где его границы со специализированными tools.

## Что должен уметь

Главный навык на уровне L5 — **проектирование bot-permission model** под конкретный threat profile. Bot — это identity с правами доступа в production; неосторожный design = новая critical surface. Read-only by default, opt-in destructive actions с явным confirmation, разные bot identities под разные scopes (один super-bot со всеми permissions — анти-паттерн), интеграция с central IAM (см. [Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)). Я регулярно вижу команды, которые делают bot с админскими правами «для удобства», и через год не понимают, кто его действия аудитит.

**L3**
- Понимает три уровня ChatOps: **push** (bot сам шлёт информацию — alerts, CI-статусы, deploys), **pull** (bot отвечает на query — `/status service-x`), **action** (bot выполняет операцию — `/deploy v2.3.4`, `/incident declare SEV1`).
- Использует существующие интеграции ChatOps своей команды (incident.io / PagerDuty Slack / Dispatch); знает базовые команды для declare-incident / page-on-call / start-war-room.

**L4**
- Пишет простые bots для уведомлений — CI-status, deploy completion, alert-routing. Уровень: composite GitHub Action ([notiflow](https://github.com/jtprogru/notiflow)) или standalone bot ([owl_clerk_bot](https://github.com/jtprogru/owl_clerk_bot)).
- Внедряет запросы к bot — статус сервиса, последний deploy, on-call дежурный. Bot как UX-обёртка над существующими API; добавленная ценность — accessibility, не функция.

**L5**
- Проектирует команды действия через bot грамотно — explicit confirmation для destructive operations, dry-run по умолчанию, automatic post в audit channel.
- Интегрирует bot identity с центральной IAM — bot не должен иметь permissions, которых нет у requester'а; используется делегирование (bot выполняет action *от имени* пользователя, проверяет права пользователя против central IAM).
- Различает chat-as-incident-channel и chat-as-control-plane — в incident важна communication и audit, в control-plane важна safety и authorization. Один канал для обоих — путь к путанице.

**L6+**
- Дизайнит ChatOps strategy на уровне org: build vs buy для incident-platform, bot ownership model (платформенная team vs federated), integration с existing toolchain.
- Принимает trade-off решения — ChatOps depth vs maintaining custom bot framework; миграция между платформами чата (Slack ↔ Teams ↔ Mattermost) и lock-in implications.

## Материалы

### Книги и статьи

- Jason Hand — **[ChatOps: Managing Operations in Group Chat](https://victorops.com/wp-content/uploads/2017/06/ChatOps-Managing-Operations-in-Group-Chat.pdf)** (O'Reilly, 2016, free). Самая полная публикация по теме — определения, levels, anti-patterns. Старая, но фундаментальные принципы не устарели.
- **[GitHub Engineering Blog — ChatOps at GitHub](https://github.blog/engineering/move-fast/deploying-branches-to-github-com/)**. Серия постов о ChatOps в самом GitHub — родина термина, deploy через `.deploy` в PR comment.
- **[Charity Majors — Ask Miss O11y: I Don't Want to Be On Call Anymore. Am I a Monster?](https://www.honeycomb.io/blog/devops-on-call)** (Honeycomb). Про то, каким дежурство должно быть, чтобы люди не выгорали, — и почему инструменты вокруг чата тут решают меньше, чем принятые в команде нормы.

### Стандарты и платформы

- **[Slack Bolt Framework](https://tools.slack.dev/bolt-js/)** (official, JS / Python / Java). Modern standard для Slack bots — официальная SDK, replacing legacy Hubot для Slack-only.
- **[Telegram Bot API](https://core.telegram.org/bots/api)** (Telegram official). Бесплатная и простая alternative для команд вне корпоративного Slack. Inline keyboards, callback queries, group permissions — достаточно для большинства SRE use cases.
- **[Mattermost Bots Documentation](https://developers.mattermost.com/integrate/)**. Для команд с self-hosted chat (compliance, air-gapped environments).

### Инструменты

- **Push (notifications):**
  - [notiflow](https://github.com/jtprogru/notiflow) — мой composite GitHub Action для уведомлений в Telegram по workflow job complete; status templates, retry on 429.
  - [Slack incoming webhooks](https://api.slack.com/messaging/webhooks), [Telegram bot sendMessage](https://core.telegram.org/bots/api#sendmessage) — низший уровень: HTTP POST из CI / monitoring tool.
  - [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) Slack/Telegram receivers — alerts → chat без custom code.
- **Pull / Action bots (frameworks):**
  - [Slack Bolt](https://tools.slack.dev/bolt-js/) — modern Slack-first framework.
  - [Errbot](https://errbot.readthedocs.io/) — Python framework с plugin architecture; multi-platform (Slack / Telegram / IRC / XMPP). По моим наблюдениям, выбирают для self-hosted ситуаций или multi-platform.
  - [Hubot](https://hubot.github.com/) — исторический GitHub framework на CoffeeScript / JS. Сейчас legacy, но всё ещё работает; не рекомендовал бы для новых проектов.
  - [Lita](https://www.lita.io/) — Ruby framework, аналог Hubot.
- **Incident-first ChatOps platforms:**
  - [incident.io](https://incident.io/) — Slack-native, commercial. Declare-incident / war-room / sitrep / postmortem-workflow — всё через slash-commands. По моим наблюдениям, доминирует в сегменте стартапов.
  - [FireHydrant](https://firehydrant.com/), [Rootly](https://rootly.com/) — конкуренты incident.io, разный feature mix. Blameless из этого ряда исчез: FireHydrant купила его в 2024.
  - [Netflix Dispatch](https://github.com/Netflix/dispatch) — open-source, self-hosted; полный incident-lifecycle orchestrator с интеграцией в Slack.
  - [PagerDuty Process Automation](https://www.pagerduty.com/platform/automation/) (ex-Rundeck) — enterprise-grade chat-triggered runbook automation.
- **Specialized Telegram bots (мои примеры):**
  - [owl_clerk_bot](https://github.com/jtprogru/owl_clerk_bot) — личный секретарь (заметки, напоминания).
  - [py-tg-moder](https://github.com/jtprogru/py-tg-moder) — модерация чата в Telegram (anti-spam, captcha, ban-management).
  - Аналитика каналов с модерацией и админские инструменты для Telegram — эти два бота лежат в закрытых репозиториях, поэтому здесь без ссылок.
- **CI/CD integrations:** GitHub Actions с notifications (включая [notiflow](https://github.com/jtprogru/notiflow)), GitLab CI Slack-integration, Argo Workflows + Slack/Telegram steps.

## Best practices

Главный публичный кейс — **[GitHub deploy-bot](https://github.blog/engineering/move-fast/deploying-branches-to-github-com/)** (2012–наст. время). GitHub деплоит сам github.com через ChatOps уже больше десятилетия: в PR comment пишется `.deploy` → bot Hubot читает команду → запускает deploy pipeline → постит обратно в PR статус. Что сработало: **audit trail встроен** (вся история deploys видна в канале Slack и ищется поиском), **shared visibility** (тот, кто деплоит, не один — все смотрят), **peer-review встроен** (можно оспорить deploy в том же тред'е). Что я понял из commentary GitHub'а — главный challenge не technical, а **operational maturity**: ChatOps требует команду, которая умеет договариваться о deploys в chat, не таскать каждое действие через jira-ticket. Если organisational maturity ниже — ChatOps превращается в bypass для proper review, и это становится проблемой.

Три правила, которые я считаю обязательными, если bot вообще получает права что-то делать.

Read-only по умолчанию. На `/status` и `/who-on-call` bot отвечает без всякой проверки, а вот `/scale`, `/deploy` и `/incident-close` идут через двухшаговый flow с подтверждением, фиксацией того, кто именно попросил, и записью в audit channel. По моим наблюдениям, главный security failure в ChatOps выглядит так: утёк bot token — и у атакующего ровно те же права, что у самого привилегированного человека в команде.

Дальше — identity. Один super-bot со всеми permissions означает, что компрометация одного токена отдаёт всё разом. Лучше несколько ботов под разные задачи (deploy, запросы, инциденты), каждый со своим минимальным IAM scope, и identity, привязанная к команде или системе, а не к «всему подряд». Bots — тоже workloads, см. [Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/).

И третье: audit channel отдельно от рабочего. Все действия бота, особенно разрушительные, дублируются в read-only канал. Это и артефакт для SOC 2 или ISO 27001, и то самое место, где на инциденте видно, какое действие запустило каскад.

**Push → Pull → Action — естественная эволюция, не «сразу полный ChatOps».** Начинать стоит с уведомлений ([notiflow](https://github.com/jtprogru/notiflow) для CI, Alertmanager Slack для алертов): удобство прирастает, риска почти нет. Запросы статуса добавляются вторым этапом — bot отвечает на `/status`, `/oncall`, `/last-deploy` поверх read-only API. Команды-действия идут последними, потому что им нужна зрелая permission model, работающий audit и понятная эскалация для подтверждений. Прыжок через этапы почти всегда кончается либо дырой в безопасности, либо ботом, который «вроде работает, но никто им не пользуется».

**Build vs buy для incident-platform.** Если incident-management — основной use case ChatOps, в 2025 я не вижу убедительной причины писать свой incident-bot — incident.io / FireHydrant / Rootly / Dispatch (open-source) покрывают 95% потребностей. Build своего incident-bot оправдан в трёх ситуациях: (1) air-gapped / regulated environment без external SaaS; (2) интеграция с proprietary incident-system, которой нет в готовых platforms; (3) tiny team где OSS Dispatch overkill, а commercial вне budget. Иначе — buy / adopt, focus на operational integration, не на bot framework.

**Какой фреймворк брать.** Slack Bolt — если вы живёте в Slack и никуда оттуда не собираетесь. Errbot на Python — когда платформ несколько или нужен self-hosted. Для мелких ботов фреймворк не нужен вовсе: мои [py-tg-moder](https://github.com/jtprogru/py-tg-moder) и [owl_clerk_bot](https://github.com/jtprogru/owl_clerk_bot) написаны на голом python-telegram-bot, и этого хватает. Hubot и Lita — прошлое, для нового проекта я бы их не брал: развитие замедлилось, экосистема съехала на Bolt. По моим наблюдениям, Bolt со Slack доминирует в командах от полусотни человек, а Errbot и Telegram остаются там, где считают деньги.

**Привязка к платформе — риск на годы.** Боты на Slack Bolt срастаются с интерфейсом Slack: команды через слэш, модальные окна, всё это при переезде на Teams или Mattermost переписывается целиком. Если смена мессенджера вообще возможна — поглощение, требования регулятора, цена, — берите мультиплатформенный фреймворк вроде Errbot или прячьте слой интерфейса за собственной абстракцией. По моим наблюдениям, за три-пять лет привязка к Slack редко становится по-настоящему больно. Исключение — B2G и финансы, где смену может потребовать комплаенс.

## Связанные листья

- **[Toil Automation](/The-Way-of-SRE/leaves/engineering/toil-automation/)** — parent: ChatOps — chat-driven форма automation; естественное продолжение notification automation в сторону bot-driven actions.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — tracking показывает, какие повторяющиеся операционные задачи переносить в ChatOps; chat-uplift highest-frequency requests.
- **[Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/)** — personal scripts эволюционируют в team bots, когда повторяющаяся задача переходит из «моя» в «команды».
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — современные incident-tools (incident.io, Dispatch) — Slack-native ChatOps; declare/coordinate инцидент через chat.
- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — declare-incident через `/incident sev1 <description>` — каноническая ChatOps команда.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — `/oncall` query, escalation через bot — standard ChatOps use cases.
- **[War Room Patterns](/The-Way-of-SRE/leaves/practices/war-room-patterns/)** — chat как war room canvas; ChatOps bots координируют sitrep cadence / role rotation / scribe.
- **[Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)** — bot identity и permission model — критичная часть ChatOps security.
- **[Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/)** — bot — это workload; identity-based auth для bot предпочтительнее long-lived shared tokens.

## Открытые вопросы

**AI-augmented ChatOps** — боты на LLM, которые суммируют alerts, предлагают шаги из runbook и генерируют черновики постмортемов из треда. Технология свежая, практики ещё формируются. Скорее всего, через пару лет это будет отдельный лист.

Две темы поменьше. **Voice-first ChatOps** — присутствие бота как scribe и координатора в голосовой war room (Zoom, Meet); пока это экзотика, но направление рабочее. **ChatOps в compliance-heavy environments** — финансы, healthcare, B2G, где действия из чата упираются в требования регулятора вроде формального approval workflow и неизменяемого аудита; публичных практик по этому я почти не нахожу.

Я не разбирался глубоко с **ChatOps governance** — как организовать ownership множества bots на уровне org (кто отвечает за чей bot, как deprecate orphan bot, как audit'ить bot permissions cross-team). Если у вас в org есть formal bot inventory + governance — был бы интересен опыт PR'ом.
