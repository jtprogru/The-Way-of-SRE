---
title: Personal Growth Plan
description: Личный план развития инженера — current state, target, milestones, артефакты как доказательство
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Professional Development / Personal Growth Plan
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

«Выучу Kubernetes в этом квартале» — типичная цель развития, которая через 3 месяца превращается в «я что-то знаю про k8s, но непонятно, что именно». Без артефакта и критерия выполнения прогресс невозможно измерить. Personal Growth Plan — это **живой документ**, в котором current state, target state на горизонт 6–12 месяцев, конкретные milestones и **артефакты** как доказательство движения. Не «годовая цель в HR-системе», а персональный roadmap, который квартально пересматривается на [1:1](/The-Way-of-SRE/glossary/#1-1) и привязан к реальной работе.

Сразу разница с другими листьями про развитие: [SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/) (org-level процесс, что команда делает для нового инженера); [Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/) (org-level vocabulary); этот лист — **personal-level** план, который ведёт сам инженер.

## Что должен уметь

Главный навык на уровне L5 — применять **deliberate practice**. Курсы и книги — это input; learning происходит, когда input применяется на реальной задаче с feedback от практики или ревьюера. Один написанный ADR / прочитанный chapter с применением в коде стоит больше десяти просмотренных видео. Я регулярно вижу инженеров, которые «учатся» — но при ближайшем рассмотрении 90% времени passive consumption: курсы, книги, статьи без обратной связи. Это не обучение, это чтение.

**L3**
- Имеет рабочее представление о своей зоне развития: называет 1–2 компетенции, в которых «слаб», и 1–2, которые хочет прокачать ближайшие 3 месяца.
- Ведёт learning log (markdown / Notion / Obsidian): фиксирует, что прочитал / посмотрел / попрактиковал, **со своими takeaways**, а не списком ссылок «на потом».

**L4**
- Пишет Personal Growth Plan как документ: current state, target state, конкретные milestones с дедлайнами, метрики и артефакты как доказательство.
- Применяет deliberate practice: формулирует учебные цели с измеримым outcome. Не «выучу Kubernetes», а «развёрну stateful-сервис в k8s с HA, задокументирую дизайн в ADR, проведу review с senior».

**L5**
- Использует multi-format learning: pair sessions с senior, code review соседних команд, написание ADR / TDD по новой технологии, публичный talk или внутренний brown bag, статья в команде / блоге.
- Приносит план на 1:1 с руководителем ежеквартально: что сработало, что нет, что меняется в target.
- Deliberately выбирает stretch projects: подписывается на работу outside комфорта с явной learning goal.

**L6+**
- Проектирует портфолио на multi-year horizon: балансирует specialist depth vs generalist breadth, технические vs people skills, internal contribution vs external visibility.
- Конвертирует собственные learnings в community capital: менторит junior, выступает на конференциях, пишет статьи, contributes в open source.

## Материалы

### Книги

- Anders Ericsson, Robert Pool — **Peak: Secrets from the New Science of Expertise** (Houghton Mifflin Harcourt, 2016). Фундаментальная книга про deliberate practice — что отличает экспертов от опытных, почему 10000 часов сами по себе ничего не значат.
- Cal Newport — **So Good They Can't Ignore You** (Grand Central, 2012). Тезис «не ищи passion, строй career capital»; career capital растёт через deliberate practice в редких и ценных skills.
- Cal Newport — **Deep Work** (Grand Central, 2016). Концепция deep work как валюты профессионального роста.
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Путь staff/principal engineer — archetypes, интервью с реальными staff'ами; полезно для проектирования multi-year horizon.
- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). Если в горизонте плана появляется management track — этот референс по карьерным переходам IC ↔ руководитель.

### Статьи и фреймворки

