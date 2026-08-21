// Источник правды для структуры роадмапа: типы узлов, сборка графа и запросы
// к нему. Сами данные лежат по файлу на ветвь — src/data/branches/culture.ts,
// engineering.ts, practices.ts, — и здесь только склеиваются в один объект.
//
// За что отвечают данные ветви (и НИЧТО другое):
//   - L1-узлы ветви и их порядок
//   - priorities L1 (must / mandatory / nice / ondemand) — используется
//     /priorities/ на сайте и цветовой разметкой `PriorityMap`
//   - l2 — инвентарь концептов каждого L1 в осмысленном порядке
//   - leaves под L1 (фактически написанные leaf-страницы)
//
// За что отвечают src/content/docs/{culture,engineering,practices}/<l1>.mdx:
//   - описание L1 прозой, и только оно
//
// src/content/docs/methodology.mdx — методологический документ про ось
// priority и ось SFIA, он тоже НЕ содержит данных (только определения и
// ссылки сюда).
//
// Порядок действий для нового листа и нового L1 описан в CONTRIBUTING.md,
// структурные инварианты проверяет `make data-check` (tools/data/check.ts).
import { culture } from './branches/culture.ts';
import { engineering } from './branches/engineering.ts';
import { practices } from './branches/practices.ts';

export type Priority = 'must' | 'mandatory' | 'nice' | 'ondemand';

// ---------------------------------------------------------------------------
// Что пишется руками в src/data/branches/*.ts
//
// От собранных типов ниже исходные отличаются ровно одним: в них нет `href`.
// Адрес узла выводится из id при сборке, см. buildBranch().
// ---------------------------------------------------------------------------

/**
 * Подлист — уточнение конкретного листа (`runbooks → playbooks`), а не
 * самостоятельная практика уровня L1. Детей у него нет намеренно: глубина
 * ограничена одним уровнем не соглашением, а типом. Попытка вложить подлист
 * в подлист — ошибка компиляции (excess property check на литералах в
 * файлах ветвей).
 *
 * Упёрлись в глубину — значит родитель дорос до L1: повышаем узел, правка
 * того же файла.
 *
 * Приоритет у подлиста собственный: вложенная практика вполне может быть
 * важнее родительской на фоне всей карты, наследование это скрывало бы.
 */
export interface SubLeafSource {
  id: string;
  label: string;
  priority: Priority;
}

export interface LeafSource extends SubLeafSource {
  children?: SubLeafSource[];
}

export interface L1Source {
  id: string;
  label: string;
  priority: Priority;
  /**
   * Концепты домена в осмысленном порядке — тот срез, который читатель видит
   * строкой «L2-концепты» на hub-странице. Список полный: и то, что уже
   * расписано листом, и то, что пока только названо. Разница видна по
   * наличию листа с тем же label, отдельным флагом не хранится.
   *
   * L2 и leaves — два разных факта об одном домене: инвентарь концептов и
   * набор написанных страниц. Пересекаются они по имени: концепт, у которого
   * есть лист, рендерится ссылкой на него (L2Concepts.astro). Инвариант
   * «каждый лист назван в l2 своего L1» держит tools/data/check.ts —
   * переименовали лист и забыли инвентарь, `make check` не пройдёт.
   *
   * Поле обязательное: L1 без инвентаря — это заголовок без содержания,
   * такую страницу нечем наполнить.
   */
  l2: string[];
  leaves?: LeafSource[];
}

/**
 * Ветвь целиком. Порядок L1 задаётся только этим массивом: страницы ветвей и
 * сайдбар рендерят карточки и группы из данных, руками нигде не перечисляются.
 *
 * Инвариант: у каждого L1 должна быть страница
 * src/content/docs/<branch>/<l1-id>.mdx — её адрес выводится из данных через
 * l1Href(). При добавлении или переименовании L1 заводить или переименовывать
 * страницу тем же PR, иначе карточка на странице ветви будет вести в никуда.
 */
export interface BranchSource {
  id: string;
  label: string;
  priority: Priority;
  l1: L1Source[];
}

// ---------------------------------------------------------------------------
// Что получается после сборки — то, с чем работают компоненты
// ---------------------------------------------------------------------------

/** Общая часть листа и подлиста: то, что рисуется как узел графа. */
export interface LeafNode extends SubLeafSource {
  href: string;
}

export type SubLeaf = LeafNode;

export interface Leaf extends LeafNode {
  children?: SubLeaf[];
}

export interface L1 extends L1Source {
  leaves?: Leaf[];
}

export interface Branch extends BranchSource {
  href: string;
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

/**
 * Достроить ветви адресами. Адрес нигде не хранится полем: иначе он мог бы
 * разъехаться с id узла и с файлом страницы, а сверять их пришлось бы глазами.
 *
 * Адрес листа плоский независимо от вложенности — /<branch>/<slug>/, рядом с
 * hub-страницами L1 той же ветви. Перевесить лист под другой L1 = поменять
 * одну строку в файле ветви, без редиректов: адрес от родителя не зависит.
 * Отсюда два ограничения. Подлист живёт в той же ветви, что и родитель, иначе
 * findLeafContext() его не найдёт (ветвь берётся из URL). И slug листа не
 * может совпасть с id L1 этой же ветви — они делят одно пространство имён,
 * совпадение ловит tools/data/check.ts.
 */
function buildBranch(source: BranchSource): Branch {
  const href = `/${source.id}/`;
  const leafHref = (id: string) => `${href}${id}/`;

  return {
    ...source,
    href,
    l1: source.l1.map((l1) => ({
      ...l1,
      leaves: l1.leaves?.map((leaf) => ({
        ...leaf,
        href: leafHref(leaf.id),
        children: leaf.children?.map((child) => ({ ...child, href: leafHref(child.id) })),
      })),
    })),
  };
}

export const roadmap: Roadmap = {
  root: 'SRE',
  branches: [culture, engineering, practices].map(buildBranch),
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
 * Возвращает null, если лист не зарегистрирован в данных ветви — это OK,
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
