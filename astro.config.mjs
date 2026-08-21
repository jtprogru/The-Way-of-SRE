import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import { toStarlightSidebar } from './src/data/sidebar';
import { socials } from './src/data/nav';
import { leavesOf, roadmap } from './src/data/roadmap';

// Адреса до перехода на общее пространство имён ветви: хабы жили под
// /sre-<branch>/, листья — под /leaves/<branch>/. Обе схемы схлопнуты в
// /<branch>/<name>/, а старые ссылки уводили бы в 404: на GitHub Pages нет
// сервера, который бы их подхватил. Astro в статике кладёт по каждому
// адресу страницу с meta-refresh и canonical на новый.
//
// Карта собирается из данных, руками не перечисляется: появился лист —
// редирект ему не нужен, исчез старый адрес — исчезнет и запись.
//
// База в ключ подставляется сама, а в назначение — нет: без BASE редирект
// уводит на jtprogru.github.io/culture/... мимо проекта. Поэтому она здесь
// константой и используется в обоих местах.
const BASE = '/The-Way-of-SRE';

const legacyRedirects = Object.fromEntries(
  roadmap.branches.flatMap((branch) => [
    [`/sre-${branch.id}`, `${BASE}${branch.href}`],
    ...branch.l1.map((l1) => [`/sre-${branch.id}/${l1.id}`, `${BASE}${branch.href}${l1.id}/`]),
    ...branch.l1.flatMap((l1) =>
      leavesOf(l1).map((leaf) => [`/leaves/${branch.id}/${leaf.id}`, `${BASE}${leaf.href}`]),
    ),
  ]),
);

// Production config: The Way of SRE roadmap site.
// Деплой автоматический через .github/workflows/deploy-site.yml на push в main.
export default defineConfig({
  site: 'https://jtprogru.github.io',
  base: BASE,
  redirects: legacyRedirects,
  integrations: [
    starlight({
      title: 'The Way of SRE',
      description: 'Карта компетенций для развития в роли Site Reliability Engineer',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Русский', lang: 'ru' },
      },
      // Соцссылки в шапке; тот же массив рендерит подвал (Footer.astro).
      social: socials,
      // Состав сайдбара целиком из данных: мета-страницы — src/data/nav.ts,
      // ветви, L1 и листья — src/data/roadmap.ts. Перечислять их здесь
      // руками не нужно, форму дерева задаёт src/data/sidebar.ts.
      //
      // Видимый сайдбар рисует свой компонент (components.Sidebar ниже);
      // Starlight использует эту секцию для порядка страниц в пагинации.
      sidebar: toStarlightSidebar(),
      customCss: ['./src/styles/custom.css'],
      // Свёрнутость сайдбара применяется до первой отрисовки: иначе на
      // каждой навигации панель успевала бы мигнуть полной шириной.
      // Тот же приём, что у ThemeProvider самого Starlight.
      head: [
        {
          tag: 'script',
          content:
            "try{if(localStorage.getItem('twos:sidebar')==='collapsed')document.documentElement.dataset.sidebar='collapsed'}catch(e){}",
        },
      ],
      components: {
        Footer: './src/components/Footer.astro',
        MarkdownContent: './src/components/MarkdownContent.astro',
        PageTitle: './src/components/PageTitle.astro',
        Sidebar: './src/components/Sidebar.astro',
        SocialIcons: './src/components/SocialIcons.astro',
      },
    }),
  ],
});
