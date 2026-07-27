// Построитель левого сайдбара Starlight из src/data/roadmap.ts.
//
// Зачем отдельный файл: roadmap.ts — это данные графа и лукапы по ним, он
// ничего не знает про Starlight. Здесь живёт единственное место, где
// структура «ветвь → L1 → лист» превращается в формат конфига сайдбара.
//
// Инвариант: список листьев в astro.config.mjs не дублируется — добавление
// нового листа требует правки ТОЛЬКО roadmap.ts.

import { roadmap, type Branch } from './roadmap';
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
          items: (l1.leaves ?? []).map((leaf) => ({
            label: leaf.label,
            link: leaf.href,
          })),
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
