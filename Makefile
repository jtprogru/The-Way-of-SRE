# The Way of SRE — Astro Starlight.
# Команды дублируют bun-скрипты и добавляют стиль-чек листьев (tools/style/).
#
# Makefile — единственное место, где описано, как проект ставится, проверяется
# и собирается. Workflow в .github/workflows зовут ровно эти цели, поэтому
# «у меня локально прошло» и «в CI прошло» означают одно и то же.

SHELL := /bin/bash
PYTHON ?= python3
LEAF ?=

# GitHub Actions выставляет CI=true сам. Разница между локальной установкой и
# CI — только в этом флаге: в CI лок обязан совпадать с package.json, локально
# bun вправе его дописать. Команда при этом остаётся одна и та же.
BUN_INSTALL_FLAGS := $(if $(CI),--frozen-lockfile,)

.DEFAULT_GOAL := help
.PHONY: help install dev build preview typecheck toc toc-check cover cover-check lint style style-ci data-check check clean

# Порядок целей в check значим: типы раньше сборки, дешёвое раньше дорогого.
.NOTPARALLEL:

help: ## Показать доступные команды
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

# js-yaml в devDependencies никто не импортирует: он там, чтобы в корне
# node_modules лежала версия 4.x. Astro ждёт от неё default-экспорт, а
# markdownlint-cli2 требует ровно 5.2.2 и живёт со своей вложенной копией.
node_modules: package.json bun.lock
	bun install $(BUN_INSTALL_FLAGS)
	@touch node_modules

install: node_modules ## Установить зависимости

dev: node_modules ## Dev-сервер на http://localhost:4321/The-Way-of-SRE/
	bun run dev

build: node_modules ## Билд сайта в dist/
	bun run build

preview: build ## Локальный preview готовой сборки
	bun run preview

typecheck: node_modules ## astro check — типы и структура данных в src/data
	bun run check

toc: node_modules ## Обновить оглавление в README
	bun run toc

# doctoc умеет только править файл на месте, флага «проверь и не трогай» у него
# нет. Поэтому прогон идёт по копии во временном каталоге: README остаётся как
# был, и цель одинаково честна и в чистом CI, и поверх незакоммиченных правок.
toc-check: node_modules ## Проверить, что оглавление README актуально (README не правится)
	@tmp=$$(mktemp -d); cp README.md "$$tmp/README.md"; \
		./node_modules/.bin/doctoc "$$tmp/README.md" --github --notitle >/dev/null; \
		if diff -q README.md "$$tmp/README.md" >/dev/null; then \
			rm -rf "$$tmp"; \
		else \
			echo "README: оглавление устарело, запусти make toc"; \
			diff -u README.md "$$tmp/README.md" | head -40; \
			rm -rf "$$tmp"; exit 1; \
		fi

# Обложка README рисуется из src/data/roadmap.ts (tools/cover/build.ts).
# Как и с оглавлением, в check идёт не перерисовка, а сверка: файлы в logo/
# коммитятся, и цель ловит момент, когда данные ушли вперёд картинки.
cover: node_modules ## Перерисовать обложку README из данных roadmap
	bun run tools/cover/build.ts

cover-check: node_modules ## Проверить, что обложка собрана из текущих данных
	@bun run tools/cover/build.ts --check

# Инварианты графа: страница у каждого L1, файл у каждого листа, инвентарь L2
# без дублей и без выпавших листьев. Astro ничего из этого не проверяет —
# битая ссылка для него просто строка.
data-check: node_modules ## Проверить структурные инварианты src/data/roadmap.ts
	bun run tools/data/check.ts

lint: node_modules ## Линт markdown
	bun run lint

style: ## Стиль-чек листьев; LEAF=<файл.md> — по одному листу
	@if [ -n "$(LEAF)" ]; then \
		$(PYTHON) tools/style/scan_leaf.py "$(LEAF)"; \
	else \
		$(PYTHON) tools/style/scan_leaf.py --all; \
	fi

style-ci: ## Стиль-чек: только детерминированные правила, ненулевой код при нарушении
	@$(PYTHON) tools/style/scan_leaf.py --all --ci

check: toc-check cover-check lint typecheck data-check build style-ci ## Всё, что гоняет CI на PR

clean: ## Убрать сборку и кеши
	rm -rf dist .astro
