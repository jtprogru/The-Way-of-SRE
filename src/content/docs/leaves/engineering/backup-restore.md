---
title: Backup & Restore
description: Дисциплина резервного копирования и проверенного восстановления данных — RPO/RTO, регулярные restore-drills, off-site копии. Без верификации backup'а нет backup'а
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Database Reliability / Backup & Restore
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** On Demand
- **Статус:** draft
:::

Дисциплина резервного копирования и **проверенного восстановления** данных: явные RPO (Recovery Point Objective) и RTO (Recovery Time Objective), регулярные restore-drills, off-site / cross-region копии, encryption-at-rest, audit access. Главный принцип: **untested backup ≠ backup**. Replication защищает от железной аварии, но не от человеческой ошибки (`DROP TABLE`), corruption на уровне приложения или ransomware — только восстановленный из backup-копии тест даёт уверенность. Главная практика внутри L1 `Database Reliability`; соседние практики (Replication & Failover, Schema Migration Patterns, DB Performance Tuning, Connection Pooling) — в «Открытых вопросах».

## Что должен уметь

- **L3** — Различает RPO (сколько данных потерять допустимо) и RTO (сколько времени на восстановление); знает, где backups для его сервиса, кто их owner, на каком cloud-bucket / storage.
- **L3** — Находит backup конкретного сервиса; может выполнить базовый restore по существующему runbook'у в staging-окружении.
- **L4** — Определяет RPO/RTO для своего сервиса исходя из business-требований; фиксирует их в SLO-документе сервиса; согласует с product-командой.
- **L4** — Верифицирует backup'ы регулярным restore-test'ом в staging (минимум раз в квартал); фиксирует результат и MTTR теста; проблемы → ticket с дедлайном.
- **L5** — Проектирует backup strategy: full / incremental / log-shipping cadence, retention policy (с учётом регулятории), encryption (KMS), cross-region replication для DR.
- **L5** — Автоматизирует restore drill как ritual: рандомная неделя в квартал — выполняется restore в изолированном environment, измеряется MTTR, результат идёт в команду.
- **L5** — Реализует point-in-time recovery (PITR) для источников, которые это поддерживают (PostgreSQL WAL archiving, MySQL binlog, MongoDB oplog, S3 versioning); понимает trade-off cost vs RPO.
- **L6+** — Проектирует disaster recovery strategy для org: multi-region restore, RTO targets для критичных систем, runbook на DR-сценарий (потеря всего региона), regulatory compliance (GDPR right to be forgotten, PCI retention, финансовые требования).
- **L6+** — Балансирует backup strategy с cost и compliance: storage tiering (hot → cold → archive), retention policy с явным cleanup, encryption-at-rest с rotation, audit access logging.

## Материалы

### Книги

