/// <reference types="astro/client" />

// Компоненты-переопределения (src/components/Footer.astro) импортируют
// дефолтные реализации Starlight через виртуальные модули. Типы для них
// Starlight держит во внутреннем virtual-internal.d.ts, который в проект
// не подтягивается, поэтому объявляем ровно те три, что используем, —
// иначе `astro check` спотыкается на ts(2307).

declare module 'virtual:starlight/components/EditLink' {
  const EditLink: typeof import('@astrojs/starlight/components/EditLink.astro').default;
  export default EditLink;
}

declare module 'virtual:starlight/components/LastUpdated' {
  const LastUpdated: typeof import('@astrojs/starlight/components/LastUpdated.astro').default;
  export default LastUpdated;
}

declare module 'virtual:starlight/components/Pagination' {
  const Pagination: typeof import('@astrojs/starlight/components/Pagination.astro').default;
  export default Pagination;
}
