/*
 * Структурные инварианты графа: то, что раньше держалось только на
 * комментариях в roadmap.ts.
 *
 * Сборка их не ловит. У L1 без страницы карточка на странице ветви ведёт в
 * 404, у листа без файла — пункт сайдбара; Astro в обоих случаях собирает
 * сайт молча, потому что ссылка для него просто строка. То же с инвентарём
 * L2: лист, выпавший из `l2` своего L1, не ломает ничего видимого, он просто
 * тихо исчезает из карты покрытия домена.
 *
 * Запуск: `make data-check` (входит в `make check`).
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { l1Href, leavesOf, roadmap } from '../../src/data/roadmap.ts';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DOCS = `${REPO}/src/content/docs`;

const errors: string[] = [];
const fail = (where: string, what: string) => errors.push(`${where}: ${what}`);

for (const branch of roadmap.branches) {
  // Страница ветви: /sre-culture/ → src/content/docs/sre-culture.mdx
  const branchSlug = branch.href.replace(/\//g, '');
  if (!existsSync(`${DOCS}/${branchSlug}.mdx`)) {
    fail(branch.id, `нет страницы src/content/docs/${branchSlug}.mdx`);
  }

  for (const l1 of branch.l1) {
    const where = `${branch.id}/${l1.id}`;

    // Инвариант L1: у каждого узла есть hub-страница по адресу из l1Href().
    const page = `${DOCS}${l1Href(branch, l1).replace(/\/$/, '')}.mdx`;
    if (!existsSync(page)) {
      fail(where, `нет hub-страницы ${page.slice(REPO.length + 1)}`);
    }

    // Инвентарь концептов: непустой и без повторов.
    if (l1.l2.length === 0) {
      fail(where, 'пустой список l2');
    }
    const dupes = l1.l2.filter((c, i) => l1.l2.indexOf(c) !== i);
    if (dupes.length > 0) {
      fail(where, `повторы в l2: ${[...new Set(dupes)].join(', ')}`);
    }

    // Каждый лист назван в инвентаре: иначе строка «L2-концепты» врёт про
    // покрытие домена, а связь концепт → лист теряется.
    const inventory = new Set(l1.l2);
    for (const leaf of leavesOf(l1)) {
      if (!inventory.has(leaf.label)) {
        fail(where, `лист «${leaf.label}» не назван в l2`);
      }

      // Файл листа: /leaves/culture/runbooks/ → leaves/culture/runbooks.md
      const file = `${DOCS}${leaf.href.replace(/\/$/, '')}.md`;
      if (!existsSync(file)) {
        fail(where, `у листа «${leaf.label}» нет файла ${file.slice(REPO.length + 1)}`);
      }
    }
  }
}

const l1Count = roadmap.branches.reduce((n, b) => n + b.l1.length, 0);
const l2Count = roadmap.branches.reduce(
  (n, b) => n + b.l1.reduce((m, l1) => m + l1.l2.length, 0),
  0,
);

if (errors.length > 0) {
  console.error(`данные: ${errors.length} нарушений\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log(`данные: ${l1Count} L1, ${l2Count} концептов L2 — инварианты соблюдены`);
