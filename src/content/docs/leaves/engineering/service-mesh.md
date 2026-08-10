---
title: Service Mesh
description: Sidecar-proxy слой для mTLS, traffic shifting и L7-observability — когда оправдан, как дебажить и почему чаще «пока без него» правильный ответ
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** IT Infrastructure / Containerization & Orchestration / Service Mesh
- **SFIA-уровни:** 4, 5, 6
- **Приоритет:** Nice to have
- **Статус:** draft
:::

«Поставим service mesh, и mTLS, ретраи и трассировка будут из коробки». После такой позиции я регулярно вижу команды, у которых mesh стал новой точкой отказа: control plane со своей недоступностью, sidecar в каждом pod'е плюс 200 мс к старту, а инцидент теперь разбирается через два слоя логов — приложение и Envoy. Инструмент мощный, спору нет. Но это **инфраструктурный слой**, и эксплуатировать его придётся с той же зрелостью, что и сам Kubernetes (см. [Containerization & Orchestration](/The-Way-of-SRE/leaves/engineering/container-orchestration/)). Этот лист — про то, когда mesh оправдан, как он устроен и какими компромиссами за него платят в production.

Граница: [Networking](/The-Way-of-SRE/leaves/engineering/networking/) — про сетевой стек как медиум (TCP, TLS, HTTP); этот лист — про L7-overlay поверх pod-to-pod трафика. [Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/) — про сами паттерны (retry, circuit breaker, timeout); mesh — одна из инфра-реализаций. [Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/) — пересечение через mTLS как замену shared secrets.

## Что должен уметь

Главный навык на уровне L5 — **честно отвечать на вопрос «нужен ли нам mesh»**. По моим наблюдениям, в большинстве команд (до сотни сервисов, один регион, нет жёстких требований compliance на mTLS) ответ «нет, пока». Mesh выигрывает, когда: (1) нужен mTLS между всеми сервисами как compliance baseline; (2) много языков/фреймворков, и стандартизировать retries/timeouts/tracing в коде дороже, чем поднять sidecar; (3) сложные сценарии traffic shifting (canary, A/B, mirror) — а не один-два, которые покрываются ingress controller'ом. Команда, которая сначала задаёт эти вопросы и потом ставит mesh, эксплуатирует его осознанно; команда, которая ставит «потому что Istio в каждом докладе» — добавляет операционный долг.

**L4**
- Понимает архитектуру mesh: data plane (sidecar proxy, обычно Envoy) + control plane (Istio / Linkerd / Consul Connect). Знает, что sidecar инжектится через mutating admission webhook и перехватывает трафик через iptables.
- Различает три базовые функции mesh: **mTLS** (взаимная аутентификация сервисов), **traffic management** (routing, retry, timeout), **observability** (RED-метрики, distributed tracing, access logs). Понимает, что эти три можно получать раздельно (cert-manager + retries в коде + OpenTelemetry SDK) — mesh упаковывает их в один пакет.
- Дебажит инцидент в mesh: `istioctl proxy-status` / `istioctl proxy-config`, Envoy admin endpoint (`localhost:15000/clusters`, `/listeners`, `/stats`), логи sidecar через `kubectl logs -c istio-proxy`. Знает, что 503 от mesh ≠ 503 от приложения.

