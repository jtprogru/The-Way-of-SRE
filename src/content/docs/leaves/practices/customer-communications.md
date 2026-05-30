---
title: Customer Communications
description: Внешняя коммуникация во время инцидента — severity, cadence, honest framing
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / Customer Communications
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Я регулярно вижу две крайности communication during incident. Одна — молчание: команда тушит, никто наружу не пишет, клиенты читают Twitter и пишут в support. Вторая — overcommunication: каждые 5 минут update «всё ещё расследуем», клиенты устают и отписываются от status page. Между ними — дисциплина: [severity](/The-Way-of-SRE/glossary/#severity) определяет audience, cadence — обещание (а не «когда есть что сказать»), honest framing без alarm. Четвёртый лист под L1 `Incident Management` (рядом с [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/), [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/), [Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)).

## Что должен уметь

Главный навык на уровне L4 — выдерживать **sitrep cadence как обещание**, даже когда «нечего сказать». Клиенты видят молчание как «они растеряны / не работают над проблемой». Update вида «в 14:30 — статус: расследуем; пробовали X (не помогло); сейчас проверяем Y; следующее сообщение в 15:00» — это валидное сообщение, и оно строит trust лучше, чем 20-минутное молчание с последующим «всё починили».

- **L3** — Знает channel/audience матрицу команды — какие incidents идут на public statuspage, какие на internal Slack, какие на email customer success.
- **L3** — Знает базовые правила тона: honest без alarm; acknowledge impact; what we know; what we don't know; ETA только при ≥80% уверенности.
- **L4** — Ведёт customer comms во время incident в роли Comms Lead — sitrep cadence ≤30 минут при SEV0+ active, обновления статусов `investigating / identified / monitoring / resolved` в правильном lifecycle.
- **L4** — Координирует с customer success и sales — уведомление key accounts, шаблоны «что говорить клиенту, который звонит», сегментированные уведомления (только affected клиенты).
- **L5** — Проектирует severity → communications matrix для команды — какой SEV → какие channels (statuspage / email / in-app banner / executive notify / regulators); cadence per severity; templates per комбинация, ревьюнутые legal / customer success.
- **L5** — Делает regulatory communications — GDPR 72h breach notification (стартовый таймер с discovery, не подтверждения), SEC 8-K material event disclosure (4 business days), HIPAA Breach Notification Rule.
- **L5** — Использует statuspage стратегически — subscriber management, uptime history transparency trade-off, localization для international клиентской базы.
- **L6+** — Проектирует org-level customer comms framework — coordination с регуляторами через legal/CISO, board-level reporting threshold, post-mortem публикация как deliberate trust-building.
- **L6+** — Принимает strategic comms decisions — когда incident `public vs private`, pre-emptive comms до confirmed impact, post-incident «what we learned» публикация как часть бренда.

## Материалы

### Книги

- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы 17–18 (Crisis Management, Recovery and Aftermath). Crisis communications в SRE-контексте, internal vs external messaging, regulatory escalations.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), глава 9, секция Communications. Comms Lead role в incident structure, sitrep cadence, audience separation.
- Kathleen Fearn-Banks — **Crisis Communications: A Casebook Approach** (Routledge, 5-е изд.). Academic crisis communications. Не SRE-specific, но даёт обоснование подходов.

### Статьи и доклады

