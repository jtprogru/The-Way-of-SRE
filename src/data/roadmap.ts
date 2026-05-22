// Источник правды для структуры роадмапа на уровне L1 + leaves и для priorities.
//
// За что отвечает этот файл (и НИЧТО другое):
//   - L1-узлы каждой ветви и их порядок
//   - priorities L1 (must / mandatory / nice / ondemand) — используется
//     /priorities/ на сайте и цветовой разметкой `PriorityMap`
//   - leaves под L1 (фактически написанные leaf-страницы)
//
// За что отвечают src/content/docs/sre-{culture,engineering,practices}.mdx:
//   - L1 + L2 inventory концептов компетенций (как nested list под каждым L1)
//   - L2-узлы (Stakeholder Management, Metrics, IaC и т.п.) живут ТОЛЬКО там;
//     это потенциальные подкомпетенции, не leaf-страницы
//
// Инвариант: набор и порядок L1 в этом файле должен совпадать с L1 в
// sre-*.mdx. При изменении L1 (переименование, добавление, удаление)
// — синхронизировать оба источника одним PR.
//
// src/content/docs/methodology.mdx — методологический документ про ось
// priority и ось SFIA, он НЕ содержит данных (только определения и
// ссылки сюда).
//
// Leaves создаются в src/content/docs/leaves/<branch>/<slug>.md и
// регистрируются здесь под соответствующим L1.

export type Priority = 'must' | 'mandatory' | 'nice' | 'ondemand';

export interface Leaf {
  id: string;
  label: string;
  href: string;
}

export interface L1 {
  id: string;
  label: string;
  priority: Priority;
  leaves?: Leaf[];
}

export interface Branch {
  id: string;
  label: string;
  href: string;
  priority: Priority;
  l1: L1[];
}

export interface Roadmap {
  root: string;
  branches: Branch[];
}

export const priorityLabels: Record<Priority, { emoji: string; ru: string }> = {
  must: { emoji: '🔴', ru: 'Must Have' },
  mandatory: { emoji: '🟡', ru: 'Mandatory' },
  nice: { emoji: '🟢', ru: 'Nice to have' },
  ondemand: { emoji: '🔵', ru: 'On Demand' },
};

