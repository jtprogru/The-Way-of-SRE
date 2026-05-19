---
title: Progressive Delivery
description: Дисциплина выкатки production-изменений малыми долями с health gate и автоматическим rollback — canary, feature flags, blue-green, gradual rollouts
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Change Management / Progressive Delivery
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Дисциплина выкатки production-изменений **малыми долями с возможностью наблюдать и откатиться**. Замена «deploy all at once → молимся» на canary releases / feature flags / blue-green / gradual rollouts с автоматическим rollback по SLO burn rate или health check failure. Главная практика внутри L1 `Change Management`; соседние практики (Pre-Deployment Review, Rollback Discipline) — в «Открытых вопросах» как возможные следующие листья.

## Что должен уметь

- **L3** — Понимает разницу между rolling update, canary, blue-green и feature flag rollout; различает «deploy» и «release» (выкатка кода vs включение функциональности).
- **L3** — Запускает деплой по существующему pipeline команды; знает, как откатить через документированную rollback procedure (одна команда / один PR revert / kubectl rollout undo).
- **L4** — Настраивает canary release для своего сервиса: traffic % steps (например, 5 / 25 / 50 / 100), health gate по error rate или p99 latency, длительность каждой фазы.
- **L4** — Использует feature flags для отделения deploy от release: код в проде, но функциональность включается отдельным toggle для cohort / процента трафика / внутренних пользователей.
- **L5** — Проектирует rollout policy для сервиса: явные SLI gates (например, burn rate < 2× за окно canary), time windows, blast radius (по доле трафика / геозоне / cohort).
- **L5** — Реализует автоматический rollback по SLO burn rate или health check failure; не требует ручного вмешательства в обычных случаях деградации.
- **L5** — Координирует rollout критичных изменений с непрямым кодовым путём (DB schema migration, config schema change): backward-compatible шаг → code change → forward-only cleanup. Никогда не одним deploy'ем.
- **L6+** — Внедряет progressive delivery как стандарт для команды/org: pipeline templates, training, метрики (lead time for changes, change failure rate, MTTR — DORA-метрики).
- **L6+** — Балансирует velocity vs safety: где можно ослабить gate (низкоrisk-сервисы, обратимые изменения), где усилить (data-mutating, customer-facing breaking changes); защищает policy от давления «быстрее закатим».

## Материалы

### Книги

- Jez Humble, David Farley — **Continuous Delivery** (Addison-Wesley, 2010). База: фундамент дисциплины частых, безопасных, автоматизированных выкаток.
- Nicole Forsgren, Jez Humble, Gene Kim — **Accelerate** (IT Revolution, 2018). База: DORA-эмпирика на связь deployment frequency / change failure rate / MTTR с org performance.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — **The DevOps Handbook**, 2-е изд. (IT Revolution, 2021). Дополнительно: deployment patterns в широком DevOps-контексте.

### Статьи

