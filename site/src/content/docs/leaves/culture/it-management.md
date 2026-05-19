---
title: IT Management
description: Управление IT-операциями на уровне организации — service ownership, capacity & cost, vendor strategy, governance, audit
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** IT Management
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Управление IT-операциями на уровне команды и организации: владение сервисами, governance изменений, capacity & cost management, vendor strategy. Не «менеджмент» как противоположность «инженерии», а **инженерный режим управления**, который удерживает operations прозрачным, измеримым и предсказуемым. Без этого слоя даже хорошие SRE-практики деградируют: сервисы теряют владельцев, бюджет cloud растёт без объяснений, изменения проходят неконтролируемо.

## Что должен уметь

- **L4** — Понимает структуру владения сервисами в команде; знает, кто owner каждого production-сервиса и где это задокументировано.
- **L4** — Ведёт service catalog для своих сервисов: owner, on-call rotation, SLO, runbook'и, зависимости, статус (production / deprecated / sunset).
- **L4** — Участвует в quarterly planning по operations work: capacity, vendor reviews, infra refresh, compliance-чеклисты.
- **L5** — Балансирует operations spend: разбирает счета cloud-провайдеров, выявляет drift (unused resources, oversized instances, дорогостоящие feature flags), инициирует cost optimization.
- **L5** — Ведёт переговоры с vendor: SLA, support tiers, escalation paths; пересматривает контракты по фактическому расходу.
- **L5** — Внедряет lightweight governance: change advisory board (CAB) или async change review, production access controls, audit trail для production-изменений.
- **L6+** — Проектирует IT operations стратегию: build vs buy, vendor concentration risk, multi-cloud vs single-cloud, exit-планы для критических vendor'ов.
- **L6+** — Связывает IT operations с org-level finance / compliance / risk management: SLO/error budget транслируются в business KPI, audit transparency — в compliance-готовность.
- **L6+** — Балансирует governance vs скорость доставки: процессы есть, но не блокируют; CAB не превращается в bottleneck.

## Материалы

### Книги

- Gene Kim, Kevin Behr, George Spafford — **The Phoenix Project** (IT Revolution, 2013). База: динамика IT-операций, business value, переход от reactive ops к proactive engineering.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — **The DevOps Handbook** (IT Revolution, 2-е изд., 2021). База: модернизация IT operations через DevOps-практики.
- Nicole Forsgren, Jez Humble, Gene Kim — **Accelerate** (IT Revolution, 2018). Эмпирика DORA: метрики IT performance и связь с business outcomes. Дополнительно.

### Статьи и фреймворки

- **[SFIA — Skills Framework for the Information Age](https://sfia-online.org/en)**. Канонический международный фреймворк описания IT-компетенций; семь уровней responsibility, на которые опирается этот roadmap. База.
- **AWS Well-Architected Framework — Operational Excellence pillar** (aws.amazon.com/architecture/well-architected). Структурированный набор практик IT-операций для cloud-native сервисов. Дополнительно. Аналоги: Google Cloud Architecture Framework, Azure Well-Architected Framework.

### Инструменты

- **[Backstage](https://backstage.io/)** — open-source платформа для service catalog от Spotify. Базовая точка для централизованного владения сервисами, on-call rotation, документации.
- **Cloud cost management** — встроенные cost explorer в AWS / GCP / Azure + сторонние (Vantage, CloudHealth, Cloudability) для крупных bills. Без отдельного инструмента cost drift не виден.
- **Change tracking** — Jira Service Management, ServiceNow или git-based change log. Главное — единая точка истории production-изменений с audit trail.

## Best practices

- **Service owner определён всегда, и это конкретный человек/команда, а не «общая инфра».** Антипаттерн: «общий сервис» без owner'а. Через год никто не помнит, кто принимает решения; обновления откладываются, инциденты затягиваются, sunset невозможен. Каждый production-сервис в каталоге имеет owner с проверяемым контактом.
- **Service catalog — single source of truth.** Антипаттерн: расползание метаданных по wiki, spreadsheet, Confluence и устным договорённостям. Через полгода ни один документ не отражает реальность. Каталог должен быть единственным местом, на которое все ссылаются.
- **Cost-aware operations: cloud spend — это owned metric.** Антипаттерн: «у нас бюджет на cloud, не считаем». Через год счёт удваивается без понятной причины. Команда должна видеть свой spend, иметь budget alert'ы, понимать unit economics.
- **Vendor concentration — управляемый риск, а не данность.** Антипаттерн: критическая зависимость от одного vendor без exit-плана. Один EOL или ценовое изменение — и проект встаёт. Зависимости перечисляются явно, exit-стратегии прорабатываются заранее.
- **Governance light: процесс есть, но не блокирует.** Антипаттерн: heavy CAB задерживает каждое изменение на дни/недели; команды обходят процесс или прячут изменения. Async review + auto-approval для low-risk + явный путь эскалации для high-risk сохраняет audit без удушения скорости.
- **Audit trail для production-доступа — обязателен, а не «нам не нужно».** Антипаттерн: «доверяем команде». Без trail невозможно расследовать инцидент с человеческим фактором, нет основы для compliance-аудита, и через 2 года SOC2/ISO становится невозможным.

## Связанные листья

- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — SLO/budget — главный показатель здоровья сервиса; в catalog'е owner и SLO для каждого сервиса.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и связаны с сервисами в каталоге; каталог — точка входа для on-call.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — IT Management поддерживает engagement contract на org-level: кто, что, при каких условиях.
- **Change Management** *(TBD)* — операционный ритуал контроля изменений; здесь — стратегический слой governance.
- **Methods & Tools** *(TBD)* — выбор и стандартизация tooling в practices-ветви; здесь — управление спектром этих инструментов на уровне организации.
- **Toil Reduction** *(TBD)* — автоматизация operations снижает management burden, освобождает время для стратегической работы.
- **Performance Management** *(TBD)* — performance metrics на уровне команд и инцидентов; пересечение с IT Management через KPI.

## Открытые вопросы

- Граница между этим листом (culture, organisational) и `Methods & Tools` (practices, Mandatory): оба касаются governance процессов и выбора инструментов. Здесь — про управление IT-операциями как функцию; там — про конкретные методики и tooling. Возможно, нужно уточнить scope при углублении соседнего листа.
- IT Management в SRE-контексте часто путают с «классическим IT ops management» (ITIL-style). Этот лист — про современный, инженерный подход (Service catalog, observability-driven, automation-first); ITIL-наследие упоминается только там, где оно даёт работающие инструменты (CAB как async review, change classification).
