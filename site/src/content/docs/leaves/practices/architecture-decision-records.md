---
title: Architecture Decision Records
description: Дисциплина фиксации технических решений (выбор методов, инструментов, паттернов) с context / decision / consequences — чтобы через год команда понимала «почему так»
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Methods & Tools / Architecture Decision Records
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Дисциплина фиксации технических решений в формате **ADR** (Architecture Decision Record): каждое значимое решение по выбору метода или инструмента (что используем для observability / IaC / messaging / БД / language) сопровождается записью **context → decision → consequences**, версионируется в git, ревьюится в PR. Замена «решили в чате полтора года назад → никто не помнит почему → новый человек откатывает» на «знание, переносимое между поколениями команды». Главная практика внутри L1 `Methods & Tools`; соседние практики (Tech Radar, Tool Standardization, RFC process) — в «Открытых вопросах».

## Что должен уметь

- **L3** — Понимает, что такое ADR; читает существующие ADR команды и понимает context / decision / consequences; знает, где они лежат в repo.
- **L3** — Различает «решение, требующее ADR» (нетривиальный выбор tooling, паттерна, дизайна) и «не требующее» (тривиальное, обратимое, локальное).
- **L4** — Пишет ADR для решения, в котором принимает участие: явный context (проблема + ограничения), рассмотренные альтернативы, выбранная decision с обоснованием, consequences (что приобретаем, что теряем, что закроется в будущем).
- **L4** — Использует стандартный шаблон (Nygard / MADR) и единый формат хранения (`docs/adr/NNNN-slug.md` или `decisions/`); следует numbering и lifecycle (proposed → accepted → superseded → deprecated).
- **L5** — Фасилитирует ADR-обсуждение в команде: формулирует context так, чтобы decision выводилась через обсуждение альтернатив, а не была заранее в голове у автора; защищает обоснованную diversity мнений.
- **L5** — Поддерживает ADR во времени: при изменении контекста создаёт новую ADR с явным `Supersedes: ADR-0042`; не редактирует существующую ADR (immutability — основа доверия к истории).
- **L5** — Связывает ADR с кодом: ссылки из кода (`// see ADR-0042`) на критичные точки, генерация навигации между ADR и затронутыми сервисами / репозиториями.
- **L6+** — Внедряет ADR-практику в команде или org: шаблоны, training, ADR-индекс, integration с code review и onboarding; balansирует «писать слишком много» vs «писать слишком мало».
- **L6+** — Дизайнит decision-making process на уровне org: где ADR в командах, где RFC между командами, где TDD-документы (Technical Design Document); как они связаны с tech-radar / governance.

## Материалы

### Книги и руководства

- Michael Nygard — **Release It!**, 2-е изд. (Pragmatic Bookshelf, 2018). Дополнительно: автор оригинальной концепции ADR (его блог-пост 2011 года заложил формат); книга — фундамент production-устойчивого дизайна, в котором ADR — один из инструментов.

### Статьи и фреймворки

