# Framqui

Sitio web personal con artículos, prácticas, suscripción por correo y formulario de contacto.

## Requisitos

- **Node.js** >= 22.23.4
- **pnpm**

## Instalación

```bash
pnpm install
```

## Variables de entorno

Copia `.env.example` a `.env` y configura las claves:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `RESEND_API_KEY` | API key de [Resend](https://resend.com/api-keys) para enviar correos |
| `ENCRYPT_KEY` | Clave hexadecimal de 64 caracteres para encriptar los datos de suscriptores |

## Comandos

| Comando | Descripción |
|---|---|
| `pnpm dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Genera el sitio de producción en `./dist/` |
| `pnpm preview` | Previsualiza el build localmente |
| `pnpm notify` | Envía notificaciones a los suscriptores |

## Notificar a suscriptores

Cuando publiques un nuevo artículo o práctica, ejecuta:

```bash
# Para un escrito
pnpm notify --title "Título del artículo" --slug "slug-del-articulo" --type "escrito"

# Para una práctica
pnpm notify --title "Título de la práctica" --slug "slug-de-la-practica" --type "practica"
```

## Contenido

Los artículos y prácticas se almacenan como archivos Markdown:

- **Escritos:** `src/content/posts/*.md`
- **Prácticas:** `src/content/practices/*.md`

Cada archivo requiere este frontmatter:

```yaml
---
title: "Título"
date: "2026-11-16"
description: "Descripción breve"
tags: ["tag1", "tag2"]
---
```

## Servicios externos

- **Resend** — envío de correos de suscripción y notificaciones
- **FormSubmit** — procesamiento del formulario de contacto
- **Giscus** — comentarios en los artículos (GitHub Discussions)

## Licencia

MIT
