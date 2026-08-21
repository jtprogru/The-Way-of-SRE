---
title: Backup & Restore
description: Резервное копирование с проверенным восстановлением — без regular restore-test backup'а нет
sfia: [3, 4, 5, 6]
status: draft
---

Простое правило, которое я повторяю чаще всего на ревью: **[backup](/The-Way-of-SRE/glossary/#backup), который никто никогда не восстанавливал, не существует**. На бумаге он есть. В архиве — какие-то данные. Но пока кто-то фактически не достал его и не прогнал восстановление — это не backup, это надежда. Лист — про то, как превратить надежду в гарантию. Главная практика внутри L1 `Database Reliability`; соседи (Replication & Failover, Schema Migration Patterns, DB Performance Tuning) — в открытых вопросах.

## Что должен уметь

Главный навык на уровне L5 — превратить restore-test из task в ritual. Я регулярно встречаю команды, в которых restore-drill «сделали в прошлом году, тогда работало». Через год environment изменился, ключи ротированы, runbook устарел, а главное — инженер, который делал прошлый раз, в другой команде. Restore-test ценен **периодичностью**, не разовостью.

**L3**
- Различает RPO (сколько данных потерять допустимо) и RTO (сколько времени на восстановление); знает, где backups для его сервиса и кто их owner.
- Находит backup конкретного сервиса; может выполнить базовый restore по существующему runbook в staging.

**L4**
- Определяет RPO/RTO для своего сервиса исходя из требований бизнеса; фиксирует в SLO-документе сервиса; согласует с продуктовой командой.
- Верифицирует backup'ы регулярным restore-test'ом в staging (минимум раз в квартал); фиксирует MTTR теста; проблемы → ticket с дедлайном.

**L5**
- Проектирует backup strategy: full / incremental / log-shipping cadence, retention policy (с учётом регуляторики), encryption (KMS), cross-region replication для DR.
- Автоматизирует restore drill как ritual: рандомная неделя в квартал — restore в изолированном окружении, измеряется MTTR.
- Реализует point-in-time recovery (PITR) для источников, которые это поддерживают (PostgreSQL WAL archiving, MySQL binlog, MongoDB oplog, S3 versioning); понимает trade-off cost vs RPO.

**L6+**
- Проектирует disaster recovery strategy для org: multi-region restore, RTO targets для критичных систем, runbook на DR-сценарий (потеря всего региона), regulatory compliance.
- Балансирует backup strategy с cost и compliance: storage tiering (hot → cold → archive), retention policy с явным cleanup, encryption-at-rest с rotation, audit access logging.

## Материалы

### Книги

- Raymond Blum, Rhandeev Singh — **[Site Reliability Engineering](https://sre.google/sre-book/data-integrity/)** (O'Reilly, 2016), глава 26 «Data Integrity: What You Read Is What You Wrote». База: канонический Google SRE подход — три уровня защиты (soft deletion, backups with recovery methods, early detection); тезис «secret to superior data integrity is proactive detection and rapid repair and recovery».

### Статьи

- **[Twelve-Factor App](https://12factor.net/)**, фактор IV «Backing Services». Трактовка баз и хранилищ как attached resources; пересечение с backup в дискуссии о disposability и portability.
- **[GitLab database outage 2017-01-31](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/)**. См. ниже в Best practices — главный публичный кейс по теме.

### Инструменты

- **Cloud-native backup managed services** — **AWS Backup**, **GCP Backup and DR**, **Azure Backup**: для управляемых баз (RDS, Cloud SQL, Cosmos DB) дают PITR / cross-region / encryption из коробки. По моим наблюдениям, это первый выбор для команд внутри одного cloud — низкий integration overhead.
- **DB-native dumps + log archiving** — `pg_dump` + WAL archiving (PostgreSQL), `mysqldump` + binlog (MySQL), `mongodump` + oplog (MongoDB). Базовый паттерн self-managed восстановления.
- **[Velero](https://velero.io/)** — open-source backup и DR для кластера Kubernetes: cluster resources + persistent volumes. Стандарт для k8s команд.
- **[restic](https://restic.net/)** — современный backup tool для файлов и volumes с client-side encryption, deduplication, многими backends (S3 / Backblaze / GCS / SFTP). Часто берут для self-hosted сценариев.
- **Borg / Bacula** — традиционные системы бэкапа для on-prem; Borg популярен в HPC и self-hosted set-up'ах.
- **Storage tiering** — S3 + S3 Glacier / Glacier Deep Archive (AWS), Coldline / Archive (GCS), Archive Tier (Azure Blob). Retention с автоматическим переводом старых backup'ов в холодный класс — стандартная практика.

## Best practices

**GitLab database outage 31 января 2017** — главный публичный кейс к этому листу. У GitLab было **пять** механизмов бэкапа и репликации одновременно (pg_dump, LVM snapshot, Azure disk snapshot, выгрузка в S3, репликация). Когда понадобилось восстанавливаться, выяснилось, что не работает ни один: pg_dump молча падал из-за несовпадения версий, выгрузки в S3 оказались пустыми, снапшоты дисков для этого сервера не делались, репликация была сломана самой аварией. Спасла случайность — LVM-снапшот, снятый шестью часами ранее для нужд staging, не как бэкап. Данные за эти шесть часов потеряны безвозвратно. Главный урок не «нужно иметь много механизмов бэкапа» (их было пять и не помогло), а «**каждый из них должен быть проверен реальным restore**»: пять непроверенных копий дают ровно ноль гарантий, и это самый дорогой способ узнать, что ноль — это ноль. Если читаете это и впервые сталкиваетесь с темой — сначала туда, потом сюда.

Отсюда три правила, которые я считаю нижней планкой. Первое: непроверенный backup — не backup. Corruption в архивах, изменившийся формат БД, потерянные ключи шифрования, неправильные права доступа — всё это всплывает ровно в момент восстановления, когда времени разбираться уже нет. Раз в квартал прогнать restore — норма, а не героизм.

Второе: копия обязана лежать не там, где primary. Backup в той же зоне доступности не спасает ни от регионального outage, ни от физической аварии в датацентре. Минимум — другой регион того же облака. Для критичных систем — копия вообще вне облака, у другого провайдера или on-prem, потому что account compromise и billing dispute убивают доступ к данным не хуже пожара.

Третье: шифрование at rest и аудит доступа. Backup — это snapshot всей prod-БД с user PII, payment data и секретами, так что компрометация bucket'а с бэкапами равна компрометации самой базы. KMS с ротацией ключей, доступ по принципу наименьших привилегий, audit log на каждое обращение. Для SOC2, PCI и GDPR это не рекомендация, а условие.

**RPO/RTO явные, не «максимально часто».** Формулировка «делаем backup'ы каждый день, восстановимся быстро» не даёт ни спроектировать стратегию, ни проверить, достигнута ли цель. Числа берутся из требований бизнеса: часы простоя × revenue impact, если он известен, плюс пользовательский ущерб от потери N часов данных. Фиксируются в SLO-документе сервиса и пересматриваются. Без явных чисел любая стратегия бэкапа — это «выглядит достаточно».

**Restore drills с измеряемым MTTR — ритуал, а не «когда-нибудь».** «Мы делали restore-test год назад, тогда работало» — фраза, которую я слышу регулярно. За год окружение уехало, нужные инструменты не установлены, ключи ротированы, runbook устарел, а инженер, который тогда всё делал, работает в другой команде. Квартальный drill с измерением MTTR от detect до service-back даёт настоящие RTO. Всё остальное — благие надежды.

**Restore procedure в runbook, не «помнит Вася».** Процедура, которая живёт в голове одного старшего инженера, проявляет себя в худший момент: он в отпуске, командная строка ведёт себя не так, а через полгода он и сам не вспомнит точные шаги. Runbook на restore — одна страница с конкретными командами, переменными окружения и ожидаемым выводом на каждом шаге. Проверяется он в каждом drill, и проверка простая: инженер, который делает drill впервые, проходит runbook без подсказок. Не прошёл — сломан runbook, не инженер.

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/culture/service-ownership/)** — service catalog содержит данные о бэкапах сервиса: где хранится, кем owner, RPO/RTO, ссылку на restore runbook. Без catalog на момент disaster инженеры ищут backup'ы вслепую.
- **[Runbooks](/The-Way-of-SRE/culture/runbooks/)** — runbook на restore — обязательный артефакт; качество runbook определяет MTTR в момент disaster.
- **[Infrastructure as Code](/The-Way-of-SRE/engineering/infrastructure-as-code/)** — backup configuration (S3 buckets, IAM policies, KMS keys, schedules) сама описывается как IaC; восстановление из git как fallback для всего, что окружает backup-pipeline.
- **[Incident Response](/The-Way-of-SRE/practices/incident-response/)** — data loss / corruption — отдельный класс инцидентов с собственным набором escalation paths.
- **[Secrets Management](/The-Way-of-SRE/practices/secrets-management/)** — encryption keys для backup'ов сами должны управляться через Vault / KMS с rotation; компрометация key = потеря всех backup'ов, защищённых этим key.
- **[SLI-based Alerting](/The-Way-of-SRE/engineering/sli-based-alerting/)** — backup freshness — отдельный SLI («last successful backup ≤ N часов»); алертинг на пропавший backup — обязательный сигнал.
- **[DR Policy & Stakeholders](/The-Way-of-SRE/culture/dr-policy/)** — без работающего backup-restore любая DR policy — обещание; без DR policy backup-restore не имеет org-level правил применения. Этот лист — per-service технический слой; DR Policy — org-level governance.

## Открытые вопросы

Три соседние практики внутри `Database Reliability` пока не написаны. **Replication & Failover** *(TBD)* — streaming replication в PostgreSQL и MySQL, automatic failover через Patroni, Orchestrator или Multi-AZ у управляемых RDS, защита от split-brain. **Schema Migration Patterns** *(TBD)* — expand-contract, dual-write, backfill, shadow read; это уже стык с Change Management. **DB Performance Tuning** *(TBD)* — index design, query plans, connection pooling, стратегии vacuum и compaction.

Отдельно висит **Data Validation & Reconciliation**: soft deletion (упомянуто в SRE Book гл. 26), checksumming, периодическая сверка primary с репликами как защита от silent corruption.

И самый неприятный вопрос — **GDPR и right to be forgotten**. Как удалить данные пользователя из всех бэкапов и не потерять способность восстановиться, я внятно не понимаю. Тема лежит на стыке Database Reliability и Information Security.
