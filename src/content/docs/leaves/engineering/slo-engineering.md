---
title: SLO Engineering
description: Инженерная сторона SLO — определение SLI, формализация SLO, инструментирование, расчёт error budget
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Reliability Engineering / SLO Engineering
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«99.9% потому что круто» — типичный SLO target, который я регулярно вижу. Каждая девятка стоит дороже на порядок: 99% → 99.9% → 99.99% — это разница в стоимости инфраструктуры, требованиях к команде, частоте инцидентов. Без обоснования через user pain target — это магическое число, и его никто не будет защищать на ревью бюджета. Лист — про **инженерную сторону**: как из бизнес-сигнала вывести SLI, как сформулировать SLO, как инструментировать. Не путать с [SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/) (ритуал ревью) и [SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/) (алерты поверх SLO).

## Что должен уметь

Главный навык на уровне L4 — записывать SLI как **отношение `good events / valid events`** и обосновывать выбор знаменателя. Знаменатель решает, **про что** SLO; неаккуратный знаменатель (включающий healthcheck, ботов, internal probes) делает SLO нерелевантным. Я регулярно вижу команды, которые часами обсуждают числитель и за 5 минут принимают решение по знаменателю — это перевернутая приоритизация.

- **L3** — Различает SLI / SLO / SLA. Читает чужие SLO-описания и понимает, что они формализуют.
- **L3** — Читает существующие SLO своей команды; в инциденте может сказать, какие SLO под угрозой и сколько бюджета осталось.
- **L4** — Записывает SLI как отношение `good events / valid events`. Обосновывает выбор знаменателя в SLO-документе сервиса.
- **L4** — Определяет простой SLO для одного сервиса (availability и/или latency); выбирает SLI window (rolling 28-day vs calendar month) и обосновывает выбор.
- **L5** — Проектирует набор SLI для сервиса: для онлайн-сервиса — RED (rate / errors / duration); для batch / pipeline — freshness, throughput, correctness; для пользовательского flow — composite по user journey.
- **L5** — Инструментирует сервис: на стороне клиента (synthetic, RUM) где возможно; на серверной стороне — через Prometheus client / OpenTelemetry SDK; пишет recording rules для агрегации на разных окнах.
- **L5** — Декомпозирует составной запрос на компонентные SLI и понимает, какой SLI ловит какую часть деградации.
- **L6+** — Внедряет SLO-инфраструктуру в команде: recording rules, дашборды burn rate, error budget calculation как код (sloth/pyrra/Nobl9), документированная Error Budget Policy.
- **L6+** — Согласует SLO target с business expectations: 99.99% vs 99.9% — это разница в dollar cost; обосновывает выбор через user pain и cost, не «99.9% потому что круто».

## Материалы

### Книги

