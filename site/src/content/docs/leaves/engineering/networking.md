---
title: Networking
description: Сетевой стек как фундамент надёжности — TCP/IP, DNS, TLS, HTTP/gRPC, service mesh, resilience patterns
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** IT Infrastructure / Networking
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

Сетевой стек как фундамент надёжности. От TCP/IP до DNS, TLS, HTTP/gRPC и service mesh. SRE без сетевого инструментария — наполовину слепой инженер: половина инцидентов начинается на сетевом уровне, и без умения читать handshake / packet capture / timeline-связь между сетевыми событиями диагностика превращается в гадание.

## Что должен уметь

- **L3** — Понимает базовую модель: TCP, IP, HTTP, DNS, TLS — что каждый слой обеспечивает и как они складываются в стек. Знает, что такое 3-way handshake, RST, ACK, TLS ClientHello.
- **L3** — Использует `ping`, `traceroute`, `dig`, `curl` для базовой диагностики; читает их вывод и отличает «host недоступен» / «DNS не резолвит» / «TLS-handshake падает» / «connection refused» по симптому.
- **L4** — Снимает packet capture (`tcpdump` / `tshark` / Wireshark), читает основные события: handshake, retransmissions, RST, slow ACK. Анализирует TCP-проблемы через `ss` / `netstat` / `iptables`/`nftables`.
- **L4** — Понимает HTTP/2 multiplexing и gRPC поверх него; знает, чем отличаются keep-alive стратегии и как они взаимодействуют с TCP idle timeouts.
- **L4** — Настраивает client/server timeouts на всех слоях (connect / read / write / total); понимает связь с TCP retransmission timer и idle keepalive.
- **L5** — Проектирует resilience сети для сервиса: retries с exponential backoff и jitter, circuit breakers, timeouts на каждом слое, идемпотентность; различает L4 (TCP) и L7 (HTTP) load balancing и знает, когда нужен какой.
- **L5** — Проектирует observability сетевых границ: distributed tracing через сервис-вызовы, RED-метрики на каждом hop, latency budget; диагностирует DNS как часть приложения (resolver behaviour, caching, propagation, monitoring DNS latency).
- **L6+** — Дизайнит сетевую архитектуру сервиса/области: ingress, internal vs external traffic, network policies в k8s, multi-region / multi-AZ, service mesh там, где он оправдан; разбирается в data egress costs и cloud network pricing.
- **L6+** — Учит команду: проводит сетевую диагностику в инцидентах как demonstration, ведёт wheel of misfortune по сетевым сценариям, обновляет runbook'и после каждого нетривиального сетевого инцидента.

## Материалы

### Книги

