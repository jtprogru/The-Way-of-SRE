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
.PHONY: help install dev build preview typecheck toc lint style style-ci check clean

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

check: toc lint typecheck style-ci ## Все проверки разом

clean: ## Убрать сборку и кеши
	rm -rf dist .astro
