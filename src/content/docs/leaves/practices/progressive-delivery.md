---
title: Progressive Delivery
description: Выкатка изменений малыми долями с health gate и автоматическим rollback по SLO burn rate
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Change Management / Progressive Delivery
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Deploy сразу всем» — паттерн, который я регулярно вижу в командах без progressive delivery, и почти всегда из него растут production-инциденты с большим blast radius. Progressive Delivery — это **дисциплина** выкатки изменений малыми долями с возможностью наблюдать и откатиться: code deploy через [canary](/The-Way-of-SRE/glossary/#canary-release) с явным SLI health gate, feature flags отделяют момент release от deploy, rollback автоматизирован по burn rate, не «нажмём кнопку». Главная практика внутри L1 `Change Management`.

## Что должен уметь

Главный навык на уровне L5 — реализовать **автоматический rollback по SLO burn rate**, а не «manual decision во время инцидента». Я регулярно вижу команды с canary без auto-rollback — engineer смотрит дашборд, решает в моменте остановить или продолжить. Когнитивная нагрузка + reaction time → real customer impact, иногда минуты разницы. Auto-rollback по burn rate threshold снимает решение с человека, который в момент инцидента работает хуже всего.

- **L3** — Понимает разницу между rolling update, canary, blue-green и feature flag rollout; различает «deploy» и «release».
- **L3** — Запускает деплой по существующему pipeline команды; знает, как откатить через документированную rollback procedure.
- **L4** — Настраивает canary release для своего сервиса: traffic % steps (5 / 25 / 50 / 100), health gate по error rate или p99 latency, длительность каждой фазы.
- **L4** — Использует feature flags для отделения deploy от release: код в проде, но функциональность включается отдельным toggle для cohort / процента трафика / внутренних пользователей.
- **L5** — Проектирует rollout policy для сервиса: явные SLI gates, time windows, blast radius.
- **L5** — Реализует автоматический rollback по SLO burn rate или health check failure; не требует ручного вмешательства в обычных случаях.
- **L5** — Координирует rollout критичных изменений с непрямым кодовым путём (DB schema migration, config schema change): backward-compatible шаг → code change → forward-only cleanup.
- **L6+** — Внедряет progressive delivery как стандарт для команды/org: pipeline templates, training, метрики DORA.
- **L6+** — Балансирует velocity vs safety: где можно ослабить gate, где усилить.

## Материалы

### Книги

- Jez Humble, David Farley — **Continuous Delivery** (Addison-Wesley, 2010). Фундамент дисциплины частых, безопасных, автоматизированных выкаток.
- Nicole Forsgren, Jez Humble, Gene Kim — **Accelerate** (IT Revolution, 2018). DORA-эмпирика на связь deployment frequency / change failure rate / MTTR с org performance.
- Gene Kim, Jez Humble, Patrick Debois, John Willis — **The DevOps Handbook**, 2-е изд. (IT Revolution, 2021). Deployment patterns в широком DevOps-контексте.

### Статьи

- Martin Fowler — **[CanaryRelease](https://martinfowler.com/bliki/CanaryRelease.html)**. Каноническое определение canary как deployment strategy.
- Pete Hodgson — **[Feature Toggles (Feature Flags)](https://martinfowler.com/articles/feature-toggles.html)** (martinfowler.com). Четыре категории toggles (release / experiment / ops / permissioning), best practices по управлению карьерой флага.

### Инструменты

- **[Argo Rollouts](https://argoproj.github.io/argo-rollouts/)** — Kubernetes-native controller для canary / blue-green; интеграция с Prometheus / Datadog для metric-driven promotion и automated rollback.
- **[Flagger](https://flagger.app/)** — progressive delivery operator поверх service mesh (Istio, Linkerd) с SLI-driven traffic shifting.
- **[Unleash](https://www.getunleash.io/)** — open-source feature flags platform. По моим наблюдениям, чаще выбирают для self-hosted сценариев.
- **LaunchDarkly** — коммерческая feature flags платформа с расширенными targeting / experimentation. Полезна, когда команда выходит за десятки активных флагов и нужен enterprise SSO / audit.
- **Spinnaker** / **Argo CD** / **Flux** — deployment orchestration; не сами по себе делают progressive delivery, но дают pipeline-обвязку для Argo Rollouts / Flagger.

## Best practices

**Короткие правила:**

- **Deploy ≠ release.** Feature flag отделяет момент выкатки кода (низкий риск) от момента включения функциональности (высокий риск). Сначала проверяем, что код работает в проде в выключенном состоянии; затем включаем для cohort / % traffic / internal users; в случае проблем — выключаем flag, не откатывая deploy.
- **Canary всегда с health gate, не «постоит часик».** Ручное продвижение по таймеру — антипаттерн. Гейт = явное условие на SLI / burn rate / error rate; если 5% трафика держит SLO в течение N минут — pipeline автоматически продвигает; если нет — auto-rollback.
- **Rollback должен быть проще, чем roll-forward.** «Сейчас докатим фикс быстрее, чем откатим» — в инциденте мозг работает хуже; написание fix под давлением — самый рискованный момент. Откат — однострочный command или PR revert, готовый и проверенный *до* деплоя.

Подробнее:

**Blast radius явно ограничен на каждом шаге.** «Новый код сразу на всех» — антипаттерн, который особенно дорого стоит при breaking changes в hot path. Канарейка по доле трафика (5/25/50/100%), по геозоне (один регион → весь), по cohort (внутренние → beta → все). Цель — чтобы баг увидели единицы, а не миллионы. По моим наблюдениям, разница между «canary 5%» и «full rollout» в blast radius — это разница между «postmortem» и «public PR-disaster».

**DB / config schema changes — отдельный паттерн, не «один deploy».** Schema migration + code change в одном deploy → rollback ломает данные. Норма: сначала backward-compatible schema (старый и новый код могут читать оба варианта); затем code change; затем forward-only cleanup (удаление старых колонок / полей) — отдельным deploy через недели после стабилизации. Команды, которые делают schema migration в одном PR с code change, в первый же rollback теряют данные.

**Pre-deployment checklist для high-risk изменений, не «всё на ревью PR».** Data migration / security-critical / customer-facing breaking changes через тот же поток, что typo в README — антипаттерн. Для high-risk — отдельный pre-deploy review (явный список рисков, rollback plan, communication plan); для low-risk — обычный PR + auto-deploy. Severity-based triage экономит время на низком риске и фокусирует внимание на высоком.

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса отвечает за deploy; каталог фиксирует rollout policy.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — rollback procedure для каждого сервиса — обязательный runbook; качество определяет MTTR при сбое деплоя.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — rollback во время инцидента — стандартный mitigation.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — burn rate в canary phase = health gate; алертинг — основа auto-rollback.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLO определяет, насколько safe canary phase; без явного SLO health gate настроить нельзя.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — Argo Rollouts (с ArgoCD) и Flagger (с Flux) — GitOps-нативные tools для progressive delivery.
- **[Test Strategy](/The-Way-of-SRE/leaves/engineering/test-strategy/)** — pre-deploy tests vs canary как runtime test; дополняют друг друга.
- **[Change Governance](/The-Way-of-SRE/leaves/practices/change-governance/)** — *техника* deployment (этот лист) и *policy / process* (governance) — соседние практики. Canary без явного change classification — half practice.

## Открытые вопросы
- **Rollback Discipline** *(TBD)* — углублённая тема: rollback testing (regular fire drills), automated rollback testing in CI, time-to-rollback как метрика.
- **Database Migration Patterns** — детальная схема (expand-contract, dual-write, backfill, shadow read).
