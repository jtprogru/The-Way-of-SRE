---
title: Mentoring as Practice
description: 1-on-1 наставничество как регулярная практика — контракт, cadence, границы ответственности, передача опыта вне формального обучения
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Professional Development / Mentoring as Practice
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Nice to have
- **Статус:** draft
:::

«Подкинь Лёше [junior'а] на менторство, у тебя получится» — типичный заход, после которого через 2 месяца оба участника тихо забивают. Менторство стартует без явного контракта (зачем встречаемся, на что mentee рассчитывает, на что готов mentor), без cadence, без явного срока — превращается либо в очередной status update, либо в случайные «спроси, если что». Mentoring as Practice — это **регулярная 1-on-1 связь** с явным контрактом, в которой более опытный инженер передаёт **контекст и навыки**, не покрываемые формальным онбордингом, не сводимые к code review и не растворяющиеся в командных ритуалах.

Сразу границы с соседями: [SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/) — org-level процесс с фиксированным curriculum на 12 недель, в котором mentor — формальная роль; этот лист — про **continuous practice** после onboarding или вне его. [Communities of Practice](/The-Way-of-SRE/leaves/culture/communities-of-practice/) — group learning через границы команд, mentoring — pair learning. [Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/) — vocabulary роста; mentoring — один из transfer mechanisms, через который инженер закрывает gap'ы между уровнями.

## Что должен уметь

Главный навык на уровне L5 — формулировать **mentoring contract** в начале связи. «Давай раз в две недели, посмотрим как пойдёт» — антиконтракт: ни зачем встречаемся, ни на что mentee имеет право, ни на сколько готов mentor. Контракт на 1 экран (цель связи, cadence, срок, формат, ожидания обеих сторон, exit condition) убирает 80% случаев тихой смерти менторских пар. Я регулярно вижу разницу: пары с явным контрактом живут год; пары без — два-три месяца.

**L4**
- Ведёт регулярные 1-on-1 с junior-инженером своей команды или соседней: подготовка повестки со стороны mentee, фиксация action items, follow-up на следующей встрече.
- Различает менторство и code review: менторская встреча — про **контекст и навыки**; code review — про конкретный merge request. Не подменяет одно другим.
- Даёт feedback по модели SBI (Situation / Behavior / Impact), а не «всё было нормально» или «давай ещё раз посмотрим».

**L5**
- Договаривается о mentoring contract с mentee при старте: цель связи на 3–6 месяцев, cadence, формат, ожидания, exit-условие.
- Балансирует **pull vs push**: на ранних встречах активно предлагает темы (mentee ещё не знает, чего не знает); по мере роста смещает повестку к темам mentee, доводя до 70/30 в пользу mentee.
- Работает с mentee из соседних команд / соседних специализаций: меньше overlap по контексту, выше value для cross-team learning, но требует больше дисциплины со стороны mentor (нет естественного канала «увидеть на работе»).
- Знает, когда **отказаться** от менторства: capacity нет, домен совсем чужой, ценностный mismatch, нет химии после первых двух встреч. Отказ — нормальный исход, тихая деградация — нет.

**L6+**
- Поддерживает 2–3 менторские связи одновременно как часть staff/principal-роли — менторство входит в expected behavior уровня (см. большинство ladders Progression.fyi).
- Влияет на mentoring-программу на уровне команды / org: matching mechanism (как находятся пары), training для новых mentor'ов, success criteria, sunset для умерших пар.
- Различает менторство, sponsorship и coaching: mentor делится опытом, sponsor открывает возможности (рекомендует, защищает, продвигает), coach задаёт вопросы без позиции эксперта. Каждая роль — отдельный социальный контракт.

## Материалы

### Книги

- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). Главы про mentorship и tech lead — лучший практический guide. Если читать одну главу — главу «Mentoring».
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Mentoring и sponsoring как expected behaviour staff IC; интервью со staff engineers'ами регулярно возвращаются к менторству как к каналу влияния.
- Lara Hogan — **Resilient Management** (A Book Apart, 2019). Глава про feedback моделями SBI и radical candor — применимо напрямую в менторских разговорах.
- Lara Hogan — **[Demystifying Public Speaking](https://abookapart.com/products/demystifying-public-speaking)** (A Book Apart, 2017). Если mentor сам растит mentee к выступлениям / brown bags — короткий применимый ресурс.

### Статьи и фреймворки

- Lara Hogan — **[Questions for our first 1:1](https://larahogan.me/blog/first-one-on-one-questions/)**. Подходит и под first mentoring meeting: questions для договора об ожиданиях с самого начала.
- Will Larson — **[Mentor Many](https://lethain.com/mentor-many/)** (lethain.com). Тезис: «mentor 1-2 человек — норма, mentor 5+ — масштабирование influence». Полезно как противовес одной из распространённых ошибок (mentor берёт одного человека «на всю жизнь»).
- **[Plato — Engineering Mentorship](https://www.platohq.com/)**. Не пересказ статьи — пример того, как индустрия структурирует matching: профили mentor'ов, формализованные goals, paid model. По моим наблюдениям, формат `Plato-style matching` чаще всего копируется внутрь компаний как enabling tooling.

### Инструменты

- **Shared notes в repo / Notion / Google Doc** — самый дешёвый и работающий формат для менторской пары: один документ, секции per-meeting, agenda / discussion / action items. Полностью аналогичен формату 1:1.
- **Mentoring contract template** — markdown на одну страницу: цели / срок / cadence / формат / ожидания обеих сторон / exit condition. По моим наблюдениям, разница между парами с контрактом и без — это разница между «год живой связи» и «3 месяца молчания».
- **Matching tools для org-scale программ:** Plato, MentorCruise, Together Platform. Полезны, когда org переходит от ad-hoc menторства к программе на 50+ пар; до этого порога — overengineering, ручной matching через manager / staff IC справляется.

## Best practices

Я регулярно вижу одну и ту же траекторию неудачной менторской пары: на первой встрече mentor спрашивает «о чём поговорим?», mentee отвечает что-то общее («хочу расти как инженер»), стороны проводят 45 минут в полу-status-полу-карьерной беседе, через две недели mentee «занят», ещё через две — mentor «не успевает», на третьем переносе всё тихо умирает. Никто не виноват — оба не сформулировали, зачем встречаются. У живых менторских пар на старте всегда есть **контракт**, который mentor предлагает первым.

**Короткие правила:**

- **Контракт обязателен, и mentor предлагает первым.** Контракт на одну страницу: цель связи, cadence, срок (3 или 6 месяцев — оба валидно, дальше renew), формат (1:1 раз в две недели + async), exit-условие. Mentee на старте редко формулирует это сам — инициатива всегда на mentor'е.
- **Менторство — не code review и не status.** Code review — про конкретный merge request; status — про текущие задачи. Менторство — про контекст, навыки, карьерные вопросы, психологические блоки. Смешение убивает все три практики.
- **Pull > push по мере роста доверия.** На первых встречах mentor предлагает темы (mentee не знает, чего не знает); через 2–3 месяца — повестка смещается на mentee, mentor слушает 70% времени. Если через 6 месяцев mentor всё ещё ведёт повестку — связь не выросла.

Подробнее:

**Cadence важнее интенсивности.** Часовая встреча раз в две недели на протяжении 6 месяцев даёт больше, чем full-day workshop раз в квартал. Это база deliberate practice: feedback loop должен быть короче, чем горизонт изменений. Раз в две недели — sweet spot для большинства пар; раз в неделю — для onboarding mentor (см. [SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)) или для острых периодов; раз в месяц — недостаточно для transfer, скорее check-in.

**Mentor из соседней команды / специализации часто полезнее, чем из своей.** Внутри своей команды mentor видит mentee каждый день — менторские встречи лишены свежего взгляда, легко скатываются в обсуждение текущих задач. Mentor из соседней команды (а лучше — соседней специализации: SRE-mentee у backend-staff IC, или наоборот) добавляет cross-team perspective, отсекает домыкания «у нас всегда так делалось», вынуждает обоих формулировать контекст явно. Я регулярно вижу, что cross-domain менторство даёт больший рост в каждый час встречи, хотя стартовать его сложнее (mentee приходится больше рассказывать про свой контекст).

**Mentor выгорает тихо — exit condition нужен заранее.** Менторство voluntary, безоплатное и трудно измеримое. Когда у mentor'а проседает capacity, он не отменяет встречу — он переносит её, чтобы не разочаровывать mentee. Через 2–3 переноса связь тихо умирает, обе стороны несут осадок «я подвёл другого». Exit condition в контракте («через 6 месяцев пересмотрим; либо renew, либо closing meeting + closure») делает завершение **нормальным исходом**, а не неудачей. По моим наблюдениям, контракт с явным сроком и renew-моментом — главный способ сохранить менторство как практику в карьере на 10+ лет.

**Mentoring program на масштабе org требует matching и training, не platform.** Org вырастает за десятки пар — кто-то начинает думать про «менторскую платформу». В 80% случаев это overengineering: реальные узкие места — это **matching** (как находятся пары: random, по domain, по level gap) и **training** для новых mentor'ов (большинство первый раз менторят и не знают, что mentoring contract — норма). Хорошо отлаженный matching через staff IC + 1-часовой training новых mentor'ов даёт больше, чем любая платформа.

## Связанные листья

- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — менторская встреча технически — это разновидность 1:1 без отношений manager-IC. Дисциплина та же (agenda, shared notes, action items, follow-up), отличается контекст и контракт.
- **[Personal Growth Plan](/The-Way-of-SRE/leaves/practices/personal-growth-plan/)** — план mentee — основной input для менторских встреч; mentor помогает калибровать target state и выбирать stretch projects.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — onboarding mentor — частный случай менторства с фиксированным curriculum и сроком 12 недель; после онбординга связь либо завершается, либо переходит в continuous mentoring по этому листу.
- **[Communities of Practice](/The-Way-of-SRE/leaves/culture/communities-of-practice/)** — параллельный канал распространения практики через границы команд; менторство — pair, CoP — group. Хорошие компании держат оба, не подменяют один другим.
- **[Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/)** — ladder — vocabulary роста; mentor помогает mentee переводить уровни в конкретные next steps.

## Открытые вопросы

- **Sponsorship as Practice** *(TBD)* — sponsor открывает возможности (рекомендует, защищает, продвигает), mentor делится опытом. Социально разные роли, разные риски, разные эффекты на карьеру; заслуживают отдельного листа.
- **Coaching vs Mentoring** — coaching задаёт вопросы без позиции эксперта; mentor приходит с позицией. Граница важная, но для отдельного листа пока узковато.
- **Reverse mentoring** — junior как mentor для senior (новые технологии, generational context, perspective за пределами текущего опыта senior'а). Я не видел рабочих программ вживую, поэтому пока не пишу лист — расскажите через PR, если есть опыт.
- **Mentoring выгорание на масштабе** — staff IC берёт 3+ mentee, через год выгорает. У меня нет надёжного pattern, как этого избежать кроме «mentor many» подхода Larson'а. Если у вас есть рабочий способ — расскажите через PR.
