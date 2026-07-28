---
title: Game Day / Chaos Drills
description: Регулярная тренировка incident response командой — про мышечную память и калибровку, не про разовое мероприятие к OKR
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Learning Delivery / Game Day / Chaos Drills
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Game day мы провели в прошлом году, всем понравилось, отметили в OKR» — фраза, которую я слышу регулярно. Это не game day, это event для отчёта. Game day работает только как **регулярный ритуал**: ежемесячный для команды, ежеквартальный для cross-team, ежегодный full-scale на уровне org. Цель — не «найти баги» и не «проверить chaos tooling». Цель — превратить incident response из теоретического знания в **мышечную память**, удержать calibration команды по мере смены людей и инфраструктуры, найти gaps в runbook'ах и observability до того, как их найдёт production. Лист — про культурную сторону практики; про **метод проверки гипотез о системе** — соседний лист [Chaos Engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/).

Game day и chaos engineering — разные инструменты с пересекающимся scope. Chaos engineering — **метод**: hypothesis-driven эксперимент, который может проводиться automated и continuous, без участия команды. Game day — **ритуал**: запланированное событие, на котором команда играет реакцию на инцидент. Game day может использовать chaos tooling (Chaos Mesh, AWS FIS), а может быть полностью tabletop / Wheel of Misfortune без единой инъекции. Граница не «технически vs организационно», а «**метод проверки системы** vs **тренировка команды**».

## Что должен уметь

Главный навык на уровне L5 — **проектировать game day так, чтобы сценарий учил, а не превращался в шоу**. Я регулярно вижу две крайности: либо сценарий тривиальный («перезагрузим pod, посмотрим как HPA отработает») и команда теряет интерес ко второй итерации, либо сценарий нагромождён («кладём БД + DNS + Kafka одновременно») и команда теряет понимание, что именно она сейчас тренирует. Хороший сценарий тренирует **одну явную способность** (escalation discipline, runbook execution, comms cadence, role handoff) и оставляет место для realistic confusion, но не для коллапса.

**L3**
- Понимает разницу между game day, wheel of misfortune и chaos experiment. Участвует в game day своей команды как responder.
- Читает runbook'и заранее перед game day; в момент тренировки следует им, фиксирует места, где runbook был неясен или устарел.

**L4**
- Фасилитирует Wheel of Misfortune для своей команды: выбирает прошлый или придуманный инцидент, описывает входной сигнал, ведёт обсуждение, фиксирует «что бы вы сделали → почему → откуда узнаете, что сработало».
- Готовит staging-сценарий: injection (через chaos tooling или вручную), observability checklist для проверки signal, runbook walk-through, abort-condition, post-game review template.

**L5**
- Проектирует quarterly game day календарь для команды: scenarios варьируются (network / dependency / data / human-error / process), сложность растёт инкрементально, каждый game day тренирует одну явную способность.
- Запускает game day в production с minimal blast radius (1% traffic / 1 instance / single region) с явными abort-conditions и observability gates. Только когда staging-цикл стабильно работает.
- Ведёт post-game review: factual timeline, findings (что сработало / что нет), action items с владельцем и дедлайном; следит за их закрытием до следующего game day.

