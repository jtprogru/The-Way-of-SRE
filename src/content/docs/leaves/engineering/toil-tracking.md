---
title: Toil Tracking
description: Дисциплина обнаружения, классификации и количественной оценки toil как фундамент решений об автоматизации, capacity и хайринге — без измерения нельзя ни budget'ировать, ни приоритизировать
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Toil Reduction / Toil Tracking
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

**Toil** в канонической Google SRE-формулировке — операционная работа, которая **manual, repetitive, automatable, tactical, devoid of enduring value, scales linearly with service growth**. Toil Tracking — дисциплина обнаружения, классификации и количественной оценки этой работы. Не любая операционная работа — toil; только та, что соответствует всем критериям. Без явного учёта toil невозможно ни ограничить его (toil budget), ни автоматизировать прицельно (автоматизируешь не то, что съедает время). Главная практика внутри L1 `Toil Reduction`; соседние практики (Toil Automation, Alert Fatigue Management) — в «Открытых вопросах».

## Что должен уметь

- **L3** — Понимает каноническое определение toil (5 критериев: manual / repetitive / automatable / tactical / devoid of enduring value / scales linearly); различает toil и project work, не сваливает всё «нелюбимое» в toil.
- **L3** — Фиксирует свой toil еженедельно в простом формате (что / сколько времени / категория); делает это **в момент** работы, не «вспомню в пятницу».
- **L4** — Проводит inventory toil команды: список повторяющихся операционных задач, кто их делает, как часто, средняя продолжительность; формирует первую baseline для tracking.
- **L4** — Классифицирует toil по канонической таксономии: alert response, deploy operations, capacity events, account management, build/release noise, fire-fighting context-switch и т.д.
- **L5** — Устанавливает team toil tracking как ritual: cadence (по итогам спринта / еженедельно), простой tool (spreadsheet / form / Slack-bot), агрегация в дашборд; ведёт baseline за квартал минимум.
- **L5** — Использует toil data для приоритизации автоматизации: «highest volume × frequency × annoyance» — что устранить первым; явное решение, зафиксированное в backlog с owner'ом, а не «потом сделаем».
- **L5** — Устанавливает toil budget команды: соглашение на максимальный % времени на toil per engineer (Google SRE convention ≤ 50%, можно мягче для junior'ов и жёстче для senior'ов); over budget → автоматизация приоритетнее features.
- **L6+** — Внедряет внутренние toil dashboards: aggregated метрики по сервисам / командам для org-level pattern detection (какой сервис генерирует disproportionate toil, какие команды близки к burnout, где автоматизация даст самый широкий ROI).
- **L6+** — Связывает toil с capacity planning и hiring: высокий и растущий toil → либо автоматизировать, либо нанимать; **toil — это hidden capacity ceiling**, и игнорирование приводит к скрытому overload, который виден только при churn'е.

## Материалы

### Книги

