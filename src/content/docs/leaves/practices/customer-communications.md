---
title: Customer Communications
description: Внешняя коммуникация во время и после инцидента — публичный statuspage, рассылки, customer success outreach, regulatory disclosure. Не «PR-работа», а часть incident response. Severity → audience matrix, cadence как обещание, honest framing без alarm. Длинно строит trust лучше любых SLA-обещаний
---

:::note[Метаданные листа]
- **Ветвь:** Practices
- **Путь:** Incident Management / Customer Communications
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Внешняя коммуникация во время и после инцидента — публичный statuspage, рассылки, customer success outreach, regulatory disclosure. **Не «PR-работа» по остаточному принципу**, а часть incident response с явными правилами: severity определяет audience и cadence, cadence — обещание (не «когда есть что сказать»), honest framing без alarm. Четвёртый лист под L1 `Incident Management` (рядом с [Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/), [On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/), [Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)). Соседняя зрелость: команды, которые публикуют detailed post-mortems (GitHub / Cloudflare / Stripe), длинно строят trust лучше любых SLA-обещаний.

## Что должен уметь

- **L3** — Знает channel/audience матрицу команды — какие incidents идут на public statuspage, какие на internal Slack, какие на email customer success. Может выпустить statuspage update под наблюдением senior'а.
- **L3** — Знает базовые правила tone'а — honest без alarm; acknowledge impact; what we know; what we don't know; ETA только при ≥80% уверенности. Не пишет `issue is fixed`, пока не подтверждено в метриках.
- **L4** — Ведёт customer comms во время incident в роли Comms Lead — sitrep cadence ≤30 минут при SEV0+ active, посты на statuspage в темпе investigation, переключение между `investigating / identified / monitoring / resolved` статусами с правильным lifecycle.
- **L4** — Координирует с customer success и sales — уведомление key accounts о потенциальном impact'е, шаблоны для customer-facing teams («что говорить customer'у который звонит»), сегментированные уведомления (только affected customers).
- **L5** — Проектирует severity → communications matrix для команды — какой SEV → какие channels (statuspage / email / in-app banner / executive notify / regulators); cadence per severity; templates для каждой комбинации, ревьюнутые legal / customer success.
- **L5** — Делает regulatory communications — GDPR 72h breach notification (стартовый таймер с discovery, не подтверждения), SEC 8-K material event disclosure (4 business days), HIPAA Breach Notification Rule, FDA Medical Device Reporting. Не «оповестим в рабочее время».
- **L5** — Использует statuspage стратегически — subscriber management, uptime history transparency (показать историю vs скрыть — trust trade-off в обе стороны), localization для international customer base, integration с monitoring (auto-create components for ваши services).
- **L6+** — Проектирует org-level customer comms framework — coordination с регуляторами через legal/CISO, board-level reporting threshold для major incidents, post-mortem публикация как deliberate trust-building (Cloudflare/GitHub/Discord стиль), comms playbook для типов major incidents (data breach / regional outage / security event).
- **L6+** — Принимает strategic comms decisions — когда incident `public vs private` (зависит от customer-facing impact, не internal severity), pre-emptive comms до confirmed impact (тонкий баланс — overcomm vs honest disclosure), post-incident «what we learned» публикация как часть бренда.

## Материалы

### Книги

