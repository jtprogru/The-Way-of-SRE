# Инвентаризация пересечений между ветвями

Рабочий артефакт ребаланса. Фиксирует все узлы, которые в текущих mermaid-графах дублируются между `SRE Culture` / `SRE Engineering` / `SRE Practices`, и закрепляет решение по каждому.

Документ опирается на [methodology.md](../methodology.md) — три способа разрешения пересечений (перенос / разделение / cross-link) описаны там. Здесь — только применение этих способов к конкретным узлам.

## Статусы решения

- **Перенос** — узел остаётся в одной ветви, из остальных удаляется.
- **Разделение** — за одним именем скрываются разные сущности, они получают разные имена и разводятся по ветвям.
- **Cross-link** — узел остаётся в одной ветви; в другой появляется ссылка на тот же лист с явной пометкой. Используется как исключение.
- **Открыто** — решение ещё не принято.

## Таблица пересечений

| # | Узел / семейство | Где сейчас встречается | Природа дубля | Решение | Обоснование |
| - | ---------------- | ---------------------- | -------------- | ------- | ----------- |
| 1 | **Knowledge Management** | `Culture` (ветвь L1) + `Practices → PDSV` (как лист) | Один концепт назван одинаково в двух ветвях. | **Перенос** в `Culture`. | Главный объект — нормы и обмен опытом (накопление знаний как организационная практика), а не процесс. В `Practices/PDSV` ссылка удаляется. |
| 2 | **Capacity Planning** | `Engineering → RELY` + `Culture → ITMG` | Один концепт назван одинаково в двух ветвях. | **Перенос** в `Engineering`. | Главный объект — состояние инфраструктуры (расчёт ресурсов, нагрузочные модели). Бюджетная сторона capacity остаётся в `Culture/ITMG` только как cross-link, если будет признана отдельной компетенцией. |
| 3 | **Disaster Recovery** | `Engineering → RELY → Disaster Recovery` + `Culture → ITMG → Disaster Recovery Planning` | Два имени, фактически одно семейство. | **Разделение**. В `Engineering` остаётся **техника** (RPO/RTO design, backup validation, failover testing). В `Culture/ITMG` — отдельный концепт `DR Policy & Stakeholders` (принятие риска, согласование RTO с бизнесом). | Это методологически разные сущности: инженерия отказа и переговоры о допустимости отказа. Одно имя их склеивает. |
| 4 | **SLO-семейство** (SLA / SLI / SLO / Error Budget) | `Engineering → RELY → SLO Management` (с подузлами SLI Definition, SLO Setting, Error Budget Policy) + `Culture → ITMG → Service Management` (с подузлами SLA/SLI/SLO/Error Budget) + `Culture → MEAS → SLO Review`, `Error Budget Review` | Семейство размазано по трём узлам в двух ветвях с перекрывающимися подузлами. | **Разделение** на три неперекрывающихся концепта: (1) `SLO Engineering` в `Engineering/RELY` — определение SLI, формулы, инструментирование; (2) `SLO Governance` в `Culture/ITMG` — SLA с внешними, политика error budget на уровне организации; (3) `SLO Review Ritual` в `Practices` — регулярный ритуал ревью SLO/бюджета. | Каждая из трёх сущностей имеет свой главный объект (система / нормы / процесс). Объединение их под одним именем — главный источник методологического шума. |
| 5 | **DORA Metrics** | `Culture → MEAS → DORA Metrics` + `Practices → PEMT → Team Metrics / DORA` | Один концепт в двух ветвях с разными именами. | **Перенос** в `Culture/MEAS`. | Главный объект — метрики как инструмент разговора о состоянии (норма), а не процесс оценки людей. В `Practices/PEMT` остаётся отдельный концепт `Performance Conversations` (разговор о росте), который использует DORA как вход, но сам не является метрикой. |

## Пересечения, требующие проработки

Перечень остальных дублей, выявленных при ревью, — решения по ним принимаются в следующих итерациях:

- **Mentorship** — `Culture → ETDL → Mentorship` vs `Practices → PEMT → Mentorship`.
- **On-Call семейство** — `Practices → USUP → On-Call Rotation` vs `Culture → ITMG → On-Call Budget Management` vs `Practices → PDSV → On-Call Design`.
- **Postmortem семейство** — `Practices → PBMG → Blameless Postmortem` vs `Culture → ETDL → Postmortem Culture`.
- **Incident Response** — `Practices → USUP → Incident Response` vs `Culture → ETDL → Incident Response Training`.
- **People Management** — `Culture → RLMT → People Management` vs `Practices → PEMT → People Management`.
- **Goal Setting** — `Culture → MEAS → Goal Setting` vs `Practices → PEMT → Setting Goals`.

Каждый из этих случаев получит строку в основной таблице по мере проработки.

## Как пользоваться этим документом

1. При добавлении нового узла — проверить, нет ли уже строки по нему в таблице.
2. При обнаружении нового пересечения — добавить строку с решением «Открыто» и обсуждать в PR.
3. После принятия решения — перенести правку в соответствующий граф `docs/sre-*.md` отдельным коммитом и обновить статус здесь.
