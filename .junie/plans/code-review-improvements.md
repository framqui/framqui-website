---
sessionId: session-261111-191814-10x5
---

# Tareas de Mejora y Bugs Detectados

## Resumen del Proyecto

Sitio personal/portafolio de **Andres Ramos (Framqui)** construido con:
- **Astro 7** + **Tailwind CSS 4** + **astro-icon**
- Tema oscuro/claro con variables CSS
- Navegación lateral fija (sidebar) con menú móvil
- 3 páginas: inicio (bio), posts (en construcción), notas (en construcción)
- Componentes: `BaseLayout`, `SidebarNav`, `MainProfileContent`, `SecondaryDetailsSidebar`, `Footer`, `UnderConstruction`
- Constantes: rutas, redes sociales, temas e idiomas

---

## Lista de Tareas

### 1. Tema no se persiste entre recargas
- **Descripción:** El toggle de tema en `SidebarNav.astro` cambia la clase `light` en el body, pero no guarda la preferencia en `localStorage`. Al recargar la página, el tema vuelve siempre a oscuro.
- **Contexto:** `SidebarNav.astro` (líneas 147-158) alterna la clase `light` en `document.body` sin persistencia.
- **Caso de uso:** Un usuario selecciona tema claro, navega a otra sección o recarga la página, y el tema vuelve a oscuro.
- **Resultado esperado:** La preferencia de tema se guarda en `localStorage` y se restaura al cargar la página.

---

### 2. Toggle de idioma no hace nada funcional
- **Descripción:** El botón de cambio de idioma en `SidebarNav.astro` (líneas 163-171) solo cambia el texto entre "ESPAÑOL" e "INGLÉS", pero no traduce ningún contenido del sitio.
- **Contexto:** `SidebarNav.astro` importa `LANGUAGES` y alterna el texto, pero no existe sistema de i18n ni traducciones en el proyecto.
- **Caso de uso:** Un usuario hace clic en el toggle de idioma esperando que el contenido se traduzca al inglés.
- **Resultado esperado:** O bien se implementa un sistema básico de i18n (ej. contenido en `src/i18n/` con claves de traducción), o se oculta el toggle hasta que esté listo.

---

### 3. Meta tags de SEO faltantes
- **Descripción:** `BaseLayout.astro` solo define `<title>` estático. No incluye `meta description`, `meta og:*`, `meta twitter:*`, ni `meta robots`.
- **Contexto:** `BaseLayout.astro` (líneas 10-13) solo tiene charset, viewport y title.
- **Caso de uso:** El sitio se comparte en redes sociales o aparece en resultados de búsqueda sin descripción ni imagen previa.
- **Resultado esperado:** Cada página tiene meta tags básicos de SEO: description, og:title, og:description, og:image, twitter:card, etc.

---

### 4. Title estático en todas las páginas
- **Descripción:** El `<title>` en `BaseLayout.astro` siempre es "Andres Ramos - Framqui" independientemente de la página visitada.
- **Contexto:** `BaseLayout.astro` (línea 13) hardcodea el título. Las páginas `posts.astro` y `notes.astro` no lo personalizan.
- **Caso de uso:** Un usuario abre la sección de posts y ve el mismo título que en el inicio.
- **Resultado esperado:** `BaseLayout` acepta un `slot` o `prop` para el título, o cada página define su propio `<title>`.

---

### 5. Imagen de perfil sin dimensiones ni loading lazy
- **Descripción:** La imagen `/me.png` en `MainProfileContent.astro` (líneas 204-209) no especifica `width`/`height` ni usa `loading="lazy"`, lo que puede causar layout shift y carga innecesaria.
- **Contexto:** `MainProfileContent.astro` usa `<img>` directamente sin optimización.
- **Caso de uso:** La imagen carga sin dimensiones conocidas, causando movimiento del layout (CLS). En móvil se carga aunque no sea visible.
- **Resultado esperado:** La imagen tiene `width` y `height` definidos, usa `loading="lazy"` cuando no está en el viewport inicial, o se usa `<Image>` de Astro para optimización automática.

---

### 6. Datos duplicados entre componentes
- **Descripción:** `SecondaryDetailsSidebar.astro` define su propio `TECH_STACK` (líneas 5-17) que duplica información ya presente en `TECH_GROUPS` de `MainProfileContent.astro`. Además, datos como "Rol", "Experiencia", "Ubicación" e "Intereses" están hardcodeados en ambos componentes.
- **Contexto:** `SecondaryDetailsSidebar.astro` y `MainProfileContent.astro` contienen datos solapados sobre tecnologías, intereses y rol.
- **Caso de uso:** Se actualiza una tecnología en `MainProfileContent` pero se olvida en `SecondaryDetailsSidebar`, generando inconsistencia.
- **Resultado esperado:** Los datos compartidos viven en un único archivo de constantes (ej. `src/constants/profile.ts`) y ambos componentes los importan.

---

### 7. `README.md` no actualizado
- **Descripción:** El `README.md` contiene la plantilla por defecto de Astro Starter Kit con estructura de carpetas que no corresponde al proyecto real.
- **Contexto:** `README.md` muestra `src/components/Welcome.astro` y `src/layouts/Layout.astro` que no existen.
- **Caso de uso:** Un colaborador nuevo lee el README y se confunde sobre la estructura real del proyecto.
- **Resultado esperado:** README refleja la estructura real, describe el propósito del sitio y las convenciones del proyecto.

---

