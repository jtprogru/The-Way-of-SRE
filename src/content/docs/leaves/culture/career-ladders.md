---
title: Career Ladders
description: Документированная система уровней и переходов — expectations per level + критерии promotion. Артефакт org-level, который engineer читает, manager использует, calibration уточняет
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Organisational Capability Development / Career Ladders
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Документированная система **уровней** инженерных ролей и **критериев переходов** между ними: expectations per level (skills, scope, impact, behaviours), и явные signals того, что нужно для promotion. Это **организационный артефакт** — org поддерживает (HR + engineering leadership), engineer читает чтобы понять, что от него ожидают, manager использует для review и promotion decisions, calibration meeting уточняет применение между командами. Соседний лист к [SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/) под L1 `Organisational Capability Development`; оба — про инфраструктуру роста инженеров на org-уровне.

## Что должен уметь

- **L3** — Знает, где живёт ladder-документ команды/org; находит на нём свой текущий уровень и читает expectations следующего; понимает, какие именно поведения / артефакты ожидаются.
- **L3** — Регулярно (минимум quarterly) перечитывает ladder для self-positioning: что из expectations следующего уровня уже закрывает, что — нет, в чём gap.
- **L4** — Использует ladder в 1:1 conversations: формулирует growth-вопросы конкретно — «вот expectations L5, такие пункты я закрываю на работе через X / Y / Z, эти — нет; как двинуться?»; обсуждает с manager'ом, а не угадывает.
- **L4** — Даёт peer-feedback со ссылкой на ladder («это уже L5-level scope decision», «здесь не хватает behaviour из L5 — multi-team influence»); ladder становится shared vocabulary.
- **L5** — Калибрует собственное self-assessment с командной нормой через calibration meeting (полугодие — норма): где team аgree, где разные, какие expectations интерпретируются по-разному; результат → правки ladder'а.
- **L5** — Если играет роль manager / tech lead: использует ladder для promotion decisions, документирует промоушн как явный case ссылающийся на конкретные expectations + evidence (artifacts, projects, behaviours).
- **L5** — Пишет promotion case на одну страницу: для какого уровня, какие expectations закрыты конкретными примерами, какие открытые вопросы; ревьюится кросс-командно.
- **L6+** — Проектирует / обновляет ladder для org-области: балансирует specialist (deep technical) vs generalist (cross-team), IC track vs manager track (single ladder через level N → branch), какие artifacts считаются evidence на каждом уровне.
- **L6+** — Поддерживает ladder во времени: industry shifts (AI-era, platform-engineering era) приходят за expectations; ladder evolves; при этом не ломаются уже выданные commitments (engineer'ы, оказавшиеся на «старой» формулировке уровня, не теряют ранг).

## Материалы

### Книги

- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). База: путь staff/principal engineer для individual contributor — archetypes (tech lead / architect / solver / right-hand), стратегии достижения staff-level scope. Помогает понять, как формулируются expectations за пределами senior'а.
- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). База: главы про performance review, calibration, promotion decisions — manager'ская сторона работы с ladder'ом.
- Lara Hogan — **Resilient Management** (A Book Apart, 2019). Дополнительно: leveling guides, equitable feedback, calibration practices без bias.

### Статьи и фреймворки

