---
title: SLI-based Alerting
description: Подход к алертингу, при котором сигналы тревоги срабатывают на нарушение пользовательского контракта (SLI/SLO), а не на технические пороги ресурсов
sidebar:
  badge:
    text: Эталон
    variant: tip
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Observability / SLI-based Alerting
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Подход к алертингу, при котором сигналы тревоги срабатывают на нарушение пользовательского контракта (SLI/SLO), а не на технические пороги ресурсов. Противоположен классическому подходу «CPU > 80% — алерт»: алерт возникает, когда **сервис перестаёт быть достаточно надёжным для пользователя**, а не когда какая-то метрика инфраструктуры вышла за число.

## Что должен уметь

- **L3** — Различает SLI, SLO и SLA; читает чужие SLO-based алерты и понимает, что именно они ловят.
- **L3** — Поднимает по runbook'у простой SLO-based алерт, написанный командой.
- **L4** — Записывает SLI как отношение `good events / valid events` и обосновывает выбор знаменателя (что считать «валидным» событием).
- **L4** — Настраивает простейший порог-алерт на бюджет ошибок и понимает его ограничения (high false-positive rate, late detection).
- **L5** — Проектирует multi-window multi-burn-rate алерт по схеме из SRE Workbook: подбирает окна и пороги под целевую чувствительность (page vs ticket).
- **L5** — Разделяет потоки «срочно разбудить» и «разобраться в рабочее время» через разные burn rate.
- **L5** — Связывает каждый алерт с runbook'ом и удаляет алерт без runbook'а как фоновый шум.
- **L6+** — Проектирует алертинг-стратегию для сервиса целиком: набор SLI, иерархия алертов, политика error budget, регламент эскалации.
- **L6+** — Внедряет SLO-based алертинг в существующую команду с threshold-based историей и переводит её на новую модель без снижения детектируемости инцидентов.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/monitoring-distributed-systems/)** (O'Reilly, 2016), глава 6 «Monitoring Distributed Systems». База терминологии.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/alerting-on-slos/)** (O'Reilly, 2018), глава 5 «Alerting on SLOs». Главный источник по multi-window multi-burn-rate.
- Alex Hidalgo — **Implementing Service Level Objectives** (O'Reilly, 2020). Практический разбор от автора SLO-инструментария в Google и Nobl9.

### Статьи и доклады

- Google SRE — **[Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)**. База.
- Štěpán Davidovič, Betsy Beyer — **Reliable Alerting in the Cloud** (SREcon). База.
- Grafana — **[How to alert on SLOs](https://grafana.com/blog/2022/03/14/how-to-create-slo-alerts-with-grafana-cloud-slo)**. Дополнительно, с примерами PromQL.
- Datadog — **[Best practices for SLO-based alerting](https://www.datadoghq.com/blog/define-and-manage-slos/)**. Дополнительно.
- Liz Fong-Jones — **Why Are My Pages Going Off? SLO-Based Alerting Strategies** (SREcon). Продвинуто.

### Курсы

- Google Cloud — **Site Reliability Engineering: Measuring and Managing Reliability** (Coursera). Уровень: начальный.

### Инструменты

- **[Prometheus + Alertmanager](https://prometheus.io/)** — каноничный стек для записи SLI как recording rule и burn-rate алертов как alerting rule.
- **[VictoriaMetrics + vmalert](https://victoriametrics.com/)** — альтернатива Prometheus для высоконагруженных сценариев; совместимый язык правил.
- **[Grafana Alerting](https://grafana.com/grafana/alerting/)** — UI-ориентированная альтернатива Alertmanager, удобна для команд, живущих в Grafana.
- **[Sloth](https://sloth.dev/)** — генератор PromQL-правил для SLO/burn-rate из декларативных спецификаций.
- **[Nobl9](https://nobl9.com/)** — коммерческая платформа для управления SLO и алертами поверх существующих систем мониторинга.

## Best practices

- **Алертим на симптом, а не на причину.** Алерт «сервис не выдаёт 99% успешных ответов» переживёт смену реализации, переезд в другой кластер и замену БД. Алерт «CPU > 80%» через полгода будет ловить нормальную работу или, наоборот, молчать в инциденте. Привязка к пользовательскому контракту — единственное, что не устаревает.
- **Multi-window multi-burn-rate вместо одного порога.** Один порог либо просыпает быстрые ожоги бюджета (порог низкий, окно длинное), либо генерирует false positive на коротких всплесках (порог высокий, окно короткое). Двойное окно (короткое + длинное) разводит эти два режима и резко снижает шум.
- **Разные burn rate — разные каналы доставки.** Быстрый ожог бюджета (например, 14.4× за 1 час) → пейджер. Медленный (1× за 3 дня) → тикет, разбор в рабочее время. Один и тот же канал для срочного и несрочного убивает чувствительность к срочному.
- **Каждый алерт ведёт к runbook'у.** Алерт без runbook'а — это «разбуди человека и пусть сам думает». Через 6 месяцев такой алерт игнорируется или удаляется молча. Если runbook'а нет, лист или удаляется, или ставится в backlog с дедлайном.
- **SLI считается на стороне клиента, когда это возможно.** Метрики, снятые на стороне сервера, не знают про проблемы балансировщика, DNS, сетевой деградации. Синтетика или RUM ближе к реальному пользовательскому опыту.
- **Знаменатель SLI важнее числителя.** «Good events» обсуждают, «valid events» забывают. Не отфильтровав ботов, healthcheck'и, известно-плохие клиенты и операции в maintenance window, можно получить SLO, который никогда не нарушается или нарушается всегда.

## Связанные листья

- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — предпосылка: SLI-based алертинг невозможен без определённых SLI/SLO.
- **Error Budget Burn Rate** *(TBD)* — техническая база для расчёта burn rate, используется в alerting rule.
- **Alert Fatigue Management** *(TBD)* — соседний концепт: SLI-based подход — основной инструмент борьбы с фатигом.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — обязательная привязка: алерт без runbook'а не проходит ревью.
- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — потребитель: ритуал ревью опирается на данные, накопленные SLO-based алертами.

## Открытые вопросы

- Стоит ли заводить отдельный лист `Symptom vs Cause Alerting` или это часть данного листа? Сейчас зафиксировано как best practice здесь.
