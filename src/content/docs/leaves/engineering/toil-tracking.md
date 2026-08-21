---
title: Toil Tracking
description: Обнаружение, классификация и измерение toil — фундамент решений об автоматизации и hiring
sfia: [3, 4, 5, 6]
status: draft
---

«Мы все ужасно заняты on-call'ом» — эту фразу я слышу регулярно. Без данных она не значит ничего. Пока [toil](/The-Way-of-SRE/glossary/#toil) не посчитан, его нельзя ни ограничить (toil budget), ни автоматизировать прицельно — руки тянутся не к тому, что съедает время, а к тому, что интереснее написать, — ни превратить в аргумент для найма. Toil — техническая категория с конкретным определением (Google SRE: manual / repetitive / automatable / tactical / devoid of enduring value / scales linearly), а не «всё, что бесит». Этот лист — про **измерение** такой работы. Соседние практики под тем же L1: [Toil Automation](/The-Way-of-SRE/leaves/engineering/toil-automation/) (про *как* устранять), [Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/) (уровень одного инженера), [ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/) (командная автоматизация через чат).

## Что должен уметь

Главный навык на уровне L5 — держать **toil budget команды** в реальности, а не на бумаге. Google SRE convention — ≤ 50% на инженера. На практике в командах, которые я наблюдаю, это либо игнорируется (80%+ toil как норма), либо превращается в KPI без обратной связи. Budget работает только тогда, когда выход за него автоматически поднимает автоматизацию **выше** feature work в приоритетах. Иначе это просто число в вики.

**L3**
- Понимает каноническое определение toil (шесть признаков: ручная, повторяющаяся, автоматизируемая, тактическая, не создающая долговременной ценности работа, объём которой растёт линейно с сервисом); различает toil и project work, не сваливает всё «нелюбимое» в toil.
- Фиксирует свой toil еженедельно (что / сколько времени / категория); делает это **в момент** работы, не «вспомню в пятницу».

**L4**
- Проводит inventory toil команды: список повторяющихся операционных задач, кто их делает, как часто, средняя продолжительность; формирует baseline.
- Классифицирует toil по канонической таксономии: alert response, deploy operations, capacity events, account management, build/release noise, fire-fighting context-switch.

**L5**
- Устанавливает team toil tracking как ritual: cadence, простой tool (spreadsheet / form / Slack-bot), агрегация в дашборд; baseline за квартал минимум.
- Использует toil data для приоритизации автоматизации: highest volume × frequency × annoyance — что устранить первым.
- Устанавливает toil budget команды: соглашение на максимальный % времени на toil на инженера (Google SRE convention ≤ 50%); over budget → автоматизация приоритетнее features.

**L6+**
- Внедряет внутренние toil dashboards: aggregated метрики по сервисам / командам для org-level pattern detection.
- Связывает toil с capacity planning и hiring: высокий и растущий toil → либо автоматизировать, либо нанимать; **toil — это hidden capacity ceiling**.

## Материалы

### Книги

