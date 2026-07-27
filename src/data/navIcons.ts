// Иконки узлов верхнего уровня в левой навигации.
//
// Зачем: в сайдбаре восемь пунктов верхнего уровня — четыре сервисных
// (карта, приоритеты, дерево, порядок построения), три ветви и
// «Справочник». Списком они читаются одинаково весомо и занимают экран;
// с глифом слева взгляд цепляется за форму, а не за длину подписи.
// Второе применение — свёрнутый сайдбар (rail шириной 3.25rem), где от
// пункта остаётся только иконка, и без неё навигация исчезла бы совсем.
//
// Формат тот же, что у branchIcons.ts: lucide-подобный path data в
// координатах 24×24, stroke-based. Несколько субпутей в одной строке `d`
// — это нормально, браузер рисует их как один path.
//
// Иконки ветвей не дублируются: BRANCH_ICONS уже описывает culture /
// engineering / practices для Spider и MindMap, здесь тот же источник.

import { BRANCH_ICONS } from './branchIcons';

/** Ключ иконки — то, что кладётся в NavNode.icon. */
export type NavIconName =
  | 'map'
  | 'priorities'
  | 'tree'
  | 'layers'
  | 'book'
  | 'culture'
  | 'engineering'
  | 'practices';

export const NAV_ICONS: Record<NavIconName, string> = {
  // map — карта компетенций
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15',
  // list-checks — приоритеты
  priorities: 'M9 6h12 M9 12h12 M9 18h12 M3 6l1.5 1.5L7 4.5 M3 12l1.5 1.5L7 10.5 M3 18l1.5 1.5L7 16.5',
  // git-fork — полное дерево
  tree:
    'M12 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M6 8v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8 M12 12v6',
  // layers — порядок построения (пирамида надёжности)
  layers: 'M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  // book-open — справочник
  book:
    'M12 7v14 M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
  culture: BRANCH_ICONS.culture,
  engineering: BRANCH_ICONS.engineering,
  practices: BRANCH_ICONS.practices,
};
