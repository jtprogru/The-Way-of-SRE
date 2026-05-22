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

Если у меня в команде кто-то делает `kubectl apply` напрямую в prod — это операционный инцидент с постмортемом, а не «срочно поправил». GitOps — это не «удобство», а **дисциплина**: git как источник истины, controller в кластере непрерывно сводит реальное состояние с git. Click-ops в проде — несовместимая с GitOps практика. Соседний лист к [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/) под L1 `Configuration Management`; различие чёткое: **IaC = код описывает инфраструктуру**, **GitOps = git как источник + автоматическое непрерывное сведение**.

## Что должен уметь

Главный навык на уровне L4 — bootstrap'ить GitOps для нового сервиса так, чтобы он работал без ручного вмешательства. Это значит: написать `Application` (Argo CD) или `Kustomization` (Flux) manifest правильно, настроить sync policy (manual / auto), self-heal, prune. Я регулярно вижу команды, у которых GitOps стоит, но половина сервисов — в `OutOfSync`, потому что bootstrap делался «впопыхах» и self-heal не включён.

- **L3** — Понимает разницу push-based (CI применяет) и pull-based (controller сам подтягивает); находит desired-state repo для своего сервиса; знает, где смотреть статус деплоя.
- **L3** — Делает изменения через PR в GitOps-repo; понимает, что rollback = git revert; не делает `kubectl apply` напрямую вручную.
- **L4** — Bootstrap'ает GitOps для нового сервиса: пишет ArgoCD `Application` или Flux `Kustomization` manifest; настраивает sync policy, self-heal, prune.
- **L4** — Диагностирует sync issues: drift в `Application` status, ошибки apply, ImagePullBackOff после nightly image rebuild; использует Argo CD UI / `flux get` / `kubectl describe` + events.
- **L5** — Проектирует структуру repos: разделение application code repo и config repo; environment overlays (Kustomize bases + overlays per env, или Helm values per env); app-of-apps или ApplicationSet для управления множеством apps.
- **L5** — Реализует secrets workflow в GitOps: Sealed Secrets / External Secrets Operator / SOPS; никогда plain secrets в репозитории.
- **L5** — Интегрирует progressive delivery: Argo Rollouts поверх Argo CD или Flagger поверх Flux. Canary / blue-green выполняются GitOps-нативно — promotion через PR.
- **L6+** — Multi-cluster GitOps strategy: hub-spoke, fan-out через ApplicationSet или Flux Kustomization-targets, regional fail-over для критичных систем.
- **L6+** — Governance / policy: who can change what через CODEOWNERS + branch protection; policy enforcement через Kyverno / OPA Gatekeeper / Argo CD CMP; audit retention под compliance.

## Материалы

### Книги и фреймворки

