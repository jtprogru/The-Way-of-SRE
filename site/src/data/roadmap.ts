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
        { id: 'rlmt', label: 'Relationship Management', priority: 'must' },
        { id: 'etdl', label: 'Learning Delivery', priority: 'must' },
        { id: 'meas', label: 'Measurement', priority: 'must' },
        { id: 'know', label: 'Knowledge Management', priority: 'must' },
        { id: 'itmg', label: 'IT Management', priority: 'mandatory' },
        {
          id: 'ocdv',
          label: 'Organisational Capability Development',
          priority: 'nice',
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
        { id: 'reliability', label: 'Reliability Engineering', priority: 'must' },
        { id: 'infrastructure', label: 'IT Infrastructure', priority: 'must' },
        { id: 'programming', label: 'Programming / Scripting', priority: 'must' },
        { id: 'toil', label: 'Toil Reduction', priority: 'mandatory' },
        { id: 'configuration', label: 'Configuration Management', priority: 'mandatory' },
        { id: 'database', label: 'Database Reliability', priority: 'ondemand' },
      ],
    },
    {
      id: 'practices',
      label: 'SRE Practices',
      href: '/sre-practices/',
      priority: 'must',
      l1: [
        { id: 'incident', label: 'Incident Management', priority: 'must' },
        { id: 'problem', label: 'Problem Management', priority: 'must' },
        { id: 'change', label: 'Change Management', priority: 'mandatory' },
        { id: 'security', label: 'Information Security', priority: 'mandatory' },
        { id: 'methods', label: 'Methods & Tools', priority: 'mandatory' },
        { id: 'professional', label: 'Professional Development', priority: 'mandatory' },
        { id: 'performance', label: 'Performance Management', priority: 'mandatory' },
      ],
    },
  ],
};

export function getBranch(id: string): Branch | undefined {
  return roadmap.branches.find((b) => b.id === id);
}
