---
title: Service Ownership
description: Систематическое владение боевыми сервисами — owner, catalog, актуальность при изменениях
sfia: [3, 4, 5, 6]
status: draft
---

«У нас всё в SRE team» — один из ответов, который я регулярно слышу на вопрос «кто owner этого сервиса?». Это не ownership. Это размазанная ответственность, и она перестаёт работать на первом же инциденте: никто не помнит, кто принимает решения, [runbook](/The-Way-of-SRE/glossary/#runbook) не обновляется, sunset невозможен. Service ownership — это **конкретный человек или конкретная команда** как accountable owner, зафиксированный в catalog и связанный с deploy, on-call, dashboards и SLO. Практика базовая, внутри L1 `IT Management`, и без неё сыпется всё, что опирается на owner: SLO Review, ротация дежурств, change governance.

## Что должен уметь

Главный навык на уровне L5 — превратить catalog из «wiki для глаз» в **driver автоматизации**. Я регулярно вижу catalog'и, которые читают только люди — никакая система их не использует. В этом случае catalog устаревает за полгода: запись попала туда один раз и живёт там навсегда, через 2 года половина — про deprecated сервисы. Catalog оживает, когда из него генерируются on-call rotation, dashboards, deploy-allowlist. Пока он только для людей, его никто не поддерживает.

**L3**
- Знает структуру владения сервисами своей команды; находит owner любого боевого сервиса за минуту.
- Обновляет запись в service catalog после смены owner / on-call / runbook.

**L4**
- Ведёт service catalog для своих сервисов: owner, on-call rotation, SLO, runbook, зависимости, текущий статус (production / deprecated / sunset).
- Проводит inventory «белых пятен» ownership: сервисы без owner, без runbook, без SLO; формирует список и owner для закрытия.

**L5**
- Внедряет service catalog как единый источник истины; систематически вытесняет дублирующие записи (wiki, spreadsheet, устные договорённости).
- Связывает catalog с автоматизацией: deploy pipeline / on-call rotation / dashboards / SLO-метрики читают данные из catalog, а не из дублей.
- Проводит ownership handoff при реорганизациях (sunset сервиса, миграция, transfer владельца) с явным дедлайном и follow-up.

**L6+**
- Проектирует модель ownership для области из нескольких команд: где single owner, где shared, кто owner общих для нескольких команд сервисов и платформенных компонентов.
- Связывает ownership с org-level compliance / audit: у каждого боевого сервиса есть accountable owner для целей security и compliance.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/being-on-call/)** (O'Reilly, 2016), глава 11 «Being On-Call». Раздел о связи on-call rotation с ownership — основа модели.
- Matthew Skelton, Manuel Pais — **[Team Topologies](https://teamtopologies.com/book)** (IT Revolution, 1-е изд. 2019, 2-е изд. 2025). Глава про ownership boundaries и когнитивную нагрузку — почему shared ownership работает хуже, чем кажется.

### Статьи

- **[Backstage Software Catalog documentation](https://backstage.io/docs/features/software-catalog/)** — практический референс по модели service entity (kind, owner, lifecycle, depends-on); подходит как стартовая точка для собственной структуры.

### Инструменты

- **[Backstage](https://backstage.io/)** — open-source платформа для service catalog от Spotify. По моим наблюдениям, канонический выбор для команд, которым перерос markdown — особенно если есть желание делать developer portal поверх.
- **Markdown в repo команды** — самый простой формат на старте: один сервис = одна запись (`services/<slug>.md`) с фронт-маттером owner / on-call / SLO / dependencies. PR-based review, git history как журнал аудита.
- **CODEOWNERS (GitHub)** — частичная проекция ownership на уровень кода. Не заменяет catalog, но синхронизировать с ним обязательно.

## Best practices

**Короткие правила:**

- **Service owner — конкретный человек или команда, никогда «общая инфра».** Запись «Owner: SRE team» без имени команды или лида через год превращается в загадку: в инциденте никто не помнит, кто принимает решения, обновления откладываются, sunset невозможен.
- **Sunset — явный статус с дедлайном.** «Сервис вроде не используется» — это будущий зомби с уязвимостями и счётом от облака. Sunset = запись в catalog со статусом, ответственным и датой выключения.

Catalog работает, только когда он единственный источник истины, а не один из. Метаданные расползаются охотно: часть в wiki, часть в Confluence, часть в чьей-то личной таблице, часть в устной договорённости с человеком, который уже уволился, и никто не помнит, какая из четырёх версий записывалась последней. Через полгода спор «где правда» решается голосованием. Лечение одно. Остальные места ссылаются на catalog, а не копируют из него.

Подробнее:

**Catalog — driver автоматизации, а не статичный документ.** Каталог, который читают только глазами, живёт ровно до первой реорганизации. Я регулярно вижу такие: запись создали вместе с сервисом и больше не открывали, потому что от неё ничего не зависит, а значит, никто и не заметит, если она разойдётся с реальностью. Всё меняется, когда из каталога генерируются ротация дежурств, dashboards и deploy-allowlist. Дальше он поддерживает себя сам. Сломанная запись ломает пайплайн, и её чинят в тот же день.

**Регулярный audit и cleanup.** Запись попадает в catalog один раз и живёт там вечно. Через два года половина каталога — про deprecated сервисы, а реальный прод описан где-то ещё. Помогает скучная дисциплина: цикл пересмотра раз в квартал или полгода и живой человек, который проходит по записям, спрашивает владельцев «это ещё работает?» и проставляет sunset тем, кто не ответил. Иначе каталог превращается в археологию.

**Ownership ↔ on-call rotation согласованы.** «На бумаге owner — команда A, дежурит команда B» — самый частый разлад, который я наблюдаю в командах со «зрелым» service catalog'ом. В инциденте B не имеет полномочий принять решение, а A нет в ротации, и первые двадцать минут уходят на поиск того, кто может сказать «катим откат». Согласование должно быть явным и проверяемым: меняется ротация — меняется запись в catalog.

## Связанные листья

- **[SLO / Budget Review](/The-Way-of-SRE/culture/slo-budget-review/)** — owner — это тот, кто принимает решения о бюджете; без чёткого ownership ревью не имеет адресата.
- **[Runbooks](/The-Way-of-SRE/culture/runbooks/)** — owner отвечает за актуальность runbook своего сервиса; catalog связывает service ↔ runbook URL.
- **[Dev Team Partnership](/The-Way-of-SRE/culture/dev-team-partnership/)** — engagement contract предполагает явное ownership; без него partnership деградирует в «SRE решает всё».
- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — incident commander смотрит в catalog, чтобы узнать owner и эскалационный путь.
- **[Backup & Restore](/The-Way-of-SRE/engineering/backup-restore/)** — каталог содержит метаданные о бэкапах сервиса; без catalog на момент disaster инженеры ищут backup вслепую.
- **[Cloud Cost Control](/The-Way-of-SRE/engineering/cloud-cost-control/)** — каталог содержит метаданные о затратах: текущий spend, budget, trend. Cost ownership = service ownership.
- **[Vendor Reliability](/The-Way-of-SRE/practices/vendor-reliability/)** — каталог содержит upstream vendor dependencies сервиса; vendor incident playbook привязан к owner.
- **[Change Governance](/The-Way-of-SRE/practices/change-governance/)** — каталог содержит PRR status: passed / not passed / in progress. Часть «есть ли owner и готовность к prod».
- **[Team Topologies](/The-Way-of-SRE/culture/team-topologies/)** — service ownership — артефакт topology: stream-aligned team владеет сервисом end-to-end, platform team владеет инфраструктурой. Без явной topology catalog становится неполным.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/culture/dr-policy/)** — service catalog содержит per-service tier (1/2/3) с RTO/RPO targets и DR strategy. DR Policy задаёт рамки классификации по tier; catalog — per-service инстанциация.

## Открытые вопросы

Под L1 `IT Management` остаются нераскрытые темы. Самая заметная — **Production Access Audit**: у кого есть доступ к боевым машинам и как это выглядит с точки зрения compliance. Cost, Vendor и Change Governance уже выделены в отдельные листья, а этот кусок пока висит.

Отдельно меня смущает граница со `Methods & Tools`. Catalog как инструмент частично живёт и там, и тут. Договорённость сейчас такая: здесь — ownership как практика, там — выбор tooling. Насколько эта граница выдержит рост обоих листьев, я не знаю.
