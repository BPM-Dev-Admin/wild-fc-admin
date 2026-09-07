# Wild FC Admin

Internal dashboard for Calgary Wild FC staff to review website form submissions.

## Architecture

- The React/Vite single-page app is deployed with a Cloudflare Worker.
- The Worker handles same-origin `/api/*` requests and queries the existing
  `wild-fc-forms` D1 database through the `DB` binding.
- The website repo remains the source of truth for D1 migrations. This repo references
  `../wild-fc/migrations` for local development.
- API responses containing submission data are private and not cached.

## Authentication

Cloudflare Access protects the deployed application, including `/api/*`. There is no
application-managed login or local authentication layer. When configuring Access, make
sure the public `workers.dev` route cannot bypass the protected custom domain.

## Stack

React 19, TypeScript, and Vite, with TanStack Router, TanStack Query, and TanStack Table;
Tailwind CSS 4 with shadcn/ui components; React Hook Form with Zod for validation.

## Getting started

```bash
npm install
npm run db:migrate:local
npm run dev
```

Local Wrangler development uses a local D1 database by default. It does not query the
production database.

Other scripts: `npm run build` (type-check and bundle), `npm run preview` (preview in the
Workers runtime), `npm run lint`, and `npm run deploy`.

## Layout

```
src/
  routes/       file-based routes; the filename is the URL
  components/   app components, with ui/ holding the shared primitives
  lib/          query client, form helpers, page-title helper
  hooks/        shared hooks
```

`@/` is an alias for `src/`. Routes are generated into `src/routeTree.gen.ts` by the Vite
plugin — that file is generated, not edited by hand.

## Deployment

The `DB` binding in `wrangler.jsonc` points at the same `wild-fc-forms` database used by
the website. Run `npm run deploy` after the Cloudflare project and Access application are
ready.
