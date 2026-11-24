# SPEC 02 — Landing Home de Arcade Vault

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-11-10
> **Objective:** Portar a Next.js la página Home de `references/templates/home-about/` en `/`, mover la Biblioteca a `/biblioteca` y añadir "Inicio" y "Acerca de" al nav.

---

## Por qué existe esta spec

La carpeta `references/templates/home-about/` trae dos páginas nuevas (`home.jsx` y `about.jsx`), un `nav.jsx` actualizado y un `styles.css` con el CSS de ambas. Esta spec cubre solo Home. About va en otra spec.

La plantilla separa Inicio y Biblioteca, pero SPEC 01 dejó la Biblioteca en `/`. Mover la Biblioteca cambia URLs ya implementadas, y por eso se deja escrito aquí.

## Alcance

**Dentro:**

- Página Home en `/` con las secciones de `home.jsx`:
  - Hero con siluetas pixel flotantes, título de tres líneas, dos CTA y señal "DESLIZA".
  - `// 01` ¿POR QUÉ ARCADE VAULT? — 4 tarjetas con ícono pixel.
  - `// 02` JUEGOS DISPONIBLES AHORA — 6 mini-tarjetas y botón "VER TODOS LOS JUEGOS →".
  - Banda de 3 estadísticas.
  - `// 03` ACTIVIDAD EN VIVO — "Últimas puntuaciones" (7 filas) y "Top jugadores · hoy" (5 filas).
  - `// 04` PRECIOS — tarjeta "JUGADOR VAULT" y 3 preguntas frecuentes.
  - CTA final "¿LISTO PARA JUGAR?".
- Efecto de aparición al hacer scroll (`.reveal` → `.in`) con `IntersectionObserver`.
- Mover la Biblioteca actual de `/` a `/biblioteca`, sin cambios de contenido.
- Actualizar todos los links que significan "Biblioteca" para apuntar a `/biblioteca`.
- Nav (escritorio y panel móvil): añadir "Inicio" (`/`) y "Acerca de" (`/about`). El link a `/about` devuelve 404 hasta que exista su spec.
- Datos ficticios de actividad como constantes en `app/data/activity.ts`.
- CSS de Home copiado de la plantilla a `app/globals.css` (bloque `/* ===== HOME PAGE ===== */`).
- Copy ajustado a datos reales cuando el dato sale del catálogo (ver Decisiones).

**Fuera de alcance (para futuras specs):**

- Página About (`about.jsx`), su CSS (`/* ===== ABOUT PAGE ===== */`) y el CSS `/* ===== GAMEPAD ===== */`.
- Crear la ruta `/about` o su `not-found` propio. Se usa el 404 por defecto de Next.
- Actividad y ranking reales (BD, API, tiempo real). Las filas son fijas.
- Cualquier cambio en las pantallas de SPEC 01, salvo los links hacia `/biblioteca`.
- Créditos funcionales, autenticación real, tests automatizados.

## Modelo de datos

```ts
// app/data/types.ts  (se añaden al archivo existente)
export interface ActivityEntry {
  player: string;      // ej. "NEONFOX"
  gameId: string;      // id de un juego de GAMES, ej. "caida"
  score: number;
  ago: string;         // ya formateado, ej. "hace 2 min"
  color: AccentColor;  // color del nombre del jugador
}

export interface TopPlayer {
  rank: number;        // 1..5
  player: string;
  score: number;
}
```

```ts
// app/data/activity.ts
// export const RECENT_ACTIVITY: ActivityEntry[]  (7 filas de home.jsx)
// export const TOP_TODAY: TopPlayer[]            (5 filas de home.jsx)
```

Convenciones:

- Los números se formatean con `toLocaleString("es-ES")`, igual que en SPEC 01.
- El nombre del juego en "Últimas puntuaciones" se resuelve desde `GAMES` con `gameId`, así que se muestra en mayúsculas (`CAÍDA`, no `Caída`).
- El ancho de la barra del top es `100 - índice * 16` por ciento.
- No hay persistencia ni `localStorage` en esta spec.

## Plan de implementación

