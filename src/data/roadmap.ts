// Источник правды для структуры роадмапа на уровне L1 + leaves и для priorities.
//
// За что отвечает этот файл (и НИЧТО другое):
//   - L1-узлы каждой ветви и их порядок
//   - priorities L1 (must / mandatory / nice / ondemand) — используется
//     /priorities/ на сайте и цветовой разметкой `PriorityMap`
//   - l2 — инвентарь концептов каждого L1 в осмысленном порядке
//   - leaves под L1 (фактически написанные leaf-страницы)
//
// За что отвечают src/content/docs/sre-{culture,engineering,practices}/<l1>.mdx:
//   - описание L1 прозой, и только оно
//
// L2 и leaves — два разных факта об одном домене: инвентарь концептов и
// набор написанных страниц. Пересекаются они по имени: концепт, у которого
// есть лист, рендерится ссылкой на него (L2Concepts.astro). Инвариант
// «каждый лист назван в l2 своего L1» держит tools/data/check.ts —
// переименовали лист и забыли инвентарь, `make check` не пройдёт.
//
// Инвариант: у каждого L1 из этого файла должна быть страница
// src/content/docs/<branch>/<l1-id>.mdx — её адрес выводится из данных
// через l1Href(). При добавлении или переименовании L1 заводить или
// переименовывать страницу тем же PR, иначе карточка на странице ветви
// будет вести в никуда.
//
// Порядок L1 задаётся только этим файлом: страницы ветвей и сайдбар
// рендерят карточки и группы из данных, руками нигде не перечисляются.
//
// src/content/docs/methodology.mdx — методологический документ про ось
// priority и ось SFIA, он НЕ содержит данных (только определения и
// ссылки сюда).
//
// Leaves создаются в src/content/docs/<branch>/<slug>.md и регистрируются
// здесь под соответствующим L1 — либо, если лист уточняет другой лист, в его
// `children` (ровно один уровень вложенности, см. типы ниже). Отдельно в
// навигации их прописывать не нужно: левый сайдбар строится из этого файла
// через src/data/sidebar.ts.
//
// URL листа плоский независимо от вложенности — /<branch>/<slug>/, рядом с
// hub-страницами L1 той же ветви. Перевесить лист под другой L1 = поменять
// одну строку здесь, без редиректов: адрес от родителя не зависит. Отсюда
// два ограничения. Подлист живёт в той же ветви, что и родитель, иначе
// findLeafContext() его не найдёт (ветвь берётся из URL). И slug листа не
// может совпасть с id L1 этой же ветви — они делят одно пространство имён,
// совпадение ловит tools/data/check.ts.
//
// Приоритет у подлиста собственный: вложенная практика вполне может быть
// важнее родительской на фоне всей карты, наследование это скрывало бы.

export type Priority = 'must' | 'mandatory' | 'nice' | 'ondemand';

/** Общая часть листа и подлиста: то, что рисуется как узел графа. */
export interface LeafNode {
  id: string;
  label: string;
  href: string;
  priority: Priority;
}

/**
 * Подлист — уточнение конкретного листа (`runbooks → playbooks`), а не
 * самостоятельная практика уровня L1. Детей у него нет намеренно: глубина
 * ограничена одним уровнем не соглашением, а типом. Попытка вложить
 * подлист в подлист — ошибка компиляции (excess property check на
 * литералах `roadmap.ts`).
 *
 * Упёрлись в глубину — значит родитель дорос до L1: повышаем узел, правка
 * того же файла.
 */
export type SubLeaf = LeafNode;

export interface Leaf extends LeafNode {
  children?: SubLeaf[];
}

