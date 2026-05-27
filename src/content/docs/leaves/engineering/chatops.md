---
title: ChatOps
description: Operations через chat-интерфейс — push-нотификации, pull-запросы статуса, action-команды с встроенным audit trail
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Toil Reduction / ChatOps
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Nice to have
- **Статус:** draft
:::

ChatOps как термин ввёл GitHub около 2011, выпустив [Hubot](https://hubot.github.com/) — Node.js-фреймворк для bots, которые жили в Campfire / Slack и через текстовые команды деплоили, мониторили, рестартили сервисы. Идея с тех пор сильно эволюционировала: от «прикольный bot, который отвечает на @hubot deploy» к incident-management-первым платформам типа [incident.io](https://incident.io/) и [Netflix Dispatch](https://github.com/Netflix/dispatch), где chat — это primary surface для всего инцидент-lifecycle. Я для своих нужд писал серию Telegram-ботов — [owl_clerk_bot](https://github.com/jtprogru/owl_clerk_bot) (bot-секретарь), [py-tg-moder](https://github.com/jtprogru/py-tg-moder) (модерация чата), [chat-analytics-bot](https://github.com/jtprogru/chat-analytics-bot) (аналитика каналов + модерация), [tg-adminer](https://github.com/jtprogru/tg-adminer) — каждый закрывал свой класс toil. Главная ценность ChatOps не в «прикольно тыкать команды в chat», а в трёх вещах: **встроенный audit trail** (всё видно в канале и searchable), **low-friction access** (zero context switch для команды, которая и так в chat), **shared visibility** (5 человек видят, что 6-й делает действие — встроенный peer review). Этот лист — про когда и как строить ChatOps уровень, и где его границы со специализированными tools.

## Что должен уметь

Главный навык на уровне L5 — **проектирование bot-permission model** под конкретный threat profile. Bot — это identity с правами доступа в production-системы; неосторожный design = новая critical surface. Read-only by default, opt-in destructive actions с явным confirmation, разные bot identities под разные scopes (один super-bot со всеми permissions — анти-паттерн), интеграция с central IAM (см. [Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)). Я регулярно вижу команды, которые делают bot с admin-доступом «для удобства», и через год не понимают, кто его действия аудитит.

- **L3** — Понимает три уровня ChatOps: **push** (bot сам шлёт информацию — alerts, CI-статусы, deploys), **pull** (bot отвечает на query — `/status service-x`), **action** (bot выполняет операцию — `/deploy v2.3.4`, `/incident declare SEV1`).
- **L3** — Использует существующие ChatOps-интеграции своей команды (incident.io / PagerDuty Slack / Dispatch); знает базовые команды для declare-incident / page-on-call / start-war-room.
- **L4** — Пишет простые bots для push-уведомлений — CI-status, deploy completion, alert-routing. Уровень: composite GitHub Action ([notiflow](https://github.com/jtprogru/notiflow)) или standalone bot ([owl_clerk_bot](https://github.com/jtprogru/owl_clerk_bot)).
- **L4** — Внедряет pull-queries через bot — статус сервиса, последний deploy, on-call дежурный. Bot как UX-обёртка над существующими API; добавленная ценность — accessibility, не функция.
- **L5** — Проектирует action-команды через bot грамотно — explicit confirmation для destructive operations, dry-run по умолчанию, automatic post в audit channel.
- **L5** — Интегрирует bot identity с центральной IAM — bot не должен иметь permissions, которых нет у requester'а; используется делегирование (bot выполняет action *от имени* user, проверяет user permissions против central IAM).
- **L5** — Различает chat-as-incident-channel и chat-as-control-plane — в incident важна communication и audit, в control-plane важна safety и authorization. Один канал для обоих — recipe for confusion.
- **L6+** — Дизайнит ChatOps strategy на уровне org: build vs buy для incident-platform, bot ownership model (платформенная team vs federated), integration с existing toolchain.
- **L6+** — Принимает trade-off решения — ChatOps depth vs maintaining custom bot framework; миграция между chat-платформами (Slack ↔ Teams ↔ Mattermost) и lock-in implications.

## Материалы

### Книги и статьи

- Jason Hand — **[ChatOps: Managing Operations in Group Chat](https://victorops.com/wp-content/uploads/2017/06/ChatOps-Managing-Operations-in-Group-Chat.pdf)** (O'Reilly, 2016, free). Самая полная публикация по теме — определения, levels, anti-patterns. Старая, но фундаментальные принципы не устарели.
- **[GitHub Engineering Blog — ChatOps at GitHub](https://github.blog/engineering/move-fast/deploying-branches-to-github-com/)**. Серия постов о ChatOps в самом GitHub — родина термина, deploy через `.deploy` в PR comment.
- **[Charity Majors — How to Cope with the Pager](https://www.honeycomb.io/blog/how-to-cope-with-the-pager-on-call-anti-patterns)** (Honeycomb). О роли chat в incident response — фокус на observability и context-sharing.

### Стандарты и платформы

- **[Slack Bolt Framework](https://slack.dev/bolt-js/concepts)** (official, JS / Python / Java). Modern standard для Slack bots — официальная SDK, replacing legacy Hubot для Slack-only.
- **[Telegram Bot API](https://core.telegram.org/bots/api)** (Telegram official). Бесплатная и простая alternative для команд вне корпоративного Slack. Inline keyboards, callback queries, group permissions — достаточно для большинства SRE use cases.
- **[Mattermost Bots Documentation](https://developers.mattermost.com/integrate/plugins/components/bots/)**. Для команд с self-hosted chat (compliance, air-gapped environments).

### Инструменты

- **Push (notifications):**
  - [notiflow](https://github.com/jtprogru/notiflow) — мой composite GitHub Action для Telegram-нотификаций по workflow job complete; status templates, retry on 429.
  - [Slack incoming webhooks](https://api.slack.com/messaging/webhooks), [Telegram bot sendMessage](https://core.telegram.org/bots/api#sendmessage) — низший уровень: HTTP POST из CI / monitoring tool.
  - [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) Slack/Telegram receivers — alerts → chat без custom code.
- **Pull / Action bots (frameworks):**
  - [Slack Bolt](https://slack.dev/bolt-js/concepts) — modern Slack-first framework.
  - [Errbot](https://errbot.readthedocs.io/) — Python framework с plugin architecture; multi-platform (Slack / Telegram / IRC / XMPP). По моим наблюдениям, выбирают для self-hosted ситуаций или multi-platform.
  - [Hubot](https://hubot.github.com/) — исторический GitHub framework на CoffeeScript / JS. Сейчас legacy, но всё ещё работает; не рекомендовал бы для новых проектов.
  - [Lita](https://www.lita.io/) — Ruby framework, аналог Hubot.
- **Incident-first ChatOps platforms:**
  - [incident.io](https://incident.io/) — Slack-native, commercial. Declare-incident / war-room / sitrep / postmortem-workflow — всё через slash-commands. По моим наблюдениям, доминирует в startup-сегменте.
  - [FireHydrant](https://firehydrant.io/), [Rootly](https://rootly.com/), [Blameless](https://www.blameless.com/) — конкуренты incident.io, разный feature mix.
  - [Netflix Dispatch](https://github.com/Netflix/dispatch) — open-source, self-hosted; полный incident-lifecycle orchestrator с Slack-интеграцией.
  - [PagerDuty Process Automation](https://www.pagerduty.com/platform/process-automation/) (ex-Rundeck) — enterprise-grade chat-triggered runbook automation.
- **Specialized Telegram bots (мои примеры):**
  - [owl_clerk_bot](https://github.com/jtprogru/owl_clerk_bot) — bot-секретарь (заметки / reminders).
  - [py-tg-moder](https://github.com/jtprogru/py-tg-moder) — модерация Telegram-чата (anti-spam, captcha, ban-management).
  - [chat-analytics-bot](https://github.com/jtprogru/chat-analytics-bot) — аналитика каналов + модерация.
  - [tg-adminer](https://github.com/jtprogru/tg-adminer) — admin-tools для Telegram.
- **CI/CD integrations:** GitHub Actions с notifications (включая [notiflow](https://github.com/jtprogru/notiflow)), GitLab CI Slack-integration, Argo Workflows + Slack/Telegram steps.

## Best practices

Главный публичный кейс — **[GitHub deploy-bot](https://github.blog/engineering/move-fast/deploying-branches-to-github-com/)** (2012–наст. время). GitHub деплоит сам github.com через ChatOps уже больше десятилетия: в PR comment пишется `.deploy` → bot Hubot читает команду → запускает deploy pipeline → постит обратно в PR статус. Что сработало: **audit trail встроен** (вся история deploys видна в Slack-канале, поисковая), **shared visibility** (deployер не один — все смотрят), **peer-review встроен** (можно оспорить deploy в том же тред'е). Что я понял из commentary GitHub'а — главный challenge не technical, а **operational maturity**: ChatOps требует команду, которая умеет договариваться о deploys в chat, не таскать каждое action через jira-ticket. Если organisational maturity ниже — ChatOps превращается в bypass для proper review, и это становится проблемой.

**Короткие правила:**

- **Read-only by default, destructive actions через explicit confirmation.** Bot отвечает на `/status` / `/who-on-call` без auth check; для `/scale` / `/deploy` / `/incident-close` — двух-шаговый flow с подтверждением, явный capture user identity, post в audit channel. По моим наблюдениям, главный security failure в ChatOps — слитый bot token даёт атакующему те же permissions, что у самого privileged команды.
- **Bot identity ≠ shared admin account.** Один super-bot со всеми permissions = один token к компрометации, тотальный access. Разные bots под разные scopes (deploy-bot, query-bot, incident-bot), каждый со своим минимальным IAM scope; bot identity маппится на team / system, не на «всё подряд». См. [Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/) — bots тоже workloads.
- **Audit channel — отдельно от operational channel.** Все bot actions (особенно destructive) дублируются в read-only audit channel. Это compliance-friendly artifact (SOC 2 / ISO 27001), и это место, где можно отследить cascade-effect одного action на инциденте.

Подробнее:

**Push → Pull → Action — естественная эволюция, не «сразу полный ChatOps».** Начинать с push-нотификаций ([notiflow](https://github.com/jtprogru/notiflow) для CI, Alertmanager Slack для алертов) — минимум usability uplift, zero security risk. Pull-запросы добавляются вторым этапом — bot отвечает на `/status` / `/oncall` / `/last-deploy` за счёт read-only API. Action-команды — последний этап, требует mature permission model, audit pipeline, escalation для confirmation. Прыжок через этапы (сразу action-bot без push/pull инфраструктуры) почти всегда приводит к security gap или к bot-у, который «вроде работает, но никто им не пользуется».

**Build vs buy для incident-platform.** Если incident-management — основной use case ChatOps, в 2025 я не вижу убедительной причины писать свой incident-bot — incident.io / FireHydrant / Rootly / Dispatch (open-source) покрывают 95% потребностей. Build своего incident-bot оправдан в трёх ситуациях: (1) air-gapped / regulated environment без external SaaS; (2) интеграция с proprietary incident-system, которой нет в готовых platforms; (3) tiny team где OSS Dispatch overkill, а commercial вне budget. Иначе — buy / adopt, focus на operational integration, не на bot framework.

**Bot frameworks: какой выбирать в 2025.** Slack Bolt — для Slack-only setups (доминирующий в US-enterprise). Errbot (Python) — для multi-platform или self-hosted. Telegram Bot API напрямую — для маленьких bots, где framework overkill (мои bots [py-tg-moder](https://github.com/jtprogru/py-tg-moder) / [owl_clerk_bot](https://github.com/jtprogru/owl_clerk_bot) — без framework, прямой Python + python-telegram-bot library). Hubot / Lita — legacy, не выбирал бы для new projects (slowed development, экосистема съёхала на Slack Bolt). По моим наблюдениям, Bolt + Slack доминируют в командах от 50 человек; Errbot / Telegram — в smaller / cost-conscious setups.

**Chat-platform lock-in — реальный долгосрочный riск.** Slack-native bots (Bolt SDK, slash-commands, modals) глубоко привязаны к Slack UI; перенос на Teams / Mattermost — переписывание UX-слоя. Если есть risk смены chat (acquisition, compliance, cost) — выбирать multi-platform framework (Errbot) или абстрагировать UX-слой в bot architecture. По моим наблюдениям, Slack lock-in за 3-5 лет редко становится больно, но в B2G / финансе где compliance может требовать смены — стоит думать заранее.

## Связанные листья

- **[Toil Automation](/The-Way-of-SRE/leaves/engineering/toil-automation/)** — parent: ChatOps — chat-driven форма automation; естественное продолжение notification automation в сторону bot-driven actions.
- **[Toil Tracking](/The-Way-of-SRE/leaves/engineering/toil-tracking/)** — tracking показывает, какие repetitive ops-задачи переносить в ChatOps; chat-uplift highest-frequency requests.
- **[Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/)** — personal scripts эволюционируют в team bots, когда повторяющаяся задача переходит из «моя» в «команды».
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — современные incident-tools (incident.io, Dispatch) — Slack-native ChatOps; declare/coordinate инцидент через chat.
- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — declare-incident через `/incident sev1 <description>` — каноническая ChatOps команда.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — `/oncall` query, escalation через bot — standard ChatOps use cases.
- **[War Room Patterns](/The-Way-of-SRE/leaves/practices/war-room-patterns/)** — chat как war room canvas; ChatOps bots координируют sitrep cadence / role rotation / scribe.
- **[Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)** — bot identity и permission model — критичная часть ChatOps security.
- **[Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/)** — bot — это workload; identity-based auth для bot предпочтительнее long-lived shared tokens.

## Открытые вопросы

- **AI-augmented ChatOps** — LLM-powered bots, которые суммируют alerts, предлагают runbook steps, генерируют postmortem-черновики из chat-thread'а. Технология свежая (2024–2025), best practices ещё формируются. Скорее всего, через 2-3 года будет отдельный лист.
- **Voice-first ChatOps** — для critical incident war rooms (Zoom / Meet) bot-присутствие как scribe / coordinator. Пока fringe, но возможный direction.
- **ChatOps в compliance-heavy environments** — финансы / healthcare / B2G, где chat-based actions могут конфликтовать с regulatory requirements (proper approval workflow, immutable audit). Пробел в публичных best practices.
- Я не разбирался глубоко с **ChatOps governance** — как организовать ownership множества bots на уровне org (кто отвечает за чей bot, как deprecate orphan bot, как audit'ить bot permissions cross-team). Если у вас в org есть formal bot inventory + governance — был бы интересен опыт PR'ом.
