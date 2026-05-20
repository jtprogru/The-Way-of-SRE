<h1 align="center">Привет, инженер
<img src="https://github.com/blackcater/blackcater/raw/main/images/Hi.gif" height="32"/></h1>
<h2 align="center"> Всем, кому интересно развиваться в SRE направлении, посвящается! </h2>

<p align="center">
  <a href="https://github.com/jtprogru/The-Way-of-SRE/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?longCache=true" alt="Pull Requests">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-Apache--2.0-brightgreen" alt="Apache 2.0 License">
  </a>
</p>

<p align="center">
  <img src="./logo/sre.png" alt="SRE Bear">
</p>

> Вдохновлен проектом [The-Way-of-DevOps](https://github.com/evgeniy-kharchenko/The-Way-of-DevOps) за авторством [Евгения Харченко](https://github.com/evgeniy-kharchenko).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Карта компетенций](#%D0%BA%D0%B0%D1%80%D1%82%D0%B0-%D0%BA%D0%BE%D0%BC%D0%BF%D0%B5%D1%82%D0%B5%D0%BD%D1%86%D0%B8%D0%B9)
- [Roadmap](#roadmap)
- [Локальный запуск сайта](#%D0%BB%D0%BE%D0%BA%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9-%D0%B7%D0%B0%D0%BF%D1%83%D1%81%D0%BA-%D1%81%D0%B0%D0%B9%D1%82%D0%B0)
- [Документы проекта](#%D0%B4%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D1%8B-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Карта компетенций

Узлы на схеме **кликабельны** — клик по ветви ведёт к её L1-карте. Полная интерактивная карта с листьями (конкретные умения, материалы, best practices) — на сайте: <https://jtprogru.github.io/The-Way-of-SRE/>.

```mermaid
graph LR
    SRE{SRE}
    SRE --> SRECulture[SRE Culture]
    SRE --> SREEngineering[SRE Engineering]
    SRE --> SREPractices[SRE Practices]

    click SRECulture "docs/sre-culture.md" "Перейти к SRE Culture"
    click SREEngineering "docs/sre-engineering.md" "Перейти к SRE Engineering"
    click SREPractices "docs/sre-practices.md" "Перейти к SRE Practices"
```

- **[SRE Culture](docs/sre-culture.md)** — нормы, отношения, обмен опытом. Главный объект — люди и нормы. **7 листьев** на полной глубине.
- **[SRE Engineering](docs/sre-engineering.md)** — технические компетенции и стек. Главный объект — системы. **13 листьев** на полной глубине.
- **[SRE Practices](docs/sre-practices.md)** — операционные процессы и ритуалы. Главный объект — процесс. **11 листьев** на полной глубине.

Принцип разделения ветвей и политика контроля детализации — в [docs/methodology.md](docs/methodology.md).

## Roadmap

Последовательность развития компетенций и приоритеты (Must Have / Mandatory / Nice to have / On Demand) — в [docs/sre-priorities.md](docs/sre-priorities.md).

## Локальный запуск сайта

Проект — Astro Starlight. Команды доступны через [Task](https://taskfile.dev/):

```bash
task dev      # dev-сервер на http://localhost:4321/The-Way-of-SRE/
task build    # билд в dist/
task preview  # локальный preview готовой сборки
```

Зависимости устанавливаются автоматически при первом запуске любой задачи.

Эквивалент без Taskfile:

```bash
npm install && npm run dev
```

Деплой на GitHub Pages — автоматический через `.github/workflows/deploy-site.yml` на каждый push в `main`, затрагивающий Astro-проект.

## Документы проекта

- [docs/about.md](docs/about.md) — мотивация, формат проекта, дисклеймер, контрибуция.
- [docs/methodology.md](docs/methodology.md) — методологический каркас и внешние источники.
- [docs/sre-priorities.md](docs/sre-priorities.md) — приоритеты развития (карта по приоритету и SFIA-уровням).
- [docs/_inventory/overlaps.md](docs/_inventory/overlaps.md) — инвентаризация пересечений между ветвями (рабочий артефакт ребаланса).
- [docs/_inventory/tlroadmap-review.md](docs/_inventory/tlroadmap-review.md) — разбор соседнего проекта `tlroadmap.io`: что берём, что не берём.
- [docs/leaves/_template.md](docs/leaves/_template.md) — шаблон leaf-страницы (Starlight-формат).
- Заполненные листья роадмапа — на сайте; исходники в `src/content/docs/leaves/<branch>/<slug>.md`.
