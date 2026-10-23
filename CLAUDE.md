# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: a platform to play games online and compete for the highest scores. Early stage — currently the untouched `create-next-app` scaffold (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`). The README says the project follows spec-driven development via the `/spec` and `/spec-impl` skills (installed with `npx skills@latest add Klerith/fernando-skills`).

No test runner is configured.

## Next.js version caveat

This uses Next.js 16.4.1 / React 19.3 with breaking changes versus common knowledge (see `AGENTS.md`). Before writing code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`). Use the App Router (`app/`).

## Skill
Usa siempre /frontend-design para diseñar la interfaz de usuario

## Configuration notes

- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, and `experimental.agentFeedback`. `cacheComponents` changes data-fetching/caching semantics, so check the docs before adding fetches or dynamic APIs.
- Tailwind CSS v4 is wired through Turbopack rules (`@tailwindcss/turbopack` loader for `*.css`), configured in `next.config.ts` rather than PostCSS. Theme tokens live in `app/globals.css` (`@theme inline`, light/dark via `prefers-color-scheme`).
- Layouts use the globally available typed `LayoutProps<"/">` helper (no import needed).
- Path alias: `@/*` maps to the repo root.
