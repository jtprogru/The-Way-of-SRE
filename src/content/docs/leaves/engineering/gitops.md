---
title: GitOps
description: Pull-based reconciliation модель — git как single source of truth desired state, controller в кластере непрерывно сводит actual state с declarative state из git
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** Configuration Management / GitOps
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Mandatory
- **Статус:** draft
:::

**Pull-based reconciliation** модель развёртывания: git репозиторий — **single source of truth** desired state, в кластере живёт controller (Argo CD / Flux), который непрерывно сравнивает actual state с git и применяет диффы автоматически. Соседний лист к [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/) под L1 `Configuration Management`; различие чёткое: **IaC = код описывает инфраструктуру**, **GitOps = git как источник + автоматическое непрерывное сведение**. IaC может применяться push-based (CI `terraform apply`); GitOps добавляет pull-механизм с continuous reconciliation и audit через git history.

## Что должен уметь

- **L3** — Понимает разницу push-based (CI применяет) и pull-based (controller сам подтягивает); находит desired-state repo для своего сервиса; знает, где смотреть статус деплоя в Argo CD / Flux UI.
- **L3** — Делает изменения через PR в GitOps-repo; понимает, что rollback = git revert; не делает `kubectl apply` напрямую вручную.
- **L4** — Bootstrap'ает GitOps для нового сервиса: пишет ArgoCD `Application` или Flux `Kustomization` manifest; настраивает sync policy (manual / auto), self-heal, prune.
- **L4** — Диагностирует sync issues: drift в `Application` status, ошибки apply, ImagePullBackOff после nightly image rebuild; использует Argo CD UI / `flux get` / `kubectl describe` + events.
- **L5** — Проектирует структуру repos: разделение application code repo и config repo; environment overlays (Kustomize bases + overlays per env, или Helm values per env); app-of-apps pattern или ApplicationSet (ArgoCD) для управления множеством apps.
- **L5** — Реализует secrets workflow в GitOps: Sealed Secrets / External Secrets Operator / SOPS; никогда plain secrets в репозитории, даже private. Secrets-references — в repo, расшифровка — в кластере.
- **L5** — Интегрирует progressive delivery: Argo Rollouts поверх Argo CD или Flagger поверх Flux. Canary / blue-green выполняются GitOps-нативно — promotion через PR в git, не ручным kubectl.
- **L6+** — Multi-cluster GitOps strategy: hub-spoke (одна управляющая control plane, множество target кластеров), fan-out через ApplicationSet или Flux Kustomization-targets, regional fail-over для критичных систем.
- **L6+** — Governance / policy: who can change what через GitHub CODEOWNERS + branch protection; policy enforcement через Kyverno / OPA Gatekeeper / Argo CD CMP; audit log = git history + ArgoCD audit, retention под compliance.

## Материалы

### Книги и фреймворки

