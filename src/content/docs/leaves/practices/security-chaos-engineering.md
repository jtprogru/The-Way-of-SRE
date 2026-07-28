---
title: Security Chaos Engineering
description: Применение chaos-экспериментов к security-контролам — эмпирическая проверка, что detection и response реально срабатывают, а не только настроены
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Information Security / Security Chaos Engineering
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Nice to have
- **Статус:** draft
:::

«Алерт на создание публичного S3-бакета у нас настроен» — фраза, после которой я спрашиваю: «а когда вы последний раз проверяли, что он срабатывает?». Чаще всего ответ — «при настройке, год назад». Огромная доля security-контролов — это write-once-конфигурация, которую никто не валидирует до настоящего breach, а к тому моменту logging успел отвалиться, правило алерта кто-то удалил при рефакторинге, IAM-политику расширили «временно». Security Chaos Engineering — это [chaos engineering](/The-Way-of-SRE/glossary/#chaos-engineering), направленный **на security-контролы, а не на reliability-свойства**: гипотеза-инъекция-измерение, но объект — detection, alerting, авторизация, auto-remediation. Тот же метод, что в [Chaos Engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/) (Reliability Engineering), только проверяем не «остаётся ли система живой», а «срабатывает ли защита». Граница с [Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/): VM ищет уязвимости; SCE проверяет, что контролы, которые должны поймать их эксплуатацию, реально работают.

## Что должен уметь

Главный навык на уровне L4 — формулировать **security steady-state hypothesis** и отличать «контрол настроен» от «контрол проверен». Пример гипотезы: «при создании security group с открытым `0.0.0.0/0:22` detection-алерт срабатывает за ≤5 минут, и auto-remediation закрывает правило за ≤10». Если такого утверждения нет до эксперимента — это не SCE, а просто тыкание в прод. Я регулярно вижу, что команды путают SCE с pen test или red team; разница в том, что SCE — **повторяемая проверка известных контролов** по гипотезе, а не adversarial-поиск неизвестного «как пролезть».

**L3**
- Понимает, что SCE — это hypothesis-driven валидация security-контролов, а не pen test и не red team; различает «контрол сконфигурирован» и «контрол верифицирован».
- Проводит простой security-эксперимент в non-prod: создаёт намеренно мисконфигурированный ресурс (публичный бакет, открытый порт) и проверяет, что detection-алерт срабатывает.

**L4**
- Формулирует security steady-state hypothesis, запускает эксперимент в staging с явным blast radius, измеряет MTTD (time to detect) и факт срабатывания response, документирует findings.
- Инструментирует security-observability, без которой эксперимент ничего не доказывает: detection-телеметрия, audit log, dashboard по security-событиям. Это тот же пре-реквизит, что observability для reliability-chaos.

**L5**
- Проектирует security game day / purple team упражнение: сценарии из threat model и [MITRE ATT&CK](https://attack.mitre.org/), участвуют detection- и response-команды, измеряется MTTD/MTTR по security-событиям, по итогам — action items.
- Связывает findings с vulnerability management и incident response: контрол, который не сработал, — это finding с владельцем и SLA, а не «интересное наблюдение».

**L6+**
- Внедряет continuous security validation: автоматические security-эксперименты в pipeline, breach-and-attack-simulation на регулярной основе, org-level governance для безопасного запуска adversarial-экспериментов.
- Принимает strategic-решения: SCE в regulated-средах (banking / healthcare / payments), баланс между непрерывной валидацией и риском задеть реальные системы, координация с SOC и regulatory-ограничениями.

## Материалы

### Книги

- Kelly Shortridge, Aaron Rinehart — **[Security Chaos Engineering: Sustaining Resilience in Software and Systems](https://www.oreilly.com/library/view/security-chaos-engineering/9781098113810/)** (O'Reilly, 2023). Каноническая книга темы. Главный тезис — security как property сложной системы, которую надо проверять экспериментально, а не аудитом по чеклисту. Если читать одну вещь по SCE — эту.
- Aaron Rinehart, Kelly Shortridge — **Security Chaos Engineering** (O'Reilly report, 2020). Короткий предшественник полноценной книги; хорош как первое знакомство за час, но раздавался через сайт Verica и сейчас со старых адресов не открывается — искать по названию.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы про testing и continuous validation. Google-перспектива на проверку security-свойств в большой системе.

### Статьи и доклады

- **[Principles of Chaos Engineering](https://principlesofchaos.org/)**. База метода, на которую SCE опирается; читать вместе с листом [Chaos Engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/).
- Aaron Rinehart — **[ChaoSlingr и зарождение SCE](https://github.com/Optum/ChaoSlingr)**. История первого SCE-инструмента в UnitedHealth Group / Optum. Главный публичный кейс листа — см. ниже.
- **[MITRE ATT&CK](https://attack.mitre.org/)**. Knowledge base тактик и техник противника — основной источник сценариев для security-экспериментов.

### Инструменты

- **[Stratus Red Team](https://github.com/DataDog/stratus-red-team)** (DataDog, OSS) — cloud-native эмуляция атакующих техник, замапленных на MITRE ATT&CK; «granular, self-contained» эксперименты. По моим наблюдениям, сейчас это самый живой OSS-вход в cloud SCE.
- **[Atomic Red Team](https://github.com/redcanaryco/atomic-red-team)** (Red Canary, OSS) — библиотека небольших тестов по ATT&CK-техникам для проверки, что detection их видит.
- **[AWS Fault Injection Service](https://aws.amazon.com/fis/)** — managed chaos, часть сценариев которого применима для security-валидации (отключение logging, IAM-disruption).
- **Breach & Attack Simulation (BAS):** [AttackIQ](https://www.attackiq.com/), [SafeBreach](https://www.safebreach.com/), [Cymulate](https://cymulate.com/) — коммерческие платформы непрерывной валидации контролов. Берут, когда нужен enterprise-каталог сценариев и compliance-отчётность.
- **[ChaoSlingr](https://github.com/Optum/ChaoSlingr)** — исторически первый SCE-инструмент (AWS security-инъекции). Сейчас фактически архивный; ценен как референс идеи, не как рабочий tool — единого доминирующего SCE-оркестратора, в отличие от reliability-chaos, пока нет, команды собирают связку сами.

## Best practices

Главный публичный кейс — **ChaoSlingr в UnitedHealth Group / Optum (Aaron Rinehart, ~2017)**. Команда написала инструмент, который намеренно вносил security-мисконфигурации в AWS — например, открывал порт в security group — и проверял, срабатывает ли detection. Результат, который и запустил всю область: контролы, про которые все были уверены, что они работают, **регулярно не срабатывали** — из-за config drift, дыр в покрытии, сломанных правил. Урок не «AWS небезопасен», а то, что **уверенность в работе security-контрола без эксперимента — это вера, а не знание**. Аудит видит, что алерт настроен; SCE проверяет, что он стреляет.

**Короткие правила:**

- **Валидируй контрол эмпирически — «настроен» ≠ «работает».** Алерт, IAM-политика, auto-remediation проверяются инъекцией соответствующего события, а не чтением конфига. Config drift молча ломает то, что работало при настройке; аудит этого не ловит, эксперимент ловит.
- **Security-observability — пре-реквизит, не «подтянем по ходу».** Без detection-телеметрии и audit log эксперимент не измерить: «сработало или нет» нечем подтвердить. Тот же gate готовности, что observability перед reliability-chaos.
- **Это purple team, а не скрытая атака на свой SOC.** Эксперимент анонсируется, координируется с detection-командой; иначе либо поднимется реальный incident-response впустую, либо (хуже) команда научится игнорировать «свои» алерты. Цель — проверить контрол и тренировать response, а не устроить сюрприз дежурным.

Подробнее:

**SCE — это не pen test и не red team.** Pen test и red team — adversarial, point-in-time, ищут **неизвестное** («как сюда пролезть»). SCE — повторяемая проверка **известных** контролов по явной гипотезе, в идеале автоматизированная и непрерывная. Они дополняют друг друга: pen test находит новый класс проблемы, SCE превращает «мы это починили» в постоянно проверяемое утверждение. Путать их — значит ждать от SCE открытий, которых он не даёт, и наоборот.

**Главный враг — config drift, и именно его SCE ловит лучше аудита.** Контрол, который работал при настройке, тихо ломается: кто-то отключил logging «на время дебага», правило алерта удалили при рефакторинге терраформа, IAM-политику расширили под инцидент и не сузили обратно. Периодический аудит застаёт состояние в момент проверки; continuous SCE застаёт drift тогда, когда он случился. Это сильный аргумент за автоматизацию security-экспериментов, а не разовые упражнения.

**Cultural prerequisite — blameless, как и в reliability-chaos.** Эксперимент **найдёт** неработающий контрол — это его цель. Если ненастреливший алерт превращается в «кто сломал», feedback loop ломается, и SCE сворачивают после первой же находки. Контрол, который не сработал, — системный finding с владельцем, а не вина дежурного. Пре-реквизиты ровно те же, что для reliability-chaos: [blameless-постмортем](/The-Way-of-SRE/leaves/practices/blameless-postmortem/) и культура, где найденная дыра — это успех эксперимента.

## Связанные листья

- **[Chaos Engineering](/The-Way-of-SRE/leaves/engineering/chaos-engineering/)** — родительский метод. Reliability-chaos проверяет «остаётся ли система живой», SCE — «срабатывает ли защита». Гипотеза, blast radius, auto-abort, observability-пре-реквизит — общие.
- **[Vulnerability Management](/The-Way-of-SRE/leaves/practices/vulnerability-management/)** — граница: VM ищет уязвимости, SCE проверяет, что контролы, ловящие их эксплуатацию (detection, response), реально работают.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — threat model даёт сценарии для security-экспериментов; SCE эмпирически проверяет, что заявленные mitigations срабатывают.
- **[Security Code Review](/The-Way-of-SRE/leaves/practices/security-code-review/)** — SCR проверяет код на дефекты до деплоя (proactive, pre-merge); SCE проверяет работающие контролы в проде (validation, post-deploy). SCR живёт в соседнем L1 `Secure Development` — граница проходит по моменту: до выката или после.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — security game day тренирует detection→response путь, как chaos тренирует команду к reliability-инцидентам; MTTD/MTTR — общие метрики.
- **[Access Control & IAM](/The-Way-of-SRE/leaves/practices/access-control-iam/)** — IAM-контролы (detection эскалации привилегий, аномального доступа) — типовая мишень SCE-экспериментов.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — findings обрабатываются blameless; культурный пре-реквизит адопции, как и для reliability-chaos.

## Открытые вопросы

- **BAS commercial vs OSS** — когда хватает Stratus Red Team / Atomic Red Team, а когда нужна enterprise-платформа (AttackIQ / SafeBreach) с каталогом и отчётностью. У меня нет публичной модели выбора по размеру/зрелости команды.
- **Continuous security validation** — переход от разовых game day к автоматическим экспериментам в pipeline; maturity-модель этого перехода я не видел в хорошем публичном виде.
- Я не знаю, как корректно делать SCE в **regulated industries** — тот же пробел, что и у reliability-chaos: инъекция security-событий в banking / healthcare / payments упирается в regulatory-ограничения, и публичной практики мало. Если есть опыт — расскажите PR'ом.
