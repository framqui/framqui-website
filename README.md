# Framqui

Blog personal de Andres Ramos.

## Requisitos

- Node.js >= 22.23.4
- pnpm

## Instalación

```bash
pnpm install
cp .env.example .env
```

## Script

```bash
pnpm notify -- --title "Título" --slug "slug-del-escrito" --type escrito
pnpm notify -- --title "Título" --slug "slug-de-la-practica" --type practica

pnpm notify -- --title "Título" --slug "slug" --type escrito --remote
```

## Templates

```yaml
---
title: "Título"
date: "2026-11-16"
description: "Descripción breve"
tags: ["tag1", "tag2"]
---
```

## Servicios

- Cloudflare D1 para la bd.
- Resend envía los correos.
- FormSubmit recibe el formularios.
- Giscus pone los comentarios con GitHub Discussions.

## Licencia

MIT
