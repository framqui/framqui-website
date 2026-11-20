---
title: Variables de entorno, secretos y AWS Parameter Store
date: 2026-11-19
description: Qué son las variables de entorno y los secretos, por qué sacarlos a un .env no basta y cómo centralizarlos y protegerlos en AWS.
tags:
  - aws
  - variables
  - secretos
  - tecnologia
---
# Variables de entorno, secretos y AWS Parameter Store

Una aplicación necesita datos que no forman parte de su lógica —la dirección de una base de datos, una _API key_, una contraseña u otros parámetros—: algunos son simples ajustes para configurarla al arrancar, y otros son información sensible que no quieres que acaben en manos equivocadas. Sacarlos del código a secas tampoco alcanza cuando trabajas con distintos ambientes y cada uno exige su propia configuración aislada.

En este artículo vemos qué son las variables de entorno y los secretos, por qué es crítico controlarlos y cómo gestionarlos en AWS —aunque el mismo criterio sirve con otros proveedores o herramientas, porque lo importante no es el cómo, sino el saber—.


## Variable de entorno

Una **variable de entorno** asocia un nombre con un valor (`NOMBRE=VALOR`) fuera del código fuente para que la aplicación lo lea en ejecución sin tener que escribir ese dato fijo dentro del programa.

En lugar de quemar la configuración en el código, tu aplicación consulta un nombre y recibe el valor que corresponda al entorno donde esté corriendo.

### El valor dentro del código

Si la dirección de la base de datos queda fija en el programa, se ve así:

```TypeScript
# TypeScript
const databaseHost = "localhost:3432";
```

Si llevas esa misma aplicación a otro ambiente con otra dirección, tendrías que editar el código, volver a desplegar y arriesgarte a mezclar valores entre entornos.

### El valor fuera del código

Con una variable de entorno, el código solo pide el valor por su nombre:

```TypeScript
# TypeScript
const databaseHost = process.env.DB_HOST;
```

En desarrollo local puedes apuntar a `localhost:5432` y en producción a `ip-prod:5432`, sin tocar una sola línea de la lógica del programa.

Ese valor se define fuera y se carga en tu aplicación antes de ejecutarse —por ejemplo, desde un archivo `.env`:

```Plaintext
# .env.dev
DB_HOST=localhost:5432
```

### Para qué sirven

Sirven para separar la configuración de la implementación: la misma aplicación corre en distintos ambientes y lo único que cambia es el valor asociado al nombre.

En desarrollo, una base local:

```Plaintext
# .env
DB_HOST=localhost:5432
```

En producción, la base del servidor:

```Plaintext
# .env
DB_HOST=ip-prod:5432
```

En ambos casos el programa lee `process.env.DB_HOST`.

Ten en cuenta que esto no cifra el valor ni lo protege por sí solo: un archivo `.env` no debe subirse a un repositorio público, y el acceso a él debe estar restringido. Además, `process.env` es propio de Node.js; en otro lenguaje o entorno, la forma de leer la variable cambia.

---

## Secretos

Un secreto es un dato sensible que debe protegerse porque, si una persona no autorizada obtiene acceso a él, podría utilizarlo para acceder a sistemas, consultar información privada o realizar operaciones sin permiso.

Imagina que una aplicación necesita conectarse a una base de datos que requiere una contraseña. Si escribimos esa contraseña directamente en el código, cualquier persona que tenga acceso a ese código podría llegar a conocerla y utilizarla.

```typescript
const databasePassword = "MiPassword123";
```

Algunos ejemplos de secretos son:

- Contraseñas de bases de datos.
- Claves privadas y claves de API.
- Tokens de acceso.
- Credenciales de servicios en la nube, como AWS.

Por eso, los secretos deben almacenarse y compartirse mediante mecanismos que permitan controlar su acceso, evitando exponerlos en el código fuente, los repositorios o los registros de la aplicación.

### Qué pasa si se exponen

- Alguien entra con esas credenciales.
- Consulta, modifica o borra datos.
- Una clave de AWS se usa para crear recursos y generar cargos.
- Si la misma credencial se reutiliza, el problema salta a otros sistemas.


