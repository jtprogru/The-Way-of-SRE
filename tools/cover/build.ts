// Генератор обложки README (logo/cover-light.svg, logo/cover-dark.svg).
//
// Обложка рисуется из src/data/roadmap.ts, а не руками: предыдущая картинка
// пережила три волны новых листьев и врала на цифры (27 листьев в Engineering
// против фактических 30). Всё, что на обложке считается — состав доменов,
// количество листьев, приоритеты — приходит из данных, поэтому устареть уже
// не может. Проверяет это `make cover-check`, встроенный в `make check`:
// цель не перерисовывает файлы, а сверяет их с тем, что дают данные сейчас.
//
// Два файла вместо одного с `prefers-color-scheme`: внутри <img> медиазапрос
// смотрит на тему ОС, а не на тему GitHub. Светлая ОС + тёмная тема GitHub
// давали тёмный текст на тёмном фоне — ровно та нечитаемость, из-за которой
// обложка и переделывалась. <picture> в README переключает файл по теме
// самого GitHub, поэтому фон у обеих версий прозрачный.
//
// Раскладка: шапка со счётчиками, три колонки (ветвь = колонка), в колонке
// чипы L1-доменов с числом листьев, снизу строка-легенда. Высота холста
// считается по самой длинной колонке, поэтому новый лист или новый домен
// не ломают композицию.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { countLeaves, roadmap, type Branch, type L1 } from '../../src/data/roadmap';

// --- Данные, которых нет в roadmap.ts --------------------------------------

/** Короткая формула ветви: «главный объект» из README, одной парой слов. */
const BRANCH_SUBTITLE: Record<string, string> = {
  culture: 'люди и нормы',
  engineering: 'системы и стек',
  practices: 'процессы и ритуалы',
};

const SITE = 'jtprogru.github.io/The-Way-of-SRE';

// --- Палитры ---------------------------------------------------------------

interface Palette {
  name: string;
  ink: string;
  muted: string;
  line: string;
  branch: Record<string, string>;
  chipFill: number;
  chipStroke: number;
}

// Цвета ветвей совпадают с сайтом (src/styles/custom.css): в светлой теме
// берётся насыщенный вариант, в тёмной — осветлённый.
const PALETTES: Palette[] = [
  {
    name: 'light',
    ink: '#1f2937',
    muted: '#6b7280',
    line: '#d1d5db',
    branch: { culture: '#d97706', engineering: '#0d9488', practices: '#6366f1' },
    chipFill: 0.08,
    chipStroke: 0.28,
  },
  {
    name: 'dark',
    ink: '#e6edf3',
    muted: '#9aa4b2',
    line: '#3d444d',
    branch: { culture: '#f59e0b', engineering: '#2dd4bf', practices: '#818cf8' },
    chipFill: 0.14,
    chipStroke: 0.42,
  },
];

// --- Геометрия -------------------------------------------------------------

const W = 1120;
const PAD = 40;
const COL_GAP = 28;
const COL_W = (W - 2 * PAD - 2 * COL_GAP) / 3;

const BAR_Y = 156;
const BAR_H = 6;
const CHIPS_TOP = 232;
const CHIP_H = 36;
const CHIP_H2 = 50; // чип с подписью в две строки
const CHIP_GAP = 9;

const CHIP_PAD_L = 30; // отступ до подписи: 14 паддинг + точка + зазор
const CHIP_PAD_R = 30; // место под число листьев справа
const LABEL_SIZE = 15.5;

const FOOT_GAP = 22;   // от нижнего чипа до разделителя
const FOOT_BASE = 42;  // от нижнего чипа до базовой линии легенды

// --- Измерение текста ------------------------------------------------------

// Точных метрик системного шрифта здесь взять неоткуда, а решение «перенести
// подпись на вторую строку» нужно на этапе генерации. Оценка по классам
// символов даёт ±5% — этого хватает, чтобы длинные имена вроде
// «Organisational Capability Development» переносились, а короткие нет.
const WIDE = new Set([...'MWmw@%—']);
const NARROW = new Set([...`iljtfrI.,:;'"!|()[]/`]);

