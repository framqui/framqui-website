---
title: "Configurar PostgreSQL en Docker"
date: 2026-11-08
description: "Guía paso a paso para levantar una base de datos PostgreSQL con Docker y Docker Compose."
tags: ["Docker", "PostgreSQL", "Tutorial"]
---

PostgreSQL es una de las bases de datos relacionales más usadas. Docker permite levantarla en segundos sin instalar nada en la máquina.

## Paso 1: Crear el docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: miapp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Paso 2: Levantar el servicio

```bash
docker-compose up -d
```

## Paso 3: Conectar

```bash
psql -h localhost -U admin -d miapp
```

## Conclusión

Con solo tres pasos tienes PostgreSQL corriendo en un contenedor, listo para desarrollo local.