- Vivek Rau (ред. Betsy Beyer) — **[Site Reliability Engineering](https://sre.google/sre-book/eliminating-toil/)** (O'Reilly, 2016), глава 5 «Eliminating Toil». База: каноническое определение toil (5 критериев), правило ≤ 50% per SRE, тезис «toil scales linearly while engineering scales sublinearly».
- David Challoner et al. — **[The Site Reliability Workbook](https://sre.google/workbook/eliminating-toil/)** (O'Reilly, 2018), глава 6 «Eliminating Toil». Продолжение SRE Book гл. 5: таксономия источников toil, стратегии управления, два детальных case study из Google.

### Статьи и фреймворки

- **[Twelve-Factor App](https://12factor.net/)** косвенно связан: соблюдение 12-Factor (особенно факторов processes, disposability, dev/prod parity) снижает класс toil вокруг deploy и operations; контекст полезен при анализе toil source'ов.

### Инструменты

- **Spreadsheet / Google Form / Notion DB** — базовый формат: колонки `date / engineer / category / minutes / note`. Низкая стоимость старта, достаточно для команды на 5-10 SRE; визуализация через pivot.
- **Tag в issue tracker** — JIRA / Linear / GitHub Issues с тегом `toil`: каждая операционная задача создаётся как issue с tag'ом, агрегация — встроенными dashboards трекера. Преимущество — toil виден в общем backlog, не «параллельная книга учёта».
- **Pulse-surveys** — еженедельный 30-секундный опрос: «сколько часов на toil за прошлую неделю, главная категория, что бесило» — поверх spreadsheet'а как качественный сигнал. Инструменты вроде **[Team Health 1:1](https://github.com/fadeinflames/team-health)** включают такие pulse-метрики.
- **Sprint retro как ritual** — последний пункт retro: «какой toil доминировал, что автоматизировать в следующем спринте». Не отдельная встреча, а часть существующей.

## Best practices

- **Track toil, do not assume.** Антипаттерн: «мы все ужасно заняты on-call'ом». Без данных — нет действия: приоритеты автоматизации спорят на эмоциях, budget устанавливается «по ощущениям», обращения за hire'ом отклоняются «у вас же всё работает». Минимальный tracking лучше отсутствующего; spreadsheet за неделю даёт больше, чем месяц «мы знаем, где toil».
- **Стой на 5-критериальном определении, не «всё, что бесит».** Антипаттерн: классификация по subjective annoyance. Toil — *technical* категория: задача, которая по своим свойствам подходит под automation. «Сложный code review» — не toil (требует enduring judgment), «копировать configs руками между env'ами» — toil (automatable, repetitive, scales linearly). Без жёсткого определения tracking превращается в complaint log.
- **Toil ≤ 50% per engineer (Google SRE convention).** Антипаттерн: 80%+ toil как норма. На этом уровне engineer не делает project work, не учится, не автоматизирует — система самоподдерживается в высоком toil'е. Если 50% — недостижимо в текущих условиях, явное решение: либо нанимать, либо сократить scope сервисов команды. Молчаливое принятие 80% — путь к burnout и churn.
- **Автоматизируй highest impact (volume × frequency), не «fun project».** Антипаттерн: автоматизация редких clever cases ради удовольствия. ROI от автоматизации toil — линейная функция от частоты × длительности; высокая длительность × низкая частота даёт меньше выигрыша, чем низкая длительность × высокая частота. Tracking даёт данные для правильной приоритизации.
- **Toil review как часть регулярного ritual'а, не «один раз и забыли».** Антипаттерн: tracking установлен раз, через месяц никто не смотрит, toil tracker превращается в data graveyard. Toil review — отдельный пункт sprint retro или встроенный в SLO Review; данные смотрят и принимают решения регулярно, иначе сбор данных бессмыслен.
- **Eliminate before automate.** Антипаттерн: автоматизация процесса, который не должен существовать. Перед написанием скрипта на toil — вопрос: «можно ли вообще убрать эту работу, изменив систему или контракт?». Например: вместо автоматизации копирования configs — централизация config в IaC; вместо автоматизации rotate prod credentials по email — auto-rotation через Vault. Дешевле и долговременнее, чем clever automation.

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog ассоциирует каждый сервис с его toil-уровнем; владельцы видят, какие сервисы дают непропорциональный toil, и могут принимать solving-decisions.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook reduces toil только если *хороший*: actionable, с критериями проверки. Плохой runbook увеличивает toil (engineer тратит время на расшифровку). Quality runbook — toil-mitigation tool.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — deploy operations — крупный класс toil; canary / feature flags / auto-rollback устраняют рутинные ручные шаги.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC устраняет config-toil (manual changes в cloud UI, copy-paste между env'ами); один из самых высоких-impact toil-reduction уровней.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — alert fatigue — отдельный класс toil; SLO-based alerts с high signal-to-noise ratio + runbook'ом сокращают alert-toil более чем в любой другой технике.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — fire-fighting context-switch — высоковесь toil; уменьшается зрелым incident response (быстрее MTTR → меньше времени в context-switch'е).

## Открытые вопросы

- **Toil Automation** *(TBD)* — отдельная практика автоматизации (как именно писать tools для устранения toil, паттерны типа one-off → reusable → product). Соседняя практика внутри `Toil Reduction` L1; здесь — про learning **что** автоматизировать, там — про **как**.
- **Alert Fatigue Management** *(TBD)* — уже упоминалось в «Открытых вопросах» `SLI-based Alerting`. Пересечение с Toil Tracking через alert-toil категорию; возможно отдельный лист на стыке Observability / Toil Reduction L1.
- **Capacity Planning & Toil** — связь toil ↔ capacity ↔ hiring заслуживает отдельной разработки; пока упомянуто в L6+, в будущем — отдельный раздел или лист под `Reliability Engineering` L1.
- **Toil ROI Calculation** — методика расчёта возврата от автоматизации (saved hours × hourly rate − automation cost − maintenance) — самостоятельная подтема, потенциально часть углублённой версии этого листа.
