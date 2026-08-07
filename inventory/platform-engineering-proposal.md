# Platform Engineering — предложение по месту в карте

**Статус:** рабочее предложение для отдельного структурного PR. Этот файл не публикуется на сайте и не меняет `roadmap.ts`.

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

## Предлагаемый порядок отдельного PR

1. Согласовать новый L1 и его priority с maintainer.
2. Добавить `platform-engineering` в `roadmap.ts` и одноимённую L1-страницу с L2 inventory.
3. Первым листом сделать `Platform as a Product` либо `Golden Paths`; остальные оставить L2-концептами до появления достаточного содержания.
4. Удалить или обновить TBD-маркеры в `Team Topologies` и `Toil Automation`.
5. Зафиксировать пересечения с Culture / Practices в `inventory/overlaps.md` до добавления новых leaf-страниц.

## Открытые решения

- Priority L1: `mandatory` выглядит вероятным для организаций с внутренней платформой, но не универсальным для маленьких команд; возможно, корректнее `nice` до появления масштаба, оправдывающего отдельную platform team.
- Первый leaf: `Platform as a Product` лучше задаёт границу, `Golden Paths` быстрее даёт проверяемый инженерный результат.
- Нужен ли отдельный leaf `Developer Experience`, или measurement остаётся частью `Platform Adoption & Measurement`.
