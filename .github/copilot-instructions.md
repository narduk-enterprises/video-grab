# GitHub Copilot Instructions

Read `AGENTS.md` at the project root for full project rules and conventions.

## Architecture

This is a **PNPM Workspace Monorepo**. Your application code goes in `apps/web/`. The shared layer at `layers/narduk-nuxt-layer/` provides modules, security middleware, analytics, SEO composables, design tokens, and more — do NOT recreate what the layer already provides.

## Key Rules

- **Nuxt 4 + Nuxt UI 4** on **Cloudflare Workers** — no Node.js modules allowed.
- All frontend code goes in `app/` (Nuxt 4 structure). Use `USeparator` not `UDivider`.
- Every page must call `useSeo()` and a `useSchemaOrg()` helper.
- Use `useAsyncData`/`useFetch` for data fetching, never raw `$fetch` in setup.
- Use `useState()` or Pinia for SSR-safe state, never bare `ref()` at module scope.
- Wrap `window`/`document` access in `onMounted` or `<ClientOnly>`.

## Build Pipeline

`pnpm run quality` (lint + typecheck) → `pnpm run build:plugins` must run before lint.

## Important

- **CRITICAL**: If building a new app from this template, run `pnpm setup` first and verify `git remote -v` does NOT point to `loganrenz/narduk-nuxt-template`.
- Run `/check-*` and `/audit-*` agent workflows for quality audits.
