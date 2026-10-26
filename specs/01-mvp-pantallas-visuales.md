# SPEC 01 — MVP visual de Arcade Vault (pantallas)

> **Status:** Draft
> **Depends on:** Ninguna
> **Date:** 2026-10-23
> **Objective:** Portar a Next.js (App Router) las 5 pantallas de `references/templates/` (biblioteca, detalle, reproductor, auth y salón de la fama) con datos ficticios, sin implementar ningún juego.

---

## Por qué existe esta spec

El repo es el scaffold de `create-next-app` más el tema ya migrado en `app/globals.css` y `app/layout.tsx` (fuentes y fondo). Las plantillas en `references/templates/` son un prototipo SPA (React por CDN, navegación por hash en estado). Esta spec fija cómo se traduce ese prototipo a rutas reales de Next.js 16 y dónde viven los datos ficticios, que más adelante vendrán de una base de datos.

## Alcance

**Dentro:**

- Cinco pantallas con rutas reales del App Router:
  - `/` — Biblioteca (hero, búsqueda por nombre, chips de categoría, grilla de tarjetas con tilt).
  - `/juegos/[id]` — Detalle del juego (portada, tags, estadísticas, tabla "Mejores puntuaciones").
  - `/juegos/[id]/jugar` — Reproductor (HUD, pausa, FIN, pantalla CRT decorativa, modal de fin de juego).
  - `/auth` — Iniciar sesión / Crear cuenta / Jugar como invitado.
  - `/salon` — Salón de la Fama (pestañas por juego, podio, tabla, fila "Tu mejor marca").
- Componentes compartidos: `Nav` (con menú móvil), footer, y estado 404 para un `id` de juego inexistente.
- Datos ficticios como constantes en `app/data/` (juegos, puntuaciones, tipos).
- Sesión simulada en cliente: cualquier credencial "inicia sesión" y guarda `{ name }` en `localStorage`.
- Puntuaciones guardadas desde el modal de fin de juego, persistidas solo en `localStorage`.
- Puntaje simulado en el reproductor (incrementa por intervalo) para que HUD, pausa y modal tengan algo que mostrar.
- Estilos: se reutilizan las clases del tema ya presentes en `app/globals.css`; los `style` inline de las plantillas pasan a utilidades Tailwind usando los tokens de `@theme`.

**Fuera de alcance (para futuras specs):**

- Implementar cualquier juego real (lógica, canvas, controles).
- Autenticación real: backend, OAuth, hashing, tokens. Los botones Google/GitHub son solo visuales.
- Base de datos o API. Los datos viven en `app/data/` como constantes.
- Persistencia de puntuaciones más allá de `localStorage` del cliente.
- Página de perfil de usuario.
- Contador de créditos funcional (queda como texto fijo "CRÉDITOS · 03").
- Tests automatizados (el repo no tiene runner configurado).

## Modelo de datos

```ts
// app/data/types.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type AccentColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;          // slug, ej. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;       // clase CSS de portada ya definida en globals.css, ej. "cover-bricks"
  color: AccentColor;
  best: number;        // mejor puntuación global
  plays: string;       // ya formateado, ej. "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;        // "DD/MM/YYYY"
}

// Usuario simulado y puntuación guardada localmente
export interface SessionUser { name: string }                     // máx. 10 caracteres, mayúsculas
export interface SavedScore { game: string; score: number; name: string; at: number }
```

```ts
// app/data/games.ts   → export const GAMES: Game[]  (8 juegos de data.jsx) y CATS
// app/data/scores.ts  → export const SCORES: Record<string, ScoreRow[]>  (filas fijas por id de juego, ordenadas desc)
```

Claves de `localStorage`: `av_user` (`SessionUser`) y `av_scores` (`SavedScore[]`), igual que la plantilla.

Convenciones:

- Los números se formatean con `toLocaleString("es-ES")`.
- Las puntuaciones en `app/data/scores.ts` son valores fijos escritos en el archivo, sin `Math.random` ni generador con semilla, para que servidor y cliente rendericen lo mismo.

## Plan de implementación