export interface L1 {
  id: string;
  label: string;
  priority: Priority;
  /**
   * Концепты домена в осмысленном порядке — тот срез, который читатель видит
   * строкой «L2-концепты» на hub-странице. Список полный: и то, что уже
   * расписано листом, и то, что пока только названо. Разница видна по
   * наличию листа с тем же label, отдельным флагом не хранится.
   *
   * Поле обязательное: L1 без инвентаря — это заголовок без содержания,
   * такую страницу нечем наполнить.
   */
  l2: string[];
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
      href: '/culture/',
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
              href: '/culture/stakeholder-management/',
              priority: 'mandatory',
              children: [
                {
                  id: 'dev-team-partnership',
                  label: 'Dev Team Partnership',
                  href: '/culture/dev-team-partnership/',
                  priority: 'must',
                },
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
            {
              id: 'postmortem-culture',
              label: 'Postmortem Culture',
              href: '/culture/postmortem-culture/',
              priority: 'must',
            },
            {
              id: 'game-day',
              label: 'Game Day / Chaos Drills',
              href: '/culture/game-day/',
              priority: 'must',
            },
            {
              id: 'communities-of-practice',
              label: 'Communities of Practice',
              href: '/culture/communities-of-practice/',
              priority: 'nice',
            },
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
            {
              id: 'slo-budget-review',
              label: 'SLO / Budget Review',
              href: '/culture/slo-budget-review/',
              priority: 'must',
            },
            {
              id: 'dora-metrics',
              label: 'DORA Metrics',
              href: '/culture/dora-metrics/',
              priority: 'mandatory',
            },
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
            {
              id: 'runbooks',
              label: 'Runbooks',
              href: '/culture/runbooks/',
              priority: 'must',
            },
            {
              id: 'playbooks',
              label: 'Playbooks',
              href: '/culture/playbooks/',
              priority: 'mandatory',
            },
            {
              id: 'postmortem-database',
              label: 'Postmortem Database',
              href: '/culture/postmortem-database/',
              priority: 'mandatory',
            },
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
            {
              id: 'service-ownership',
              label: 'Service Ownership',
              href: '/culture/service-ownership/',
              priority: 'mandatory',
            },
            {
              id: 'dr-policy',
              label: 'DR Policy & Stakeholders',
              href: '/culture/dr-policy/',
              priority: 'mandatory',
            },
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
            {
              id: 'sre-onboarding',
              label: 'SRE Onboarding',
              href: '/culture/sre-onboarding/',
              priority: 'nice',
            },
            {
              id: 'career-ladders',
              label: 'Career Ladders',
              href: '/culture/career-ladders/',
              priority: 'nice',
            },
            {
              id: 'team-topologies',
              label: 'Team Topologies',
              href: '/culture/team-topologies/',
              priority: 'mandatory',
            },
          ],
        },
      ],
    },
    {
      id: 'engineering',
      label: 'SRE Engineering',
      href: '/engineering/',
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
            {
              id: 'sli-based-alerting',
              label: 'SLI-based Alerting',
              href: '/engineering/sli-based-alerting/',
              priority: 'must',
            },
            {
              id: 'symptom-vs-cause-alerting',
              label: 'Symptom vs Cause Alerting',
              href: '/engineering/symptom-vs-cause-alerting/',
              priority: 'mandatory',
            },
            {
              id: 'alert-fatigue-management',
              label: 'Alert Fatigue Management',
              href: '/engineering/alert-fatigue-management/',
              priority: 'mandatory',
            },
            {
              id: 'telemetry-economics',
              label: 'Telemetry Economics',
              href: '/engineering/telemetry-economics/',
              priority: 'mandatory',
            },
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
              href: '/engineering/slo-engineering/',
              priority: 'must',
              children: [
                {
                  id: 'composite-slo-methodology',
                  label: 'Composite SLO Methodology',
                  href: '/engineering/composite-slo-methodology/',
                  priority: 'nice',
                },
              ],
            },
            {
              id: 'capacity-planning',
              label: 'Capacity Planning',
              href: '/engineering/capacity-planning/',
              priority: 'mandatory',
            },
            {
              id: 'resilience-patterns',
              label: 'Resilience Patterns',
              href: '/engineering/resilience-patterns/',
              priority: 'mandatory',
            },
            {
              id: 'systematic-troubleshooting',
              label: 'Systematic Troubleshooting',
              href: '/engineering/systematic-troubleshooting/',
              priority: 'must',
            },
            {
              id: 'chaos-engineering',
              label: 'Chaos Engineering',
              href: '/engineering/chaos-engineering/',
              priority: 'nice',
            },
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
            {
              id: 'networking',
              label: 'Networking',
              href: '/engineering/networking/',
              priority: 'must',
            },
            {
              id: 'operating-systems',
              label: 'Operating Systems',
              href: '/engineering/operating-systems/',
              priority: 'must',
            },
            {
              id: 'container-orchestration',
              label: 'Containerization & Orchestration',
              href: '/engineering/container-orchestration/',
              priority: 'must',
              children: [
                {
                  id: 'service-mesh',
                  label: 'Service Mesh',
                  href: '/engineering/service-mesh/',
                  priority: 'nice',
                },
              ],
            },
            {
              id: 'cloud-providers',
              label: 'Cloud Providers',
              href: '/engineering/cloud-providers/',
              priority: 'must',
            },
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
            {
              id: 'programming-languages',
              label: 'Programming Languages',
              href: '/engineering/programming-languages/',
              priority: 'must',
            },
            {
              id: 'shell-cli-craft',
              label: 'Shell & CLI Craft',
              href: '/engineering/shell-cli-craft/',
              priority: 'must',
            },
            {
              id: 'ci-cd',
              label: 'CI/CD',
              href: '/engineering/ci-cd/',
              priority: 'must',
            },
            {
              id: 'test-strategy',
              label: 'Test Strategy',
              href: '/engineering/test-strategy/',
              priority: 'mandatory',
            },
            {
              id: 'performance-profiling',
              label: 'Performance & Profiling',
              href: '/engineering/performance-profiling/',
              priority: 'mandatory',
            },
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
            {
              id: 'toil-tracking',
              label: 'Toil Tracking',
              href: '/engineering/toil-tracking/',
              priority: 'mandatory',
            },
            {
              id: 'toil-automation',
              label: 'Toil Automation',
              href: '/engineering/toil-automation/',
              priority: 'mandatory',
              children: [
                {
                  id: 'personal-sre-toolkit',
                  label: 'Personal SRE Toolkit',
                  href: '/engineering/personal-sre-toolkit/',
                  priority: 'nice',
                },
                {
                  id: 'chatops',
                  label: 'ChatOps',
                  href: '/engineering/chatops/',
                  priority: 'nice',
                },
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
            {
              id: 'infrastructure-as-code',
              label: 'Infrastructure as Code',
              href: '/engineering/infrastructure-as-code/',
              priority: 'mandatory',
            },
            {
              id: 'gitops',
              label: 'GitOps',
              href: '/engineering/gitops/',
              priority: 'nice',
            },
          ],
        },
        {
          // Отдельный L1, а не лист под IT Infrastructure или Toil Reduction:
          // главный объект здесь — внутренняя платформа как продукт для
          // команд-разработчиков, а не кластер и не автоматизация ручной
          // работы. Обоснование — inventory/platform-engineering-proposal.md.
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
            {
              id: 'platform-as-a-product',
              label: 'Platform as a Product',
              href: '/engineering/platform-as-a-product/',
              priority: 'must',
            },
            {
              id: 'golden-paths',
              label: 'Golden Paths',
              href: '/engineering/golden-paths/',
              priority: 'mandatory',
            },
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
            {
              id: 'backup-restore',
              label: 'Backup & Restore',
              href: '/engineering/backup-restore/',
              priority: 'must',
            },
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
            {
              id: 'cloud-cost-control',
              label: 'Cloud Cost Control',
              href: '/engineering/cloud-cost-control/',
              priority: 'mandatory',
            },
          ],
        },
      ],
    },
    {
      id: 'practices',
      label: 'SRE Practices',
      href: '/practices/',
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
              href: '/practices/incident-response/',
              priority: 'must',
              children: [
                {
                  id: 'war-room-patterns',
                  label: 'War Room Patterns',
                  href: '/practices/war-room-patterns/',
                  priority: 'nice',
                },
              ],
            },
            {
              id: 'on-call-rotation',
              label: 'On-Call Rotation',
              href: '/practices/on-call-rotation/',
              priority: 'must',
            },
            {
              id: 'severity-classification',
              label: 'Severity Classification',
              href: '/practices/severity-classification/',
              priority: 'mandatory',
            },
            {
              id: 'customer-communications',
              label: 'Customer Communications',
              href: '/practices/customer-communications/',
              priority: 'mandatory',
              children: [
                {
                  id: 'status-page-management',
                  label: 'Status Page Management',
                  href: '/practices/status-page-management/',
                  priority: 'mandatory',
                },
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
            {
              id: 'blameless-postmortem',
              label: 'Blameless Postmortem',
              href: '/practices/blameless-postmortem/',
              priority: 'must',
            },
            {
              id: 'action-items-tracking',
              label: 'Action Items Tracking',
              href: '/practices/action-items-tracking/',
              priority: 'mandatory',
            },
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
            {
              id: 'progressive-delivery',
              label: 'Progressive Delivery',
              href: '/practices/progressive-delivery/',
              priority: 'mandatory',
            },
            {
              id: 'change-governance',
              label: 'Change Governance',
              href: '/practices/change-governance/',
              priority: 'mandatory',
            },
          ],
        },
        {
          // Рантайм-периметр: чем закрыт работающий сервис и кто в него
          // имеет доступ. Всё, что относится к тому, как код пишется и
          // доезжает до прода, живёт в соседнем L1 Secure Development.
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
            {
              id: 'secrets-management',
              label: 'Secrets Management',
              href: '/practices/secrets-management/',
              priority: 'must',
            },
            {
              id: 'access-control-iam',
              label: 'Access Control & IAM',
              href: '/practices/access-control-iam/',
              priority: 'must',
              children: [
                {
                  id: 'workload-identity',
                  label: 'Workload Identity',
                  href: '/practices/workload-identity/',
                  priority: 'nice',
                },
              ],
            },
            {
              id: 'security-chaos-engineering',
              label: 'Security Chaos Engineering',
              href: '/practices/security-chaos-engineering/',
              priority: 'ondemand',
            },
            {
              id: 'compliance-frameworks',
              label: 'Compliance Frameworks',
              href: '/practices/compliance-frameworks/',
              priority: 'ondemand',
            },
          ],
        },
        {
          // Безопасность на пути «дизайн → код → сборка → зависимости»:
          // выделена из Information Security, где девять листьев в одном
          // списке читались как свалка, а связаны они были границами, а не
          // вложенностью.
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
            {
              id: 'threat-modeling',
              label: 'Threat Modeling',
              href: '/practices/threat-modeling/',
              priority: 'mandatory',
            },
            {
              id: 'security-code-review',
              label: 'Security Code Review',
              href: '/practices/security-code-review/',
              priority: 'mandatory',
            },
            {
              id: 'vulnerability-management',
              label: 'Vulnerability Management',
              href: '/practices/vulnerability-management/',
              priority: 'mandatory',
            },
            {
              id: 'supply-chain-security',
              label: 'Supply Chain Security',
              href: '/practices/supply-chain-security/',
              priority: 'mandatory',
            },
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
            {
              id: 'architecture-decision-records',
              label: 'Architecture Decision Records',
              href: '/practices/architecture-decision-records/',
              priority: 'mandatory',
            },
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
            {
              id: 'personal-growth-plan',
              label: 'Personal Growth Plan',
              href: '/practices/personal-growth-plan/',
              priority: 'mandatory',
            },
            {
              id: 'mentoring-as-practice',
              label: 'Mentoring as Practice',
              href: '/practices/mentoring-as-practice/',
              priority: 'nice',
            },
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
            {
              id: 'one-on-ones',
              label: 'One-on-Ones',
              href: '/practices/one-on-ones/',
              priority: 'mandatory',
            },
            {
              id: 'calibration-meeting',
              label: 'Calibration Meeting',
              href: '/practices/calibration-meeting/',
              priority: 'mandatory',
            },
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
            {
              id: 'vendor-reliability',
              label: 'Vendor Reliability',
              href: '/practices/vendor-reliability/',
              priority: 'ondemand',
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

/**
 * Все листья одного L1 плоским списком: родитель, сразу за ним его дети,
 * дальше следующий родитель. Нужен там, где вложенность не важна, а важен
 * состав — счётчики практик и полные перечни.
 */
export function leavesOf(l1: L1): LeafNode[] {
  return (l1.leaves ?? []).flatMap((leaf) => [leaf, ...(leaf.children ?? [])]);
}

/** Сколько всего листьев под L1 с учётом подлистов. */
export function countLeaves(l1: L1): number {
  return leavesOf(l1).length;
}

/**
 * URL hub-страницы L1: /<branch>/<l1-id>/, например
 * /culture/relationship-management/.
 *
 * Путь выводится из branch.href и l1.id, а не хранится отдельным полем:
 * иначе он мог бы разъехаться с файлом
 * src/content/docs/<branch>/<l1-id>.mdx, который его и порождает.
 */
export function l1Href(branch: Branch, l1: L1): string {
  return `${branch.href}${l1.id}/`;
}

/**
 * Где мы находимся в графе. Используется хлебными крошками и футером,
 * чтобы не разбирать pathname в каждом компоненте заново.
 *
 * path — путь БЕЗ base-префикса, со слешем на конце.
 */
export type PageContext =
  | { kind: 'branch'; branch: Branch }
  | { kind: 'l1'; branch: Branch; l1: L1 }
  | { kind: 'leaf'; branch: Branch; l1: L1; leaf: LeafNode; parent?: Leaf };

export function findPageContext(path: string): PageContext | null {
  const normalized = path.endsWith('/') ? path : `${path}/`;

  for (const branch of roadmap.branches) {
    if (normalized === branch.href) return { kind: 'branch', branch };
    if (!normalized.startsWith(branch.href)) continue;

    // Под ветвью один плоский уровень: /culture/<name>/. Что такое <name> —
    // hub или практика, — решает не форма адреса, а данные. Сначала L1:
    // их два десятка против семидесяти листьев, и имя L1 не может совпасть
    // со slug'ом листа той же ветви (проверяет tools/data/check.ts).
    const name = normalized.slice(branch.href.length).replace(/\/$/, '');
    if (name.includes('/')) return null;

    const l1 = branch.l1.find((l) => l.id === name);
    if (l1) return { kind: 'l1', branch, l1 };

    const ctx = findLeafContext(branch.id, name);
    if (ctx) {
      return { kind: 'leaf', branch: ctx.branch, l1: ctx.l1, leaf: ctx.leaf, parent: ctx.parent };
    }
  }

  return null;
}

export interface LeafContext {
  branch: Branch;
  l1: L1;
  leaf: LeafNode;
  /** Родительский лист — только если текущий узел подлист. */
  parent?: Leaf;
  /** Соседи по фактическому родителю: другие дети либо другие листья L1. */
  siblings: LeafNode[];
  /** Дети текущего листа; у подлиста всегда пусто. */
  children: SubLeaf[];
}

/**
 * Найти контекст листа по branchId + leafId. Используется Footer.astro
 * для рендеринга «↑ Раздел» + блока соседних практик на leaf-страницах и
 * findPageContext() для хлебных крошек.
 *
 * Ищет на обоих уровнях: сначала среди листьев L1, потом среди их детей.
 * Соседи считаются от фактического родителя — у подлиста это другие дети
 * того же листа, а не все листья L1.
 *
 * Возвращает null, если лист не зарегистрирован в roadmap.ts — это OK,
 * Footer просто не отрисует контекстный блок.
 */
export function findLeafContext(branchId: string, leafId: string): LeafContext | null {
  const branch = roadmap.branches.find((b) => b.id === branchId);
  if (!branch) return null;
  for (const l1 of branch.l1) {
    const leaves = l1.leaves ?? [];

    const leaf = leaves.find((l) => l.id === leafId);
    if (leaf) {
      return {
        branch,
        l1,
        leaf,
        siblings: leaves.filter((l) => l.id !== leafId),
        children: leaf.children ?? [],
      };
    }

    for (const parent of leaves) {
      const children = parent.children ?? [];
      const child = children.find((c) => c.id === leafId);
      if (child) {
        return {
          branch,
          l1,
          leaf: child,
          parent,
          siblings: children.filter((c) => c.id !== leafId),
          children: [],
        };
      }
    }
  }
  return null;
}
