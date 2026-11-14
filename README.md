# Framqui

Sitio personal de Andres Felipe Ramos Quintero (Framqui): perfil, experiencia y un espacio para escritos y notas técnicas. El idioma por defecto es español y el contenido se puede leer también en inglés.

## Desarrollo

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

El servidor de desarrollo queda en `http://localhost:4321`. También se puede dejar en segundo plano con `pnpm exec astro dev --background`, y gestionarlo con `astro dev status`, `astro dev logs` y `astro dev stop`.

## Estructura

```text
public/                 favicon, retrato, robots.txt
src/components/         navegación, perfil, pie y páginas en construcción
src/constants/          rutas, redes, tema y datos del perfil
src/i18n/               traducciones es.json y en.json
src/layouts/            BaseLayout.astro
src/lib/                localStorage
src/pages/              /, /notes, /posts y sitemap.xml
src/styles/global.css   Tailwind y variables de color
```

## Convenciones

- Los textos visibles viven en `src/i18n/`. El HTML se renderiza en español y el botón de idioma aplica la otra traducción en el cliente.
- Tecnologías, experiencia, rol, intereses y ubicación se editan en `src/constants/profile.ts`. El perfil y la barra lateral importan ese archivo.
- Cada página pasa `title` y `description` a `BaseLayout`.
- El tema y el idioma se guardan en `localStorage` con el prefijo `framqui-`.
- Los `<script>` que importan módulos los procesa Astro. `is:inline` se usa solo en el script de arranque del layout, que tiene que correr antes de pintar la página.
- Cuando exista el dominio público, define `site` en `astro.config.mjs`. Las URLs canónicas y el sitemap usan ese origen.