1. Leer en `node_modules/next/dist/docs/01-app` las guías de rutas dinámicas, `generateStaticParams`, `not-found`, Client Components y `cacheComponents`, y ajustar los pasos siguientes a lo que digan.
2. Crear `app/data/types.ts`, `app/data/games.ts` y `app/data/scores.ts` con los 8 juegos de `data.jsx` y 10–12 filas fijas por juego. Verificación: `npm run lint` y `npx tsc --noEmit` pasan.
3. Crear `app/components/session-provider.tsx` (Client Component con contexto: `user`, `login`, `logout`, lectura de `av_user` tras montar) y envolver `children` en `app/layout.tsx`.
4. Crear `app/components/nav.tsx` (Client Component: links con estado activo según `usePathname`, contador de créditos, botón de sesión, menú móvil con backdrop) y el footer; montarlos en `app/layout.tsx`. Verificación: el nav aparece en `/`.
5. Reemplazar `app/page.tsx` por la Biblioteca: hero, búsqueda, chips (Client Component `library.tsx` con filtro) y `game-card.tsx` con efecto tilt. El botón y la tarjeta navegan a `/juegos/[id]`. Estado vacío "NO HAY RESULTADOS".
6. Crear `app/juegos/[id]/page.tsx` (detalle) con `generateStaticParams` y `notFound()` si el `id` no existe. Incluye "JUGAR AHORA" y "VOLVER AL VAULT". Crear `app/juegos/[id]/not-found.tsx` si la guía lo recomienda.
7. Crear `app/auth/page.tsx` con el formulario de pestañas "INICIAR SESIÓN / CREAR CUENTA", botón de invitado y botones sociales decorativos. Al enviar llama a `login` y redirige a `/`.
8. Crear `app/salon/page.tsx` con pestañas por juego, podio, tabla animada y fila "TU MEJOR MARCA" cuando hay sesión.
9. Crear `app/juegos/[id]/jugar/page.tsx` (Client Component para el estado): HUD, pausa, FIN, arena CRT decorativa, puntaje simulado por intervalo, modal de fin de juego que guarda en `av_scores`.
10. Sustituir los `style` inline restantes por utilidades Tailwind y borrar de `app/` el contenido del scaffold que ya no se use (`next.svg` u otros assets sin referencia). Verificación: `npm run build` y `npm run lint` sin errores.

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores.
- [ ] `/` muestra las 8 tarjetas de juego con portada, categoría, descripción corta y mejor puntuación.
- [ ] Escribir "gl" en la búsqueda deja solo la tarjeta GLOTÓN; una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Cada chip de categoría filtra la grilla y "TODOS" la restaura.
- [ ] Hacer clic en una tarjeta o en su botón JUGAR navega a `/juegos/<id>`.
- [ ] `/juegos/<id>` muestra título, descripción larga, 4 tags, tres estadísticas y 10 filas en "MEJORES PUNTUACIONES", con las 3 primeras destacadas.
- [ ] `/juegos/no-existe` muestra la página 404.
- [ ] "JUGAR AHORA" lleva a `/juegos/<id>/jugar` y "VOLVER AL VAULT" a `/`.
- [ ] En `/juegos/<id>/jugar` el puntaje sube solo mientras no hay pausa ni fin de juego.
- [ ] PAUSA detiene el puntaje y muestra "EN PAUSA"; REANUDAR lo retoma.
- [ ] FIN abre el modal con la puntuación final; GUARDAR PUNTUACIÓN escribe una entrada en `localStorage["av_scores"]` y muestra "PUNTUACIÓN GUARDADA".
- [ ] El campo de iniciales del modal convierte a mayúsculas y limita a 10 caracteres.
- [ ] JUGAR DE NUEVO reinicia puntaje, vidas y nivel; SALIR vuelve a `/juegos/<id>`.
- [ ] En `/auth`, la pestaña "CREAR CUENTA" muestra el campo de correo y "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario con usuario "kai" redirige a `/` y el nav muestra "KAI"; recargar la página mantiene el nombre.
- [ ] "JUGAR COMO INVITADO" redirige a `/` y el nav muestra "Iniciar Sesión".
- [ ] Hacer clic en el nombre del usuario en el nav cierra la sesión y borra `av_user`.
- [ ] `/salon` muestra una pestaña por juego (8), el podio con 3 posiciones y una tabla con 12 filas; cambiar de pestaña cambia los datos.
- [ ] En `/salon`, la fila "TU MEJOR MARCA" aparece solo con sesión iniciada.
- [ ] Con sesión iniciada y sin puntuaciones guardadas para el juego activo, la fila "TU MEJOR MARCA" muestra "SIN MARCA AÚN".
- [ ] Tras guardar una puntuación como KAI en un juego, `/salon` muestra esa marca en la fila "TU MEJOR MARCA" de la pestaña de ese juego.
- [ ] A 375 px de ancho el nav muestra el botón hamburguesa y el panel lateral abre y cierra con su backdrop.
- [ ] El link activo del nav se resalta en `/`, `/juegos/*` (Biblioteca) y `/salon`.
- [ ] No hay errores de hidratación ni warnings en la consola del navegador al navegar por las 5 pantallas.
- [ ] No queda ningún `import` de `next/image` ni de assets del scaffold sin usar en `app/`.

