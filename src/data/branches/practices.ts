// Данные ветви SRE Practices: L1 в порядке отображения, инвентарь концептов `l2` и
// написанные листья. Типы и сборка — в ../roadmap.ts, порядок действий для
// нового листа — в CONTRIBUTING.md, структурные инварианты — `make data-check`.
//
// Страницы: src/content/docs/practices/<id>.mdx у каждого L1 и
// src/content/docs/practices/<id>.md у каждого листа. Адрес узла здесь не хранится —
// он выводится из id при сборке.
import type { BranchSource } from '../roadmap.ts';

export const practices: BranchSource = {
  id: 'practices',
  label: 'SRE Practices',
  priority: 'must',
  l1: [
    {
      id: 'incident-management',
      label: 'Incident Management',
      priority: 'must',
      l2: [
        'Incident Response',
        'Severity Classification',
        'Escalation Paths',
        'War Room Patterns',
        'On-Call Rotation',
        'Customer Communications',
        'Status Page Management',
        'MTTR Optimization',
      ],
      leaves: [
        {
          id: 'incident-response',
          label: 'Incident Response',
          priority: 'must',
          children: [
            { id: 'war-room-patterns', label: 'War Room Patterns', priority: 'nice' },
          ],
        },
        { id: 'on-call-rotation', label: 'On-Call Rotation', priority: 'must' },
        { id: 'severity-classification', label: 'Severity Classification', priority: 'mandatory' },
        {
          id: 'customer-communications',
          label: 'Customer Communications',
          priority: 'mandatory',
          children: [
            { id: 'status-page-management', label: 'Status Page Management', priority: 'mandatory' },
          ],
        },
      ],
    },
    {
      id: 'problem-management',
      label: 'Problem Management',
      priority: 'must',
      l2: [
        'Blameless Postmortem',
        'Action Items Tracking',
        'Problem Tracking',
        'Trend Analysis',
        'Preventive Measures',
        'SLO Review Ritual',
      ],
      leaves: [
        { id: 'blameless-postmortem', label: 'Blameless Postmortem', priority: 'must' },
        { id: 'action-items-tracking', label: 'Action Items Tracking', priority: 'mandatory' },
      ],
    },
    {
      id: 'change-management',
      label: 'Change Management',
      priority: 'mandatory',
      l2: [
        'Production Readiness Review',
        'Progressive Delivery',
        'Change Governance',
        'Rollback Strategy',
        'Error Budget Gating',
        'Change Risk Assessment',
      ],
      leaves: [
        { id: 'progressive-delivery', label: 'Progressive Delivery', priority: 'mandatory' },
        { id: 'change-governance', label: 'Change Governance', priority: 'mandatory' },
      ],
    },
    {
      // Рантайм-периметр: чем закрыт работающий сервис и кто в него имеет
      // доступ. Всё, что относится к тому, как код пишется и доезжает до
      // прода, живёт в соседнем L1 Secure Development.
      id: 'information-security',
      label: 'Information Security',
      priority: 'mandatory',
      l2: [
        'Secrets Management',
        'Access Control & IAM',
        'Workload Identity',
        'Security SLOs',
        'Security Chaos Engineering',
        'Compliance Frameworks',
      ],
      leaves: [
        { id: 'secrets-management', label: 'Secrets Management', priority: 'must' },
        {
          id: 'access-control-iam',
          label: 'Access Control & IAM',
          priority: 'must',
          children: [
            { id: 'workload-identity', label: 'Workload Identity', priority: 'nice' },
          ],
        },
        { id: 'security-chaos-engineering', label: 'Security Chaos Engineering', priority: 'ondemand' },
        { id: 'compliance-frameworks', label: 'Compliance Frameworks', priority: 'ondemand' },
      ],
    },
    {
      // Безопасность на пути «дизайн → код → сборка → зависимости»: выделена
      // из Information Security, где девять листьев в одном списке читались
      // как свалка, а связаны они были границами, а не вложенностью.
      id: 'secure-development',
      label: 'Secure Development',
      priority: 'mandatory',
      l2: [
        'Threat Modeling',
        'Security Code Review',
        'SAST / SCA / Secret Scanning',
        'Vulnerability Management',
        'Patch SLA',
        'Supply Chain Security',
        'SBOM',
        'Artifact Signing',
      ],
      leaves: [
        { id: 'threat-modeling', label: 'Threat Modeling', priority: 'mandatory' },
        { id: 'security-code-review', label: 'Security Code Review', priority: 'mandatory' },
        { id: 'vulnerability-management', label: 'Vulnerability Management', priority: 'mandatory' },
        { id: 'supply-chain-security', label: 'Supply Chain Security', priority: 'mandatory' },
      ],
    },
    {
      id: 'methods-tools',
      label: 'Methods & Tools',
      priority: 'mandatory',
      l2: [
        'SRE Toolchain',
        'Policy and Standards',
        'Architecture Decision Records',
        'Analysis',
      ],
      leaves: [
        { id: 'architecture-decision-records', label: 'Architecture Decision Records', priority: 'mandatory' },
      ],
    },
    {
      id: 'professional-development',
      label: 'Professional Development',
      priority: 'mandatory',
      l2: [
        'Career Pathing for SRE',
        'Personal Growth Plan',
        'Strategy Planning',
        'Burnout Prevention',
        'On-Call Design',
        'Mentoring as Practice',
      ],
      leaves: [
        { id: 'personal-growth-plan', label: 'Personal Growth Plan', priority: 'mandatory' },
        { id: 'mentoring-as-practice', label: 'Mentoring as Practice', priority: 'nice' },
      ],
    },
    {
      id: 'performance-management',
      label: 'Performance Management',
      priority: 'mandatory',
      l2: [
        'People Management',
        'Setting Goals',
        'Psychological Safety',
        'One-on-Ones',
        'Performance Conversations',
        'Calibration Meeting',
      ],
      leaves: [
        { id: 'one-on-ones', label: 'One-on-Ones', priority: 'mandatory' },
        { id: 'calibration-meeting', label: 'Calibration Meeting', priority: 'mandatory' },
      ],
    },
    {
      id: 'sourcing',
      label: 'Sourcing',
      priority: 'mandatory',
      l2: [
        'Vendor Inventory',
        'Vendor SLO Math',
        'Concentration Risk',
        'Vendor Reliability',
        'Vendor Incident Playbook',
        'Exit Planning',
      ],
      leaves: [
        { id: 'vendor-reliability', label: 'Vendor Reliability', priority: 'ondemand' },
      ],
    },
  ],
};
