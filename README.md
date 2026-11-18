# Framqui

Blog personal de Andres Ramos. Tiene escritos, prácticas, suscripción por correo y un formulario de contacto.

## Requisitos

- Node.js >= 22.23.4
- pnpm

## Instalación

```bash
pnpm install
cp .env.example .env
```

En `.env`:

| Variable | Para qué sirve |
|---|---|
| `RESEND_API_KEY` | Envía el correo de confirmación y los avisos de publicaciones nuevas. |
| `PUBLIC_SITE_URL` | URL pública del sitio. En local: `http://localhost:4321`. |

## Desarrollo local

La base de suscriptores es Cloudflare D1. En local corre dentro del servidor de desarrollo, no hace falta crear nada en Cloudflare.

```bash
pnpm db:migrate:local
pnpm dev
```

El sitio queda en `http://localhost:4321`. La suscripción se prueba en `/suscribite`.

## Cómo funciona la suscripción

1. La persona deja su correo en `/suscribite`.
2. El sitio lo guarda como pendiente y Resend envía solo el correo de confirmación.
3. Al abrir el enlace, pasa a la lista de suscriptores y ve la página de agradecimiento.
4. Publicar un escrito o una práctica no avisa a nadie. Ese envío es manual.

La baja también está en `/suscribite`.

## Avisar de algo nuevo

Después de publicar, desde la carpeta del proyecto:

```bash
# Escrito, contra la base local
pnpm notify -- --title "Título" --slug "slug-del-escrito" --type escrito

# Práctica
pnpm notify -- --title "Título" --slug "slug-de-la-practica" --type practica

# La base de Cloudflare, cuando ya exista
pnpm notify -- --title "Título" --slug "slug" --type escrito --remote
```

`RESEND_API_KEY` tiene que estar en el entorno. El slug es el nombre del archivo sin `.md`.

## Base en Cloudflare

La base local ya existe con el nombre `framqui`. Para la de producción:

```bash
pnpm exec wrangler login
pnpm exec wrangler d1 create framqui
```

Copia el `database_id` que devuelve el comando en `wrangler.json` y aplica las tablas:

```bash
pnpm db:migrate
```

En el Worker de Cloudflare define `RESEND_API_KEY`. El sitio la lee junto con el binding `DB`.

## Contenido

- Escritos: `src/content/posts/*.md`
- Prácticas: `src/content/practices/*.md`

Cada archivo lleva este frontmatter:

```yaml
---
title: "Título"
date: "2026-11-16"
description: "Descripción breve"
tags: ["tag1", "tag2"]
---
```

La portada no sale de estos archivos. Lee el README público de `github.com/framqui/framqui`.

## Servicios

- Cloudflare D1 guarda suscriptores y confirmaciones pendientes.
- Resend envía los correos.
- FormSubmit recibe el formulario de contacto.
- Giscus pone los comentarios de los escritos en GitHub Discussions.

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Sitio local en `localhost:4321`, con la D1 local. |
| `pnpm db:migrate:local` | Crea las tablas en la D1 local. |
| `pnpm db:migrate` | Crea las tablas en la D1 de Cloudflare. |
| `pnpm notify -- …` | Envía el aviso usando la base local. `--remote` usa la de Cloudflare. |
| `pnpm build` | Build de producción. |
| `pnpm preview` | Sirve el build en local. |

## Licencia

MIT
