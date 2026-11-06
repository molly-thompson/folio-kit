# [Your Project Name]

A production-ready, opinionated starter template built on **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **Biome**, managed via **pnpm**. Designed for rapid development with strict TypeScript governance, Vitest setup, automated pre-commit quality gates, and containerized deployment.

## 🛠 Tech Stack

* **Framework:** [TanStack Start](https://tanstack.com/start) (Full-stack React with SSR/SSG & file-based routing)
* **Package Manager:** [pnpm](https://pnpm.io/)
* **Containerization:** Docker (`Dockerfile`)
* **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
* **Tooling & Dev Server:** [Vite](https://vitejs.dev/), [Nitro](https://nitro.unjs.io/)
* **Formatting & Linting:** [Biome](https://biomejs.dev/) (Tab-indentation, strict ruleset)
* **Testing:** [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
* **Type Safety:** [TypeScript](https://www.typescriptlang.org/) with `exactOptionalPropertyTypes` and strict checking
* **Git Automation:** [Husky](https://typicode.github.io/husky/), [lint-staged](https://github.com/lint-staged/lint-staged)

## 🚀 Getting Started & Initialization

1. **Generate Your Repository:**
Go to your template repository on GitHub and click the green **"Use this template"** dropdown button, then select **"Create a new repository"**. Give your new project a name and choose whether it's public or private.

2. **Clone Your New Repository:**
Once GitHub generates your new repository, copy its HTTPS or SSH clone URL. Open your terminal and run the clone command, then `cd` straight into your new project folder:

```bash
git clone https://github.com/your-username/your-new-project-name.git
cd your-new-project-name
```

3. **Run the Interactive Setup Script:**

Now that you're inside the project root, run the setup script. This is the custom Node script you built that will automatically prompt you for your project name, description, author, and GitHub username, and then rewrite your `package.json` and `README.md` metadata for you:

```bash
node setup.js
```

4. **Install Dependencies & Start Dev Server:**

With your project metadata updated, install your packages using `pnpm` and spin up your local dev server:

```bash
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3000`.

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts Vite dev server on port `3000` |
| `pnpm build` | Runs typechecks and builds the production bundle |
| `pnpm preview` | Previews the local production build |
| `pnpm typecheck` | Runs `tsc --noEmit` across the codebase |
| `pnpm lint` | Checks code against Biome rules |
| `pnpm lint:fix` | Fixes auto-fixable Biome errors and formats code |
| `pnpm format` | Formats codebase using Biome |
| `pnpm test` | Runs Vitest test runner |
| `pnpm coverage` | Generates test coverage report via Vitest |
| `pnpm ci` | Runs total quality verification (`typecheck` + `lint` + `test` + `build`) |

## 🐳 Docker Deployment

This template includes a production-ready `Dockerfile` optimized for building and running the TanStack Start / Nitro server application inside a container.

To build and run the Docker container locally:

```bash

# Build the Docker image

docker build -t your-project-name .

# Run the container on port 3000

docker run -p 3000:3000 your-project-name
```

## 🧩 Adding UI Components (Shadcn)

This template supports adding components using the latest version of [Shadcn UI](https://ui.shadcn.com/). To add a component, run e.g.:

```bash
pnpm dlx shadcn@latest add button
```

## 🗺 Core Architecture & Patterns

### 1. File-Based Routing & Navigation

Routing is managed via **TanStack Router** (`src/routes`). Adding a new file to `./src/routes` auto-generates the route. Use the `Link` component for SPA client navigation:

```tsx
import { Link } from "@tanstack/react-router";

export function Nav() {
    return About;
}
```

### 2. Data Loading

Leverage route `loader` functions to fetch data before a component renders:

```tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/people")({
    loader: async () => {
        const res = await fetch("https://api.example.com/people");
        return res.json();
    },
    component: PeopleView,
});
```

### 3. Server Functions & API Routes

Write type-safe server-side logic using TanStack Start server functions:

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({ method: 'GET' }).handler(async () => {
    return new Date().toISOString()
})
```

## 🚢 Deployment (Nitro)

This project uses **Nitro** as a generic server adapter, producing a self-contained Node server in `.output/`.

```bash
pnpm build
node .output/server/index.mjs
```

To deploy, push the `.output/` directory or use the provided `Dockerfile` on your host (Render, Fly.io, VPS, etc.). For host-specific presets see the [Nitro Deployment Docs](https://v3.nitro.build/deploy).

## 🔒 Quality Gates & Governance

### Husky & Pre-Commit Hooks

Pre-commit hooks are enforced via **Husky** and **lint-staged**. Staged files are automatically validated and formatted on commit:

* **TypeScript Files (`*.ts`):** Checks types (`tsc --noEmit --skipLibCheck`)
* **Codebase (`*.ts, *.js, *.css, *.json, *.html`):** Autofixes formatting & linting issues via Biome

### Continuous Integration (CI)

An isolated GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push and all pull requests, validating:

1. `typecheck`
2. `lint`
3. `test`
4. `build`

If you'd like to ensure these checks pass before being merged, you can enforce this by creating a branch protection rule in your GitHub repository settings.

## 📁 Project Architecture & Demo Files

* **`src/routes/`** — File-based routing (TanStack Router).
* **`setup.js`** — Interactive repository initialization script.
* **`Dockerfile`** — Containerization configuration for production builds.
* **`.github/workflows/ci.yml`** — Automated CI quality gate.
* **`.husky/`** — Local pre-commit hook automation.

---

## 📚 Learn More

* [TanStack Start Documentation](https://tanstack.com/start)
* [Biome Documentation](https://biomejs.dev/)
* [Tailwind CSS v4](https://tailwindcss.com/)
