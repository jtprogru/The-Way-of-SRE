---
title: Architecture Decision Records
description: Фиксация технических решений в формате context → decision → consequences, версионируется в git
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Methods & Tools / Architecture Decision Records
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Решили в чате полтора года назад, теперь никто не помнит почему» — типичный диалог в команде без ADR. Через два года новый engineer откатывает решение, потому что не понимает контекста, в котором его принимали. ADR (Architecture Decision Record) — это **знание, переносимое между поколениями команды**: каждое значимое решение по выбору метода или инструмента сопровождается записью **context → decision → consequences**, версионируется в git, ревьюится в PR. Главная практика внутри L1 `Methods & Tools`; соседи (Tech Radar, Tool Standardization, RFC process) — в открытых вопросах.

## Что должен уметь

Главный навык на уровне L4 — формулировать **context как проблему и ограничения**, а не как пересказ выбранного решения. «Мы выбрали Prometheus, потому что Prometheus хорош» — context пуст, decision висит в воздухе. Хороший context описывает проблему («нужен metrics-store с alerting»), ограничения («k8s-native, < $X/мес, retention 6 месяцев, без managed-зависимости от cloud»), исключающие критерии. Decision должна **выводиться** из context, а не наоборот.

- **L3** — Понимает, что такое ADR; читает существующие ADR команды и понимает context / decision / consequences.
- **L3** — Различает «решение, требующее ADR» (нетривиальный выбор tooling, паттерна, дизайна) и «не требующее» (тривиальное, обратимое, локальное).
- **L4** — Пишет ADR для решения, в котором участвует: явный context, рассмотренные альтернативы, выбранная decision с обоснованием, consequences (что приобретаем, что теряем).
- **L4** — Использует стандартный шаблон (Nygard / MADR) и единый формат хранения (`docs/adr/NNNN-slug.md`); следует numbering и lifecycle (proposed → accepted → superseded → deprecated).
- **L5** — Фасилитирует ADR-обсуждение в команде: формулирует context так, чтобы decision выводилась через обсуждение альтернатив.
- **L5** — Поддерживает ADR во времени: при изменении контекста создаёт новую ADR с явным `Supersedes: ADR-0042`; не редактирует существующую (immutability — основа доверия к истории).
- **L5** — Связывает ADR с кодом: ссылки из кода (`// see ADR-0042`) на критичные точки.
- **L6+** — Внедряет ADR-практику в команде или org: шаблоны, training, ADR-индекс, integration с code review и onboarding.
- **L6+** — Дизайнит decision-making process на уровне org: где ADR в командах, где RFC между командами, где TDD-документы.

## Материалы

### Книги и руководства

- Michael Nygard — **Release It!**, 2-е изд. (Pragmatic Bookshelf, 2018). Автор оригинальной концепции ADR (блог-пост 2011 года заложил формат); книга — фундамент production-устойчивого дизайна.

### Статьи и фреймворки

- **[Architectural Decision Records (adr.github.io)](https://adr.github.io/)**. Канонический хаб ADR-практики. Принят в Microsoft Azure Well-Architected Framework и AWS Prescriptive Guidance.
- **[joelparkerhenderson/architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record)**. Коллекция шаблонов (Nygard / Tyree-Akerman / MADR / Arc42) и реальных примеров. По моим наблюдениям, это де-факто стартовая точка для большинства команд — 16k+ stars говорят сами за себя.
- **[ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar)**. Open-source модель оценки tooling (adopt / trial / assess / hold) — соседняя практика Tech Radar.

### Инструменты

- **`docs/adr/` в repo команды как markdown-файлы** — самый простой формат. По моим наблюдениям, в зрелых командах именно так и хранят: один ADR = один файл (`0042-use-prometheus-not-influxdb.md`), PR-based review, git как audit trail.
- **adr-tools / `adr` CLI** — небольшой shell-инструмент для создания / linking / индексирования ADR (`adr new`, `adr supersede 42`).
- **MADR (Markdown Any Decision Records)** — облегчённый шаблон с context / decision / consequences плюс явные `considered options`. Подходит для команд, которым Nygard-формат тяжёл.

## Best practices

**Короткие правила:**

- **Context — это проблема и ограничения, не пересказ решения.** Хороший context описывает проблему, ограничения, исключающие критерии. Decision должна выводиться из context.
- **Рассмотрены явные альтернативы, не «выбрали X потому что слышали».** Минимум три альтернативы с обоснованием отказа; даже status quo («не делать ничего») — валидная альтернатива. Без альтернатив ADR неотличим от blog post «почему я люблю X».
- **ADR immutable; изменения через новую ADR с `Supersedes`.** Редактирование принятой ADR — потеря истории; через год невозможно реконструировать, почему перешли с X на Y. Новая ADR с явной ссылкой `Supersedes: ADR-0042` сохраняет цепочку как обучающий материал.

Подробнее:

**Consequences — обе стороны: что приобретаем и что теряем.** Только плюсы — не consequences, реклама. У любого решения есть trade-off; consequences без trade-off неубедительны на ревью. Что закрылось (какие будущие решения теперь сложнее), что появилось (новые operational costs, learning curve, lock-in), что осталось открытым. Я регулярно вижу ADR-ы только с плюсами — обычно это сигнал, что автор не дискутировал решение, а защищал.

**ADR пишется для значимых решений, не «для всего».** ADR-инфляция — десятки записей для тривиальных выборов, никто их не читает, серьёзный ADR теряется в шуме. Критерии: решение non-trivial, имеет долгосрочные consequences (год+), не выводится тривиально из кода, имеет нетривиальные альтернативы. Тривиальные решения — git commit message достаточно.

**ADR ревьюится в PR, как код, не как «информационное письмо».** «Вот ADR, я её принял» — частное мнение, не «команда решила». PR-review даёт diversity мнений, выявляет невидимые альтернативы, фиксирует консенсус. Без review ADR — это документация решения одного человека.

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса ссылается на релевантные ADR.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — выбор IaC tooling (Terraform vs OpenTofu vs Pulumi vs Crossplane), структуры repos — типичные предметы ADR.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — выбор языка для нового сервиса — высокоуровневый ADR с долгими consequences.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — выбор SLO targets, формула composite SLO — решения с большими consequences, попадают в ADR.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — engagement contract частично перекрывается с ADR-форматом.

## Открытые вопросы

- **Tech Radar** *(TBD)* — регулярная (раз в N месяцев) оценка tooling по категориям adopt / trial / assess / hold. Соседняя практика внутри `Methods & Tools`.
- **Tool Standardization** *(TBD)* — «один tool на problem» для команды/org. Связана с ADR, но самостоятельная подтема.
- **RFC process** *(TBD)* — для решений, выходящих за пределы одной команды (cross-team API, shared platform). Тяжелее ADR, та же дисциплина.
- **Technical Design Document (TDD)** — формат для глубокого пред-имплементационного дизайна сервиса. ADR описывает «что выбрали», TDD — «как делаем».
