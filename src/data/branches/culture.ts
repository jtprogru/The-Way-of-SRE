// Данные ветви SRE Culture: L1 в порядке отображения, инвентарь концептов `l2` и
// написанные листья. Типы и сборка — в ../roadmap.ts, порядок действий для
// нового листа — в CONTRIBUTING.md, структурные инварианты — `make data-check`.
//
// Страницы: src/content/docs/culture/<id>.mdx у каждого L1 и
// src/content/docs/culture/<id>.md у каждого листа. Адрес узла здесь не хранится —
// он выводится из id при сборке.
import type { BranchSource } from '../roadmap.ts';

export const culture: BranchSource = {
  id: 'culture',
  label: 'SRE Culture',
  priority: 'must',
  l1: [
    {
      id: 'relationship-management',
      label: 'Relationship Management',
      priority: 'must',
      l2: [
        'Stakeholder Management',
        'Continuous Feedback',
        'Dev Team Partnership',
        'Communications',
      ],
      leaves: [
        {
          id: 'stakeholder-management',
          label: 'Stakeholder Management',
          priority: 'mandatory',
          children: [
            { id: 'dev-team-partnership', label: 'Dev Team Partnership', priority: 'must' },
          ],
        },
      ],
    },
    {
      id: 'learning-delivery',
      label: 'Learning Delivery',
      priority: 'must',
      l2: [
        'Game Day / Chaos Drills',
        'Postmortem Culture',
        'Communities of Practice',
        'Incident Response Training',
        'Mentorship Culture',
        'Knowledge Sharing',
      ],
      leaves: [
        { id: 'postmortem-culture', label: 'Postmortem Culture', priority: 'must' },
        { id: 'game-day', label: 'Game Day / Chaos Drills', priority: 'must' },
        { id: 'communities-of-practice', label: 'Communities of Practice', priority: 'nice' },
      ],
    },
    {
      id: 'measurement',
      label: 'Measurement',
      priority: 'must',
      l2: [
        'SLO / Budget Review',
        'DORA Metrics',
        'Toil Measurement',
      ],
      leaves: [
        { id: 'slo-budget-review', label: 'SLO / Budget Review', priority: 'must' },
        { id: 'dora-metrics', label: 'DORA Metrics', priority: 'mandatory' },
      ],
    },
    {
      id: 'knowledge-management',
      label: 'Knowledge Management',
      priority: 'must',
      l2: [
        'Runbooks',
        'Playbooks',
        'Postmortem Database',
        'Architecture Decision Records',
        'Collaboration',
      ],
      leaves: [
        { id: 'runbooks', label: 'Runbooks', priority: 'must' },
        { id: 'playbooks', label: 'Playbooks', priority: 'mandatory' },
        { id: 'postmortem-database', label: 'Postmortem Database', priority: 'mandatory' },
      ],
    },
    {
      id: 'it-management',
      label: 'IT Management',
      priority: 'mandatory',
      l2: [
        'Service Ownership',
        'On-Call Budget Management',
        'DR Policy & Stakeholders',
        'SLO Governance',
      ],
      leaves: [
        { id: 'service-ownership', label: 'Service Ownership', priority: 'mandatory' },
        { id: 'dr-policy', label: 'DR Policy & Stakeholders', priority: 'mandatory' },
      ],
    },
    {
      id: 'organisational-capability-development',
      label: 'Organisational Capability Development',
      priority: 'nice',
      l2: [
        'SRE Maturity Assessment',
        'SRE Model Adoption',
        'Research & PoC',
        'Team Topologies',
        'SRE Onboarding',
        'Career Ladders',
      ],
      leaves: [
        { id: 'sre-onboarding', label: 'SRE Onboarding', priority: 'nice' },
        { id: 'career-ladders', label: 'Career Ladders', priority: 'nice' },
        { id: 'team-topologies', label: 'Team Topologies', priority: 'mandatory' },
      ],
    },
  ],
};
