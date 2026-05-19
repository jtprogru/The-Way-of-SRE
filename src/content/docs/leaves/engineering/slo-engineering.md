---
title: SLO Engineering
description: Инженерная сторона SLO — определение SLI, формализация SLO, инструментирование сервиса, расчёт error budget
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / SLO Engineering
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Инженерная сторона SLO: **определение SLI**, формализация SLO, инструментирование сервиса, расчёт error budget. Не путать с `SLO / Budget Review` (Culture/Measurement — регулярный ритуал ревью с принятием решений по бюджету) и `SLI-based Alerting` (Engineering/Observability — построение алертов поверх SLO). Этот лист — про то, как SLI и SLO **рождаются**: какие события считать, как обосновать таргет, какую observability-инфраструктуру построить под расчёт error budget.

## Что должен уметь

- **L3** — Различает SLI / SLO / SLA. Читает чужие SLO-описания и понимает, что они формализуют: какие события считаются good, что значит «нарушение», как считается burn rate.
- **L3** — Читает существующие SLO своей команды; в инциденте может сказать, какие SLO под угрозой и сколько бюджета осталось.
- **L4** — Записывает SLI как отношение `good events / valid events`. Обосновывает выбор знаменателя (что считать «валидным» событием) и пишет это в SLO-документе сервиса.
- **L4** — Определяет простой SLO для одного сервиса (availability и/или latency); выбирает SLI window (rolling 28-day vs calendar month vs sliding) и обосновывает выбор.
- **L5** — Проектирует набор SLI для сервиса целиком: для онлайн-сервиса — RED (rate / errors / duration), для batch / pipeline — freshness, throughput, correctness; для пользовательского flow — composite по user journey, а не по endpoint'ам.
- **L5** — Инструментирует сервис: на стороне клиента (synthetic, RUM) там, где это возможно; на серверной стороне — через Prometheus client / OpenTelemetry SDK; пишет recording rules для агрегации SLI на разных окнах.
- **L5** — Декомпозирует составной запрос на компонентные SLI (front + auth + business logic + storage) и понимает, какой SLI ловит, какую часть деградации.
- **L6+** — Внедряет SLO-инфраструктуру в команде: recording rules в Prometheus или эквивалент, дашборды burn rate / error budget remaining, error budget calculation как код (sloth/pyrra/Nobl9), документированная Error Budget Policy.
- **L6+** — Согласует SLO target с business expectations: 99.99% vs 99.9% — это разница в dollar cost инфраструктуры и в требованиях к команде; обосновывает выбор через user pain и cost, не «99.9% потому что круто».

## Материалы

### Книги

