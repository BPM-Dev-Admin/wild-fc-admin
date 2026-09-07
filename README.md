# App Template

A starting point for internal web apps: a React + TypeScript single-page app with the
routing, data-fetching, forms, and UI layer already wired together, so a new project
begins at "build the features" instead of "assemble the stack."

## What it gives you

- **An app shell that already works** — collapsible sidebar, header with breadcrumbs,
  toasts, and per-route page titles. New pages drop into the existing layout.
- **File-based routing** with typed routes, code splitting, and shared loading, error,
  and not-found states.
- **A component library** — a full set of accessible UI primitives styled with Tailwind,
  plus a reusable data table with sorting, filtering, and pagination.
- **Form and data conventions** — schema-validated forms and a preconfigured query client,
  including helpers for turning server and validation errors into field-level messages.
- **Example pages** (dashboard, transactions, settings) that demonstrate the patterns and
  are meant to be replaced.

There is no backend here. Data is local sample data; wiring it to a real API is the first
job of any project built from this template.

## Stack

React 19, TypeScript, and Vite, with TanStack Router, TanStack Query, and TanStack Table;
Tailwind CSS 4 with shadcn/ui components; React Hook Form with Zod for validation.

## Getting started

```bash
npm install
npm run dev
```

Other scripts: `npm run build` (type-check and bundle), `npm run preview` (serve the
build), `npm run lint`.

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

## Using it

Copy the repo, rename the app in `src/lib/head.ts` and `package.json`, adjust the sidebar
navigation, then delete the example routes and build your own in their place.
