---
title: Systematic Troubleshooting
description: Дисциплина разбора неизвестной поломки — гипотеза-измерение-вывод, USE / RED / Golden Signals, half-splitting, time-boxing; против «крутим конфиги наугад»
sfia: [3, 4, 5, 6]
status: draft
---

«Сервис лежит, что-то делаем» — режим, в котором команда два часа подряд меняет конфиги, рестартует поды и откатывает фичефлаги, пока в какой-то момент оно не «починилось само». Через неделю повторяется то же самое. Никто ведь не знает, что именно сработало в прошлый раз. Systematic Troubleshooting — это **дисциплина разбора неизвестной поломки**: формулируем гипотезу, выбираем измерение, которое её подтвердит или опровергнет, фиксируем результат, идём дальше. Без такой дисциплины опыт не накапливается даже у сильных инженеров — «починил наугад» не оставляет следа в голове. Этот лист про методологию (USE, RED, Four Golden Signals, hypothesis-driven debugging, half-splitting, time-boxing), а не про конкретный тулинг.

Граница: [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/) — *координация* разбора (роли, sitrep, war room); этот лист — *как именно копать* внутри своей роли Ops Lead. [Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/) — траблшутинг «медленно» через profile / flame graph; здесь — общая методология для любого symptom'а (медленно, падает, не подключается, теряет данные). [Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/) — разбор после; здесь — *during-action*. [Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/) — что делать на **известный** алерт; этот лист — что делать, когда runbook не помог или сценария нет.

## Что должен уметь

Главный навык на уровне L4 — **держать одну гипотезу за раз и time-box её проверку**. По моим наблюдениям, типовая ошибка инцидента — менять три вещи одновременно «чтобы быстрее», и потом не знать, что из них помогло (или сломало). Senior отличается тем, что вслух формулирует: «гипотеза — DNS-резолвер падает в kube-dns; проверяю запросом из соседнего пода; 10 минут; если не подтвердится — переключаюсь на ingress». Это не философия — это конкретный verbal protocol, видимый прямо в транскрипте инцидент-канала.

**L3**
- Различает **symptom** и **cause**: «502 от клиентов» — symptom; «upstream pool exhausted» — следствие; «retry-storm от соседнего сервиса» — cause. Не путает «что я вижу» с «почему это происходит».
- Применяет **half-splitting**: в цепочке `client → LB → ingress → app → DB` проверяет середину (app → DB) первой, чтобы за один шаг исключить половину цепочки. Не идёт линейно от клиента.
- Документирует каждую проверку в incident log с timestamp — что проверил, что увидел; чтобы IC и сменщик видели, куда копал.

**L4**
- Применяет **Four Golden Signals** (Latency / Traffic / Errors / Saturation, Google SRE book) и **RED** (Rate / Errors / Duration) на уровне приложения, **USE** (Utilization / Saturation / Errors) на уровне ресурса — как первый проход, до чтения кода. По моим наблюдениям, 80% «непонятно что» снимается этим проходом за 5 минут.
- Формулирует гипотезу до измерения, не наоборот: «думаю, что X, потому что Y; проверяю через Z». Если измерение не отвергает и не подтверждает гипотезу — это **бесполезное измерение**, надо менять.
- Time-box каждую гипотезу (15–30 мин). Если не подтвердилась — следующая, не «ещё чуть-чуть покопаю».
- **Не меняет два параметра одновременно.** При rollback одной фичи и рестарте пода — сначала одно, потом другое; иначе непонятно, что помогло.

