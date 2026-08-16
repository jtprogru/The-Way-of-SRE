---
title: Severity Classification & Escalation
description: Рамка измерения серьёзности инцидента через impact × scope и связанные правила escalation
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / Severity Classification & Escalation
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«Всё SEV1, потому что страшно» — антипаттерн, который я регулярно вижу в команде без чёткой [severity](/The-Way-of-SRE/glossary/#severity) matrix. Severity inflation: всё «критично» → ничего реально не критично, команда выгорает, клиенты получают неуместные паникёрские сообщения, executive escalation тратится впустую. Severity Classification — это **рамка по критериям**: impact × scope даёт уровень (SEV0..SEV3), уровень определяет — кого пейджит, кого вовлекать, с какой каденцией общаться с клиентами, какой постмортем требуется. Третий лист под L1 `Incident Management` (рядом с [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/) и [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)).

## Что должен уметь

Главный навык на уровне L5 — довести матрицу до чисел. Формулировка «значительная часть пользователей» выглядит рамкой, а работает как приглашение поспорить в тот момент, когда спорить некогда. Числа назначаются волевым решением: сколько процентов затронутых — уже SEV1, с какой суммы потерь в минуту подключается руководство. Ошибиться в порогах не страшно, страшно их не иметь.

**L3**
- Знает severity scheme своей команды; применяет корректную severity при declare, не «всё SEV1 потому что страшно».
- Знает escalation path для своего сервиса; где это документировано.

**L4**
- Использует severity-based response: SEV0 — war room + leadership notify + customer comms, SEV1 — IC + senior eng, SEV2 — on-call + уведомление руководителя, SEV3 — async fix без paging других.
- Делает escalation по правилам: time-based (5 мин без ack → secondary, 15 мин → IC, 30 мин → leadership при SEV1+), criteria-based (data integrity / regulatory triggers → CISO / Legal).

**L5**
- Проектирует severity matrix: **impact** (data loss / customer-facing degradation / internal-only) × **scope** (один пользователь / blast radius / global) → severity. Численные пороги (% затронутых пользователей, $/min revenue impact).
- Связывает severity с SLO burn rate: high burn rate автоматически elevates severity; SLO breach с пользовательским impact = минимум SEV1.
- Калибрует scheme на основе lookback (квартальный ревью): distribution по severity, false-positives, missed cases.

**L6+**
- Проектирует org-level severity governance: единая scheme через все команды, regulatory hooks (GDPR breach → CISO/Legal), customer comms gates.
- Принимает strategic severity decisions: external comm strategy для major incidents, board-level reporting threshold, regulatory disclosure timing.

## Материалы

### Книги

- Betsy Beyer et al. — **[Site Reliability Engineering](https://sre.google/sre-book/managing-incidents/)** (O'Reilly, 2016), глава 14. Каноническая структура ролей, severity, command-and-control модель.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), глава 9. Прикладные шаблоны severity matrix, examples из Google.

### Статьи и доклады

- **[PagerDuty Incident Response Documentation](https://response.pagerduty.com/)** — open-source playbook. Полная глава по severity definitions, escalation policies, communication cadence. По моим наблюдениям, чаще всего именно её берут как стартовый шаблон. Apache 2.0.
- **[Atlassian Incident Management Handbook](https://www.atlassian.com/incident-management)**. Собственная шкала severity, escalation policies, customer communication patterns, интеграция со Statuspage. Полезно как пример того, что число уровней — решение компании, а не универсальный стандарт.
- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы 17–18. Severity для security-incidents, decision-making под давлением.
- **[GDPR, Article 33](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A02016R0679-20160504)** — первичный текст требования об уведомлении supervisory authority. Нужен для точной границы: не каждый security incident — это personal data breach, а исключение зависит от риска для прав и свобод людей.

### Инструменты

- **[PagerDuty](https://www.pagerduty.com/) / [incident.io](https://incident.io/) / [FireHydrant](https://firehydrant.com/)** — paging + escalation policies + severity tracking. Opsgenie из этого ряда выбывает: Atlassian прекратила продажи в 2025 и отключает продукт в апреле 2027. Auto-escalation по timeout встроена везде, severity classification настраивается на команду. По моим наблюдениям, инструмент здесь редко выбирают под severity — берут тот, что уже стоит под paging, и достраивают классификацию поверх него.
- **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage) / [Better Stack](https://betterstack.com/status-page)** — customer-facing severity communication. Mapping internal severity → public status.
- **Slack workflows + ChatOps боты** — declare incident через `/incident sev1 <description>`, auto-create war room channel, auto-page on-call. Netflix [Dispatch](https://github.com/Netflix/dispatch) — open-source пример.

## Best practices

Severity считается по impact и scope, а не по громкости крика в чате. Когда критично всё, критичного нет вовсе — это и есть severity inflation, от которой команда выгорает за квартал. Рамка держится на четырёх вопросах: что именно пострадало (потеря данных хуже деградации для пользователя, деградация хуже внутренних неудобств), какой охват в процентах пользователей и blast radius, затронута ли целостность данных, есть ли регуляторные последствия.

Реакция на уровень тоже разная, и это принципиально. Полный war room с созывом всех подряд на каждый инцидент — прямая дорога к выгоранию и потере фокуса. SEV0 поднимает war room, руководство и коммуникацию с клиентами. SEV1 — IC и старший инженер. SEV2 обходится дежурным и уведомлением руководителя, а SEV3 вообще чинится асинхронно и никого не будит.

Эскалация по таймауту настраивается один раз и дальше работает сама. Иначе получается классика: pager сработал, primary не ответил, и полчаса об этом никто не знает. Пять минут без ack — уходит secondary, пятнадцать — IC, тридцать — руководство, если severity не ниже SEV1. Цепочка проверяется на game day. Не на реальном инциденте.

**Severity не статична — её повышают и понижают по ходу.** «Один раз объявили SEV2 — значит, SEV2 до конца» держится на неловкости: повышать вроде как стыдно, признавать преувеличение тоже. А scope в реальных инцидентах меняется постоянно: думали, задет один пользователь, выяснилось — половина базы, и это уже SEV0. Процедура простая: IC объявляет смену уровня явно и уведомляет заинтересованных. Понижение так же законно, как повышение, если первичная оценка была алармистской и для понижения есть обоснование. По моим наблюдениям, именно нежелание трогать однажды выставленный уровень чаще всего разводит реакцию и реальную тяжесть инцидента.

**Мост от burn rate к severity.** Пока эти две вещи живут отдельно, уровень выставляется на глаз, одинаковые ситуации в разных инцидентах получают разные уровни, а матрица обесценивается целиком. Правило в алертинге закрывает разрыв: burn rate выше порога поднимает IC и ставит минимум SEV1. Пять процентов бюджета за час — уже первая тяжесть.

**У регуляторных уведомлений нет одного универсального таймера.** По GDPR Article 33 controller уведомляет supervisory authority без неоправданной задержки и, где это возможно, не позднее 72 часов после того, как ему стало известно о personal data breach; исключение действует, если нарушение с низкой вероятностью создаёт риск для прав и свобод людей. Это не универсальные 72 часа на любой инцидент. Задача матрицы здесь одна — быстро подключить CISO, Legal и Compliance. Применимость и момент awareness определяются уже с ними, по конкретному факту и юрисдикции, а не таблицей в вики.

**Пересмотр матрицы раз в квартал.** «Схему прописали год назад и больше не трогаем» — и она тихо расходится с реальностью, потому что состав инцидентов меняется. Раз в квартал стоит смотреть на распределение: если восемьдесят процентов инцидентов оказались SEV1, критерии выставлены слишком низко. Туда же — ложные срабатывания и случаи, которые матрица не поймала вовсе. Дальше правим критерии и дописываем примеры к каждому уровню. Я регулярно вижу команды с матрицей, по которой через полгода уже невозможно отличить SEV1 от SEV2, и спор об уровне съедает первые минуты инцидента.

## Связанные листья

- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — severity определяет response intensity (war room, comm cadence, postmortem requirements).
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — escalation paths переплетены с rotation structure.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — severity-based postmortem requirements: SEV0 — обязательный PM с external timeline и executive review; SEV3 — optional / lightweight.
- **[Customer Communications](/The-Way-of-SRE/leaves/practices/customer-communications/)** — severity определяет audience matrix и cadence customer comms.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — severity matrix часть runbook structure; escalation paths документированы в runbook.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — burn rate как input для severity.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — escalation идёт по service ownership chain.
- **[War Room Patterns](/The-Way-of-SRE/leaves/practices/war-room-patterns/)** — SEV0+ требует структурированного war room.
- **[Action Items Tracking](/The-Way-of-SRE/leaves/practices/action-items-tracking/)** — severity определяет, требуется ли formal action items review (SEV0/1 — обязательно, SEV3 — optional).
- **[ChatOps](/The-Way-of-SRE/leaves/engineering/chatops/)** — declare-incident через slash-command (`/incident sev1 <description>`) — каноническая ChatOps команда; routing по SEV к разным каналам и группам дежурных.
- **[Status Page Management](/The-Way-of-SRE/leaves/practices/status-page-management/)** — internal severity → public component status mapping (`operational / degraded / partial outage / major outage`) должен быть формальным, не «по ощущениям».

## Открытые вопросы

Customer Communications, War Room Patterns и Status Page Management разъехались отсюда в отдельные листья и слинкованы выше.

- **Severity vs Priority в трекерах** *(TBD)* — как соотносятся тяжесть в момент инцидента и приоритет задачи в бэклоге, куда уезжает follow-up.

Чего у меня нет — критерия, сколько уровней держать в шкале. Число уровней остаётся решением компании, а не универсальным стандартом, и формулировка честная, но выбирать-то всё равно приходится наугад. Здесь же и граница листа: описанная рамка рассчитана на команду с собственным дежурством, а в организации, где инциденты разбирает выделенный отдел, она не работает — там решение об уровне принимает не тот, кто тушит.
