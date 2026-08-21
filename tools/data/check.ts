/*
 * Структурные инварианты графа: то, что раньше держалось только на
 * комментариях в roadmap.ts.
 *
 * Данные лежат в src/data/branches/*.ts, собираются в src/data/roadmap.ts;
 * адреса узлов там выводятся из id, поэтому сверять их с ветвью уже незачем —
 * проверяется то, что за адресом стоит файл.
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

// Иерархия надёжности называет листья по id — имя и адрес она берёт из карты
// и потому разойтись с ней не может. Остаётся сам id: удалили или переименовали
// лист, и слой пирамиды ссылается в пустоту. layerLeaves() на этом падает при
// сборке, здесь то же самое читается человеческим текстом и раньше.
const leafIds = new Set(allLeaves.map((leaf) => leaf.id));
for (const layer of reliabilityHierarchy) {
  for (const id of layer.leaves) {
    if (!leafIds.has(id)) {
      fail('reliability-hierarchy', `слой «${layer.id}»: листа «${id}» в карте нет`);
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
