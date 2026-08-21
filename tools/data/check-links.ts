/*
 * Битые внутренние ссылки в собранном сайте.
 *
 * Astro не проверяет ссылки: для него href — строка, и страница с адресом,
 * которого нет, собирается молча. До переезда на общее пространство имён
 * ветви это было терпимо, но один такой переезд правит под тысячу ссылок в
 * тексте листьев, и глазами это не проверяется.
 *
 * Проверка идёт по dist/, то есть по тому, что реально уедет на Pages:
 * каждый href на собственный домен должен указывать на существующий файл.
 * Якоря отбрасываются — здесь проверяется адрес страницы, не её содержимое.
 *
 * Запуск: `make link-check` (входит в `make check` после сборки).
 */
import { existsSync, readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = `${REPO}/dist`;
const BASE = '/The-Way-of-SRE/';

if (!existsSync(DIST)) {
  console.error('нет dist/ — сначала `make build`');
  process.exit(1);
}

const pages = globSync('**/*.html', { cwd: DIST });
const broken = new Map<string, Set<string>>();
let checked = 0;

for (const page of pages) {
  const html = readFileSync(join(DIST, page), 'utf8');
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith(BASE)) continue;
    const path = href.slice(BASE.length).split('#')[0].split('?')[0];
    checked++;
    const target = path === '' || path.endsWith('/') ? join(path, 'index.html') : path;
    if (existsSync(join(DIST, target))) continue;
    if (!broken.has(href)) broken.set(href, new Set());
    broken.get(href)!.add(page);
  }
}

if (broken.size > 0) {
  console.error(`ссылки: ${broken.size} битых адресов\n`);
  for (const [href, from] of broken) {
    const pagesList = [...from].slice(0, 3).join(', ');
    const more = from.size > 3 ? ` и ещё ${from.size - 3}` : '';
    console.error(`  ${href}\n    со страниц: ${pagesList}${more}`);
  }
  process.exit(1);
}

console.log(`ссылки: ${checked} внутренних на ${pages.length} страницах — все живые`);
