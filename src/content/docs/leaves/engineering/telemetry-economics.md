---
title: Telemetry Economics
description: Управление ценностью и стоимостью метрик, логов и трейсов через cardinality, sampling, retention и бюджеты сигналов
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Observability / Telemetry Economics
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Один label с идентификатором пользователя, добавленный ради удобного дашборда, — самый частый способ вырастить счёт за observability, не меняя нагрузку. Я регулярно вижу этот сюжет в одном и том же порядке: строка проходит review как безобидная, число временных рядов растёт вместе с аудиторией, запросы к TSDB начинают отваливаться по таймауту, и только на этом шаге кто-то открывает billing. В документации Prometheus про это написано прямо: каждая уникальная комбинация label создаёт новый временной ряд, поэтому `user_id` и email не годятся как значения label. Проблема начинается с одной строки инструментации, а проявляется в storage, запросах и деньгах.

**Telemetry Economics** — инженерная дисциплина управления полезностью и полной стоимостью метрик, логов и трейсов: объём приёма, [cardinality](/The-Way-of-SRE/glossary/#cardinality), индексация, [sampling](/The-Way-of-SRE/glossary/#sampling), retention, вычисления, egress и время сопровождения. Это не общий [Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/): здесь единица решения — сигнал и путь telemetry от SDK до backend. И это не разрешение удалять данные вслепую ради экономии — после изменения команда должна проверить, что сохранила диагностику известных failure modes.

## Что должен уметь

Главный навык на уровне L5 — связать каждый крупный класс telemetry с потребителем, сроком хранения и измеримой стоимостью, а затем уменьшить объём без потери критичных сценариев расследования. Самая опасная оптимизация здесь — та, у которой есть экономия, но нет проверки диагностической ценности.

**L3**
- Оценивает суточный входящий объём по формуле `events/s × average bytes/event × 86 400` и отдельно помечает, что compression, replication и indexing изменят итоговую стоимость хранения.
- Находит неограниченные labels и attributes (`user_id`, email, request ID) и объясняет, почему их место — в логах или трейсах, а не в labels метрик.
- Читает usage и billing по сигналам: metrics, logs, traces; называет крупнейшие источники объёма для своего сервиса.

**L4**
- Задаёт бюджет сигнала для сервиса: допустимый ingest, cardinality, retention и владелец; настраивает уведомление о выходе за бюджет.
- Применяет фильтрацию, агрегацию, relabeling и разные сроки хранения по классам данных; документирует, что удаляется и зачем.
- Выбирает head sampling или tail sampling для трейсов, фиксирует правило и проверяет сохранение ошибок, высокой задержки и редких бизнес-критичных путей.
- Сравнивает объём и качество диагностики до и после изменения на одинаковом окне нагрузки.

**L5**
- Проектирует путь telemetry через OpenTelemetry Collector или эквивалентный слой: limits, backpressure, batching, routing, sampling и наблюдаемость самого pipeline.
- Вводит квоты и showback по `team / service / environment`, не смешивая production и эфемерные окружения в одном неразличимом счёте.
- Сравнивает managed и self-hosted варианты по TCO: compute, storage, replication, egress, лицензии и инженерное сопровождение.
- Определяет SLO pipeline telemetry: допустимые потери, задержка экспорта и поведение при перегрузке для каждого сигнала.

**L6+**
- Задаёт организационную политику для cardinality, retention, sampling, PII-redaction и исключений; каждое исключение имеет владельца и срок пересмотра.
- Связывает расходы с полезностью: стоимость по сервису и сигналу, использование дашбордами и алертами, подтверждённые сценарии расследований.
- Проектирует переносимость telemetry и exit plan, чтобы смена backend не требовала повторной инструментации всех сервисов.

## Материалы

### Книги

- Charity Majors, Liz Fong-Jones, George Miranda — **[Observability Engineering](https://www.oreilly.com/library/view/observability-engineering/9781492076438/)** (O'Reilly, 2022). Не книга про FinOps, но полезна для оценки диагностической ценности высококонтекстных событий; читать вместе с документацией конкретного pipeline и его billing model.

### Статьи и документация

- Prometheus — **[Metric and label naming](https://prometheus.io/docs/practices/naming/)**. Самый короткий обязательный источник перед проектированием labels: прямо связывает уникальную комбинацию label с новым временным рядом и приводит примеры неограниченной cardinality.
- OpenTelemetry — **[Sampling](https://opentelemetry.io/docs/concepts/sampling/)**. Хорошая граница применимости: sampling уменьшает стоимость, но добавляет compute, сопровождение и риск потерять критичную информацию; отдельно разобраны head и tail sampling.
- OpenTelemetry — **[Scaling the Collector](https://opentelemetry.io/docs/collector/scaling/)**. По моим наблюдениям, topology review без этой страницы получается неполным: stateless processors и stateful tail sampling масштабируются по-разному, а неверное распределение spans может дать неполные traces.
- OpenTelemetry — **[Collector](https://opentelemetry.io/docs/collector/)**. Vendor-neutral слой приёма, обработки и экспорта telemetry; полезен как точка применения policy до отправки в backend.

### Инструменты

- **OpenTelemetry Collector** — центральный слой для routing, filtering, batching и sampling. По моим наблюдениям, к нему приходят не ради vendor neutrality, а когда надоедает менять правила фильтрации в десятке SDK вместо одного места. Его собственные queue, drop, latency и resource metrics входят в обязательную наблюдаемость pipeline.
- **Отчёты по series и labels на стороне backend** — первый инструмент поиска источников cardinality. Я вижу, что команды чаще обходятся встроенными средствами своего TSDB и берут отдельный анализатор редко: обычно тогда, когда backend такой отчёт не отдаёт вовсе.
- **Billing / usage export backend** — источник истины для unit cost по сигналу. Я регулярно вижу, что provider не отдаёт usage на уровне service/team; тогда showback приходится строить самому по resource attributes ещё до экспорта.

## Best practices

Самая простая проверка начинается не с миграции backend, а с таблицы `signal → producer → consumer → retention → daily volume → owner`. Я считаю отсутствие consumer и owner достаточной причиной для review, но не для мгновенного удаления: редкий сигнал может быть нужен только во время аварии, и это проверяется по runbook и прошлым расследованиям.

**Короткие правила:**

- **Budget до optimization.** Без baseline невозможно доказать экономию или заметить, что объём просто переехал из одного сигнала в другой.
- **Неограниченные идентификаторы не становятся labels метрик.** Request ID и user ID сохраняют контекст в логах или трейсах; в метриках используются ограниченные измерения.
- **Sampling — policy с тестом, а не процент.** Правило хранится как код, проходит review и проверяется на ошибках, высокой задержке и редких путях.

**Tail sampling не бесплатен.** Он может сохранить traces по итоговому error, latency или attribute, чего не умеет чистый head sampling, но требует state и осторожного масштабирования. Для низкого объёма или требований, запрещающих отбрасывание данных, OpenTelemetry прямо предлагает рассмотреть отказ от sampling.

**Telemetry pipeline — production-сервис.** Если Collector теряет данные при backpressure, проблема observability становится невидимой именно во время перегрузки. Поэтому его capacity, очереди, drops, export errors и latency получают владельца, SLO и проверяемое поведение при отказе backend.

**Сокращение retention не заменяет классификацию.** Короткоживущие debug-данные я отделяю от audit и incident evidence до того, как выбирать сроки. Юридические и договорные требования проверяются с владельцами compliance; универсального retention для всех сигналов нет.

## Связанные листья

- **[Cost Management](/The-Way-of-SRE/leaves/engineering/cost-management/)** — даёт общий FinOps-контур; этот лист уточняет unit economics observability pipeline.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — telemetry, питающую SLI и paging, нельзя удалять без проверки алертов и burn-rate расчёта.
- **[Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/)** — неиспользуемые сигналы и некачественные алерты создают одновременно cognitive и financial waste.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — нагрузка pipeline telemetry требует собственного capacity model, особенно для stateful sampling.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — quotas, retention и sampling policy должны быть reviewable и воспроизводимыми.

## Открытые вопросы

- Как оценивать option value сигнала, который редко запрашивают, но который оказался решающим в одном критическом расследовании?
- Как единообразно считать стоимость profiles рядом с metrics, logs и traces, пока поддержка профилей в экосистеме ещё развивается?
