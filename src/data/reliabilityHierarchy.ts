// Иерархия надёжности сервиса (Dickerson's Hierarchy of Service Reliability).
//
// Источник модели: Beyer et al., «Site Reliability Engineering» (O'Reilly, 2016),
// Part III, Figure III-1 «Service Reliability Hierarchy». Автор модели —
// Mikey Dickerson (Google SRE, позже US Digital Service).
//
// За что отвечает этот файл:
//   - 7 слоёв иерархии, снизу вверх (level 1 = фундамент)
//   - привязка слоёв к уже написанным листьям проекта
//
// Это ТРЕТЬЯ ось проекта, независимая от двух других:
//   - priority (must / mandatory / nice / ondemand) — src/data/roadmap.ts
//   - SFIA-уровень — фронт-маттер листьев
//   - иерархия надёжности (этот файл) — в каком порядке практики строятся
//
// Инвариант: каждый href должен указывать на существующий лист. При удалении
// или переименовании листа — синхронизировать с src/data/roadmap.ts.

export interface HierarchyLeafRef {
  label: string;
  href: string;
}

export interface HierarchyLayer {
  /** Якорь для ссылок с других страниц. */
  id: string;
  /** 1 — фундамент пирамиды, 7 — вершина. */
  level: number;
  label: string;
  /** Одна фраза: что даёт слой и почему без него верхние не работают. */
  gist: string;
  leaves: HierarchyLeafRef[];
}

/** Слои в порядке снизу вверх: от фундамента к вершине. */
export const reliabilityHierarchy: HierarchyLayer[] = [
  {
    id: 'monitoring',
    level: 1,
    label: 'Monitoring',
    gist: 'Без измерений всё выше — угадывание: непонятно, сломано ли, насколько и стало ли лучше после починки.',
    leaves: [
      { label: 'SLO Engineering', href: '/leaves/engineering/slo-engineering/' },
      { label: 'SLI-based Alerting', href: '/leaves/engineering/sli-based-alerting/' },
      { label: 'Symptom vs Cause Alerting', href: '/leaves/engineering/symptom-vs-cause-alerting/' },
    ],
  },
  {
    id: 'incident-response',
    level: 2,
    label: 'Incident Response',
    gist: 'Сигнал превращается в действие: кто разбирает, по какой роли, за какое время.',
    leaves: [
      { label: 'Incident Response', href: '/leaves/practices/incident-response/' },
      { label: 'On-Call Rotation', href: '/leaves/practices/on-call-rotation/' },
      { label: 'Severity Classification', href: '/leaves/practices/severity-classification/' },
    ],
  },
  {
    id: 'postmortem',
    level: 3,
    label: 'Postmortem / Root Cause Analysis',
    gist: 'Инцидент превращается в изменение системы, а не в устный опыт одного дежурного.',
    leaves: [
      { label: 'Blameless Postmortem', href: '/leaves/practices/blameless-postmortem/' },
      { label: 'Postmortem Culture', href: '/leaves/culture/postmortem-culture/' },
      { label: 'Systematic Troubleshooting', href: '/leaves/engineering/systematic-troubleshooting/' },
    ],
  },
  {
    id: 'testing-release',
    level: 4,
    label: 'Testing + Release procedures',
    gist: 'Самая частая причина инцидентов — изменение; слой ограничивает ущерб от собственных релизов.',
    leaves: [
      { label: 'Test Strategy', href: '/leaves/engineering/test-strategy/' },
      { label: 'CI/CD', href: '/leaves/engineering/ci-cd/' },
      { label: 'Progressive Delivery', href: '/leaves/practices/progressive-delivery/' },
    ],
  },
  {
    id: 'capacity-planning',
    level: 5,
    label: 'Capacity Planning',
    gist: 'Отказ от нехватки ресурсов — предсказуемый и потому предотвратимый класс отказов.',
    leaves: [
      { label: 'Capacity Planning', href: '/leaves/engineering/capacity-planning/' },
      { label: 'Cost Management', href: '/leaves/engineering/cost-management/' },
    ],
  },
  {
    id: 'development',
    level: 6,
    label: 'Development',
    gist: 'Надёжность закладывается в архитектуру и код, а не докручивается мониторингом сверху.',
    leaves: [
      { label: 'Resilience Patterns', href: '/leaves/engineering/resilience-patterns/' },
      { label: 'Infrastructure as Code', href: '/leaves/engineering/infrastructure-as-code/' },
      { label: 'Chaos Engineering', href: '/leaves/engineering/chaos-engineering/' },
    ],
  },
  {
    id: 'product',
    level: 7,
    label: 'Product',
    gist: 'Требуемый уровень надёжности — продуктовое решение: сколько недоступности переживёт пользователь и бизнес.',
    leaves: [
      { label: 'Dev Team Partnership', href: '/leaves/culture/dev-team-partnership/' },
      { label: 'Stakeholder Management', href: '/leaves/culture/stakeholder-management/' },
      { label: 'SLO / Budget Review', href: '/leaves/culture/slo-budget-review/' },
    ],
  },
];