1. Leer en `node_modules/next/dist/docs/01-app` las guías de `Link`, Server y Client Components, `cacheComponents`, `not-found` y estilos globales, y ajustar los pasos siguientes a lo que digan.
2. Crear `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx` (hero `av-hero` + `Library`). Cambiar a `/biblioteca` los links de "Biblioteca" en `app/components/nav.tsx` (escritorio y móvil, incluido su estado activo), `app/juegos/[id]/not-found.tsx`, `app/juegos/[id]/page.tsx` ("VOLVER AL VAULT"), `app/components/game-player.tsx` ("VOLVER AL VAULT"), `app/components/hall-of-fame.tsx` ("VOLVER A LA BIBLIOTECA") y las dos redirecciones de `app/components/auth-form.tsx`. El logo del nav sigue apuntando a `/`. Verificación: `/biblioteca` muestra la Biblioteca y `/` sigue mostrando la anterior.
3. Añadir `ActivityEntry` y `TopPlayer` a `app/data/types.ts` y crear `app/data/activity.ts` con las filas de `home.jsx`. Verificación: `npx tsc --noEmit` pasa.
4. Copiar a `app/globals.css` el bloque HOME PAGE de la plantilla (`.home` hasta `.reveal.in`, sin ABOUT ni GAMEPAD), más una regla `prefers-reduced-motion` que deja `.reveal` visible y sin transición. Verificación: `npm run build` pasa y la Biblioteca se ve igual.
5. Crear los componentes de Home en `app/components/`:
   - `home-silhouettes.tsx` (las 8 siluetas SVG).
   - `feature-icon.tsx` (iconos GAMEPAD, FREE, TROPHY, ROCKET).
   - `mini-card.tsx` (`Link` a `/juegos/[id]`).
   - `reveal-observer.tsx` (Client Component que observa los `.reveal` y añade `.in`).
6. Reemplazar `app/page.tsx` por la Home (Server Component) con las 6 secciones. Los botones de navegación pasan a `Link` con las clases `btn`. Los `style` inline de la plantilla pasan a utilidades Tailwind, salvo `transitionDelay`, `animationDelay` y el ancho de la barra, que dependen del índice. Verificación: `/` muestra la landing completa.
7. Añadir "Inicio" y "Acerca de" a `app/components/nav.tsx`, en el orden de la plantilla: Inicio, Biblioteca, Salón de la Fama, Acerca de. Estado activo: Inicio solo en `/`, Biblioteca en `/biblioteca` y `/juegos/*`, Acerca de en `/about`.
8. Ajustar el copy a datos reales: estadística de juegos con `GAMES.length` y descripción de "JUEGOS CLÁSICOS" sin nombres que no estén en `GAMES`. Ejecutar `npm run build` y `npm run lint`.

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores.
- [ ] `/` muestra las 6 secciones en orden: hero, `// 01`, `// 02`, estadísticas, `// 03`, `// 04` y CTA final.
- [ ] El hero muestra las 8 siluetas flotantes, el título en 3 líneas y los botones "EXPLORAR JUEGOS" y "CREAR CUENTA".
- [ ] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" navegan a `/biblioteca`.
- [ ] "CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/auth`.
- [ ] "VER SALÓN →" navega a `/salon`.
- [ ] La sección `// 01` muestra 4 tarjetas con ícono, y el hover levanta la tarjeta y resalta su borde con su color.
- [ ] La sección `// 02` muestra las 6 primeras entradas de `GAMES`, y al hacer clic en una navega a `/juegos/<id>`.
- [ ] "Últimas puntuaciones" muestra 7 filas y "Top jugadores · hoy" muestra 5, con las 3 primeras con el estilo `top1`, `top2` y `top3`.
- [ ] Todos los nombres de juego de "Últimas puntuaciones" coinciden con un título de `GAMES`.
- [ ] La primera estadística muestra el número de entradas de `GAMES` (hoy `8`) y no `12+`.
- [ ] Las secciones con `.reveal` aparecen (clase `in`) al entrar en el viewport al hacer scroll.
- [ ] Con `prefers-reduced-motion: reduce` las secciones `.reveal` se ven sin hacer scroll.
- [ ] `/biblioteca` muestra el hero `av-hero` y las 8 tarjetas con búsqueda y chips, igual que `/` en SPEC 01.
- [ ] "VOLVER AL VAULT" (detalle, reproductor y 404) y "VOLVER A LA BIBLIOTECA" (salón) llevan a `/biblioteca`.
- [ ] Iniciar sesión como "kai" o entrar como invitado en `/auth` redirige a `/biblioteca`.
- [ ] El nav muestra, en este orden, Inicio, Biblioteca, Salón de la Fama y Acerca de, y el panel móvil muestra los mismos cuatro links.
- [ ] En `/` solo "Inicio" está activo; en `/biblioteca` y `/juegos/<id>` solo "Biblioteca"; en `/salon` solo "Salón de la Fama".
- [ ] Hacer clic en el logo lleva a `/`.
- [ ] `/about` muestra el 404 de Next.
- [ ] A 375 px de ancho no hay scroll horizontal; las tarjetas de `// 01` van en 1 columna, el mini-rail en 2 y las estadísticas en 1.
- [ ] No hay errores de hidratación ni warnings en la consola del navegador al navegar `/`, `/biblioteca`, `/salon` y `/auth`.
- [ ] `app/globals.css` no contiene las clases `.about*` ni `.gp*` de la plantilla.