- **[OpenGitOps Principles](https://opengitops.dev/)** (CNCF). База: канонические 4 принципа GitOps (Declarative / Versioned and Immutable / Pulled Automatically / Continuously Reconciled). Краткий, авторитетный source — основа любой адаптации GitOps в команде.

### Документация инструментов

- **[Argo CD Documentation](https://argo-cd.readthedocs.io/en/stable/)**. База: declarative GitOps continuous delivery tool для Kubernetes; поддержка Kustomize / Helm / Jsonnet / plain YAML; multi-cluster + RBAC + SSO + audit trails из коробки. Стандартный выбор enterprise команд.
- **[Flux](https://fluxcd.io/)** (CNCF Graduated). База: GitOps семейство для Kubernetes; pull-based, minimal privileges design, multi-tenancy через native RBAC. Альтернатива Argo CD; часто выбирается командами, ценящими minimal pull architecture и tighter k8s-native integration.

### Инструменты

- **[Argo CD](https://argo-cd.readthedocs.io/en/stable/)** — controller + UI; canonical выбор для команд с visual ops team и multi-cluster.
- **[Flux](https://fluxcd.io/)** — controller; CNCF Graduated; tight k8s-native, минимум moving parts; стандарт для self-hosted и multi-tenant сценариев.
- **[Argo Rollouts](https://argoproj.github.io/argo-rollouts/)** — progressive delivery поверх Argo CD: canary с SLI-driven gates, automated rollback.
- **[Flagger](https://flagger.app/)** — progressive delivery поверх Flux: canary / A/B / blue-green через service mesh (Istio / Linkerd).
- **[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)**, **[External Secrets Operator](https://external-secrets.io/latest/)**, **[SOPS](https://github.com/getsops/sops)** — secrets в GitOps-flow (см. лист `Secrets Management`).
- **Policy enforcement** — **Kyverno**, **OPA Gatekeeper**, **Argo CD CMP** — compliance / security checks в pipeline до apply.

## Best practices

- **Git = single source of truth, никаких `kubectl apply` напрямую.** Антипаттерн: «срочно поправил руками, потом запишу в git». Через минуту controller обнаружит drift и откатит ваше изменение (если self-heal = true) или зафиксирует drift в UI. Через час никто не помнит, что было сделано вручную. Чрезвычайный случай — `kubectl apply` в продакшене = операционный инцидент с постмортемом.
- **Разделять application code repo и config repo (или хотя бы environments).** Антипаттерн: код приложения и desired state в одном repo с одним PR-flow. Изменения «деплой» и «фича» смешиваются, отдельный rollback невозможен. Норма: код приложения → CI собирает image → updates image tag в config repo через bot; config repo — desired state, ArgoCD/Flux его подтягивают.
- **Drift detection включён и мониторится.** Антипаттерн: drift где-то отображается, но никто не смотрит. GitOps controller покажет drift status, но без alert'а на длительный drift его никто не заметит — пока не наступит инцидент. Alert на `Application status != Synced` или `OutOfSync` дольше N минут.
- **Rollback = git revert, не «руками».** Антипаттерн: «срочно нужно откатить — kubectl edit». Это работает на 5 минут, потом controller возвращает старое значение из git. Правильно: `git revert` PR'а → controller подтягивает revert → изменение откатано atomically с audit trail. Rollback готов *до* деплоя, не во время инцидента.
- **Secrets никогда в plain виде в git, даже в private repo.** Антипаттерн: base64-encoded secret в git «оно же encoded». Base64 — не шифрование; любой с read access на repo видит секрет. Sealed Secrets / External Secrets / SOPS — единственный безопасный путь. См. лист `Secrets Management`.
- **Bootstrapping самого GitOps в Git (app-of-apps / GitOps engine in GitOps).** Антипаттерн: ArgoCD/Flux установлен kubectl, конфиг controller'а нигде не зафиксирован. При DR (lost cluster) восстановление руками. Правильно: ArgoCD сам управляется через ArgoCD `Application` (app-of-apps), bootstrap через git → один command поднимает controller и все apps.
- **Progressive delivery интегрирована, а не отдельно.** Антипаттерн: GitOps выкатывает все изменения сразу (атомарный apply), без canary. Изменение → controller применяет → 100% трафика → инцидент. Argo Rollouts + Argo CD или Flagger + Flux дают canary / health gate / automated rollback нативно — promotion через PR.

## Связанные листья

- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — IaC = код описывает инфраструктуру; GitOps = git как источник + автоматическое reconciliation. Один может работать без другого: terraform без GitOps (CI apply); GitOps можно делать поверх kustomize/helm без full IaC. На практике вместе.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — canary / blue-green / feature flags. Argo Rollouts (с ArgoCD) и Flagger (с Flux) — основные GitOps-нативные tools.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — secrets workflow в GitOps-flow: never plain в repo, всегда через Sealed Secrets / External Secrets / SOPS.
- **[Service Ownership](/The-Way-of-SRE/leaves/culture/service-ownership/)** — каталог сервиса содержит ссылку на GitOps Application и repo; owner отвечает за PR-flow.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — выбор GitOps tooling (Argo CD vs Flux), структуры repos, secret-workflow — типичные ADR.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — emergency rollback через git revert + Argo CD sync; mitigation pattern в incident response.

## Открытые вопросы

- **App of Apps Pattern** *(TBD)* — детальная подтема ArgoCD: один root Application управляет другими Applications; trade-offs с ApplicationSet. Возможный sub-leaf или раздел.
- **ApplicationSet (ArgoCD) / Flux Kustomization-targets** — fan-out pattern для multi-cluster и multi-env; самостоятельная сложная тема.
- **Multi-cluster GitOps strategies** *(TBD)* — hub-spoke vs fan-out vs federated; relevant при ≥ 5 кластеров. Возможный отдельный лист на стыке с Capacity Planning и Network.
- **Policy as Code в GitOps** *(TBD)* — уже упоминалось в open questions у IaC. Kyverno / OPA / Argo CD CMP — соседняя практика; здесь как best practice, отдельный scope как лист.
- **Drift Remediation Policy** — self-heal vs manual sync vs alert-only; trade-offs (auto-heal opaque в инциденте vs manual delay'ит recovery). Самостоятельная подтема.
