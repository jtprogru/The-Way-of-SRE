---
title: Security Chaos Engineering
description: Проверка контролей безопасности методом chaos engineering — эксперимент показывает, что detection и response реально срабатывают, а не просто настроены
sfia: [3, 4, 5, 6]
status: draft
---

«Алерт на создание публичного S3-бакета у нас настроен» — и я спрашиваю, когда его в последний раз проверяли. Чаще всего ответ: при настройке, год назад. Огромная доля контролей безопасности живёт в режиме write-once, их никто не валидирует до настоящего breach, а к моменту breach logging уже отвалился, правило алерта кто-то снёс при рефакторинге терраформа, а IAM-политику расширили «временно» полгода назад. Security Chaos Engineering — это [chaos engineering](/The-Way-of-SRE/glossary/#chaos-engineering), нацеленный **на защиту, а не на надёжность**: та же схема «гипотеза — инъекция — измерение», но объект другой — detection, alerting, авторизация, auto-remediation. Метод тот же, что в [Chaos Engineering](/The-Way-of-SRE/engineering/chaos-engineering/) из Reliability Engineering. Вопрос другой. Не «остаётся ли система живой», а «срабатывает ли защита». Граница с [Vulnerability Management](/The-Way-of-SRE/practices/vulnerability-management/) проходит так: VM ищет уязвимости, SCE проверяет, что контроли, которые должны поймать их эксплуатацию, реально работают.

## Что должен уметь

Главный навык на уровне L4 — формулировать **security steady-state hypothesis** и отличать «контроль настроен» от «контроль проверен». Пример гипотезы: «при создании security group с открытым `0.0.0.0/0:22` алерт detection срабатывает за ≤5 минут, и auto-remediation закрывает правило за ≤10». Если такого утверждения нет до эксперимента — это не SCE, а просто тыкание в прод. Я регулярно вижу, что команды путают SCE с pen test или red team; разница в том, что SCE — **повторяемая проверка известных контролей** по гипотезе, а не состязательный поиск неизвестного «как пролезть».

**L3**
- Понимает, что SCE — это hypothesis-driven валидация контролей безопасности, а не pen test и не red team; различает «контроль сконфигурирован» и «контроль верифицирован».
- Проводит простой эксперимент по безопасности в non-prod: создаёт намеренно мисконфигурированный ресурс (публичный бакет, открытый порт) и проверяет, что алерт detection срабатывает.

**L4**
- Формулирует security steady-state hypothesis, запускает эксперимент в staging с явным blast radius, измеряет MTTD (time to detect) и факт срабатывания response, документирует findings.
- Инструментирует observability для безопасности, без которой эксперимент ничего не доказывает: телеметрия detection, audit log, дашборд по событиям безопасности. Это тот же пре-реквизит, что observability для reliability-chaos.

**L5**
- Проектирует security game day или упражнение purple team: сценарии из threat model и [MITRE ATT&CK](https://attack.mitre.org/), участвуют команды detection и response, измеряется MTTD/MTTR по событиям безопасности, по итогам — action items.
- Связывает findings с vulnerability management и incident response: контроль, который не сработал, — это finding с владельцем и SLA, а не «интересное наблюдение».

**L6+**
- Внедряет continuous security validation: автоматические эксперименты в pipeline, breach-and-attack-simulation на регулярной основе, governance уровня организации для безопасного запуска состязательных экспериментов.
- Принимает стратегические решения: SCE в регулируемых средах (banking / healthcare / payments), баланс между непрерывной валидацией и риском задеть реальные системы, координация с SOC и регуляторными ограничениями.

## Материалы

### Книги

- Kelly Shortridge, Aaron Rinehart — **[Security Chaos Engineering: Sustaining Resilience in Software and Systems](https://www.oreilly.com/library/view/security-chaos-engineering/9781098113810/)** (O'Reilly, 2023). Каноническая книга темы. Главный тезис — security как property сложной системы, которую надо проверять экспериментально, а не аудитом по чеклисту. Если читать одну вещь по SCE — эту.
- Aaron Rinehart, Kelly Shortridge — **Security Chaos Engineering** (O'Reilly report, 2020). Короткий предшественник полноценной книги; хорош как первое знакомство за час, но раздавался через сайт Verica и сейчас со старых адресов не открывается — искать по названию.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы про testing и continuous validation. Взгляд Google на проверку свойств безопасности в большой системе.

### Статьи и доклады

- **[Principles of Chaos Engineering](https://principlesofchaos.org/)**. База метода, на которую SCE опирается; читать вместе с листом [Chaos Engineering](/The-Way-of-SRE/engineering/chaos-engineering/).
- Aaron Rinehart — **[ChaoSlingr и зарождение SCE](https://github.com/Optum/ChaoSlingr)**. История первого SCE-инструмента в UnitedHealth Group / Optum. Главный публичный кейс листа — см. ниже.
- **[MITRE ATT&CK](https://attack.mitre.org/)**. Knowledge base тактик и техник противника — основной источник сценариев для экспериментов.

### Инструменты

- **[Stratus Red Team](https://github.com/DataDog/stratus-red-team)** (DataDog, OSS) — cloud-native эмуляция атакующих техник, замапленных на MITRE ATT&CK; «granular, self-contained» эксперименты. По моим наблюдениям, сейчас это самый живой OSS-вход в cloud SCE.
- **[Atomic Red Team](https://github.com/redcanaryco/atomic-red-team)** (Red Canary, OSS) — библиотека небольших тестов по ATT&CK-техникам для проверки, что detection их видит.
- **[AWS Fault Injection Service](https://aws.amazon.com/fis/)** — managed chaos, часть сценариев которого применима для валидации защиты (отключение logging, IAM-disruption).
- **Breach & Attack Simulation (BAS):** [AttackIQ](https://www.attackiq.com/), [SafeBreach](https://www.safebreach.com/), [Cymulate](https://cymulate.com/) — коммерческие платформы непрерывной валидации контролей. Берут, когда нужен готовый каталог сценариев корпоративного уровня и отчётность для compliance.
- **[ChaoSlingr](https://github.com/Optum/ChaoSlingr)** — исторически первый инструмент SCE, инъекции событий безопасности в AWS. Сейчас фактически архивный; ценен как референс идеи, не как рабочий tool — единого доминирующего оркестратора SCE, в отличие от reliability-chaos, пока нет, команды собирают связку сами.

## Best practices

Главный публичный кейс — **ChaoSlingr в UnitedHealth Group / Optum (Aaron Rinehart, ~2017)**. Команда написала инструмент, который намеренно портил конфигурацию безопасности в AWS — например, открывал порт в security group — и смотрел, сработает ли detection. Результат, с которого началась вся область, оказался неприятным: контроли, про которые все были уверены, что они работают, **регулярно не срабатывали** — из-за config drift, дыр в покрытии, сломанных правил. Урок здесь не «AWS небезопасен». Урок в том, что **уверенность в работе защиты без эксперимента — это вера, а не знание**. Аудит видит, что алерт настроен. SCE проверяет, что он стреляет.

Контроль валидируется эмпирически, потому что «настроен» и «работает» — разные состояния. Алерт, IAM-политика, auto-remediation проверяются инъекцией соответствующего события, а не чтением конфига: config drift тихо ломает то, что работало при настройке, и аудит по чеклисту этого не ловит, а эксперимент ловит сразу.

Observability для безопасности — пре-реквизит, а не «подтянем по ходу». Без телеметрии detection и audit log эксперимент нечем измерить, и «сработало или нет» превращается в вопрос веры. Гейт готовности здесь ровно тот же, что observability перед reliability-chaos.

И третье, про которое забывают чаще всего: это purple team, а не скрытая атака на собственный SOC. Эксперимент анонсируется и согласуется с командой detection. Иначе либо впустую поднимется настоящий incident response, либо — что хуже — команда постепенно научится игнорировать «свои» алерты, и вы получите ровно ту дыру, которую собирались закрыть.

**SCE — это не pen test и не red team.** Pen test и red team состязательны, привязаны к моменту и ищут **неизвестное**: как сюда пролезть. SCE — повторяемая проверка **известных** контролей по явной гипотезе, в идеале автоматизированная и непрерывная. Они дополняют друг друга: pen test находит новый класс проблемы, а SCE превращает «мы это починили» в постоянно проверяемое утверждение. Путать их дорого — от SCE начинают ждать открытий, которых он не даёт.

**Главный враг — config drift, и именно его SCE ловит лучше аудита.** Контроль, который работал при настройке, ломается тихо: кто-то отключил logging на время дебага и забыл вернуть, правило алерта удалили при рефакторинге терраформа, IAM-политику расширили под инцидент и не сузили обратно. Аудит застаёт состояние в момент проверки. Непрерывный SCE застаёт drift тогда, когда он случился, и это самый сильный аргумент за автоматизацию экспериментов вместо разовых упражнений.

**Культурный пре-реквизит — blameless, как и в reliability-chaos.** Эксперимент **найдёт** неработающий контроль, в этом весь его смысл. Но если не выстреливший алерт превращается в вопрос «кто сломал», петля обратной связи рвётся, и SCE сворачивают после первой же находки. Контроль, который не сработал, — системный finding с владельцем, а не вина дежурного. Пре-реквизиты те же, что для reliability-chaos: [blameless-постмортем](/The-Way-of-SRE/practices/blameless-postmortem/) и культура, где найденная дыра считается успехом эксперимента, а не провалом команды.

## Связанные листья

- **[Chaos Engineering](/The-Way-of-SRE/engineering/chaos-engineering/)** — родительский метод. Reliability-chaos проверяет «остаётся ли система живой», SCE — «срабатывает ли защита». Гипотеза, blast radius, auto-abort и observability как пре-реквизит — общие.
- **[Vulnerability Management](/The-Way-of-SRE/practices/vulnerability-management/)** — граница: VM ищет уязвимости, SCE проверяет, что контролы, ловящие их эксплуатацию (detection, response), реально работают.
- **[Threat Modeling](/The-Way-of-SRE/practices/threat-modeling/)** — threat model даёт сценарии для экспериментов; SCE эмпирически проверяет, что заявленные mitigations срабатывают.
- **[Security Code Review](/The-Way-of-SRE/practices/security-code-review/)** — SCR проверяет код на дефекты до деплоя (proactive, pre-merge); SCE проверяет работающие контролы в проде (validation, post-deploy). SCR живёт в соседнем L1 `Secure Development` — граница проходит по моменту: до выката или после.
- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — security game day тренирует путь detection→response, как chaos тренирует команду к инцидентам надёжности; MTTD/MTTR — общие метрики.
- **[Access Control & IAM](/The-Way-of-SRE/practices/access-control-iam/)** — IAM-контроли (detection эскалации привилегий, аномального доступа) — типовая мишень экспериментов SCE.
- **[Blameless Postmortem](/The-Way-of-SRE/practices/blameless-postmortem/)** — findings обрабатываются blameless; культурный пре-реквизит адопции, как и для reliability-chaos.

## Открытые вопросы

- **BAS commercial vs OSS** *(TBD)* — когда хватает Stratus Red Team и Atomic Red Team, а когда нужна коммерческая платформа с каталогом и отчётностью. Внятной модели выбора по размеру и зрелости команды я не нашёл.
- **Continuous security validation** *(TBD)* — переход от разовых game day к автоматическим экспериментам в pipeline; модель зрелости этого перехода в хорошем публичном виде мне не попадалась.

Отдельно — регулируемые отрасли. Я не знаю, как корректно делать SCE в банке или в здравоохранении: инъекция событий безопасности упирается в регуляторные ограничения, а публичной практики почти нет. Тот же пробел, что и у reliability-chaos. Если есть опыт — расскажите PR'ом.