No basta con ocultar los secretos. También debemos limitar los permisos de cada credencial, controlar quién puede utilizarla y cambiarla si existe la sospecha de que ha sido expuesta.

### Qué relación tienen con las variables de entorno

La variable de entorno es el mecanismo: un nombre que entrega un valor. El secreto es el tipo de dato: algo que hay que proteger. Una variable puede contener un secreto. No toda variable es un secreto.

Por ejemplo, podemos guardar una contraseña en una variable de entorno:

```txt
# .env
DB_PASSWORD="DATABASE-PASSWORD"
```
`DB_HOST` dice dónde está la base. `DB_PASSWORD` es la llave.

Y acceder a ella desde una aplicación Node.js:

```Typescript
#Typescript
const  = process.env.DB_PASSWORD;
```

Eso la saca del código fuente. No la protege. Si el `.env` se publica, si los permisos del sistema están mal o si el valor aparece en un registro, el secreto quedó expuesto.

Cuando la aplicación corre en la nube, conviene un servicio hecho para guardar secretos: cifra el valor y decide qué aplicación o qué persona puede leerlo.

---

## AWS y Parameter Store (SSM)

**AWS (Amazon Web Services)** es una plataforma de servicios en la nube donde puedes alojar aplicaciones, bases de datos y archivos, además de gestionar permisos, cifrado y configuración sin administrar servidores físicos por tu cuenta.

Dentro de AWS, **Systems Manager Parameter Store** funciona como un almacén centralizado para guardar parámetros de configuración y secretos. En vez de dejar valores fijos en el código o copiar archivos `.env` a mano por cada servidor, la aplicación o el flujo de despliegue consulta los parámetros que necesita bajo una estructura ordenada —por ejemplo:

* `/mi-app/dev/DB_HOST`
* `/mi-app/prod/DB_HOST`
* `/mi-organizacion/mi-app/prod/DB_PASSWORD`

Parameter Store maneja tres tipos de parámetros:

- **String** (texto sin cifrar en Parameter Store),
- **StringList** (listas de texto)
- **SecureString** (valores sensibles cifrados con **AWS KMS**).

El cifrado protege el dato en reposo, pero no sustituye al control de acceso: **IAM** define qué identidad, rol o usuario puede leer el parámetro y usar la clave KMS para descifrarlo.

---
## Cómo funciona la configuración en AWS y en la aplicación

A nivel de arquitectura, el flujo se divide en tres partes:

1. **En AWS (Parameter Store + KMS + IAM):** creas los parámetros por ruta y ambiente, marcas los datos sensibles como `SecureString` y defines políticas IAM con los permisos mínimos necesarios (`ssm:GetParameter`, `ssm:GetParametersByPath`, `ssm:PutParameter` y `kms:Decrypt` cuando aplique).
2. **En la consola / máquina donde corre la aplicación o script:** instalas **AWS CLI** y autenticas el entorno (usando un usuario IAM con credenciales en automatizaciones locales/CI o un rol IAM asociado al entorno en la nube).
3. **En la aplicación:** tu código o proceso de arranque recibe o lee las variables ya cargadas en el entorno (o las descarga a un `.env` temporal/en memoria antes de arrancar), manteniendo la aplicación desacoplada del almacenamiento.

---

## Usuario IAM, política y AWS CLI en la máquina

Para ejecutar comandos de AWS CLI desde la terminal o consola donde corre tu aplicación o script, necesitas crear un **usuario IAM** (en la consola de AWS > IAM > Users), asignarle una **política IAM** acotada a la ruta de tu aplicación/ambiente y generar sus credenciales de acceso para configurar `aws configure`.

### Política IAM de ejemplo (acotada a una ruta y ambiente)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParametersByPath",
        "ssm:PutParameter"
      ],
      "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/mi-app/dev/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": "arn:aws:kms:us-east-1:123456789012:key/tu-key-id"
    }
  ]
}

```

### Instalar y configurar AWS CLI en la consola/entorno

En Linux o macOS (en una terminal o consola dentro del entorno donde ejecutarás los comandos):

```bash
# Bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

aws configure