- **[Architectural Decision Records (adr.github.io)](https://adr.github.io/)**. База: канонический хаб ADR-практики, ссылается на оригинальный Nygard-пост, шаблоны, tooling. Принят в Microsoft Azure Well-Architected Framework и AWS Prescriptive Guidance.
- **[joelparkerhenderson/architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record)**. База: коллекция шаблонов (Nygard / Tyree-Akerman / MADR / Arc42) и реальных примеров; 15.9k звёзд на GitHub, активно используется как стартовая точка.
- **[ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar)**. Дополнительно: open-source модель оценки tooling (adopt / trial / assess / hold) — соседняя практика Tech Radar (см. «Открытые вопросы»); полезна как референс при выборе технологий, фиксируемом в ADR.

### Инструменты

- **`docs/adr/` в repo команды как markdown-файлы** — самый простой формат: один ADR = один файл (`0042-use-prometheus-not-influxdb.md`). PR-based review, git history как audit trail, поиск через `grep`.
- **adr-tools / `adr` CLI** — небольшой shell-инструмент для создания / linking / индексирования ADR из командной строки (`adr new`, `adr supersede 42`).
- **MADR (Markdown Any Decision Records)** — облегчённый шаблон с context / decision / consequences плюс явные `considered options`. Хорош для команд, которым Nygard-формат тяжёл.

## Best practices

- **Context — это проблема и ограничения, не пересказ решения.** Антипаттерн: «мы выбрали Prometheus, потому что Prometheus хорош» — context пуст, decision висит в воздухе. Хороший context описывает проблему («нужен metrics-store с alerting»), ограничения («k8s-native, < $X/мес, retention 6 месяцев, без managed-зависимости от cloud-провайдера»), исключающие критерии. Decision должна выводиться из context, а не наоборот.
- **Рассмотрены явные альтернативы, не «выбрали X, потому что слышали».** Антипаттерн: ADR с одним вариантом. Минимум три альтернативы с обоснованием отказа; даже status quo («не делать ничего») — валидная альтернатива. Без альтернатив ADR неотличим от blog post «почему я люблю X».
- **Consequences — обе стороны: что приобретаем и что теряем.** Антипаттерн: только плюсы. У любого решения есть trade-off; consequences без trade-off — реклама, не ADR. Что закрылось (какие будущие решения теперь сложнее), что появилось (новые operational costs, learning curve, lock-in), что осталось открытым.
- **ADR immutable; изменения через новую ADR с `Supersedes`.** Антипаттерн: редактирование принятой ADR при изменении контекста. История теряется; через год невозможно реконструировать, почему перешли с X на Y. Новая ADR с явной ссылкой `Supersedes: ADR-0042` сохраняет цепочку решений как обучающий материал.
- **ADR пишется для значимых решений, не «для всего».** Антипаттерн: ADR-инфляция — десятки ADR для тривиальных выборов, ни одну никто не читает. Критерии: решение non-trivial, имеет долгосрочные consequences (год+), не выводится тривиально из кода, имеет нетривиальные альтернативы. Тривиальные решения — git commit message достаточно.
- **ADR ревьюится в PR, как код, не как «информационное письмо».** Антипаттерн: «вот ADR, я её принял». PR-review даёт diversity мнений, выявляет невидимые альтернативы, фиксирует консенсус. Без review ADR — частное мнение, не «команда решила».

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса ссылается на релевантные ADR; ADR на сервис без owner — никто не отвечает за его актуальность.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — выбор IaC tooling (Terraform vs OpenTofu vs Pulumi vs Crossplane), структуры repos, state backend — типичные предметы ADR.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — выбор языка для нового сервиса, переход с одного на другой — высокоуровневые ADR с долгими consequences.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — выбор SLO targets (99.9% vs 99.95%), формула composite SLO — решения с большими consequences, попадают в ADR.
- **[Dev Team Partnership](/The-Way-of-SRE/leaves/culture/dev-team-partnership/)** — engagement contract частично перекрывается с ADR-форматом (decisions about who owns what, exit criteria); полезно как референсный паттерн.

## Открытые вопросы

- **Tech Radar** *(TBD)* — практика регулярной (раз в N месяцев) оценки tooling по категориям adopt / trial / assess / hold (ThoughtWorks model, адаптированная под команду). Соседняя практика внутри `Methods & Tools` L1, отличающаяся от ADR cadence и форматом (taxonomy vs narrative).
- **Tool Standardization** *(TBD)* — практика «один tool на problem» для команды/org (один metrics-store, один CI, один language stack). Связана с ADR (зафиксирована через них), но самостоятельная подтема.
- **RFC process** *(TBD)* — для решений, выходящих за пределы одной команды (cross-team API, shared platform). Тяжелее ADR (формальнее, дольше), но та же дисциплина. Соседняя практика на стыке `Methods & Tools` и `IT Management`.
- **Technical Design Document (TDD)** — формат для глубокого пред-имплементационного дизайна сервиса; ADR описывает «что выбрали», TDD — «как делаем». Разница в уровне детализации и времени жизни (TDD стареет после реализации, ADR живёт долго).