### 8. No existe `robots.txt` ni `sitemap`
- **Descripción:** El proyecto no incluye un archivo `robots.txt` ni genera un sitemap para indexación en buscadores.
- **Contexto:** `public/` solo contiene `favicon.ico`, `favicon.svg` y `me.png`.
- **Caso de uso:** Un buscador intenta indexar el sitio sin instrucciones claras.
- **Resultado esperado:** `public/robots.txt` existe y permite el rastreo; se genera un sitemap (manual o con `@astrojs/sitemap`).

---

### 9. SidebarNav: lógica de ruta no maneja el home correctamente
- **Descripción:** La lógica de `currentPath` en `SidebarNav.astro` (líneas 26-28) quita la barra final de las rutas. Para la ruta `/` (home), `ROUTES.HOME` es `/` y `ROUTES.ABOUT` también es `/`, lo que hace que BIO esté siempre activo en home.
- **Contexto:** `routes.ts` define `HOME: "/"` y `ABOUT: "/"` como la misma ruta. `SidebarNav.astro` calcula `currentPath` para determinar el enlace activo.
- **Caso de uso:** En la página de inicio, el enlace BIO aparece resaltado como activo, pero no existe una página de ABOUT separada.
- **Resultado esperado:** Se elimina el enlace BIO redundante o se crea una ruta `/about` distinta, o se renombra BIO a algo que refleje que es la página de inicio.

---

### 10. Scripts inline sin `is:inline` en Astro
- **Descripción:** Los bloques `<script>` en `SidebarNav.astro` y `SecondaryDetailsSidebar.astro` no usan `is:inline`, lo que puede generar advertencias o comportamiento inesperado en Astro 7.
- **Contexto:** `SidebarNav.astro` (línea 124) y `SecondaryDetailsSidebar.astro` (línea 164) usan `<script>` sin el atributo.
- **Caso de uso:** Al hacer build, Astro puede hygienizar los scripts y romper la funcionalidad del menú móvil o el toggle de tema.
- **Resultado esperado:** Los scripts usan `<script is:inline>` para asegurar que se rendericen correctamente.

---

### 11. Accesibilidad: falta `skip to content` link
- **Descripción:** No existe un enlace de "saltar al contenido" para usuarios de teclado o lectores de pantalla.
- **Contexto:** `BaseLayout.astro` no incluye un skip link antes del sidebar.
- **Caso de uso:** Un usuario navega con Tab y debe pasar por todos los enlaces del sidebar antes de llegar al contenido principal.
- **Resultado esperado:** Un enlace oculto visualmente pero accesible aparece al inicio del body, permitiendo saltar directamente al `<main>`.

---

### 12. Accesibilidad: imagen de perfil sin texto alternativo descriptivo
- **Descripción:** El `alt` de la imagen de perfil es "Andres Ramos" (`MainProfileContent.astro`, línea 206), que es el nombre pero no describe la imagen.
- **Contexto:** La imagen es una foto de perfil personal.
- **Caso de uso:** Un lector de pantalla lee "Andres Ramos" como descripción de la imagen.
- **Resultado esperado:** El `alt` describe brevemente la imagen (ej. "Foto de perfil de Andres Ramos") o se usa `alt=""` si es puramente decorativa y el nombre ya aparece como texto visible.

---

### 13. No hay validación de build (`astro check`)
- **Descripción:** No existe un script en `package.json` que ejecute `astro check` para validar tipos antes de hacer build.
- **Contexto:** `package.json` tiene scripts para `dev`, `build`, `preview`, pero no para `check`.
- **Caso de uso:** Se hace un cambio que introduce un error de TypeScript y no se detecta hasta que se intenta hacer build.
- **Resultado esperado:** Se agrega un script `check` que ejecuta `astro check` y se integra en el flujo de desarrollo.

---

### 14. `pnpm-workspace.yaml` sin contenido útil
- **Descripción:** El archivo `pnpm-workspace.yaml` existe pero no se conoce su contenido; si está vacío o mal configurado, puede causar confusiones.
- **Contexto:** El archivo está en la raíz del proyecto junto a `package.json`.
- **Caso de uso:** Un colaborador intenta instalar dependencias y encuentra configuraciones de workspace innecesarias.
- **Resultado esperado:** Si no se usan workspaces, se elimina el archivo. Si se usan, se configura correctamente.

---

### 15. Contenido hardcodeado en componentes en lugar de usar Content Collections
- **Descripción:** Todo el contenido (experiencias, intereses, stack tecnológico, texto "Sobre mí") está hardcodeado directamente en los componentes como constantes.
- **Contexto:** `MainProfileContent.astro` contiene arrays de datos inline. Astro ofrece Content Collections como alternativa.
- **Caso de uso:** El usuario quiere actualizar su experiencia o agregar una nueva tecnología y debe editar el componente Astro directamente.
- **Resultado esperado:** El contenido se mueve a archivos Markdown o YAML en `src/content/` usando Content Collections de Astro, separando contenido de presentación.

---

### 16. Footer: enlaces a redes con `target="_blank"` en mailto:
- **Descripción:** En `Footer.astro` (líneas 17-19), todos los enlaces de `SOCIAL_LINKS` usan `target="_blank"`, incluyendo el enlace `mailto:` que no debería abrirse en nueva pestaña.
- **Contexto:** `SOCIAL_LINKS` incluye un enlace de tipo `mailto:` que se trata igual que los enlaces externos.
- **Caso de uso:** Un usuario hace clic en CORREO y se abre en una nueva pestaña en lugar de activar el cliente de correo.
- **Resultado esperado:** Los enlaces `mailto:` no usan `target="_blank"` ni `rel="noopener noreferrer"`.

# Delivery Steps

### ✓ Step 1: Entregar listado de tareas de mejora y bugs
Se entrega al usuario un listado completo de tareas de mejora y bugs detectados tras revisar todo el código del proyecto.