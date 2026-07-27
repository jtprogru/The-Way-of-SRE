// Дерево левой навигации.
//
// Зачем отдельный файл: roadmap.ts — это данные графа и лукапы по ним, он
// ничего не знает про навигацию. Здесь структура «ветвь → L1 → лист →
// подлист» дополняется мета-страницами из nav.ts и превращается в дерево.
//
// У дерева две проекции, и обе строятся отсюда:
//   - buildNavTree() — для src/components/NavTree.astro, который рисует
//     сайдбар. Там узел одновременно ссылка и родитель своих детей.
//   - toStarlightSidebar() — для секции `sidebar` в astro.config.mjs.
//     Видимый сайдбар из неё больше не рендерится (компонент Sidebar
//     переопределён), но Starlight берёт из неё порядок страниц для
//     пагинации «Предыдущая / Следующая».
//
// Инвариант: список листьев в astro.config.mjs не дублируется — добавление
// нового листа требует правки ТОЛЬКО roadmap.ts.

import { l1Href, roadmap, type Branch } from './roadmap';
import { navFor } from './nav';

/**
 * Узел навигации. В отличие от групп Starlight, узел может быть
 * одновременно ссылкой на свою страницу и родителем детей — именно этого
 * требует соответствие сайдбара хлебным крошкам.
 */
export interface NavNode {
  label: string;
  /** Путь без base-префикса. Нет только у чисто группирующих узлов. */
  href?: string;
  children?: NavNode[];
}

/** Пустой список детей превращаем в undefined: узел без детей — просто ссылка. */
function kids(nodes: NavNode[]): NavNode[] | undefined {
  return nodes.length > 0 ? nodes : undefined;
}

/**
 * Ветвь со всеми L1 и листьями.
 *
 * L1 без листьев в сайдбар не попадают: вести на них есть куда, но
 * дерево они не углубляют, а на branch-странице видны карточками.
 */
function branchNode(branch: Branch): NavNode {
  return {
    label: branch.label,
    href: branch.href,
    children: branch.l1
      .filter((l1) => (l1.leaves ?? []).length > 0)
      .map((l1) => ({
        label: l1.label,
        href: l1Href(branch, l1),
        children: (l1.leaves ?? []).map((leaf) => ({
          label: leaf.label,
          href: leaf.href,
          children: kids((leaf.children ?? []).map((c) => ({ label: c.label, href: c.href }))),
        })),
      })),
  };
}

/** Всё дерево сайдбара: мета-страницы, три ветви, «Справочник». */
export function buildNavTree(): NavNode[] {
  const meta = navFor('sidebar');
  return [
    { label: 'Карта компетенций', href: '/' },
    { label: 'Приоритеты', href: '/priorities/' },
    ...meta.filter((e) => e.topLevel).map((e) => ({ label: e.label, href: e.href })),
    ...roadmap.branches.map(branchNode),
    {
      label: 'Справочник',
      children: meta.filter((e) => !e.topLevel).map((e) => ({ label: e.label, href: e.href })),
    },
  ];
}

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
 * То же дерево в формате конфига Starlight. Группа там ссылкой быть не
 * может, поэтому узел с детьми разворачивается в группу, где первым
 * пунктом идёт он сам. Подпись этого пункта — та же, что у группы: в
 * пагинации она читается как имя страницы, а видимого дублирования нет,
 * сайдбар рисует NavTree.astro.
 */
function toEntry(node: NavNode): SidebarEntry {
  if (!node.children?.length) {
    return { label: node.label, link: node.href! };
  }
  return {
    label: node.label,
    collapsed: true,
    items: [
      ...(node.href ? [{ label: node.label, link: node.href }] : []),
      ...node.children.map(toEntry),
    ],
  };
}

export function toStarlightSidebar(): SidebarEntry[] {
  return buildNavTree().map(toEntry);
}
