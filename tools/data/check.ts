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
 * Сюда же относятся ссылки из текста на файлы репозитория в GitHub: это тоже
 * адрес, за которым должен стоять файл, и тоже строка, которую никто не
 * сверяет. И перечень шаблонов из src/data/templates.ts: он обязан совпадать
 * с каталогом templates/ и с тем, что написано в листьях.
 *
 * Запуск: `make data-check` (входит в `make check`).
 */
import { existsSync, globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { l1Href, leavesOf, roadmap } from '../../src/data/roadmap.ts';
import { reliabilityHierarchy } from '../../src/data/reliabilityHierarchy.ts';
import { templatePath, templates } from '../../src/data/templates.ts';

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

// Ссылки на файлы репозитория. check-links.ts смотрит только адреса сайта, и
// ссылка на GitHub для него внешняя: переименовали inventory/overlaps.md —
// методология молча ведёт в 404. Адрес с веткой main обязан указывать на путь,
// который есть в рабочем дереве; ссылка и файл, добавленные одним PR, проходят.
const REPO_LINK =
  /https:\/\/github\.com\/jtprogru\/The-Way-of-SRE\/(?:blob|tree)\/main\/([^\s)"'<>#?]+)/g;
let repoLinks = 0;
// Какие шаблоны названы в тексте листа: id листа → id шаблонов. Собирается
// попутно, сверяется с templates.ts ниже.
const leafByFile = new Map(allLeaves.map((leaf) => [`${leaf.href.slice(1, -1)}.md`, leaf.id]));
const templatesInLeaf = new Map<string, Set<string>>();
for (const rel of globSync('**/*.{md,mdx}', { cwd: DOCS })) {
  const text = readFileSync(`${DOCS}/${rel}`, 'utf8');
  for (const [, raw] of text.matchAll(REPO_LINK)) {
    // Адрес без скобок в прозе цепляет знак препинания за собой.
    const path = decodeURIComponent(raw).replace(/[.,;:]+$/, '');
    repoLinks++;
    if (!existsSync(`${REPO}/${path}`)) {
      fail(`src/content/docs/${rel}`, `ссылка на ${path}, а такого пути в репозитории нет`);
    }

    const leafId = leafByFile.get(rel);
    const templateId = path.match(/^templates\/([^/]+)\.md$/)?.[1];
    if (leafId && templateId) {
      if (!templatesInLeaf.has(leafId)) templatesInLeaf.set(leafId, new Set());
      templatesInLeaf.get(leafId)!.add(templateId);
    }
  }
}

// Перечень шаблонов против каталога templates/. Страница /templates/ рисуется
// из данных, а файлы лежат вне сайта и в сборку не попадают: запись без файла
// даёт ссылку в 404 на GitHub, файл без записи на странице просто не виден.
const templateIds = new Set<string>();
for (const template of templates) {
  const where = `templates/${template.id}`;
  if (templateIds.has(template.id)) {
    fail(where, 'id занят дважды');
  }
  templateIds.add(template.id);

  if (!existsSync(`${REPO}/${templatePath(template)}`)) {
    fail(where, `нет файла ${templatePath(template)}`);
  }

  for (const id of template.leaves) {
    if (!leafIds.has(id)) {
      fail(where, `листа «${id}» в карте нет`);
    } else if (!templatesInLeaf.get(id)?.has(template.id)) {
      // Страница обещает, что документ разобран в листе. Если лист о шаблоне
      // молчит, читатель туда придёт и ничего не найдёт.
      fail(where, `лист «${id}» назван в leaves, но на шаблон в тексте не ссылается`);
    }
  }
}
for (const file of globSync('*.md', { cwd: `${REPO}/templates` })) {
  const id = file.replace(/\.md$/, '');
  if (file !== 'README.md' && !templateIds.has(id)) {
    fail(`templates/${file}`, 'файл не назван в src/data/templates.ts');
  }
}
// Обратная сторона той же связи: лист сослался на шаблон, а перечень про
// этот лист не знает. Шаблон без записи сюда не попадает, он уже пойман выше.
for (const [leafId, ids] of templatesInLeaf) {
  for (const id of ids) {
    const template = templates.find((t) => t.id === id);
    if (template && !template.leaves.includes(leafId)) {
      fail(`templates/${id}`, `лист «${leafId}» ссылается на шаблон, но не назван в leaves`);
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

console.log(
  `данные: ${l1Count} L1, ${l2Count} концептов L2, ${templates.length} шаблонов, ${repoLinks} ссылок на файлы репозитория — инварианты соблюдены`,
);
