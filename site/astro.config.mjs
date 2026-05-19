import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// PoC config: minimal Starlight setup to validate Astro as the
// future home of the SRE roadmap. Production deploy is deferred.
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
      ],
      sidebar: [
        { label: 'Карта компетенций', link: '/' },
        { label: 'Roadmap (приоритеты)', link: '/priorities/' },
        {
          label: 'Ветви',
          items: [
            { label: 'SRE Culture', link: '/sre-culture/' },
            { label: 'SRE Engineering', link: '/sre-engineering/' },
            { label: 'SRE Practices', link: '/sre-practices/' },
          ],
        },
        {
          label: 'Листья',
          items: [
            {
              label: 'SLI-based Alerting',
              link: '/leaves/engineering/sli-based-alerting/',
            },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