- W. Richard Stevens — **TCP/IP Illustrated, Vol. 1: The Protocols** (Addison-Wesley, 2-е изд., 2011). База: канонический учебник TCP/IP. Тяжёлый, но если хочешь по-настоящему разобраться — это он.
- Ilya Grigorik — **[High Performance Browser Networking](https://hpbn.co/)** (O'Reilly, 2-е изд., 2013). База: бесплатно онлайн под CC. Современный сетевой стек с фокусом на performance — TCP, UDP, TLS, HTTP/1.1 → HTTP/2, WebSocket, WebRTC.
- Andrew S. Tanenbaum, David J. Wetherall — **Computer Networks** (Pearson, 5-е изд., 2010). Дополнительно: теоретический фундамент, если хочется широты, а не только TCP/IP-практики.

### Статьи и доклады

- Julia Evans — **[Bite Size Networking](https://wizardzines.com/zines/bite-size-networking/)** zines. База: 17 инструментов Linux networking в формате одной страницы каждый — `tcpdump`, `dig`, `nmap`, `ss`, `iptables` и др. Самое доступное введение для on-call'а.
- Cloudflare — **[Everything you ever wanted to know about UDP sockets](https://blog.cloudflare.com/everything-you-ever-wanted-to-know-about-udp-sockets-but-were-afraid-to-ask-part-1/)**. Продвинуто: внутренности UDP socket'ов на Linux, connected vs unconnected, race conditions при graceful restart. Полезно для команд, выходящих за пределы HTTP.
- Istio — **[What is a service mesh?](https://istio.io/latest/about/service-mesh/)**. Дополнительно: каноническое определение service mesh и его capabilities (security, observability, traffic management) — стартовая точка перед погружением в data plane / control plane.

### Инструменты

- **Базовая диагностика** — `ping`, `traceroute`, `mtr` (combines ping + traceroute), `dig`, `nslookup`, `curl`, `wget`. Должны быть в каждом on-call container'е.
- **Продвинутая диагностика** — `tcpdump`, `tshark`, Wireshark, `ss`, `netstat`, `iptables` / `nftables`. Для разбора packet capture и состояния kernel-сетки.
- **Modern observability** — `bpftrace` и `bcc-tools` для eBPF-based трассировки TCP-событий без overhead'а tcpdump на нагруженном production.
- **Service mesh** — **[Envoy](https://www.envoyproxy.io/)** (data plane, базовый proxy), **[Istio](https://istio.io/)** (control plane + Envoy data plane), **[Linkerd](https://linkerd.io/)** (легковесная альтернатива). Выбор оправдан, когда нужны mTLS, traffic shaping и L7-наблюдаемость поверх существующих сервисов без правок кода.

## Best practices

- **Timeouts на каждом слое, не только на топовом.** Антипаттерн: единый «50 секунд на всё» — внутренний downstream висит 49 секунд, и сервис всё равно держит соединение. Правильно: connect timeout (1–3 c), read/write timeout (адаптирован к p99), total timeout (cap для всей операции). Без явных timeout'ов любой сетевой вызов — потенциальный source of cascading failure.
- **Retries только на идемпотентных операциях, с exponential backoff и jitter.** Антипаттерн: retry-storm после общего сбоя — все клиенты одновременно повторяют запрос и добивают и без того страдающий downstream. Jitter (рандомизация задержки) разносит попытки во времени; backoff растягивает интервал. Без обоих — DDoS на свой же сервис.
- **DNS — это часть приложения, а не «infra, которая просто работает».** Антипаттерн: «DNS быстрый, не мониторим». Пять секунд DNS-resolve кладут сервис так же надёжно, как пять секунд БД. Кэширование на уровне клиента (с учётом TTL), monitoring DNS latency, alerting на resolver-проблемы — норма.
- **Circuit breaker для нестабильных downstream.** Антипаттерн: «попробуем ещё раз» бесконечно. CB размыкает цепь после N подряд ошибок и периодически проверяет, восстановился ли downstream — даёт fail fast вместо медленной деградации. Особенно важно на L7-вызовах через service mesh.
- **TLS-сертификаты с истечением — событие в календаре, а не сюрприз.** Антипаттерн: «cert expired» как трёхзвёздочный инцидент. Мониторинг expiry с alerting за 30 / 14 / 7 / 1 день до истечения, автоматизация ротации (cert-manager / Let's Encrypt / Vault), runbook на ручную ротацию — обязательный набор.
- **Distributed tracing на сетевых границах обязателен.** Антипаттерн: «логи разрозненно по сервисам», в инциденте разработчик собирает timeline вручную из 6 grep'ов. Trace ID, проброшенный через каждый hop (HTTP header, gRPC metadata), позволяет восстановить полный путь запроса и точку отказа за секунды.

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — сетевая latency и error rate — основные SLI; алерты на нарушение SLO упираются в качество networking-стека.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — error budget для сетевого слоя (DNS uptime, TLS handshake latency, cross-AZ availability) формулируется на той же модели.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — реализация retries / circuit breaker / timeouts происходит в коде сервиса; знание языка и его сетевых библиотек — половина resilience-практики.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — сетевые инциденты (DNS, TLS, peer'ы, certs, mesh) — отдельный класс с собственным набором диагностических действий.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и для типичных сетевых сценариев (cert expired, DNS resolver down, mesh control plane unhealthy) — must-have в on-call toolkit.

## Открытые вопросы

- **Resilience Patterns** — circuit breaker, bulkhead, rate limiting и т.д. — возможно отдельный лист под `Reliability Engineering` L1 (Engineering ветвь), а не часть Networking. Граница: Networking — про *сеть* как медиум; Resilience Patterns — про *архитектурные паттерны* устойчивости. Решение — при углублении соседнего листа.
- **Operating Systems** (kernel networking, TCP-стек ядра, network namespaces) — пограничная тема между Networking (этим листом) и потенциальным `Operating Systems` под `IT Infrastructure`. Сейчас kernel-уровень упомянут в инструментах (`bpftrace`, `nftables`); отдельный лист возможен при углублении ветви.