- **[Progression.fyi](https://progression.fyi/)**. Публичная коллекция career ladders 75+ компаний — полезно как self-assessment референс перед формулировкой target state.
- **[SFIA — Skills Framework for the Information Age](https://sfia-online.org/en)**. Канонический framework. Self-assessment по SFIA даёт первую черновую current state картину.

### Инструменты

- **Markdown в личном (или shared с руководителем) repo / Notion / Obsidian** — самый простой формат: один документ, секции current state / target / milestones / log / artifacts; история — git / version history платформы. По моим наблюдениям, чем проще формат, тем дольше план остаётся живым.
- **Learning log** — простой markdown файл с datestamp'ами: «прочитал X, takeaway Y», «парный сеанс с N по теме T, понял Z». Через год — самый честный показатель, что было сделано.
- **Skill matrix (личная)** — таблица «компетенция × текущий уровень × целевой × следующий шаг». Простой markdown или spreadsheet; обновляется ежеквартально на 1:1.

## Best practices

**Короткие правила:**

- **План документирован, а не «в голове».** «Я об этом думаю» — через 3 месяца план превращается в смутное ощущение, цели не достигаются, потому что не были сформулированы достаточно конкретно для проверки. Письменная формулировка — первый акт deliberate practice.
- **Goals measurable: artifact + criterion, а не «выучу X».** Цель «выучу Kubernetes» через 6 месяцев — «я что-то знаю про k8s, но непонятно, что». Цель: «к концу Q3 — развёрнут stateful-сервис в k8s с HA, ADR с дизайном, review с senior, открытые вопросы зафиксированы». Артефакт + критерий — единственный способ измерить прогресс.
- **Deliberate practice > passive consumption.** Курсы и книги — input; learning происходит, когда input применяется на реальной задаче с feedback. Один написанный ADR / прочитанный chapter с применением в коде стоит больше десяти просмотренных видео.

Подробнее:

**Stretch projects регулярно, не «когда дают».** Руководитель не знает, в чём именно инженер хочет расти; инженер обязан явно сигнализировать. Регулярно (раз в квартал) добровольно выбирать одну задачу outside комфорта с явной learning goal — подписаться на работу, которую не делал раньше, с готовностью выйти за рамки текущей роли. По моим наблюдениям, разница между инженерами, которые растут, и теми, которые не растут — именно в этом: первые подписываются, вторые ждут.

**Multi-format learning: reading + practice + teaching + community.** Только один формат (только книги / только курсы / только work tasks) даёт узкое понимание. Лучший feedback loop — комбинация: прочитал → применил на задаче → обсудил с peer → написал заметку для команды → выступил на brown bag. Каждый формат проверяет понимание под разным углом.

**Quarterly review on 1:1 с руководителем, не «забыл и забил».** Написал план в январе, открыл его в декабре — через год план не соответствует ни реальности (контекст команды поменялся), ни прогрессу. Раз в квартал — открыл, что сработало, что нет, что меняется в target. 1:1 — идеальное место для checkpoint.

**Plan лёгкий по содержанию, но регулярно обновляется.** План на 20 страниц с детальным учебным планом → не обновляется, потому что «слишком тяжело». Лёгкий план (1–2 экрана: current / target / 3–5 milestones / список артефактов) обновляется без усилий и поэтому остаётся живым.

## Связанные листья

- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — 1:1 — основной ritual для quarterly review плана.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — onboarding curriculum заканчивается через 12 недель; Personal Growth Plan начинается дальше — переход от org-level к personal-level.
- **[Career Ladders](/The-Way-of-SRE/leaves/culture/career-ladders/)** — ladder — vocabulary target state; план обращается к ladder для формулировки expectations следующего уровня.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — написание ADR — отличный артефакт обучения; deliberate practice в области, где hands-on опыт пока неглубок.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — wheel of misfortune как часть собственного training — incident response не учится по книгам.
- **[Mentoring as Practice](/The-Way-of-SRE/leaves/practices/mentoring-as-practice/)** — становление mentor'ом — отдельный навык L5+ и один из multi-format learning channels: teaching как способ understand.

## Открытые вопросы

- **Public Engineering Output** — talks, OSS contributions, technical writing. Самостоятельная подтема.
- **Sabbatical / Career Breaks** — long-form recovery / learning breaks как намеренная часть multi-year horizon. Редко обсуждается, может быть полезной заметкой.
