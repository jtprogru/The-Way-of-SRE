import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import { buildReferenceGroup, buildRoadmapSidebar, buildTopLevelDocNav } from './src/data/sidebar';
import { socials } from './src/data/nav';

// Production config: The Way of SRE roadmap site.
// Деплой автоматический через .github/workflows/deploy-site.yml на push в main.
export default defineConfig({
  site: 'https://jtprogru.github.io',
  base: '/The-Way-of-SRE',
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
      sidebar: [
        { label: 'Карта компетенций', link: '/' },
        { label: 'Roadmap (приоритеты)', link: '/priorities/' },
        ...buildTopLevelDocNav(),
        ...buildRoadmapSidebar(),
        buildReferenceGroup(),
      ],
      customCss: ['./src/styles/custom.css'],
      components: {
        Footer: './src/components/Footer.astro',
        PageTitle: './src/components/PageTitle.astro',
        SocialIcons: './src/components/SocialIcons.astro',
      },
    }),
  ],
});
