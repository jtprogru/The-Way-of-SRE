---
title: Personal Growth Plan
description: Личный план развития инженера — current state, target state, milestones, артефакты. Живой документ, который квартально пересматривается и связан с реальной работой
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Professional Development / Personal Growth Plan
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

**Личный план развития** инженера — документированный артефакт, в котором зафиксированы: где сейчас (current state по компетенциям / SFIA), куда хочется (target state на горизонт 6-12 месяцев), какие конкретные milestones и какие **артефакты** будут доказательством движения. Не «годовая цель в HR-системе», а живой документ, который квартально пересматривается и привязан к реальной работе. Главная практика внутри L1 `Professional Development` (personal level, **в отличие от** org-level `Organisational Capability Development` в Culture и onboarding-level `SRE Onboarding`).

## Что должен уметь

- **L3** — Имеет рабочее представление о своей текущей зоне развития: может назвать 1-2 компетенции из roadmap'а, в которых сейчас «слаб», и 1-2, которые хочет прокачать ближайшие 3 месяца.
- **L3** — Ведёт learning log (markdown / Notion / Obsidian): фиксирует, что прочитал / посмотрел / попрактиковал, **со своими takeaways**, а не списком ссылок «на потом».
- **L4** — Пишет Personal Growth Plan как документ: current state (опционально с привязкой к SFIA-уровням или competency framework команды), target state, конкретные milestones с дедлайнами, метрики и артефакты как доказательство.
- **L4** — Применяет **deliberate practice**: формулирует учебные цели с измеримым outcome. Не «выучу Kubernetes», а «развёрну stateful-сервис в k8s с HA, задокументирую дизайн в ADR, проведу review с senior'ом».
- **L5** — Использует multi-format learning: pair sessions с senior'ом, code review соседних команд, написание ADR / TDD по новой технологии, публичный talk или внутренний brown bag, статья в команде / блоге. Не только pas­sive consumption (книги / курсы), но и active production.
- **L5** — Приносит план на 1:1 с manager'ом ежеквартально: что сработало, что нет, что меняется в target state. Use 1:1 ritual как built-in checkpoint для plan'а.
- **L5** — Деliberately выбирает stretch projects: подписывается на работу outside комфорта с **явной learning goal**, не «возьму первый освободившийся тикет».
- **L6+** — Проектирует портфолио на multi-year horizon: балансирует specialist depth vs generalist breadth, технические vs people skills, internal contribution vs external visibility (talks, OSS, writing).
- **L6+** — Конвертирует собственные learnings в community capital: менторит junior'ов, выступает на конференциях, пишет статьи, contributes в open source — pays it forward, и это сам по себе следующий learning loop.

## Материалы

### Книги

- Anders Ericsson, Robert Pool — **Peak: Secrets from the New Science of Expertise** (Houghton Mifflin Harcourt, 2016). База: фундаментальная книга про deliberate practice — что отличает экспертов от опытных, почему 10000 часов сам по себе ничего не значит, как строить feedback loop в обучении.
- Cal Newport — **So Good They Can't Ignore You** (Grand Central, 2012). База: тезис «не ищи passion, строй career capital»; career capital растёт через deliberate practice в редких и ценных skills.
- Cal Newport — **Deep Work** (Grand Central, 2016). Дополнительно: концепция deep work как валюты профессионального роста; без deep work focus deliberate practice невозможна.
- Will Larson — **[Staff Engineer](https://staffeng.com/)** (2021). Дополнительно: путь staff/principal engineer для individual contributor — стратегии, archetypes (tech lead / architect / solver / right-hand), интервью с реальными staff'ами; полезно для проектирования собственного multi-year horizon'а.
- Camille Fournier — **The Manager's Path** (O'Reilly, 2017). Дополнительно: если в горизонте плана появляется management track — этот референс по карьерным переходам IC ↔ manager.

### Статьи и фреймворки

