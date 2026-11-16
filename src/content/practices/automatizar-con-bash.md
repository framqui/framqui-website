---
title: "Automatizar tareas con Bash"
date: 2026-11-12
description: "Cómo crear scripts en Bash para automatizar tareas repetitivas en el desarrollo diario."
tags: ["Bash", "Automatización", "Linux"]
---

Bash es una herramienta poderosa para automatizar tareas repetitivas. Con scripts simples puedes ahorrar tiempo y reducir errores.

## Ejemplo: Script de backup

```bash
#!/bin/bash

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d)

mkdir -p "$BACKUP_DIR"
pg_dump -U admin miapp > "$BACKUP_DIR/backup_$DATE.sql"
echo "Backup completado: $DATE"
```

## Consejos

- Usa `#!/bin/bash` al inicio de cada script.
- Hazlos ejecutables con `chmod +x script.sh`.
- Valida los argumentos con `$1`, `$2`, etc.

## Conclusión

Los scripts en Bash son una habilidad esencial para cualquier desarrollador que trabaje con Linux o servidores.
