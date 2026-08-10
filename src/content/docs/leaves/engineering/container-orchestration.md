---
title: Containerization & Orchestration
description: Контейнеры как packaging и Kubernetes как orchestrator — что нужно знать про кластер помимо kubectl
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** IT Infrastructure / Containerization & Orchestration
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

«У нас всё в Kubernetes» — в 2026 это звучит как «у нас всё на Linux» десять лет назад: уже не отличительная характеристика, а фон. И я регулярно вижу команды, в которых k8s-fluency сводится к `kubectl get pods` и копированию манифестов с прошлого проекта. Когда происходит нетривиальный инцидент — etcd compaction lag, pod stuck in `Terminating`, неожиданный CrashLoopBackOff после rolling update, network policy не пропускает трафик между namespace'ами — выясняется, что control plane для команды — это чёрный ящик с UI. Этот лист — про то, что нужно знать, чтобы Kubernetes был не «магией платформенной команды», а observable системой: контейнер как процесс (см. [Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)), pod как unit scheduling, control plane как набор взаимодействующих контроллеров.

У меня есть petproject `orb-k8s-gitops` — multi-repo шаблон деплоя приложений в множество контуров k8s через Helmfile, с явным разделением «приложение» / «контур» / «значения». Он вырос из боли «как унифицировать deployment одного приложения в 5 окружений без копипасты» — этот лист во многом про навыки, которые формировались на таких задачах. Граница с соседями: [Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/) — про *что* провижится (включая кластер); этот лист — про *как работает* кластер после провижинга. [GitOps](/The-Way-of-SRE/leaves/engineering/gitops/) — про модель delivery; этот лист — про сам кластер, в который GitOps деплоит.

## Что должен уметь

Главный навык на уровне L4 — отлаживать pod, **не открывая kubectl-cheatsheet**. Когда pod в `CrashLoopBackOff`, последовательность примерно одна и та же: `kubectl describe pod` → events / restart count / exit code → `kubectl logs --previous` → если контейнер падает до логов, `kubectl get events --sort-by=.lastTimestamp` → если scheduler не размещает, `kubectl describe node` → taints / resource pressure / affinity. Это не про память — про mental model: что k8s контроллер делает на каждом шаге и где он оставляет следы. Я регулярно вижу команды, в которых эта последовательность есть только у двух senior'ов; все остальные открывают Grafana и ждут «оно само починится». Один день на чтение [Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way) и `kubectl explain` для базовых ресурсов — заметная разница для всех будущих on-call смен.

**L3**
- Понимает, что container — это процесс в namespaces/cgroups (см. [Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)), а pod — группа контейнеров с общим network namespace. Различает `Deployment` / `StatefulSet` / `DaemonSet` / `Job` / `CronJob` и знает, для чего каждый.
- Работает с базовым `kubectl`: `get`, `describe`, `logs`, `exec`, `apply`, `delete`; читает manifest как YAML с `apiVersion` / `kind` / `metadata` / `spec` / `status`.

**L4**
- Дебажит pod самостоятельно: `describe` → events → logs (включая `--previous`) → `kubectl get events --sort-by=.lastTimestamp`. Различает `ImagePullBackOff` / `CrashLoopBackOff` / `Pending` / `Evicted` / `OOMKilled` по симптому и знает, где искать root cause.
- Понимает **resource requests vs limits**: requests управляют scheduling, limits — cgroup. Знает, что CPU throttling без OOM — типичная причина «pod жив, но медленный».
- Настраивает probes: `liveness` (когда перезапускать), `readiness` (когда исключить из service endpoints), `startup` (для медленно стартующих). Понимает, почему liveness без readiness — частая причина «rolling update положил сервис».
- Дебажит networking внутри кластера: `kubectl get svc` / `endpoints`, проверка DNS через `nslookup` из debug-pod'а, NetworkPolicy, ingress controller logs.

**L5**
- Управляет workload через GitOps-flow (см. [GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)): Helm/Kustomize шаблоны, разделение значений по окружениям, ArgoCD/Flux sync drift detection. На petproject'е `orb-k8s-gitops` — пример паттерна «приложение / окружение / values».
- Понимает control plane: kube-apiserver / etcd / controller-manager / scheduler / kubelet; видит, где живут tokens (`/var/run/secrets/kubernetes.io/serviceaccount/`), как работает RBAC (`Role` / `ClusterRole` / `Binding`), что значит «admission webhook fail».
- Дизайнит cluster-wide policies: PodSecurity (или PSA в современных версиях), ResourceQuotas, LimitRanges на namespace, NetworkPolicy с запретом по умолчанию и явными allow.
- Различает statefulness: ephemeral storage (`emptyDir`) vs persistent (`PersistentVolume` / `PersistentVolumeClaim` / `StorageClass`) vs external (managed DB через `Service` / `ExternalName`). Знает, что `StatefulSet` гарантирует stable identity, а не reliability.