```

Al ejecutar `aws configure`, ingresas el `AWS Access Key ID`, `AWS Secret Access Key`, la región por defecto (por ejemplo `us-east-1`) y el formato de salida (`json`).

---

## Automatizar subida y descarga de `.env` por ambiente

Para automatizar la sincronización entre un archivo local (como `.env.dev`) y Parameter Store sin escribir cada parámetro a mano, puedes usar dos scripts pequeños en Bash que recorran los pares `CLAVE=VALOR` de un ambiente específico.

### 1. Script para subir variables de entorno a Parameter Store (`push-env.sh`)

Toma un archivo `.env` y un prefijo (como `/mi-app/dev`) y sube cada variable; si el nombre sugiere un secreto (`PASSWORD`, `SECRET`, `KEY`, `TOKEN`), lo guarda como `SecureString`, y si no, como `String`:

```bash
#!/usr/bin/env bash
# Bash
set -euo pipefail

ENV_FILE="${1:-.env.dev}"
PREFIX="${2:-/mi-app/dev}"

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  val="${val%\"}"
  val="${val#\"}"

  param_type="String"
  if [[ "$key" =~ (PASSWORD|SECRET|KEY|TOKEN) ]]; then
    param_type="SecureString"
  fi

  aws ssm put-parameter \
    --name "${PREFIX}/${key}" \
    --value "$val" \
    --type "$param_type" \
    --overwrite > /dev/null

  echo "Subido: ${PREFIX}/${key} (${param_type})"
done < "$ENV_FILE"

```

Uso:

```bash
# Bash
chmod +x push-env.sh
./push-env.sh .env.dev /mi-app/dev

```

### 2. Script para bajar variables de entorno desde Parameter Store (`pull-env.sh`)

Consulta todos los parámetros bajo una ruta (descifrando `SecureString` con `--with-decryption`) y genera el archivo `.env` correspondiente a ese ambiente:

```bash
#!/usr/bin/env bash
# Bash
set -euo pipefail

PREFIX="${1:-/mi-app/dev}"
OUT_FILE="${2:-.env.dev}"

: > "$OUT_FILE"

aws ssm get-parameters-by-path \
  --path "$PREFIX" \
  --recursive \
  --with-decryption \
  --query "Parameters[*].[Name,Value]" \
  --output text | while IFS=$'\t' read -r full_name val; do
    key="${full_name##*/}"
    printf '%s="%s"\n' "$key" "$val" >> "$OUT_FILE"
  done

echo "Generado: $OUT_FILE desde $PREFIX"

```

Uso:

```bash
# Bash
chmod +x pull-env.sh
./pull-env.sh /mi-app/dev .env.dev

```

---

> Estos scripts son de prueba y sirven para validar el flujo inicial: aún falta automatizarlos mejor (manejar paginación, valores complejos y errores) y profundizar en cómo funciona AWS. A continuación te comparto algunos recursos útiles para seguir revisando estos temas.

## Recursos de referencia

* [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html): documentación oficial sobre jerarquías de parámetros, tipos (`String`, `StringList`, `SecureString`) y lectura/escritura.
- [AWS Key Management Service (AWS KMS)](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html): cómo funcionan las claves de cifrado y el permiso `kms:Decrypt` detrás de los parámetros `SecureString`.
- [AWS Identity and Access Management (IAM)](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html): guía para aplicar mínimo privilegio con políticas, usuarios y roles en lugar de credenciales estáticas.
- [Referencia de comandos `aws ssm` en AWS CLI](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ssm/index.html): detalle de opciones como `put-parameter` y `get-parameters-by-path` (incluyendo paginación y cifrado).
- [Guía de configuración de AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html): cómo configurar perfiles, regiones y credenciales en entornos locales o de ejecución.

Si llegaste hasta acá, te invito a suscribirte y seguirme en mis redes sociales: seguiré compartiendo más conocimiento. No olvides dejar un comentario, y si tienes cuenta de GitHub, sígueme por ahí; cualquier _feedback_ o retroalimentación es muy importante para mí. Es mi primer escrito, así que sería de mucha utilidad, y si te gustó, prefiero que tengas las bases antes de llenarte de cosas complejas.