- **[Progression.fyi](https://progression.fyi/)**. База: публичная коллекция 75+ career ladders от различных компаний (CircleCI, Medium, Monzo, Rent The Runway, GOV.UK и др.). Главный практический ресурс перед написанием собственной ladder — как референс структуры, языка expectations, балансировки tracks. Активный сайт.
- **[SFIA — Skills Framework for the Information Age](https://sfia-online.org/en)**. База: канонический международный framework с 7 уровнями responsibility (от L1 follow до L7 set strategy); описание навыков и поведения на каждом уровне. Подходит как foundation для собственной ladder в IT-командах.

### Инструменты

- **Markdown в org / engineering repo** (или Notion / wiki) — самый простой формат: один документ, секции per-level, behavioral expectations + evidence examples. PR-based review для изменений ladder'а, public для всей engineering.
- **Calibration template** — структурированный документ для calibration meeting: список engineer'ов под рассмотрение, рекомендуемый уровень от manager'а, evidence references, заметки calibration committee, решение и обоснование. Versioned for audit.
- **Self-assessment worksheet** — структурированный формат для engineer'а перед performance review: expectations level by level, self-rating «meets / partial / not yet» с конкретными artifacts.

## Best practices

- **Ladder документирован и публичен внутри engineering, а не «у руководителя в голове».** Антипаттерн: «вырастешь — посмотрим». Engineer не понимает, что от него требуется, тратит силы не на то, и в моменте promotion-decision получает feedback который «никогда не звучал в 1:1» (см. no surprises rule в One-on-Ones). Documented ladder делает expectations предсказуемыми; внутренне публичный = transparent across teams.
- **Specific behavioral expectations, а не «должен иметь impact».** Антипаттерн: vague формулировки типа «senior должен иметь large impact» — не операционализуемо, evaluator интерпретирует субъективно, engineer не знает, как закрыть. Хорошие ladders формулируют поведенчески: «independently drives features through ambiguity», «mentors at least N junior engineers», «owns reliability of one critical service», «contributes to architecture decisions через ADR» — measurable, comparable.
- **Levels не привязаны к compensation directly (или привязаны явно через bands).** Антипаттерн: каждый level автоматически = salary bump. Это разрушает leveling discussions: вместо «куда расту» становится «как получить деньги»; manager'ы боятся promote, потому что compensation не resolves; engineer'ы пишут promotion case с тем, что нужно для compensation, а не что отражает actual scope. Salary bands привязываются к levels, но через явные org-level bands (level 5 = $X-Y band), не «один level = одна цифра».
- **Multiple tracks (IC и manager) — minimal требование для зрелой org.** Антипаттерн: единственный путь к staff через manager. Talented IC принуждаются в management как единственный путь карьерного роста, и или плохо менеджат, или уходят. Зрелый ladder: branch при L5/L6 на IC track (staff / principal / distinguished) и manager track (EM / senior EM / director); equivalent в scope, в compensation, в influence — different in nature of work.
- **Quarterly conversations referencing ladder, а не один раз в год перед review.** Антипаттерн: ladder открывается раз в год при performance review. Engineer не понимает в течение года, как он прогрессирует; manager не имеет evidence для решения. Каждое 1:1 — момент referencing ladder; каждое quarterly check-in — short calibration с самим собой.
- **Calibration regular (полугодие — норма), а не subjective by manager.** Антипаттерн: каждый manager интерпретирует ladder по-своему. Через 6 месяцев team A и team B имеют разные «L5» — несовместимые expectations, unfair promotions, unstable salary bands. Calibration meeting: managers вместе ревьюят свои recommended levels, спорят, договариваются о shared interpretation; обновляют ladder если различия структурные.
- **Promotion case пишется и ревьюится кросс-командно, не «по личному знанию manager'а».** Антипаттерн: manager рекомендует promotion, никто из других teams не видит обоснования. Случаются promotions на основе личных отношений / visibility / lucky projects вместо actual level. Cross-team promotion review (small committee из senior managers + IC) даёт independent perspective, повышает справедливость и качество.

## Связанные листья

- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — сосед под тем же L1 `Organisational Capability Development`. Onboarding curriculum обычно maps к L3 → L4 progression в первый год; without ladder onboarding не имеет clear endpoint.
- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — ritual, в котором ladder живёт: growth conversations на 1:1 — основной способ обсуждать прогресс по ladder'у вне formal review-cycle.
- **[Personal Growth Plan](/The-Way-of-SRE/leaves/practices/personal-growth-plan/)** — personal-level артефакт, target state в котором обычно формулируется как «достижение L5 expectations» или «закрытие конкретных gaps»; ladder — input для plan'а.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — leveling в Embedded SRE / Consulting SRE моделях может отличаться; ladder должна явно покрывать engagement-варианты или оставлять открытые формулировки.

## Открытые вопросы

- **Performance Review Cycle** *(TBD)* — уже упоминалось в open questions у `One-on-Ones`. Ритуал, который обращается к ladder для решения о promotion / rating; самостоятельная подтема внутри Performance Management.
- **Calibration Meeting structure** — отдельная подтема под Career Ladders: как именно проходит calibration (cadence, attendees, format), какие decisions принимаются, как избежать manager-bias. Возможно отдельный лист.
- **Salary Bands связь с ladder** — отдельная org-level подтема (HR-side); тесно связана, но scope шире (внешние benchmarks, geo-adjustments, equity). Обычно вне SRE-roadmap.
- **Promotion Case formats** — детальная схема promotion case (one-pager, evidence references, peer endorsements) — потенциальная часть углублённой версии или отдельный лист.
- **Ladder evolution governance** — кто и как обновляет ladder, как избежать «churn» от частых правок, как не сломать commitments к существующим engineer'ам. Самостоятельная подтема на стыке OCD и `IT Management`.
