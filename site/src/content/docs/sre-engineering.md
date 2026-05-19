---
title: SRE Engineering
description: Ветвь развития, посвящённая техническим компетенциям SRE
---

> **PoC-стаб.** Полное содержимое ветви живёт в [`/docs/sre-engineering.md`](https://github.com/jtprogru/The-Way-of-SRE/blob/main/docs/sre-engineering.md). В рамках PoC эта страница нужна для проверки навигации со spider'а и якоря `#observability`.

Ветвь развития, посвящённая совершенствованию **технических компетенций и навыков**, необходимых для обеспечения надёжности, масштабируемости и производительности систем. Главный объект деятельности — технические артефакты: код, инфраструктура, инструменты наблюдаемости и автоматизации.

## Компетенции верхнего уровня

### Observability

Построение и поддержка систем наблюдаемости: метрики, логи, трейсы (три столпа observability). Включает dashboards, alerting-стратегии и SLI-based мониторинг.

Заполненный лист в составе этой компетенции:

- [SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/) — эталон того, как выглядит «навигационная клетка» с конкретными умениями, материалами и best practices.

### Reliability Engineering

SLI/SLO/SLA, error budget policy, capacity planning, chaos engineering.

### Toil Reduction

Выявление, измерение и автоматизация ручного повторяющегося операционного труда.

### Configuration Management

IaC, GitOps, воспроизводимость и предсказуемость состояния систем.

### IT Infrastructure

Эксплуатация и проектирование инфраструктуры с точки зрения надёжности.

### Programming/Scripting

Разработка инструментов для автоматизации и снижения toil. SRE пишет код.

### Database Reliability

Backup/restore, репликация, performance tuning, DR-сценарии для БД.
