import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

// Схема Starlight, расширенная двумя полями листа.
//
// Всё, что можно вывести из графа — ветвь, путь, приоритет, соседи, — живёт
// в src/data/roadmap.ts и рендерится из него (LeafMeta.astro, PageTitle.astro,
// Footer.astro). Здесь только то, чего в графе нет и что относится к листу,
// а не к узлу:
//
//   sfia   — уровни зрелости SFIA, которые лист покрывает; ось ортогональна
//            priority и в roadmap.ts намеренно не отражена (см. /methodology/).
//   status — готовность листа; у draft допустима секция «Открытые вопросы».
//
// Поля объявлены здесь, а не в тексте страницы, чтобы форма проверялась
// сборкой: опечатка в уровне или незнакомый статус валят `astro check`,
// а не тихо доезжают до сайта.
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        /** Уровни SFIA, для которых в листе расписаны умения. Есть только у листьев. */
        sfia: z.array(z.number().int().min(1).max(7)).nonempty().optional(),
        /** Готовность листа. Лист без явного статуса считается черновиком. */
        status: z.enum(['draft', 'review', 'stable']).default('draft'),
      }),
    }),
  }),
};
