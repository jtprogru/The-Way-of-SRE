# The Way of SRE — Site (PoC)

Astro Starlight PoC для визуализации карты компетенций SRE.

**Статус:** Proof of Concept. Проверяем, подходит ли Astro Starlight как целевая платформа для роадмапа взамен mermaid-схем в `/docs`.

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

URL после первого успешного деплоя: <https://jtprogru.github.io/The-Way-of-SRE/>.

Чтобы деплой заработал, в настройках репо нужно включить **Settings → Pages → Source: GitHub Actions** (одноразово, скриптом не делается).

## Что внутри PoC

- Главная страница со spider-картой (`src/content/docs/index.mdx`).
- Компонент `Spider.astro` — inline SVG с `<a>`-тегами в текстовых узлах. **Кликабелен только текст**, не сами узлы. Это подтверждение концепции: текст-как-ссылка работает.
- Три страницы ветвей (Culture / Engineering / Practices) — стабы для проверки навигации.
- Один лист (`leaves/engineering/sli-based-alerting`) — изначально перенесён из `/docs/leaves` для проверки полной цепочки навигации со spider'а.

## Чего нет в PoC

- Полная миграция содержимого из `/docs` — намеренно не сделана. PoC — это образец, не финал.
- Расширение spider до полной карты — только цепочка `SRE → Engineering → Observability → SLI-based Alerting` для проверки L2-навигации.

## Решение по миграции

После просмотра PoC принимается одно из решений:

- **Мигрируем.** Тогда: переносим всё содержимое из `/docs`, настраиваем деплой, переписываем корневой README как landing на сайт.
- **Не мигрируем.** Тогда: `site/` удаляется, возвращаемся к mermaid-форме в README.

До принятия решения `site/` существует параллельно с `/docs` и ничего в основном проекте не меняет.
