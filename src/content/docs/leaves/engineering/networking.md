---
title: Networking
description: Сетевой стек как фундамент надёжности — TCP/IP, DNS, TLS, HTTP/gRPC, resilience patterns
---

:::note[Метаданные листа]
- **Ветвь:** Engineering
- **Путь:** IT Infrastructure / Networking
- **SFIA-уровни:** 3, 4, 5, 6
- **Приоритет:** Must Have
- **Статус:** draft
:::

[SRE](/The-Way-of-SRE/glossary/#sre) без сетевого инструментария — наполовину слепой инженер. Половина инцидентов начинается на сетевом уровне (DNS, TLS, peer'ы, certs, mesh, балансировщик), и без умения читать handshake / packet capture / связывать сетевые события во времени диагностика превращается в гадание. Лист — про базовый набор инструментов: что читать, как снимать packet capture, какие symptom различать с первой минуты инцидента. Соседи под `IT Infrastructure` пока не сделаны — Operating Systems в открытых вопросах.

## Что должен уметь

Главный навык на уровне L4 — снимать и читать **packet capture**. Когда `curl` падает по timeout — это симптом, но не диагноз. Снять `tcpdump`, увидеть, что handshake завершён, а ACK на первый payload не приходит — это уже сужает проблему до 2–3 hypothesis. Я регулярно вижу команды, в которых tcpdump знает один senior; остальные считают сетевые инциденты «магией балансировщика». Этот навык не требует год обучения — нужно один раз пройти Julia Evans zines и регулярно практиковаться.

- **L3** — Понимает базовую модель: TCP, IP, HTTP, DNS, TLS — что каждый слой обеспечивает. Знает, что такое 3-way handshake, RST, ACK, TLS ClientHello.
- **L3** — Использует `ping`, `traceroute`, `dig`, `curl` для базовой диагностики; читает их вывод и отличает «host недоступен» / «DNS не резолвит» / «TLS-handshake падает» / «connection refused» по симптому.
- **L4** — Снимает packet capture (`tcpdump` / `tshark` / Wireshark), читает основные события: handshake, retransmissions, RST, slow ACK. Анализирует TCP-проблемы через `ss` / `netstat` / `iptables` / `nftables`.
- **L4** — Понимает HTTP/2 multiplexing и gRPC поверх него; знает, чем отличаются keep-alive стратегии и как они взаимодействуют с TCP idle timeouts.
- **L4** — Настраивает client/server timeouts на всех слоях (connect / read / write / total); понимает связь с TCP retransmission timer и idle keepalive.
- **L5** — Проектирует resilience сети для сервиса: retries с exponential backoff и jitter, circuit breakers, timeouts на каждом слое, идемпотентность; различает L4 (TCP) и L7 (HTTP) load balancing и знает, когда нужен какой.
- **L5** — Проектирует observability сетевых границ: distributed tracing через сервис-вызовы, RED-метрики на каждом hop, latency budget; диагностирует DNS как часть приложения (resolver behaviour, caching, propagation).
- **L6+** — Дизайнит сетевую архитектуру сервиса/области: ingress, internal vs external traffic, network policies в k8s, multi-region / multi-AZ, service mesh там, где он оправдан; разбирается в data egress costs.
- **L6+** — Учит команду: проводит сетевую диагностику в инцидентах как demonstration, ведёт wheel of misfortune по сетевым сценариям.

## Материалы

### Книги

- W. Richard Stevens — **TCP/IP Illustrated, Vol. 1: The Protocols** (Addison-Wesley, 2-е изд., 2011). Канонический учебник TCP/IP. Тяжёлый, но если хочешь по-настоящему разобраться — это он.
- Ilya Grigorik — **[High Performance Browser Networking](https://hpbn.co/)** (O'Reilly, 2-е изд., 2013). Бесплатно онлайн под CC. Современный стек с фокусом на performance.
- Andrew S. Tanenbaum, David J. Wetherall — **Computer Networks** (Pearson, 5-е изд., 2010). Теоретический фундамент, если хочется широты, а не только TCP/IP-практики.

### Статьи и доклады

- Julia Evans — **[Bite Size Networking](https://wizardzines.com/zines/bite-size-networking/)** zines. 17 инструментов Linux networking в формате одной страницы каждый. По моим наблюдениям, самое доступное введение для on-call — короче и понятнее, чем большинство книг.
- Cloudflare — **[Everything you ever wanted to know about UDP sockets](https://blog.cloudflare.com/everything-you-ever-wanted-to-know-about-udp-sockets-but-were-afraid-to-ask-part-1/)**. Внутренности UDP socket на Linux. Полезно для команд, выходящих за пределы HTTP.
- Istio — **[What is a service mesh?](https://istio.io/latest/about/service-mesh/)**. Каноническое определение service mesh — стартовая точка перед погружением.
- **[Cloudflare 2019-07-02 incident report](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/)** — публичный case study сложного сетевого инцидента — см. ниже.

### Инструменты

- **Базовая диагностика** — `ping`, `traceroute`, `mtr`, `dig`, `nslookup`, `curl`, `wget`. Должны быть в каждом on-call container.
- **Продвинутая диагностика** — `tcpdump`, `tshark`, Wireshark, `ss`, `netstat`, `iptables` / `nftables`. Для разбора packet capture и состояния kernel-сетки.
- **Modern observability** — `bpftrace` и `bcc-tools` для eBPF-based трассировки TCP-событий без overhead'а tcpdump на нагруженном production. По моим наблюдениям, на 2026 это стандарт в командах с серьёзной сетевой нагрузкой.
- **Service mesh** — **[Envoy](https://www.envoyproxy.io/)** (data plane), **[Istio](https://istio.io/)** (control plane + Envoy), **[Linkerd](https://linkerd.io/)** (легковесная альтернатива). Выбор оправдан, когда нужны mTLS, traffic shaping и L7-наблюдаемость без правок кода.

## Best practices

Хороший публичный кейс сетевой сложности — **Cloudflare 2019-07-02 incident**. Регулярное regex-правило в WAF (Web Application Firewall) ввело катастрофический backtracking в PCRE; CPU 100% на edge nodes; глобальный outage 27 минут. Не «сетевой» в традиционном смысле, но иллюстрирует, как **сетевой слой** (WAF на пути запроса) может стать источником systemic failure. Postmortem публичен и подробно разобран — стоит читать для понимания, что L7-логика на сетевом пути требует такой же осторожности, как код приложения. По моим наблюдениям, это лучший публичный case study на тему «сетевая инфраструктура — это код, который тоже надо тестировать».

**Короткие правила:**

- **Timeouts на каждом слое, не только на топовом.** Единый «50 секунд на всё» — внутренний downstream висит 49 секунд, и сервис всё равно держит соединение. Правильно: connect timeout (1–3 c), read/write timeout (адаптирован к p99), total timeout (cap для всей операции). Без явных timeout любой сетевой вызов — потенциальный источник cascading failure.
- **Retries только на идемпотентных операциях, с exponential backoff и jitter.** Retry-storm после общего сбоя — все клиенты одновременно повторяют запрос и добивают downstream. Jitter (рандомизация задержки) разносит попытки во времени; backoff растягивает интервал.
- **TLS-сертификаты с истечением — событие в календаре, а не сюрприз.** «Cert expired» как трёхзвёздочный инцидент — типичный признак отсутствия автоматизации. Мониторинг expiry с alerting за 30 / 14 / 7 / 1 день, автоматизация ротации (cert-manager / Let's Encrypt / Vault), runbook на ручную ротацию — обязательный набор.

Подробнее:

**DNS — это часть приложения, а не «infra, которая просто работает».** «DNS быстрый, не мониторим» — частая позиция, которая ломается при первом DNS-инциденте. Пять секунд DNS-resolve кладут сервис так же надёжно, как пять секунд БД. Кэширование на уровне клиента (с учётом TTL), monitoring DNS latency, alerting на resolver-проблемы — норма для production. Я наблюдаю, что DNS-инциденты часто оказываются «никто не отвечает» — потому что DNS обычно лежит на инфра-команде, а проявляется на product-сервисах.

**Circuit breaker для нестабильных downstream.** «Попробуем ещё раз» бесконечно — путь к slow death сервиса. CB размыкает цепь после N подряд ошибок и периодически проверяет recovery — даёт fail fast вместо медленной деградации. Особенно важно на L7-вызовах через service mesh. Подробнее — в [Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/).

**Distributed tracing на сетевых границах обязателен.** «Логи разрозненно по сервисам» — в инциденте разработчик собирает timeline вручную из 6 grep. Trace ID, проброшенный через каждый hop (HTTP header, gRPC metadata), позволяет восстановить полный путь запроса и точку отказа за секунды. По моим наблюдениям, разница между «есть tracing» и «нет tracing» — это разница между 10-минутным и 2-часовым MTTR на distributed-инциденты.

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — сетевая latency и error rate — основные SLI; алерты на нарушение SLO упираются в качество networking-стека.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — error budget для сетевого слоя (DNS uptime, TLS handshake latency, cross-AZ availability) формулируется на той же модели.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — circuit breaker, retry с backoff/jitter, bulkhead, timeouts на каждом слое — пересечение с networking-практикой.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — реализация retries / circuit breaker / timeouts происходит в коде; знание сетевых библиотек языка — половина resilience-практики.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — сетевые инциденты (DNS, TLS, peer'ы, certs, mesh) — отдельный класс с собственным набором диагностических действий.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и для типичных сетевых сценариев (cert expired, DNS resolver down, mesh control plane unhealthy).

## Открытые вопросы

- **Resilience Patterns** уже выделены в отдельный лист под `Reliability Engineering`. Граница: Networking — про *сеть* как медиум; Resilience Patterns — про архитектурные паттерны устойчивости.
- **Operating Systems** (kernel networking, TCP-стек ядра, network namespaces) — пограничная тема. Сейчас kernel-уровень упомянут в инструментах (`bpftrace`, `nftables`); отдельный лист возможен при углублении ветви.
