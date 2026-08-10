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

**L3**
- Понимает базовую модель: TCP, IP, HTTP, DNS, TLS — что каждый слой обеспечивает. Знает, что такое 3-way handshake, RST, ACK, TLS ClientHello.
- Использует `ping`, `traceroute`, `dig`, `curl` для базовой диагностики; читает их вывод и отличает «host недоступен» / «DNS не резолвит» / «TLS-handshake падает» / «connection refused» по симптому.

**L4**
- Снимает packet capture (`tcpdump` / `tshark` / Wireshark), читает основные события: handshake, retransmissions, RST, slow ACK. Анализирует TCP-проблемы через `ss` / `netstat` / `iptables` / `nftables`.
- Понимает HTTP/2 multiplexing и gRPC поверх него; знает, чем отличаются keep-alive стратегии и как они взаимодействуют с TCP idle timeouts.
- Настраивает client/server timeouts на всех слоях (connect / read / write / total); понимает связь с TCP retransmission timer и idle keepalive.

**L5**
- Проектирует resilience сети для сервиса: retries с exponential backoff и jitter, circuit breakers, timeouts на каждом слое, идемпотентность; различает L4 (TCP) и L7 (HTTP) load balancing и знает, когда нужен какой.
- Проектирует observability сетевых границ: distributed tracing через сервис-вызовы, RED-метрики на каждом hop, latency budget; диагностирует DNS как часть приложения (resolver behaviour, caching, propagation).