- Alex Hidalgo — **Implementing Service Level Objectives** (O'Reilly, 2020). База: главы 1–6 — от определения SLI до error budget calculations. Главный практический источник.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/implementing-slos/)** (O'Reilly, 2018), глава 2 «Implementing SLOs». База: канонический Google-подход к SLO-инжинирингу.
- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/service-level-objectives/)** (O'Reilly, 2016), глава 4 «Service Level Objectives». База терминологии SLI/SLO/SLA и фундаментальные модели.

### Статьи и доклады

- Betsy Beyer et al. — **[Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)** (SRE Workbook, гл. 5). База: связь SLO Engineering с alerting strategy (multi-window multi-burn-rate).
- Betsy Beyer et al. — **[Appendix B. Example Error Budget Policy](https://sre.google/workbook/error-budget-policy/)** (SRE Workbook). Дополнительно: готовый шаблон Error Budget Policy, на котором закрепляется SLO Engineering на org-уровне.
- Štěpán Davidovič — **Reliable Math** (SREcon). Продвинуто: математика SLO и burn rate — что значат 99.9%, как считать composite SLI без накопления погрешности.

### Инструменты

- **[Prometheus](https://prometheus.io/)** — recording rules для SLI, alerting rules для burn rate. Канонический стек.
- **[Sloth](https://sloth.dev/)** — генератор PromQL для SLO и burn-rate алертов из декларативного YAML. Стандартизирует SLI/SLO между сервисами и упрощает onboarding.
- **[Pyrra](https://github.com/pyrra-dev/pyrra)** — открытая платформа для управления SLO поверх Prometheus: dashboard error budget, multi-burn-rate alerts, Kubernetes operator для SLO-объектов.
- **[OpenSLO](https://openslo.com/)** — vendor-agnostic YAML-спецификация для SLO-as-code; CLI `oslo` для validation в GitOps-флоу.
- **[Nobl9](https://nobl9.com/)** — коммерческая платформа управления SLO поверх любого мониторинга (Prometheus / Datadog / New Relic / др.). Полезна для cross-team SLO governance.

## Best practices

- **Знаменатель SLI важнее числителя.** Антипаттерн: «good events» обсуждают часами, «valid events» забывают. Не отфильтровав ботов, healthcheck'и, известно-плохие клиенты и операции в maintenance window, получаешь SLO, который **никогда не нарушается или нарушается всегда** — в обоих случаях ритуал ревью бессмыслен.
- **SLI считается на стороне клиента, когда это возможно.** Антипаттерн: метрики только серверные. Они не знают про DNS, балансировщик, сетевую деградацию, TLS-handshake фейлы. Синтетика (probe из сторонних регионов) и RUM (telemetry с реальных клиентов) ближе к пользовательскому опыту; серверные метрики дополняют, не заменяют.
- **Начинай с одного SLI на один сервис.** Антипаттерн: попытка покрыть всё сразу — 50 SLI на 50 endpoint'ов, никто в них не разбирается, ревью превращается в чтение pieш. Запусти один корректный SLI (availability или p99 latency на ключевом endpoint), проведи через первый SLO Review, отшлифуй процесс. Потом расширяй.
- **SLI per user journey, не per endpoint.** Антипаттерн: SLI на каждый HTTP-маршрут — нечитаемо и не отражает пользовательский опыт. Пользователь не знает про endpoint'ы; он знает про действие («оплата прошла», «поиск работает»). SLI формулируется как composite по user journey, агрегируя метрики компонентов, через которые проходит запрос.
- **SLO target — из business pain, а не «99.99% потому что круто».** Антипаттерн: target скопирован из чужого SLO без анализа. Каждая девятка стоит дороже: 99% → 99.9% → 99.99% — это не просто числа, а разница в стоимости инфраструктуры, требованиях к команде, частоте инцидентов. Обоснование: при каком SLI пользователь начинает уходить / жаловаться / терять деньги — это и есть target.
- **Composite SLO осторожно: формула не очевидна.** Антипаттерн: «SLO = product(component SLOs)» в лоб. Реальная формула зависит от того, последовательно или параллельно используются компоненты, как они коррелированы, есть ли retry'и. Composite SLO считается через симуляцию или явный анализ зависимостей, а не наивным умножением.

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — алертинг строится поверх SLO Engineering; качество алертов прямо зависит от качества SLI и выбора burn rate windows.
- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — ритуал, потребляющий данные SLO Engineering; без работающего ритуала SLO остаются техническим артефактом без влияния на приоритеты.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — большинство SLI строятся на сетевых метриках (latency, error rate, DNS); знание networking-стека определяет, что измеримо корректно.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — инструментирование SLI требует кода в сервисе (Prometheus client, OpenTelemetry SDK); качество SLI упирается в идиомы языка.

## Открытые вопросы

- **Composite SLO methodology** — нет канонической формулы для составления SLO из компонентов; реальные команды решают через симуляцию, эмпирические измерения или эвристики. Возможно, отдельный лист или раздел при углублении ветви.
- **Real-time vs synthetic SLI** — когда какие, в какой комбинации, как избежать gap'ов между ними при выборе. Связано с пробами в `Networking` и observability-инструментированием в `SLI-based Alerting`.
- **Capacity Planning** *(TBD)* — capacity planning опирается на SLO как на reliability-таргет: при каком load целевой SLO ещё держится. Возможный соседний лист под `Reliability Engineering` L1.
