// Единственный источник состава doc-nav (мета-страницы) и соцссылок.
//
// До этого файла список мета-страниц был продублирован в четырёх местах —
// astro.config.mjs, SocialIcons.astro, Footer.astro, index.mdx — и нигде не
// совпадал полностью. Ровно так «Порядок построения» и не доехал до шапки
// и до главной.
//
// Списки в шапке, подвале, сайдбаре и на главной по-прежнему различаются:
// в шапке меньше места, поэтому там короткие подписи и нет «Порядка
// построения». Задача файла — не схлопнуть эти различия, а объявить их в
// одном месте: поле `in` говорит, где страница показывается.
//
// href хранится БЕЗ base-префикса: astro.config.mjs подставляет базу сам,
// компоненты добавляют её через import.meta.env.BASE_URL. Иначе на GitHub
// Pages получится /The-Way-of-SRE/The-Way-of-SRE/about/.
//
// Структура графа (ветви, L1, листья) живёт в roadmap.ts, дерево сайдбара
// собирается в sidebar.ts — здесь только мета-страницы и внешние ссылки.

import type { StarlightIcon } from '@astrojs/starlight/types';

/**
 * Места, где показывается мета-страница:
 *   sidebar — левый сайдбар,
 *   header  — doc-nav в шапке (мало места, короткие подписи),
 *   footer  — doc-nav в подвале,
 *   intro   — строка «Глубже — …» на главной.
 */
export type NavSlot = 'sidebar' | 'header' | 'footer' | 'intro';

export interface NavEntry {
  id: string;
  /** Полная подпись: сайдбар, подвал, главная. */
  label: string;
  /** Компактная подпись для шапки; если не задана — берётся label. */
  shortLabel?: string;
  /** Путь без base-префикса. */
  href: string;
  in: NavSlot[];
  /**
   * В сайдбаре страница живёт на верхнем уровне, а не в группе «Справочник».
   * Это про позицию, а не про принадлежность: `in` всё равно содержит
   * 'sidebar'.
   */
  topLevel?: boolean;
}

/**
 * Порядок здесь — общий для всех мест. Добавление новой мета-страницы:
 * одна запись, и она сама появляется везде, где перечислено в `in`.
 */
export const docNav: NavEntry[] = [
  {
    id: 'about',
    label: 'Мотивация',
    href: '/about/',
    in: ['sidebar', 'header', 'footer', 'intro'],
  },
  {
    id: 'format',
    label: 'Формат проекта',
    shortLabel: 'Формат',
    href: '/format/',
    in: ['sidebar', 'header', 'footer', 'intro'],
  },
  {
    id: 'methodology',
    label: 'Методология',
    href: '/methodology/',
    in: ['sidebar', 'header', 'footer', 'intro'],
  },
  {
    id: 'mindmap',
    label: 'Mind map (всё дерево)',
    shortLabel: 'Mind map',
    href: '/mindmap/',
    in: ['sidebar', 'footer', 'intro'],
    topLevel: true,
  },
  {
    id: 'reliability-hierarchy',
    label: 'Порядок построения',
    href: '/reliability-hierarchy/',
    in: ['sidebar', 'footer'],
    topLevel: true,
  },
  {
    id: 'glossary',
    label: 'Глоссарий',
    href: '/glossary/',
    in: ['sidebar', 'header', 'footer', 'intro'],
  },
];

export interface SocialEntry {
  icon: StarlightIcon;
  label: string;
  href: string;
}

/** Внешние ссылки: шапка (через Starlight) и подвал (через Footer.astro). */
export const socials: SocialEntry[] = [
  {
    icon: 'github',
    label: 'GitHub',
    href: 'https://github.com/jtprogru/The-Way-of-SRE',
  },
  {
    icon: 'telegram',
    label: 'Telegram канал',
    href: 'https://t.me/jtprogru_channel',
  },
  {
    icon: 'comment-alt',
    label: 'Telegram чат',
    href: 'https://t.me/jtprogru_chat',
  },
  {
    icon: 'external',
    label: 'Блог jtprog.ru',
    href: 'https://jtprog.ru/',
  },
];

/** Мета-страницы для конкретного места, в общем порядке docNav. */
export function navFor(slot: NavSlot): NavEntry[] {
  return docNav.filter((e) => e.in.includes(slot));
}

/** Подпись с учётом места: в шапке — короткая, если она задана. */
export function navLabel(entry: NavEntry, slot: NavSlot): string {
  return slot === 'header' ? (entry.shortLabel ?? entry.label) : entry.label;
}