## Decisiones tomadas y descartadas

- **Sí:** rutas reales del App Router (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`). Dan URLs compartibles y aprovechan SSR. **No:** SPA con hash y `useState` como la plantilla.
- **Sí:** datos ficticios como constantes tipadas en `app/data/`. Se confirmó que no habrá API ni base de datos en esta spec. **No:** funciones async que simulen una BD; se añadirán cuando exista la BD real.
- **Sí:** puntuaciones fijas escritas en `app/data/scores.ts`. Evitan diferencias servidor/cliente. **No:** generador con semilla de la plantilla (`seededScores`), por la misma razón.
- **Sí:** sesión simulada en `localStorage` (`av_user`) mediante un contexto cliente, igual que la plantilla. Sin autenticación real ni perfil. **No:** cookies ni backend.
- **Sí:** el puntaje del reproductor es simulado y decorativo. El reproductor es una réplica de la plantilla, no un juego.
- **Sí:** reutilizar las clases del tema que ya están en `globals.css` y usar Tailwind para lo que en las plantillas era `style` inline. **No:** reescribir todo el tema como utilidades Tailwind (trabajo grande con riesgo visual y sin beneficio para el MVP).
- **Sí:** "TU MEJOR MARCA" se calcula con el mejor `SavedScore` del usuario en el juego activo desde `av_scores`; si no hay ninguno, muestra "SIN MARCA AÚN". **No:** valor inventado como en la plantilla (`rows[5].score - 2400`). Decisión tomada al redactar la spec, no confirmada explícitamente; se puede revisar al aprobar.
- **Sí:** nombre de carpeta `juegos` para el detalle y el reproductor, por coherencia con el idioma de la interfaz. **No:** `games`.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| `cacheComponents` y `partialPrefetching` cambian cómo se tratan rutas dinámicas y APIs de request. | Paso 1 del plan: leer las guías en `node_modules/next/dist/docs/` antes de escribir código. |
| Leer `localStorage` en el primer render provoca error de hidratación. | El contexto de sesión empieza en `null` y lee `av_user` en un efecto tras montar; los componentes que dependen de él toleran el estado inicial vacío. |
| `localStorage` bloqueado o con JSON corrupto. | Toda lectura/escritura va en `try/catch`; si falla, la sesión y las puntuaciones funcionan solo en memoria. |
| El tilt y el puntaje por intervalo ejecutan efectos solo del cliente. | Esos componentes llevan `"use client"`. La página de detalle queda como Server Component. El salón necesita estado (pestañas) y leer la sesión, así que usa un Client Component para esa parte. |
| Clases de portada (`cover-*`) o animaciones que falten en `globals.css`. | Comparar con `references/templates/styles.css` en el paso 5; actualmente solo difieren las variables de fuente y el id `#root` → `#app-root`. |

## Qué **no** está en esta spec

- Ningún juego jugable (Bloque Buster, Caída, etc.).
- Autenticación real, OAuth, backend o base de datos.
- Persistencia de puntuaciones fuera de `localStorage`.
- Página de perfil de usuario.
- Créditos funcionales.
- Tests automatizados.

Cada uno de estos, si se aborda, va en su propia spec.