function charWidth(ch: string): number {
  if (ch === ' ') return 0.28;
  if (WIDE.has(ch)) return 0.86;
  if (NARROW.has(ch)) return 0.34;
  if (ch >= '0' && ch <= '9') return 0.56;
  if (ch !== ch.toLowerCase() && ch === ch.toUpperCase()) return 0.68;
  return 0.535;
}

function textWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) w += charWidth(ch);
  return w * size;
}

/** Разбивает подпись максимум на две строки по доступной ширине. */
function wrap(text: string, size: number, max: number): string[] {
  if (textWidth(text, size) <= max) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && textWidth(next, size) > max && lines.length === 0) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  lines.push(current);
  return lines.slice(0, 2);
}

// --- Числительные ----------------------------------------------------------

// Тот же приём, что в src/content/docs/index.mdx: раз число приходит из
// данных, окончание тоже считается, а не пишется руками.
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const leavesWord = (n: number) => plural(n, 'лист', 'листа', 'листьев');
const domainsWord = (n: number) => plural(n, 'домен', 'домена', 'доменов');
const branchesWord = (n: number) => plural(n, 'ветвь', 'ветви', 'ветвей');

// --- SVG-хелперы -----------------------------------------------------------

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const round = (n: number) => Math.round(n * 100) / 100;

interface TextOpts {
  x: number;
  y: number;
  cls: string;
  anchor?: 'start' | 'middle' | 'end';
  fill?: string;
}

function text(content: string, o: TextOpts): string {
  const anchor = o.anchor && o.anchor !== 'start' ? ` text-anchor="${o.anchor}"` : '';
  const fill = o.fill ? ` fill="${o.fill}"` : '';
  return `<text class="${o.cls}" x="${round(o.x)}" y="${round(o.y)}"${anchor}${fill}>${esc(content)}</text>`;
}

// --- Сборка ----------------------------------------------------------------

interface Chip {
  lines: string[];
  count: number;
  must: boolean;
  h: number;
}

function chipsOf(branch: Branch): Chip[] {
  return branch.l1.map((l1: L1) => {
    const lines = wrap(l1.label, LABEL_SIZE, COL_W - CHIP_PAD_L - CHIP_PAD_R);
    return {
      lines,
      count: countLeaves(l1),
      must: l1.priority === 'must',
      h: lines.length > 1 ? CHIP_H2 : CHIP_H,
    };
  });
}

function columnHeight(chips: Chip[]): number {
  return chips.reduce((sum, c) => sum + c.h, 0) + Math.max(0, chips.length - 1) * CHIP_GAP;
}