- Heather Adkins et al. — **[Building Secure and Reliable Systems](https://google.github.io/building-secure-and-reliable-systems/raw/toc.html)** (O'Reilly, 2020), главы 17–18 (Crisis Management, Recovery and Aftermath). **База.** Crisis communications в SRE-контексте, разделение internal vs external messaging, regulatory escalations, post-incident comms как часть recovery.
- Betsy Beyer et al. — **[The Site Reliability Workbook](https://sre.google/workbook/incident-response/)** (O'Reilly, 2018), гл. 9 «Incident Response», секция Communications. **База.** Comms Lead role в incident structure, sitrep cadence, audience separation.
- Kathleen Fearn-Banks — **[Crisis Communications: A Casebook Approach](https://www.routledge.com/Crisis-Communications-A-Casebook-Approach/Fearn-Banks/p/book/9781138229532)** (Routledge, 5-е изд.). **Дополнительно.** Academic crisis communications — фреймворки (Situational Crisis Communication Theory), case studies. Не SRE-specific, но даёт обоснования.

### Статьи и доклады

- **[Atlassian Statuspage Best Practices](https://www.atlassian.com/incident-management/incident-communication)** — guide от создателей Statuspage. **База.** Когда обновлять, какой tone, как handle ETA, lifecycle статусов.
- **[GitHub October 21, 2018 Incident Report](https://github.blog/news-insights/company-news/oct21-post-incident-analysis/)**. **База.** Эталонный пример detailed public post-mortem — что произошло, что мы делаем, чем учимся. Стиль «honest без alarm», на который многие команды ориентируются.
- **[Cloudflare incident reports](https://blog.cloudflare.com/tag/post-mortem/)**. **База.** Регулярные public post-mortems от Cloudflare — детальные технические разборы для customer-разработчиков. Хороший benchmark, что считать «public-ready» post-mortem'ом.
- Honeycomb (Charity Majors et al.) — **[The Service of Software](https://www.honeycomb.io/blog/incidents-the-service-of-software)**. **Дополнительно.** «Reliability — это услуга», customer comms — её часть; обоснование, почему transparency = long-term reliability.
- Increment — **[Incident Response issue](https://increment.com/on-call/)**. **Дополнительно.** Статьи от Stripe / Slack / Asana о customer comms во время инцидентов, шаблоны и culture.

### Инструменты

- **[Atlassian Statuspage](https://www.atlassian.com/software/statuspage)** — наиболее установленный provider; subscriber management, scheduled maintenance, incident lifecycle, custom domains, API для auto-update из monitoring.
- **[Better Stack Status](https://betterstack.com/status-page) / [Instatus](https://instatus.com/) / [Statuspal](https://statuspal.io/)** — альтернативы Statuspage с свежим UX, обычно дешевле. Statuspal — European-based, GDPR-conscious customer base.
- **[Hyperping](https://hyperping.com/) / [StatusCast](https://statuscast.com/)** — простые statuspage решения для smaller teams.
- **[StatusGator](https://statusgator.com/)** — aggregator: для customer'ов проверка статуса множества dependencies в одном месте; для команд — alerts когда зависимость упала.
- **Email / SMS broadcast** — Customer.io, Braze, Mailchimp + transactional SendGrid/Mailgun. Должны быть pre-configured с template'ами для разных incident scenarios.
- **In-app banners / system notifications** — feature flags + UI компонент для broadcast'а сообщения внутри продукта. Подходит, когда customer base — authenticated users (B2B SaaS).

## Best practices

- **Severity → audience matrix явная, не «по ситуации».** Антипаттерн: «давайте сейчас решим, делать public update или нет». Под давлением incident'а решение принимается субъективно — что-то пропускают (надо было public update), что-то overreact (private alarm раздувают до panic'ующего statuspage). Заранее определённая matrix: SEV0 → statuspage + email + executive notify в первые 15 минут; SEV1 → statuspage + customer success notify через 30 минут; SEV2 → statuspage только если customer-facing; SEV3 → internal only.
- **Cadence — обещание, не «когда есть что сказать».** Антипаттерн: «обновим, когда появится новая информация». Customers видят silence как «они растеряны / не работают над проблемой». Cadence-обещание (`sitrep каждые 30 минут при SEV0+ active даже если "всё ещё расследуем"`) сообщает: мы работаем, мы держим вас в курсе. Cadence прерывается только при `resolved` статусе.
- **Honest framing без alarm; acknowledge без blame.** Антипаттерн: `we are investigating an issue` в течение 4 часов без details. Customer не понимает blast radius, не может принять решения (failover на конкурента, уведомить своих customers). Шаблон: acknowledge impact (что не работает) → what we know (root cause если known) → what we don't know yet → ETA только при ≥80% уверенности. Не `we will be back in 15 minutes`, если это guess.
- **Customer-facing severity ≠ internal severity.** Антипаттерн: «internal SEV1 → public banner red». Internal severity отражает team mobilization; customer-facing — actual user impact. SEV1 для команды (war room) может быть `degraded performance` для customer (10% reads slower, no data loss, transparent fallback). Public statuspage state — отдельная классификация (`operational / degraded performance / partial outage / major outage`), mapped from internal severity И customer-facing impact.
- **Statuspage — first source of truth для customers; обновлять её до Twitter и email.** Антипаттерн: Twitter post «we're down», statuspage всё ещё `operational`. Customers checking statuspage первыми (мобильное app banner, RSS subscriptions, integrations) — рассогласование разрушает trust. Path: statuspage обновлена → email blast → Twitter/social → customer success outreach. Statuspage всегда ahead или одновременно с другими каналами.
- **Regulatory comms — first 24 hours critical, pre-staged templates обязательны.** Антипаттерн: «security incident, разберёмся, потом legal». GDPR Article 33 — 72h notification starts from discovery (не подтверждения). SEC 8-K — 4 business days для material events. HIPAA Breach Notification — 60 дней (но индивидуальные уведомления — без задержки). **Pre-staged comms templates с legal review** — чтобы под давлением incident'а не писать с нуля. Шаблоны хранятся в runbook'е, ежегодно review legal'ом.
- **Trust building через transparency, не через тишину.** Антипаттерн: «не будем публиковать post-mortem, customers не должны видеть наши ошибки». GitHub, Cloudflare, Stripe, Discord публикуют detailed public post-mortems после major incidents — **это строит trust длинно**. Honest «here's what happened, here's what we learned» = customers видят профессионализм. Hidden post-mortems → customers догадываются, и слухи хуже фактов. Decision: any incident с customer-facing impact > X получает public post-mortem в течение N дней.

## Связанные листья

- **[Severity Classification](/The-Way-of-SRE/leaves/practices/severity-classification/)** — severity определяет audience матрицу и cadence customer comms. Без severity classification audience-decisions делаются субъективно «в моменте».
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — Comms Lead role в incident command structure. В small team Comms — обязанность IC; в big team — выделенный человек с rotation.
- **[On-Call Rotation](/The-Way-of-SRE/leaves/practices/on-call-rotation/)** — Comms Lead — отдельная роль в rotation (если команда большая) или часть IC duty в small team.
- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — post-incident comm = публичный sanitized постмортем; blameless framing translates наружу как «professional reflection without finger-pointing».
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — pre-staged comm templates живут в runbook'ах для типовых сценариев (data breach / regional outage / security event / dependency outage).
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service owner отвечает за customer comms своего сервиса; key accounts знает CSM, кого уведомлять.
- **[Threat Modeling](/The-Way-of-SRE/leaves/practices/threat-modeling/)** — security incidents имеют специфические regulatory comms (HIPAA Breach Notification, PCI-DSS breach notification, GDPR Article 33); threat modeling определяет, какие данные требуют какого уведомления.

## Открытые вопросы

- **Status Page Management** *(TBD)* — operational practice для public statuspage: subscriber management, uptime history transparency trade-off, scheduled maintenance comms, integration с monitoring (auto-create components). Из изначального списка соседних листьев — близкая, но самостоятельная тема.
- **Pre-Staged Comm Templates** *(TBD)* — pre-incident подготовка comms templates с legal review для типовых сценариев. Может быть подсекцией в этом листе при углублении или отдельный лист по library-подходу.
- **Public Post-Mortem Practice** — публикация post-mortems как deliberate trust-building (стиль Cloudflare/GitHub/Stripe). Может стать подсекцией в Blameless Postmortem (#26) или соседним листом.
- **Crisis Communications для board / investors** — корпоративный уровень, отдельный domain, обычно вне scope SRE — relevant для CTO / VP Eng при major incidents.
- **Internationalization (i18n) statuspage** — для international customer base: language switcher на statuspage, локализованные email, time zone handling в cadence promises. Подсекция или callout.
