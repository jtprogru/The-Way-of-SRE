# SRE Roadmap

Документ описывает **ось приоритета** для компетенций — одну из двух осей развития. Вторая ось — уровень зрелости инженера (SFIA) — хранится отдельно во фронт-маттере leaf-страниц.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Две независимые оси](#%D0%B4%D0%B2%D0%B5-%D0%BD%D0%B5%D0%B7%D0%B0%D0%B2%D0%B8%D1%81%D0%B8%D0%BC%D1%8B%D0%B5-%D0%BE%D1%81%D0%B8)
  - [Priority — обязательность для роли](#priority--%D0%BE%D0%B1%D1%8F%D0%B7%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D1%8C-%D0%B4%D0%BB%D1%8F-%D1%80%D0%BE%D0%BB%D0%B8)
  - [SFIA — уровень зрелости инженера](#sfia--%D1%83%D1%80%D0%BE%D0%B2%D0%B5%D0%BD%D1%8C-%D0%B7%D1%80%D0%B5%D0%BB%D0%BE%D1%81%D1%82%D0%B8-%D0%B8%D0%BD%D0%B6%D0%B5%D0%BD%D0%B5%D1%80%D0%B0)
- [Где смотреть конкретную раскладку](#%D0%B3%D0%B4%D0%B5-%D1%81%D0%BC%D0%BE%D1%82%D1%80%D0%B5%D1%82%D1%8C-%D0%BA%D0%BE%D0%BD%D0%BA%D1%80%D0%B5%D1%82%D0%BD%D1%83%D1%8E-%D1%80%D0%B0%D1%81%D0%BA%D0%BB%D0%B0%D0%B4%D0%BA%D1%83)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Две независимые оси

Этот документ оперирует **только осью «priority»**. Не путать с уровнем SFIA — это разные измерения. Компетенция может быть Must Have даже на L3 (Junior) или Nice to have на L6+ (Principal).

### Priority — обязательность для роли

- 🔴 **Must Have** — без компетенции инженер не может выполнять основную работу.
- 🟡 **Mandatory** — компетенция, которой ожидаемо владеет любой SRE на стабильном этапе работы.
- 🟢 **Nice to have** — расширяет возможности, но не блокирует.
- 🔵 **On Demand** — изучается, когда проект требует.

### SFIA — уровень зрелости инженера

Хранится во фронт-маттере каждой leaf-страницы (поле `sfia_levels`), уровни 3..7 соответствуют Junior → Principal. См. [фреймворк SFIA](https://sfia-online.org/en/about-sfia/the-context-for-sfia).

В этом документе SFIA-уровни **не отражаются** — для них есть отдельный источник правды.

## Где смотреть конкретную раскладку

- **Визуально** — страница [/priorities/](https://jtprogru.github.io/The-Way-of-SRE/priorities/) на сайте: L1 каждой ветви окрашены по priority, листья скрыты, цвет ветви канонический (amber / teal / indigo).
- **Inventory L1 + L2 концептов** — графы ветвей: [SRE Culture](sre-culture.md), [SRE Engineering](sre-engineering.md), [SRE Practices](sre-practices.md). Узлы графа — концепты компетенций, не leaf-страницы.
- **Источник правды для priority L1** — поле `priority` в [`src/data/roadmap.ts`](../src/data/roadmap.ts). При изменении приоритета L1 правка делается там; визуализация на сайте и цвета на `/priorities/` обновляются автоматически.

Фактические leaf-страницы (то, что уже написано) — на сайте; исходники — в `src/content/docs/leaves/<branch>/<slug>.md`. Каждый лист принадлежит одному L1 — соответствие хранится в том же `roadmap.ts`.
