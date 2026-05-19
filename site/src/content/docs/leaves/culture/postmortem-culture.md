---
title: Postmortem Culture
description: Норма безвиновного разбора инцидентов — фокус на системных причинах, а не на персональной ответственности
---

:::note[Метаданные листа]
- **Ветвь:** Culture
- **Путь:** Learning Delivery / Postmortem Culture
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Норма безвиновного разбора инцидентов. Фокус на **системных причинах**, а не на персональной ответственности. Психологическая основа для роста команды через ошибки. Не путать с ритуалом постмортема ([Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)); здесь — про **норму**, а не про процесс.

## Что должен уметь

- **L3** — Понимает blameless-принцип; читает чужие постмортемы без негативных коннотаций. Не задаёт вопросов «кто это сделал».
- **L4** — Участвует в постмортеме как факт-репортёр; формулирует **факты, не интерпретации** («сервис вернул 503» вместо «X не справился»).
- **L5** — Фасилитирует постмортем; проводит timeline, выявляет contributing factors, удерживает фокус на системе, а не людях.
- **L6+** — Строит культуру постмортемов в команде/организации. Нормализует разбор и обучение через ошибки. Защищает blameless-принцип от давления «найти виноватого» сверху.

## Материалы

### Книги

- Betsy Beyer et al. — **Site Reliability Engineering** (O'Reilly, 2016), глава 15 «Postmortem Culture: Learning from Failure». [sre.google/sre-book/postmortem-culture](https://sre.google/sre-book/postmortem-culture/).

### Статьи и доклады

- John Allspaw — **[Blameless PostMortems and a Just Culture](https://www.etsy.com/codeascraft/blameless-postmortems/)**. Классическая статья Etsy 2012 года, до сих пор актуальна.
- Sidney Dekker — **[Just Culture](https://sidneydekker.com/just-culture/)**. Книга/фреймворк психобезопасности в высокорисковых отраслях, на которой строится SRE-постмортем.
- John Allspaw — **[Each Necessary, But Only Jointly Sufficient](https://link.springer.com/article/10.1007/s10111-011-0185-4)**. Paper о том, почему «root cause» — это упрощение, и почему контрибутирующие факторы важнее одной «причины».

## Best practices

- **Blame направлен на систему, не на человека.** Правильный вопрос: «Почему эта система **позволила** ошибку?» Неправильный: «Кто допустил ошибку?». Из первого следуют action items, из второго — увольнения.
- **Психологическая безопасность — предпосылка blameless.** Без неё blameless становится театром: люди формально говорят «мы никого не виним», но реально боятся фактов. Если в команде нет безопасности, постмортем не работает.
- **Action items с владельцем и дедлайном.** Иначе постмортем — групповая терапия без следствий. Через полгода список action items без выполнения убивает доверие к ритуалу.

## Связанные листья

- **[Blameless Postmortem](/The-Way-of-SRE/leaves/practices/blameless-postmortem/)** — ритуал, опирающийся на эту культурную норму.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — постмортем — то, что происходит **после** incident response.
- **[SLO / Budget Review](/The-Way-of-SRE/leaves/culture/slo-budget-review/)** — постмортемы выявляют конкретные источники бюджет-сжигания.
