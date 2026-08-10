---
title: Symptom vs Cause Alerting
description: Дисциплина alert design — page на симптомы (то, что чувствует пользователь), не на причины; cause-based данные — для дебага, не для пейджера
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Observability / Symptom vs Cause Alerting
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«DB CPU > 80% → page» — типичный алерт на причину. При отказе базы он выдаёт полсотни пейджеров на один инцидент и парализует on-call, а при медленном запросе на слабо связанном сервисе будит человека, пока продукт спокойно работает. Алерт на симптом ловит то, что реально чувствует пользователь: latency, error rate, availability. И звонит один раз за инцидент, ровно когда надо. Rob Ewaschuk в 2014 году написал внутренний документ Google «My Philosophy on Alerting», который стал каноном; SRE Book главы 6 и 4 закрепили это в индустрии. Этот лист — про дисциплину различения и про то, как перебрать alert portfolio после перехода на SLO-driven подход.

Граница: [SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/) — *как* алерт устроен (SLI как сигнал, burn rate как порог); этот лист — *на что именно* алертить (симптом, не причина). [Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/) — что делать, когда система уже зашумлена; этот — как с самого начала не зашумлять.

## Что должен уметь

Главный навык на уровне L4 — формулировать **golden signals** (latency / errors / traffic / saturation) для своего сервиса так, чтобы symptom-side покрывал «что пользователь почувствует», а cause-side покрывал «куда смотреть в дебаге». Я регулярно вижу команды, которые знают слова «golden signals» наизусть — но в их alert config 80% правил cause-based (CPU / memory / disk / connections), и при downstream outage on-call просто тонет в шуме. Различение видно не в формулировке принципа, а в том, какие правила реально active при `page` priority.

**L3**
- Отличает symptom-based от cause-based алерта на примере конкретного правила; объясняет, почему `error rate > 1%` — symptom, а `connection pool > 80%` — cause.
- Понимает alert amplification: при downstream outage cause-based алерты на dependencies + cascading effects дают N-кратный шум на тот же incident.

**L4**
- Проектирует **golden signals** для своего сервиса: latency (per percentile), errors (rate + share), traffic (qps / req/min), saturation (utilization vs capacity). Все 4 — symptom-side; cause-side — отдельный набор.
- Использует cause-based данные как **secondary** в runbook'е, а не **primary** в alert. Метрики причин живут в дашборде, симптомы — в пейджере.

**L5**
- Применяет multi-burn-rate alerting для symptom-side SLI: быстрая burn (fast burn 1h / 5min) и медленная (slow burn 6h / 30min) — один алерт, два window'а.
- Регулярно (раз в квартал) пересматривает alert portfolio: какие cause-based выкинуть как noise / понизить до dashboard / оставить как secondary; какие symptom-side добавить, если incident прошёл без алерта.

**L6+**
- Внедряет alert-as-code дисциплину: каждое alert rule имеет owner, runbook link, SLI / threshold rationale, severity, ожидание частоты (alert per quarter), review cycle.
- Связывает alerting policy с SLO program: paging-level алерты только на SLO burn; ticket-level — на внутренние saturation indicators; dashboard-only — на cause-side и diagnostic signals.

## Материалы

### Книги

- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/monitoring-distributed-systems/)** (O'Reilly, 2016), глава 6 «Monitoring Distributed Systems». Канонический разбор: 4 golden signals, symptoms vs causes, white-box vs black-box monitoring. Если выбирать одну главу — эту.
- Betsy Beyer et al. (eds) — **[Site Reliability Engineering](https://sre.google/sre-book/practical-alerting/)** (O'Reilly, 2016), глава 10 «Practical Alerting from Time-Series Data». Как связка «временной ряд → правило → пейджер» устроена изнутри на примере Borgmon; читать после главы 6.
- Mike Julian — **[Practical Monitoring](https://www.oreilly.com/library/view/practical-monitoring/9781491957349/)** (O'Reilly, 2017). Глава «Designing Meaningful Alerts». Альтернативный взгляд той же идеи: разделение alerts (page) / warnings (ticket) / informationals (log).
- Cindy Sridharan — **[Distributed Systems Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)** (O'Reilly, 2018). Контекст: почему observability ≠ monitoring; почему cause-debugging уходит в трейсы / логи, а alerting остаётся на симптомах.

### Статьи и доклады

- Rob Ewaschuk — **[My Philosophy on Alerting](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/preview)** (Google internal, 2014). Первоисточник принципа «page on symptoms, not causes». Короткий документ — лучшая первая статья по теме. Главный публичный кейс — см. ниже.
- Betsy Beyer, Niall Murphy, Liz Fong-Jones, David Rensin — **[The Site Reliability Workbook](https://sre.google/workbook/alerting-on-slos/)** (O'Reilly, 2018), глава 5 «Alerting on SLOs». Многоуровневые burn rate alerts — практика, развивающая Ewaschuk: 2 percent / 5 percent / 10 percent budget burn windows, multi-window multi-burn-rate.
- Charity Majors — **[блог Honeycomb](https://www.honeycomb.io/blog)** и её [личный блог](https://charity.wtf/). Контекст высокой кардинальности и observability как противопоставления classical monitoring. Полезно как фон, а не как канон по alerting.

### Инструменты

- **[Prometheus + Alertmanager](https://prometheus.io/docs/alerting/latest/overview/)** — де-факто стандарт. Multi-window multi-burn-rate реализуется через `for` + recording rules. Sloth / Pyrra / OpenSLO — генераторы SLO-aware alert rules поверх Prometheus.
- **[Grafana](https://grafana.com/oss/alerting/)** / **[Datadog](https://docs.datadoghq.com/monitoring/)** / **[New Relic](https://docs.newrelic.com/docs/alerts-applied-intelligence/)** — alerting на векторах observability platforms; pattern одинаков, синтаксис разный.
- **[Sloth](https://sloth.dev/)** / **[Pyrra](https://github.com/pyrra-dev/pyrra)** / **[OpenSLO](https://openslo.com/)** — SLO-as-code; alert-rules генерируются из SLO spec автоматически. По моим наблюдениям, чаще выбирают Sloth — proven и интегрирован с Prometheus.
- **Анти-инструмент:** правило алерта на каждую метрику дашборда — антипаттерн, доводящий до alert fatigue за месяц. Pattern «алерт — это пейджер; всё остальное — dashboard» — самый сильный фильтр.

## Best practices

Главный публичный кейс — **Rob Ewaschuk, «My Philosophy on Alerting» (Google internal, ~2014)**. Документ короткий (10 страниц), и каждая его рекомендация выдержала ~10 лет: «page on symptoms, not causes», «every page must be actionable», «if you don't know what to do, it shouldn't be a page», «alert quality matters more than alert quantity». Я регулярно вижу команды, которые читали SRE Book, но не сам этот документ — и теряют главный nuance: Ewaschuk пишет про **операционную работу человека** ночью, не про «правильный мониторинг». Это смещает рамку: alert design — это UX-задача для on-call инженера в 3 часа ночи. Один час чтения и пять лет дисциплины.

Правил, из которых всё вырастает, ровно три. Пейджер звонит только на симптомы: данные о причинах живут в дашборде и runbook, а будит человека только то, что означает «пользователю плохо прямо сейчас или станет плохо через десять минут». Каждый алерт actionable — если on-call не знает, что с сигналом делать, это не алерт, а строчка в логе; cookbook на тридцать шагов в духе «может быть X, а может быть Y» означает, что условие алерта слишком широкое. И один инцидент — один пейджер. Алерты на причины по всем зависимостям дают кратный шум на один и тот же отказ downstream, симптомная сторона даёт один звонок. Лакмус простой: больше трёх пейджеров на инцидент — portfolio сломан.

**Алерты на причины не отменяются, они переезжают.** Распространённый страх звучит так: уберём алерт на CPU — и кто-то пропустит его исчерпание. Метрики причин никуда не деваются, просто живут в дашборде и runbook, а не в пейджере. Поднялся симптомный алерт по latency или ошибкам — on-call открывает дашборд и сразу видит причинную сторону как контекст. Разделение проходит по роли сигнала: первичный говорит, что чувствует пользователь, диагностический — где копать.

**Multi-burn-rate — шаг от аксиомы про симптомы к работающей формуле.** Чистый «error rate > 1%» реагирует только на очевидную аварию. Чистый «сгорело 2% бюджета» реагирует, когда всё уже случилось. Multi-window решает обе беды сразу: fast burn (окно 1h @ 14.4x) ловит быстрый инцидент, slow burn (окно 6h @ 6x) — медленную деградацию. Формулы и параметры — в SRE Workbook, глава 5. По моим наблюдениям, чистый alert portfolio от зашумлённого почти всегда отличает наличие multi-burn-rate, остальное вторично.

**Ежеквартальный пересмотр алертов — обязательная гигиена.** Portfolio, который просто копится без ревью, через год превращается в сотни правил: часть не срабатывала ни разу, часть срабатывала шумом, и только часть по делу. Раз в квартал каждое правило проходит три вопроса. Срабатывало ли за период? Было ли по нему что делать? Понизить, повысить или выкинуть? Без такой ревизии даже хорошо спроектированный alert design сползает обратно к усталости от алертов.

**Black-box не заменяет white-box.** Мониторинг симптомов часто сводят к black-box: синтетические probes, внешние проверки доступности. Полезно, но в одиночку не годится. Black-box видит «сервис недоступен» и не видит «сервис отвечает, но каждый пятый запрос с ошибкой». White-box (error rate и latency из самого сервиса) и black-box (synthetic user journey) дополняют друг друга. Я регулярно вижу команды, у которых либо только black-box (миссит частичные деградации), либо только white-box (миссит network / DNS / TLS issues между пользователем и сервисом).

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — *как* устроен алерт (SLI / threshold / burn rate); этот лист — *на что* алертить. Читать вместе.
- **[Alert Fatigue Management](/The-Way-of-SRE/leaves/engineering/alert-fatigue-management/)** — что делать, когда alert portfolio уже шумит; этот — как с самого начала не разводить шум.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — symptom-side алерты привязаны к SLO; budget burn rate — каноническая формула.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — каждый алерт ссылается на runbook, где cause-side metrics — diagnostic step, не trigger.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — actionable алерт = первый шаг IR; non-actionable алерт ломает IR с самого начала.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — circuit breaker / retry / shed metrics — это secondary indicators (показывают, что patterns активны), не primary alerts.

## Открытые вопросы

Три темы ждут своих листьев. Alert SLO *(TBD)* — meta-SLI для самого алертинга: precision, recall, время от начала инцидента до пейджера; отдельный разговор про то, как измерять качество alert program. Synthetic monitoring *(TBD)* — black-box probes, RUM, synthetic user journeys, соседняя ветка observability. И детект аномалий вместо пороговых правил *(TBD)* — Holt-Winters, Prophet, модели: где это работает и где нет.

Чего я не знаю сам — как аккуратно ловить частичную деградацию на уровне фичефлагов, когда плохо только одной когорте пользователей. Если у вас такой опыт есть, расскажите через PR.
