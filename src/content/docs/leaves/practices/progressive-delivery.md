---
title: Progressive Delivery
description: Выкатка изменений малыми долями с health gate и автоматическим rollback по SLO burn rate
sfia: [3, 4, 5, 6]
status: draft
---

«Выкатим сразу всем» — так живут команды без progressive delivery, и я регулярно вижу, чем это заканчивается: инцидент в проде с blast radius во весь трафик. Progressive Delivery — это **дисциплина** выкатки малыми долями с возможностью посмотреть и откатиться. Код едет через [canary](/The-Way-of-SRE/glossary/#canary-release) с явным SLI health gate, feature flags отделяют момент release от момента deploy, а rollback срабатывает по burn rate, а не по чьей-то команде «жми кнопку». Главная практика внутри L1 `Change Management`.

## Что должен уметь

Главный навык на уровне L5 — реализовать **автоматический rollback по SLO burn rate**, а не «manual decision во время инцидента». Я регулярно вижу команды с canary без auto-rollback — инженер смотрит дашборд, решает в моменте остановить или продолжить. Когнитивная нагрузка + reaction time → real customer impact, иногда минуты разницы. Auto-rollback по burn rate threshold снимает решение с человека, который в момент инцидента работает хуже всего.

**L3**
- Понимает разницу между rolling update, canary, blue-green и feature flag rollout; различает «deploy» и «release».
- Запускает деплой по существующему pipeline команды; знает, как откатить через документированную rollback procedure.

**L4**
- Настраивает canary release для своего сервиса: traffic % steps (5 / 25 / 50 / 100), health gate по error rate или p99 latency, длительность каждой фазы.
- Использует feature flags для отделения deploy от release: код в проде, но функциональность включается отдельным toggle для cohort / процента трафика / внутренних пользователей.

**L5**
- Проектирует rollout policy для сервиса: явные SLI gates, time windows, blast radius.
- Реализует автоматический rollback по SLO burn rate или health check failure; не требует ручного вмешательства в обычных случаях.
- Координирует rollout критичных изменений с непрямым кодовым путём (DB schema migration, config schema change): backward-compatible шаг → code change → forward-only cleanup.

**L6+**
- Внедряет progressive delivery как стандарт для команды/org: pipeline templates, training, метрики DORA.
- Балансирует velocity vs safety: где можно ослабить gate, где усилить.

## Материалы

### Книги

- Jez Humble, David Farley — **Continuous Delivery** (Addison-Wesley, 2010). Фундамент дисциплины частых, безопасных, автоматизированных выкаток.
- Nicole Forsgren, Jez Humble, Gene Kim — **Accelerate** (IT Revolution, 2018). Эмпирическая основа исходной модели DORA; для текущих пяти метрик и failed deployment recovery time нужен [актуальный guide DORA](https://dora.dev/guides/dora-metrics/).
- Gene Kim, Jez Humble, Patrick Debois, John Willis — **The DevOps Handbook**, 2-е изд. (IT Revolution, 2021). Deployment patterns в широком контексте DevOps.

### Статьи

- Martin Fowler — **[CanaryRelease](https://martinfowler.com/bliki/CanaryRelease.html)**. Каноническое определение canary как deployment strategy.
- Pete Hodgson — **[Feature Toggles (Feature Flags)](https://martinfowler.com/articles/feature-toggles.html)** (martinfowler.com). Четыре категории toggles (release / experiment / ops / permissioning), best practices по управлению карьерой флага.

### Инструменты

- **[Argo Rollouts](https://argoproj.github.io/argo-rollouts/)** — нативный для Kubernetes контроллер под canary / blue-green; интеграция с Prometheus / Datadog для metric-driven promotion и automated rollback.
- **[Flagger](https://flagger.app/)** — progressive delivery operator поверх service mesh (Istio, Linkerd) с SLI-driven traffic shifting.
- **[Unleash](https://www.getunleash.io/)** — open-source feature flags platform. По моим наблюдениям, чаще выбирают для self-hosted сценариев.
- **LaunchDarkly** — коммерческая feature flags платформа с расширенными targeting / experimentation. Полезна, когда команда выходит за десятки активных флагов и нужен enterprise SSO / audit.
- **Spinnaker** / **Argo CD** / **Flux** — deployment orchestration; не делают progressive delivery сами по себе, но дают обвязку pipeline для Argo Rollouts и Flagger.

## Best practices

Deploy и release — разные события, и feature flag их разделяет. Сначала код едет в прод выключенным, и мы убеждаемся, что он там просто лежит и ничего не ломает. Потом функциональность включается — на когорту, на процент трафика, на внутренних пользователей. Если что-то пошло не так, флаг гасится, и откатывать выкатку не нужно вовсе.

Canary без health gate — это не canary, а «пусть постоит часик». Ручное продвижение по таймеру выглядит как осторожность. Проверяет оно ровно ничего. Гейт — это явное условие на SLI, burn rate или error rate: держит пять процентов трафика SLO заданное время — pipeline продвигает сам, не держит — сам же и откатывает.

Откат обязан быть проще, чем накат фикса. «Сейчас докатим быстрее, чем откатим» — фраза, после которой инцидент обычно удлиняется вдвое: под давлением человек пишет код хуже всего, а проверить его негде. Откат — это одна команда или заранее подготовленный revert, проверенный *до* деплоя, а не придуманный в момент пожара.

**Blast radius ограничен на каждом шаге.** Особенно дорого «сразу всем» обходится на breaking changes в горячем пути. Канарейка режется по доле трафика (5 / 25 / 50 / 100%), по геозоне (один регион, потом остальные), по когорте (внутренние, бета, все). Цель простая. Пусть баг увидят единицы, а не миллионы. По моим наблюдениям, разница между канарейкой на пяти процентах и выкаткой на весь трафик — это разница между внутренним постмортемом и публичным разбирательством.

**Изменения схемы БД и конфигов — отдельный паттерн, а не «ещё один deploy».** Миграция схемы и изменение кода в одном деплое означают, что откат сломает данные. Норма — три шага: сначала обратно совместимая схема, где старый и новый код читают оба варианта, затем изменение кода, и только потом, через недели после стабилизации, отдельный деплой с удалением старых колонок и полей. Команды, которые кладут миграцию в один PR с кодом, теряют данные на первом же откате.

**Для рискованных изменений — отдельный чеклист перед деплоем.** Миграция данных, правки в безопасности и breaking changes, которые видит клиент, не должны идти тем же путём, что опечатка в README. Для них — отдельный предварительный разбор: список рисков, план отката, план коммуникации. Всё остальное едет обычным PR с автодеплоем. Разбор по тяжести изменения экономит время на дешёвом и концентрирует внимание на дорогом.

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — owner сервиса отвечает за deploy; каталог фиксирует rollout policy.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — rollback procedure для каждого сервиса — обязательный runbook; качество определяет MTTR при сбое деплоя.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — rollback во время инцидента — стандартный mitigation.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — burn rate в canary phase = health gate; алертинг — основа auto-rollback.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — SLO определяет, насколько safe canary phase; без явного SLO health gate настроить нельзя.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — Argo Rollouts (с ArgoCD) и Flagger (с Flux) — нативные для GitOps инструменты progressive delivery.
- **[Test Strategy](/The-Way-of-SRE/leaves/engineering/test-strategy/)** — pre-deploy tests vs canary как runtime test; дополняют друг друга.
- **[Change Governance](/The-Way-of-SRE/leaves/practices/change-governance/)** — *техника* deployment (этот лист) и *policy / process* (governance) — соседние практики. Canary без явного change classification — half practice.
- **[DORA Metrics](/The-Way-of-SRE/leaves/culture/dora-metrics/)** — эффект progressive delivery проверяется по throughput и instability; для восстановления после неудачного deploy используется failed deployment recovery time, а не общий MTTR инцидентов.

## Открытые вопросы
- **Rollback Discipline** *(TBD)* — учения на откат, автоматическая проверка отката в CI, time-to-rollback как отдельная метрика.
- **Database Migration Patterns** *(TBD)* — детальная схема: expand-contract, dual-write, backfill, shadow read.

Отдельно висит граница. Всё описанное выше держится на измеримом SLI: canary упирается в health gate, а health gate — в то, что вообще меряется. На сервисах без метрик схема не работает, получается та же выкатка на всех, только в несколько шагов и с ложным чувством безопасности. Хорошего ответа тут у меня нет.
