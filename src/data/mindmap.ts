// Геометрия витринной mind map (/mindmap/, см. #109).
//
// Инвариант: состав графа живёт ТОЛЬКО в roadmap.ts. Здесь нет ни одного
// имени узла — ветви, L1, листья и подлисты приходят из roadmap, файл
// отвечает исключительно за раскладку: какая ветвь на какой стороне, какой
// ширины колонка, на какой высоте узел. Добавленный в roadmap.ts лист
// появляется на карте сам, как и в сайдбаре (src/data/sidebar.ts).
//
// Почему геометрия отдельным модулем, а не внутри компонента: тот же расчёт
// нужен клиентскому скрипту. Сворачивание узла меняет высоты, и вместо
// второй реализации раскладки на JS компонент импортирует layoutY() и
// пересчитывает те же координаты в браузере. Одна формула на билд и на
// рантайм.
//
// Раскладка — двустороннее горизонтальное дерево: корень по центру,
// четыре колонки в каждую сторону (ветвь → L1 → лист → подлист). По X
// координаты фиксированы и от сворачивания не зависят: колонки считаются
// по самой длинной подписи ветви и при сворачивании не должны прыгать.
// Меняется только Y, поэтому layoutY() отдаёт лишь его.

import { l1Href, roadmap, type Branch, type Priority } from './roadmap';

export type MindMapKind = 'root' | 'branch' | 'l1' | 'leaf' | 'subleaf';
export type Side = 'left' | 'right';

/**
 * Распределение ветвей по сторонам. Ветвь целиком уходит на одну сторону:
 * разрыв ветви между сторонами дал бы более ровные высоты (40 против 27
 * листьев), но убил бы главную визуальную опору карты — «ветвь = цельный
 * цветной блок».
 *
 * Порядок внутри стороны — порядок отрисовки сверху вниз.
 */
export const SIDE_BRANCHES: Record<Side, readonly string[]> = {
  left: ['culture', 'practices'],
  right: ['engineering'],
};

// --- Геометрия -------------------------------------------------------------

/** Высота плашки любого узла кроме корня. */
export const NODE_H = 30;
/** Высота корневой плашки. */
export const ROOT_H = 42;
/** Шаг строки для терминального узла: высота плашки + воздух. */
export const ROW_H = 36;
/** Поля холста. */
export const PAD_X = 24;
export const PAD_Y = 24;
/** Промежуток между колонками. */
export const COL_GAP = 46;

/**
 * Дополнительный отступ между соседними детьми — по глубине родителя.
 * Ветви отделяются заметно, L1 внутри ветви слабее, листья почти слипаются:
 * так группировка читается без рамок.
 */
const SIBLING_GAP: Record<number, number> = {
  0: 34, // между ветвями
  1: 14, // между L1 внутри ветви
  2: 4, // между листьями внутри L1
  3: 0, // между подлистами
};

/** Ширина символа и минимальная ширина плашки — по типу узла. */
const CHAR_W: Record<MindMapKind, number> = {
  root: 11,
  branch: 8.2,
  l1: 7.2,
  leaf: 6.7,
  subleaf: 6.2,
};
const MIN_W: Record<MindMapKind, number> = {
  root: 84,
  branch: 190,
  l1: 200,
  leaf: 210,
  subleaf: 190,
};
// Горизонтальные поля плашки. Держат подпись от точки приоритета у
// внутренней грани и от кружка сворачивания у внешней: подпись
// центрируется, поэтому запас нужен симметричный.
const NODE_PAD_X = 46;

function estimateWidth(label: string, kind: MindMapKind): number {
  return Math.max(MIN_W[kind], Math.round(label.length * CHAR_W[kind]) + NODE_PAD_X);
}

/** Глубина по типу узла: корень 0, ветвь 1, L1 2, лист 3, подлист 4. */
const KIND_BY_DEPTH: MindMapKind[] = ['root', 'branch', 'l1', 'leaf', 'subleaf'];

// --- Граф ------------------------------------------------------------------

export interface MindMapNode {
  id: string;
  kind: MindMapKind;
  label: string;
  /** Путь без base-префикса. Есть у всех узлов кроме корня. */
  href?: string;
  priority?: Priority;
  /** id ветви — задаёт цвет узла. У корня пустая строка. */
  branchId: string;
  side: Side;
  depth: number;
  /** Левый край плашки. */
  x: number;
  width: number;
  parentId?: string;
  childIds: string[];
}

/** Ребро однозначно определяется ребёнком, поэтому id ребра = id ребёнка. */
export interface MindMapEdge {
  id: string;
  parentId: string;
  branchId: string;
  side: Side;
  /** Точка выхода из родителя и входа в ребёнка по X. */
  x1: number;
  x2: number;
}

export interface MindMapGraph {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  rootId: string;
  /** Ширина холста; высота зависит от свёрнутости и приходит из layoutY(). */
  width: number;
  /** Центр корневой плашки по X. */
  rootCx: number;
}

