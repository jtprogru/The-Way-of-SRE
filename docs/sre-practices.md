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

Компетенции для развития в ветке `SRE Practices`:

```mermaid
graph LR
    SREPractices{SRE Practices}
    SREPractices --> USUP[Incident management]
    SREPractices --> PBMG[Problem management]
    SREPractices --> CHMG[Change management]
    SREPractices --> SCTY[Information security]
    SREPractices --> METL[Methods and tools]
    SREPractices --> PDSV[Professional development]
    SREPractices --> PEMT[Performance management]

    USUP --> IncidentResponse[Incident Response]
    IncidentResponse --> IncidentCommander[Incident Commander Role]
    IncidentResponse --> CommsLead[Communications Lead Role]
    IncidentResponse --> OpsLead[Operations Lead Role]
    USUP --> EscalationPaths[Escalation Paths]
    USUP --> OnCallRotation[On-Call Rotation]
    OnCallRotation --> OnCallHandbook[On-Call Handbook]
    OnCallRotation --> OnCallTools[On-Call Tools]
    OnCallTools --> PagerDuty
    OnCallTools --> OpsGenie
    OnCallTools --> VictorOps
    USUP --> WarRoom[War Room / Bridge]
    USUP --> StatusPage[Status Page Management]
    USUP --> MTTR[MTTR Optimization]

    PBMG --> BlamelessPostmortem[Blameless Postmortem]
    BlamelessPostmortem --> PostmortemTemplate[Postmortem Template]
    BlamelessPostmortem --> RootCauseAnalysis[Root Cause Analysis]
    BlamelessPostmortem --> ActionItems[Action Items Tracking]
    PBMG --> ProblemTracking[Problem Tracking]
    PBMG --> TrendAnalysis[Trend Analysis]
    PBMG --> PreventiveMeasures[Preventive Measures]

    CHMG --> ProductionReadiness[Production Readiness Review]
    CHMG --> ProgressiveDelivery[Progressive Delivery]
    ProgressiveDelivery --> CanaryRelease[Canary Release]
    ProgressiveDelivery --> BlueGreen[Blue/Green Deployment]
    ProgressiveDelivery --> FeatureFlags[Feature Flags]
    CHMG --> RollbackStrategy[Rollback Strategy]
    CHMG --> ErrorBudgetGating[Error Budget Gating]
    CHMG --> ChangeRiskAssessment[Change Risk Assessment]

    SCTY --> VulnerabilityManagement[Vulnerability Management]
    SCTY --> SecuritySLOs[Security SLOs]
    SCTY --> ThreatModeling[Threat Modeling]
    SCTY --> SupplyChainSecurity[Supply Chain Security]
    SCTY --> SecretManagement[Secret Management]
    SecretManagement --> Vault
    SecretManagement --> AWSSM[AWS Secrets Manager]

    METL --> SREToolchain[SRE Toolchain]
    SREToolchain --> MonitoringPlatform[Monitoring Platform]
    SREToolchain --> IncidentTracking[Incident Tracking]
    SREToolchain --> PostmortemPlatform[Postmortem Platform]
    SREToolchain --> RunbookSystem[Runbook System]
    METL --> PolicyManagement[Policy and Standards Management]
    METL --> Analysis

    PDSV --> CareerPathing[Career Pathing for SRE]
    PDSV --> StrategyPlanning[Strategy Planning]
    PDSV --> BurnoutPrevention[Burnout Prevention]
    PDSV --> OnCallDesign[On-Call Design]

    PEMT --> Mentorship
    PEMT --> PeopleMgmt[People Management]
    PEMT --> SettingGoals[Setting Goals]
    PEMT --> PsychologicalSafety[Psychological Safety]
    PEMT --> TeamMetrics[Team Metrics / DORA]
```
