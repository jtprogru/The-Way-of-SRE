---
title: Toil Tracking
description: Обнаружение, классификация и измерение toil — фундамент решений об автоматизации и hiring
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Toil Reduction / Toil Tracking
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Мы все ужасно заняты on-call'ом» — фраза, которую я слышу регулярно, и без данных она ничего не значит. Без явного учёта [toil](/The-Way-of-SRE/glossary/#toil) невозможно ни ограничить его (toil budget), ни автоматизировать прицельно (автоматизируешь не то, что съедает время), ни обосновать hiring. Toil — это **technical** категория с конкретным определением (Google SRE: manual / repetitive / automatable / tactical / devoid of enduring value / scales linearly), а не «всё, что бесит». Лист — про **измерение** этой работы; соседние практики под тем же L1: [Toil Automation](/The-Way-of-SRE/leaves/engineering/toil-automation/) (про *как* устранять), [Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/) (individual-level), [ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/) (chat-driven team automation).

## Что должен уметь

Главный навык на уровне L5 — поддерживать **toil budget команды** в реальности, а не на бумаге. Google SRE convention — ≤ 50% на инженера; на практике в командах, которые я наблюдаю, это либо игнорируется (80%+ toil как норма), либо превращается в KPI без обратной связи. Toil budget работает, только когда over budget автоматически означает приоритизацию автоматизации **выше** feature work — иначе это просто число.

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

**Короткие правила:**

- **Track toil, do not assume.** Без данных приоритеты автоматизации спорят на эмоциях, budget устанавливается «по ощущениям», обращения за hire'ом отклоняются «у вас же всё работает». Минимальный tracking лучше отсутствующего; spreadsheet за неделю даёт больше, чем месяц «мы знаем, где toil».
- **Стой на 5-критериальном определении, не «всё, что бесит».** «Сложный code review» — не toil (требует enduring judgment); «копировать configs руками между env'ами» — toil (automatable, repetitive, scales linearly). Без жёсткого определения tracking превращается в complaint log.
- **Toil ≤ 50% на инженера (Google SRE convention).** На уровне 80%+ инженер не делает project work, не учится, не автоматизирует — система самоподдерживается в высоком toil. Если 50% недостижимо — явное решение: либо нанимать, либо сократить scope.

Подробнее:

**Автоматизируй highest impact (volume × frequency), не «fun project».** ROI от автоматизации toil — линейная функция от частоты × длительности. Я регулярно вижу команды, которые автоматизируют clever rare cases (потому что интересно), оставляя ежедневные мелочи. Tracking даёт данные для правильной приоритизации, иначе автоматизация выбирается по принципу «что приятнее сделать».

**Toil review как часть регулярного ritual'а, не «один раз и забыли».** Tracking установлен раз, через месяц никто не смотрит, toil tracker превращается в data graveyard. Toil review — отдельный пункт sprint retro или встроенный в SLO Review; данные смотрят и принимают решения регулярно. Без review сбор данных бессмыслен.

**Eliminate before automate.** Перед написанием скрипта на toil — вопрос: «можно ли вообще убрать эту работу, изменив систему или контракт?». Например: вместо автоматизации копирования configs — централизация config в IaC; вместо автоматизации rotate prod credentials по email — auto-rotation через Vault. Дешевле и долговременнее, чем clever automation. По моим наблюдениям, ≈30% задач, которые команды собираются автоматизировать, можно вообще удалить — но это требует переосмысления процесса, а не «написать скрипт».

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog ассоциирует каждый сервис с его toil-уровнем; владельцы видят, какие сервисы дают непропорциональный toil.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook reduces toil, только если *хороший*. Плохой runbook увеличивает toil.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — deploy operations — крупный класс toil; canary / feature flags / auto-rollback устраняют рутинные шаги.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC устраняет config-toil; один из самых высоких-impact toil-reduction уровней.
- **[Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/)** — alert fatigue — отдельный класс toil; SLO-based alerts с high signal-to-noise + runbook сокращают alert-toil сильнее, чем любая другая техника.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — fire-fighting context-switch — высоковесь toil; уменьшается зрелым incident response.
- **[Toil Automation](/The-Way-of-SRE/leaves/engineering/toil-automation/)** — пара: tracking даёт ranked list самого дорогого toil; automation реализует elimination. Здесь — про *что*; там — про *как*.
- **[Personal SRE Toolkit](/The-Way-of-SRE/leaves/engineering/personal-sre-toolkit/)** — самый дешёвый уровень toil reduction (alias / CLI / templates) для individual-level задач.
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — chat-driven форма team-level automation; снимает operational запросы через bot interface.

## Открытые вопросы

- **Toil Automation** — выделена в отдельный лист (см. Связанные листья).
- **Capacity Planning & Toil** — связь toil ↔ capacity ↔ hiring заслуживает отдельной разработки.
- **Toil ROI Calculation** — методика расчёта возврата (saved hours × hourly rate − automation cost − maintenance).
