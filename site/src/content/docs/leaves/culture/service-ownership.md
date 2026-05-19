---
title: Service Ownership
description: Систематическое владение production-сервисами — кто owner, что в каталоге, как обновляется при изменениях. Основа governance и operations clarity
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** IT Management / Service Ownership
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Систематическое владение production-сервисами: кто owner, что зафиксировано в каталоге, как поддерживается актуальность. Базовая практика внутри L1 `IT Management` — без неё разваливаются ownership-зависимые ритуалы (SLO Review, on-call rotation, change governance) и невозможна compliance-готовность. Сосед-лист этого же L1 могут возникнуть в будущем: Cost Management, Vendor Management, Change Governance.

## Что должен уметь

- **L3** — Знает структуру владения сервисами своей команды; находит owner любого production-сервиса за минуту.
- **L3** — Обновляет запись в service catalog после смены owner / on-call / runbook'а.
- **L4** — Ведёт service catalog для своих сервисов: owner, on-call rotation, SLO, runbook'и, зависимости, текущий статус (production / deprecated / sunset).
- **L4** — Проводит inventory «белых пятен» ownership в команде: сервисы без owner'а, без runbook'а, без SLO; формирует список и owner'ов для их закрытия.
- **L5** — Внедряет service catalog как single source of truth; систематически вытесняет дублирующие записи (wiki, spreadsheet, устные договорённости).
- **L5** — Связывает catalog с автоматизацией: deploy pipeline / on-call rotation / dashboards / SLO-метрики читают данные из catalog, а не из дублей.
- **L5** — Проводит ownership handoff при реорганизациях команды (sunset сервиса, миграция, transfer владельца) с явным дедлайном и follow-up.
- **L6+** — Проектирует ownership-модель для области из нескольких команд: где single owner, где shared, кто owner cross-team-сервисов и платформенных компонентов.
- **L6+** — Связывает ownership с org-level compliance / audit: каждый production-сервис имеет accountable owner для security/compliance целей; ownership пробрасывается в SOC2/ISO/internal audit artefacts.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/being-on-call/)** (O'Reilly, 2016), глава 11 «Being On-Call». Раздел о связи on-call rotation с ownership — основа модели. База.
- Matthew Skelton, Manuel Pais — **[Team Topologies](https://teamtopologies.com/)** (IT Revolution, 2019). Глава про ownership boundaries и cognitive load — почему shared ownership работает хуже, чем кажется. Дополнительно.

### Статьи

- **[Backstage Software Catalog documentation](https://backstage.io/docs/features/software-catalog/)** — практический референс по модели service entity (kind, owner, lifecycle, depends-on); подходит как стартовая точка для собственной структуры каталога.

### Инструменты

- **[Backstage](https://backstage.io/)** — open-source платформа для service catalog от Spotify. Канонический выбор для команд, которым перерос markdown.
- **Markdown в repo команды** — самый простой формат на старте: один сервис = одна запись (`services/<slug>.md`) с фронт-маттером owner / on-call / SLO / dependencies. PR-based review, git history как audit trail.
- **CODEOWNERS (GitHub)** — частичная проекция ownership на уровень кода. Не заменяет catalog, но синхронизировать с ним обязательно.

## Best practices

- **Service owner — конкретный человек или команда, никогда «общая инфра».** Антипаттерн: запись типа «owner: SRE team» без указания конкретной команды/лида. Через год при инциденте никто не помнит, кто принимает решения; обновления откладываются, sunset невозможен.
- **Catalog — single source of truth, а не один из источников.** Антипаттерн: метаданные расползаются по wiki, Confluence, spreadsheet и устным договорённостям. Через полгода ни один документ не соответствует реальности. Catalog должен быть единственным местом, на которое ссылаются все остальные.
- **Catalog — driver автоматизации, а не статичный документ.** Антипаттерн: «каталог как wiki» — фронт-энд для глаз, никакая система его не читает. Catalog оживает, когда из него генерируются on-call rotation, dashboards, deploy-allowlist; пока он только для людей, его никто не поддерживает.
- **Регулярный audit и cleanup.** Антипаттерн: запись попадает в catalog один раз и живёт там навсегда. Через 2 года половина записей — про deprecated сервисы; реальные production — где-то ещё. Установи цикл (квартал/полугодие) и владельца, который ходит по записям и помечает sunset.
- **Ownership ↔ on-call rotation согласованы.** Антипаттерн: «на бумаге owner — команда A, дежурит — команда B». На инциденте B не имеет полномочий принять решение, A нет в ротации. Согласование явное и регулярно проверяемое.
- **Sunset — явный статус с дедлайном.** Антипаттерн: сервис «вроде не используется», но никто не отвечает за выключение. Через 3 года это zombie с уязвимостями и cloud spend. Sunset — лист в catalog'е со статусом, ответственным и датой выключения.

## Связанные листья

- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — owner — это тот, кто принимает решения о бюджете; без чёткого ownership ревью не имеет адресата.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — owner отвечает за актуальность runbook'ов своего сервиса; catalog связывает service ↔ runbook URL.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — engagement contract между SRE и dev предполагает явное ownership; без него partnership деградирует в «SRE решает всё».
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — incident commander смотрит в catalog, чтобы узнать owner и эскалационный путь; без catalog escalation работает по знакомству.

## Открытые вопросы

- Под L1 `IT Management` остаются темы, которые могут стать отдельными листьями: **Cost Management** (cloud spend ownership, unit economics), **Vendor Management** (контракты, exit-стратегии, concentration risk), **Change Governance** (CAB, async review, audit trail), **Production Access Audit** (compliance-readiness). Service Ownership — фундамент для всех четырёх, но каждый имеет самостоятельный scope. Какие из них становятся листьями вперёд — обсуждается отдельно при углублении ветви.
- Граница со `Methods & Tools` (Practices/Mandatory): catalog как инструмент частично пересекается. Здесь — про ownership как практику; там — про выбор tooling. Обсудить при углублении соседнего листа.