- **[OpenGitOps Principles](https://opengitops.dev/)** (CNCF). Канонические 4 принципа GitOps (Declarative / Versioned and Immutable / Pulled Automatically / Continuously Reconciled). Короткий, авторитетный — основа любой адаптации GitOps.

### Документация инструментов

- **[Argo CD Documentation](https://argo-cd.readthedocs.io/en/stable/)**. Declarative GitOps continuous delivery; поддержка Kustomize / Helm / Jsonnet / plain YAML; multi-cluster + RBAC + SSO + audit trails. По моим наблюдениям, стандарт enterprise.
- **[Flux](https://fluxcd.io/)** (CNCF Graduated). GitOps семейство для Kubernetes; pull-based, minimal privileges design, multi-tenancy через native RBAC. Альтернатива Argo CD; чаще выбирают команды, ценящие minimal pull architecture и tight k8s-native integration.

### Инструменты

- **[Argo CD](https://argo-cd.readthedocs.io/en/stable/)** — controller + UI; canonical выбор для команд с visual ops team и multi-cluster.
- **[Flux](https://fluxcd.io/)** — controller; CNCF Graduated; tight k8s-native, минимум moving parts; стандарт для self-hosted и multi-tenant сценариев.
- **[Argo Rollouts](https://argoproj.github.io/argo-rollouts/)** — progressive delivery поверх Argo CD: canary с SLI-driven gates, automated rollback.
- **[Flagger](https://flagger.app/)** — progressive delivery поверх Flux: canary / A/B / blue-green через service mesh (Istio / Linkerd).
- **[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)**, **[External Secrets Operator](https://external-secrets.io/latest/)**, **[SOPS](https://github.com/getsops/sops)** — secrets в GitOps-flow.
- **Policy enforcement** — **Kyverno**, **OPA Gatekeeper**, **Argo CD CMP** — compliance / security checks в pipeline до apply.

## Best practices

**Короткие правила:**

- **Git = single source of truth, никаких `kubectl apply` напрямую.** Через минуту controller обнаружит drift и откатит ручное изменение (если self-heal = true) или зафиксирует drift в UI. Click-ops в проде = операционный инцидент с постмортемом, а не «срочно поправил».
- **Rollback = git revert, не «руками».** `kubectl edit` в инциденте работает на 5 минут, потом controller возвращает старое из git. Правильно: `git revert` PR → controller подтягивает revert → изменение откатано atomically с audit trail.
- **Secrets никогда в plain виде в git, даже в private repo.** Base64-encoded secret в git — «оно же encoded» — не шифрование; любой с read access на repo видит секрет. Sealed Secrets / External Secrets / SOPS — единственный безопасный путь.

Подробнее:

**Разделять application code repo и config repo (или хотя бы environments).** Код приложения и desired state в одном repo с одним PR-flow смешивают изменения «деплой» и «фича»; отдельный rollback невозможен. Норма: код приложения → CI собирает image → updates image tag в config repo через bot; config repo — desired state, ArgoCD/Flux его подтягивают. Я наблюдаю чёткое разделение между зрелыми GitOps-командами по этому критерию: те, у кого один repo, рано или поздно упираются в проблему смешанных rollback'ов.

**Drift detection включён и мониторится.** «Drift где-то отображается, но никто не смотрит» — типичная ситуация. GitOps controller покажет drift status, но без alert на длительный drift его никто не заметит — пока не наступит инцидент. Alert на `Application status != Synced` или `OutOfSync` дольше N минут — обязательный.

**Bootstrapping самого GitOps в Git (app-of-apps / GitOps engine in GitOps).** ArgoCD/Flux установлен kubectl, конфиг controller нигде не зафиксирован — при DR (lost cluster) восстановление руками. Правильно: ArgoCD сам управляется через ArgoCD `Application` (app-of-apps), bootstrap через git → один command поднимает controller и все apps. Это базовая дисциплина, которую часто откладывают «на потом».

**Progressive delivery интегрирована, а не отдельно.** GitOps по умолчанию выкатывает изменения атомарно — без canary. Argo Rollouts + Argo CD или Flagger + Flux дают canary / health gate / automated rollback нативно — promotion через PR. По моим наблюдениям, команды, у которых progressive delivery «отдельно от GitOps», заканчивают с дублирующимися механизмами rollout и хрупкой склейкой.

## Связанные листья

- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC = код описывает инфраструктуру; GitOps = git как источник + reconciliation. Один может работать без другого, на практике вместе.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — canary / blue-green / feature flags. Argo Rollouts (с ArgoCD) и Flagger (с Flux) — основные GitOps-нативные tools.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — secrets workflow в GitOps-flow: never plain в repo, всегда через Sealed Secrets / External Secrets / SOPS.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит ссылку на GitOps Application и repo; owner отвечает за PR-flow.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — выбор GitOps tooling (Argo CD vs Flux), структуры repos, secret-workflow — типичные ADR.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — emergency rollback через git revert + Argo CD sync; mitigation pattern.

## Открытые вопросы

- **App of Apps Pattern** *(TBD)* — детальная подтема ArgoCD: один root Application управляет другими; trade-offs с ApplicationSet.
- **Multi-cluster GitOps strategies** *(TBD)* — hub-spoke vs fan-out vs federated; relevant при ≥ 5 кластеров.
- **Policy as Code в GitOps** *(TBD)* — Kyverno / OPA / Argo CD CMP — соседняя практика; здесь как best practice, отдельный scope как лист.
- **Drift Remediation Policy** — self-heal vs manual sync vs alert-only; trade-offs (auto-heal opaque в инциденте vs manual delay recovery).
