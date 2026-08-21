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
// Слой называет свои листья одними id. Ни имени, ни адреса файл не хранит:
// раньше хранил и то и другое, и это было единственное место вне roadmap.ts,
// где узел карты лежал копией. Переименование листа копию не трогало, а
// проверять её было нечем — пирамида молча показывала прежнее имя.
//
// Инвариант: каждый id существует в roadmap.ts. Неизвестный роняет сборку в
// layerLeaves(), до неё то же самое ловит `make data-check` внятным текстом.

import { leavesOf, roadmap, type LeafNode } from './roadmap.ts';

export interface HierarchyLayer {
  /** Якорь для ссылок с других страниц. */
  id: string;
  /** 1 — фундамент пирамиды, 7 — вершина. */
  level: number;
  label: string;
  /** Одна фраза: что даёт слой и почему без него верхние не работают. */
  gist: string;
  /** id листьев из roadmap.ts; имя и адрес берутся оттуда же. */
  leaves: string[];
}

/** Слои в порядке снизу вверх: от фундамента к вершине. */
export const reliabilityHierarchy: HierarchyLayer[] = [
  {
    id: 'monitoring',
    level: 1,
    label: 'Monitoring',
    gist: 'Без измерений всё выше — угадывание: непонятно, сломано ли, насколько и стало ли лучше после починки.',
    leaves: [
      'slo-engineering',
      'sli-based-alerting',
      'symptom-vs-cause-alerting',
    ],
  },
  {
    id: 'incident-response',
    level: 2,
    label: 'Incident Response',
    gist: 'Сигнал превращается в действие: кто разбирает, по какой роли, за какое время.',
    leaves: [
      'incident-response',
      'on-call-rotation',
      'severity-classification',
    ],
  },
  {
    id: 'postmortem',
    level: 3,
    label: 'Postmortem / Root Cause Analysis',
    gist: 'Инцидент превращается в изменение системы, а не в устный опыт одного дежурного.',
    leaves: [
      'blameless-postmortem',
      'postmortem-culture',
      'systematic-troubleshooting',
    ],
  },
  {
    id: 'testing-release',
    level: 4,
    label: 'Testing + Release procedures',
    gist: 'Самая частая причина инцидентов — изменение; слой ограничивает ущерб от собственных релизов.',
    leaves: [
      'test-strategy',
      'ci-cd',
      'progressive-delivery',
    ],
  },
  {
    id: 'capacity-planning',
    level: 5,
    label: 'Capacity Planning',
    gist: 'Отказ от нехватки ресурсов — предсказуемый и потому предотвратимый класс отказов.',
    leaves: [
      'capacity-planning',
      'cost-management',
    ],
  },
  {
    id: 'development',
    level: 6,
    label: 'Development',
    gist: 'Надёжность закладывается в архитектуру и код, а не докручивается мониторингом сверху.',
    leaves: [
      'resilience-patterns',
      'infrastructure-as-code',
      'chaos-engineering',
    ],
  },
  {
    id: 'product',
    level: 7,
    label: 'Product',
    gist: 'Требуемый уровень надёжности — продуктовое решение: сколько недоступности переживёт пользователь и бизнес.',
    leaves: [
      'dev-team-partnership',
      'stakeholder-management',
      'slo-budget-review',
    ],
  },
];

/** Все листья карты по id. Уникальность id проверяет tools/data/check.ts. */
const leafById = new Map<string, LeafNode>(
  roadmap.branches.flatMap((b) =>
    b.l1.flatMap((l1) => leavesOf(l1).map((leaf): [string, LeafNode] => [leaf.id, leaf])),
  ),
);

/**
 * Листья слоя как узлы карты — с актуальными именем, адресом и приоритетом.
 *
 * Неизвестный id роняет сборку, а не пропускает ступень молча: слой без
 * листьев на странице выглядит осмысленно («практик пока нет»), и опечатка
 * дожила бы до продакшена.
 */
export function layerLeaves(layer: HierarchyLayer): LeafNode[] {
  return layer.leaves.map((id) => {
    const leaf = leafById.get(id);
    if (!leaf) {
      throw new Error(
        `reliabilityHierarchy: слой «${layer.id}» ссылается на несуществующий лист «${id}»`,
      );
    }
    return leaf;
  });
}
