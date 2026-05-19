# SRE Practices

Ветвь развития, посвящённая совершенствованию **операционных процессов**: управление инцидентами, постмортемы, управление изменениями, on-call процессы, runbook-культура, SLO-ревью. Главный объект деятельности — процессы и ритуалы: последовательность действий, повторяемые сценарии, операционная зрелость.

Всё это составляет операционную зрелость команды и организации.

## Компетенции верхнего уровня

- **Incident management** — координация реагирования на инциденты: роли (IC, Comms Lead, Ops Lead), escalation paths, war room процессы, коммуникация со стейкхолдерами. Цель — минимизировать MTTR при соблюдении blameless-принципов.
- **Problem management** — проведение постмортемов (blameless postmortems), выявление корневых причин инцидентов, разработка action items и их отслеживание. Проблема — это потенциальный источник инцидентов; её устранение снижает риски.
- **Change management** — безопасное управление изменениями в production: progressive delivery, feature flags, canary releases, rollback-стратегии, оценка риска изменений с точки зрения error budget.
- **Information security** — управление уязвимостями, обеспечение надёжности с учётом требований безопасности (security SLOs), участие в threat modeling и безопасности supply chain.
- **Methods and tools** — выбор, внедрение и совершенствование инструментария SRE-команды: системы мониторинга, incident-трекеры, платформы для постмортемов, runbook-системы.
- **Professional development** — профессиональный рост SRE-инженеров: планирование карьерного пути, определение зон ответственности, дизайн on-call rotation, борьба с burnout.
- **Performance management** — наставничество, постановка целей, оценка производительности команды через объективные метрики (не только on-call героизм), развитие культуры психологической безопасности.

## Карта компетенций

Граф L1+L2 в соответствии с [политикой контроля детализации](methodology.md): не более 2 уровней под ветвью, не более 7 L1 на ветвь, не более 5 L2 на L1. Конкретный тулинг (PagerDuty, Vault и т.п.) в графе не присутствует — он живёт в секции «Материалы» соответствующего листа.

```mermaid
graph LR
    SREPractices{SRE Practices}
    SREPractices --> USUP[Incident Management]
    SREPractices --> PBMG[Problem Management]
    SREPractices --> CHMG[Change Management]
    SREPractices --> SCTY[Information Security]
    SREPractices --> METL[Methods & Tools]
    SREPractices --> PDSV[Professional Development]
    SREPractices --> PEMT[Performance Management]

    USUP --> IncidentResponse[Incident Response]
    USUP --> EscalationPaths[Escalation Paths]
    USUP --> OnCallRotation[On-Call Rotation]
    USUP --> StatusPage[Status Page Management]
    USUP --> MTTR[MTTR Optimization]

    PBMG --> BlamelessPostmortem[Blameless Postmortem]
    PBMG --> ProblemTracking[Problem Tracking]
    PBMG --> TrendAnalysis[Trend Analysis]
    PBMG --> PreventiveMeasures[Preventive Measures]
    PBMG --> SLOReviewRitual[SLO Review Ritual]

    CHMG --> ProductionReadiness[Production Readiness Review]
    CHMG --> ProgressiveDelivery[Progressive Delivery]
    CHMG --> RollbackStrategy[Rollback Strategy]
    CHMG --> ErrorBudgetGating[Error Budget Gating]
    CHMG --> ChangeRiskAssessment[Change Risk Assessment]

    SCTY --> VulnerabilityMgmt[Vulnerability Management]
    SCTY --> SecuritySLOs[Security SLOs]
    SCTY --> ThreatModeling[Threat Modeling]
    SCTY --> SupplyChainSecurity[Supply Chain Security]
    SCTY --> SecretManagement[Secret Management]

    METL --> SREToolchain[SRE Toolchain]
    METL --> PolicyManagement[Policy and Standards]
    METL --> Analysis[Analysis]

    PDSV --> CareerPathing[Career Pathing for SRE]
    PDSV --> StrategyPlanning[Strategy Planning]
    PDSV --> BurnoutPrevention[Burnout Prevention]
    PDSV --> OnCallDesign[On-Call Design]

    PEMT --> PeopleMgmt[People Management]
    PEMT --> SettingGoals[Setting Goals]
    PEMT --> PsychologicalSafety[Psychological Safety]
    PEMT --> PerformanceConversations[Performance Conversations]
```

Бюджет узлов: 1 корень + 7 L1 + 31 L2 = **39 узлов**.