- Martin Fowler — **[CanaryRelease](https://martinfowler.com/bliki/CanaryRelease.html)**. База: каноническое определение canary как deployment strategy.
- Pete Hodgson (на сайте Martin Fowler) — **[Feature Toggles (Feature Flags)](https://martinfowler.com/articles/feature-toggles.html)**. База: четыре категории toggles (release / experiment / ops / permissioning), best practices по управлению карьерой флага (decision logic, inversion of control, expiration dates).

### Инструменты

- **[Argo Rollouts](https://argoproj.github.io/argo-rollouts/)** — Kubernetes-native controller для canary / blue-green / progressive delivery; интеграция с Prometheus / Datadog для metric-driven promotion и automated rollback.
- **[Flagger](https://flagger.app/)** — progressive delivery operator для Kubernetes; canary / A/B / blue-green поверх service mesh (Istio, Linkerd) с SLI-driven traffic shifting и автоматическим rollback.
- **[Unleash](https://www.getunleash.io/)** — open-source feature flags platform с SDK для всех основных языков; self-hosted или managed; работает как kill switch и gradual rollout control.
- **LaunchDarkly** — коммерческая feature flags платформа с расширенными targeting / experimentation capabilities. Полезна, когда команда выходит за десятки активных флагов и нужен enterprise SSO / audit.
- **Spinnaker** / **Argo CD** / **Flux** — deployment orchestration и GitOps; не сами по себе делают progressive delivery, но дают pipeline-обвязку для Argo Rollouts / Flagger.

## Best practices

- **Deploy ≠ release.** Антипаттерн: «деплой выкатил — функциональность сразу у всех пользователей». Feature flag отделяет момент выкатки кода (низкий риск) от момента включения функциональности (высокий риск). Сначала проверяем, что код работает в проде в выключенном состоянии; затем включаем для cohort / % traffic / internal users; в случае проблем — выключаем flag, не откатывая deploy.
- **Canary всегда с health gate, не «постоит часик».** Антипаттерн: ручное продвижение по таймеру или человеком на ощупь. Гейт — это явное условие на SLI / burn rate / error rate; если 5% трафика держит SLO в течение N минут — pipeline автоматически продвигает дальше; если нет — автоматический rollback. Человек принимает решения только в неоднозначных случаях.
- **Rollback должен быть проще, чем roll-forward.** Антипаттерн: «сейчас докатим фикс быстрее, чем откатим». В инциденте мозг работает хуже; написание fix под давлением — самый рискованный момент. Откат — однострочный command или PR revert, готовый и проверенный *до* деплоя, а не сочинённый во время инцидента.
- **Blast radius явно ограничен на каждом шаге.** Антипаттерн: «новый код сразу на всех». Канарейка по доле трафика (5/25/50/100%), по геозоне (один регион → весь), по cohort (внутренние пользователи → beta-тестировщики → все). Цель — чтобы баг видели единицы, а не миллионы.
- **DB / config schema changes — отдельный паттерн, не «один deploy».** Антипаттерн: schema migration + code change в одном deploy → rollback ломает данные. Норма: сначала backward-compatible schema (старый и новый код могут читать оба варианта); затем code change; затем forward-only cleanup (удаление старых колонок / полей) — отдельным deploy через недели после стабилизации.
- **Pre-deployment checklist для high-risk изменений, не «всё на ревью PR».** Антипаттерн: data migration / security-critical / customer-facing breaking changes через тот же поток, что typo в README. Для high-risk — отдельный pre-deploy review (явный список рисков, rollback plan, communication plan), для low-risk — обычный PR + auto-deploy. Severity-based triage экономит время и focuses внимание.

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса отвечает за deploy: каталог фиксирует rollout policy, on-call rotation для приёма rollback alert'ов.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — rollback procedure для каждого сервиса — обязательный runbook; качество runbook'а определяет MTTR при сбое деплоя.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — rollback во время инцидента — стандартный mitigation; progressive delivery снижает вероятность инцидента, но не исключает.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — burn rate в canary phase = health gate; алертинг на burn rate — основа автоматического rollback.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLO определяет, насколько safe canary phase; без явного SLO health gate настроить нельзя.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — реализация feature flag SDK в коде сервиса; идиомы языка определяют, насколько чистым получится код с флагами.

## Открытые вопросы

- **Pre-Deployment Review** *(TBD)* — другая практика внутри `Change Management` L1: для high-risk изменений (data migration / security / regulatory). Сейчас упомянуто как best practice; возможно отдельный лист при углублении ветви.
- **Rollback Discipline** *(TBD)* — углублённая тема: rollback testing (regular fire drills), automated rollback testing in CI, time-to-rollback как метрика. Сейчас часть этого листа; при накоплении опыта — возможно отдельный лист под `Change Management`.
- **Database Migration Patterns** — детальная схема (expand-contract, dual-write, backfill, shadow read). Сейчас упомянуто как best practice; возможно отдельный лист на стыке с `Database Reliability` L1 (Engineering).