**L5**
- Различает **simple / complicated / complex / chaotic** проблемы ([Cynefin](https://en.wikipedia.org/wiki/Cynefin_framework), Dave Snowden). Для simple — runbook; для complicated — экспертиза; для complex — probe-sense-respond (несколько safe-to-fail экспериментов параллельно); для chaotic — act-sense-respond (любое действие, чтобы выйти из хаоса). Путать категории — частая ошибка senior'ов: бежать «дебажить» там, где сработает runbook, и наоборот — отрабатывать runbook на нештатной системе.
- Сохраняет **forensic state** до mitigation: heap dump, goroutine dump, `kubectl describe`, экспорт свежих метрик, `dmesg`. Mitigation (restart, scale-out, failover) часто уничтожает evidence; senior помнит снять снимок до. Без forensic state постмортем превращается в «не воспроизвели».
- Распознаёт **base rates**: «когда слышишь топот, думай про лошадей, а не зебр». Свежий деплой 30 минут назад → начинать с него, не с теории про cosmic ray. Я регулярно вижу разборы, где гипотеза «сложное и новое» побеждает гипотезу «свежий коммит» только потому, что вторая «скучная».
- Различает **trigger** и **root cause**: «деплой X сломал» — trigger; «отсутствие staged rollout позволило сломать prod без предупреждения» — root cause. Постмортем по trigger'у даёт «не делайте такие коммиты»; по root cause — «выкатывайте staged» (системная мера).

**L6+**
- Строит культуру разбора в команде: incident log как обязательный артефакт, structured handoff между сменами, post-incident review с вопросом «как мы разбирали, не только что чинили». Учит методу, а не починке конкретного бага.
- Связывает с [Postmortem Database](/The-Way-of-SRE/leaves/culture/postmortem-database/): распознавание паттернов между инцидентами (третий раз tail latency после деплоя → нужен canary), а не «каждый инцидент уникальный».
- Поднимает [Game Day](/The-Way-of-SRE/leaves/culture/game-day/) / wheel of misfortune как тренировку разбора: учебный инцидент отрабатывает методологию без риска для production.

## Материалы

### Книги

- David J. Agans — **[Debugging: The 9 Indispensable Rules for Finding Even the Most Elusive Software and Hardware Problems](https://debuggingrules.com/)** (AMACOM, 2002). Каноническая короткая (180 стр.) книга про методологию: «understand the system», «make it fail», «quit thinking and look», «divide and conquer», «change one thing at a time», «keep an audit trail», «check the plug», «get a fresh view», «if you didn't fix it, it ain't fixed». Если выбирать одну — эту. Я регулярно ловлю себя на нарушении одного из правил во время инцидента.
- Betsy Beyer et al. — **[Site Reliability Engineering, Chapter 12 «Effective Troubleshooting»](https://sre.google/sre-book/effective-troubleshooting/)** (O'Reilly, 2016). Гугловский разбор: разделение symptom / cause / trigger, hypothesis-driven подход, чек-листы. Доступна онлайн бесплатно.
- Brendan Gregg — **[Systems Performance: Enterprise and the Cloud](https://www.brendangregg.com/systems-performance-2nd-edition-book.html)** (Addison-Wesley, 2-е изд., 2020). USE method описан здесь подробно, плюс конкретные методологии для CPU / memory / disk / network. Пересекается с [Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/), но методологическая часть применима шире.
- Sidney Dekker — **[The Field Guide to Understanding «Human Error»](https://www.routledge.com/The-Field-Guide-to-Understanding-Human-Error/Dekker/p/book/9781472439055)** (CRC Press, 3-е изд., 2014). Не про debugging, но фундамент: почему «человек ошибся» — это **симптом**, а не root cause; и почему systematic troubleshooting не должен останавливаться на «забыл `--dry-run`».
- Brian Kernighan, Rob Pike — **[The Practice of Programming](https://www.cs.princeton.edu/~bwk/tpop.webpage/)** (Addison-Wesley, 1999). Глава 5 «Debugging» — короткий, но классический разбор: stack-trace reading, binary search в коде, «changes have probably broken things» как гипотеза по умолчанию.

### Статьи и доклады

- John Allspaw — **[Trade-Offs Under Pressure: Heuristics and Observations of Teams Resolving Internet Service Outages](https://lup.lub.lu.se/student-papers/search/publication/8084520)** (магистерская работа, Lund University, 2015). Полевое исследование того, как именно senior'ы разбирают инциденты в проде. Длинно, но если у вас цель «вырастить L5» — обязательно.
- Brendan Gregg — **[The USE Method](https://www.brendangregg.com/usemethod.html)**. Один экран, один метод, применим к любой системе. Каноника.
- Tom Wilkie — **[The RED Method: Key Metrics for Microservices Architecture](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/)** (Weaveworks, 2018). Аналог USE на уровне приложения: Rate / Errors / Duration. По моим наблюдениям, RED — самый частый «первый dashboard» для нового сервиса.
- Richard I. Cook — **[How Complex Systems Fail](https://how.complexsystems.fail/)** (1998, 18 пунктов). Не про debugging напрямую, но фундаментальный контекст: «root cause» как лингвистический артефакт, а не онтологическая категория. Меняет то, как senior формулирует выводы.
- Charity Majors — **[Observability — A 3-Year Retrospective](https://thenewstack.io/observability-a-3-year-retrospective/)** (2020). Почему «monitoring known unknowns» (дашборды) ≠ «debugging unknown unknowns» (observability с high-cardinality). Это и есть граница «есть runbook» / «нужен systematic troubleshooting».
- Dave Snowden — **[A Leader's Framework for Decision Making](https://hbr.org/2007/11/a-leaders-framework-for-decision-making)** (HBR, 2007). Cynefin для не-академической аудитории. 8 страниц.

### Инструменты

Этот лист — про методологию, тулинг живёт в соседних листьях ([Networking](/The-Way-of-SRE/leaves/engineering/networking/), [Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/), [Shell & CLI Craft](/The-Way-of-SRE/leaves/engineering/shell-cli-craft/), [Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/)). Но три инструмента — про сам процесс разбора:

- **Incident log в общем документе / Slack canvas / выделенном канале** — текстовая хроника с timestamp на каждой проверке. Это одновременно фиксация состояния для разбора, материал для handoff сменщику и сырьё для постмортема. Без incident log постмортем превращается в «вроде что-то делали».
- **Hypothesis board (whiteboard / Miro / простая `.md` с чек-листами)** — список гипотез на проверку с пометками confirmed / refuted / unknown. По моим наблюдениям, физически выписанный список спасает от типовой ошибки «прыгаем между тремя гипотезами и ни одну не закрываем».
- **Чек-листы методологий** — USE / RED / Golden Signals под рукой (распечатка, страница в вики, Slack bookmark). Идея — не вспоминать в стрессе, что мерить, а пробежать готовый список.
- **Анти-инструмент:** «крутим конфиги наугад без гипотезы». Не инструмент, а антипаттерн. Самый частый источник «починили, но не знаем чем».

## Best practices

Главный публичный кейс — **исследование Allspaw'а на материале Etsy (2010-е)**. Сначала как CTO Etsy, потом в Adaptive Capacity Labs, John Allspaw задокументировал: senior'ы во время инцидентов не «знают ответ» — они быстрее остальных формулируют рабочую гипотезу, быстрее её опровергают и переходят к следующей. Это не интуиция и не «больше опыта»; это конкретный вербальный протокол, который тренируется. Wheel of misfortune в Google (см. SRE book) — институционализированная форма этой тренировки: джуниор получает учебный инцидент, senior играет роль «системы» и отвечает на вопросы. Это **тренирует методологию**, а не знание конкретного бага.

Из этого вырастают четыре правила, которые я считаю базовыми. Гипотеза идёт до измерения: если не получается сформулировать, что именно подтвердит или опровергнет очередная команда, — не набирайте её. «Посмотрю логи» — не гипотеза. Меняется одно за раз, потому что параллельный rollback вместе с рестартом и переключением фичефлага честно приводит к «починилось, не знаем чем».

Третье правило дороже всего стоит, когда его нарушают. Evidence снимается до mitigation: heap dump, свежие метрики, `kubectl describe`, `dmesg` — снимок состояния до того, как рестарт всё сотрёт. Тридцать секунд сейчас экономят неделю разговоров «не воспроизвели». И последнее — таймер. По 15–30 минут на гипотезу, дальше следующая; без таймера полчаса незаметно превращаются в два часа в кроличьей норе.

**Symptom / Cause / Trigger — три разных вопроса.** Symptom — что видит клиент или дашборд («502 от ingress», «latency p99 = 8s», «kafka consumer lag растёт»). Cause — почему так происходит на уровне системы («ingress upstream timeout, потому что app pool exhausted, потому что DB locks»). Trigger — что **в этот раз** запустило цепочку («deploy 30 минут назад добавил N+1 query»). Я регулярно вижу разборы, где IC останавливается на trigger («deploy X сломал»), а команда теряет cause («у нас нет canary, поэтому любой плохой deploy сразу падает в prod»). Постмортем по trigger'у даёт правила «не делайте такие коммиты»; постмортем по cause даёт системные изменения. См. [Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/).

**Half-splitting (binary search) важнее линейного обхода.** При цепочке `client → CDN → LB → ingress → app → cache → DB` инстинкт — идти от клиента: проверить DNS, потом TLS, потом LB. За шаг исключается один компонент. Half-split — проверить `app → DB` напрямую: за один шаг ровно половина цепочки либо здорова, либо нет. Топология неважна. Стек неважен. Размер системы тоже, и именно поэтому приём переносится с монолита на десяток микросервисов без единой поправки, а разница в скорости разбора между линейным обходом и половинным делением, по моим наблюдениям, кратная.

**USE / RED / Four Golden Signals — три комплементарных метода первого прохода.** Не «какой лучше»: разные уровни. **USE** (Brendan Gregg) — для ресурсов (CPU / memory / disk / network): для каждого — utilization, saturation, errors. **RED** (Tom Wilkie) — для сервисов и endpoint'ов: rate, errors, duration. **Four Golden Signals** (Google SRE book) — синтез: latency, traffic, errors, saturation. Я регулярно вижу, что команда берёт один метод и считает «достаточно». Они комплементарны: USE говорит «диск saturated», RED — «эти endpoint'ы за этот период деградировали», Golden Signals — «соедини оба и сравни с SLO».

**Не доверяй интуиции «всё работало, проверять не надо».** Allspaw в исследовании зафиксировал паттерн: senior'ы явно перепроверяют **то, что считают исправным**. «Я уверен, что LB ОК — значит, проверю первым». Это контринтуитивно (тратишь время на «уверенно здоровое»), но снимает слепое пятно. По моим наблюдениям, «непонятно почему» часто прячется именно в компоненте, который никто не проверяет, потому что «он же работает».

**Починил — проверь, что действительно починил.** Главное правило Agans: «if you didn't fix it, it ain't fixed». После митигации идёт verify. Воспроизвести исходный symptom, если это безопасно, увидеть, что SLI вернулся к baseline, убедиться, что не появилось вторичных ошибок. Я регулярно вижу инциденты, которые закрыли, а через двадцать минут открыли снова: mitigation замаскировал symptom, но не cause.

**Проговори модель вслух.** Вслух или письменно в incident log описать, как, по-твоему, устроен путь запроса: «идёт через X, потом Y, потом Z». Часто на середине фразы выясняется, что модель разошлась с реальностью — Z выпилили полгода назад, и никто этого не помнит. Инструмент бесплатный. Опытные им пользуются, начинающие стесняются.

**Cynefin: не любая поломка — debugging.** Если уже есть runbook — это **simple** (отработать runbook, не тратить время на «понять»). Если эксперт знает — **complicated** (привлечь эксперта, не изобретать). Если никто не понимает и система ведёт себя нелинейно — **complex** (несколько safe-to-fail probe'ов параллельно: канарейка с верхним фичефлагом, минимальный rollback, scale-out). Если всё горит и нет времени думать — **chaotic** (любое действие, чтобы выйти в complex). Senior'ы регулярно ошибаются в обе стороны: начинают «исследовать» там, где есть runbook, или применяют runbook там, где система за пределами runbook'а.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — координация во время инцидента (роли IC / Ops / Comms); этот лист — методология разбора, которую применяет Ops Lead.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — после разбора; разделение symptom / cause / trigger здесь и в постмортеме одно и то же.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — прескриптивный сценарий на известный алерт; systematic troubleshooting — когда runbook не помог или сценария нет.
- **[Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/)** — траблшутинг «медленно» через flame graph / pprof; здесь — общая методология для любого symptom'а.
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — сетевая диагностика как сабдомен; tcpdump / mtr / dig — инструменты, методология применения та же.
- **[Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)** — OS-level forensic state (`dmesg`, `/proc`, eBPF) — то, что senior сохраняет до mitigation.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** / **[Symptom vs Cause Alerting](/The-Way-of-SRE/leaves/engineering/symptom-vs-cause-alerting/)** — alert говорит symptom; задача troubleshooting — пройти от symptom к cause.
- **[Game Day](/The-Way-of-SRE/leaves/culture/game-day/)** — тренировка методологии на учебном инциденте, без риска для production.
- **[Postmortem Database](/The-Way-of-SRE/leaves/culture/postmortem-database/)** — распознавание паттернов между инцидентами; troubleshooting на L6+ опирается на исторические паттерны, не только на «здесь и сейчас».

## Открытые вопросы

Три темы просятся в отдельные листы. Разбор в распределённых системах *(TBD)* — трассировка как инструмент, partial failure, детект split brain, восстановление причинно-следственной цепочки между сервисами. Сбор forensic state *(TBD)* — что именно снять до mitigation: heap, goroutine и thread dumps, снимки eBPF, логи до ротации; сейчас это один пункт в L5, а материала там на целый лист. Когнитивные искажения при разборе *(TBD)* — anchoring, recency bias, confirmation bias и то, как ловить их в коллеге и в себе.

Чего я не знаю — как правильно тренировать джуниоров этой методологии, не пуская их в реальные инциденты. Wheel of misfortune — один путь. Если есть другие, расскажите через PR.
