# SRE Roadmap

Предполагаемая последовательность совершенствования компетенций с приоритетами.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [SRE Culture](#sre-culture)
- [SRE Engineering](#sre-engineering)
- [SRE Practices](#sre-practices)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## SRE Culture

```mermaid
graph LR
    SRECulture{SRE Culture}
    SRECulture-- Must Have --> MEAS[Measurement]
    MEAS-- Mandatory --> SLOReview[SLO / Error Budget Review]

    SRECulture-- Must Have --> RLMT[Relationship management]
    RLMT-- Mandatory --> DevTeamPartnership[Dev Team Partnership]

    SRECulture-- Must Have --> ETDL[Learning delivery]
    ETDL-- Mandatory --> PostmortemCulture[Postmortem Culture]
    ETDL-- Nice to have --> GameDay[Game Day / Chaos Drills]

    SRECulture-- Must Have --> KNOW[Knowledge management]
    KNOW-- Mandatory --> Runbooks
    KNOW-- Mandatory --> Playbooks

    RLMT-- Mandatory/Nice to have --> OCDV[Organisational capability development]
    MEAS-- It helps to --> OCDV
    ETDL-- It helps to --> OCDV
    OCDV-- Mandatory/Nice to have --> ITMG[IT management]
```

## SRE Engineering

```mermaid
graph LR
    SREEngineering{SRE Engineering}
    SREEngineering-- Must have --> OBSR[Observability]
    SREEngineering-- Must have --> ITOP[IT infrastructure]
    SREEngineering-- Must have --> PROG[Programming/scripting]

    OBSR-- Must Have --> Metrics
    OBSR-- Must Have --> Logging
    OBSR-- Mandatory --> Tracing[Distributed Tracing]
    OBSR-- Must Have --> AlertingStrategy[Alerting Strategy]

    ITOP-- Must have --> OS[OS & Networking]
    ITOP-- Mandatory --> ContainerOrchestration[Container Orchestration]
    ITOP-- On Demand --> CloudProviders[Cloud Providers]

    PROG-- Must Have --> Shell
    PROG-- Must Have --> Go
    PROG-- Mandatory --> CICD[CI/CD]

    SREEngineering-- Must have --> RELY[Reliability Engineering]
    RELY-- Must Have --> SLOManagement[SLO Management]
    RELY-- Mandatory --> CapacityPlanning[Capacity Planning]
    RELY-- Nice to have --> ChaosEngineering[Chaos Engineering]
    RELY-- Mandatory --> DisasterRecovery[Disaster Recovery]

    SREEngineering-- Mandatory --> TOIL[Toil Reduction]
    SREEngineering-- Mandatory --> CFMG[Configuration management]
    SREEngineering-- On Demand --> DBAD[Database reliability]

    CFMG-- Mandatory --> IaaC[IaC]
    CFMG-- Mandatory --> GitOps
```

## SRE Practices

```mermaid
graph LR
    SREPractices{SRE Practices}

    SREPractices-- Must have --> USUP[Incident management]
    USUP-- Must Have --> OnCallRotation[On-Call Rotation]
    USUP-- Must Have --> IncidentResponse[Incident Response]
    USUP-- Must Have --> EscalationPaths[Escalation Paths]

    SREPractices-- Must have --> PBMG[Problem management]
    PBMG-- Must Have --> BlamelessPostmortem[Blameless Postmortem]
    PBMG-- Mandatory --> ActionItems[Action Items Tracking]

    SREPractices-- Mandatory --> CHMG[Change management]
    CHMG-- Must Have --> ProductionReadiness[Production Readiness Review]
    CHMG-- Mandatory --> ProgressiveDelivery[Progressive Delivery]
    CHMG-- Must Have --> ErrorBudgetGating[Error Budget Gating]

    SREPractices-- Mandatory --> SCTY[Information security]
    SREPractices-- Mandatory --> METL[Methods and tools]

    SREPractices-- Mandatory --> PDSV[Professional development]
    PDSV-- Nice to have --> PEMT[Performance management]
    PDSV-- Must Have --> BurnoutPrevention[Burnout Prevention]
    PDSV-- Nice to have --> KNOW[Knowledge management]
```
