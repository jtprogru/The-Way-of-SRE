---
title: Backup & Restore
description: Резервное копирование с проверенным восстановлением — без regular restore-test backup'а нет
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Database Reliability / Backup & Restore
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** On Demand
- **Статус:** draft
:::

Простое правило, которое я повторяю чаще всего на ревью: **backup, который никто никогда не восстанавливал, не существует**. На бумаге он есть. В архиве — какие-то данные. Но пока кто-то фактически не достал его и не прогнал восстановление — это не backup, это надежда. Лист — про то, как превратить надежду в гарантию. Главная практика внутри L1 `Database Reliability`; соседи (Replication & Failover, Schema Migration Patterns, DB Performance Tuning) — в открытых вопросах.

## Что должен уметь

Главный навык на уровне L5 — превратить restore-test из task в ritual. Я регулярно встречаю команды, в которых restore-drill «сделали в прошлом году, тогда работало». Через год environment изменился, ключи ротированы, runbook устарел, а главное — engineer, который делал прошлый раз, в другой команде. Restore-test ценен **периодичностью**, не разовостью.

- **L3** — Различает RPO (сколько данных потерять допустимо) и RTO (сколько времени на восстановление); знает, где backups для его сервиса и кто их owner.
- **L3** — Находит backup конкретного сервиса; может выполнить базовый restore по существующему runbook в staging.
- **L4** — Определяет RPO/RTO для своего сервиса исходя из business-требований; фиксирует в SLO-документе сервиса; согласует с product-командой.
- **L4** — Верифицирует backup'ы регулярным restore-test'ом в staging (минимум раз в квартал); фиксирует MTTR теста; проблемы → ticket с дедлайном.
- **L5** — Проектирует backup strategy: full / incremental / log-shipping cadence, retention policy (с учётом регуляторики), encryption (KMS), cross-region replication для DR.
- **L5** — Автоматизирует restore drill как ritual: рандомная неделя в квартал — restore в изолированном окружении, измеряется MTTR.
- **L5** — Реализует point-in-time recovery (PITR) для источников, которые это поддерживают (PostgreSQL WAL archiving, MySQL binlog, MongoDB oplog, S3 versioning); понимает trade-off cost vs RPO.
- **L6+** — Проектирует disaster recovery strategy для org: multi-region restore, RTO targets для критичных систем, runbook на DR-сценарий (потеря всего региона), regulatory compliance.
- **L6+** — Балансирует backup strategy с cost и compliance: storage tiering (hot → cold → archive), retention policy с явным cleanup, encryption-at-rest с rotation, audit access logging.

## Материалы

### Книги

