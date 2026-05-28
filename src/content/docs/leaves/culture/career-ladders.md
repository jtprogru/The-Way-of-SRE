---
title: Career Ladders
description: Документированные уровни и переходы — expectations per level и signals для promotion
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Organisational Capability Development / Career Ladders
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Вырастешь — посмотрим» — антипаттерн, который я регулярно вижу в командах без документированной [career ladder](/The-Way-of-SRE/glossary/#career-ladder). Инженер не понимает, что от него ожидается; руководитель интерпретирует «senior» по-своему; calibration между командами невозможен; промоушн через 2 года приходит с feedback, который ни разу не звучал в 1:1. Career ladder — это **организационный артефакт**: явный список компетенций на каждом уровне, конкретные signals для promotion, calibration meeting для shared interpretation. Соседний лист к [SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/) под L1 `Organisational Capability Development`.

## Что должен уметь

Главный навык на уровне L5 — формулировать **specific behavioral expectations**, а не «должен иметь impact». Vague формулировки типа «senior должен иметь large impact» неоперационализуемы — evaluator интерпретирует субъективно, инженер не знает, как закрыть. Хорошие ladders формулируют поведенчески: «independently drives features through ambiguity», «mentors at least N junior engineers», «owns reliability of one critical service», «contributes to architecture decisions через ADR». Измеримо, сравнимо, отстаиваемо в calibration.

- **L3** — Знает, где живёт ladder-документ; находит свой текущий уровень и читает expectations следующего.
- **L3** — Регулярно (минимум quarterly) перечитывает ladder для self-positioning: что закрывает, что нет, в чём gap.
- **L4** — Использует ladder в 1:1 conversations: формулирует growth-вопросы конкретно («вот expectations L5, такие пункты я закрываю через X / Y / Z, эти — нет»).
- **L4** — Даёт peer-feedback со ссылкой на ladder («это уже L5-level scope decision», «здесь не хватает behaviour из L5 — multi-team influence»).
- **L5** — Калибрует собственное self-assessment с командной нормой через calibration meeting (полугодие — норма).
- **L5** — Если играет роль руководителя / tech lead: использует ladder для promotion decisions, документирует промоушн как явный case с evidence (artifacts, projects, behaviours).
- **L5** — Пишет promotion case на одну страницу: для какого уровня, какие expectations закрыты конкретными примерами, какие открытые вопросы; ревьюится кросс-командно.
- **L6+** — Проектирует / обновляет ladder для org-области: балансирует specialist vs generalist, IC track vs manager track.
- **L6+** — Поддерживает ladder во времени: industry shifts (AI-era, platform-engineering era) приходят за expectations; ladder evolves; при этом не ломаются уже выданные commitments.

## Материалы

### Книги

- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Путь staff/principal engineer для IC — archetypes (tech lead / architect / solver / right-hand), стратегии достижения staff-level scope. Помогает понять, как формулируются expectations за пределами senior.
- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). Главы про performance review, calibration, promotion decisions — сторона руководителя в работе с ladder.
- Lara Hogan — **Resilient Management** (A Book Apart, 2019). Leveling guides, equitable feedback, calibration practices без bias.

### Статьи и фреймворки

