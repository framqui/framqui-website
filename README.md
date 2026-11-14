# Framqui

Sitio personal de Andres Felipe Ramos Quintero (Framqui): perfil, experiencia y un espacio para escritos y notas técnicas. El idioma por defecto es español y el contenido se puede leer también en inglés.

## Desarrollo

```sh
pnpm install
pnpm dev
pnpm check
pnpm build
pnpm preview
```

El servidor de desarrollo queda en `http://localhost:4321`. También se puede dejar en segundo plano con `pnpm exec astro dev --background`, y gestionarlo con `astro dev status`, `astro dev logs` y `astro dev stop`.

## Estructura

```text
public/                 favicon, retrato, robots.txt
src/components/         navegación, perfil, pie y páginas en construcción
src/constants/          rutas, redes y tema
src/content/            perfil, intereses, experiencia y stack en YAML
src/i18n/               textos de la interfaz en es.json y en.json
src/layouts/            BaseLayout.astro
src/lib/                localStorage y carga del perfil
src/pages/              /, /notes, /posts y sitemap.xml
src/styles/global.css   Tailwind y variables de color
```

## Escritos y notas

Las dos secciones siguen en construcción. El contenido futuro se separa así:

- `/posts` (Escritos) son piezas largas: reflexiones sobre desarrollo de productos, ensayos y guías. Cada escrito tiene un tema, un título y una fecha.
- `/notes` (Notas) es una bitácora corta: aprendizajes, fragmentos, decisiones y experimentos. Son más frecuentes y menos elaboradas que un escrito.

## Convenciones

- La interfaz (menú, botones, pie y metadatos) vive en `src/i18n/`. El HTML se renderiza en español y el botón de idioma aplica la otra traducción en el cliente.
- El perfil, la experiencia, los intereses y el stack se editan en `src/content/`. Cada texto tiene versión en español y en inglés. Los componentes los leen con Content Collections.
- `pnpm check` ejecuta `astro check` antes de un build.
- Cada página pasa `title` y `description` a `BaseLayout`.
- El tema y el idioma se guardan en `localStorage` con el prefijo `framqui-`.
- Los `<script>` que importan módulos los procesa Astro. `is:inline` se usa solo en el script de arranque del layout, que tiene que correr antes de pintar la página.
- Cuando exista el dominio público, define `site` en `astro.config.mjs`. Las URLs canónicas y el sitemap usan ese origen.