function sideOf(branchId: string): Side {
  if (SIDE_BRANCHES.left.includes(branchId)) return 'left';
  if (SIDE_BRANCHES.right.includes(branchId)) return 'right';
  // Новая ветвь в roadmap.ts, не разложенная по сторонам, молча пропала бы
  // с карты — а карта обязана обновляться сама. Поэтому падаем на сборке.
  throw new Error(
    `mindmap: ветвь "${branchId}" не распределена по сторонам, добавь её в SIDE_BRANCHES`,
  );
}

/** Ширины колонок стороны: индекс = глубина (1 ветвь … 4 подлист). */
function columnWidths(branches: Branch[]): number[] {
  const widths = [0, 0, 0, 0, 0];
  const bump = (depth: number, label: string) => {
    widths[depth] = Math.max(widths[depth], estimateWidth(label, KIND_BY_DEPTH[depth]));
  };
  for (const branch of branches) {
    bump(1, branch.label);
    for (const l1 of branch.l1) {
      bump(2, l1.label);
      for (const leaf of l1.leaves ?? []) {
        bump(3, leaf.label);
        for (const child of leaf.children ?? []) bump(4, child.label);
      }
    }
  }
  return widths;
}

/**
 * Весь граф с координатами по X. Строится на билде и, тем же кодом, в
 * браузере — клиентский скрипт берёт отсюда структуру для пересчёта Y.
 */
export function buildMindMap(): MindMapGraph {
  const branchesOf = (side: Side): Branch[] =>
    SIDE_BRANCHES[side]
      .map((id) => roadmap.branches.find((b) => b.id === id))
      .filter((b): b is Branch => Boolean(b));

  // Все ветви roadmap должны быть разложены по сторонам — проверяем разом,
  // чтобы ошибка вылезла на сборке, а не пропажей ветви на картинке.
  for (const branch of roadmap.branches) sideOf(branch.id);

  const cols: Record<Side, number[]> = {
    left: columnWidths(branchesOf('left')),
    right: columnWidths(branchesOf('right')),
  };

  const rootW = estimateWidth(roadmap.root, 'root');
  const sideSpan = (side: Side) =>
    cols[side].slice(1).reduce((sum, w) => sum + (w > 0 ? w + COL_GAP : 0), 0);

  const leftSpan = sideSpan('left');
  const rightSpan = sideSpan('right');
  const width = PAD_X * 2 + leftSpan + rootW + rightSpan;
  const rootX = PAD_X + leftSpan;
  const rootCx = rootX + rootW / 2;

  // Левый край колонки по глубине. Справа колонки уходят вправо от корня,
  // слева — зеркально влево, поэтому там считается правый край и вычитается
  // ширина.
  const colX: Record<Side, number[]> = { left: [], right: [] };
  let cursorRight = rootX + rootW;
  let cursorLeft = rootX;
  for (let depth = 1; depth <= 4; depth++) {
    cursorRight += COL_GAP;
    colX.right[depth] = cursorRight;
    cursorRight += cols.right[depth];

    cursorLeft -= COL_GAP + cols.left[depth];
    colX.left[depth] = cursorLeft;
  }

  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];
  const byId = new Map<string, MindMapNode>();

  const push = (node: MindMapNode) => {
    nodes.push(node);
    byId.set(node.id, node);
    if (node.parentId) {
      const parent = byId.get(node.parentId)!;
      parent.childIds.push(node.id);
      // Ребро выходит из той грани родителя, которая смотрит наружу, и
      // входит во внутреннюю грань ребёнка. Для корня «наружу» зависит от
      // стороны ребёнка, для остальных совпадает со стороной узла.
      const side = node.side;
      edges.push({
        id: node.id,
        parentId: node.parentId,
        branchId: node.branchId,
        side,
        x1: side === 'right' ? parent.x + parent.width : parent.x,
        x2: side === 'right' ? node.x : node.x + node.width,
      });
    }
    return node;
  };

  const rootId = 'root';
  push({
    id: rootId,
    kind: 'root',
    label: roadmap.root,
    branchId: '',
    side: 'right',
    depth: 0,
    x: rootX,
    width: rootW,
    childIds: [],
  });

  // Порядок обхода — сначала левая сторона, потом правая: так узлы одной
  // стороны лежат в массиве подряд, что удобно и для DOM, и для отладки.
  for (const side of ['left', 'right'] as const) {
    for (const branch of branchesOf(side)) {
      const branchNodeId = `b:${branch.id}`;
      push({
        id: branchNodeId,
        kind: 'branch',
        label: branch.label,
        href: branch.href,
        priority: branch.priority,
        branchId: branch.id,
        side,
        depth: 1,
        x: colX[side][1],
        width: cols[side][1],
        parentId: rootId,
        childIds: [],
      });

      for (const l1 of branch.l1) {
        const l1NodeId = `l:${branch.id}/${l1.id}`;
        push({
          id: l1NodeId,
          kind: 'l1',
          label: l1.label,
          href: l1Href(branch, l1),
          priority: l1.priority,
          branchId: branch.id,
          side,
          depth: 2,
          x: colX[side][2],
          width: cols[side][2],
          parentId: branchNodeId,
          childIds: [],
        });

        for (const leaf of l1.leaves ?? []) {
          const leafNodeId = `f:${branch.id}/${leaf.id}`;
          push({
            id: leafNodeId,
            kind: 'leaf',
            label: leaf.label,
            href: leaf.href,
            priority: leaf.priority,
            branchId: branch.id,
            side,
            depth: 3,
            x: colX[side][3],
            width: cols[side][3],
            parentId: l1NodeId,
            childIds: [],
          });

          for (const child of leaf.children ?? []) {
            push({
              id: `s:${branch.id}/${child.id}`,
              kind: 'subleaf',
              label: child.label,
              href: child.href,
              priority: child.priority,
              branchId: branch.id,
              side,
              depth: 4,
              x: colX[side][4],
              width: cols[side][4],
              parentId: leafNodeId,
              childIds: [],
            });
          }
        }
      }
    }
  }

  return { nodes, edges, rootId, width, rootCx };
}