- Alex Hidalgo — **Implementing Service Level Objectives** (O'Reilly, 2020). Главы 1–6 — от определения SLI до error budget calculations. Главный практический источник.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/implementing-slos/)** (O'Reilly, 2018), глава 2 «Implementing SLOs». Канонический Google-подход к SLO-инжинирингу.
- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/service-level-objectives/)** (O'Reilly, 2016), глава 4 «Service Level Objectives». База терминологии и фундаментальные модели.

### Статьи и доклады

- Betsy Beyer et al. — **[Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)** (SRE Workbook, гл. 5). Связь SLO Engineering с alerting strategy.
- Betsy Beyer et al. — **[Appendix B. Example Error Budget Policy](https://sre.google/workbook/error-budget-policy/)** (SRE Workbook). Готовый шаблон Error Budget Policy.
- Štěpán Davidovič — **Reliable Math** (SREcon). Математика SLO и burn rate — что значат 99.9%, как считать composite SLI без накопления погрешности.

### Инструменты

- **[Prometheus](https://prometheus.io/)** — recording rules для SLI, alerting rules для burn rate. Канонический стек.
- **[Sloth](https://sloth.dev/)** — генератор PromQL для SLO и burn-rate алертов из декларативного YAML. По моим наблюдениям, чаще выбирают в командах от 5+ сервисов.
- **[Pyrra](https://github.com/pyrra-dev/pyrra)** — открытая платформа для управления SLO поверх Prometheus: dashboard error budget, multi-burn-rate alerts, Kubernetes operator.
- **[OpenSLO](https://openslo.com/)** — vendor-agnostic YAML-спецификация для SLO-as-code; CLI `oslo` для validation в GitOps-флоу.
- **[Nobl9](https://nobl9.com/)** — коммерческая платформа управления SLO поверх любого мониторинга. Полезна для cross-team SLO governance.

## Best practices

**Короткие правила:**

- **Знаменатель SLI важнее числителя.** «Good events» обсуждают часами, «valid events» забывают. Не отфильтровав ботов, healthcheck, известно-плохие клиенты и операции в maintenance window, получаешь SLO, который **никогда не нарушается или нарушается всегда** — в обоих случаях ритуал ревью бессмыслен.
- **Начинай с одного SLI на один сервис.** «Покроем всё сразу 50 SLI на 50 endpoint» — никто в них не разбирается, ревью превращается в чтение портянок. Запусти один корректный SLI, проведи через первый SLO Review, отшлифуй процесс. Потом расширяй.
- **SLO target — из business pain, а не «99.99% потому что круто».** Каждая девятка стоит на порядок дороже. Обоснование: при каком SLI пользователь начинает уходить / жаловаться / терять деньги — это и есть target.

Подробнее:

**SLI считается на стороне клиента, когда это возможно.** Метрики только серверные не знают про DNS, балансировщик, сетевую деградацию, TLS-handshake failure. Синтетика (probe из сторонних регионов) и RUM (telemetry с реальных клиентов) ближе к пользовательскому опыту; серверные метрики дополняют, не заменяют. Я регулярно вижу команды, у которых серверный SLI зелёный, а пользовательский опыт в индексе NPS падает — это разрыв ровно из-за client-side слепоты.

**SLI per user journey, не per endpoint.** SLI на каждый HTTP-маршрут — нечитаемо и не отражает пользовательский опыт. Пользователь не знает про endpoint'ы; он знает про действие («оплата прошла», «поиск работает»). SLI формулируется как composite по user journey, агрегируя метрики компонентов, через которые проходит запрос. Это сложнее в реализации, но единственный способ говорить про SLO с product-командой.

**Composite SLO осторожно: формула не очевидна.** «SLO = product(component SLOs)» в лоб — антипаттерн. Реальная формула зависит от того, последовательно или параллельно используются компоненты, как они коррелированы, есть ли retry. Composite SLO считается через симуляцию или явный анализ зависимостей, а не наивным умножением. Если в команде кто-то предлагает «давай умножим компонентные SLO» — это сигнал, что нужно копать глубже.

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — алертинг строится поверх SLO Engineering; качество алертов прямо зависит от качества SLI.
- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — ритуал, потребляющий данные SLO Engineering; без работающего ритуала SLO остаются техническим артефактом.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — большинство SLI строятся на сетевых метриках (latency, error rate, DNS); знание networking-стека определяет, что измеримо корректно.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — инструментирование SLI требует кода в сервисе (Prometheus client, OpenTelemetry SDK).
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — capacity planning опирается на SLO как на reliability-таргет.

## Открытые вопросы

- **Composite SLO methodology** — нет канонической формулы для составления SLO из компонентов; реальные команды решают через симуляцию или эмпирику. Возможно, отдельный лист.
- **Real-time vs synthetic SLI** — когда какие, в какой комбинации, как избежать gap'ов.
- Я регулярно вижу sloppy формулировки SLI в командах после первой настройки («≥ 99% requests success»). Без conkretики «что такое request», «что такое success», «что такое window» это не SLI, это слоган. Хороший SLI читается как `count(http_requests{status!~"5.."} | window_5m) / count(http_requests{is_synthetic="false"} | window_5m) > 0.999`. Если в команде нет такой строгости — стоит обсудить, как её внедрить.
