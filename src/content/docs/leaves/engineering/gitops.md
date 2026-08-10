---
title: GitOps
description: Pull-based reconciliation — git как источник истины desired state, controller в кластере непрерывно сводит
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Configuration Management / GitOps
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

Если у меня в команде кто-то делает `kubectl apply` напрямую в prod — это операционный инцидент с постмортемом, а не «срочно поправил». [GitOps](/The-Way-of-SRE/glossary/#gitops) — это не «удобство», а **дисциплина**: git как источник истины, controller в кластере непрерывно сводит реальное состояние с git. Click-ops в проде — несовместимая с GitOps практика. Соседний лист к [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/) под L1 `Configuration Management`; различие чёткое: **IaC = код описывает инфраструктуру**, **GitOps = git как источник + автоматическое непрерывное сведение**.

## Что должен уметь

Главный навык на уровне L4 — bootstrap'ить GitOps для нового сервиса так, чтобы он работал без ручного вмешательства. Это значит: написать `Application` (Argo CD) или `Kustomization` (Flux) manifest правильно, настроить sync policy (manual / auto), self-heal, prune. Я регулярно вижу команды, у которых GitOps стоит, но половина сервисов — в `OutOfSync`, потому что bootstrap делался «впопыхах» и self-heal не включён.

**L3**
- Понимает разницу push-based (CI применяет) и pull-based (controller сам подтягивает); находит desired-state repo для своего сервиса; знает, где смотреть статус деплоя.
- Делает изменения через PR в GitOps-repo; понимает, что rollback = git revert; не делает `kubectl apply` напрямую вручную.

**L4**
- Bootstrap'ает GitOps для нового сервиса: пишет ArgoCD `Application` или Flux `Kustomization` manifest; настраивает sync policy, self-heal, prune.
- Диагностирует sync issues: drift в `Application` status, ошибки apply, ImagePullBackOff после nightly image rebuild; использует Argo CD UI / `flux get` / `kubectl describe` + events.

**L5**
- Проектирует структуру repos: разделение application code repo и config repo; environment overlays (Kustomize bases + overlays per env, или Helm values per env); app-of-apps или ApplicationSet для управления множеством apps.
- Реализует secrets workflow в GitOps: Sealed Secrets / External Secrets Operator / SOPS; никогда plain secrets в репозитории.
- Интегрирует progressive delivery: Argo Rollouts поверх Argo CD или Flagger поверх Flux. Canary и blue-green едут внутри той же схемы — promotion через PR.

**L6+**
- Multi-cluster GitOps strategy: hub-spoke, fan-out через ApplicationSet или Flux Kustomization-targets, regional fail-over для критичных систем.
- Governance / policy: who can change what через CODEOWNERS + branch protection; policy enforcement через Kyverno / OPA Gatekeeper / Argo CD CMP; audit retention под compliance.

## Материалы

### Книги и фреймворки

- **[OpenGitOps Principles](https://opengitops.dev/)** (CNCF). Канонические 4 принципа GitOps (Declarative / Versioned and Immutable / Pulled Automatically / Continuously Reconciled). Короткий, авторитетный — основа любой адаптации GitOps.

### Документация инструментов

- **[Argo CD Documentation](https://argo-cd.readthedocs.io/en/stable/)**. Declarative GitOps continuous delivery; поддержка Kustomize / Helm / Jsonnet / plain YAML; multi-cluster + RBAC + SSO + журнал аудита. По моим наблюдениям, стандарт enterprise.
- **[Flux](https://fluxcd.io/)** (CNCF Graduated). Семейство контроллеров для Kubernetes: модель pull, минимум привилегий, multi-tenancy через штатный RBAC. Альтернатива Argo CD. По моим наблюдениям, к нему чаще приходят команды, которые ценят компактную архитектуру и близость к самому Kubernetes.

### Инструменты

- **[Argo CD](https://argo-cd.readthedocs.io/en/stable/)** — controller + UI; canonical выбор для команд с visual ops team и multi-cluster.
- **[Flux](https://fluxcd.io/)** — controller; CNCF Graduated; tight k8s-native, минимум moving parts; стандарт для self-hosted и multi-tenant сценариев.
- **[Argo Rollouts](https://argoproj.github.io/argo-rollouts/)** — progressive delivery поверх Argo CD: canary с SLI-driven gates, automated rollback.
- **[Flagger](https://flagger.app/)** — progressive delivery поверх Flux: canary / A/B / blue-green через service mesh (Istio / Linkerd).
- **[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)**, **[External Secrets Operator](https://external-secrets.io/latest/)**, **[SOPS](https://github.com/getsops/sops)** — secrets в GitOps-flow.
- **Policy enforcement** — **Kyverno**, **OPA Gatekeeper**, **Argo CD CMP** — compliance / security checks в pipeline до apply.

## Best practices

Git — единственный источник истины, и `kubectl apply` мимо него ломает всю конструкцию. Через минуту controller увидит расхождение и либо откатит ручную правку (если включён self-heal), либо оставит её висеть в UI как `OutOfSync`. Второй вариант хуже: изменение работает, но нигде не записано, и следующий, кто откроет репозиторий, увидит другую реальность. Click-ops в проде я разбираю как операционный инцидент с постмортемом, а не как «срочно поправил».

Откат делается через `git revert`, а не руками. `kubectl edit` в инциденте живёт ровно до следующей синхронизации: controller вернёт то, что лежит в git, и дежурный поймает ту же аварию второй раз, уже не понимая почему. Revert в виде PR откатывает изменение целиком и оставляет запись в журнале аудита — это и есть весь механизм отката, другого в GitOps нет.

Секреты не лежат в git в открытом виде даже в приватном репозитории. Base64 — не шифрование. «Оно же encoded» — самая частая отговорка, которую я слышу, а по факту любой с read access на репозиторий читает секрет как обычный текст, и ротировать после этого нужно всё, что там лежало. Sealed Secrets, External Secrets Operator и SOPS закрывают дыру, оставаясь внутри PR-процесса.

Код приложения и desired state лучше держать в разных репозиториях или хотя бы разводить окружения. Когда всё в одном месте и один PR-поток, изменение «выкатить фичу» и изменение «поменять конфиг деплоя» перемешиваются, и откатить только второе уже нельзя. Рабочая схема простая: CI собирает образ, бот обновляет тег в config repo, Argo CD или Flux подтягивают его оттуда. Зрелые команды я отличаю ровно по этому признаку; те, у кого один репозиторий на всё, рано или поздно упираются в смешанные откаты.

Drift detection стоит почти у всех. Смотрит на него почти никто. Controller честно покажет статус, но сама по себе эта панель бесполезная: расхождение живёт неделями и всплывает уже инцидентом, когда кто-то наконец спрашивает, почему в кластере не то, что в репозитории. Алерт на `Application status != Synced` дольше N минут превращает наблюдение в сигнал.

Сам GitOps тоже описывается в git. Если Argo CD или Flux ставились `kubectl`-ом руками, а конфигурация контроллера нигде не зафиксирована, то при потере кластера восстанавливать придётся по памяти — в тот единственный момент, когда памяти доверять нельзя. Лечится схемой app-of-apps: контроллер управляет сам собой через собственный `Application`, и bootstrap сводится к одной команде. Откладывают это постоянно. До первого DR.

Progressive delivery имеет смысл встраивать в тот же поток, а не рядом с ним. По умолчанию изменение едет атомарно, без canary; Argo Rollouts с Argo CD или Flagger с Flux добавляют канареечный выкат, health gate и автоматический откат, оставляя promotion в виде PR. Команды, у которых выкат по частям живёт отдельно от git, я вижу регулярно, и заканчивается это одинаково — два механизма rollout и хрупкая склейка между ними.

## Связанные листья

- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC = код описывает инфраструктуру; GitOps = git как источник + reconciliation. Один может работать без другого, на практике вместе.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — canary / blue-green / feature flags. Argo Rollouts (с ArgoCD) и Flagger (с Flux) — основные инструменты, которые работают внутри самого потока git.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — secrets workflow в GitOps-flow: never plain в repo, всегда через Sealed Secrets / External Secrets / SOPS.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит ссылку на GitOps Application и repo; owner отвечает за PR-flow.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — выбор GitOps tooling (Argo CD vs Flux), структуры repos, secret-workflow — типичные ADR.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — emergency rollback через git revert + Argo CD sync; mitigation pattern.
- **[Containerization & Orchestration](/The-Way-of-SRE/leaves/engineering/container-orchestration/)** — Kubernetes — основной runtime для GitOps; ArgoCD/Flux синхронизируют git с состоянием кластера.

## Открытые вопросы

- **App of Apps Pattern** *(TBD)* — детальная подтема ArgoCD: один root Application управляет другими; trade-offs с ApplicationSet.
- **Multi-cluster GitOps strategies** *(TBD)* — hub-spoke vs fan-out vs federated; relevant при ≥ 5 кластеров.
- **Policy as Code в GitOps** *(TBD)* — Kyverno / OPA / Argo CD CMP — соседняя практика; здесь как best practice, отдельный scope как лист.
- **Drift Remediation Policy** — self-heal vs manual sync vs alert-only; trade-offs (auto-heal opaque в инциденте vs manual delay recovery).
