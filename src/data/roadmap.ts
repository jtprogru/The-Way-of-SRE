// Источник правды для структуры роадмапа на уровне L1 + leaves и для priorities.
//
// За что отвечает этот файл (и НИЧТО другое):
//   - L1-узлы каждой ветви и их порядок
//   - priorities L1 (must / mandatory / nice / ondemand) — используется
//     /priorities/ на сайте и цветовой разметкой `PriorityMap`
//   - leaves под L1 (фактически написанные leaf-страницы)
//
// За что отвечают src/content/docs/sre-{culture,engineering,practices}/<l1>.mdx:
//   - описание L1 и его L2 inventory концептов компетенций
//   - L2-узлы (Stakeholder Management, Metrics, IaC и т.п.) живут ТОЛЬКО там;
//     это потенциальные подкомпетенции, не leaf-страницы
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
// Leaves создаются в src/content/docs/leaves/<branch>/<slug>.md и
// регистрируются здесь под соответствующим L1 — либо, если лист уточняет
// другой лист, в его `children` (ровно один уровень вложенности, см. типы
// ниже). Отдельно в навигации их прописывать не нужно: левый сайдбар
// строится из этого файла через src/data/sidebar.ts.
//
// URL листа плоский независимо от вложенности — /leaves/<branch>/<slug>/.
// Перевесить лист = поменять одну строку здесь, без редиректов. Отсюда
// ограничение: подлист живёт в той же ветви, что и родитель, иначе
// findLeafContext() его не найдёт (ветвь берётся из URL).
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
              id: 'stakeholder-management',
              label: 'Stakeholder Management',
              href: '/leaves/culture/stakeholder-management/',
              priority: 'mandatory',
              children: [
                {
                  id: 'dev-team-partnership',
                  label: 'Dev Team Partnership',
                  href: '/leaves/culture/dev-team-partnership/',
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
          leaves: [
            {
              id: 'postmortem-culture',
              label: 'Postmortem Culture',
              href: '/leaves/culture/postmortem-culture/',
              priority: 'must',
            },
            {
              id: 'game-day',
              label: 'Game Day / Chaos Drills',
              href: '/leaves/culture/game-day/',
              priority: 'must',
            },
            {
              id: 'communities-of-practice',
              label: 'Communities of Practice',
              href: '/leaves/culture/communities-of-practice/',
              priority: 'nice',
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
              priority: 'must',
            },
            {
              id: 'dora-metrics',
              label: 'DORA Metrics',
              href: '/leaves/culture/dora-metrics/',
              priority: 'mandatory',
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
              priority: 'must',
            },
            {
              id: 'playbooks',
              label: 'Playbooks',
              href: '/leaves/culture/playbooks/',
              priority: 'mandatory',
            },
            {
              id: 'postmortem-database',
              label: 'Postmortem Database',
              href: '/leaves/culture/postmortem-database/',
              priority: 'mandatory',
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
              priority: 'mandatory',
            },
            {
              id: 'dr-policy',
              label: 'DR Policy & Stakeholders',
              href: '/leaves/culture/dr-policy/',
              priority: 'mandatory',
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
              priority: 'nice',
            },
            {
              id: 'career-ladders',
              label: 'Career Ladders',
              href: '/leaves/culture/career-ladders/',
              priority: 'nice',
            },
            {
              id: 'team-topologies',
              label: 'Team Topologies',
              href: '/leaves/culture/team-topologies/',
              priority: 'mandatory',
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
              priority: 'must',
            },
            {
              id: 'symptom-vs-cause-alerting',
              label: 'Symptom vs Cause Alerting',
              href: '/leaves/engineering/symptom-vs-cause-alerting/',
              priority: 'mandatory',
            },
            {
              id: 'alert-fatigue-management',
              label: 'Alert Fatigue Management',
              href: '/leaves/engineering/alert-fatigue-management/',
              priority: 'mandatory',
            },
            {
              id: 'telemetry-economics',
              label: 'Telemetry Economics',
              href: '/leaves/engineering/telemetry-economics/',
              priority: 'mandatory',
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
              priority: 'must',
              children: [
                {
                  id: 'composite-slo-methodology',
                  label: 'Composite SLO Methodology',
                  href: '/leaves/engineering/composite-slo-methodology/',
                  priority: 'nice',
                },
              ],
            },
            {
              id: 'capacity-planning',
              label: 'Capacity Planning',
              href: '/leaves/engineering/capacity-planning/',
              priority: 'mandatory',
            },
            {
              id: 'resilience-patterns',
              label: 'Resilience Patterns',
              href: '/leaves/engineering/resilience-patterns/',
              priority: 'mandatory',
            },
            {
              id: 'systematic-troubleshooting',
              label: 'Systematic Troubleshooting',
              href: '/leaves/engineering/systematic-troubleshooting/',
              priority: 'must',
            },
            {
              id: 'chaos-engineering',
              label: 'Chaos Engineering',
              href: '/leaves/engineering/chaos-engineering/',
              priority: 'nice',
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
              priority: 'must',
            },
            {
              id: 'operating-systems',
              label: 'Operating Systems',
              href: '/leaves/engineering/operating-systems/',
              priority: 'must',
            },
            {
              id: 'container-orchestration',
              label: 'Containerization & Orchestration',
              href: '/leaves/engineering/container-orchestration/',
              priority: 'must',
              children: [
                {
                  id: 'service-mesh',
                  label: 'Service Mesh',
                  href: '/leaves/engineering/service-mesh/',
                  priority: 'nice',
                },
              ],
            },
            {
              id: 'cloud-providers',
              label: 'Cloud Providers',
              href: '/leaves/engineering/cloud-providers/',
              priority: 'must',
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
              priority: 'must',
            },
            {
              id: 'shell-cli-craft',
              label: 'Shell & CLI Craft',
              href: '/leaves/engineering/shell-cli-craft/',
              priority: 'must',
            },
            {
              id: 'ci-cd',
              label: 'CI/CD',
              href: '/leaves/engineering/ci-cd/',
              priority: 'must',
            },
            {
              id: 'test-strategy',
              label: 'Test Strategy',
              href: '/leaves/engineering/test-strategy/',
              priority: 'mandatory',
            },
            {
              id: 'performance-profiling',
              label: 'Performance & Profiling',
              href: '/leaves/engineering/performance-profiling/',
              priority: 'mandatory',
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
              priority: 'mandatory',
            },
            {
              id: 'toil-automation',
              label: 'Toil Automation',
              href: '/leaves/engineering/toil-automation/',
              priority: 'mandatory',
              children: [
                {
                  id: 'personal-sre-toolkit',
                  label: 'Personal SRE Toolkit',
                  href: '/leaves/engineering/personal-sre-toolkit/',
                  priority: 'nice',
                },
                {
                  id: 'chatops',
                  label: 'ChatOps',
                  href: '/leaves/engineering/chatops/',
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
          leaves: [
            {
              id: 'infrastructure-as-code',
              label: 'Infrastructure as Code',
              href: '/leaves/engineering/infrastructure-as-code/',
              priority: 'mandatory',
            },
            {
              id: 'gitops',
              label: 'GitOps',
              href: '/leaves/engineering/gitops/',
              priority: 'nice',
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
              priority: 'must',
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
              priority: 'mandatory',
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
              priority: 'must',
              children: [
                {
                  id: 'war-room-patterns',
                  label: 'War Room Patterns',
                  href: '/leaves/practices/war-room-patterns/',
                  priority: 'nice',
                },
              ],
            },
            {
              id: 'on-call-rotation',
              label: 'On-Call Rotation',
              href: '/leaves/practices/on-call-rotation/',
              priority: 'must',
            },
            {
              id: 'severity-classification',
              label: 'Severity Classification',
              href: '/leaves/practices/severity-classification/',
              priority: 'mandatory',
            },
            {
              id: 'customer-communications',
              label: 'Customer Communications',
              href: '/leaves/practices/customer-communications/',
              priority: 'mandatory',
              children: [
                {
                  id: 'status-page-management',
                  label: 'Status Page Management',
                  href: '/leaves/practices/status-page-management/',
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
          leaves: [
            {
              id: 'blameless-postmortem',
              label: 'Blameless Postmortem',
              href: '/leaves/practices/blameless-postmortem/',
              priority: 'must',
            },
            {
              id: 'action-items-tracking',
              label: 'Action Items Tracking',
              href: '/leaves/practices/action-items-tracking/',
              priority: 'mandatory',
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
              priority: 'mandatory',
            },
            {
              id: 'change-governance',
              label: 'Change Governance',
              href: '/leaves/practices/change-governance/',
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
          leaves: [
            {
              id: 'secrets-management',
              label: 'Secrets Management',
              href: '/leaves/practices/secrets-management/',
              priority: 'must',
            },
            {
              id: 'access-control-iam',
              label: 'Access Control & IAM',
              href: '/leaves/practices/access-control-iam/',
              priority: 'must',
              children: [
                {
                  id: 'workload-identity',
                  label: 'Workload Identity',
                  href: '/leaves/practices/workload-identity/',
                  priority: 'nice',
                },
              ],
            },
            {
              id: 'security-chaos-engineering',
              label: 'Security Chaos Engineering',
              href: '/leaves/practices/security-chaos-engineering/',
              priority: 'ondemand',
            },
            {
              id: 'compliance-frameworks',
              label: 'Compliance Frameworks',
              href: '/leaves/practices/compliance-frameworks/',
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
          leaves: [
            {
              id: 'threat-modeling',
              label: 'Threat Modeling',
              href: '/leaves/practices/threat-modeling/',
              priority: 'mandatory',
            },
            {
              id: 'security-code-review',
              label: 'Security Code Review',
              href: '/leaves/practices/security-code-review/',
              priority: 'mandatory',
            },
            {
              id: 'vulnerability-management',
              label: 'Vulnerability Management',
              href: '/leaves/practices/vulnerability-management/',
              priority: 'mandatory',
            },
            {
              id: 'supply-chain-security',
              label: 'Supply Chain Security',
              href: '/leaves/practices/supply-chain-security/',
              priority: 'mandatory',
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
              priority: 'mandatory',
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
              priority: 'mandatory',
            },
            {
              id: 'mentoring-as-practice',
              label: 'Mentoring as Practice',
              href: '/leaves/practices/mentoring-as-practice/',
              priority: 'nice',
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
              priority: 'mandatory',
            },
            {
              id: 'calibration-meeting',
              label: 'Calibration Meeting',
              href: '/leaves/practices/calibration-meeting/',
              priority: 'mandatory',
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
 * /sre-culture/relationship-management/.
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

  const leafMatch = normalized.match(/^\/leaves\/([^/]+)\/([^/]+)\/$/);
  if (leafMatch) {
    const ctx = findLeafContext(leafMatch[1], leafMatch[2]);
    return ctx
      ? { kind: 'leaf', branch: ctx.branch, l1: ctx.l1, leaf: ctx.leaf, parent: ctx.parent }
      : null;
  }

  for (const branch of roadmap.branches) {
    if (normalized === branch.href) return { kind: 'branch', branch };
    if (!normalized.startsWith(branch.href)) continue;
    const l1Id = normalized.slice(branch.href.length).replace(/\/$/, '');
    const l1 = branch.l1.find((l) => l.id === l1Id);
    if (l1) return { kind: 'l1', branch, l1 };
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
