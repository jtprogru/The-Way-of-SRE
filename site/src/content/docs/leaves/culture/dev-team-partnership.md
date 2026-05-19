---
title: Dev Team Partnership
description: Партнёрство SRE с продуктовыми командами — shared on-call, совместное проектирование, совместная ответственность за надёжность
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Relationship Management / Dev Team Partnership
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Партнёрство SRE с продуктовыми командами. **SRE работает вместе с devs, не вместо них.** Включает совместное проектирование, shared on-call, явный engagement contract, совместную ответственность за надёжность. Противоположно классической ops-модели, где «dev пишут, ops держат прод» — здесь обе стороны разделяют один error budget и одну метрику успеха.

## Что должен уметь

- **L3** — Различает три типовые модели сотрудничества: embedded SRE (внутри product-команды), consulting SRE (приходящий по запросу) и platform SRE (предоставляет общие сервисы). Знает, какая модель действует в его команде и почему.
- **L3** — Понимает, что SRE не отвечает в одиночку за uptime; читает engagement-документы между SRE и dev-командой и может объяснить условия контракта.
- **L4** — Участвует в product-команде как embedded SRE: ходит на planning, даёт reliability-input на design review, помогает писать корректные SLI совместно с разработчиками сервиса.
- **L4** — Проводит Production Readiness Review (PRR) для нового сервиса: проверяет SLO, runbooks, observability, capacity, dependencies — фиксирует gap'ы до запуска, а не после первого инцидента.
- **L5** — Внедряет shared on-call с продуктовой командой (devs идут в ротацию вместе с SRE) или налаживает регулярные sync-сессии. Согласует ожидания по reliability на уровне команды.
- **L5** — Договаривается об engagement contract: что делает SRE, что делает product team, при каких условиях SRE engage и exit. Документирует контракт и регулярно ревьюит его.
- **L5** — Проводит handoff dev → SRE и обратный delegation back, опираясь на production-readiness checklist; не позволяет «engagement без срока».
- **L6+** — Проектирует embed-модель SRE для продуктовой области из нескольких команд: где embedded, где consulting, где platform; балансирует нагрузку и influence; влияет на org chart, чтобы модель работала.
- **L6+** — Разрешает конфликты ownership / incentives между dev-командой и SRE: пересматривает engagement contract при смене приоритетов или при систематическом нарушении SLO, не прибегая к blame.

## Материалы

### Книги

- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/how-sre-relates/)** (O'Reilly, 2018), глава 16 «How SRE Relates to DevOps». База: место SRE в DevOps-парадигме.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/engagement-model/)**, глава 18 «SRE Engagement Model». Главный источник по моделям engagement (PRR, simple PRR, ongoing) и условиям engage/disengage.
- David N. Blank-Edelman (ред.) — **Seeking SRE** (O'Reilly, 2018). Сборник; разделы про organisational design, embedded vs consulting, scaling SRE — продвинуто.
- Matthew Skelton, Manuel Pais — **[Team Topologies](https://teamtopologies.com/)** (IT Revolution, 2019). База для понимания типов команд (stream-aligned / platform / complicated-subsystem / enabling) — SRE укладывается в несколько из них в зависимости от модели.
- Nicole Forsgren, Jez Humble, Gene Kim — **Accelerate** (IT Revolution, 2018). Эмпирика DORA про межкомандное взаимодействие и influence на performance — дополнительно.

### Статьи и доклады

- Google SRE — **[The Evolution of SRE at Google](https://sre.google/resources/practices-and-processes/evolution-of-sre-at-google/)**. История перехода от «SRE как ops» к «SRE как partner» — полезно для убеждения скептиков. База.
- Liz Fong-Jones — **[SRE Doesn't Scale](https://www.usenix.org/conference/srecon19americas/presentation/fong-jones)** (SREcon). Доводы за shared responsibility и против выделенных SRE-«пожарных». Продвинуто.
- DORA — **[State of DevOps Report](https://dora.dev/research/)**. Исследования по team interaction patterns и влиянию на throughput / stability. Дополнительно.

### Инструменты

- **Production Readiness Checklist (шаблон)** — внутрикомандный документ, фиксирующий gap'ы до запуска сервиса. Шаблон строится своими руками; референсы — в SRE Workbook (глава 18) и в публикациях команд Spotify / Shopify / Lyft.
- **Engagement contract (RFC-формат)** — markdown-документ в репозитории команды: who owns what, SLO, on-call, exit criteria. Не существует «стандартного шаблона», но повторяется во многих SRE-командах.

## Best practices

- **Reliability — общая ответственность, а не разделение «dev / ops».** Антипаттерн: SRE отвечает за uptime, devs за features. Обе стороны проигрывают: SRE становится «штрафной командой», devs не учатся писать надёжный код. Нужна shared metric (error budget), которую тратят обе команды и за которую обе отвечают.
- **Engagement contract — в явном виде, не на доверии.** Антипаттерн: SRE «помогают как могут», dev «прислушиваются как могут» — на следующем инциденте обе стороны разочарованы. Контракт фиксирует SLO, кто owns on-call, на каких условиях SRE engage и exit. Без контракта partnership деградирует в «SRE делает грязную работу».
- **Production Readiness Review — до запуска, а не после.** Антипаттерн: сервис уходит в прод с обещанием «мы потом подключим SRE»; SRE приходят к готовому инциденту, не имея доступа к коду и архитектуре. PRR смещает обнаружение проблем на этап, когда их ещё дёшево исправить — и формирует основу для engagement contract.
- **Shared on-call с product team даёт самый сильный feedback loop.** Антипаттерн: SRE дежурят за всех, devs узнают про падения из retro. Тяжёлый ритуал — devs не любят пейджер — но окупается: они начинают писать код, который не падает в 3 утра. Запускать постепенно (например, business hours-only сначала, затем full rotation).
- **Exit-критерий — обязательная часть engagement.** Антипаттерн: SRE подключились к сервису и остались навсегда; команда становится бутылочным горлышком. Контракт фиксирует, когда on-call возвращается dev-команде (например, после года стабильности SLO) — без exit модель не масштабируется на новые команды.
- **SRE участвует в planning, не только в incident response.** Антипаттерн: SRE узнают про новые фичи на launch-митинге; повлиять на надёжность уже невозможно, остаётся фиксить. Участие в planning — единственный момент, где reliability-input дешевле фичи, а не дороже.
- **Знание идёт двунаправленно.** Антипаттерн: SRE учат dev best practices, dev не делятся domain-знаниями. В инциденте SRE не понимает бизнес-логику и принимает осторожные неоптимальные решения. Tech lead обязан делегировать domain-знание (через runbooks, walkthroughs, parallel debugging) — иначе partnership формально есть, фактически нет.

## Связанные листья

- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — главный регулярный ритуал, на котором partnership проявляется в работе с общим error budget.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — joint SLI formulation: SLI определяются совместно с product-командой, а не задаются SRE сверху.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — co-ownership: runbook'и пишутся совместно, иначе SRE дежурит «вслепую» по dev-сервису.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — joint postmortems: blameless-разбор инцидентов с обеими сторонами как обязательное условие сохранения partnership.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — модель ролей (Incident Commander и др.) распределяется между SRE и dev в зависимости от engagement model.
- **Production Readiness Review** *(TBD)* — формализованная граница «product team готов к продакшен».
- **SRE Maturity Assessment** *(TBD)* — оценка зрелости partnership как часть оценки зрелости SRE-практик.

## Открытые вопросы

- Как масштабировать engagement model на 10+ продуктовых команд при ограниченном SRE-составе? Стандартный ответ — миграция в сторону platform SRE и enabling teams (Team Topologies), но конкретные пороги (когда переключаться) — открытая тема для отдельного исследования или листа.
