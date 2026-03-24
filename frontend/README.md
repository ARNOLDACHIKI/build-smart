# Build Smart Frontend (ICDBO)

This frontend powers the Build Smart experience for ICDBO.

## Stack

- Vite
- React + TypeScript
- Tailwind CSS
- shadcn/ui

## Local development

1. Install dependencies:

```sh
pnpm install
```

2. Start the app in development mode:

```sh
pnpm dev
```

3. Build for production:

```sh
pnpm build
```

4. Run tests:

```sh
pnpm test
```

## Routing notes

- Public routes include landing, search, and solutions.
- Authenticated routes include dashboard, engineer, and portal experiences.

## Deployment

Use the repository deployment guides at the workspace root:

- DEPLOY_VERCEL.md
- DEPLOY_RENDER.md
