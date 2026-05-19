---
name: Networking
branch: Engineering
path: IT Infrastructure/Networking
sfia_levels: [3, 4, 5, 6]
priority: Must Have
status: draft
---

# Networking

> Сетевой стек как фундамент надёжности. От TCP/IP до DNS, TLS, gRPC и service mesh. SRE без сетевого инструментария — наполовину слепой инженер: половина инцидентов начинается на сетевом уровне.

## Что должен уметь

- **L3** — Понимает базовую модель OSI (актуальные слои: TCP, IP, HTTP, DNS, TLS). Использует `ping`, `traceroute`, `curl`, `dig` для базовой диагностики.
- **L4** — Читает сетевые проблемы: разница между «host недоступен» / «TLS-handshake падает» / «timeout на DNS». Использует `tcpdump`, `ss`, `iptables` для разбора. Понимает HTTP/2 и gRPC поверх него.
- **L5** — Проектирует надёжность сети для сервиса: retries с backoff, circuit breakers, timeouts, идемпотентность, distributed tracing для сетевых границ. Разбирается в L4 vs L7 балансировке.
- **L6+** — Дизайнит сетевую архитектуру для надёжности на уровне инфраструктуры (service mesh, ingress, internal vs external traffic, network policies в k8s). Учит команду.

## Материалы

### Книги

- Stevens — **TCP/IP Illustrated, Vol. 1** (Addison-Wesley). Каноничный учебник TCP/IP. Тяжёлый, но если хочешь по-настоящему разобраться — это он.
- Ilya Grigorik — **[High Performance Browser Networking](https://hpbn.co/)** (O'Reilly). Бесплатно онлайн. Современный сетевой стек с фокусом на performance.

### Статьи и доклады

- Julia Evans — **[Networking ACKs/SYNs/RST](https://wizardzines.com/zines/bite-size-networking/)** zines. Очень доступные иллюстрации TCP-handshake, DNS, etc.
- Matt Klein — **[Service Mesh Data Plane vs Control Plane](https://blog.envoyproxy.io/service-mesh-data-plane-vs-control-plane-2774e720f7fc)**. Базовое понимание service mesh.
- Cloudflare blog — **[Everything you ever wanted to know about UDP sockets](https://blog.cloudflare.com/everything-you-ever-wanted-to-know-about-udp-sockets-but-were-afraid-to-ask-part-1/)**. Глубоко, но полезно для понимания сетевых проблем.

### Инструменты

- `ping`, `traceroute`, `dig`, `nslookup`, `curl`, `wget` — базовая диагностика.
- `tcpdump`, `wireshark`, `ss`, `netstat`, `iptables`/`nftables` — продвинутая диагностика и анализ.
- **[Envoy](https://www.envoyproxy.io/)** / **[Istio](https://istio.io/)** / **[Linkerd](https://linkerd.io/)** — service mesh-стек.

## Best practices

- **Timeouts везде.** Любой сетевой вызов без timeout — потенциальный source of cascading failure. Пятисекундный timeout по умолчанию лучше, чем «бесконечный» fallback.
- **Retries только на идемпотентных операциях, с exponential backoff и jitter.** Retry-storm после общего сбоя — классический способ убить и без того страдающий сервис.
- **DNS — это часть приложения, а не «infra без проблем».** Пять секунд DNS-resolve кладут сервис так же надёжно, как пять секунд БД. Кэширование DNS на уровне клиента и monitoring DNS-latency — нормальная практика.

## Связанные листья

- **Resilience Patterns** (TBD) — circuit breaker, retry, bulkhead, timeout — сетевая обвязка.
- **Observability** (TBD) — distributed tracing нужен для сетевых границ.
- **Operating Systems** (TBD) — TCP-стек на уровне ядра тесно связан.