function buildCover(p: Palette): string {
  const columns = roadmap.branches.map((branch) => ({
    branch,
    color: p.branch[branch.id],
    chips: chipsOf(branch),
    leaves: branch.l1.reduce((sum, l1) => sum + countLeaves(l1), 0),
  }));

  const bodyH = Math.max(...columns.map((c) => columnHeight(c.chips)));
  const totalLeaves = columns.reduce((sum, c) => sum + c.leaves, 0);
  const totalL1 = roadmap.branches.reduce((sum, b) => sum + b.l1.length, 0);

  const H = CHIPS_TOP + bodyH + FOOT_BASE + 22;

  const out: string[] = [];
  const alt =
    `The Way of SRE — карта компетенций SRE: ${roadmap.branches.length} ${branchesWord(roadmap.branches.length)}, ` +
    `${totalL1} ${domainsWord(totalL1)}, ${totalLeaves} ${leavesWord(totalLeaves)}. ` +
    columns.map((c) => `${c.branch.label}: ${c.leaves}`).join(', ');

  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(alt)}">`,
  );

  out.push(`  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, "Helvetica Neue", Arial, sans-serif; }
    .eyebrow  { font-size: 13px; font-weight: 600; letter-spacing: .2em; fill: ${p.muted}; }
    .title    { font-size: 42px; font-weight: 800; letter-spacing: -.01em; fill: ${p.ink}; }
    .tagline  { font-size: 16px; font-weight: 400; fill: ${p.muted}; }
    .stat-num { font-size: 28px; font-weight: 700; fill: ${p.ink}; }
    .stat-lbl { font-size: 12.5px; font-weight: 500; fill: ${p.muted}; }
    .col-name { font-size: 21px; font-weight: 700; fill: ${p.ink}; }
    .col-num  { font-size: 14px; font-weight: 600; }
    .col-sub  { font-size: 13.5px; font-weight: 400; fill: ${p.muted}; }
    .chip-lbl { font-size: ${LABEL_SIZE}px; font-weight: 500; fill: ${p.ink}; }
    .chip-num { font-size: 13px; font-weight: 600; }
    .note     { font-size: 13.5px; font-weight: 400; fill: ${p.muted}; }
    .note-url { font-size: 13.5px; font-weight: 600; fill: ${p.ink}; }
  </style>`);

  // --- Шапка ---
  // Знак — тот же граф, что в favicon (public/favicon.svg): корень и три
  // ветви. Здесь узлы ветвей раскрашены их цветами, дальше эти же три цвета
  // держат колонки.
  out.push('  <!-- знак -->');
  out.push(`  <g transform="translate(${PAD} 64) scale(0.72)" stroke="${p.muted}" stroke-opacity="0.45" stroke-width="4" stroke-linecap="round" fill="none">`);
  out.push('    <path d="M32 32 12 18M32 32 54 22M32 32 32 56"/>');
  out.push('  </g>');
  out.push(`  <g transform="translate(${PAD} 64) scale(0.72)">`);
  out.push(`    <circle cx="32" cy="32" r="8" fill="${p.ink}"/>`);
  out.push(`    <circle cx="12" cy="18" r="5" fill="${p.branch.culture}"/>`);
  out.push(`    <circle cx="54" cy="22" r="5" fill="${p.branch.engineering}"/>`);
  out.push(`    <circle cx="32" cy="56" r="5" fill="${p.branch.practices}"/>`);
  out.push('  </g>');

  const headX = PAD + 64;
  out.push('  <!-- шапка -->');
  out.push('  ' + text('КАРТА КОМПЕТЕНЦИЙ SITE RELIABILITY ENGINEERING', { x: headX, y: 60, cls: 'eyebrow' }));
  out.push('  ' + text('The Way of SRE', { x: headX - 2, y: 106, cls: 'title' }));
  out.push(
    '  ' +
      text('Что входит в роль и в какой последовательности это осваивать', {
        x: headX,
        y: 134,
        cls: 'tagline',
      }),
  );

  // Счётчики справа: считаются справа налево, чтобы правый край держался
  // за PAD независимо от того, сколько цифр в числах.
  const stats = [
    [String(totalLeaves), leavesWord(totalLeaves)],
    [String(totalL1), domainsWord(totalL1)],
    [String(roadmap.branches.length), branchesWord(roadmap.branches.length)],
  ];
  let statX = W - PAD;
  for (const [value, label] of [...stats].reverse()) {
    const width = Math.max(textWidth(value, 28), textWidth(label, 12.5));
    out.push('  ' + text(value, { x: statX, y: 100, cls: 'stat-num', anchor: 'end' }));
    out.push('  ' + text(label, { x: statX, y: 122, cls: 'stat-lbl', anchor: 'end' }));
    statX -= width + 36;
  }

  // --- Колонки ---
  columns.forEach((col, i) => {
    const x = PAD + i * (COL_W + COL_GAP);
    out.push(`  <!-- ${col.branch.id} -->`);
    out.push(
      `  <rect x="${round(x)}" y="${BAR_Y}" width="${round(COL_W)}" height="${BAR_H}" rx="${BAR_H / 2}" fill="${col.color}"/>`,
    );
    out.push('  ' + text(col.branch.label, { x, y: 192, cls: 'col-name' }));
    out.push(
      '  ' +
        text(`${col.leaves} ${leavesWord(col.leaves)}`, {
          x: x + COL_W,
          y: 191,
          cls: 'col-num',
          anchor: 'end',
          fill: col.color,
        }),
    );
    out.push(
      '  ' +
        text(`${BRANCH_SUBTITLE[col.branch.id]} · ${col.branch.l1.length} ${domainsWord(col.branch.l1.length)}`, {
          x,
          y: 214,
          cls: 'col-sub',
        }),
    );

    let y = CHIPS_TOP;
    for (const chip of col.chips) {
      const cy = y + chip.h / 2;
      out.push(
        `  <rect x="${round(x)}" y="${round(y)}" width="${round(COL_W)}" height="${chip.h}" rx="10" ` +
          `fill="${col.color}" fill-opacity="${p.chipFill}" stroke="${col.color}" stroke-opacity="${p.chipStroke}"/>`,
      );
      // Заливка точки — единственный маркер приоритета: Must Have против
      // всего остального. Четыре градации на обложке не читаются, а «с чего
      // начинать» — главный вопрос к карте.
      out.push(
        chip.must
          ? `  <circle cx="${round(x + 15)}" cy="${round(cy)}" r="4.5" fill="${col.color}"/>`
          : `  <circle cx="${round(x + 15)}" cy="${round(cy)}" r="4" fill="none" stroke="${col.color}" stroke-width="1.6" stroke-opacity="0.75"/>`,
      );
      if (chip.lines.length === 1) {
        out.push('  ' + text(chip.lines[0], { x: x + CHIP_PAD_L, y: cy + 5.5, cls: 'chip-lbl' }));
      } else {
        out.push('  ' + text(chip.lines[0], { x: x + CHIP_PAD_L, y: cy - 4, cls: 'chip-lbl' }));
        out.push('  ' + text(chip.lines[1], { x: x + CHIP_PAD_L, y: cy + 15, cls: 'chip-lbl' }));
      }
      out.push(
        '  ' +
          text(String(chip.count), {
            x: x + COL_W - 14,
            y: cy + 5,
            cls: 'chip-num',
            anchor: 'end',
            fill: col.color,
          }),
      );
      y += chip.h + CHIP_GAP;
    }
  });

  // --- Легенда ---
  const footY = CHIPS_TOP + bodyH;
  out.push('  <!-- легенда -->');
  out.push(
    `  <path d="M${PAD} ${footY + FOOT_GAP} H${W - PAD}" stroke="${p.line}" stroke-width="1"/>`,
  );
  const baseline = footY + FOOT_BASE;
  out.push(`  <circle cx="${PAD + 5}" cy="${round(baseline - 4.5)}" r="4.5" fill="${p.ink}"/>`);
  out.push('  ' + text('Must Have — база роли', { x: PAD + 18, y: baseline, cls: 'note' }));
  const gap = PAD + 18 + textWidth('Must Have — база роли', 13.5) + 28;
  out.push(
    `  <circle cx="${round(gap + 5)}" cy="${round(baseline - 4.5)}" r="4" fill="none" stroke="${p.muted}" stroke-width="1.6"/>`,
  );
  out.push('  ' + text('остальные приоритеты', { x: gap + 18, y: baseline, cls: 'note' }));
  // Правый край легенды набирается справа налево: сначала адрес, потом
  // пояснение перед ним, чтобы правый край держался за PAD.
  out.push('  ' + text(SITE, { x: W - PAD, y: baseline, cls: 'note-url', anchor: 'end' }));
  out.push(
    '  ' +
      text('Цифра в чипе — сколько листьев написано  ·', {
        x: W - PAD - textWidth(SITE, 13.5) - 6,
        y: baseline,
        cls: 'note',
        anchor: 'end',
      }),
  );

  out.push('</svg>');
  return out.join('\n') + '\n';
}

// --- Запись / проверка -----------------------------------------------------

const files = PALETTES.map((p) => ({
  path: fileURLToPath(new URL(`../../logo/cover-${p.name}.svg`, import.meta.url)),
  rel: `logo/cover-${p.name}.svg`,
  content: buildCover(p),
}));

if (process.argv.includes('--check')) {
  const stale: string[] = [];
  for (const file of files) {
    let current = '';
    try {
      current = readFileSync(file.path, 'utf8');
    } catch {
      current = '';
    }
    if (current !== file.content) stale.push(file.rel);
  }
  if (stale.length) {
    console.error(`cover: ${stale.join(', ')} не совпадает с данными roadmap, запусти make cover`);
    process.exit(1);
  }
  console.log('cover: актуален');
} else {
  for (const file of files) {
    writeFileSync(file.path, file.content);
    console.log(`cover: ${file.rel}`);
  }
}