- **[Progression.fyi](https://progression.fyi/)**. База: публичная коллекция career ladders 75+ компаний — полезно как self-assessment референс перед формулировкой target state; видно, какие skills и какие уровни ожидаются в разных компаниях / стэках.
- **[SFIA — Skills Framework for the Information Age](https://sfia-online.org/en)**. База: семиуровневый канонический framework, на котором построен roadmap; self-assessment по SFIA даёт первую черновую current state картину.

### Инструменты

- **Markdown в личном (или shared с manager'ом) repo / Notion / Obsidian** — самый простой формат: один документ, секции current state / target / milestones / log / artifacts; история — git / version history платформы.
- **Learning log** — простой markdown файл (`learning-log.md`) с datestamp'ами событий: «прочитал X, takeaway Y», «парный сеанс с N по теме T, понял Z». Через год — самый честный показатель, что было сделано.
- **Skill matrix (личная)** — таблица «компетенция × текущий уровень × целевой уровень × следующий шаг». Простой markdown или spreadsheet; обновляется ежеквартально на 1:1 с manager'ом.

## Best practices

- **План документирован, а не «в голове».** Антипаттерн: «я об этом думаю». Через 3 месяца план превращается в смутное ощущение, цели не достигаются, потому что не были сформулированы достаточно конкретно для проверки. Письменная формулировка — первый акт deliberate practice: вынуждает превратить ощущения в проверяемые утверждения.
- **Goals measurable: artifact + criterion, а не «выучу X».** Антипаттерн: цель «выучу Kubernetes». Через 6 месяцев — «я что-то знаю про k8s, но непонятно, что именно». Цель: «к концу Q3 — развёрнут stateful-сервис в k8s с HA, ADR с дизайном, review проведён с senior'ом, открытые вопросы зафиксированы». Артефакт + критерий выполнения — без них прогресс невозможно измерить.
- **Deliberate practice > passive consumption.** Антипаттерн: «прохожу курсы», «читаю статьи» как сама по себе активность. Курсы и книги — это input; learning происходит, когда input применяется на реальной задаче, с feedback'ом от практики или ревьюера. Один написанный ADR / прочитанный chapter с применением в коде стоит больше десяти просмотренных видео.
- **Stretch projects регулярно, не «когда дают».** Антипаттерн: ждать, что manager даст развивающую задачу. Manager не знает, в чём именно engineer хочет расти; engineer обязан явно сигнализировать. Регулярно (раз в квартал) — добровольно выбирать одну задачу outside комфорта с явной learning goal: подписаться на работу, которую не делал раньше, с готовностью выйти за рамки текущей роли.
- **Multi-format learning: reading + practice + teaching + community.** Антипаттерн: только один формат (только книги / только курсы / только work tasks). Лучший feedback loop — комбинация: прочитал → применил на задаче → обсудил с peer'ом → написал заметку для команды → выступил на brown bag. Каждый формат проверяет понимание под разным углом.
- **Quarterly review on 1:1 с manager'ом, не «забыл и забил».** Антипаттерн: написал план в январе, открыл его в декабре. Через год план не соответствует ни реальности (контекст команды поменялся), ни прогрессу (engineer вырос в неожиданном направлении). Раз в квартал — открыл, что сработало, что нет, что меняется в target. 1:1 — идеальное место для этого checkpoint'а.
- **Plan лёгкий по содержанию, но регулярно обновляется.** Антипаттерн: план на 20 страниц с детальным учебным планом на год вперёд → не обновляется, потому что «слишком тяжело». Лёгкий план (1-2 экрана: current / target / 3-5 milestones / список артефактов) обновляется без усилий и поэтому остаётся живым.

## Связанные листья

- **[One-on-Ones](/The-Way-of-SRE/leaves/practices/one-on-ones/)** — 1:1 — основной ritual для quarterly review плана; growth conversations на 1:1 — место, где план встречается с контекстом команды и обратной связью manager'а.
- **[SRE Onboarding](/The-Way-of-SRE/leaves/culture/sre-onboarding/)** — onboarding curriculum (главный leaf под L1 Organisational Capability Development) заканчивается через 12 недель; Personal Growth Plan начинается дальше — переход от «следую curriculum'у команды» (org-level) к «веду собственный план» (personal-level). Программа без личных планов формальна; личные планы без org-level support'а упираются в стену.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — написание ADR — отличный артефакт обучения; deliberate practice в области, где hand-on опыт пока неглубок.
- **[Postmortem Culture](/The-Way-of-SRE/leaves/culture/postmortem-culture/)** — wheel of misfortune как часть собственного training'а — incident response не учится по книгам.

## Открытые вопросы

- **Career Ladders** *(TBD)* — документированные уровни и переходы (компетенции на каждом уровне, требования к продвижению). Кросс-цеxовая тема, упоминалась в open questions у `SRE Onboarding`, `OCD`, `One-on-Ones`; настолько частый запрос — что вероятно отдельный лист на стыке Performance Management и Professional Development.
- **Mentoring as Practice** *(TBD)* — когда engineer становится mentor'ом для junior'а, это отдельный набор навыков (давать feedback, балансировать direction vs autonomy, structured curriculum, обратная связь от mentee). Соседний лист под `Professional Development` L1.
- **Public Engineering Output** — talks, OSS contributions, technical writing как часть портфолио. Сейчас упомянуто в L6+; самостоятельная подтема, возможно отдельный лист.
- **Sabbatical / Career Breaks как часть плана** — long-form recovery / learning breaks как намеренная часть multi-year horizon'а. Редко обсуждается, может быть полезной отдельной заметкой.