- Raymond Blum, Rhandeev Singh — **[Site Reliability Engineering](https://sre.google/sre-book/data-integrity/)** (O'Reilly, 2016), глава 26 «Data Integrity: What You Read Is What You Wrote». База: канонический Google SRE подход к data integrity — три уровня защиты (soft deletion, backups with recovery methods, early detection); тезис «secret to superior data integrity is proactive detection and rapid repair and recovery».

### Статьи

- **[Twelve-Factor App](https://12factor.net/)**, фактор IV «Backing Services». Дополнительно: трактовка баз и хранилищ как attached resources; пересечение с backup в дискуссии о disposability и portability.

### Инструменты

- **Cloud-native backup managed services** — **AWS Backup**, **GCP Backup and DR**, **Azure Backup**: для managed-баз (RDS, Cloud SQL, Cosmos DB) даёт PITR / cross-region / encryption из коробки; первый выбор для команд внутри одного cloud.
- **DB-native dumps + log archiving** — `pg_dump` + WAL archiving (PostgreSQL), `mysqldump` + binlog (MySQL), `mongodump` + oplog (MongoDB). Базовый паттерн self-managed восстановления, на котором строятся все остальные.
- **[Velero](https://velero.io/)** — open-source backup и DR для Kubernetes-кластера: cluster resources + persistent volumes; стандарт для k8s команд.
- **[restic](https://restic.net/)** — современный backup tool для файлов / volumes с client-side encryption, deduplication, многими backends (S3 / Backblaze / GCS / SFTP). Подходит для self-hosted scenarios.
- **Borg / Bacula** — традиционные backup-системы для on-prem; Borg популярен в HPC и self-hosted set-up'ах.
- **Storage tiering** — S3 + S3 Glacier / Glacier Deep Archive (AWS), Coldline / Archive (GCS), Archive Tier (Azure Blob). Retention policy с автоматическим переводом старых backup'ов в холодный класс хранения — стандартная практика.

## Best practices

- **Untested backup ≠ backup.** Антипаттерн: «у нас есть backup'ы, всё в порядке». Backup, который никто никогда не восстанавливал, существует только на бумаге: corruption в архивах, изменённый формат БД, отсутствие нужных ключей шифрования, неправильный access — всё это всплывает только в момент реального восстановления, когда уже поздно. Restore-test минимум раз в квартал — норма; не сделанный restore-test — операционный риск с явным owner'ом.
- **RPO/RTO явные, не «максимально часто».** Антипаттерн: vague targets «делаем backup'ы каждый день, восстановимся быстро». Без явных чисел невозможно проектировать backup strategy и нельзя проверить, что цель достигается. RPO/RTO определяются исходя из business-требований (часы простоя × revenue impact); зафиксированы в SLO-документе; пересматриваются регулярно вместе с SLO.
- **Off-site / cross-region копия обязательна.** Антипаттерн: backup'ы лежат в том же регионе / той же зоне доступности, что primary. Региональный outage / физическая авария → потеря и primary и backup одновременно. Минимум — backup в другом регионе того же cloud; для критичных систем — копия off-cloud (другой провайдер / on-prem) для defence-in-depth от cloud-level incidents (account compromise, billing disputes).
- **Encryption at rest + access audit обязательны.** Антипаттерн: backup'ы в plain text, доступ open-bucket'ом. Backup'ы — это **snapshot всей вашей prod-БД с user PII / payment data / secrets**; компрометация backup-bucket'а эквивалентна компрометации БД. KMS-encryption (с key rotation), IAM access на принципе least-privilege, audit log каждого access — норма; обязательное условие compliance (SOC2, PCI, GDPR).
- **Restore drills с измеряемым MTTR — ритуал, а не «когда-нибудь».** Антипаттерн: «мы делали restore-test год назад, тогда работало». Через год environment изменился, нужные тулзы не установлены, ключи ротированы, runbook устарел. Регулярные drills (квартал — норма) с измерением MTTR от detect → restore → service-back: эти числа — реальные RTO; всё остальное — wishful thinking.
- **Restore procedure в runbook'е, не «помнит Вася».** Антипаттерн: процедуру restore знает один senior, который сейчас в отпуске. Через 6 месяцев он не помнит точные шаги. Runbook на restore — one-page checklist с конкретными командами, environment variables, expected output на каждом шаге; тестируется в каждом drill'е (engineer впервые делающий drill должен пройти runbook без помощи).

## Связанные листья

- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — service catalog содержит backup-метаданные сервиса: где хранится, кем owner, RPO/RTO, ссылку на restore runbook; без catalog'а на момент disaster engineers ищут backup'ы вслепую.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook на restore — обязательный артефакт; качество runbook'а определяет MTTR в момент disaster'а. Без него — паника и потеря часов.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — backup configuration (S3 buckets, IAM policies, KMS keys, schedules) сама описывается как IaC; восстановление из git как fallback для всего, что окружает backup-pipeline.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — data loss / corruption — отдельный класс инцидентов с собственным набором escalation paths; restore-decision требует явного approval'а stakeholder'а.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — encryption keys для backup'ов сами должны управляться через Vault / KMS с rotation; компрометация key = потеря всех backup'ов, защищённых этим key.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — backup freshness — отдельный SLI («last successful backup ≤ N часов»); алертинг на пропавший backup — обязательный сигнал, отдельный от приложений.

## Открытые вопросы

- **Replication & Failover** *(TBD)* — соседняя практика внутри `Database Reliability` L1: streaming replication (PostgreSQL / MySQL), automatic failover (Patroni / Orchestrator / managed-RDS Multi-AZ), split-brain prevention, quorum / consensus (Raft). Защищает от железа, дополняет backup (защищающий от человека / corruption).
- **Schema Migration Patterns** *(TBD)* — уже упоминалось в open questions у `Infrastructure as Code` и `Progressive Delivery`: expand-contract, dual-write, backfill, shadow read. Соседняя практика на стыке Database Reliability и Change Management.
- **DB Performance Tuning** *(TBD)* — отдельная подтема: index design, query plans, connection pooling, vacuum / compaction strategies. Самостоятельный scope; самостоятельный лист или раздел под `Database Reliability` L1.
- **Connection Pooling** — pgBouncer / RDS Proxy / connection pool в приложении — частный, но важный topic под Performance Tuning.
- **Data Validation & Reconciliation** — soft deletion (упомянуто в SRE Book гл. 26), checksumming, periodic reconciliation между primary и replicas как защита от silent corruption. Самостоятельная подтема.
- **GDPR / right to be forgotten compliance** — конкретная регулятивная задача поверх backup retention: как удалять данные пользователя из всех backup'ов в соблюдение compliance, не теряя возможность restore. На стыке Database Reliability и `Information Security`.
