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
    leaves: ['slo-budget-review', 'slo-engineering', 'error-budget-gating'],
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
  {
    id: 'toil-log',
    label: 'Toil Log',
    gist: 'Журнал ручной повторяющейся работы команды за период и сводка по нему: доля toil против бюджета, самые дорогие задачи, решения.',
    leaves: ['toil-tracking'],
  },
  {
    id: 'incident-postmortem',
    label: 'Постмортем',
    gist: 'Документ разбора инцидента: хронология на фактах, факторы вклада вместо корневой причины, action items с владельцем, сроком и критерием готовности.',
    leaves: ['blameless-postmortem'],
  },
  {
    id: 'adr',
    label: 'ADR',
    gist: 'Запись одного значимого технического решения: контекст с ограничениями и критериями, рассмотренные варианты, выбор и последствия с обеих сторон.',
    leaves: ['architecture-decision-records'],
  },
  {
    id: 'sre-review-monthly',
    label: 'Ежемесячный SRE Review',
    gist: 'Повестка и протокол ежемесячного обзора всех операционных практик команды: от SLO и постмортемов до toil и дежурств, с таблицей решений в конце.',
    leaves: ['slo-budget-review'],
  },
  {
    id: 'capacity-plan',
    label: 'Capacity Plan',
    gist: 'Сколько ресурсов понадобится сервису на горизонте планирования и когда начать действовать: допущения, пороги насыщения, прогноз, сроки поставки, точки действия.',
    leaves: ['capacity-planning'],
  },
  {
    id: 'production-readiness-review',
    label: 'Production Readiness Review',
    gist: 'Проверка готовности сервиса к продакшну и запись её результата: чек-лист по шести блокам, исключения с владельцем и сроком, решение.',
    leaves: [],
  },
  {
    id: 'disaster-recovery-plan',
    label: 'Disaster Recovery Plan',
    gist: 'Как сервис восстанавливается после катастрофы: RTO и RPO с обоснованием, права решения, копии с датой проверки, сценарии и учения.',
    leaves: ['backup-restore', 'dr-policy'],
  },
  {
    id: 'sre-maturity-assessment',
    label: 'Оценка зрелости SRE',
    gist: 'Оценка практик SRE по шести областям на шкале от 0 до 5: уровень сейчас с доказательством, целевой уровень, план шагов и сравнение с прошлой оценкой.',
    leaves: [],
  },
  {
    id: 'game-day-playbook',
    label: 'Сценарий Game Day',
    gist: 'Одна тренировка реакции на инцидент: что отрабатываем, сценарий, радиус поражения и условия остановки, хронология, находки и задачи.',
    leaves: ['game-day', 'chaos-engineering'],
  },
  {
    id: 'raci-matrix',
    label: 'Матрица RACI',
    gist: 'Кто за какое решение отвечает: кто делает, кто утверждает, с кем советуются и кого ставят в известность. Одна страница с проверкой на одну A в строке.',
    leaves: ['stakeholder-management', 'dr-policy'],
  },
  {
    id: 'incident-management-policy',
    label: 'Политика управления инцидентами',
    gist: 'Правила реакции команды на инцидент: шкала серьёзности в числах, реакция по уровню, роли, эскалация по таймеру, сводки и разбор после.',
    leaves: ['incident-response', 'severity-classification'],
  },
  {
    id: 'on-call-policy',
    label: 'Политика дежурств',
    gist: 'Как устроено дежурство команды: ротация и покрытие, обязанности дежурного, компенсация и отдых, показатели здоровья дежурства с порогами.',
    leaves: ['on-call-rotation'],
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