**L6+**
- Оценивает trade-off self-hosted vs managed (EKS / GKE / AKS / managed-k8s облака — см. [Cloud Providers](/The-Way-of-SRE/leaves/engineering/cloud-providers/)). Понимает, что отдаётся провайдеру (control plane uptime, etcd, upgrades) и что остаётся у команды (worker nodes, addons, networking, observability).
- Планирует upgrade strategy: minor version cadence, deprecated APIs (`pluto` / `kube-no-trouble`), node pool rotation, backup etcd перед мажорным upgrade. Готов к non-trivial cases: stuck PDB, immortal pods, webhook циклы.
- Учит команду: разбирает с командой инциденты в k8s как демонстрацию, ведёт планы апгрейдов, документирует cluster invariants (что нельзя сломать) в [runbook'ах](/The-Way-of-SRE/leaves/culture/runbooks/).

## Материалы

### Книги

- Kelsey Hightower, Brendan Burns, Joe Beda — **[Kubernetes: Up & Running](https://www.oreilly.com/library/view/kubernetes-up-and/9781098110192/)** (O'Reilly, 3-е изд., 2022). Если выбирать одну книгу для введения — эту. Авторы — те же люди, что строили Kubernetes в Google; идиоматика правильная.
- Marko Lukša — **[Kubernetes in Action](https://www.manning.com/books/kubernetes-in-action-second-edition)** (Manning, 2-е изд., 2023). Более «инженерная» альтернатива Hightower — больше про *как устроено*, меньше про *как пользоваться*. Глава про control plane internals — лучшая, что я видел публично.
- Liz Rice — **[Container Security](https://www.oreilly.com/library/view/container-security/9781492056690/)** (O'Reilly, 2020). Уже упомянута в [Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/); тут особенно главы про container runtime и k8s security model.
- Bilgin Ibryam, Roland Huß — **Kubernetes Patterns** (O'Reilly, 2-е изд., 2023). Каталог паттернов проектирования workload'ов: sidecar, init container, ambassador, leader election. По моим наблюдениям, эти паттерны спасают команды от изобретения «своего operator'а», когда задача — типовая.

### Статьи и доклады

- Kelsey Hightower — **[Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way)**. Шаг-за-шагом поднятие кластера без `kubeadm`. Не для production — для **demystification**. Один день этого упражнения — и control plane перестаёт быть магией.
- Julia Evans — **[How Containers Work](https://wizardzines.com/zines/containers/)** (wizardzines). Отдельного зина по Kubernetes у неё нет, но этот объясняет слой под ним — namespaces, cgroups, образы. Жанр — один концепт на страницу, и для тех, кто отскакивает от пятисотстраничных книг, это лучший вход.
- **[Kubernetes the Documentary](https://www.youtube.com/watch?v=BE77h7dmoQU)** (CNCF, 2022). Полтора часа про то, как Kubernetes появился. Не учебник, но даёт mental model «откуда растут архитектурные решения».
- CNCF — **[отчёты и материалы фонда](https://www.cncf.io/reports/)**. Там же публиковались чек-листы готовности кластера к продакшену по доменам (observability, security, networking, storage); отдельные PDF периодически переезжают, поэтому ищите по названию, а не по прямой ссылке.
- **[Reddit Pi Day Outage 2023-03-14 postmortem](https://www.reddit.com/r/RedditEng/comments/11xx5o0/you_broke_reddit_the_pi_day_outage/)** — публичный case study k8s upgrade incident — см. ниже.

### Инструменты

- **`kubectl`** — основной CLI. По моим наблюдениям, разница между SRE, который свободно живёт в k8s, и тем, кто нет — это `kubectl get events --sort-by=.lastTimestamp`, `kubectl explain`, `kubectl debug` (1.25+), и привычка к `--dry-run=server`.
- **[k9s](https://k9scli.io/)** — TUI поверх kubectl. По моим наблюдениям, чаще всего берут именно k9s; альтернативы (lens, headlamp) — на любителя.
- **[Helm](https://helm.sh/)** / **[Kustomize](https://kustomize.io/)** — packaging и шаблонизация манифестов. Helm — индустриальный стандарт для third-party charts; Kustomize — встроен в `kubectl`, проще для собственных приложений без сложной шаблонизации.
- **[Helmfile](https://helmfile.readthedocs.io/)** — declarative wrapper над Helm для multi-release / multi-environment. Использую на `orb-k8s-gitops` — даёт DRY-структуру «приложение × окружение» без копипасты values.
- **[ArgoCD](https://argo-cd.readthedocs.io/)** / **[Flux](https://fluxcd.io/)** — операторы GitOps (см. [GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)). Использую ArgoCD на [`evo-tf-argocd`](https://github.com/jtprogru/evo-tf-argocd) — демо для Cloud.ru Evolution Managed Kubernetes.
- **[kind](https://kind.sigs.k8s.io/)** / **[k3s](https://k3s.io/)** / **[minikube](https://minikube.sigs.k8s.io/)** — локальный k8s для разработки. По моим наблюдениям, в 2026 чаще берут `kind` (k8s-in-Docker) для CI и `k3s` для edge и IoT.
- **[kube-no-trouble](https://github.com/doitintl/kube-no-trouble)** / **[pluto](https://github.com/FairwindsOps/pluto)** — обнаружение deprecated API'ов перед upgrade. Обязательны в pipeline апгрейда.
- **[stern](https://github.com/stern/stern)** / **[kail](https://github.com/boz/kail)** — multi-pod logs. Когда сервис — 10 реплик, `kubectl logs` по одному pod — пытка.

## Best practices

Хороший публичный кейс сложности операций в k8s — **Reddit Pi Day Outage 2023-03-14**. Команда выполняла рутинный upgrade с 1.23 на 1.24; кластер ушёл в degraded state на 5+ часов, потому что новый релиз Kubernetes изменил поведение route reflector в Calico при определённой конфигурации NetworkPolicy. Postmortem публичен и подробно разобран: команда сделала всё «по книжке» (canary upgrade на стейдже, последовательный rollout), но баг Calico проявился только под продовой нагрузкой. Я регулярно ссылаюсь на этот разбор как на лучший пример того, что **k8s upgrade — это не git tag**: между минорными версиями могут поменяться поведения API, default'ы admission controllers, semantics CNI / CSI плагинов. Healthy approach — выделять отдельный maintenance window, иметь план отката до старта и не смешивать upgrade с другими изменениями. Одно окно — одно изменение.

Три вещи ломаются чаще прочих.

Liveness без readiness — прямой путь к outage на rolling update. Liveness перезапускает контейнер, и если приложение медленно прогревается (warm cache, JIT, пул соединений), оно будет убито раньше, чем обслужит первый запрос. Readiness же просто держит pod вне service endpoints, пока тот не готов. Без него обновление пускает трафик на непрогретый pod. Отдельный антипаттерн — скопировать readiness URL в liveness и считать дело сделанным.

CPU limits — это cgroup throttling, а не магия изоляции. Поставили limit в 1 CPU, и pod начинает тормозить даже при свободных ядрах на ноде, потому что исчерпан compute period cgroup. По моим наблюдениям, на реальных нагрузках CPU limits приносят больше проблем, чем пользы; requests без limits — вполне уважаемый default (см. [обсуждение в k8s SIG-node](https://github.com/kubernetes/kubernetes/issues/67577)). С памятью наоборот. Без memory limits OOM-killer срабатывает уже на уровне ноды, и выбирает жертву он не так, как вам бы хотелось.

Третье — сеть. Кластер без политик плоский, как стол: любой pod говорит с любым. В инциденте уровня «в один namespace приехал скомпрометированный образ» это разница между «пострадал один сервис» и «дальше открыта дорога ко всем остальным». Запрет по умолчанию плюс явные allow — это один PR на namespace. Не проект.

**Pod — это единица планирования, а не единица приложения.** Я регулярно вижу сервисы, упакованные в pod с двумя контейнерами: основной и helper. У helper нет своего жизненного цикла, отдельно он не масштабируется, перезапускается вместе с основным. Но ресурсы ест полноценно. Healthy model: pod — это набор контейнеров, которые **должны жить и умирать вместе** (sidecar для logs, init container для миграций, ephemeral exec для дебага). Всё остальное — отдельные Deployment'ы с Service между ними. Этот паттерн разобран в «Kubernetes Patterns» как «Sidecar vs Adapter vs Ambassador».

**Manifest без resource requests — сирота для scheduler'а.** Scheduler решает, на какую ноду размещать pod, по `spec.containers[*].resources.requests`. Без requests pod уходит в класс QoS `BestEffort` — kernel первым выселяет его при memory pressure, scheduler не учитывает его потребление при capacity planning. По моим наблюдениям, кластеры без explicit requests на всех workload'ах живут до первой memory-spike'а, после которого выселяется случайный набор pod'ов и команда не понимает, почему легло именно это. Минимум — `requests` на CPU/memory для каждого container'а, обоснованный по [Performance & Profiling](/The-Way-of-SRE/leaves/engineering/performance-profiling/).

**Upgrade strategy = больше, чем «обновлять каждые 3 месяца».** Каждый минорный релиз k8s приносит deprecated/removed API'и (например, removal `policy/v1beta1` PDB в 1.25, `flowcontrol.apiserver.k8s.io/v1beta2` в 1.29). Без pre-upgrade audit (`pluto` / `kube-no-trouble`) команда узнаёт о breaking change в момент failed deployment. Healthy upgrade-flow: audit deprecated API → fix в манифестах → upgrade staging → soak 1+ неделю → canary node в production → постепенный rollout. Cluster autoscaling и addons (cert-manager, ingress controller, CNI) — отдельная axis совместимости; апгрейд k8s без апгрейда addons часто и есть источник «странных багов».

**etcd backup перед каждым серьёзным изменением — не паранойя.** Всё состояние кластера живёт в etcd. Снять snapshot — одна команда, `etcdctl snapshot save`, а восстановление кластера без него после повреждения etcd — это от пары часов до «поднимаем заново». В управляемых кластерах (EKS / GKE) snapshot делает провайдер; в self-hosted — обязательно. Я регулярно вижу команды, которые делают backup приложений и баз, но игнорируют etcd — «оно же управляется операторами». До первого case'а, когда инцидент в admission webhook оставил кластер в incosistent state.

## Связанные листья

- **[Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)** — container = процесс в namespaces/cgroups; дебаг pod часто заканчивается на kernel-level (`/proc`, `nsenter`, `dmesg`).
- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — оверлейные сети (Calico, Cilium, Flannel), CNI plugin internals, NetworkPolicy, kube-proxy / IPVS, ingress controllers — стык с сетевым доменом.
- **[Service Mesh](/The-Way-of-SRE/leaves/engineering/service-mesh/)** — следующий слой поверх pod-to-pod трафика: mTLS, traffic shifting, L7 observability через sidecar.
- **[Cloud Providers](/The-Way-of-SRE/leaves/engineering/cloud-providers/)** — managed-k8s (EKS / GKE / AKS / Yandex Managed Kubernetes) меняет shared responsibility model; control plane живёт у провайдера.
- **[Infrastructure as Code](/The-Way-of-SRE/leaves/engineering/infrastructure-as-code/)** — кластер провижится через Terraform / Pulumi; манифесты — следующий слой того же декларативного подхода.
- **[GitOps](/The-Way-of-SRE/leaves/engineering/gitops/)** — Argo CD / Flux синхронизируют git с состоянием кластера; естественный механизм доставки для workload'ов, живущих в k8s.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — PDB (PodDisruptionBudget), HPA (HorizontalPodAutoscaler), topology spread constraints — k8s-native реализации resilience patterns.
- **[Capacity Planning](/The-Way-of-SRE/leaves/engineering/capacity-planning/)** — k8s requests/limits + cluster autoscaling переводят планирование capacity в декларативный формат.

## Открытые вопросы

**Kubernetes operators и CRD** — отдельная подобласть: как писать operator, когда оправдан свой CRD, а когда хватит обычного Deployment. Возможно, отдельный лист в будущем; пока тема живёт здесь через паттерны.

**Сеть на eBPF (Cilium) против iptables (Calico, Flannel).** Cilium становится стандартом, но решений на iptables в проде по-прежнему большинство. Где проходит граница «пора мигрировать», я не знаю.

**Multi-cluster patterns** — federation, virtual kubelet, Cluster API. Большинству команд хватает одного кластера на окружение, а multi-cluster добавляет отдельный класс сложности, который я в проде не разворачивал. Есть опыт — расскажите через PR.

**Service Mesh как обязательный слой** обсуждается в листе [Service Mesh](/The-Way-of-SRE/leaves/engineering/service-mesh/). Короткий ответ там такой. Чаще нет, чем да.
