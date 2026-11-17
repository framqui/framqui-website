---
title: "Introducción a TypeScript: Tipos y Beneficios"
date: "2026-11-16"
description: "Una guía práctica sobre los tipos en TypeScript y por qué deberían usarlos."
tags: ["typescript", "javascript", "tipos", "frontend"]
---

TypeScript es un superconjunto tipado de JavaScript que compila a JavaScript plano. Añade tipos opcionales, interfaces, y clases al lenguaje, mejorando la legibilidad y la mantenibilidad del código.

## ¿Por qué usar TypeScript?

- **Detección temprana de errores:** El compilador detecta errores antes de ejecutar el código.
- **Mejor autocompletado:** Los IDEs ofrecen sugerencias precisas gracias a los tipos.
- **Documentación viva:** Los tipos actúan como documentación integrada.
- **Refactorización segura:** Cambiar una interfaz afecta solo a los lugares que la usan.

## Tipos básicos

```typescript
// Tipos primitivos
let nombre: string = "Framqui";
let edad: number = 30;
let esActivo: boolean = true;

// Arrays
let lenguajes: string[] = ["TypeScript", "JavaScript", "Python"];

// Tuplas
let coordenada: [number, number] = [10, 20];

// Enum
enum Color {
  Rojo,
  Verde,
  Azul
}

let favorito = Color.Verde;
```

## Interfaces

Las interfaces definen la forma de un objeto:

```typescript
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  edad?: number; // opcional
}

function saludar(usuario: Usuario): string {
  return `Hola, ${usuario.nombre}`;
}

const usuario: Usuario = {
  id: 1,
  nombre: "Andrés",
  email: "andres@ejemplo.com"
};

console.log(saludar(usuario)); // "Hola, Andrés"
```

## Generics

Los generics permiten crear componentes reutilizables que trabajan con múltiples tipos:

```typescript
function identidad<T>(valor: T): T {
  return valor;
}

let resultado = identidad<string>("hola"); // string
let otroResultado = identidad<number>(42); // number
```

## Tabla de comparación

| Característica | JavaScript | TypeScript |
|---|---|---|
| Tipado | Dinámico | Estático |
| Compilación | No requiere | Requiere compilación |
| Interfaces | No | Sí |
| Generics | No | Sí |
| Curva de aprendizaje | Baja | Media |

## Conclusión

> TypeScript no reemplaza JavaScript, lo mejora. Si ya conoces JavaScript, aprender TypeScript es un paso natural hacia código más robusto.

Para más información, consulta la [documentación oficial de TypeScript](https://www.typescriptlang.org/).
