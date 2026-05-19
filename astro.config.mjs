import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
              label: 'Culture',
              collapsed: false,
              items: [
                { label: 'SLO / Budget Review', link: '/leaves/culture/slo-budget-review/' },
                { label: 'Runbooks', link: '/leaves/culture/runbooks/' },
                { label: 'Postmortem Culture', link: '/leaves/culture/postmortem-culture/' },
                { label: 'Dev Team Partnership', link: '/leaves/culture/dev-team-partnership/' },
                { label: 'Service Ownership', link: '/leaves/culture/service-ownership/' },
                { label: 'SRE Onboarding', link: '/leaves/culture/sre-onboarding/' },
                { label: 'Career Ladders', link: '/leaves/culture/career-ladders/' },
              ],
            },
            {
              label: 'Engineering',
              collapsed: false,
              items: [
                { label: 'SLI-based Alerting', link: '/leaves/engineering/sli-based-alerting/' },
                { label: 'SLO Engineering', link: '/leaves/engineering/slo-engineering/' },
                { label: 'Networking', link: '/leaves/engineering/networking/' },
                { label: 'Programming Languages', link: '/leaves/engineering/programming-languages/' },
                { label: 'Infrastructure as Code', link: '/leaves/engineering/infrastructure-as-code/' },
                { label: 'Toil Tracking', link: '/leaves/engineering/toil-tracking/' },
                { label: 'Backup & Restore', link: '/leaves/engineering/backup-restore/' },
              ],
            },
            {
              label: 'Practices',
              collapsed: false,
              items: [
                { label: 'Incident Response', link: '/leaves/practices/incident-response/' },
                { label: 'On-Call Rotation', link: '/leaves/practices/on-call-rotation/' },
                { label: 'Blameless Postmortem', link: '/leaves/practices/blameless-postmortem/' },
                { label: 'Progressive Delivery', link: '/leaves/practices/progressive-delivery/' },
                { label: 'Secrets Management', link: '/leaves/practices/secrets-management/' },
                { label: 'Architecture Decision Records', link: '/leaves/practices/architecture-decision-records/' },
                { label: 'One-on-Ones', link: '/leaves/practices/one-on-ones/' },
                { label: 'Personal Growth Plan', link: '/leaves/practices/personal-growth-plan/' },
              ],
            },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