**L6+**
- Дизайнит сетевую архитектуру сервиса/области: ingress, internal vs external traffic, network policies в k8s, multi-region / multi-AZ, service mesh там, где он оправдан; разбирается в data egress costs.
- Учит команду: проводит сетевую диагностику в инцидентах как demonstration, ведёт wheel of misfortune по сетевым сценариям.

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
- **Продвинутая диагностика** — `tcpdump`, `tshark`, Wireshark, `ss`, `netstat`, `iptables` / `nftables`. Для разбора packet capture и состояния сетевого стека ядра.
- **Modern observability** — `bpftrace` и `bcc-tools` для eBPF-based трассировки TCP-событий без overhead'а tcpdump на нагруженном production. По моим наблюдениям, на 2026 это стандарт в командах с серьёзной сетевой нагрузкой.
- **Service mesh** — **[Envoy](https://www.envoyproxy.io/)** (data plane), **[Istio](https://istio.io/)** (control plane + Envoy), **[Linkerd](https://linkerd.io/)** (легковесная альтернатива). Выбор оправдан, когда нужны mTLS, traffic shaping и L7-наблюдаемость без правок кода.

## Best practices

Лучший публичный кейс сетевой сложности, который я знаю, — **Cloudflare 2019-07-02 incident**. Обычное правило в WAF (Web Application Firewall) с регулярным выражением ввело катастрофический backtracking в PCRE; CPU 100% на edge nodes; глобальный outage 27 минут. Сетевой он только формально. Зато показывает, как **сетевой слой** — а WAF стоит ровно на пути запроса — становится источником системного отказа. Postmortem публичен и подробно разобран, и читать его стоит ради одного вывода: логика седьмого уровня на сетевом пути требует такой же осторожности, как код приложения. По моим наблюдениям, это лучший публичный case study на тему «сетевая инфраструктура — это код, который тоже надо тестировать».

Timeouts ставятся на каждом слое, а не только на самом верхнем. Единый «пятьдесят секунд на всё» выглядит аккуратно ровно до момента, когда внутренний downstream висит сорок девять секунд, а сервис всё это время честно держит соединение и тянет за собой всех, кто ждёт его самого. Рабочий набор: connect timeout в одну-три секунды, read и write под реальный p99, total timeout как потолок всей операции. Сетевой вызов без явного таймаута — это заготовка каскадного отказа, других вариантов у него нет.

Retry разрешён только там, где операция идемпотентна, и только с экспоненциальной задержкой и jitter. Иначе получается retry-storm: сбой прошёл, а все клиенты одновременно ломятся обратно и добивают downstream, который только начал вставать. Backoff растягивает интервал. Jitter разносит попытки. Без второго первый почти бесполезен: синхронные клиенты и повторяют синхронно.

Срок жизни TLS-сертификата — событие в календаре, а не сюрприз в три ночи. «Cert expired» в качестве инцидента я до сих пор вижу регулярно, и каждый раз это диагноз не сертификату, а автоматизации. Мониторинг истечения с оповещением за 30, 14, 7 и 1 день, автоматическая ротация через cert-manager, Let's Encrypt или Vault и runbook на случай, когда ротацию всё-таки придётся делать руками, — вот и весь набор, который закрывает этот класс инцидентов целиком.

DNS — часть приложения, а не «инфра, которая просто работает». Позиция «DNS быстрый, мы его не мониторим» ломается на первом же инциденте: пять секунд резолва кладут сервис ровно так же надёжно, как пять секунд ожидания базы. Клиентское кэширование с учётом TTL, метрика latency резолва, алерт на проблемы резолвера — это норма для production, а не роскошь. И отдельная беда таких инцидентов в том, что отвечать за них некому: DNS живёт у инфраструктурной команды, а проявляется на продуктовых сервисах.

Circuit breaker нужен там, где downstream нестабилен. Бесконечное «попробуем ещё раз» убивает сервис медленно. Размыкание цепи после N подряд ошибок с периодической проверкой восстановления даёт быстрый отказ вместо вязкой деградации, и особенно заметно это на вызовах через service mesh. Подробнее — в [Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/).

Distributed tracing на сетевых границах я считаю обязательным. Когда логи разбросаны по сервисам, дежурный в инциденте собирает timeline руками из шести разных grep, и половина времени уходит не на диагноз, а на склейку. Trace ID, проброшенный через каждый hop в HTTP-заголовке или метаданных gRPC, восстанавливает путь запроса и точку отказа за секунды. Разница между «есть tracing» и «нет tracing» — это разница между десятью минутами и двумя часами MTTR на инцидентах в распределённой системе.

## Связанные листья

- **[SLI-based Alerting](/The-Way-of-SRE/leaves/engineering/sli-based-alerting/)** — сетевая latency и error rate — основные SLI; алерты на нарушение SLO упираются в качество сетевого стека.
- **[SLO Engineering](/The-Way-of-SRE/leaves/engineering/slo-engineering/)** — error budget для сетевого слоя (DNS uptime, TLS handshake latency, cross-AZ availability) формулируется на той же модели.
- **[Resilience Patterns](/The-Way-of-SRE/leaves/engineering/resilience-patterns/)** — circuit breaker, retry с backoff/jitter, bulkhead, timeouts на каждом слое — пересечение с сетевой практикой.
- **[Programming Languages](/The-Way-of-SRE/leaves/engineering/programming-languages/)** — реализация retries / circuit breaker / timeouts происходит в коде; знание сетевых библиотек языка — половина практики устойчивости.
- **[Incident Response](/The-Way-of-SRE/leaves/practices/incident-response/)** — сетевые инциденты (DNS, TLS, peer'ы, certs, mesh) — отдельный класс с собственным набором диагностических действий.
- **[Runbooks](/The-Way-of-SRE/leaves/culture/runbooks/)** — runbook'и для типичных сетевых сценариев (cert expired, DNS resolver down, mesh control plane unhealthy).
- **[Operating Systems](/The-Way-of-SRE/leaves/engineering/operating-systems/)** — kernel networking, TCP-стек ядра, network namespaces — соседняя по domain'у тема; границы пересекаются на `tcpdump` / `ss` / `conntrack` / namespaces.
- **[Containerization & Orchestration](/The-Way-of-SRE/leaves/engineering/container-orchestration/)** — CNI plugins, NetworkPolicy, kube-proxy / IPVS, ingress controllers — k8s-native слой сетевой инфраструктуры.
- **[Service Mesh](/The-Way-of-SRE/leaves/engineering/service-mesh/)** — sidecar-proxy для mTLS / traffic shifting / L7-наблюдаемости — отдельная ось сетевой инфраструктуры со своим классом отказов.

## Открытые вопросы

- **Resilience Patterns** уже выделены в отдельный лист под `Reliability Engineering`. Граница: Networking — про *сеть* как медиум; Resilience Patterns — про архитектурные паттерны устойчивости.
