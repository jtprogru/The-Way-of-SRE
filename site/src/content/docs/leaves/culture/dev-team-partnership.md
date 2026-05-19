---
title: Dev Team Partnership
description: Партнёрство SRE с продуктовыми командами — shared on-call, совместное проектирование, совместная ответственность за надёжность
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Relationship Management / Dev Team Partnership
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Партнёрство SRE с продуктовыми командами. **SRE работает вместе с devs, не вместо них.** Включает совместное проектирование, shared on-call, совместную ответственность за надёжность.

## Что должен уметь

- **L3** — Понимает разницу между «SRE как ops для devs» и «SRE как partner». Знает, что SRE не отвечает в одиночку за uptime.
- **L4** — Участвует в продуктовой команде как embedded SRE: ходит на их планирование, даёт reliability-input на design review, помогает писать корректные SLI.
- **L5** — Внедряет **shared on-call** с продуктовой командой (devs идут в ротацию с SRE) или налаживает регулярные sync-сессии. Согласует ожидания по reliability на уровне команды.
- **L6+** — Строит embed-модель SRE для нескольких команд; согласует обязанности и границы (что делает SRE, что делает product team, где shared).

## Материалы

### Книги

- Betsy Beyer et al. — **The Site Reliability Workbook** (O'Reilly, 2018), глава 16 «How SRE Relates to DevOps». [sre.google/workbook/how-sre-relates](https://sre.google/workbook/how-sre-relates/).
- Matthew Skelton, Manuel Pais — **Team Topologies** (IT Revolution, 2019). Раздел про **Stream-aligned** и **Platform** команды — фундамент для определения SRE-роли.

### Статьи и доклады

- Google SRE — **[The Evolution of SRE at Google](https://sre.google/resources/practices-and-processes/evolution-of-sre-at-google/)**. История перехода от «SRE как ops» к «SRE как partner» — полезно для убеждения скептиков.
- Liz Fong-Jones — **[SRE Doesn't Scale](https://www.usenix.org/conference/srecon19americas/presentation/fong-jones)** (SREcon). Доводы за shared responsibility и против выделенных SRE-«пожарных».

## Best practices

- **Reliability — общая ответственность.** Если SRE «отвечает за uptime, а devs за features», обе стороны проигрывают. Нужна **shared metric** (например, error budget, который тратят обе команды), к которой обе стороны имеют доступ и за которую обе отвечают.
- **Shared on-call с product team даёт самый сильный feedback loop.** Тяжёлый ритуал — devs не любят пейджер — но окупается: они начинают писать код, который не падает в 3 утра. Запускать постепенно (например, business hours-only сначала).
- **Границы должны быть явными.** «Partnership» без contract быстро деградирует в «SRE делает грязную работу». Зафиксируй на бумаге: что делает SRE, что делает product team, какие критерии передачи сервиса в production-readiness.

## Связанные листья

- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — главный регулярный ритуал, на котором partnership проявляется.
- **Production Readiness Review** *(TBD)* — формализованная граница «product team готов к продакшен».
- **SRE Maturity Assessment** *(TBD)* — оценка зрелости partnership как часть оценки зрелости SRE-практик.