- Raymond Blum, Rhandeev Singh — **[Site Reliability Engineering](https://sre.google/sre-book/data-integrity/)** (O'Reilly, 2016), глава 26 «Data Integrity: What You Read Is What You Wrote». База: канонический Google SRE подход — три уровня защиты (soft deletion, backups with recovery methods, early detection); тезис «secret to superior data integrity is proactive detection and rapid repair and recovery».

### Статьи

- **[Twelve-Factor App](https://12factor.net/)**, фактор IV «Backing Services». Трактовка баз и хранилищ как attached resources; пересечение с backup в дискуссии о disposability и portability.
- **[GitLab database outage 2017-01-31](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/)**. См. ниже в Best practices — главный публичный кейс по теме.

### Инструменты

- **Cloud-native backup managed services** — **AWS Backup**, **GCP Backup and DR**, **Azure Backup**: для managed-баз (RDS, Cloud SQL, Cosmos DB) дают PITR / cross-region / encryption из коробки. По моим наблюдениям, это первый выбор для команд внутри одного cloud — низкий integration overhead.
- **DB-native dumps + log archiving** — `pg_dump` + WAL archiving (PostgreSQL), `mysqldump` + binlog (MySQL), `mongodump` + oplog (MongoDB). Базовый паттерн self-managed восстановления.
- **[Velero](https://velero.io/)** — open-source backup и DR для Kubernetes-кластера: cluster resources + persistent volumes. Стандарт для k8s команд.
- **[restic](https://restic.net/)** — современный backup tool для файлов и volumes с client-side encryption, deduplication, многими backends (S3 / Backblaze / GCS / SFTP). Часто берут для self-hosted сценариев.
- **Borg / Bacula** — традиционные backup-системы для on-prem; Borg популярен в HPC и self-hosted set-up'ах.
- **Storage tiering** — S3 + S3 Glacier / Glacier Deep Archive (AWS), Coldline / Archive (GCS), Archive Tier (Azure Blob). Retention с автоматическим переводом старых backup'ов в холодный класс — стандартная практика.

## Best practices

**GitLab database outage 31 января 2017** — главный публичный кейс к этому листу. У GitLab было **пять** backup-механизмов одновременно (pg_dump, LVM snapshot, Azure backup, S3 snapshot, replicas). Когда понадобилось восстанавливаться — четыре из пяти не работали или содержали данные старше 24 часов. Один работающий S3 snapshot восстановил большинство, но 6 часов данных были потеряны. Главный урок не «нужно иметь много backup-механизмов» (у них было пять и не помогло), а «**каждый из них должен быть проверен реальным restore**». GitLab публично признал, что ни один из пяти backup-механизмов никогда не прогонялся через полный restore-test. Если читаете это и впервые сталкиваетесь с темой — сначала туда, потом сюда.

**Короткие правила:**

- **Untested backup ≠ backup.** Backup, который никто никогда не восстанавливал, существует только на бумаге: corruption в архивах, изменённый формат БД, отсутствие нужных ключей шифрования, неправильный access — всё это всплывает только в момент реального восстановления, когда уже поздно. Restore-test минимум раз в квартал — норма.
- **Off-site / cross-region копия обязательна.** Backup в том же регионе / той же зоне доступности, что primary, не защищает от регионального outage или физической аварии. Минимум — backup в другом регионе того же cloud; для критичных систем — копия off-cloud (другой провайдер / on-prem) для защиты от cloud-level incidents (account compromise, billing disputes).
- **Encryption at rest + access audit обязательны.** Backup — это **snapshot всей prod-БД с user PII / payment data / secrets**; компрометация backup-bucket эквивалентна компрометации БД. KMS-encryption с key rotation, IAM access по принципу least-privilege, audit log каждого access — обязательное условие compliance (SOC2, PCI, GDPR).

Подробнее:

**RPO/RTO явные, не «максимально часто».** Vague targets «делаем backup'ы каждый день, восстановимся быстро» не позволяют ни проектировать backup strategy, ни проверять достижение цели. RPO/RTO определяются исходя из business-требований: часы простоя × revenue impact (если они известны), пользовательский ущерб от потери N часов данных. Фиксируются в SLO-документе сервиса, пересматриваются регулярно. Без явных чисел любая backup-strategy — это «выглядит достаточно».

**Restore drills с измеряемым MTTR — ритуал, а не «когда-нибудь».** «Мы делали restore-test год назад, тогда работало» — частая фраза, которую я слышу. Через год environment изменился, нужные тулзы не установлены, ключи ротированы, runbook устарел, а главное — engineer, который тогда делал, в другой команде. Регулярные drills (квартал — норма) с измерением MTTR от detect → restore → service-back: эти числа — реальные RTO. Всё остальное — wishful thinking.

**Restore procedure в runbook, не «помнит Вася».** Знание процедуры restore у одного senior — типичный риск, который проявляется в худший момент: senior в отпуске, в command line ничего не работает, через 6 месяцев он сам не помнит точные шаги. Runbook на restore — one-page checklist с конкретными командами, env переменными, expected output на каждом шаге. Тестируется в каждом drill: engineer, впервые делающий drill, должен пройти runbook без помощи. Если не получилось — runbook сломан, не engineer.

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog содержит backup-метаданные сервиса: где хранится, кем owner, RPO/RTO, ссылку на restore runbook. Без catalog на момент disaster engineers ищут backup'ы вслепую.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook на restore — обязательный артефакт; качество runbook определяет MTTR в момент disaster.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — backup configuration (S3 buckets, IAM policies, KMS keys, schedules) сама описывается как IaC; восстановление из git как fallback для всего, что окружает backup-pipeline.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — data loss / corruption — отдельный класс инцидентов с собственным набором escalation paths.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — encryption keys для backup'ов сами должны управляться через Vault / KMS с rotation; компрометация key = потеря всех backup'ов, защищённых этим key.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — backup freshness — отдельный SLI («last successful backup ≤ N часов»); алертинг на пропавший backup — обязательный сигнал.

## Открытые вопросы

- **Replication & Failover** *(TBD)* — соседняя практика внутри `Database Reliability`: streaming replication (PostgreSQL / MySQL), automatic failover (Patroni / Orchestrator / managed-RDS Multi-AZ), split-brain prevention.
- **Schema Migration Patterns** *(TBD)* — expand-contract, dual-write, backfill, shadow read. Соседняя практика на стыке Database Reliability и Change Management.
- **DB Performance Tuning** *(TBD)* — index design, query plans, connection pooling, vacuum / compaction strategies.
- **Data Validation & Reconciliation** — soft deletion (упомянуто в SRE Book гл. 26), checksumming, periodic reconciliation между primary и replicas как защита от silent corruption.
- **GDPR / right to be forgotten compliance** — как удалять данные пользователя из всех backup'ов в соблюдение compliance, не теряя возможность restore. На стыке Database Reliability и Information Security.
