# The Way of SRE — Astro Starlight.
# Команды дублируют npm-скрипты и добавляют стиль-чек листьев (tools/style/).

SHELL := /bin/bash
PYTHON ?= python3
LEAF ?=

.DEFAULT_GOAL := help
.PHONY: help install dev build preview typecheck toc lint style style-ci check clean

help: ## Показать доступные команды
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

node_modules: package.json package-lock.json
	npm install
	@touch node_modules

install: node_modules ## Установить зависимости

dev: node_modules ## Dev-сервер на http://localhost:4321/The-Way-of-SRE/
	npm run dev

build: node_modules ## Билд сайта в dist/
	npm run build

preview: build ## Локальный preview готовой сборки
	npm run preview

typecheck: node_modules ## astro check — типы и структура данных в src/data
	npm run check

toc: node_modules ## Обновить оглавление в README
	npm run toc

lint: node_modules ## Линт markdown
	npm run lint

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
