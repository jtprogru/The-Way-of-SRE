# Platform Engineering — предложение по месту в карте

**Статус:** принято и применено. L1 `Platform Engineering` добавлен в `roadmap.ts` с приоритетом `nice`, первым листом стал `Platform as a Product`. Файл остаётся как обоснование решения и как источник кандидатов на следующие листья; на сайте не публикуется.

**Что решено из блока «Открытые решения»:** priority — `nice` (отдельная platform team оправдана с масштаба, для маленькой команды это не обязательная компетенция); первый лист — `Platform as a Product`, потому что он задаёт границу всего L1. Вопрос про отдельный лист `Developer Experience` остаётся открытым и перенесён в «Открытые вопросы» самого листа.

## Почему не добавлять один лист в существующий L1

В текущем inventory Platform Engineering уже отмечен как потенциальный отдельный L1 в листьях `Team Topologies` и `Toil Automation`. Поместить один лист под `IT Infrastructure` или `Toil Reduction` означало бы свести платформу либо к кластеру и облаку, либо к автоматизации ручных задач. Оба варианта теряют главный объект: **внутреннюю техническую платформу как продукт для команд-разработчиков**.

По критерию методологии главный объект здесь — технический артефакт, поэтому базовое размещение: **SRE Engineering → Platform Engineering**. Культурные нормы и операционные процессы остаются в существующих ветвях и связываются cross-links, а не дублируются.

## Доказательная база

- CNCF TAG App Delivery — **[Platform Engineering Maturity Model](https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/)**. Модель рассматривает пять независимых аспектов: Investment, Adoption, Interfaces, Operations и Measurement. Она отдельно предупреждает, что максимальный уровень зрелости не является самоцелью: каждый следующий уровень требует больше финансирования и времени людей.
- Matthew Skelton, Manuel Pais — **Team Topologies** (IT Revolution, 2019). Platform team — один из четырёх базовых типов команд; её назначение связано со снижением cognitive load stream-aligned teams, а не с централизацией всей эксплуатации.
- CNCF TAG App Delivery — **[Platforms White Paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/)**. Источник для границы между набором общих возможностей, platform team и опытом потребления платформы.

## Предлагаемая структура L1

| Кандидат в leaf | Главный проверяемый результат | Граница с существующими листьями |
| --- | --- | --- |
| **Platform as a Product** | Есть сегменты пользователей, roadmap, feedback loop, owner и правила удаления невостребованных возможностей | `Stakeholder Management` описывает отношения; здесь объект — продуктовые решения платформы |
| **Golden Paths** | Типовой путь версионируется, тестируется и допускает осознанное отклонение | `CI/CD` и `IaC` дают компоненты; здесь проверяется собранный developer journey |
| **Self-Service Infrastructure** | Разработчик получает capability через API/UI/CLI без ticket handoff, с policy и audit trail | `Toil Automation` сокращает ручную работу; здесь результат — поддерживаемый интерфейс платформы |
| **Internal Developer Portal** | Каталог и действия портала отражают источник истины, ownership и доступные capabilities | `Service Ownership` определяет данные владения; портал не становится вторым источником истины |
| **Platform Reliability** | У platform capabilities есть SLO, support model, capacity и incident ownership | `SLO Engineering` даёт технику; здесь объект — сама внутренняя платформа как сервис |
| **Platform Adoption & Measurement** | Решения опираются на usage, qualitative feedback и результаты user journeys, а не на число созданных шаблонов | `DORA Metrics` не используется как доказательство причинности отдельной platform feature |

Это намеренно больше одного листа: таблица служит аргументом в пользу отдельного L1, а не готовым обязательством реализовать все листья сразу.

## Границы, которые стоит принять до правки графа

1. **Платформа не равна portal.** Backstage, Port и Cortex — возможные интерфейсы, но продукт может существовать без UI; названия продуктов остаются в материалах, не в графе.
2. **Self-service не равен отсутствию governance.** Policy, audit, quotas и documented escape hatch являются частью capability.
3. **Golden path не должен быть единственным путём.** CNCF maturity model описывает переход к self-service и integrated services, но не требует принудительно загнать все workloads в один шаблон.
4. **SRE и platform team не синонимы.** SRE может владеть надёжностью платформы или консультировать команду, но организационная модель выбирается отдельно.
5. **Adoption не доказывает value сама по себе.** Нужны usage, qualitative feedback и outcome выбранного user journey; универсальной одной метрики зрелости нет.

## Порядок отдельного PR

1. ✅ Согласовать новый L1 и его priority с maintainer — принят `nice`.
2. ✅ Добавить `platform-engineering` в `roadmap.ts` и одноимённую L1-страницу с L2 inventory.
3. ✅ Первым листом сделать `Platform as a Product`; остальные остаются L2-концептами до появления достаточного содержания.
4. ✅ Обновить TBD-маркеры в `Team Topologies` и `Toil Automation` — сужены до `Internal Developer Portal` и `Self-Service Infrastructure`.
5. ✅ Зафиксировать пересечения в `inventory/overlaps.md` — строка 13.

## Что осталось открытым

- Нужен ли отдельный leaf `Developer Experience`, или measurement остаётся частью `Platform Adoption & Measurement`.
- Порядок следующих листьев. `Golden Paths` написан вторым. Следующий по готовности — `Self-Service Infrastructure` (уже помечен TBD в `Toil Automation`), затем `Internal Developer Portal` (с ним же в глоссарий уходит `Backstage`). `Platform Reliability` и `Platform Adoption & Measurement` — последними: у них самое сильное пересечение с `SLO Engineering` и `DORA Metrics`.
- Из открытых вопросов `Golden Paths`: чем должно заканчиваться расхождение поколений шаблона и нужен ли отдельный лист про scaffolding как технику.