**L6+**
- Внедряет game day как регулярную практику в нескольких командах / org-wide. Согласует cadence, scenarios sharing, cross-team drill, executive buy-in.
- Проектирует full-scale exercise (DiRT-style): multi-team, multi-day, multi-region. Включая communications protocol, command center, regulatory implications.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/accelerating-sre-on-call/)** (O'Reilly, 2016), глава 28 «Accelerating SREs to On-Call and Beyond». Источник Wheel of Misfortune как формализованной практики; читать первым, если впервые сталкиваетесь с темой.
- Casey Rosenthal, Nora Jones — **[Chaos Engineering: System Resiliency in Practice](https://www.oreilly.com/library/view/chaos-engineering/9781492043858/)** (O'Reilly, 2020), главы про GameDay structure и blast radius management. Главный практический источник по технической стороне drill'ов с реальной инъекцией.
- Kripa Krishnan — **[Weathering the Unexpected](https://queue.acm.org/detail.cfm?id=2371516)** (ACM Queue, 2012). Не книга, но обязательная статья: как Google запустил DiRT и что из этого вышло. Самый ценный единичный источник про full-scale drill.

### Статьи и доклады

- **[Wheel of Misfortune](https://sre.google/sre-book/accelerating-sre-on-call/)** (SRE Book, глава 28 «Accelerating SREs to On-Call and Beyond»). Описание формата ролевой тренировки: ведущий берёт реальный прошлый инцидент, участник отыгрывает дежурного. Стартовая точка для команды, у которой ещё нет ритуала.
- **[AWS GameDay](https://aws.amazon.com/gameday/)** — программа AWS для внешнего обучения incident response. Полезна как **референс формата** (timeboxed, scoring, post-game debrief), даже если не используете AWS напрямую.
- Aaron Blohowiak (Netflix) — **[FIT: Failure Injection Testing](https://netflixtechblog.com/fit-failure-injection-testing-35d8e2a9bb2)** (Netflix Tech Blog, 2014). Эволюция от game day к continuous chaos; объясняет, **где game day упирается в потолок** и нужны automated experiments.
- **[Ɔhaos Ǝnginǝǝring @ Target](https://tech.target.com/blog/chaos-engineering-at-target-part-2)** (Target Tech Blog). Один из немногих публичных взглядов изнутри на то, как крупная компания встраивает game day в обычную работу: cadence, участники, что делают с находками.

### Инструменты

- **Markdown-сценарий в git** — основной артефакт game day: входной сигнал, expected runbook, abort-conditions, observability checklist, scoring rubric. Без документа сценарий разваливается на устные договорённости и не воспроизводится через квартал.
- **[postmortem-templates](https://github.com/dastergon/postmortem-templates)** — публичные постмортемы как источник сценариев. По моим наблюдениям, лучшие game day-сценарии — это реальные инциденты других компаний, адаптированные под свой стек. Дешевле и реалистичнее, чем выдумывать.
- **[Chaos Mesh](https://chaos-mesh.org/) / [AWS Fault Injection Service](https://aws.amazon.com/fis/)** — chaos tooling для game day с реальной инъекцией. См. [Chaos Engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/) — там подробно про выбор. Для game day важна **safety-сторона**: явный abort-condition и фиксированный blast radius, не «посмотрим как пойдёт».
- **PagerDuty / Opsgenie на test-сервисе** — отдельный test-pager для game day, чтобы не путать сигналы. Реальный alert flow → реальный pager → real-feel response.
- **Tabletop-формат без tooling** — лист бумаги, facilitator, команда вокруг стола. Wheel of Misfortune в чистом виде. Самый дешёвый и при этом один из самых эффективных game day-форматов. Не недооценивать.

## Best practices

Главный публичный кейс — **Google DiRT (Disaster Recovery Testing)**. Kripa Krishnan описывает в ACM Queue 2012, как Google ежегодно проводит full-scale exercise: команды отключают сервисы, тренируют коммуникации, проверяют business continuity на масштабе всей компании. DiRT — не chaos engineering и не continuous: это **запланированный ритуал** с командным центром, расписанием, ролями, и (главное) executive buy-in. Из его уроков несколько универсальных: (1) findings без owner'а и дедлайна не закрываются; (2) сценарии нужно ротировать, иначе команда натренирована только на знакомые failure modes; (3) tabletop-вариант DiRT (без реальной инъекции) даёт 60-70% ценности за 10% стоимости. Если читаете лист и планируете first game day — сначала статью Krishnan, потом сюда.

**Короткие правила:**

- **Game day — это ритуал, не разовая активность к OKR.** Single-shot game day не строит мышечную память и не калибрует команду по мере смены людей. Антипаттерн: «провели в прошлом квартале, теперь продолжим в этом году». Правильно — фиксированный календарь, ритм месяц/квартал, scenarios варьируются.
- **Один game day — одна явная цель тренировки.** «Кладём всё одновременно, посмотрим что выйдет» — команда теряет понимание, что именно она тренирует, и не извлекает уроки. Каждый сценарий тренирует **одну способность** (escalation, runbook execution, comms cadence, role handoff). Можно усложнять между game day'ями, но не внутри одного.
- **Abort-condition и blast radius — до начала, не в моменте.** Когда «ой, что-то не так» происходит в моменте game day, единственный способ безопасно остановиться — заранее зафиксированный abort: SLO burn rate > X, error rate > Y, customer impact detected → немедленный stop, cleanup, debrief. Без abort game day превращается в real incident.

Подробнее:

**Wheel of Misfortune — недооценённый формат.** Я регулярно вижу команды, которые сразу пытаются «по-взрослому» — staging с chaos tooling, на полдня, с full observability. Это дорого, требует инфраструктуры и часто не запускается из-за этого. Tabletop-вариант (Wheel of Misfortune из SRE Workbook гл. 28) — facilitator описывает входной alert, команда обсуждает «что бы вы сделали → откуда узнаете, сработало ли». Час времени, ноль инфраструктуры. Я считаю, что для команды, у которой game day ещё нет, единственный осмысленный первый шаг — это месяц tabletop'ов перед попыткой staging-injection. Дешевизна = регулярность; регулярность = ритуал; ритуал = мышечная память.

**Post-game review важнее самой тренировки.** Самая частая поломка ритуала, которую я наблюдаю: game day прошёл, всем понравилось, findings записаны в Slack-канал, никто не возвращается. Через квартал команда не помнит ни findings, ни почему runbook был неясен. Структура работающего review: factual timeline, что сработало / что нет, runbook updates, observability gaps, action items с владельцем и дедлайном. На следующем game day первый пункт — review action items от прошлого. Без этой петли game day становится развлечением.

**Game day для всей команды, не только для onboardee.** Wheel of Misfortune часто воспринимают как onboarding-инструмент (см. [SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)) — что правильно, но это часть ценности. Основная — это **continuous calibration существующей команды**. People drift away from process, runbook'и устаревают вместе с инфраструктурой, observability gap'ы накапливаются. Без регулярной тренировки команда теряет skill, не замечая этого, и обнаруживает потерю на real incident в 3 ночи. Регулярный game day — это аналог fire drill в офисе: участвуют все, не только новички.

**Cultural prerequisites: blameless, postmortem, runbook discipline.** Те же три предпосылки, что и для chaos engineering (см. соседний лист). Если в команде game day finding превращается в «кто пропустил это в runbook» — feedback loop сломан, и через 2-3 game day'я команда перестанет серьёзно участвовать. Pre-check адопции в порядке: [blameless-постмортем](/The-Way-of-SRE/leaves/practices/blameless-postmortem/) → working runbook practice → game day. Без первых двух game day превращается в blame-генератор и теряет смысл за квартал.

## Связанные листья

- **[Chaos Engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/)** — метод проверки гипотез о системе; может использоваться в game day, но scope шире (continuous, automated). Game day — ритуал, chaos — метод; пересекаются, но не дублируются.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — game day тренирует **именно этот процесс**: роли, escalation, sitrep, mitigation vs investigation. Без working incident response practice game day не имеет, что тренировать.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — Wheel of Misfortune для onboardee — частный случай game day. Здесь — про continuous calibration команды, там — про скрипт первых недель.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — game day findings обрабатываются через постмортем-формат; качество разборов = качество сценариев для будущих drill'ов.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — game day — основной механизм валидации runbook'ов: если шаги не сработали — runbook outdated. Без drill'а вы узнаёте об этом в реальном инциденте.
- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — scenarios варьируются по severity; game day тренирует correct severity declaration без давления реального инцидента.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — game day с participation новых on-call инженеров — основная подготовка перед первой неделей; снижает MTTR и тревожность.
- **[Communities of Practice](/The-Way-of-SRE/leaves/culture/communities-of-practice/)** — cross-team game day и sharing сценариев между командами — типичная активность CoP по reliability.
- **[Postmortem Database](/The-Way-of-SRE/leaves/culture/postmortem-database/)** — главный источник сценариев game day; реальные прошлые инциденты лучше любых вымышленных.
- **[Playbooks](/The-Way-of-SRE/leaves/culture/playbooks/)** — playbook без training работает один раз; game day — место, где playbook'и тренируются и обнаруживаются их пропуски.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/)** — annual DR exercise (full-scale tabletop + functional drill) — это game day в DR-scope. Здесь — training-сторона; там — policy и stakeholder map, которые exercise валидирует.

## Открытые вопросы
- Cadence на команду (раз в месяц / квартал / полугодие) зависит от размера команды, ротации on-call, скорости изменений инфраструктуры. Универсальной формулы я не нашёл; квартальный встречается чаще всего.
- Я не уверен, как корректно проводить game day в командах, где on-call rotation 24/7 и любой scheduled drill совпадает с реальной нагрузкой. Возможно, ответ — async tabletop-формат, но рабочей публичной практики я не видел. Если есть опыт — расскажите PR'ом.
