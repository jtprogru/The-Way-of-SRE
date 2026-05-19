# The Way of SRE — сайт

Astro Starlight реализация карты компетенций SRE. Публикуется на GitHub Pages.

**URL:** <https://jtprogru.github.io/The-Way-of-SRE/>

## Запуск из корня репо

Все команды доступны из корня проекта через `task`, заходить в `site/` не требуется:

```bash
task site:dev      # dev-сервер на http://localhost:4321/The-Way-of-SRE/
task site:build    # билд в site/dist/
task site:preview  # локальный preview готовой сборки
```

Зависимости устанавливаются автоматически при первом запуске любой `site:*` задачи (есть `task site:install` для явной установки).

Если предпочитаешь работать без Taskfile, эквивалент:

```bash
cd site && npm install && npm run dev
```

## Деплой

Автоматический через GitHub Actions (`.github/workflows/deploy-site.yml`): на каждый push в `main`, затрагивающий `site/`, билд публикуется на GitHub Pages.

## Что внутри

- **Данные** — `src/data/roadmap.ts`. Единый источник правды о структуре графа (типы `Branch` / `L1` / `Leaf`). Изменение здесь автоматически отражается в `Spider` и `BranchView`.
- **Компоненты визуализации**:
  - `src/components/Spider.astro` — главная страница, overview всех ветвей через inline SVG. Кликабелен **текст** узла, не фигура.
  - `src/components/BranchView.astro` — страницы ветвей (`variant="navigation"`) и priorities-страница (`variant="priority"` с цветовой кодировкой 🔴🟡🟢🔵).
- **Контент**:
  - `src/content/docs/index.mdx` — главная.
  - `src/content/docs/sre-{culture,engineering,practices}.mdx` — страницы ветвей.
  - `src/content/docs/priorities.mdx` — roadmap по приоритетам.
  - `src/content/docs/leaves/<branch>/<slug>.md` — leaf-страницы (10 на момент написания).
- **Навигация** — `astro.config.mjs`, поле `sidebar`. Список листьев в sidebar поддерживается вручную параллельно с фактическими файлами.
- **Стили** — `src/styles/custom.css`.

## Как добавить новый лист

1. Создать файл `src/content/docs/leaves/<branch>/<slug>.md` по шаблону [`docs/leaves/_template.md`](../docs/leaves/_template.md) (Starlight-формат: `title`/`description` во фронт-маттере, метаданные через `:::note` callout).
2. Добавить запись в sidebar `astro.config.mjs` (раздел `Листья` → соответствующая ветвь).
3. Добавить `href: '/leaves/<branch>/<slug>/'` в соответствующую запись `src/data/roadmap.ts` (на узле L2 или L1, к которому относится лист).
4. Локально проверить: `task site:build` (страница появится в списке роутов) и `task site:dev` (открыть `/The-Way-of-SRE/leaves/<branch>/<slug>/`).

## Архитектурные ограничения

- Mermaid на сайте не рендерится (Starlight без плагина). Графы строятся через `<Spider />` и `<BranchView />`. Mermaid-схемы остаются только в `/docs/sre-*.md` — для рендера в GitHub UI.
- Кликается **текст** узла, не сама фигура. Принцип сохраняется при любом редактировании SVG-компонента.
- Leaf-страницы хранятся **только** здесь. В `/docs/leaves/` живёт только шаблон (`_template.md`).