- **[Atlassian Statuspage Best Practices](https://www.atlassian.com/incident-management/incident-communication)** — guide от создателей Statuspage. Когда обновлять, какой tone, как handle ETA.
- **[GitHub October 21, 2018 Incident Report](https://github.blog/news-insights/company-news/oct21-post-incident-analysis/)**. Главный публичный кейс — см. ниже.
- **[Cloudflare incident reports](https://blog.cloudflare.com/tag/post-mortem/)**. Регулярные public post-mortems от Cloudflare. По моим наблюдениям, один из лучших benchmark'ов «public-ready» post-mortem.
- Honeycomb — **[The Service of Software](https://www.honeycomb.io/blog/incidents-the-service-of-software)**. Reliability как услуга; customer comms — её часть.
- Increment — **[Incident Response issue](https://increment.com/on-call/)**. Статьи от Stripe / Slack / Asana о customer comms.

### Инструменты

- **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage)** — наиболее установленный provider; subscriber management, scheduled maintenance, incident lifecycle, custom domains, API для auto-update из monitoring.
- **[Better Stack Status](https://betterstack.com/status-page) / [Instatus](https://instatus.com/) / [Statuspal](https://statuspal.io/)** — альтернативы Statuspage. По моим наблюдениям, чаще выбирают за свежий UX и более низкую цену. Statuspal — European-based, для GDPR-aware клиентской базы.
- **Email / SMS broadcast** — Customer.io, Braze, Mailchimp + transactional SendGrid/Mailgun. Должны быть pre-configured с templates для разных incident scenarios.
- **In-app banners / system notifications** — feature flags + UI компонент для broadcast'а внутри продукта. Подходит, когда клиентская база — authenticated users (B2B SaaS).

## Best practices

Главный публичный кейс — **GitHub October 21, 2018 Incident Report**. GitHub потерял ~24 часа доступности для значительной части пользователей из-за сетевого партишн между двумя датацентрами и каскадной деградации MySQL. Их post-mortem — эталон того, как делать public communication: detailed timeline, конкретные contributing factors (не одна «причина»), список того, что они меняют, явное acknowledgement, что часть клиентских данных была недоступна / тормозила. По моим наблюдениям, это один из 3–4 публичных post-mortems, которые в SRE-индустрии цитируют десятки раз — если читаете лист и впервые в теме, сначала туда.

**Короткие правила:**

- **Severity → audience matrix явная, не «по ситуации».** Заранее определённая matrix: SEV0 → statuspage + email + executive notify в первые 15 минут; SEV1 → statuspage + customer success notify через 30 минут; SEV2 → statuspage только если customer-facing; SEV3 → internal only. Под давлением incident решение «делать public update или нет» принимается субъективно — что-то пропускают, что-то overreact.
- **Cadence — обещание, не «когда есть что сказать».** Клиенты видят молчание как «они растеряны». Cadence-обещание (sitrep каждые 30 минут при SEV0+ active даже если «всё ещё расследуем») сообщает: мы работаем, мы держим вас в курсе. Cadence прерывается только при `resolved` статусе.
- **Statuspage — first source of truth для клиентов; обновлять её до Twitter и email.** Path: statuspage обновлена → email blast → Twitter/social → customer success outreach. Twitter post «we're down», пока statuspage показывает `operational» — рассогласование разрушает trust.

Подробнее:

**Honest framing без alarm; acknowledge без blame.** Я регулярно вижу `we are investigating an issue` в течение 4 часов без details. Клиент не понимает blast radius, не может принять решения (failover на конкурента, уведомить своих клиентов). Шаблон, который работает: acknowledge impact (что не работает) → what we know (root cause если known) → what we don't know yet → ETA только при ≥80% уверенности. Не `we will be back in 15 minutes`, если это guess. ETA, не выполненный, разрушает trust сильнее, чем «не знаем».

**Customer-facing severity ≠ internal severity.** «Internal SEV1 → public banner red» — типичная путаница. Internal severity отражает team mobilization (war room, comm cadence); customer-facing — actual user impact. SEV1 для команды (war room) может быть `degraded performance` для клиента (10% reads slower, no data loss, transparent fallback). Public statuspage state — отдельная классификация (`operational / degraded performance / partial outage / major outage`), mapped from internal severity И customer-facing impact.

**Regulatory comms — first 24 hours critical, pre-staged templates обязательны.** GDPR Article 33 — 72h notification starts from discovery (не подтверждения). SEC 8-K — 4 business days для material events. HIPAA Breach Notification — 60 дней (но индивидуальные уведомления — без задержки). Под давлением incident писать с нуля невозможно — pre-staged comms templates с legal review должны жить в runbook, ежегодно ревьюиться legal'ом.

**Trust building через transparency, не через тишину.** GitHub, Cloudflare, Stripe, Discord публикуют detailed public post-mortems после major incidents — по моим наблюдениям, **это строит trust на годы**. Honest «here's what happened, here's what we learned» = клиенты видят профессионализм. Hidden post-mortems → клиенты догадываются, и слухи хуже фактов. Decision: any incident с customer-facing impact > X получает public post-mortem в течение N дней.

## Связанные листья

- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — severity определяет audience matrix и cadence. Без severity classification audience-decisions делаются субъективно «в моменте».
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — Comms Lead role в incident command structure. В small team Comms — обязанность IC; в big team — выделенный человек.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — post-incident comm = публичный sanitized постмортем; blameless framing translates наружу как professional reflection.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — pre-staged comm templates живут в runbook для типовых сценариев (data breach / regional outage / security event).
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service owner отвечает за customer comms своего сервиса; key accounts знает CSM, кого уведомлять.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — security incidents имеют специфические regulatory comms; threat modeling определяет, какие данные требуют какого уведомления.
- **[Status Page Management](/The-Way-of-SRE/leaves/practices/status-page-management/)** — operational practice самой платформы: subscriber model, uptime transparency policy, scheduled maintenance pre-announce, decoupled infrastructure. Этот лист — про *что говорить*; SPM — про *как устроен канал*.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/leaves/culture/dr-policy/)** — communication tree для DR-сценариев (executive → board → regulators → customers → public) — часть DR policy; обычная severity-based audience matrix отсюда расширяется до DR-scope.

## Открытые вопросы

- **Status Page Management** — выделен в отдельный лист (см. Связанные листья).
- **Pre-Staged Comm Templates** *(TBD)* — pre-incident подготовка templates с legal review для типовых сценариев. Может быть подсекцией здесь или отдельный лист.
- **Public Post-Mortem Practice** — публикация post-mortems как deliberate trust-building (Cloudflare/GitHub/Stripe). Может стать подсекцией в Blameless Postmortem или соседним листом.
- **Internationalization statuspage** — для international клиентской базы — теперь в открытых вопросах Status Page Management.