export const roadmap: Roadmap = {
  root: 'SRE',
  branches: [
    {
      id: 'culture',
      label: 'SRE Culture',
      href: '/sre-culture/',
      priority: 'must',
      l1: [
        {
          id: 'relationship-management',
          label: 'Relationship Management',
          priority: 'must',
          leaves: [
            {
              id: 'dev-team-partnership',
              label: 'Dev Team Partnership',
              href: '/leaves/culture/dev-team-partnership/',
            },
          ],
        },
        {
          id: 'learning-delivery',
          label: 'Learning Delivery',
          priority: 'must',
          leaves: [
            {
              id: 'postmortem-culture',
              label: 'Postmortem Culture',
              href: '/leaves/culture/postmortem-culture/',
            },
            {
              id: 'communities-of-practice',
              label: 'Communities of Practice',
              href: '/leaves/culture/communities-of-practice/',
            },
          ],
        },
        {
          id: 'measurement',
          label: 'Measurement',
          priority: 'must',
          leaves: [
            {
              id: 'slo-budget-review',
              label: 'SLO / Budget Review',
              href: '/leaves/culture/slo-budget-review/',
            },
          ],
        },
        {
          id: 'knowledge-management',
          label: 'Knowledge Management',
          priority: 'must',
          leaves: [
            {
              id: 'runbooks',
              label: 'Runbooks',
              href: '/leaves/culture/runbooks/',
            },
          ],
        },
        {
          id: 'it-management',
          label: 'IT Management',
          priority: 'mandatory',
          leaves: [
            {
              id: 'service-ownership',
              label: 'Service Ownership',
              href: '/leaves/culture/service-ownership/',
            },
          ],
        },
        {
          id: 'organisational-capability-development',
          label: 'Organisational Capability Development',
          priority: 'nice',
          leaves: [
            {
              id: 'sre-onboarding',
              label: 'SRE Onboarding',
              href: '/leaves/culture/sre-onboarding/',
            },
            {
              id: 'career-ladders',
              label: 'Career Ladders',
              href: '/leaves/culture/career-ladders/',
            },
          ],
        },
      ],
    },
    {
      id: 'engineering',
      label: 'SRE Engineering',
      href: '/sre-engineering/',
      priority: 'must',
      l1: [
        {
          id: 'observability',
          label: 'Observability',
          priority: 'must',
          leaves: [
            {
              id: 'sli-based-alerting',
              label: 'SLI-based Alerting',
              href: '/leaves/engineering/sli-based-alerting/',
            },
            {
              id: 'symptom-vs-cause-alerting',
              label: 'Symptom vs Cause Alerting',
              href: '/leaves/engineering/symptom-vs-cause-alerting/',
            },
            {
              id: 'alert-fatigue-management',
              label: 'Alert Fatigue Management',
              href: '/leaves/engineering/alert-fatigue-management/',
            },
          ],
        },
        {
          id: 'reliability-engineering',
          label: 'Reliability Engineering',
          priority: 'must',
          leaves: [
            {
              id: 'slo-engineering',
              label: 'SLO Engineering',
              href: '/leaves/engineering/slo-engineering/',
            },
            {
              id: 'composite-slo-methodology',
              label: 'Composite SLO Methodology',
              href: '/leaves/engineering/composite-slo-methodology/',
            },
            {
              id: 'capacity-planning',
              label: 'Capacity Planning',
              href: '/leaves/engineering/capacity-planning/',
            },
            {
              id: 'resilience-patterns',
              label: 'Resilience Patterns',
              href: '/leaves/engineering/resilience-patterns/',
            },
            {
              id: 'chaos-engineering',
              label: 'Chaos Engineering',
              href: '/leaves/engineering/chaos-engineering/',
            },
          ],
        },
        {
          id: 'it-infrastructure',
          label: 'IT Infrastructure',
          priority: 'must',
          leaves: [
            {
              id: 'networking',
              label: 'Networking',
              href: '/leaves/engineering/networking/',
            },
            {
              id: 'operating-systems',
              label: 'Operating Systems',
              href: '/leaves/engineering/operating-systems/',
            },
          ],
        },
        {
          id: 'programming-scripting',
          label: 'Programming / Scripting',
          priority: 'must',
          leaves: [
            {
              id: 'programming-languages',
              label: 'Programming Languages',
              href: '/leaves/engineering/programming-languages/',
            },
            {
              id: 'shell-cli-craft',
              label: 'Shell & CLI Craft',
              href: '/leaves/engineering/shell-cli-craft/',
            },
            {
              id: 'ci-cd',
              label: 'CI/CD',
              href: '/leaves/engineering/ci-cd/',
            },
            {
              id: 'test-strategy',
              label: 'Test Strategy',
              href: '/leaves/engineering/test-strategy/',
            },
            {
              id: 'performance-profiling',
              label: 'Performance & Profiling',
              href: '/leaves/engineering/performance-profiling/',
            },
          ],
        },
        {
          id: 'toil-reduction',
          label: 'Toil Reduction',
          priority: 'mandatory',
          leaves: [
            {
              id: 'toil-tracking',
              label: 'Toil Tracking',
              href: '/leaves/engineering/toil-tracking/',
            },
          ],
        },
        {
          id: 'configuration-management',
          label: 'Configuration Management',
          priority: 'mandatory',
          leaves: [
            {
              id: 'infrastructure-as-code',
              label: 'Infrastructure as Code',
              href: '/leaves/engineering/infrastructure-as-code/',
            },
            {
              id: 'gitops',
              label: 'GitOps',
              href: '/leaves/engineering/gitops/',
            },
          ],
        },
        {
          id: 'database-reliability',
          label: 'Database Reliability',
          priority: 'ondemand',
          leaves: [
            {
              id: 'backup-restore',
              label: 'Backup & Restore',
              href: '/leaves/engineering/backup-restore/',
            },
          ],
        },
        {
          id: 'financial-management',
          label: 'Financial Management',
          priority: 'mandatory',
          leaves: [
            {
              id: 'cost-management',
              label: 'Cost Management',
              href: '/leaves/engineering/cost-management/',
            },
          ],
        },
      ],
    },
    {
      id: 'practices',
      label: 'SRE Practices',
      href: '/sre-practices/',
      priority: 'must',
      l1: [
        {
          id: 'incident-management',
          label: 'Incident Management',
          priority: 'must',
          leaves: [
            {
              id: 'incident-response',
              label: 'Incident Response',
              href: '/leaves/practices/incident-response/',
            },
            {
              id: 'on-call-rotation',
              label: 'On-Call Rotation',
              href: '/leaves/practices/on-call-rotation/',
            },
            {
              id: 'severity-classification',
              label: 'Severity Classification',
              href: '/leaves/practices/severity-classification/',
            },
            {
              id: 'customer-communications',
              label: 'Customer Communications',
              href: '/leaves/practices/customer-communications/',
            },
            {
              id: 'war-room-patterns',
              label: 'War Room Patterns',
              href: '/leaves/practices/war-room-patterns/',
            },
          ],
        },
        {
          id: 'problem-management',
          label: 'Problem Management',
          priority: 'must',
          leaves: [
            {
              id: 'blameless-postmortem',
              label: 'Blameless Postmortem',
              href: '/leaves/practices/blameless-postmortem/',
            },
            {
              id: 'action-items-tracking',
              label: 'Action Items Tracking',
              href: '/leaves/practices/action-items-tracking/',
            },
          ],
        },
        {
          id: 'change-management',
          label: 'Change Management',
          priority: 'mandatory',
          leaves: [
            {
              id: 'progressive-delivery',
              label: 'Progressive Delivery',
              href: '/leaves/practices/progressive-delivery/',
            },
            {
              id: 'change-governance',
              label: 'Change Governance',
              href: '/leaves/practices/change-governance/',
            },
          ],
        },
        {
          id: 'information-security',
          label: 'Information Security',
          priority: 'mandatory',
          leaves: [
            {
              id: 'secrets-management',
              label: 'Secrets Management',
              href: '/leaves/practices/secrets-management/',
            },
            {
              id: 'threat-modeling',
              label: 'Threat Modeling',
              href: '/leaves/practices/threat-modeling/',
            },
            {
              id: 'vulnerability-management',
              label: 'Vulnerability Management',
              href: '/leaves/practices/vulnerability-management/',
            },
            {
              id: 'supply-chain-security',
              label: 'Supply Chain Security',
              href: '/leaves/practices/supply-chain-security/',
            },
          ],
        },
        {
          id: 'methods-tools',
          label: 'Methods & Tools',
          priority: 'mandatory',
          leaves: [
            {
              id: 'architecture-decision-records',
              label: 'Architecture Decision Records',
              href: '/leaves/practices/architecture-decision-records/',
            },
          ],
        },
        {
          id: 'professional-development',
          label: 'Professional Development',
          priority: 'mandatory',
          leaves: [
            {
              id: 'personal-growth-plan',
              label: 'Personal Growth Plan',
              href: '/leaves/practices/personal-growth-plan/',
            },
          ],
        },
        {
          id: 'performance-management',
          label: 'Performance Management',
          priority: 'mandatory',
          leaves: [
            {
              id: 'one-on-ones',
              label: 'One-on-Ones',
              href: '/leaves/practices/one-on-ones/',
            },
          ],
        },
        {
          id: 'sourcing',
          label: 'Sourcing',
          priority: 'mandatory',
          leaves: [
            {
              id: 'vendor-management',
              label: 'Vendor Management',
              href: '/leaves/practices/vendor-management/',
            },
          ],
        },
      ],
    },
  ],
};

export function getBranch(id: string): Branch | undefined {
  return roadmap.branches.find((b) => b.id === id);
}
