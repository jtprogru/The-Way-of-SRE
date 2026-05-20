// Lucide-style SVG path data для иконок branch-узлов.
// Виден как 24×24, stroke-based; на branch-узле рисуется через
// `transform: translate(...) scale(20/24)`.
//
// Иконки выбраны по семантике ветви:
//   culture     — users (люди и команды)
//   engineering — server (инфраструктура и код)
//   practices   — clipboard-check (процессы и ритуалы)

export const BRANCH_ICONS: Record<string, string> = {
  culture:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  engineering:
    'M2 4h20v6H2z M2 14h20v6H2z M6 7h.01 M6 17h.01',
  practices:
    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 3h6v4H9z M9 14l2 2 4-4',
};

export const BRANCH_ICON_W = 20;
export const BRANCH_ICON_GAP = 10;
