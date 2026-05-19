# SRE Engineering

Ветвь развития, посвящённая совершенствованию **технических компетенций и навыков**, необходимых для обеспечения надёжности, масштабируемости и производительности систем. Главный объект деятельности — технические артефакты: код, инфраструктура, инструменты наблюдаемости и автоматизации.

Ветвь включает наблюдаемость (observability), управление SLO/SLI/SLA, снижение toil, chaos engineering, capacity planning и всё, что позволяет системам быть **надёжными по своей природе**.

## Компетенции верхнего уровня

- **Observability** — построение и поддержка систем наблюдаемости: метрики, логи, трейсы (три столпа observability). Включает разработку dashboards, alerting-стратегий и SLI-based мониторинга. Observability — это возможность понять внутреннее состояние системы по её внешним проявлениям.
- **Reliability Engineering** — определение и управление SLI/SLO/SLA, error budget policy, capacity planning и проектирование систем с учётом надёжности. Включает chaos engineering и fault injection для проверки устойчивости.
- **Toil Reduction** — выявление, измерение и автоматизация ручного повторяющегося операционного труда (toil). Цель — удерживать долю toil ниже 50% рабочего времени команды, высвобождая ресурсы для engineering-работы.
- **Configuration management** — управление конфигурацией инфраструктуры и приложений как кодом (IaC), обеспечение воспроизводимости и предсказуемости состояния систем.
- **IT infrastructure** — эксплуатация, проектирование и оптимизация инфраструктуры с точки зрения надёжности: отказоустойчивость, резервирование, disaster recovery, производительность.
- **Programming/scripting** — разработка инструментов для автоматизации, операционных сервисов, систем контроля надёжности и снижения toil. SRE пишет код — это принципиальное отличие от классических ops.
- **Database reliability** — обеспечение надёжности хранилищ данных: backup/restore, репликация, performance tuning, DR-сценарии для БД, мониторинг consistency.

## Карта компетенций

Граф L1+L2 в соответствии с [политикой контроля детализации](methodology.md): не более 2 уровней под ветвью, не более 7 L1 на ветвь, не более 5 L2 на L1. Конкретный тулинг (Prometheus, Terraform, k6 и т.п.) в графе не присутствует — он живёт в секции «Материалы» соответствующего листа.

```mermaid
graph LR
    SREEngineering{SRE Engineering}
    SREEngineering --> OBSR[Observability]
    SREEngineering --> RELY[Reliability Engineering]
    SREEngineering --> TOIL[Toil Reduction]
    SREEngineering --> CFMG[Configuration Management]
    SREEngineering --> ITOP[IT Infrastructure]
    SREEngineering --> PROG[Programming / Scripting]
    SREEngineering --> DBAD[Database Reliability]

    OBSR --> Metrics[Metrics]
    OBSR --> Logging[Logging]
    OBSR --> Tracing[Distributed Tracing]
    OBSR --> SLIAlerting[SLI-based Alerting]
    OBSR --> EndUserMon[End-User Monitoring]

    RELY --> SLOEng[SLO Engineering]
    RELY --> ChaosEng[Chaos Engineering]
    RELY --> CapacityPlanning[Capacity Planning]
    RELY --> DisasterRecovery[Disaster Recovery]
    RELY --> ResiliencePatterns[Resilience Patterns]

    TOIL --> ToilIdent[Toil Identification]
    TOIL --> ToilAutom[Toil Automation]
    TOIL --> ToilTrack[Toil Tracking]

    CFMG --> IaC[Infrastructure as Code]
    CFMG --> GitOps[GitOps]

    ITOP --> Networking[Networking]
    ITOP --> OSPlatforms[Operating Systems]
    ITOP --> Containers[Containerization & Orchestration]
    ITOP --> ServiceMesh[Service Mesh]
    ITOP --> Cloud[Cloud Providers]

    PROG --> Languages[Programming Languages]
    PROG --> ShellCraft[Shell & CLI Craft]
    PROG --> CICD[CI/CD]

    DBAD --> DBEngines[DB Engines]
    DBAD --> DBReplication[Replication]
    DBAD --> DBBackup[Backup & Restore]
    DBAD --> DBPerf[Performance & Monitoring]

    click SLIAlerting "https://jtprogru.github.io/The-Way-of-SRE/leaves/engineering/sli-based-alerting/" "Открыть лист SLI-based Alerting"
```

Бюджет узлов: 1 корень + 7 L1 + 27 L2 = **35 узлов** (в пределах политики `≤ 80` на проект).
