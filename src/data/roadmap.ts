// Единый источник правды для карты компетенций SRE.
//
// Структура отражает текущее состояние графов в /docs/sre-*.md и
// _inventory/overlaps.md. При изменении графов — обновлять здесь.
//
// `priority` хранится на уровне L1 (для homepage / branch views)
// и используется PriorityMap для цветовой разметки.
// `leaves` под L1 появляются по мере создания leaf-страниц
// в site/src/content/docs/leaves/<branch>/<slug>.md.

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
      ],
    },
  ],
};

export function getBranch(id: string): Branch | undefined {
  return roadmap.branches.find((b) => b.id === id);
}
