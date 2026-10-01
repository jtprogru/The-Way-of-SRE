// Публикуемые шаблоны документов: что лежит в templates/ и какие листья карты
// эти документы разбирают.
//
// Сами шаблоны — обычные .md в каталоге templates/ в корне репозитория, вне
// сайта: сырой markdown удобнее копировать с GitHub, чем из code block на
// странице. Здесь только перечень, из него рендерится /templates/
// (TemplateList.astro).
//
// Перечень лежит в данных, а не в тексте страницы, по той же причине, что и
// остальное в src/data: список, набранный руками, расходится с каталогом
// молча. Инварианты держит tools/data/check.ts:
//   - у каждой записи есть файл templates/<id>.md;
//   - у каждого файла в templates/, кроме README.md, есть запись;
//   - каждый id в `leaves` существует в roadmap.ts;
//   - связь «шаблон — лист» записана с обеих сторон: лист из `leaves`
//     ссылается на шаблон в своём тексте, а лист, сославшийся на шаблон,
//     назван в `leaves`.
//
// Шаблон называет свои листья одними id, как слои в reliabilityHierarchy.ts:
// имя и адрес листа берутся из карты и разойтись с ней не могут.

import { findLeaf, type LeafNode } from './roadmap.ts';

export interface TemplateEntry {
  /** Имя файла в templates/ без расширения; оно же якорь на странице. */
  id: string;
  /** Название документа в перечне. */
  label: string;
  /** Одна фраза: что это за документ и когда он нужен. */
  gist: string;
  /**
   * id листьев из roadmap.ts, где документ разобран. Может быть пустым:
   * шаблон бывает готов раньше листа, который его объясняет.
   */
  leaves: string[];
}

/** Шаблоны в порядке отображения. */
export const templates: TemplateEntry[] = [
  {
    id: 'slo-doc',
    label: 'SLO-документ',
    gist: 'Что измеряется у одного сервиса, какая цель поставлена и кто за неё отвечает: SLI с явным знаменателем, окно, бюджет ошибок, исключения и порядок пересмотра.',
    leaves: ['slo-engineering'],
  },
  {
    id: 'error-budget-policy',
    label: 'Error Budget Policy',
    gist: 'Что команда делает при разном расходе бюджета ошибок: пороги и действия, условия заморозки релизов и выхода из неё, исключения, эскалация.',
    leaves: ['slo-budget-review', 'slo-engineering'],
  },
  {
    id: 'runbook',
    label: 'Runbook',
    gist: 'Пошаговая реакция дежурного на один алерт: проверка за две минуты, митигация с откатом на каждое действие, эскалация, поиск причины после митигации.',
    leaves: ['runbooks'],
  },
  {
    id: 'rollback-procedure',
    label: 'Процедура отката',
    gist: 'Как откатывают релиз одного сервиса: условия числами, кто решает, что откатывается и чем, чего откат не возвращает, шаги и проверка.',
    leaves: ['progressive-delivery'],
  },
];

/** Путь шаблона от корня репозитория. */
export function templatePath(template: TemplateEntry): string {
  return `templates/${template.id}.md`;
}

/**
 * Адрес шаблона на GitHub. Этим же адресом на шаблон ссылаются листья, и по
 * нему tools/data/check.ts находит такие ссылки в их тексте.
 */
export function templateUrl(template: TemplateEntry): string {
  return `https://github.com/jtprogru/The-Way-of-SRE/blob/main/${templatePath(template)}`;
}

/**
 * Листья шаблона как узлы карты — с актуальными именем и адресом.
 *
 * Неизвестный id роняет сборку, а не пропускает ссылку молча; до сборки то же
 * самое ловит `make data-check` внятным текстом.
 */
export function templateLeaves(template: TemplateEntry): LeafNode[] {
  return template.leaves.map((id) => {
    const leaf = findLeaf(id);
    if (!leaf) {
      throw new Error(`templates: шаблон «${template.id}» ссылается на несуществующий лист «${id}»`);
    }
    return leaf;
  });
}
