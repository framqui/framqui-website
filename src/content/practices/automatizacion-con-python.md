---
title: "Automatización de tareas con Python y Scripts"
date: "2026-11-15"
description: "Cómo automatizar tareas repetitivas usando Python y scripts de bash."
tags: ["python", "automatizacion", "scripts", "devops", "bash"]
---

La automatización de tareas repetitivas es una de las habilidades más valiosas para un desarrollador. Python, con su sintaxis clara y su extensa biblioteca estándar, es ideal para este propósito.

## ¿Qué podemos automatizar?

1. **Procesamiento de archivos:** Renombrar, mover, convertir formatos.
2. **Scraping web:** Extraer datos de páginas web.
3. **Envío de reportes:** Generar y enviar correos automáticamente.
4. **Backups:** Copias de seguridad programadas.
5. **Monitoreo:** Verificar el estado de servicios y alertar.

## Ejemplo: Procesar archivos CSV

```python
import csv
import os

def leer_csv(ruta: str) -> list[dict]:
    """Lee un archivo CSV y devuelve una lista de diccionarios."""
    with open(ruta, encoding="utf-8") as f:
        lector = csv.DictReader(f)
        return list(lector)

def filtrar_activos(registros: list[dict]) -> list[dict]:
    """Filtra solo los registros con estado 'activo'."""
    return [r for r in registros if r.get("estado") == "activo"]

def guardar_resultado(registros: list[dict], ruta: str):
    """Guarda los registros filtrados en un nuevo CSV."""
    if not registros:
        return
    campos = registros[0].keys()
    with open(ruta, "w", encoding="utf-8", newline="") as f:
        escritor = csv.DictWriter(f, fieldnames=campos)
        escritor.writeheader()
        escritor.writerows(registros)

# Uso
datos = leer_csv("datos.csv")
activos = filtrar_activos(datos)
guardar_resultado(activos, "activos.csv")
print(f"{len(activos)} registros guardados.")
```

## Scripts de Bash

Para tareas del sistema, los scripts de bash son rápidos y efectivos:

```bash
#!/bin/bash

# Backup de una carpeta
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Copiar archivos modificados hoy
rsync -av --modify-window=1 /datos/ "$BACKUP_DIR/"

# Comprimir el backup
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"

# Eliminar backups mayores a 30 días
find /backups/ -name "*.tar.gz" -mtime +30 -delete

echo "Backup completado: $BACKUP_DIR.tar.gz"
```

## Programar tareas con Cron

Para ejecutar scripts automáticamente, usa `cron`:

| Frecuencia | Expresión cron | Ejemplo |
|---|---|---|
| Cada minuto | `* * * * *` | Monitoreo de servicios |
| Cada hora | `0 * * * *` | Recopilación de métricas |
| Diario | `0 0 * * *` | Envío de reportes |
| Semanal | `0 0 * * 0` | Backup semanal |
| Mensual | `0 0 1 * *` | Limpieza de logs |

Para editar tu crontab:

```bash
crontab -e
```

## Buenas prácticas

- **Loguea todo:** Registra cada acción para depurar problemas.
- **Maneja errores:** Usa `try/except` en Python y `set -e` en bash.
- **No hardcodees rutas:** Usa variables de entorno.
- **Prueba primero:** Ejecuta los scripts en modo seco (`--dry-run`) antes de aplicar cambios.

> La automatización no reemplaza el pensamiento crítico. Siempre verifica que el script haga lo que esperas antes de programarlo.

## Recursos

- [Documentación de Python](https://docs.python.org/)
- [Bash Guide for Beginners](https://mywiki.wooledge.org/BashGuide)
- [Crontab Guru](https://crontab.guru/) — validador de expresiones cron