- Vivek Rau (ред. Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/eliminating-toil/)** (O'Reilly, 2016), глава 5 «Eliminating Toil». Каноническое определение toil через шесть признаков, правило ≤ 50% per SRE, тезис «toil scales linearly while engineering scales sublinearly».
- David Challoner et al. — **[The Site Reliability Workbook](https://sre.google/workbook/eliminating-toil/)** (O'Reilly, 2018), глава 6 «Eliminating Toil». Таксономия источников toil, стратегии управления, два детальных case study из Google.

### Статьи и фреймворки

- **[Twelve-Factor App](https://12factor.net/)** косвенно связан: соблюдение 12-Factor (processes, disposability, dev/prod parity) снижает класс toil вокруг deploy и operations.

### Инструменты

- **Spreadsheet / Google Form / Notion DB** — базовый формат: колонки `date / engineer / category / minutes / note`. Низкая стоимость старта, достаточно для команды на 5–10 SRE.
- **Tag в issue tracker** — JIRA / Linear / GitHub Issues с тегом `toil`: каждая операционная задача создаётся как issue с tag, агрегация — встроенными dashboards трекера. По моим наблюдениям, это работает лучше отдельной книги учёта — toil виден в общем backlog.
- **Pulse-surveys** — еженедельный 30-секундный опрос: «сколько часов на toil за прошлую неделю, главная категория, что бесило» — поверх spreadsheet'а как качественный сигнал.
- **Sprint retro как ritual** — последний пункт retro: «какой toil доминировал, что автоматизировать в следующем спринте». Не отдельная встреча, а часть существующей.

## Best practices

Первое правило простое: считай, а не предполагай. Без данных приоритеты автоматизации спорят на эмоциях, budget ставится «по ощущениям», а запрос на найм отбивается фразой «у вас же всё работает». Минимальный учёт лучше отсутствующего. Неделя честного spreadsheet'а даёт больше, чем месяц разговоров «мы и так знаем, где toil».

Второе — держаться определения, а не ощущения «меня это бесит». Сложный code review не toil, он требует суждения, которое ничем не заменишь. А копирование конфигов руками между окружениями — toil по всем признакам: повторяется, автоматизируется, растёт линейно с числом сервисов. Стоит отпустить границу, и tracker превращается в complaint log, из которого нельзя вывести ни одного решения.

**Toil ≤ 50% на инженера (Google SRE convention).** На уровне 80%+ инженер не делает project work, не учится и не автоматизирует, а значит, ничего не меняет в системе, которая этот toil производит, — и она спокойно самоподдерживается в том же режиме год за годом. Круг замыкается. Если 50% недостижимо, это тоже решение, только его надо принять явно: нанимать или резать scope.

**Автоматизируй самое дорогое (частота × длительность), а не самое интересное.** ROI автоматизации считается по этим двум числам, и они обычно указывают на скучную ежедневную мелочь. Я регулярно вижу обратное: команда берёт редкий хитрый случай, потому что его приятнее писать. Tracking тут работает как холодный душ — он показывает ranked list, с которым спорить трудно.

**Toil review живёт внутри существующего ритуала.** Учёт заводят один раз, через месяц в него никто не смотрит, ещё через квартал tracker перестаёт работать и превращается в data graveyard. Лечится это дёшево: отдельный пункт в sprint retro или в SLO Review, где данные смотрят и принимают по ним решение. Сбор без разбора бессмыслен.

**Eliminate before automate.** Прежде чем писать скрипт, стоит задать вопрос: а можно ли убрать эту работу вообще, поменяв систему или контракт? Вместо автоматизации копирования конфигов — централизация в IaC. Вместо скрипта, который ротирует prod credentials по письму, — авторотация через Vault. Скрипт — не всегда ответ. Дешевле и живёт дольше, чем любая ловкая автоматизация, ровно потому, что убранная работа не требует ни поддержки, ни владельца, ни строчки в дашборде. По моим наблюдениям, ≈30% задач, которые команды собираются автоматизировать, можно просто удалить, но это разговор о процессе, а не про «написать скрипт».

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog связывает каждый сервис с его уровнем toil; владельцы видят, какие сервисы дают непропорциональный toil.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook reduces toil, только если *хороший*. Плохой runbook увеличивает toil.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — deploy operations — крупный класс toil; canary / feature flags / auto-rollback устраняют рутинные шаги.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC устраняет toil вокруг конфигураций; один из самых окупаемых шагов сокращения toil.
- **[Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/)** — alert fatigue — отдельный класс toil; SLO-based alerts с high signal-to-noise + runbook сокращают alert-toil сильнее, чем любая другая техника.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — переключение на тушение пожара — самый тяжёлый класс toil; уменьшается зрелым incident response.
- **[Toil Automation](/The-Way-of-SRE/leaves/engineering/toil-automation/)** — пара: tracking даёт ranked list самого дорогого toil; automation реализует elimination. Здесь — про *что*; там — про *как*.
- **[Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/)** — самый дешёвый уровень toil reduction (alias / CLI / templates) для individual-level задач.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — chat-driven форма team-level automation; снимает operational запросы через bot interface.

## Открытые вопросы

Automation отсюда уже выделена в отдельный лист (см. Связанные листья). Что осталось нерешённым у меня самого — связка toil ↔ capacity ↔ hiring: интуитивно понятно, что растущий toil упирается в потолок capacity, но внятной методики перевода часов toil в заявку на найм я не встречал. Туда же — расчёт возврата от автоматизации (saved hours × hourly rate − automation cost − maintenance): формула выглядит очевидной ровно до момента, когда надо честно оценить последнее слагаемое.
