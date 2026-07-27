import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import { buildRoadmapSidebar } from './src/data/sidebar';

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
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/jtprogru/The-Way-of-SRE',
        },
        {
          icon: 'telegram',
          label: 'Telegram канал',
          href: 'https://t.me/jtprogru_channel',
        },
        {
          icon: 'comment-alt',
          label: 'Telegram чат',
          href: 'https://t.me/jtprogru_chat',
        },
        {
          icon: 'external',
          label: 'Блог jtprog.ru',
          href: 'https://jtprog.ru/',
        },
      ],
      sidebar: [
        { label: 'Карта компетенций', link: '/' },
        { label: 'Roadmap (приоритеты)', link: '/priorities/' },
        { label: 'Порядок построения', link: '/reliability-hierarchy/' },
        // Ветви, L1 и листья строятся из src/data/roadmap.ts —
        // руками их здесь перечислять не нужно, см. src/data/sidebar.ts.
        ...buildRoadmapSidebar(),
        {
          label: 'Справочник',
          collapsed: true,
          items: [
            { label: 'Глоссарий', link: '/glossary/' },
            { label: 'Методология', link: '/methodology/' },
            { label: 'Формат проекта', link: '/format/' },
            { label: 'Мотивация', link: '/about/' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      components: {
        Footer: './src/components/Footer.astro',
        SocialIcons: './src/components/SocialIcons.astro',
      },
    }),
  ],
});
