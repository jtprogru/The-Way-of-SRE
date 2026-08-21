---
title: Composite SLO Methodology
description: Как складывать SLO зависимостей и почему потолок системы обычно ниже, чем хочется обещать
sfia: [4, 5, 6]
status: draft
---

«Наш SLO — 99.95%» — типичная декларация после quarterly planning. Если посмотреть на сервис-граф: 4 зависимости с vendor SLA 99.9% ([auth](/The-Way-of-SRE/glossary/#auth), payment, CDN, managed DB), 2 внутренних сервиса с 99.99%, shared DNS / TLS layer. Простая арифметика для последовательного пути: `0.999⁴ × 0.9999² × 0.9999 ≈ 0.9957` — наш достижимый SLO ceiling **99.57%**, не 99.95%. Composite SLO Methodology — это **математика multi-component систем**: когда «хочется четыре девятки» сталкивается с реальностью composite, и нужно либо снизить commitment, либо добавить redundancy, либо явно принять honest baseline. Я регулярно вижу команды, которые декларируют SLO без composite math — и потом первый dependency outage сжигает квартальный error budget целиком.

Граница: [SLO Engineering](/The-Way-of-SRE/engineering/slo-engineering/) — *как формулировать* SLO для одного компонента (SLI, target, window); этот лист — *как складывать* SLO для multi-component system. [Vendor Management](/The-Way-of-SRE/practices/vendor-management/) — vendor SLA как input в composite math; reliability-side зависимостей от внешних сервисов. [Resilience Patterns](/The-Way-of-SRE/engineering/resilience-patterns/) — что делать, чтобы composite SLO **превысить** математический ceiling через redundancy / graceful degradation.

## Что должен уметь

Главный навык на уровне L5 — отличать **serial** от **parallel** dependencies и применять правильную формулу. Я регулярно вижу команды, которые перемножают SLA всех зависимостей подряд — но если CDN имеет fallback на origin, это **parallel** (отказ только при двойном отказе), и формула совсем другая: `1 − (1 − SLA_cdn)(1 − SLA_origin)`. Различить serial vs parallel — это не «формальность», это разница между 99.5% и 99.99% при том же наборе компонентов. Если граф нарисован, формула механическая; если граф «в голове» — composite math всегда оптимистичнее реальности.

**L4**
- Понимает базовую арифметику: для serial dependencies own SLO ≤ product(deps SLAs); знает, что vendor SLA — нижняя граница (worst case), а не expectation.
- Идентифицирует **critical path** через service graph своего сервиса: какие dependencies в request-path каждого user-facing endpoint.
- Считает composite math для своего user journey: serial path × required-uptime parallel components × shared infrastructure.
- Знает, где стоит точка измерения его SLI и что остаётся за её пределами: провайдерские стыки, глобальная маршрутизация, защита от DDoS перед периметром. Всё, что до этой точки, в composite math команды не входит.

**L5**
- Различает serial vs parallel dependencies и применяет правильные формулы. Parallel: `1 − ∏(1 − SLA_i)`, serial: `∏ SLA_i`.
- Включает **vendor SLAs как нижнюю границу** в composite math, не как ожидаемый uptime. SLA — contractual floor (vendor готов вернуть credit); real uptime может быть выше, но planning под SLA, не под наблюдаемое.
- Разделяет **mandatory vs best-effort dependencies**: observability backplane / logging pipeline / async analytics — не часть user-facing composite (их падение не означает «пользователь страдает»); auth / payment / DB — часть.
- Применяет multi-burn-rate alerting **per critical path / per journey**, не только per service. SLI собирается на уровне journey (synthetic / RUM / business event), не только на endpoint.
- Проверяет заявленную классификацию зависимостей данными: корреляция [burn rate](/The-Way-of-SRE/glossary/#burn-rate) зависимости с собственным, game day на подозрительных рёбрах графа. Слова разработчиков про «слабую связь» — гипотеза, а не факт.
- Умеет калибровать target эмпирически, когда у зависимостей нет ни SLA, ни SLO: сверху вниз от жалоб пользователей и шума алертов, а не снизу вверх от арифметики.
- Вовремя останавливает уточнение расчёта: спрашивает, какое решение изменится от следующего знака после запятой, и, если ни одно, оставляет грубую оценку.

**L6+**
- Org-level composite portfolio: какие user journeys получают SLO commitment, какие остаются best-effort. Не каждый journey стоит SLO — обоснование выбора явное.
- Composite math как **input для capacity и cost decisions**: где redundancy оправдана (revenue-critical journey), где нет (low-traffic admin tool). Связь с [Cost Management](/The-Way-of-SRE/engineering/cost-management/) явная.
- Refresh composite math после каждой major dependency change (new vendor, removed redundancy, schema change затрагивающий fan-out). Без refresh composite SLO становится stale за квартал.
- Держит две модели одновременно: composite math отвечает на вопрос «что можно обещать», продуктовая разметка error budget — на вопрос «чей бюджет горит при каскаде». Смешение этих вопросов даёт большинство споров на ревью SLO.
- Держит модель дешёвой в сопровождении и понятной продуктовым командам. Расчёт, который умеет защитить только его автор, на масштабе организации не живёт: его перестают обновлять, а споры о его корректности съедают больше времени, чем сама работа над доступностью.

## Материалы

### Книги

- Alex Hidalgo — **[Implementing Service Level Objectives](https://www.alex-hidalgo.com/the-slo-book)** (O'Reilly, 2020). Единственная книга, где вероятностной стороне SLO отведена отдельная глава, а не абзац. Если выбирать одну ссылку — эту.
- Betsy Beyer et al. (eds) — **[The Site Reliability Workbook](https://sre.google/workbook/implementing-slos/)** (O'Reilly, 2018), глава 2 «Implementing SLOs». Раздел про dependencies upstream / downstream — Google's подход. Не как глубоко как Hidalgo, но canonical.
- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/embracing-risk/)** (O'Reilly, 2016), глава 3 «Embracing Risk». Не composite напрямую, но фундамент для понимания, что «target uptime — это decision с trade-offs», не aspirational число.

### Статьи и доклады

- Alex Ewerlöf — **[Composite SLO](https://blog.alexewerlof.com/p/composite-slo)**. Разбор с конкретными формулами и схемами: как складывать SLO компонентов и почему наивное перемножение врёт. Полезно как practical complement к книге Идальго.
- Google Cloud — **[SRE fundamentals: SLIs, SLAs and SLOs](https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-slis-slas-and-slos)**. Не глубоко по composite, но canonical reference для vocabulary.
- Marc Brooker — **[личный блог](https://brooker.co.za/blog/)** (AWS Principal Engineer). Отдельной статьи именно про сложение SLA у него нет, но разборы вероятностного поведения распределённых систем — лучший фон для понимания, почему composite math нельзя считать в лоб.

### Инструменты

- **[OpenSLO](https://openslo.com/)** — vendor-agnostic YAML spec для SLO; поддерживает composite через `objectives[]` с многими SLI. Используется в Sloth / Pyrra / Nobl9.
- **[Sloth](https://sloth.dev/)** — SLO-as-code для Prometheus; multi-window multi-burn-rate alert rules генерируются автоматически. Composite SLO собирается через несколько SLO definitions + custom recording rules.
- **[Pyrra](https://github.com/pyrra-dev/pyrra)** — alternative к Sloth, более opinionated. По моим наблюдениям, чаще выбирают Sloth для existing setups, Pyrra — для greenfield.
- **[Nobl9](https://www.nobl9.com/)** — коммерческая SLO platform, лучшая native поддержка composite SLO в индустрии. Если SLO program critical и есть бюджет — рассматривать.
- **[Пример Error Budget Policy из SRE Workbook](https://sre.google/workbook/error-budget-policy/)** — готовый шаблон политики от Google; отдельного репозитория с таким шаблоном у них нет, несмотря на распространённое заблуждение.
- **Анти-инструмент:** «composite SLO в Excel-sheet, обновляемый раз в квартал вручную». Это не tool, это invitation к stale math. Composite живёт в коде (OpenSLO YAML / Sloth definitions) — обновляется PR'ом при изменении dependency graph.

## Best practices

Главный публичный кейс — не отдельный инцидент, а **широко документированная статистика AWS SLA**. AWS публикует SLA на каждый сервис (S3 — 99.9% для standard storage, EC2 — 99.99% для regional fleet, RDS — 99.95% для Multi-AZ). Если построить типовое веб-приложение в AWS — Application Load Balancer (99.99%) → EC2 fleet (99.99%) → RDS Multi-AZ (99.95%) → S3 (99.9%) для статики, всё в одном регионе — composite serial SLA: `0.9999 × 0.9999 × 0.9995 × 0.999 ≈ 0.9983`. Это **99.83%** — ceiling, который AWS contractually готов компенсировать через credits. Многие команды декларируют 99.95% или выше, не глядя на эту арифметику. Я регулярно вижу архитектурные обсуждения «как нам достичь 99.99% uptime», в которых composite math никогда не появляется — и достижение 99.99% становится либо реалистическим (если добавлены multi-region failover, multi-AZ, redundancy), либо wishful (если просто декларация поверх той же топологии). Один лист бумаги с composite math перед SLO-commitment — час работы и год честности.

Прежде чем считать, нужен граф. Без явного critical path composite math превращается в произвольную сумму чужих SLA: рисуем граф, отмечаем, без чего пользователь реально страдает, и только потом берёмся за формулы.

Vendor SLA идёт в расчёт как пол, а не как потолок. Это число, за нарушение которого вендор готов вернуть деньги, а не его ожидаемый uptime и уж точно не ваш прогноз. Реальность обычно лучше SLA. Планировать всё равно приходится по нему.

Зависимости делятся на обязательные и best-effort, и это деление стоит проговорить явно. Observability backplane, logging pipeline, асинхронная аналитика — их падение не означает, что пользователю плохо. Auth, payment, DB, CDN — означает. В composite входят только вторые, иначе потолок SLO опускается без всякой причины со стороны пользователя.

Порядок работ — сначала очевидные дыры, потом третий знак. Если сервис недоступен час в день, точность арифметики не изменит ни одного решения. Уточнять расчёт окупается только тогда, когда фактическая доступность подошла к потолку и вопрос «где взять ещё девятку» стал настоящим.

И последнее: точка измерения совпадает с границей зоны ответственности. Пользователь видит одно число, в которое входят его собственный провайдер, глобальная маршрутизация и защита периметра от DDoS, — команда на это не влияет никак. Поэтому измерение начинается там, где начинается ответственность, и эта граница записана в SLO-документе явно.

Подробнее:

**Serial vs parallel — главное место ошибок.** Распространённая ошибка: считать все dependencies в одну формулу `∏ SLA_i`. Реально: если CDN имеет fallback на origin, это **parallel** — отказ только при двойном отказе, формула `1 − (1 − SLA_cdn)(1 − SLA_origin) ≈ 1 − 0.001 × 0.0001 = 99.99999%`. Если auth имеет primary + secondary identity provider — то же. Если DB Multi-AZ — это уже parallel внутри одного «AZ-level» SLA, и vendor SLA включает Multi-AZ в свой 99.95%. По моим наблюдениям, серьёзная composite math для типовой команды занимает 1–2 дня (рисование графа + classification + формулы); результат — картина, которая меняет SLO-committee discussions.

**Composite SLO — это не «потолок 99.X%», это семейство SLO per user journey.** Сервис обычно обслуживает несколько user journeys (login, purchase, browse, support). У каждого journey свой critical path и свой composite math. Login может иметь 99.95% (мало dependencies), purchase — 99.5% (payment processor добавляет 99.9% × ...), browse — 99.9%. Команда не commit'ит **один** SLO на сервис — она commit'ит per journey. Я регулярно вижу команды, у которых один service-level SLO, и в день любого incident команда не может понять «какая часть продукта затронута».

**Математика отвечает на вопрос про target, error budget — на вопрос про ответственность.** Самое сильное возражение, которое я слышал на этот лист: в продуктовой модели крупной компании каждый продукт держит свой SLO и отвечает за свой код, а каскадный отказ соседа сжигает бюджеты обоих сразу — и это честно отражает фактическую недоступность, включая инфраструктурную команду с её собственным SLO на базу. Зачем тогда вообще считать зависимости? Возражение справедливое, но отвечает оно на другой вопрос. Двойной burn — механизм учёта постфактум: инцидент уже случился, надо честно поделить его между владельцами. Арифметика зависимостей нужна до commitment: она говорит, какое число вообще имеет смысл обещать при текущей топологии. Одно без другого даёт либо аккуратный учёт при фантазийном target, либо честную арифметику без последствий для тех, кто её нарушил.

**Наследование от инфраструктуры считают почти все, наследование от соседей — почти никто.** «Нельзя запустить сервис с четырьмя девятками на железе с одной девяткой» звучит настолько очевидно, что вертикальная матрёшка (железо → платформа → сервис) действительно учитывается в большинстве команд, где я это видел. Горизонтальная — нет: сервисы того же уровня, от которых мой ответ зависит ровно так же, в арифметику не попадают, потому что они «наши, свои, рядом сидят». Очевидность правила не гарантирует его применения, и разрыв проходит именно по этой линии.

**Когда у зависимостей нет SLO, target калибруется от боли.** Арифметика снизу вверх предполагает, что у каждой зависимости есть SLA или SLO. Реальность внедрения обычно другая: сервис-агрегатор собирает ответ из десятка мелких, ни у одного из них SLO нет и в ближайшие два квартала не появится, а закреплять качество обслуживания по всей цепочке — работа на год. Тогда работает встречный метод: взять target «похоже на правду» и калибровать эмпирически по двум сигналам — multi-burn-rate алерты перестали шуметь, поток жалоб резко упал. Точка, где сигналы сходятся, и есть приблизительный максимум возможного при текущей топологии. Метод грубый и разваливается, если сервисы активно меняются, но это скорее хорошая новость: если target не ловится месяцами, значит в цепочке есть нестабильное звено, и искать его полезнее, чем спорить о третьей девятке.

**Граф со слов разработчиков врёт, и вскрывают это инциденты.** Опрос «насколько жёстко вы зависите от этого сервиса» даёт классификацию, а не факт. Зависимость, названная слабой при обследовании, регулярно оказывается жёсткой по реальным данным: таймаут не выставлен, retry без бюджета, fallback написан и ни разу не проверен. Проявляется это на первом же серьёзном сбое той зависимости — то есть уже после того, как SLO объявлен и математика согласована. Отсюда практика: классификацию проверять корреляцией burn зависимости с собственным за квартал, подозрительные рёбра трогать fault injection на game day, а граф пересматривать после каждого инцидента, который показал связность, которой в документе не было.

**Точность стоит дорого, и в этом её главная граница.** Второе сильное возражение на этот лист — про цену: сложная модель съедает ресурсы не столько на сам расчёт, сколько на бесконечные споры о его корректности с разработкой и со всеми, кому потом жить с action items по недоступности. Мне рассказывали доведённый до абсурда случай: сервис лежит по часу в день, а команда ежедневно на созвоне спорит, как точнее измерить этот час. Считать надо было не даунтайм, а стоимость самой дискуссии. Я согласен с выводом: грубая модель, понятная тем, кто не хочет глубоко влезать в тему, лучше точной, которую никто не принимает, а высвободившиеся руки полезнее направить на очевидные места, где доступность реально проседает. Практически это значит: девятки без дробей, округление вниз, одна страница вместо документа, пересчёт по событию (сменился vendor, убрали регион), а не по календарю. Вкладываться в точность стоит в трёх случаях: target выбирается вплотную к потолку; число уходит наружу в контракт с деньгами; надо решить, куда вложить бюджет на redundancy, и варианты сравнимы. Во всех остальных — порядок величины закрывает вопрос. И признак, что модель пора упрощать, простой: спор о цифре идёт дольше, чем занял бы фикс той зависимости, вокруг которой спорят.

**Vendor SLA включается с conservatism, не optimism.** Vendor может иметь observed uptime 99.99%, но SLA — 99.9%. Использовать SLA как input в composite, не observed. **Why:** vendor может изменить infrastructure, нагружать других клиентов, иметь региональный incident — observed uptime прошлого квартала не предсказывает следующий. SLA — это нижняя граница, которую vendor готов защищать contractually. Conservatism на vendor side освобождает internal budget на собственные инциденты.

**Refresh composite math после каждой major dependency change.** Service graph меняется: новый vendor (Stripe → Adyen migration), removed redundancy (closed second region for cost), added intermediate cache (Redis layer перед DB). После каждой такой перемены composite math пересчитывается, а SLO commitment пересматривается. Я регулярно вижу команды, у которых composite SLO документ датирован 18 месяцев назад, а сервис-граф за это время изменился 3 раза — math не отражает реальности.

**Multi-burn-rate per journey, не per component.** Classical multi-burn-rate alerting часто строится per individual SLI (latency, error rate каждого endpoint). Composite world требует journey-level SLI: synthetic user journey, RUM event chain, business transaction (order placed). Алерт срабатывает при burn на уровне journey — то есть «пользователи реально не могут купить», а не «один из 12 backend endpoints деградировал». По моим наблюдениям, разница между mature SLO program и developing — наличие journey-level SLI как primary, component-level — как diagnostic.

## Связанные листья

- **[SLO Engineering](/The-Way-of-SRE/engineering/slo-engineering/)** — *как формулировать* SLO для одного компонента; этот лист — *как складывать* SLO для multi-component system. Читать вместе.
- **[Vendor Management](/The-Way-of-SRE/practices/vendor-management/)** — vendor SLAs — input в composite math. Vendor management ведёт inventory, composite methodology — использует.
- **[Resilience Patterns](/The-Way-of-SRE/engineering/resilience-patterns/)** — что делать, чтобы composite SLO **превысить** математический ceiling: redundancy, graceful degradation, fallbacks. Resilience patterns превращают serial dependencies в parallel.
- **[Capacity Planning](/The-Way-of-SRE/engineering/capacity-planning/)** — composite SLO определяет, какие компоненты требуют redundancy (parallel paths), а это — capacity decisions с lead time.
- **[Cost Management](/The-Way-of-SRE/engineering/cost-management/)** — redundancy для composite SLO improvement имеет cost; trade-off «ещё одна девятка» против затрат считается доллар в доллар.
- **[SLI-based Alerting](/The-Way-of-SRE/engineering/sli-based-alerting/)** / **[Symptom vs Cause Alerting](/The-Way-of-SRE/engineering/symptom-vs-cause-alerting/)** — journey-level SLI требует multi-burn-rate alerting на composite path, не только per component.
- **[SLO / Budget Review](/The-Way-of-SRE/culture/slo-budget-review/)** — ритуал, на котором composite math пересматривается: что изменилось в graph, осталась ли арифметика честной, нужно ли скорректировать commitment.

## Открытые вопросы

- **Composite SLO для async / batch systems** *(TBD)* — formulae для freshness / lag-based SLI в composite. Классическая теория покрывает online; batch (Airflow / Dagster pipelines, Kafka streams) — отдельная подобласть с собственными формулами.
- **Probabilistic composite vs worst-case** — current approach — multiply / sum (worst case); probabilistic подход (Monte Carlo с distribution per dependency) точнее, но adoption низкий. Подозреваю, что дело не только в сложности инструментов: для большинства команд следующий знак после запятой не меняет ни одного решения, а цена споров о модели растёт быстрее её пользы. Если у вас Monte Carlo реально окупился — расскажите через PR, мне интересен именно случай, где точность что-то изменила.
- **SLO Decomposition** — обратная задача: «нам нужен 99.95% user-facing, какой SLO budget per component». Не аддитивна, требует optimization.
- **Composite SLO ↔ Error Budget Policy integration** — как несколько journey-level error budgets взаимодействуют (один journey burning не должен блокировать deploys другого). Сюда же вопрос про каскад: сбой соседнего продукта сжигает бюджет и у него, и у пострадавшего, и у инфраструктурной команды под ними — учёт честный, но замораживать релизы всем троим осмысленно не всегда.
- **Формализация калибровки от боли** — эмпирический подбор target по шуму алертов и потоку жалоб работает, но у меня нет для него ни процедуры, ни критерия остановки: сколько наблюдать, какой спад жалоб считать достаточным, когда признать, что target недостижим и проблема в зависимости. Если у вас метод отлажен — расскажите через PR.
- Я не уверен, как **корректно учитывать correlated failures** в composite (один cloud region down → все зоны в регионе затронуты, math не аддитивна). Hidalgo упоминает, но не даёт canonical answer. Если есть practical model — расскажите через PR.