**L5**
- Оценивает overhead: latency (+1–5 мс на hop через sidecar), CPU/memory footprint sidecar (50–200 МБ memory на pod при дефолтах), startup time. Делает осознанный выбор «mesh за это платит».
- Различает Istio vs Linkerd vs eBPF-based решения (Cilium Service Mesh, Ambient Mesh): trade-offs по сложности control plane, footprint, feature-set. По моим наблюдениям, Linkerd чаще выбирают за «делает три вещи хорошо», Istio — за богатство фич, ambient/eBPF — за «без sidecar в каждом pod».
- Управляет mesh upgrade strategy: canary control plane, ревизии Istio (`istio-injection=disabled` + `istio.io/rev`), параллельное существование двух версий control plane.
- Понимает security model: частота ротации сертификатов mTLS, root-of-trust (внешний CA vs Istio's built-in), AuthorizationPolicy / PeerAuthentication как RBAC-эквивалент на L7.

**L6+**
- Решает «mesh или нет» для конкретной системы: формулирует критерии «когда оправдан» в [ADR](/The-Way-of-SRE/leaves/practices/architecture-decision-records/), готов аргументировать «пока без него» так же убедительно, как «давайте поставим».
- Готов к incident'ам уровня «mesh лёг»: rollback control plane, disable injection через namespace label, fallback на direct pod-to-pod трафик. Имеет [runbook](/The-Way-of-SRE/leaves/culture/runbooks/) на «mesh control plane unhealthy».

## Материалы

### Книги

- Lee Calcote, Nic Jackson — **[Istio: Up and Running](https://www.oreilly.com/library/view/istio-up-and/9781492043775/)** (O'Reilly, 2019). Немного устарела по конкретным API, но архитектурный фундамент Istio описан правильно. Главы про data plane / Envoy — best part.
- **[Документация Linkerd](https://linkerd.io/2/overview/)** (Buoyant). Бесплатно и концептуально чище, чем у Istio: устройство прокси, identity, mTLS разобраны без лишнего. Читается за выходные.

### Статьи и доклады

- William Morgan (Buoyant CEO) — **[The Service Mesh: What Every Software Engineer Needs to Know About the World's Most Over-Hyped Technology](https://buoyant.io/service-mesh-manifesto)**. По моим наблюдениям, лучший публичный текст про то, *что такое mesh* и *что НЕ такое*. Manifesto-style, читается за полчаса.
- Istio — **[What is a service mesh?](https://istio.io/latest/about/service-mesh/)**. Каноническое определение «изнутри проекта». Полезно для базовых терминов, но смотреть критически — Istio объяснит, почему mesh всегда полезен.
- Matt Klein (Envoy author) — **[Service Mesh Data Plane vs. Control Plane](https://medium.com/@mattklein123/service-mesh-data-plane-vs-control-plane-2774e720f7fc)**. Короткая статья от автора Envoy про разделение data/control plane — концепт, без которого разговор про mesh превращается в магию.
- Cindy Sridharan — **[The Mythical Service Mesh](https://copyconstruct.medium.com/the-mythical-service-mesh-c0e1f6f4c1e9)**. Контраргумент к «mesh решает всё»; полезно читать до выбора mesh.
- Buoyant — **[сравнение Linkerd и Istio](https://buoyant.io/linkerd-vs-istio)**. Материал вендора одной из сторон, и читать его надо с этой поправкой; ценно другое — методология замеров, где overhead меряют под реалистичной нагрузкой, а не на «hello world».
- **[Lyft Envoy origin story](https://www.youtube.com/watch?v=RVZX4CwKhGE)** (Matt Klein, KubeCon 2018) — публичный case study, как родился Envoy — см. ниже.

### Инструменты

- **[Envoy](https://www.envoyproxy.io/)** — индустриальный стандарт data plane. По моим наблюдениям, в 2026 ~80% установок mesh так или иначе используют Envoy (через Istio, Consul Connect, кастомные сборки).
- **[Istio](https://istio.io/)** — самый feature-rich control plane. Подходит, когда нужно «всё»: mTLS + traffic management + multi-cluster + extensible policy. Цена — сложность операций.
- **[Linkerd](https://linkerd.io/)** — alternative с фокусом «делает три вещи хорошо». Свой data plane (linkerd2-proxy на Rust), меньше footprint, проще операции. По моим наблюдениям, чаще выбирают, когда команда хочет mesh без штатного «mesh-engineer».
- **[Cilium Service Mesh](https://cilium.io/use-cases/service-mesh/)** / **[Istio Ambient](https://istio.io/latest/blog/2024/ambient-reaches-ga/)** — sidecar-less подход (eBPF / per-node proxy). Ambient добрался до GA в Istio 1.24 в ноябре 2024, то есть формально это уже не эксперимент.
- **[Consul Connect](https://www.consul.io/docs/connect)** — mesh от HashiCorp, integrated с Consul service discovery. Выбор для тех, у кого Consul уже стоит.
- **[Kiali](https://kiali.io/)** — UI для Istio: service graph, traffic flow, configuration validation. По моим наблюдениям, единственный mesh-debugger, который не открывает Envoy admin вручную.
- **`istioctl analyze`** / **`linkerd check`** — sanity-check tools от самих проектов. Запускать перед каждым upgrade.

## Best practices

Хороший публичный кейс «откуда взялся mesh» — **Lyft Envoy origin story (2015–2016)**. Команда столкнулась с разноязычной микросервисной средой: Python, Go, Java, Node.js — каждый со своим HTTP-клиентом, своими ретраями, таймаутами и предохранителями, своими метриками. Любое изменение в network policy требовало релизов всех сервисов. Решение — выделить network logic в out-of-process proxy (Envoy), который sidecar'ом запускается рядом с каждым приложением. Это и есть data plane современного mesh; всё, что сверху (Istio, Linkerd, Consul Connect), — control plane'ы для оркестрации этого слоя. На этот контекст я регулярно ссылаюсь, когда команда только думает про mesh. Три сервиса на одном языке? Тогда mesh решает проблему, которой у вас нет. Если у вас 50 сервисов на пяти языках и retries реализованы по-разному в каждом — стоит считать ROI mesh всерьёз.

Отсюда первое правило: mesh не отменяет ретраи и таймауты в коде, он их дублирует. «У нас mesh, ретраи он сделает» — антипаттерн. Mesh повторяет запрос на сетевом уровне, по HTTP-методу и коду ответа, а приложение — на бизнес-уровне, где живут идемпотентность, дедупликация и eventual consistency. Два независимых слоя ретраев без договорённости между ними складываются в retry storm. Решение принимает кто-то один, второй пропускает запрос как есть. Чаще всего на mesh остаются таймаут и предохранитель, а ретрай живёт в коде, где известна бизнес-семантика.

**mTLS — это не бесплатная безопасность, а новый способ упасть.** Ротация сертификатов, компрометация ключа, кривая цепочка доверия — любое из этого кладёт трафик в mesh за секунды. Runbook «mTLS сломался по всему mesh» тут обязателен, как и алерты на состояние сертификатов: обратный отсчёт TTL, сбои ротации. Тот же уровень внимания, что и к TLS-сертификатам на ingress.

**Overhead sidecar — налог, который платит каждый pod.** 200 МБ памяти на sidecar при сотне pod'ов превращаются в 20 ГБ, потраченных только на mesh. На маленьких нагрузках это незаметно, на больших съедает половину capacity planning. Поэтому footprint меряется до выката в production и на реалистичной нагрузке, а не на «hello world».

**Control plane — отдельный класс инцидентов.** Я регулярно вижу команды, у которых здоровье mesh control plane вообще не покрыто алертами. Логика простая: mesh же абстракция, она работает. Когда `istiod` падает, sidecar'ы какое-то время живут на закешированном конфиге, а потом начинают отказывать в самых неочевидных местах. Healthy ops-model: mesh control plane мониторится так же тщательно, как kube-apiserver — uptime, latency push'ей конфигурации, версии конфига на data plane. Без этого инциденты mesh диагностируются по принципу «странно работает всё одновременно».

**Один mesh на кластер.** Не два и не три, потому что «командам нужно разное». Схема «безопасность хочет Istio, observability хочет Linkerd, поставим оба» — прямая дорога к несовместимой инъекции sidecar и невоспроизводимым багам, которые потом невозможно ни объяснить внятно, ни повторить на стенде, ни закрыть без разбора обоих control plane сразу. По моим наблюдениям, healthy approach: один mesh на кластер, выбранный после ADR. Если разные команды хотят разное — это разговор «давайте обсудим критерии», а не «давайте поставим оба».

**Traffic shifting через mesh — ещё не progressive delivery.** Часто слышу «у нас canary через Istio»: 90% трафика на v1, 10% на v2, маршрутизацию делает mesh. Это не canary. Это перекладывание трафика. В [Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/) входит ещё и автоматический откат по нарушению SLI, а не только маршрутизация. Mesh даёт механизм — правила routing. Политику, то есть решение «катим дальше или откатываем», задаёт отдельный слой. Flagger и Argo Rollouts как раз сшивают эти две части вместе.

**Ambient/sidecar-less mesh — уже не эксперимент, но и не автоматический выбор.** Cilium Service Mesh и Istio Ambient избавляются от sidecar в каждом pod в пользу per-node proxy. Идея красивая. Меньше footprint, проще обновление, нет платы за старт sidecar в каждом pod'е. Ambient официально стал стабильным в Istio 1.24 (ноябрь 2024), так что аргумент «это ещё бета» больше не работает. Осторожность теперь в другом: публичных разборов эксплуатации ambient на серьёзном масштабе по-прежнему мало, а отлаживается он не так, как привычная схема с sidecar. Если mesh у вас уже работает и не болит — мигрировать ради самой миграции незачем; если ставите mesh с нуля на свежем кластере, ambient стоит рассматривать наравне с sidecar, а не «через год».

## Связанные листья

- **[Networking](/The-Way-of-SRE/leaves/engineering/networking/)** — mesh работает поверх TCP/HTTP/gRPC; без свободного владения сетью инцидент в mesh не разобрать.
- **[Containerization & Orchestration](/The-Way-of-SRE/leaves/engineering/container-orchestration/)** — mesh живёт внутри Kubernetes; sidecar injection, admission webhooks, NetworkPolicy — пересечение с операциями в k8s.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — retry / circuit breaker / timeout — паттерны, mesh — одна из реализаций; lib в коде — альтернатива.
- **[Progressive Delivery](/The-Way-of-SRE/leaves/practices/progressive-delivery/)** — traffic shifting через mesh — mechanism для canary/blue-green; policy и SLI-driven rollback — отдельный слой.
- **[Workload Identity](/The-Way-of-SRE/leaves/practices/workload-identity/)** — mTLS через mesh заменяет shared secrets как метод service-to-service аутентификации.
- **[Secrets Management](/The-Way-of-SRE/leaves/practices/secrets-management/)** — root-of-trust для сертификатов mTLS; ротация сертификатов как полноценная операция.
- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — mesh даёт RED-метрики из коробки, но alerting должен быть symptom-based на бизнес-сервисах, не на mesh-internals.
- **[Architecture Decision Records](/The-Way-of-SRE/leaves/practices/architecture-decision-records/)** — выбор mesh / отказ от mesh — классический ADR-кандидат.

## Открытые вопросы

Когда mesh на eBPF (Cilium, Ambient) станет скучным выбором по умолчанию, я не знаю. Мой прогноз — 12–18 месяцев на 2026–2027, но это ощущение, а не измерение. Если у вас Cilium Service Mesh уже крутится в production, расскажите через PR.

Multi-cluster mesh (Istio multi-primary, Linkerd multicluster) — отдельный класс сложности, и здесь я честно вне зоны своего опыта: в одном кластере применял, в нескольких — нет. И главное сомнение: оправдан ли mesh для команд до двадцати сервисов, даже разноязычных. Соотношение цены и пользы на таком размере выглядит сомнительно, но допускаю, что просто не вижу случаев, где оно сходится. Если у вас такой случай есть — расскажите через PR.