// --- Раскладка по вертикали ------------------------------------------------

export interface MindMapLayout {
  /** Центр плашки по Y для каждого видимого узла. */
  y: Record<string, number>;
  /** Видимые узлы: свёрнутый узел остаётся, его потомки — нет. */
  visible: Set<string>;
  height: number;
}

/**
 * Классическая укладка дерева: терминальный узел занимает строку, родитель
 * центрируется между первым и последним ребёнком. Свёрнутый узел считается
 * терминальным, поэтому та же функция обслуживает и стартовое раскрытое
 * состояние, и любое свёрнутое.
 *
 * Стороны выравниваются по центру относительно корня: высота стороны
 * считается по числу занятых строк, более короткая сторона сдвигается вниз
 * на половину разницы.
 */
export function layoutY(graph: MindMapGraph, collapsed: Iterable<string> = []): MindMapLayout {
  const closed = new Set(collapsed);
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const y: Record<string, number> = {};
  const visible = new Set<string>([graph.rootId]);

  const place = (id: string, cursor: { v: number }): number => {
    const node = byId.get(id)!;
    visible.add(id);
    const kids = closed.has(id) ? [] : node.childIds;
    if (kids.length === 0) {
      const center = cursor.v + NODE_H / 2;
      cursor.v += ROW_H;
      y[id] = center;
      return center;
    }
    const gap = SIBLING_GAP[node.depth] ?? 0;
    const centers: number[] = [];
    kids.forEach((kid, i) => {
      if (i > 0) cursor.v += gap;
      centers.push(place(kid, cursor));
    });
    const center = (centers[0] + centers[centers.length - 1]) / 2;
    y[id] = center;
    return center;
  };

  const root = byId.get(graph.rootId)!;
  const sideHeights: Record<Side, number> = { left: 0, right: 0 };

  for (const side of ['left', 'right'] as const) {
    const cursor = { v: 0 };
    root.childIds
      .filter((id) => byId.get(id)!.side === side)
      .forEach((id, i) => {
        if (i > 0) cursor.v += SIBLING_GAP[0];
        place(id, cursor);
      });
    sideHeights[side] = cursor.v;
  }

  const contentH = Math.max(sideHeights.left, sideHeights.right);
  const offset: Record<Side, number> = {
    left: PAD_Y + (contentH - sideHeights.left) / 2,
    right: PAD_Y + (contentH - sideHeights.right) / 2,
  };
  for (const node of graph.nodes) {
    if (node.id === graph.rootId || y[node.id] === undefined) continue;
    y[node.id] += offset[node.side];
  }
  y[graph.rootId] = PAD_Y + contentH / 2;

  return { y, visible, height: contentH + PAD_Y * 2 };
}

/**
 * Ребро рисуется пологой кривой Безье: прямые линии на четырёх колонках
 * сливаются в сетку, а изгиб даёт глазу проследить путь от корня к листу.
 */
export function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = (x2 - x1) / 2;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

/**
 * viewBox под текущее состояние: по X обрезается до реально занятых колонок.
 * Ширина холста фиксирована и рассчитана на полностью раскрытое дерево, но
 * в свёрнутом состоянии правые/левые колонки пустуют, и без обрезки карта
 * ужималась бы в середину экрана с полями в треть ширины.
 */
export function viewBoxOf(graph: MindMapGraph, layout: MindMapLayout): string {
  let minX = Infinity;
  let maxX = -Infinity;
  for (const node of graph.nodes) {
    if (!layout.visible.has(node.id)) continue;
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + node.width);
  }
  return `${minX - PAD_X} 0 ${maxX - minX + PAD_X * 2} ${layout.height}`;
}
