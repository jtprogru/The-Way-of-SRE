# Inventory пересечений между ветвями

Рабочий артефакт ребаланса. Фиксирует все узлы, которые в L2 inventory дублируются между `SRE Culture` / `SRE Engineering` / `SRE Practices`, и закрепляет решение по каждому. На сайт не публикуется; живёт в репозитории как рабочая запись для контрибьюторов.

Документ опирается на [Методологию](https://jtprogru.github.io/The-Way-of-SRE/methodology/) — три способа разрешения пересечений (перенос / разделение / cross-link) описаны там. Здесь — только применение этих способов к конкретным узлам.

## Статусы решения

- **Перенос** — узел остаётся в одной ветви, из остальных удаляется.
- **Разделение** — за одним именем скрываются разные сущности, они получают разные имена и разводятся по ветвям.
- **Cross-link** — узел остаётся в одной ветви; в другой появляется ссылка на тот же лист с явной пометкой. Используется как исключение.
- **Открыто** — решение ещё не принято.

## Статус применения

| Решение | Статус | Где применено |
| ------- | ------ | ------------- |
| Knowledge Management → Culture | ✅ Применено | Был корректно в Culture как L1, изменений в графах не потребовалось |
| Capacity Planning → Engineering | ✅ Применено | Удалён из `sre-culture` L2 inventory (ITMG), остался в `sre-engineering` (RELY) |
| DR — разделение на технику и политику | ✅ Применено | `Disaster Recovery` в Engineering/RELY; `DR Policy & Stakeholders` в Culture/ITMG |
| SLO — разделение на три концепта | ✅ Применено | `SLO Engineering` в Engineering/RELY; `SLO Governance` в Culture/ITMG (заменил Service Management с L3); `SLO Review Ritual` в Practices/PBMG |
| DORA Metrics → Culture | ✅ Применено | Остался в Culture/MEAS; из Practices/PEMT убран Team Metrics/DORA, добавлен `Performance Conversations` |
| Mentorship → Culture | ⚠️ Пересмотр | Применено в мае 2026 (Culture/ETDL, из Practices/PEMT удалён), но позже в Practices появился лист `Mentoring as Practice` — см. строку 12 |
| On-Call семейство | ✅ Зафиксировано как не-overlap | Три разных концепта с разными ветвями (Rotation, Budget, Design) — оставлены без изменений |
| Postmortem семейство — разделение | ✅ Применено | `Blameless Postmortem` в Practices/PBMG; `Postmortem Culture` в Culture/ETDL |
| Incident Response семейство — разделение | ✅ Применено | `Incident Response` в Practices/USUP; `Incident Response Training` в Culture/ETDL |
| People Management → Practices | ✅ Применено | Удалён из Culture/RLMT; остался в Practices/PEMT |
| Goal Setting → Practices | ✅ Применено | Удалён из Culture/MEAS; остался как `Setting Goals` в Practices/PEMT |
| Platform Engineering — отдельный L1 в Engineering | ✅ Применено | Новый L1 `platform-engineering` в `roadmap.ts` с листом `Platform as a Product`; TBD-маркеры в `Team Topologies` и `Toil Automation` сужены до `Internal Developer Portal` и `Self-Service Infrastructure` |

## Таблица пересечений

| # | Узел / семейство | Где сейчас встречается | Природа дубля | Решение | Обоснование |
| - | ---------------- | ---------------------- | -------------- | ------- | ----------- |
| 1 | **Knowledge Management** | `Culture` (ветвь L1) + `Practices → PDSV` (как лист) | Один концепт назван одинаково в двух ветвях. | **Перенос** в `Culture`. | Главный объект — нормы и обмен опытом (накопление знаний как организационная практика), а не процесс. В `Practices/PDSV` ссылка удаляется. |
| 2 | **Capacity Planning** | `Engineering → RELY` + `Culture → ITMG` | Один концепт назван одинаково в двух ветвях. | **Перенос** в `Engineering`. | Главный объект — состояние инфраструктуры (расчёт ресурсов, нагрузочные модели). Бюджетная сторона capacity остаётся в `Culture/ITMG` только как cross-link, если будет признана отдельной компетенцией. |
| 3 | **Disaster Recovery** | `Engineering → RELY → Disaster Recovery` + `Culture → ITMG → Disaster Recovery Planning` | Два имени, фактически одно семейство. | **Разделение**. В `Engineering` остаётся **техника** (RPO/RTO design, backup validation, failover testing). В `Culture/ITMG` — отдельный концепт `DR Policy & Stakeholders` (принятие риска, согласование RTO с бизнесом). | Это методологически разные сущности: инженерия отказа и переговоры о допустимости отказа. Одно имя их склеивает. |
| 4 | **SLO-семейство** (SLA / SLI / SLO / Error Budget) | `Engineering → RELY → SLO Management` (с подузлами SLI Definition, SLO Setting, Error Budget Policy) + `Culture → ITMG → Service Management` (с подузлами SLA/SLI/SLO/Error Budget) + `Culture → MEAS → SLO Review`, `Error Budget Review` | Семейство размазано по трём узлам в двух ветвях с перекрывающимися подузлами. | **Разделение** на три неперекрывающихся концепта: (1) `SLO Engineering` в `Engineering/RELY` — определение SLI, формулы, инструментирование; (2) `SLO Governance` в `Culture/ITMG` — SLA с внешними, политика error budget на уровне организации; (3) `SLO Review Ritual` в `Practices` — регулярный ритуал ревью SLO/бюджета. | Каждая из трёх сущностей имеет свой главный объект (система / нормы / процесс). Объединение их под одним именем — главный источник методологического шума. |
| 5 | **DORA Metrics** | `Culture → MEAS → DORA Metrics` + `Practices → PEMT → Team Metrics / DORA` | Один концепт в двух ветвях с разными именами. | **Перенос** в `Culture/MEAS`. | Главный объект — метрики как инструмент разговора о состоянии (норма), а не процесс оценки людей. В `Practices/PEMT` остаётся отдельный концепт `Performance Conversations` (разговор о росте), который использует DORA как вход, но сам не является метрикой. |
| 6 | **Mentorship** | `Culture → ETDL → Mentorship` + `Practices → PEMT → Mentorship` | Один и тот же узел в двух ветвях. | **Перенос** в `Culture/ETDL`. | Главный объект — передача знаний и развитие младших, это норма обмена опытом (Culture). В `Practices/PEMT` менторство как ритуальный аспект оценки покрывается `Performance Conversations`; отдельный узел не нужен. |
| 7 | **On-Call семейство** | `Practices → USUP → On-Call Rotation` + `Culture → ITMG → On-Call Budget Management` + `Practices → PDSV → On-Call Design` | На первый взгляд — три узла про одну тему. По существу — **три разных концепта** с разными главными объектами. | **Не overlap.** Все три остаются. | `On-Call Rotation` — процесс ротации (кто когда дежурит) → Practices. `On-Call Budget Management` — норма распределения нагрузки на команду → Culture. `On-Call Design` — личная сторона профессионального развития (как себе строить on-call) → Practices/PDSV. Объединение исказило бы три разных смысла. |
| 8 | **Postmortem семейство** | `Practices → PBMG → Blameless Postmortem` + `Culture → ETDL → Postmortem Culture` | За одним именем «постмортем» скрываются ритуал и норма. | **Разделение** (уже выполнено). | `Blameless Postmortem` — конкретный ритуал постмортема (формат встречи, action items, RCA) → `Practices/PBMG`. `Postmortem Culture` — норма безвиновности и психбезопасности при разборе → `Culture/ETDL`. Разные сущности, разные ветви. |
| 9 | **Incident Response семейство** | `Practices → USUP → Incident Response` + `Culture → ETDL → Incident Response Training` | Два концепта на одной теме (реагирование). | **Разделение** (уже выполнено). | `Incident Response` — процесс реагирования на инцидент (как делаем) → Practices/USUP. `Incident Response Training` — обучение этому процессу (game day, симуляции, как норма обучения) → Culture/ETDL. |
| 10 | **People Management** | `Culture → RLMT → People Management` + `Practices → PEMT → People Management` | Один и тот же узел в двух ветвях. | **Перенос** в `Practices/PEMT`. | Главный объект — управленческие активности (1-on-1, фидбек, развитие подчинённых), это ритуал/процесс (Practices). В `Culture/RLMT` нормы отношений уже покрыты узлами `Stakeholder Management`, `Continuous Feedback`, `Dev Team Partnership`, `Communications` — отдельный `People Management` здесь избыточен. |
| 11 | **Goal Setting** | `Culture → MEAS → Goal Setting` + `Practices → PEMT → Setting Goals` | Один концепт в двух ветвях с похожими именами. | **Перенос** в `Practices/PEMT` (как `Setting Goals`). | Главный объект — постановка целей подчинённым (1-on-1, OKR), это ритуал управления людьми (Practices). Организационная сторона целей надёжности уже покрыта `SLO / Budget Review` в `Culture/MEAS`; отдельный `Goal Setting` там избыточен. |

| 12 | **Наставничество (повтор строки 6)** | `Culture → ETDL → Mentorship` (L2-концепт) + `Practices → Professional Development → Mentoring as Practice` (лист) | Решение строки 6 де-факто отменено: узел вернулся в `Practices` под другим именем. Лист аккуратно размежёван с `SRE Onboarding`, `Communities of Practice` и `Career Ladders`, но границы с культурным `Mentorship` в нём нет. | **Открыто.** | Возможных исходов три. Разделение: `Mentorship` в Culture остаётся нормой «в команде принято передавать знания», `Mentoring as Practice` — механикой пары наставник–ученик (ритм встреч, контракт, завершение). Тогда обоим нужна явная взаимная граница, как у остальных разделённых семейств. Перенос: снять L2 `Mentorship` из Culture, раз практика описана листом. Возврат к строке 6: перенести лист в Culture/ETDL — дороже всего, ломает `slug` и входящие ссылки. Решать в PR. |

| 13 | **Platform Engineering** | `Engineering → Platform Engineering` (новый L1) + `Engineering → Toil Reduction → Toil Automation` + `Engineering → IT Infrastructure` + `Culture → ETDL → Team Topologies` | Тема притягивалась сразу к трём существующим узлам: как автоматизация ручной работы, как инфраструктура и как тип команды. TBD-маркеры на неё стояли в `Team Topologies` и `Toil Automation`. | **Разделение.** Продуктовая и инженерная часть — новый L1 `Platform Engineering` в Engineering; организационная сторона остаётся в `Team Topologies`; устранение ручной работы остаётся в `Toil Automation`. | Главный объект нового L1 — внутренняя платформа как продукт для команд-разработчиков. Под `IT Infrastructure` она сводится к кластеру и облаку, под `Toil Reduction` — к устранению ручной работы; оба варианта теряют пользователя платформы и интерфейс к ней. Обоснование целиком — `platform-engineering-proposal.md`; границы с конкретными листьями зафиксированы в самом листе `Platform as a Product`. |

Все известные пересечения, кроме строки 12, зафиксированы и решены. Новые могут появляться по мере роста графов — добавляются строкой со статусом «Открыто» и решаются в PR.

## Как пользоваться этим документом

1. При добавлении нового узла — проверить, нет ли уже строки по нему в таблице.
2. При обнаружении нового пересечения — добавить строку с решением «Открыто» и обсуждать в PR.
3. После принятия решения — перенести правку в поле `l2` соответствующего L1 в `src/data/roadmap.ts` отдельным коммитом и обновить статус здесь.
