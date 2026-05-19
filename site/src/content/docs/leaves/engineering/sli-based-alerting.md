---
title: SLI-based Alerting
description: Подход к алертингу, при котором сигналы тревоги срабатывают на нарушение пользовательского контракта (SLI/SLO), а не на технические пороги ресурсов
sidebar:
  badge:
    text: Эталон
    variant: tip
---

import { Aside } from '@astrojs/starlight/components';

:::note[Метаданные листа]
**Ветвь:** Engineering · **Путь:** Observability / SLI-based Alerting
**SFIA-уровни:** 3, 4, 5, 6 · **Приоритет:** Must Have · **Статус:** draft
:::

Подход к алертингу, при котором сигналы тревоги срабатывают на нарушение пользовательского контракта (SLI/SLO), а не на технические пороги ресурсов. Противоположен классическому подходу «CPU > 80% — алерт»: алерт возникает, когда **сервис перестаёт быть достаточно надёжным для пользователя**, а не когда какая-то метрика инфраструктуры вышла за число.

## Что должен уметь

- **L3** — Различает SLI, SLO и SLA; читает чужие SLO-based алерты и понимает, что именно они ловят.
- **L3** — Поднимает по runbook'у простой SLO-based алерт, написанный командой.
- **L4** — Записывает SLI как отношение `good events / valid events` и обосновывает выбор знаменателя.
- **L4** — Настраивает простейший порог-алерт на бюджет ошибок и понимает его ограничения.
- **L5** — Проектирует multi-window multi-burn-rate алерт по схеме из SRE Workbook.
- **L5** — Разделяет потоки «срочно разбудить» и «разобраться в рабочее время» через разные burn rate.
- **L5** — Связывает каждый алерт с runbook'ом и удаляет алерт без runbook'а как фоновый шум.
- **L6+** — Проектирует алертинг-стратегию для сервиса целиком: набор SLI, иерархия алертов, политика error budget, регламент эскалации.
- **L6+** — Внедряет SLO-based алертинг в существующую команду с threshold-based историей.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/monitoring-distributed-systems/)** (O'Reilly, 2016), глава 6 «Monitoring Distributed Systems». База терминологии.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/alerting-on-slos/)** (O'Reilly, 2018), глава 5 «Alerting on SLOs». Главный источник по multi-window multi-burn-rate.
- Alex Hidalgo — **Implementing Service Level Objectives** (O'Reilly, 2020). Практический разбор от автора SLO-инструментария.

### Статьи и доклады

- Google SRE — **[Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)**. База.
- Grafana — **[How to alert on SLOs](https://grafana.com/blog/2022/03/14/how-to-create-slo-alerts-with-grafana-cloud-slo)**. Дополнительно, с примерами PromQL.
- Datadog — **[Best practices for SLO-based alerting](https://www.datadoghq.com/blog/define-and-manage-slos/)**. Дополнительно.

### Курсы

- Google Cloud — **Site Reliability Engineering: Measuring and Managing Reliability** (Coursera). Уровень: начальный.

### Инструменты

- **[Prometheus + Alertmanager](https://prometheus.io/)** — каноничный стек для записи SLI как recording rule и burn-rate алертов.
- **[VictoriaMetrics + vmalert](https://victoriametrics.com/)** — альтернатива для высоконагруженных сценариев.
- **[Grafana Alerting](https://grafana.com/grafana/alerting/)** — UI-ориентированная альтернатива Alertmanager.
- **[Sloth](https://sloth.dev/)** — генератор PromQL-правил для SLO/burn-rate из деклараций.
- **[Nobl9](https://nobl9.com/)** — коммерческая платформа управления SLO.

## Best practices

- **Алертим на симптом, а не на причину.** Алерт «сервис не выдаёт 99% успешных ответов» переживёт смену реализации, переезд в другой кластер и замену БД. Алерт «CPU > 80%» через полгода будет ловить нормальную работу или, наоборот, молчать в инциденте. Привязка к пользовательскому контракту — единственное, что не устаревает.
- **Multi-window multi-burn-rate вместо одного порога.** Один порог либо просыпает быстрые ожоги бюджета, либо генерирует false positive на коротких всплесках. Двойное окно резко снижает шум.
- **Разные burn rate — разные каналы доставки.** Быстрый ожог → пейджер. Медленный → тикет. Один канал для срочного и несрочного убивает чувствительность.
- **Каждый алерт ведёт к runbook'у.** Алерт без runbook'а — это «разбуди человека и пусть сам думает». Через 6 месяцев игнорируется или удаляется молча.
- **SLI считается на стороне клиента, когда это возможно.** Серверные метрики не знают про проблемы балансировщика, DNS, сетевой деградации.
- **Знаменатель SLI важнее числителя.** Не отфильтровав ботов, healthcheck'и и операции в maintenance window, можно получить SLO, который никогда не нарушается или нарушается всегда.

## Связанные листья

<Aside type="caution" title="PoC-ограничение">
Соседние листья пока существуют только в виде графа в `/docs`. В PoC мигрирован один лист (этот). При решении о полной миграции связи активируются.
</Aside>

- **SLO Engineering** — предпосылка: SLI-based алертинг невозможен без определённых SLI/SLO.
- **Error Budget Burn Rate** — техническая база для расчёта burn rate.
- **Alert Fatigue Management** — соседний концепт.
- **Runbooks** — обязательная привязка: алерт без runbook'а не проходит ревью.
- **SLO Review Ritual** — потребитель: ритуал ревью SLO опирается на данные SLO-based алертов.
