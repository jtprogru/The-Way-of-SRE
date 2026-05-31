---
title: Service Ownership
description: Систематическое владение production-сервисами — owner, catalog, актуальность при изменениях
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** IT Management / Service Ownership
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«У нас всё в SRE team» — один из ответов, который я регулярно слышу на вопрос «кто owner этого сервиса?». Это не ownership — это размазанная ответственность, которая распадается на первом инциденте: никто не помнит, кто принимает решения, [runbook](/The-Way-of-SRE/glossary/#runbook) не обновляется, sunset невозможен. Service ownership — это **конкретный человек или конкретная команда** как accountable owner, фиксированный в catalog, связанный с deploy / on-call / dashboards / SLO. Базовая практика внутри L1 `IT Management`; без неё разваливаются ownership-зависимые ритуалы (SLO Review, on-call rotation, change governance).

## Что должен уметь

Главный навык на уровне L5 — превратить catalog из «wiki для глаз» в **driver автоматизации**. Я регулярно вижу catalog'и, которые читают только люди — никакая система их не использует. В этом случае catalog устаревает за полгода: запись попала туда один раз и живёт там навсегда, через 2 года половина — про deprecated сервисы. Catalog оживает, когда из него генерируются on-call rotation, dashboards, deploy-allowlist. Пока он только для людей, его никто не поддерживает.

**L3**
- Знает структуру владения сервисами своей команды; находит owner любого production-сервиса за минуту.
- Обновляет запись в service catalog после смены owner / on-call / runbook.

**L4**
- Ведёт service catalog для своих сервисов: owner, on-call rotation, SLO, runbook, зависимости, текущий статус (production / deprecated / sunset).
- Проводит inventory «белых пятен» ownership: сервисы без owner, без runbook, без SLO; формирует список и owner для закрытия.

**L5**
- Внедряет service catalog как единый источник истины; систематически вытесняет дублирующие записи (wiki, spreadsheet, устные договорённости).
- Связывает catalog с автоматизацией: deploy pipeline / on-call rotation / dashboards / SLO-метрики читают данные из catalog, а не из дублей.
- Проводит ownership handoff при реорганизациях (sunset сервиса, миграция, transfer владельца) с явным дедлайном и follow-up.

**L6+**
- Проектирует ownership-модель для области из нескольких команд: где single owner, где shared, кто owner cross-team-сервисов и платформенных компонентов.
- Связывает ownership с org-level compliance / audit: каждый production-сервис имеет accountable owner для security/compliance целей.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/being-on-call/)** (O'Reilly, 2016), глава 11 «Being On-Call». Раздел о связи on-call rotation с ownership — основа модели.
- Matthew Skelton, Manuel Pais — **[Team Topologies](https://teamtopologies.com/)** (IT Revolution, 2019). Глава про ownership boundaries и cognitive load — почему shared ownership работает хуже, чем кажется.

### Статьи

- **[Backstage Software Catalog documentation](https://backstage.io/docs/features/software-catalog/)** — практический референс по модели service entity (kind, owner, lifecycle, depends-on); подходит как стартовая точка для собственной структуры.

### Инструменты

- **[Backstage](https://backstage.io/)** — open-source платформа для service catalog от Spotify. По моим наблюдениям, канонический выбор для команд, которым перерос markdown — особенно если есть желание делать developer portal поверх.
- **Markdown в repo команды** — самый простой формат на старте: один сервис = одна запись (`services/<slug>.md`) с фронт-маттером owner / on-call / SLO / dependencies. PR-based review, git history как журнал аудита.
- **CODEOWNERS (GitHub)** — частичная проекция ownership на уровень кода. Не заменяет catalog, но синхронизировать с ним обязательно.

## Best practices

**Короткие правила:**

- **Service owner — конкретный человек или команда, никогда «общая инфра».** «Owner: SRE team» без указания конкретной команды/лида — через год при инциденте никто не помнит, кто принимает решения; обновления откладываются, sunset невозможен.
- **Catalog — единый источник истины, а не один из источников.** Метаданные расползаются по wiki, Confluence, spreadsheet, устным договорённостям — через полгода ни один документ не соответствует реальности. Catalog должен быть единственным местом, на которое ссылаются остальные.
- **Sunset — явный статус с дедлайном.** «Сервис вроде не используется» — через 3 года зомби с уязвимостями и облачными расходами. Sunset = запись в catalog со статусом, ответственным и датой выключения.

Подробнее:

**Catalog — driver автоматизации, а не статичный документ.** «Каталог как wiki» — фронт-энд для глаз, никакая система его не читает. Я регулярно вижу catalog'и, которые открыли один раз при создании сервиса и забыли — потому что catalog не питает ничего, кроме людей. Catalog оживает, когда из него генерируются on-call rotation, dashboards, deploy-allowlist; пока он только для людей, его никто не поддерживает.

**Регулярный audit и cleanup.** Запись попадает в catalog один раз и живёт там навсегда — через 2 года половина записей про deprecated сервисы; реальные production — где-то ещё. Установи цикл (квартал/полугодие) и владельца, который ходит по записям и помечает sunset. Без этой дисциплины catalog становится археологией.

**Ownership ↔ on-call rotation согласованы.** «На бумаге owner — команда A, дежурит — команда B» — в инциденте B не имеет полномочий принять решение, A нет в ротации. Это самый частый разлад, который я наблюдаю в командах со «зрелым» service catalog'ом. Согласование явное и регулярно проверяемое: при изменении ротации — обновление catalog.

## Связанные листья

- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — owner — это тот, кто принимает решения о бюджете; без чёткого ownership ревью не имеет адресата.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — owner отвечает за актуальность runbook своего сервиса; catalog связывает service ↔ runbook URL.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — engagement contract предполагает явное ownership; без него partnership деградирует в «SRE решает всё».
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — incident commander смотрит в catalog, чтобы узнать owner и эскалационный путь.
- **[Backup & Restore](/The-Way-of-SRE/leaves/engineering/backup-restore/)** — каталог содержит backup-метаданные сервиса; без catalog на момент disaster инженеры ищут backup вслепую.
- **[Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)** — каталог содержит cost-метаданные: текущий spend, budget, trend. Cost ownership = service ownership.
- **[Vendor Management](/The-Way-of-SRE/leaves/practices/vendor-management/)** — каталог содержит upstream vendor dependencies сервиса; vendor incident playbook привязан к owner.
- **[Change Governance](/The-Way-of-SRE/leaves/practices/change-governance/)** — каталог содержит PRR status: passed / not passed / in progress. Часть «есть ли owner и готовность к prod».
- **[Team Topologies](/The-Way-of-SRE/leaves/culture/team-topologies/)** — service ownership — артефакт topology: stream-aligned team владеет сервисом end-to-end, platform team владеет инфраструктурой. Без явной topology catalog становится неполным.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/)** — service catalog содержит per-service tier (1/2/3) с RTO/RPO targets и DR strategy. DR Policy задаёт рамки tier-классификации; catalog — per-service инстанциация.

## Открытые вопросы

- Под L1 `IT Management` остаются темы — например, **Production Access Audit** (compliance-readiness, who has shell access to prod). Cost / Vendor / Change Governance уже выделены в отдельные листья.
- Граница со `Methods & Tools`: catalog как инструмент частично пересекается. Здесь — про ownership как практику; там — про выбор tooling.