- **[Progression.fyi](https://progression.fyi/)**. Публичная коллекция 75+ career ladders от различных компаний (CircleCI, Medium, Monzo, Rent The Runway, GOV.UK и др.). По моим наблюдениям, главный практический ресурс перед написанием собственной ladder — как референс структуры и языка expectations.
- **[SFIA — Skills Framework for the Information Age](https://sfia-online.org/en)**. Канонический международный framework с 7 уровнями responsibility. Подходит как foundation для собственной ladder в IT-командах.

### Инструменты

- **Markdown в org / engineering repo** (или Notion / wiki) — самый простой формат: один документ, секции per-level, behavioral expectations + evidence examples. PR-based review для изменений, public для всей engineering.
- **Calibration template** — структурированный документ для calibration meeting: список инженеров под рассмотрение, рекомендуемый уровень от руководителя, evidence references, заметки calibration committee. Versioned for audit.
- **Self-assessment worksheet** — структурированный формат для инженера перед performance review: expectations level by level, self-rating «meets / partial / not yet» с конкретными artifacts.

## Best practices

Я регулярно вижу команды, в которых ladder написан, опубликован, и никто его не открывает между промоушнами. Это не ladder, это документ-альбатрос. По моим наблюдениям, рабочая ladder отличается одним признаком: на каждом 1:1 в течение года к ней возвращаются хотя бы один раз. «No surprises rule» в performance review — это not magic; это побочный эффект того, что ladder регулярно используется как vocabulary, а не открывается раз в год.

**Короткие правила:**

- **Ladder документирован и публичен внутри engineering, а не «у руководителя в голове».** «Вырастешь — посмотрим» означает, что инженер не понимает требований, тратит силы не на то, в promotion-decision получает feedback, который никогда не звучал в 1:1. Documented ladder = predictable expectations; внутренне публичный = transparent across teams.
- **Specific behavioral expectations, а не «должен иметь impact».** Vague «senior должен иметь large impact» неоперационализуемо. Хорошие ladders: «independently drives features through ambiguity», «owns reliability of one critical service» — measurable, comparable.
- **Multiple tracks (IC и manager) — minimal требование для зрелой org.** Единственный путь к staff через management — talented IC принуждаются в управление, в котором они плохи; или уходят. Зрелый ladder: branch при L5/L6 на IC track (staff / principal / distinguished) и manager track.

Подробнее:

**Levels не привязаны к compensation directly (или привязаны явно через bands).** «Каждый level автоматически = salary bump» разрушает leveling discussions: вместо «куда расту» становится «как получить деньги»; руководители боятся promote, потому что compensation не resolves; promotion case пишется под compensation, а не под scope. Salary bands привязываются к levels, но через явные org-level bands (level 5 = $X-Y band), не «один level = одна цифра».

**Quarterly conversations referencing ladder, а не один раз в год перед review.** Ladder, который открывается раз в год, не используется. Инженер не понимает в течение года, как прогрессирует; руководитель не имеет evidence для решения. Каждое 1:1 — момент referencing ladder; каждое quarterly check-in — short self-calibration. По моим наблюдениям, разница между командами, у которых ladder работает, и теми, у кого нет, — именно в частоте обращения.

**Calibration regular (полугодие — норма), а не subjective by manager.** Каждый руководитель интерпретирует ladder по-своему — через 6 месяцев team A и team B имеют разные «L5», несовместимые expectations, unfair promotions, unstable salary bands. Calibration meeting: руководители вместе ревьюят свои recommended levels, спорят, договариваются о shared interpretation; обновляют ladder если различия структурные.

**Promotion case пишется и ревьюится кросс-командно, не «по личному знанию руководителя».** Руководитель рекомендует promotion, никто из других teams не видит обоснования — promotions могут случаться на личных отношениях / visibility / lucky projects. Cross-team promotion review (small committee из senior managers + IC) даёт independent perspective.

## Связанные листья

- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — onboarding curriculum обычно maps к L3 → L4 progression в первый год; without ladder onboarding не имеет clear endpoint.
- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — ritual, в котором ladder живёт: growth conversations на 1:1 — основной способ обсуждать прогресс по ladder вне formal review-cycle.
- **[Personal Growth Plan](/The-Way-of-SRE/leaves/practices/personal-growth-plan/)** — personal-level артефакт, target state обычно формулируется как «достижение L5 expectations»; ladder — input для plan.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — leveling в Embedded SRE / Consulting SRE моделях может отличаться.

## Открытые вопросы

- **Performance Review Cycle** *(TBD)* — ритуал, обращающийся к ladder для решений о promotion / rating.
- **Calibration Meeting structure** — как именно проходит calibration (cadence, attendees, format).
- **Salary Bands связь с ladder** — отдельная org-level подтема (HR-side); шире scope.
- **Promotion Case formats** — детальная схема (one-pager, evidence references, peer endorsements).
- **Ladder evolution governance** — кто и как обновляет, как избежать churn от частых правок.
