---
title: Dev Team Partnership
description: Партнёрство SRE с продуктовыми командами — shared on-call, общий error budget, joint design
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Relationship Management / Dev Team Partnership
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Классическая ops-модель — «dev пишут, ops держат прод» — даёт два предсказуемых результата: ops становится «штрафной командой» (reliability — только их забота), разработчики не учатся писать надёжный код (потому что не несут последствий). SRE-модель её ломает: **обе стороны разделяют один [error budget](/The-Way-of-SRE/glossary/#error-budget) и одну метрику успеха**. Лист — про дисциплину партнёрства: явный engagement contract, joint on-call где возможно, PRR (Production Readiness Review) как gate, exit-критерии. Без них «partnership» деградирует обратно в ops-модель за полгода.

## Что должен уметь

Главный навык на уровне L5 — договариваться об **engagement contract** в явном виде, не «помогаем как можем». Я регулярно вижу команды, в которых SRE и разработчики «партнёры», но при первом серьёзном инциденте выясняется, что никто не знал точно, кто owns что, на каких условиях SRE engage, как происходит exit. Без письменного contract «partnership» — это игра в надежду, и она проигрывается на первом крупном инциденте.

- **L3** — Различает три типовые модели сотрудничества: embedded SRE (внутри product-команды), consulting SRE (приходящий по запросу) и platform SRE (предоставляет общие сервисы).
- **L3** — Понимает, что SRE не отвечает в одиночку за uptime; читает engagement-документы между SRE и dev-командой.
- **L4** — Участвует в product-команде как embedded SRE: ходит на planning, даёт reliability-input на design review, помогает писать корректные SLI совместно с разработчиками.
- **L4** — Проводит Production Readiness Review (PRR) для нового сервиса: проверяет SLO, runbook, observability, capacity, dependencies — фиксирует gap до запуска.
- **L5** — Внедряет shared on-call с продуктовой командой (разработчики в ротации вместе с SRE) или налаживает регулярные sync-сессии.
- **L5** — Договаривается об engagement contract: что делает SRE, что делает product team, при каких условиях SRE engage и exit. Документирует и регулярно ревьюит.
- **L5** — Проводит handoff dev → SRE и обратный delegation back, опираясь на production-readiness checklist; не позволяет «engagement без срока».
- **L6+** — Проектирует embed-модель SRE для продуктовой области из нескольких команд: где embedded, где consulting, где platform.
- **L6+** — Разрешает конфликты ownership / incentives между dev-командой и SRE: пересматривает engagement contract при систематическом нарушении SLO, не прибегая к blame.

## Материалы

### Книги

- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/how-sre-relates/)** (O'Reilly, 2018), глава 16 «How SRE Relates to DevOps». Место SRE в DevOps-парадигме.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/engagement-model/)**, глава 18 «SRE Engagement Model». Главный источник по моделям engagement (PRR, simple PRR, ongoing).
- David N. Blank-Edelman (ред.) — **Seeking SRE** (O'Reilly, 2018). Сборник; разделы про organisational design, embedded vs consulting, scaling SRE.
- Matthew Skelton, Manuel Pais — **[Team Topologies](https://teamtopologies.com/)** (IT Revolution, 2019). Типы команд (stream-aligned / platform / complicated-subsystem / enabling) — SRE укладывается в несколько в зависимости от модели.
- Nicole Forsgren, Jez Humble, Gene Kim — **Accelerate** (IT Revolution, 2018). DORA-эмпирика про межкомандное взаимодействие.

### Статьи и доклады

- Google SRE — **[The Evolution of SRE at Google](https://sre.google/resources/practices-and-processes/evolution-of-sre-at-google/)**. История перехода от «SRE как ops» к «SRE как partner» — полезно для убеждения скептиков.
- Liz Fong-Jones — **[SRE Doesn't Scale](https://www.usenix.org/conference/srecon19americas/presentation/fong-jones)** (SREcon). Доводы за shared responsibility и против выделенных SRE-«пожарных».
- DORA — **[State of DevOps Report](https://dora.dev/research/)**. Исследования по team interaction patterns.

### Инструменты

- **Production Readiness Checklist (шаблон)** — внутрикомандный документ, фиксирующий gap до запуска. Шаблон строится своими руками; референсы — в SRE Workbook (гл. 18) и в публикациях Spotify / Shopify / Lyft.
- **Engagement contract (RFC-формат)** — markdown в репозитории команды: who owns what, SLO, on-call, exit criteria. Стандартного шаблона нет, но повторяется во многих SRE-командах.

## Best practices

**Короткие правила:**

- **Reliability — общая ответственность, а не разделение «dev / ops».** Обе стороны проигрывают при разделении: SRE становится штрафной командой, разработчики не учатся писать надёжный код. Нужна shared metric (error budget), которую тратят и за которую отвечают обе команды.
- **Engagement contract — в явном виде, не на доверии.** Без контракта partnership деградирует в «SRE делает грязную работу». Контракт фиксирует SLO, кто owns on-call, на каких условиях SRE engage и exit.
- **Production Readiness Review — до запуска, а не после.** PRR смещает обнаружение проблем на этап, когда их ещё дёшево исправить — и формирует основу для engagement contract.

Подробнее:

**Shared on-call с product team даёт самый сильный feedback loop.** «SRE дежурят за всех, разработчики узнают про падения из retro» — типичный антипаттерн. Тяжёлый ритуал (разработчики не любят пейджер), но окупается: они начинают писать код, который не падает в 3 утра. Я регулярно вижу команды, которые ввели shared on-call постепенно — business hours-only сначала, затем full rotation, — и через 6–12 месяцев качество кода в production существенно улучшалось. Это самый сильный механизм улучшения reliability через partnership.

**Exit-критерий — обязательная часть engagement.** «SRE подключились к сервису и остались навсегда» — команда становится бутылочным горлышком; новые команды не могут получить SRE, потому что текущие забрали capacity. Контракт фиксирует, когда on-call возвращается dev-команде (например, после года стабильности SLO). Без exit модель не масштабируется.

**SRE участвует в planning, не только в incident response.** SRE узнают про новые фичи на launch-митинге — повлиять на надёжность уже невозможно, остаётся фиксить. Участие в planning — единственный момент, где reliability-input дешевле фичи, а не дороже. По моим наблюдениям, это требование чаще всего нарушается в командах с большим product-pressure: planning кажется неприоритетным, потом расплачиваются инцидентами.

**Знание идёт двунаправленно.** SRE учат разработчиков best practices, разработчики не делятся domain-знаниями — в инциденте SRE принимает осторожные неоптимальные решения, потому что не понимает бизнес-логику. Tech lead обязан делегировать domain-знание (через runbook, walkthrough, parallel debugging) — иначе partnership формально есть, фактически нет.

## Связанные листья

- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — главный регулярный ритуал, на котором partnership проявляется в работе с общим error budget.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — joint SLI formulation: SLI определяются совместно с product-командой, а не задаются SRE сверху.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — co-ownership: runbook пишутся совместно, иначе SRE дежурит вслепую по dev-сервису.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — joint postmortems с обеими сторонами — обязательное условие сохранения partnership.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — модель ролей (IC и др.) распределяется между SRE и разработчиками в зависимости от engagement model.
- **[Change Governance](/The-Way-of-SRE/leaves/practices/change-governance/)** — PRR — формализованная граница «product team готов к продакшен», описан там как gate.
- **[DORA Metrics](/The-Way-of-SRE/leaves/culture/dora-metrics/)** — joint reading DORA-метрик с dev-командой — основной канал, где shared accountability за delivery проявляется в работе с общими цифрами.
- **[Team Topologies](/The-Way-of-SRE/leaves/culture/team-topologies/)** — этот лист про **динамику** партнёрства; Team Topologies задаёт **режим** (collaboration / X-as-a-Service / facilitating). Без topology partnership остаётся подразумеваемым.

## Открытые вопросы

- Как масштабировать engagement model на 10+ продуктовых команд при ограниченном SRE-составе? Стандартный ответ — миграция в сторону platform SRE и enabling teams ([Team Topologies](/The-Way-of-SRE/leaves/culture/team-topologies/)), но конкретные пороги (когда переключаться) — открытая тема.
