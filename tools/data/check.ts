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
import { reliabilityHierarchy } from '../../src/data/reliabilityHierarchy.ts';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DOCS = `${REPO}/src/content/docs`;

const errors: string[] = [];
const fail = (where: string, what: string) => errors.push(`${where}: ${what}`);

for (const branch of roadmap.branches) {
  // Страница ветви: /culture/ → src/content/docs/culture.mdx
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

      // Лист лежит под своей ветвью: findPageContext() определяет ветвь по
      // первому сегменту адреса, лист в чужой ветви она просто не найдёт.
      if (!leaf.href.startsWith(branch.href)) {
        fail(where, `href листа «${leaf.label}» (${leaf.href}) вне ветви ${branch.href}`);
      }

      // Файл листа: /culture/runbooks/ → culture/runbooks.md
      const file = `${DOCS}${leaf.href.replace(/\/$/, '')}.md`;
      if (!existsSync(file)) {
        fail(where, `у листа «${leaf.label}» нет файла ${file.slice(REPO.length + 1)}`);
      }
    }
  }

  // Общее пространство имён ветви: hub-страницы L1 и листья лежат рядом,
  // /culture/<name>/ разбирается по данным. Совпадение имени L1 со slug'ом
  // листа сделало бы адрес двусмысленным, а один из узлов — недостижимым.
  const l1Ids = new Set(branch.l1.map((l1) => l1.id));
  for (const l1 of branch.l1) {
    for (const leaf of leavesOf(l1)) {
      if (l1Ids.has(leaf.id)) {
        fail(branch.id, `slug листа «${leaf.label}» совпадает с id L1 «${leaf.id}»`);
      }
    }
  }
}

// Листья адресуются по id и по label из других файлов: иерархия надёжности
// берёт лист по id, строка «L2-концепты» ищет его по label. Оба поиска дают
// один узел только при уникальности имени по всей карте — два листа с общим
// id или label превратят поиск в лотерею «кто последний в массиве».
const allLeaves = roadmap.branches.flatMap((b) => b.l1.flatMap((l1) => leavesOf(l1)));
for (const field of ['id', 'label'] as const) {
  const seen = new Map<string, string>();
  for (const leaf of allLeaves) {
    const first = seen.get(leaf[field]);
    if (first !== undefined) {
      fail('листья', `${field} «${leaf[field]}» занят дважды: ${first} и ${leaf.href}`);
    } else {
      seen.set(leaf[field], leaf.href);
    }
  }
}

// Иерархия надёжности ссылается на листья своими href — это единственное
// место, где адрес листа продублирован вне roadmap.ts. Переехал лист,
// забыли поправить здесь — молча битая ссылка на /reliability-hierarchy/.
const leafHrefs = new Set(
  roadmap.branches.flatMap((b) => b.l1.flatMap((l1) => leavesOf(l1).map((leaf) => leaf.href))),
);
for (const layer of reliabilityHierarchy) {
  for (const item of layer.leaves) {
    if (!leafHrefs.has(item.href)) {
      fail('reliability-hierarchy', `«${item.label}» ведёт на ${item.href}, такого листа нет`);
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
