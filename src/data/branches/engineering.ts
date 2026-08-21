// Данные ветви SRE Engineering: L1 в порядке отображения, инвентарь концептов `l2` и
// написанные листья. Типы и сборка — в ../roadmap.ts, порядок действий для
// нового листа — в CONTRIBUTING.md, структурные инварианты — `make data-check`.
//
// Страницы: src/content/docs/engineering/<id>.mdx у каждого L1 и
// src/content/docs/engineering/<id>.md у каждого листа. Адрес узла здесь не хранится —
// он выводится из id при сборке.
import type { BranchSource } from '../roadmap.ts';

export const engineering: BranchSource = {
  id: 'engineering',
  label: 'SRE Engineering',
  priority: 'must',
  l1: [
    {
      id: 'observability',
      label: 'Observability',
      priority: 'must',
      l2: [
        'Metrics',
        'Logging',
        'Distributed Tracing',
        'SLI-based Alerting',
        'Symptom vs Cause Alerting',
        'Alert Fatigue Management',
        'End-User Monitoring',
        'Telemetry Economics',
      ],
      leaves: [
        { id: 'sli-based-alerting', label: 'SLI-based Alerting', priority: 'must' },
        { id: 'symptom-vs-cause-alerting', label: 'Symptom vs Cause Alerting', priority: 'mandatory' },
        { id: 'alert-fatigue-management', label: 'Alert Fatigue Management', priority: 'mandatory' },
        { id: 'telemetry-economics', label: 'Telemetry Economics', priority: 'mandatory' },
      ],
    },
    {
      id: 'reliability-engineering',
      label: 'Reliability Engineering',
      priority: 'must',
      l2: [
        'SLO Engineering',
        'Composite SLO Methodology',
        'Chaos Engineering',
        'Capacity Planning',
        'Disaster Recovery',
        'Resilience Patterns',
        'Systematic Troubleshooting',
      ],
      leaves: [
        {
          id: 'slo-engineering',
          label: 'SLO Engineering',
          priority: 'must',
          children: [
            { id: 'composite-slo-methodology', label: 'Composite SLO Methodology', priority: 'nice' },
          ],
        },
        { id: 'capacity-planning', label: 'Capacity Planning', priority: 'mandatory' },
        { id: 'resilience-patterns', label: 'Resilience Patterns', priority: 'mandatory' },
        { id: 'systematic-troubleshooting', label: 'Systematic Troubleshooting', priority: 'must' },
        { id: 'chaos-engineering', label: 'Chaos Engineering', priority: 'nice' },
      ],
    },
    {
      id: 'it-infrastructure',
      label: 'IT Infrastructure',
      priority: 'must',
      l2: [
        'Networking',
        'Operating Systems',
        'Containerization & Orchestration',
        'Service Mesh',
        'Cloud Providers',
      ],
      leaves: [
        { id: 'networking', label: 'Networking', priority: 'must' },
        { id: 'operating-systems', label: 'Operating Systems', priority: 'must' },
        {
          id: 'container-orchestration',
          label: 'Containerization & Orchestration',
          priority: 'must',
          children: [
            { id: 'service-mesh', label: 'Service Mesh', priority: 'nice' },
          ],
        },
        { id: 'cloud-providers', label: 'Cloud Providers', priority: 'must' },
      ],
    },
    {
      id: 'programming-scripting',
      label: 'Programming / Scripting',
      priority: 'must',
      l2: [
        'Programming Languages',
        'Shell & CLI Craft',
        'CI/CD',
        'Test Strategy',
        'Performance & Profiling',
      ],
      leaves: [
        { id: 'programming-languages', label: 'Programming Languages', priority: 'must' },
        { id: 'shell-cli-craft', label: 'Shell & CLI Craft', priority: 'must' },
        { id: 'ci-cd', label: 'CI/CD', priority: 'must' },
        { id: 'test-strategy', label: 'Test Strategy', priority: 'mandatory' },
        { id: 'performance-profiling', label: 'Performance & Profiling', priority: 'mandatory' },
      ],
    },
    {
      id: 'toil-reduction',
      label: 'Toil Reduction',
      priority: 'mandatory',
      l2: [
        'Toil Identification',
        'Toil Tracking',
        'Toil Automation',
        'Personal SRE Toolkit',
        'ChatOps',
      ],
      leaves: [
        { id: 'toil-tracking', label: 'Toil Tracking', priority: 'mandatory' },
        {
          id: 'toil-automation',
          label: 'Toil Automation',
          priority: 'mandatory',
          children: [
            { id: 'personal-sre-toolkit', label: 'Personal SRE Toolkit', priority: 'nice' },
            { id: 'chatops', label: 'ChatOps', priority: 'nice' },
          ],
        },
      ],
    },
    {
      id: 'configuration-management',
      label: 'Configuration Management',
      priority: 'mandatory',
      l2: [
        'Infrastructure as Code',
        'GitOps',
      ],
      leaves: [
        { id: 'infrastructure-as-code', label: 'Infrastructure as Code', priority: 'mandatory' },
        { id: 'gitops', label: 'GitOps', priority: 'nice' },
      ],
    },
    {
      // Отдельный L1, а не лист под IT Infrastructure или Toil Reduction:
      // главный объект здесь — внутренняя платформа как продукт для
      // команд-разработчиков, а не кластер и не автоматизация ручной работы.
      // Обоснование — inventory/platform-engineering-proposal.md.
      id: 'platform-engineering',
      label: 'Platform Engineering',
      priority: 'nice',
      l2: [
        'Platform as a Product',
        'Golden Paths',
        'Self-Service Infrastructure',
        'Internal Developer Portal',
        'Platform Reliability',
        'Platform Adoption & Measurement',
      ],
      leaves: [
        { id: 'platform-as-a-product', label: 'Platform as a Product', priority: 'must' },
        { id: 'golden-paths', label: 'Golden Paths', priority: 'mandatory' },
      ],
    },
    {
      id: 'database-reliability',
      label: 'Database Reliability',
      priority: 'ondemand',
      l2: [
        'DB Engines',
        'Replication',
        'Backup & Restore',
        'Performance & Monitoring',
      ],
      leaves: [
        { id: 'backup-restore', label: 'Backup & Restore', priority: 'must' },
      ],
    },
    {
      id: 'financial-management',
      label: 'Financial Management',
      priority: 'mandatory',
      l2: [
        'Cost Visibility',
        'Cost Allocation',
        'Unit Economics',
        'Cloud Cost Control',
        'Reserved / Spot Strategy',
        'Cost as SLI',
      ],
      leaves: [
        { id: 'cloud-cost-control', label: 'Cloud Cost Control', priority: 'mandatory' },
      ],
    },
  ],
};
