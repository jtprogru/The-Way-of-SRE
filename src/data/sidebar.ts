// Построитель левого сайдбара Starlight из src/data/roadmap.ts.
//
// Зачем отдельный файл: roadmap.ts — это данные графа и лукапы по ним, он
// ничего не знает про Starlight. Здесь живёт единственное место, где
// структура «ветвь → L1 → лист → подлист» превращается в формат конфига
// сайдбара.
//
// Инвариант: список листьев в astro.config.mjs не дублируется — добавление
// нового листа требует правки ТОЛЬКО roadmap.ts.

import { l1Href, roadmap, type Branch, type Leaf } from './roadmap';
import { navFor } from './nav';

export interface SidebarLink {
  label: string;
  link: string;
}

export interface SidebarGroup {
  label: string;
  collapsed: boolean;
  items: SidebarEntry[];
}

export type SidebarEntry = SidebarLink | SidebarGroup;

/**
 * Один лист сайдбара. Без детей — обычная ссылка; с детьми — группа, где
 * первым пунктом идёт сама практика (группа в Starlight ссылкой быть не
 * может), а следом её уточнения. Тот же приём, что «Обзор ветви» у ветви
 * и «Обзор раздела» у L1.
 */
function buildLeafEntry(leaf: Leaf): SidebarEntry {
  const children = leaf.children ?? [];
  if (children.length === 0) {
    return { label: leaf.label, link: leaf.href };
  }
  return {
    label: leaf.label,
    collapsed: true,
    items: [
      { label: 'Обзор практики', link: leaf.href },
      ...children.map((child) => ({ label: child.label, link: child.href })),
    ],
  };
}

/**
 * Одна ветвь как свёрнутая группа сайдбара: «Обзор ветви» + по группе
 * на каждый L1 с листьями.
 *
 * L1 без листьев в сайдбар не попадают: вести на них некуда, а на
 * branch-странице они и так видны в inventory L2-концептов.
 */
export function buildBranchSidebar(branch: Branch): SidebarGroup {
  return {
    label: branch.label,
    collapsed: true,
    items: [
      { label: 'Обзор ветви', link: branch.href },
      ...branch.l1
        .filter((l1) => (l1.leaves ?? []).length > 0)
        .map((l1) => ({
          label: l1.label,
          collapsed: true,
          items: [
            // Группа в Starlight сама по себе не ссылка, поэтому hub-страница
            // L1 достаётся первым пунктом — как «Обзор ветви» у ветви.
            { label: 'Обзор раздела', link: l1Href(branch, l1) },
            ...(l1.leaves ?? []).map(buildLeafEntry),
          ],
        })),
    ],
  };
}

/**
 * Все ветви роадмапа для секции `sidebar` в astro.config.mjs.
 * Порядок ветвей, L1 и листьев диктует roadmap.ts.
 */
export function buildRoadmapSidebar(): SidebarGroup[] {
  return roadmap.branches.map(buildBranchSidebar);
}

/**
 * Мета-страницы, которые в сайдбаре живут на верхнем уровне,
 * а не внутри группы «Справочник».
 */
export function buildTopLevelDocNav(): SidebarLink[] {
  return navFor('sidebar')
    .filter((e) => e.topLevel)
    .map((e) => ({ label: e.label, link: e.href }));
}

/** Группа «Справочник» — остальные мета-страницы из nav.ts. */
export function buildReferenceGroup(): SidebarGroup {
  return {
    label: 'Справочник',
    collapsed: true,
    items: navFor('sidebar')
      .filter((e) => !e.topLevel)
      .map((e) => ({ label: e.label, link: e.href })),
  };
}
