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
        {
          label: 'Ветви',
          items: [
            { label: 'SRE Culture', link: '/sre-culture/' },
            { label: 'SRE Engineering', link: '/sre-engineering/' },
            { label: 'SRE Practices', link: '/sre-practices/' },
          ],
        },
        {
          label: 'О проекте',
          items: [
            { label: 'Мотивация', link: '/about/' },
            { label: 'Формат проекта', link: '/format/' },
            { label: 'Методология', link: '/methodology/' },
          ],
        },
        { label: 'Глоссарий', link: '/glossary/' },
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
                { label: 'Communities of Practice', link: '/leaves/culture/communities-of-practice/' },
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
                { label: 'Symptom vs Cause Alerting', link: '/leaves/engineering/symptom-vs-cause-alerting/' },
                { label: 'Alert Fatigue Management', link: '/leaves/engineering/alert-fatigue-management/' },
                { label: 'SLO Engineering', link: '/leaves/engineering/slo-engineering/' },
                { label: 'Composite SLO Methodology', link: '/leaves/engineering/composite-slo-methodology/' },
                { label: 'Capacity Planning', link: '/leaves/engineering/capacity-planning/' },
                { label: 'Resilience Patterns', link: '/leaves/engineering/resilience-patterns/' },
                { label: 'Chaos Engineering', link: '/leaves/engineering/chaos-engineering/' },
                { label: 'Networking', link: '/leaves/engineering/networking/' },
                { label: 'Operating Systems', link: '/leaves/engineering/operating-systems/' },
                { label: 'Programming Languages', link: '/leaves/engineering/programming-languages/' },
                { label: 'Shell & CLI Craft', link: '/leaves/engineering/shell-cli-craft/' },
                { label: 'CI/CD', link: '/leaves/engineering/ci-cd/' },
                { label: 'Test Strategy', link: '/leaves/engineering/test-strategy/' },
                { label: 'Infrastructure as Code', link: '/leaves/engineering/infrastructure-as-code/' },
                { label: 'GitOps', link: '/leaves/engineering/gitops/' },
                { label: 'Toil Tracking', link: '/leaves/engineering/toil-tracking/' },
                { label: 'Backup & Restore', link: '/leaves/engineering/backup-restore/' },
                { label: 'Cost Management', link: '/leaves/engineering/cost-management/' },
                { label: 'Performance & Profiling', link: '/leaves/engineering/performance-profiling/' },
              ],
            },
            {
              label: 'Practices',
              collapsed: false,
              items: [
                { label: 'Incident Response', link: '/leaves/practices/incident-response/' },
                { label: 'On-Call Rotation', link: '/leaves/practices/on-call-rotation/' },
                { label: 'Severity Classification', link: '/leaves/practices/severity-classification/' },
                { label: 'Customer Communications', link: '/leaves/practices/customer-communications/' },
                { label: 'War Room Patterns', link: '/leaves/practices/war-room-patterns/' },
                { label: 'Blameless Postmortem', link: '/leaves/practices/blameless-postmortem/' },
                { label: 'Action Items Tracking', link: '/leaves/practices/action-items-tracking/' },
                { label: 'Progressive Delivery', link: '/leaves/practices/progressive-delivery/' },
                { label: 'Change Governance', link: '/leaves/practices/change-governance/' },
                { label: 'Secrets Management', link: '/leaves/practices/secrets-management/' },
                { label: 'Threat Modeling', link: '/leaves/practices/threat-modeling/' },
                { label: 'Vulnerability Management', link: '/leaves/practices/vulnerability-management/' },
                { label: 'Supply Chain Security', link: '/leaves/practices/supply-chain-security/' },
                { label: 'Compliance Frameworks', link: '/leaves/practices/compliance-frameworks/' },
                { label: 'Access Control & IAM', link: '/leaves/practices/access-control-iam/' },
                { label: 'Workload Identity', link: '/leaves/practices/workload-identity/' },
                { label: 'Architecture Decision Records', link: '/leaves/practices/architecture-decision-records/' },
                { label: 'One-on-Ones', link: '/leaves/practices/one-on-ones/' },
                { label: 'Personal Growth Plan', link: '/leaves/practices/personal-growth-plan/' },
                { label: 'Vendor Management', link: '/leaves/practices/vendor-management/' },
              ],
            },
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