## Decisiones tomadas y descartadas

- **Sí:** Home en `/` y Biblioteca en `/biblioteca`. Es lo que pidió el usuario y respeta la separación de la plantilla. **No:** Home en `/inicio` con la Biblioteca en `/`, porque la landing no sería la portada.
- **Sí:** todos los destinos "biblioteca" de la plantilla (VOLVER AL VAULT, post-login, invitado) pasan a `/biblioteca`, porque la plantilla ya los apunta a la Biblioteca y no a Inicio.
- **Sí:** el nav incluye "Acerca de" apuntando a `/about`, aunque dé 404 hasta la spec de About. Decisión explícita del usuario, que prefiere el nav final de la plantilla frente a un link omitido. **No:** omitir el link hasta que exista la página.
- **Sí:** actividad y top como constantes en `app/data/activity.ts`, con filas copiadas de la plantilla. Mantiene la regla de SPEC 01 de datos fijos sin diferencias servidor/cliente. **No:** derivarlas de `SCORES` y `av_scores`, porque "hace 2 min" no se puede calcular con datos fijos y mezclaría `localStorage` en una sección de servidor.
- **Sí:** `gameId` en `ActivityEntry` y nombre resuelto desde `GAMES`. Evita nombres desincronizados con el catálogo. **No:** guardar el título como texto libre. Efecto secundario aceptado: se ve en mayúsculas.
- **Sí:** ajustar el copy a datos reales **solo donde el dato sale del catálogo**: número de juegos (`GAMES.length`), mini-rail (`GAMES.slice(0, 6)`) y nombres de juegos citados. Los textos cualitativos (ej. "MILES DE PARTIDAS", "Nuevos juegos cada mes", "Sin anuncios") se copian literales porque son copy de marketing que no se deriva de ningún dato. Interpretación del usuario "Ajustar a datos reales" tomada al redactar; se puede revisar al aprobar.
- **Sí:** Home como Server Component y un único Client Component pequeño (`reveal-observer.tsx`) para el scroll. **No:** convertir toda la página en cliente.
- **Sí:** copiar el CSS de Home a `globals.css` tal cual y usar Tailwind para los `style` inline, igual que en SPEC 01. **No:** reescribir el tema como utilidades Tailwind.
- **Sí:** dejar fuera el CSS de About y GAMEPAD hasta su spec, para no añadir clases sin uso.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| `.reveal` parte con `opacity: 0`: si el observer falla o el usuario reduce el movimiento, la sección queda invisible. | `prefers-reduced-motion` deja `.reveal` visible (paso 4) y el criterio de aceptación lo verifica. |
| Mover la Biblioteca rompe links que apuntaban a `/`. | El paso 2 lista cada archivo con link a `/`. Los criterios de aceptación cubren detalle, reproductor, 404, salón y auth. |
| `cacheComponents` y `partialPrefetching` cambian cómo se tratan APIs de request. | Paso 1: leer las guías antes de escribir código. La Home no usa APIs dinámicas ni datos de request. |
| `/about` da 404 desde el nav. | Es intencional. Queda como pendiente de la spec de About. |
| Las siluetas absolutas y el `min-height: calc(100vh - 60px)` del hero desbordan en móvil. | Verificar a 375 px; `.home-hero` ya trae `overflow: hidden` en la plantilla. |
| Clases de la plantilla que choquen con Tailwind preflight (como ocurrió con `<mark>` en SPEC 01). | Comparar visualmente la Home con la plantilla (`Arcade Vault.html`) al terminar el paso 6. |

## Qué **no** está en esta spec

- La página About ni su CSS.
- La ruta `/about` o un 404 personalizado para ella.
- Actividad, ranking o estadísticas reales (BD, API o tiempo real).
- Cambios de diseño en Biblioteca, Detalle, Reproductor, Auth o Salón más allá de sus links.
- Créditos funcionales, autenticación real y tests automatizados.

Cada uno de estos, si se aborda, va en su propia spec.
