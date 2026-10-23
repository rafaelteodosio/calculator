Objective
Build a full-stack calculator application with a React frontend and a backend microservice. The frontend should consume the backend API to perform basic and advanced arithmetic operations. Focus on clean design, maintainable code, and testable architecture.Requirements
Functional
Operations:
Addition, Subtraction, Multiplication, Division
Optional: Exponentiation, Square Root, Percentage
Frontend (React):
Intuitive UI for entering input and displaying results
Input validation and error handling
Responsive design (basic mobile support)
Backend (REST API):
Expose endpoints for calculator operations
Validate input and handle edge cases (division by zero, invalid data)
Return results in JSON format
Non-Functional
Clean, readable, and idiomatic code (frontend and backend)
Unit tests covering key functionality for both layers
Documentation: setup instructions, API usage, and design rationale
Optional: Dockerfile for full-stack deployment
Constraints
Frontend: React (TypeScript preferred)
Backend: Node
Deliverables
Git repository with frontend and backend code
README with setup instructions, API examples, and design decisions
Unit tests and coverage report
Optional: Dockerfile to run frontend + backend together
Instructions
Spend ~2–4 hours on this assignment. Prioritize correctness, clarity, and maintainability over extra features.
Share the repository link with us for evaluation.
Share any prompts that you used in your work
Make sure your README includes:
Setup instructions
How to run the frontend and backend
Examples of API calls (if using REST)
Design decisions or assumptions


Plan/Prompt:

# Implementation Prompt: Full-Stack Calculator (React + Node.js)

You are getting this prompt with no other context, and it contains everything you need. Read all of it before you write any code.

---

## 0a. Role and mission

You are a **senior full-stack engineer agent**. Starting from an empty directory, you will build a complete, production-quality **full-stack calculator** made of:

- a **React + TypeScript** single-page frontend with a classic keypad;
- a **Node.js + Express + TypeScript** REST microservice that does all the arithmetic;
- unit tests for both packages, with an enforced coverage gate;
- two Docker deployment modes, GitHub Actions CI, a README and a PROMPTS.md.

**Why this matters:** this is a **take-home assignment**. Reviewers will judge it on **correctness, clarity, maintainability, test quality and documentation**, in that order. Extras earn nothing unless this prompt lists them.

**Timebox:** the brief expects roughly **2 to 4 hours** of work. Correctness, clarity and maintainability come before polish.

- The full milestone list in §9 takes **about 4 to 5 hours**. The **MUST path** (required milestones plus the MUST test rows in §7.0) fits in **about 3.5 hours**.
- **Priority cut:** once you have spent about 3.5 hours, write no more tests beyond the MUST rows. Use the remaining time to finish Docker, CI and the docs. Coverage must still be at least 80%. List every SHOULD row you skipped in your final report.
- Items marked **(stretch)**, including the whole of milestone M13, are optional.

**Do not ask questions.** This prompt is the complete specification. If something is still ambiguous, apply the rule in §0d.

---

## 0b. Context: the assignment brief

Treat this brief (reproduced verbatim, apart from one typo fix) as the source of truth for **requirements**. §0c adds binding implementation decisions on top of it. Where §0c deviates from the brief (the backend language), §0c wins, and the README must explain the deviation.

> **Objective**
> Build a full-stack calculator application with a React frontend and a backend microservice. The frontend should consume the backend API to perform basic and advanced arithmetic operations. Focus on clean design, maintainable code, and testable architecture.
>
> **Requirements**
>
> *Functional*
> - Operations:
>   - Addition, Subtraction, Multiplication, Division
>   - Optional: Exponentiation, Square Root, Percentage
> - Frontend (React):
>   - Intuitive UI for entering input and displaying results
>   - Input validation and error handling
>   - Responsive design (basic mobile support)
> - Backend (REST API):
>   - Expose endpoints for calculator operations
>   - Validate input and handle edge cases (division by zero, invalid data)
>   - Return results in JSON format
>
> *Non-Functional*
> - Clean, readable, and idiomatic code (frontend and backend)
> - Unit tests covering key functionality for both layers
> - Documentation: setup instructions, API usage, and design rationale
> - Optional: Dockerfile for full-stack deployment
>
> **Constraints**
> - Frontend: React (TypeScript preferred)
> - Backend: Go is preferred
>
> **Deliverables**
> - Git repository with frontend and backend code
> - README with setup instructions, API examples, and design decisions
> - Unit tests and coverage report
> - Optional: Dockerfile to run frontend + backend together
>
> **Instructions**
> - Use any AI tooling you would like
> - Spend ~2–4 hours on this assignment. Prioritize correctness, clarity, and maintainability over extras.
> - Push your solution to GitHub, GitLab, or another Git repository.
> - Share the repository link with us for evaluation.
> - Share any prompts that you used in your work
> - Make sure your README includes:
>   - Setup instructions
>   - How to run the frontend and backend
>   - Examples of API calls (if using REST)
>   - Design decisions or assumptions

---

## 0c. Confirmed decisions (final, do not change)

The stakeholder has confirmed these decisions and they are **final**. Do not reopen, weaken or "improve" them.

| # | Decision | Choice | Rationale |
|---|---|---|---|
| D1 | UI model | A classic keypad calculator with **left-to-right chaining**, so `2 + 3 × 4 =` evaluates step by step to `20`. Each binary step makes one API call. Layout (5 rows × 4 keys): `C √ % ÷` / `7 8 9 ×` / `4 5 6 −` / `1 2 3 +` / `0 . ^ =`. The display shows the current input or result, and any errors. | Most users find a basic pocket calculator intuitive. All arithmetic stays on the backend. |
| D2 | API shape | One `POST /api/v1/calculate` endpoint taking `{operation, operands[]}`, plus `GET /api/v1/operations` (lists the supported ops and their arity) and `GET /api/v1/health`. | One validation pipeline serves every operation. Both endpoints are driven by the same operation table, so they cannot drift apart. |
| D3 | Operations | Binary: `add`, `subtract`, `multiply`, `divide`, `power`. Unary: `sqrt`, `percent`. `percent` is `x / 100`, unary like a phone calculator. `sqrt` rejects negative numbers. | Covers every required operation and all three optional ones, with simple and predictable semantics. |
| D4 | Numbers | JS `number` (IEEE-754 float64). Results are rounded to **15 significant digits**, so `0.1 + 0.2` gives `0.3`. **Non-finite results** (Infinity or NaN, for example from `10^400` or `0^-1`) are rejected with an error. | Removes binary noise without an arbitrary-precision library, and the user sees an explicit error instead of `Infinity`. |
| D5 | Backend stack | **Node.js** (not Go) + **Express** + **TypeScript**. Validation with **zod**. Tests with **Vitest + supertest**. **v8** coverage. | One language across the stack, a single toolchain and shared contract types. |
| D6 | Frontend stack | **Vite + React + TypeScript**, **CSS Modules**, **Vitest + React Testing Library**. Component tests mock the API layer. In development the Vite dev server proxies `/api` to the backend. | A standard, minimal modern stack: scoped styles, no UI library, and the same test runner as the backend. |
| D7 | Deployment | **Both** of these: (a) one multi-stage `Dockerfile` where Express serves the built frontend and the API on a single port; (b) a `docker-compose.yml` where nginx serves the frontend and reverse-proxies `/api` to a backend container. | (a) is the easiest to run. (b) shows a typical production topology. |
| D8 | Extras | **Included:** GitHub Actions CI running lint, typecheck, test and coverage for both packages. **Excluded:** OpenAPI spec, keyboard input, calculation history. | Fits the timebox, and CI proves the quality gates are real. |
| D9 | Repo layout | One monorepo using **npm workspaces**: `/backend`, `/frontend`, root `package.json` scripts, `README.md`, `PROMPTS.md`. A coverage threshold of **at least 80%** is enforced and fails the build when it is not met. §7.2 explains what "fails the build" means here. | One clone, one install, one CI pipeline. The coverage gate cannot be bypassed quietly. |

> **Note on the backend language.** The brief says "Go is preferred" for the backend, but the stakeholder has explicitly chosen **Node.js + TypeScript** (D5). This is a deliberate, approved deviation, not an oversight. The README must include a design decision titled "Backend language: Node.js instead of Go" that acknowledges the brief's preference and explains the choice.

---

## 0d. Working rules

1. **Where to work.** Create the repository in a new directory named `calculator/` inside your current working directory. If you were started in an empty directory that is clearly meant for this project, use that directory instead. In the rest of this prompt, "the project directory" means whichever of the two you chose. Put its absolute path in your final report.
2. **Milestones in order.** Work through §9 one milestone at a time. Do not start a milestone until every acceptance criterion of the previous one is met. Run the verification commands after each milestone. If a check fails, fix the problem and rerun the check before you move on.
3. **Long-running processes.** You run non-interactive shell commands, so you cannot press Ctrl-C, and a foreground server would block your shell. Whenever a step starts a server (`node backend/dist/server.js`, `npm run dev`, `npm run dev -w backend`, `npm run dev -w frontend`), do this:
   - Start it in the background with output going to a log file, for example `… > /tmp/calc-srv.log 2>&1 & PID=$!`.
   - Poll until it is ready.
   - Stop it with `kill -INT $PID; wait $PID`.
   - Confirm the port is free afterwards. `lsof -i :3000 -i :5173` should print nothing (an exit status of 1 is expected). If something is still listening, run `lsof -ti :3000 -ti :5173 | xargs kill` and check again.
   - §9 gives the exact scripts.
4. **Commits.**
   - If `<project directory>/.git` does not exist, run `git init -b main` inside the project directory and work on `main`. Confirm that `git -C <project directory> rev-parse --show-toplevel` prints the absolute path of the project directory. If it prints a parent directory, you are inside another repository: run `git init -b main` in the project directory anyway and check again.
   - Commit at least once per milestone, using **Conventional Commits** in the form `type(scope): imperative summary`.
     - Allowed types: `feat`, `fix`, `test`, `docs`, `build`, `ci`, `chore`, `refactor`.
     - Allowed scopes: `backend`, `frontend`, `docker`, `ci`. Leave out the scope for repo-wide changes.
   - **Every commit must pass typecheck, lint and `npx -w <pkg> vitest run`** (no coverage) for every package that has tests at that point.
   - **The 80% coverage gate** (`npm run test -w <pkg>`) applies to every backend commit **from M3 onwards** and to every frontend commit **from M6 onwards**. Earlier commits can contain placeholder or not-yet-tested code. Do not write fake tests to satisfy the gate early, and do not reorder milestones.
   - Run `git status` before each commit. Never commit `node_modules`, `dist`, `coverage` or `.env*`.
   - Follow any commit-attribution rules your environment specifies.
5. **Precedence when sections disagree.**
   1. **§3 (API contract)** wins on every HTTP and API detail.
   2. Otherwise the more specific section wins (§4 for the backend, §5 for the frontend, over the general sections).
   3. Record every conflict you find, and how you resolved it, in your final report.
6. **Do not add excluded features.** These are excluded:
   - an OpenAPI spec, keyboard input (`keydown` listeners), calculation history;
   - CORS, rate limiting, compression, auth, request IDs, pino or winston, dotenv;
   - a database, a shared workspace package;
   - Redux or Zustand, CSS frameworks, UI libraries, i18n;
   - `+/-`, backspace and memory keys;
   - a configurable API base URL.

   The README may list them as future work.
7. **Ambiguity.** If something is genuinely ambiguous, pick the simplest option that fits this prompt and record it under **Assumptions** in the README. Do not stop to ask.
8. **Dependency versions.** Install the current stable release within each major version named in this prompt. If npm reports a peer-dependency conflict, choose the newest set of versions that work together and report it as a deviation.
9. **Honesty.**
   - Every command output you paste into the README must come from a real run.
   - If a tool is unavailable, write the files anyway and validate them statically where you can (for example with `docker compose config` or a YAML parse). In your final report, mark the checks that depend on the missing tool as **"not verified: <reason>"**. Never claim a check passed if you did not run it. Examples of unavailable tools:
     - no Docker daemon;
     - no browser for the manual UI checks;
     - no GitHub authentication.
10. **PROMPTS.md.** Create `PROMPTS.md` and keep it current, following §8.2. It must contain this entire prompt verbatim, and §8.2 explains how to insert it reliably. Use `Rafael Teodosio` placeholders only for content you cannot know, such as the human's planning conversation.
11. **Publishing.** Do **not** create a remote repository or push unless the person running you explicitly asks you to (see §9, M12).

---

## 1. Architecture overview

### 1.1 Runtime topologies

All three modes are **same-origin**: the browser only ever talks to one origin, which is why the backend needs no CORS.

```
(A) Development  (npm run dev)
  Browser ──► Vite dev server :5173 ──┬── static/HMR (frontend/src)
                                      └── /api/* ──proxy──► Express 127.0.0.1:3000 (tsx watch)

(B) Single container  (docker run -p 3000:3000 calculator)
  Browser ──► Express :3000 ──┬── /api/v1/*      → API router (JSON only)
                              ├── /api, /api/*   → 404 JSON (never index.html)
                              └── everything else→ express.static(STATIC_DIR) + index.html fallback

(C) docker-compose  (docker compose up)
  Browser ──► nginx :8080 (container :80) ──┬── /assets/*, /     → static SPA (frontend/dist)
                                             └── /api, /api/*     → proxy_pass http://backend:3000
                                                                    (backend NOT published to host)
```

### 1.2 Module layering

```
backend/src
  contract.ts (types only, byte-identical copy in frontend)
        │
  calculator.ts  (PURE: OPERATIONS table, calculate, finalizeResult, isOperation, listOperations)
  errors.ts      (AppError, MESSAGES)       validation.ts (zod schema)      config.ts (env → AppConfig)
        │                                         │
  controllers/{health,operations,calculate}.ts ◄──┘
        │
  middleware/{noStore,requireJson,methodNotAllowed,notFound,errorHandler,requestLogger,spa}.ts
        │
  routes/api.ts  (createApiRouter)  →  app.ts (createApp: no listen)  →  server.ts (listen + signals)

frontend/src
  api/contract.ts (types) → api/client.ts (fetch, ApiError) → api/errorMessages.ts (code → display text)
        │
  calculator/{types,keys,reducer,selectors}.ts  (PURE state machine, no React)
        │
  calculator/useCalculator.ts  (useReducer + async "thunk" calling api/client)
        │
  components/{Key,Keypad,Display,Calculator}  →  App.tsx  →  main.tsx
```

---

## 2. Repository layout and root tooling

### 2.1 Full tree

```
calculator/
├── .github/workflows/ci.yml
├── backend/
│   ├── package.json             # name "backend", ESM, scripts, deps (§4.2)
│   ├── tsconfig.json            # strict type-check of src + test + configs, noEmit (§4.3)
│   ├── tsconfig.build.json      # emits src → dist (§4.3)
│   ├── eslint.config.js         # ESLint 9 flat config, type-aware (§4.4)
│   ├── vitest.config.ts         # Vitest + v8 coverage, 80% thresholds (§7.2)
│   ├── src/
│   │   ├── contract.ts          # shared API types; byte-identical to frontend/src/api/contract.ts
│   │   ├── config.ts            # loadConfig(env) → { port, nodeEnv, staticDir? }
│   │   ├── errors.ts            # AppError class + MESSAGES
│   │   ├── calculator.ts        # PURE domain
│   │   ├── validation.ts        # zod calculateRequestSchema + toValidationIssues()
│   │   ├── controllers/
│   │   │   ├── health.ts        # getHealth
│   │   │   ├── operations.ts    # getOperations
│   │   │   └── calculate.ts     # postCalculate (pipeline steps 3–7)
│   │   ├── middleware/
│   │   │   ├── noStore.ts       # Cache-Control: no-store
│   │   │   ├── requireJson.ts   # 415 if not application/json (pipeline step 1)
│   │   │   ├── methodNotAllowed.ts  # factory: Allow header + 405
│   │   │   ├── notFound.ts      # 404 NOT_FOUND for unmatched /api/*; exports pathOf()
│   │   │   ├── errorHandler.ts  # central 4-arg error middleware → JSON envelope
│   │   │   ├── requestLogger.ts # requestLogFormat(nodeEnv) → 'dev' | 'combined' | null
│   │   │   └── spa.ts           # mountSpa(app, staticDir)
│   │   ├── routes/
│   │   │   └── api.ts           # createApiRouter(), mounted at /api/v1
│   │   ├── app.ts               # createApp(config?) → Express (no listen)
│   │   └── server.ts            # loadConfig, createApp, listen, SIGTERM/SIGINT
│   └── test/
│       ├── calculator.test.ts   # D-rows
│       ├── validation.test.ts   # V-rows
│       ├── errors.test.ts       # E-rows
│       ├── config.test.ts       # C-rows
│       ├── middleware.test.ts   # M-rows
│       └── api.test.ts          # contract rows 1–44 + A-rows
├── frontend/
│   ├── Dockerfile               # nginx image for compose (§6.3)
│   ├── nginx.conf               # (§6.3)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json            # app + tests (src/**)
│   ├── tsconfig.node.json       # vite.config.ts only
│   ├── vite.config.ts           # Vite + Vitest config, /api proxy
│   ├── eslint.config.js
│   └── src/
│       ├── main.tsx             # createRoot, renders <App/>, imports index.css (excluded from coverage)
│       ├── App.tsx              # <main> + visually hidden <h1>, renders <Calculator/>
│       ├── App.test.tsx
│       ├── index.css            # global reset, design tokens, body background, main layout, .visually-hidden
│       ├── vite-env.d.ts        # /// <reference types="vite/client" />
│       ├── test/setup.ts        # jest-dom matchers + RTL cleanup
│       ├── api/
│       │   ├── contract.ts      # BYTE-IDENTICAL copy of backend/src/contract.ts
│       │   ├── client.ts        # calculate(), ApiError, REQUEST_TIMEOUT_MS
│       │   ├── client.test.ts
│       │   ├── errorMessages.ts # ERROR_DISPLAY_TEXT, toDisplayMessage()
│       │   └── errorMessages.test.ts
│       ├── calculator/          # pure logic; only useCalculator.ts imports React
│       │   ├── types.ts
│       │   ├── keys.ts
│       │   ├── reducer.ts
│       │   ├── reducer.test.ts
│       │   ├── selectors.ts
│       │   ├── selectors.test.ts
│       │   └── useCalculator.ts
│       └── components/
│           ├── Calculator/{Calculator.tsx, Calculator.module.css, Calculator.test.tsx}
│           ├── Display/{Display.tsx, Display.module.css, Display.test.tsx}
│           ├── Keypad/{Keypad.tsx, Keypad.module.css, Keypad.test.tsx}
│           └── Key/{Key.tsx, Key.module.css, Key.test.tsx}
├── docs/
│   └── coverage.md              # committed text coverage report (§7.2)
├── scripts/
│   ├── check-contract.mjs
│   └── coverage-summary.mjs
├── .dockerignore
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierignore
├── .prettierrc.json
├── Dockerfile                   # single image (§6.1)
├── docker-compose.yml           # (§6.3)
├── package.json
├── package-lock.json            # generated by npm install; commit it
├── PROMPTS.md
└── README.md
```

Additional layout rules:

- **No root `tsconfig.base.json`.** Each package's TypeScript and ESLint config stands on its own.
- **No shared workspace package.** §3.2 explains why.
- **Build output** goes to `backend/dist/` and `frontend/dist/`. The Dockerfiles rely on these paths, so do not change Vite's `build.outDir` or `base`.

### 2.2 Node version

- Use **Node 24 LTS** for development, CI and Docker.
- The minimum is **22.12.0**, which Vite requires.
- If `node --version` reports less than 22.12, try `nvm install 24 && nvm use 24`, then `fnm use --install-if-missing 24`, then `volta install node@24`. If none of these version managers is available, stop and report `M0 fail: Node <version> < 22.12, no version manager` under Milestones. Do not lower `engines` and do not remove `engine-strict`.

### 2.3 Root files (create with exactly this content)

`.nvmrc`:

```
24
```

`.npmrc`, so an unsupported Node version fails with a clear message:

```
engine-strict=true
```

`package.json`:

```json
{
  "name": "calculator",
  "version": "1.0.0",
  "private": true,
  "description": "Full-stack calculator: React + TypeScript frontend, Express + TypeScript REST backend.",
  "license": "MIT",
  "workspaces": ["backend", "frontend"],
  "engines": {
    "node": ">=22.12.0",
    "npm": ">=10"
  },
  "scripts": {
    "dev": "concurrently -k -n backend,frontend -c blue,magenta \"npm run dev -w backend\" \"npm run dev -w frontend\"",
    "build": "npm run build --workspaces",
    "start": "npm run start -w backend",
    "test": "npm run test --workspaces",
    "test:coverage": "npm run test --workspaces && node scripts/coverage-summary.mjs",
    "lint": "npm run lint --workspaces",
    "typecheck": "npm run typecheck --workspaces",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check:contract": "node scripts/check-contract.mjs",
    "verify": "npm run check:contract && npm run format:check && npm run lint && npm run typecheck && npm run test:coverage && npm run build",
    "docker:build": "docker build -t calculator .",
    "docker:run": "docker run --rm -p 3000:3000 --name calculator calculator",
    "compose:up": "docker compose up --build",
    "compose:down": "docker compose down"
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

Run `npm install -D concurrently prettier` from the root so the root dev dependencies are recorded in the lockfile. Commit `package-lock.json`. CI and Docker use `npm ci` only.

`.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

`.gitattributes`. Line endings must be LF, otherwise the byte-identical contract check fails on Windows checkouts:

```
* text=auto eol=lf
*.png binary
*.ico binary
```

`.gitignore`:

```
# dependencies
node_modules/

# build output
dist/
*.tsbuildinfo
.vite/

# test coverage (generated; the committed text report is docs/coverage.md)
coverage/

# logs
*.log
npm-debug.log*

# env
.env
.env.*

# OS / editor
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
```

`.prettierrc.json`. It is the only Prettier config in the repo; packages find it by walking up the directory tree:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

`.prettierignore`. `PROMPTS.md` and `docs/coverage.md` are excluded so that pasted text stays verbatim:

```
node_modules
dist
coverage
package-lock.json
PROMPTS.md
docs/coverage.md
```

`scripts/check-contract.mjs`:

```js
// Fails (exit 1) if the two copies of the API contract differ by even one byte.
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const files = ['backend/src/contract.ts', 'frontend/src/api/contract.ts'];

let contents;
try {
  contents = files.map((f) => readFileSync(new URL(f, root)));
} catch (err) {
  console.error(`check:contract: cannot read contract file: ${err.message}`);
  process.exit(1);
}

if (!contents[0].equals(contents[1])) {
  console.error(
    `check:contract: FAILED — ${files[0]} and ${files[1]} differ.\n` +
      'Both copies must be byte-identical. Edit one, then copy it over the other.',
  );
  process.exit(1);
}

console.log(`check:contract: OK — ${files[0]} and ${files[1]} are identical.`);
```

`scripts/coverage-summary.mjs` prints a Markdown coverage table with one row per package, built from each package's `json-summary` reporter output:

```js
// Usage: node scripts/coverage-summary.mjs [workspace ...]   (default: backend frontend)
import { existsSync, readFileSync } from 'node:fs';

const workspaces = process.argv.length > 2 ? process.argv.slice(2) : ['backend', 'frontend'];
const metrics = ['statements', 'branches', 'functions', 'lines'];
const root = new URL('../', import.meta.url);

const rows = [];
let missing = false;
for (const ws of workspaces) {
  const file = new URL(`${ws}/coverage/coverage-summary.json`, root);
  if (!existsSync(file)) {
    console.error(`coverage-summary: no ${ws}/coverage/coverage-summary.json; run "npm run test -w ${ws}" first.`);
    missing = true;
    continue;
  }
  const { total } = JSON.parse(readFileSync(file, 'utf8'));
  rows.push(`| ${ws} | ${metrics.map((m) => `${total[m].pct}%`).join(' | ')} |`);
}

console.log('| Package | Statements | Branches | Functions | Lines |');
console.log('|---|---|---|---|---|');
for (const row of rows) console.log(row);
process.exit(missing ? 1 : 0);
```

### 2.4 Workspace script names

The root scripts and CI call these workspace scripts **by name**, so the names are binding. The commands in this table are final.

| script | backend | frontend |
|---|---|---|
| `dev` | `tsx watch src/server.ts` (`NODE_ENV` is unset, so it defaults to `development` and morgan uses the `dev` format) | `vite` (port 5173, proxies `/api` to `http://127.0.0.1:3000`) |
| `build` | `npm run clean && tsc -p tsconfig.build.json` → `backend/dist/server.js` | `npm run typecheck && vite build` → `frontend/dist/` |
| `start` | `node dist/server.js` | — |
| `preview` | — | `vite preview` (port 4173, same proxy) |
| `test` | `vitest run --coverage` | `vitest run --coverage` |
| `test:watch` | `vitest` | `vitest` |
| `lint` | `eslint .` | `eslint . --max-warnings 0` |
| `typecheck` | `tsc -p tsconfig.json` (covers `src/` **and** `test/`) | `tsc -p tsconfig.json && tsc -p tsconfig.node.json` (covers tests) |

- `test` always runs with coverage, so a plain `npm run test -w <pkg>` enforces the 80% gate. To run tests without the gate, for example for intermediate commits, use `npx -w <pkg> vitest run`.
- `lint` exits non-zero on any ESLint error. The frontend `lint` also fails on any warning.

---

## 3. API contract (authoritative)

This section is the single source of truth for the HTTP API, error codes, number handling and middleware. Both packages must follow it exactly.

### 3.1 Ground rules

- **Base path:** `/api/v1`. Every API route lives under it, and nothing outside `/api` is an API route.
- **Format:** JSON in and JSON out. Every API response, including errors, 404s and 405s, has `Content-Type: application/json; charset=utf-8` and `Cache-Control: no-store`.
- **Ports:**

  | Component | Port |
  |---|---|
  | Backend | `PORT`, default `3000`, host `0.0.0.0` (IPv4) |
  | Vite dev server | `5173`, proxies `/api` to `http://127.0.0.1:3000` (an explicit IPv4 address, because `localhost` may resolve to `::1` first) |
  | Single-container image | Exposes `3000` |
  | docker-compose nginx | Host `8080` (container `80`), proxies `/api` to `backend:3000` |

- **Backend environment variables.** Do not add any others.
  - `PORT` (default `3000`).
  - `NODE_ENV`: `development`, `production` or `test` (default `development`).
  - `STATIC_DIR`: optional path to the built frontend, resolved to an absolute path. When it is set, Express also serves the SPA.
- **Stack versions:**
  - Express 5 (`express@^5`). Express 5 passes rejected promises and thrown errors from handlers to the error handler, so do not use `express-async-handler`.
  - zod 4 (`zod@^4`).
  - TypeScript in strict mode.
- **Operation names** are lowercase and case-sensitive, so `"ADD"` is an unsupported operation.

### 3.2 Shared TypeScript types (`contract.ts`)

Keep one **types-only** file as two **byte-identical** copies:

- `backend/src/contract.ts`
- `frontend/src/api/contract.ts`

`npm run check:contract` runs `scripts/check-contract.mjs`, which exits 1 when the copies differ. CI runs it.

**Why copy the file instead of sharing it.** A third workspace package (`@calculator/shared`) would bring:

- build ordering;
- `tsconfig` references;
- extra Docker `COPY` steps across two Dockerfile layouts.

That costs too much for about 50 lines of type declarations. A byte-identical copy that CI checks keeps each package independently buildable and keeps the Docker contexts simple, while still making drift impossible.

The file may contain **only** `export type` and `export interface` declarations. Every piece of runtime behaviour has exactly one owner:

- the **backend** owns the operation table, the messages and the rounding;
- the **frontend** owns its display strings.

Put this rationale in the README's design decisions.

Create both copies with exactly this content:

```ts
// API contract shared by backend and frontend.
// KEEP BOTH COPIES BYTE-IDENTICAL: backend/src/contract.ts and frontend/src/api/contract.ts.
// Verified by `npm run check:contract` (runs in CI). Types only — no runtime code.

export type BinaryOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';
export type UnaryOperation = 'sqrt' | 'percent';
export type Operation = BinaryOperation | UnaryOperation;

export interface CalculateRequest {
  operation: Operation;
  operands: number[];
}

export interface CalculateResponse {
  operation: Operation;
  operands: number[];
  result: number;
}

export interface OperationInfo {
  name: Operation;
  symbol: string;
  arity: 1 | 2;
  description: string;
}

export interface OperationsResponse {
  operations: OperationInfo[];
}

export interface HealthResponse {
  status: 'ok';
}

export type ErrorCode =
  | 'MALFORMED_JSON'
  | 'VALIDATION_ERROR'
  | 'UNSUPPORTED_OPERATION'
  | 'INVALID_OPERAND_COUNT'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  | 'DIVISION_BY_ZERO'
  | 'NEGATIVE_SQRT'
  | 'NON_FINITE_RESULT'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_ERROR';

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: ValidationIssue[];
  };
}
```

### 3.3 Endpoints

#### 3.3.1 `GET /api/v1/health`

- Returns **200** with `{ "status": "ok" }`. `HEAD` also returns 200, because Express routes it through the GET route.
- It must not depend on anything external. The Dockerfile `HEALTHCHECK`, the compose healthcheck, CI and the README all use it.
- Any other method returns **405** `METHOD_NOT_ALLOWED` with the header `Allow: GET`.

#### 3.3.2 `GET /api/v1/operations`

Returns **200** with an `OperationsResponse` in **exactly** this order:

```json
{
  "operations": [
    { "name": "add",      "symbol": "+", "arity": 2, "description": "Sum of a and b" },
    { "name": "subtract", "symbol": "−", "arity": 2, "description": "a minus b" },
    { "name": "multiply", "symbol": "×", "arity": 2, "description": "Product of a and b" },
    { "name": "divide",   "symbol": "÷", "arity": 2, "description": "a divided by b; b must not be 0" },
    { "name": "power",    "symbol": "^", "arity": 2, "description": "a raised to the power b" },
    { "name": "sqrt",     "symbol": "√", "arity": 1, "description": "Square root of a; a must be >= 0" },
    { "name": "percent",  "symbol": "%", "arity": 1, "description": "a divided by 100" }
  ]
}
```

- Build this response from the same backend operation table that `calculate` uses (§3.4).
- The frontend keypad is static and **must not** call this endpoint. The endpoint exists so the API is discoverable.
- Any other method returns **405** with `Allow: GET`.

#### 3.3.3 `POST /api/v1/calculate`

- **Request headers:** `Content-Type: application/json` is required. Parameters such as `; charset=utf-8` are allowed.
- **Request body** (`CalculateRequest`) is a strict object with no other keys:
  - `operation`: required, a non-empty string.
  - `operands`: required, an array of finite JSON numbers.

```json
{ "operation": "add", "operands": [0.1, 0.2] }
```

- **200 response** (`CalculateResponse`). It echoes the validated `operation` and `operands`, with the keys **in the order `operation`, `operands`, `result`**. `result` is the rounded number:

```json
{ "operation": "add", "operands": [0.1, 0.2], "result": 0.3 }
```

- Any other method returns **405** with `Allow: POST`. That includes `OPTIONS`.

**Error examples:**

```jsonc
// 400 — operand is a string
{ "error": { "code": "VALIDATION_ERROR", "message": "Request body failed validation.",
  "details": [ { "path": "operands.1", "message": "Invalid input: expected number, received string" } ] } }

// 400
{ "error": { "code": "UNSUPPORTED_OPERATION",
  "message": "Unsupported operation 'modulo'. Supported operations: add, subtract, multiply, divide, power, sqrt, percent." } }

// 400
{ "error": { "code": "INVALID_OPERAND_COUNT", "message": "Operation 'sqrt' expects 1 operand but received 2." } }

// 422
{ "error": { "code": "DIVISION_BY_ZERO", "message": "Division by zero is not allowed." } }

// 422
{ "error": { "code": "NEGATIVE_SQRT", "message": "Cannot take the square root of a negative number." } }

// 422
{ "error": { "code": "NON_FINITE_RESULT", "message": "The result is not a finite real number." } }
```

`details[].message` comes straight from zod, so tests must **never** assert its exact text. Assert `code`, the HTTP status and `details[].path` instead.

### 3.4 Operation table (backend runtime source of truth)

Implement this table in `backend/src/calculator.ts` as a `Record<Operation, OperationDef>`. Its insertion order must match the order in §3.3.2.

| name | symbol | arity | semantics (`a` = operands[0], `b` = operands[1]) | edge cases |
|---|---|---|---|---|
| `add` | `+` | 2 | `a + b` | Overflow (`1e308 + 1e308`) gives `NON_FINITE_RESULT`. |
| `subtract` | `−` (U+2212) | 2 | `a - b` | Overflow (`-1e308 - 1e308`) gives `NON_FINITE_RESULT`. `0.3 - 0.1` gives `0.2` after rounding. |
| `multiply` | `×` | 2 | `a * b` | Overflow gives `NON_FINITE_RESULT`. Underflow (`1e-200 * 1e-200`) gives `0`, which is fine. `-1 * 0` gives `-0`, which is normalised to `0`. |
| `divide` | `÷` | 2 | `a / b` | When `b === 0` (including `-0`), throw `DIVISION_BY_ZERO` **before** dividing. `0 / 0` is also `DIVISION_BY_ZERO`. Overflow (`1e308 / 1e-10`) gives `NON_FINITE_RESULT`. |
| `power` | `^` | 2 | `a ** b` | `0 ** 0` gives `1` (the JS convention, which is accepted). `0 ** -1` is Infinity, so `NON_FINITE_RESULT`. `10 ** 400` gives `NON_FINITE_RESULT`. `(-8) ** 0.5` is NaN, so `NON_FINITE_RESULT`. `2 ** -1` gives `0.5`. |
| `sqrt` | `√` | 1 | `Math.sqrt(a)` | When `a < 0`, throw `NEGATIVE_SQRT` before computing. `sqrt(-0)` gives `-0`, which is normalised to `0`. `sqrt(2)` gives `1.4142135623731`. |
| `percent` | `%` | 1 | `a / 100` | Unary, as on a phone calculator: `50` gives `0.5` and `-50` gives `-0.5`. Never fails on finite input. |

### 3.5 Number rules

**Inputs**

1. Operands must be JSON numbers. There is **no coercion**: `"2"`, `true`, `null`, `[]` and `{}` all fail with `400 VALIDATION_ERROR`.
2. Operands must be finite. `1e309` parses to `Infinity`, which zod 4's `z.number()` rejects (as it does NaN), giving `400 VALIDATION_ERROR`. You must write a test proving that `1e309` is rejected.
3. There is no magnitude limit beyond finiteness. The 10 kB body limit bounds the request size.
4. `-0` is accepted as an operand.
5. Operands are used exactly as received. **Never round inputs.**

**Rounding.** Every successful result passes through exactly this function:

```ts
export function finalizeResult(x: number): number {
  if (!Number.isFinite(x)) {
    throw new AppError(422, 'NON_FINITE_RESULT', MESSAGES.NON_FINITE_RESULT);
  }
  let r = Number(x.toPrecision(15));
  // toPrecision can round values near Number.MAX_VALUE up to Infinity; keep the finite original.
  if (!Number.isFinite(r)) r = x;
  // Normalise negative zero.
  if (Object.is(r, -0)) r = 0;
  return r;
}
```

- 15 significant digits is the highest precision at which every decimal round-trips through float64. Rounding to it removes binary noise, so `0.1 + 0.2` gives `0.3` and `0.1 * 3` gives `0.3`.
- **Documented trade-off (include it in the README):** integers with more than 15 significant digits lose precision. For example, `add(123456789012345678, 0)` gives `123456789012346000`.
- `result` is always a JSON number, never a string.
- The frontend **never** re-rounds. It displays `String(result)`, so a value such as `1e+21` appears in exponent notation.

### 3.6 Validation pipeline for `POST /api/v1/calculate`

The steps run in this order, and the first failure wins:

1. **Content-Type check.** If `!req.is('application/json')`, return `415 UNSUPPORTED_MEDIA_TYPE`. This covers a request with no Content-Type header, and a request with no body at all (no `Content-Length` and no `Transfer-Encoding`). A JSON content type with an empty body (`Content-Length: 0`) passes this step: it parses to `{}` and gets `400 VALIDATION_ERROR` in step 3.
2. **JSON parsing** with `express.json({ limit: '10kb', strict: true })`:
   - A body larger than 10 kB gives `413 PAYLOAD_TOO_LARGE` (`err.type === 'entity.too.large'`).
   - Unparseable JSON, or a top-level primitive such as `null` or `42`, gives `400 MALFORMED_JSON` (`err.type === 'entity.parse.failed'`).
   - A non-UTF charset (for example `application/json; charset=latin1`) or an unknown `Content-Encoding` gives `415 UNSUPPORTED_MEDIA_TYPE` (`charset.unsupported` or `encoding.unsupported`).
   - An aborted request or a body whose size does not match `Content-Length` gives `400 MALFORMED_JSON` (`request.aborted` or `request.size.invalid`).
3. **zod shape check.** Run `z.strictObject({ operation: z.string().min(1), operands: z.array(z.number()) })` with `safeParse`. On failure, return `400 VALIDATION_ERROR` with `details` mapped from `error.issues`:
   - `path` is the issue path joined with `.` (for example `operands.0`), or `(root)` when the path is empty.
   - `message` is zod's message.
   - This step catches missing fields, wrong types, string, boolean or null operands, `1e309`, unknown keys, a top-level array and an empty `{}`.
4. **Operation lookup.** If `!isOperation(operation)`, return `400 UNSUPPORTED_OPERATION`.
5. **Arity check.** If `operands.length !== arity`, return `400 INVALID_OPERAND_COUNT`. `operands: []` is caught here.
6. **Compute** with `calculate()`. Domain failures return `422` with `DIVISION_BY_ZERO`, `NEGATIVE_SQRT` or `NON_FINITE_RESULT`.
7. **Success:** `200` with `{ operation, operands, result }`.

Because of this order, a request with both an unknown operation **and** a string operand returns `VALIDATION_ERROR`. Test this case.

### 3.7 Errors

#### 3.7.1 Envelope

Every non-2xx API response has exactly this shape (`ApiErrorBody`):

```json
{ "error": { "code": "<ErrorCode>", "message": "<human-readable>", "details": [ /* only for VALIDATION_ERROR */ ] } }
```

- `code` is the stable, machine-readable contract. Clients branch on `code`, never on `message`.
- `details` is present **only** for `VALIDATION_ERROR`.
- Never include stack traces, internal error text or echoes of the request.

#### 3.7.2 Code table

The messages are fixed strings in `backend/src/errors.ts`.

| code | HTTP | trigger | `message` (exact) |
|---|---|---|---|
| `MALFORMED_JSON` | 400 | The body is not valid JSON or is a top-level primitive, or the request was aborted or its size did not match `Content-Length` | `Request body is not valid JSON.` |
| `VALIDATION_ERROR` | 400 | The zod shape check failed | `Request body failed validation.` |
| `UNSUPPORTED_OPERATION` | 400 | `operation` is not one of the 7 names | `` `Unsupported operation '${op}'. Supported operations: add, subtract, multiply, divide, power, sqrt, percent.` `` |
| `INVALID_OPERAND_COUNT` | 400 | `operands.length` ≠ arity | `` `Operation '${op}' expects ${arity} operand${arity === 1 ? '' : 's'} but received ${n}.` `` |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | A POST to `/calculate` without a JSON content type, or with an unsupported charset or content encoding | `Content-Type must be application/json.` |
| `PAYLOAD_TOO_LARGE` | 413 | The body is larger than 10 kB | `Request body exceeds the 10kb limit.` |
| `DIVISION_BY_ZERO` | 422 | `divide` with `b === 0` | `Division by zero is not allowed.` |
| `NEGATIVE_SQRT` | 422 | `sqrt` with `a < 0` | `Cannot take the square root of a negative number.` |
| `NON_FINITE_RESULT` | 422 | The result is ±Infinity or NaN | `The result is not a finite real number.` |
| `NOT_FOUND` | 404 | An unknown path under `/api` (including `/api` itself) | `` `Route ${method} ${path} not found.` `` |
| `METHOD_NOT_ALLOWED` | 405 | A known path with the wrong method (also sets `Allow`) | `` `Method ${method} not allowed on ${path}.` `` |
| `INTERNAL_ERROR` | 500 | Any unexpected error | `An unexpected error occurred.` |

#### 3.7.3 Status-code policy

Include this rationale in the README.

- **400**: the client sent a request that is wrong in itself: bad JSON, the wrong shape, an unknown operation or the wrong operand count. A correct client never sends one.
- **422**: the request is well-formed, but the maths is undefined for these inputs. Ordinary users trigger these through valid key presses, and the UI shows them as calculator errors. Keeping 422 separate from 400 lets clients and logs tell "the user did undefined maths" apart from "the client is broken" without parsing messages.
- **404 and 405** use the same envelope, so every `/api` response is JSON.
- **413 and 415** come from the transport layer and also use the same envelope.
- **500** is the catch-all. The server logs the full error, and the response carries only the generic message.

#### 3.7.4 `AppError` and the central handler

Implement a single error class and throw it everywhere:

```ts
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ValidationIssue[],
  ) { super(message); this.name = 'AppError'; }
}
```

The central error handler maps exactly these cases:

| error | response |
|---|---|
| `AppError` | Its own status and code |
| body-parser `entity.too.large` | 413 `PAYLOAD_TOO_LARGE` |
| body-parser `entity.parse.failed`, `request.aborted`, `request.size.invalid` | 400 `MALFORMED_JSON` |
| body-parser `charset.unsupported`, `encoding.unsupported` | 415 `UNSUPPORTED_MEDIA_TYPE` |
| anything else | 500 `INTERNAL_ERROR` |

For the 500 case, always log with `console.error('Unhandled error:', err)`. Any test that triggers a 500 must spy on `console.error`, silence the spy with `mockImplementation(() => {})` and assert that it was called once, so the test output stays clean.

### 3.8 Express app conventions

`backend/src/app.ts` exports `createApp(config?: AppConfig): Express`. It **never calls `listen`**, so supertest can use the app directly. `backend/src/server.ts` handles listening and signals.

Mount the middleware in **exactly** this order:

1. `app.disable('x-powered-by')`, then **helmet**:
   ```ts
   helmet({ contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } } })
   ```
   This sets the standard security headers. You must disable `upgrade-insecure-requests` because the app is served over plain HTTP (localhost, Docker, a LAN IP), and that directive would break asset loading. The default CSP (`script-src 'self'`) works with Vite's production build.
2. **morgan** request logging:
   - the `'dev'` format when `NODE_ENV === 'development'`;
   - the `'combined'` format when it is `production`;
   - not mounted at all when it is `test`.

   Never log request bodies.
3. `app.use('/api', noStore)`, which sets `Cache-Control: no-store` on every `/api` response.
4. The **API router** at `/api/v1`:
   - `/health`: GET, plus `.all(methodNotAllowed(['GET']))`.
   - `/operations`: GET, plus `.all(methodNotAllowed(['GET']))`.
   - `/calculate`: `.post(requireJson, express.json({ limit: '10kb', strict: true }), postCalculate)`, plus `.all(methodNotAllowed(['POST']))`.

   The JSON body parser is applied **only** to the `/calculate` POST route.
5. **API 404**: `app.use('/api', notFoundHandler)`. It must be mounted **before** static serving so that `/api` and `/api/anything` never return `index.html`.
6. **Static SPA**, only when `STATIC_DIR` is set: `express.static(STATIC_DIR)` followed by a fallback middleware. The fallback sends `index.html` (with `{ root: STATIC_DIR }`) for `GET` and `HEAD` requests and calls `next()` for everything else. Use a plain `app.use` function, not a wildcard path, because Express 5 changed the wildcard syntax.
7. The **central error handler** (a 4-argument middleware), last.

**No CORS. Do not install or enable `cors`.** None of the deployment modes is cross-origin:

- in development, the Vite proxy makes `/api` same-origin;
- in the single container, Express serves both the UI and the API;
- in compose, nginx serves both.

Enabling CORS would only enlarge the attack surface. `OPTIONS` requests to API routes return 405. Explain all of this in the README.

### 3.9 Frontend API client conventions

`frontend/src/api/client.ts` exports:

- `calculate(operation: Operation, operands: number[]): Promise<number>`, which resolves with `result`;
- `class ApiError extends Error`, with `code: ErrorCode | 'NETWORK_ERROR' | 'UNEXPECTED_RESPONSE'` and `status?: number`.

Requests:

- Use relative URLs only (`/api/v1/calculate`). There is no configurable base URL.
- Send `POST` with the headers `Content-Type: application/json` and `Accept: application/json`.
- Apply a 10-second timeout using `AbortController`.

Errors:

| Situation | Result |
|---|---|
| `fetch` rejects or the timeout fires | `ApiError('NETWORK_ERROR')`, with no status |
| The body is not JSON or lacks the expected shape (for example nginx's 502 HTML page, or the Vite proxy's empty 500 when the backend is down) | `ApiError('UNEXPECTED_RESPONSE', status)` |
| A non-2xx response with an `ApiErrorBody` | `ApiError(body.error.code, status)`, with `message = body.error.message` |
| A 2xx response whose `result` is not a finite number | `ApiError('UNEXPECTED_RESPONSE', status)`, where the status is the 2xx status, for example 200 |

So when the backend is down behind a running proxy, the user sees `Error`, not `Network error`. `Network error` appears only when `fetch` itself rejects or times out, for example when the Vite server or nginx is also down.

In tests:

- Components and their tests mock the client module (`vi.mock('…/api/client')`) and never stub `fetch` directly.
- The only exception is `client.test.ts`, which stubs `globalThis.fetch`.

The display shows short strings mapped from `code`, and **never** the server's `message`. Define the mapping in `frontend/src/api/errorMessages.ts`:

| code | display text |
|---|---|
| `DIVISION_BY_ZERO` | `Cannot divide by zero` |
| `NEGATIVE_SQRT` | `Invalid input` |
| `NON_FINITE_RESULT` | `Math error` |
| `NETWORK_ERROR` | `Network error` |
| any other code, or a non-`ApiError` | `Error` |

### 3.10 API usage examples

Run these against `localhost:3000` (the dev server or the single container). For docker-compose, use `localhost:8080` instead. The outputs must match exactly, key order included.

```bash
# Health
curl -s localhost:3000/api/v1/health
# {"status":"ok"}

# List operations (full output: the §3.3.2 JSON minified, no whitespace, "−" as raw UTF-8)
curl -s localhost:3000/api/v1/operations
# {"operations":[{"name":"add","symbol":"+","arity":2,"description":"Sum of a and b"}, ...]}

# add (binary noise removed by 15-significant-digit rounding)
curl -s -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"add","operands":[0.1,0.2]}'
# {"operation":"add","operands":[0.1,0.2],"result":0.3}

# subtract
curl -s -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"subtract","operands":[10,4]}'
# {"operation":"subtract","operands":[10,4],"result":6}

# multiply
curl -s -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"multiply","operands":[6,7]}'
# {"operation":"multiply","operands":[6,7],"result":42}

# divide
curl -s -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"divide","operands":[10,4]}'
# {"operation":"divide","operands":[10,4],"result":2.5}

# power
curl -s -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"power","operands":[2,10]}'
# {"operation":"power","operands":[2,10],"result":1024}

# sqrt (unary)
curl -s -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"sqrt","operands":[16]}'
# {"operation":"sqrt","operands":[16],"result":4}

# percent (unary, x / 100)
curl -s -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"percent","operands":[50]}'
# {"operation":"percent","operands":[50],"result":0.5}
```

Error cases. `-w` prints the status code on a separate line:

```bash
# 422 DIVISION_BY_ZERO
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"divide","operands":[1,0]}'
# {"error":{"code":"DIVISION_BY_ZERO","message":"Division by zero is not allowed."}}
# HTTP 422

# 422 NEGATIVE_SQRT
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"sqrt","operands":[-4]}'
# {"error":{"code":"NEGATIVE_SQRT","message":"Cannot take the square root of a negative number."}}
# HTTP 422

# 422 NON_FINITE_RESULT (overflow)
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"power","operands":[10,400]}'
# {"error":{"code":"NON_FINITE_RESULT","message":"The result is not a finite real number."}}
# HTTP 422

# 400 UNSUPPORTED_OPERATION
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"modulo","operands":[1,2]}'
# {"error":{"code":"UNSUPPORTED_OPERATION","message":"Unsupported operation 'modulo'. Supported operations: add, subtract, multiply, divide, power, sqrt, percent."}}
# HTTP 400

# 400 INVALID_OPERAND_COUNT
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"sqrt","operands":[1,2]}'
# {"error":{"code":"INVALID_OPERAND_COUNT","message":"Operation 'sqrt' expects 1 operand but received 2."}}
# HTTP 400

# 400 VALIDATION_ERROR (no type coercion: "2" is a string)
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"add","operands":["2",3]}'
# {"error":{"code":"VALIDATION_ERROR","message":"Request body failed validation.","details":[{"path":"operands.0","message":"<zod message>"}]}}
# HTTP 400

# 400 MALFORMED_JSON
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":'
# {"error":{"code":"MALFORMED_JSON","message":"Request body is not valid JSON."}}
# HTTP 400

# 415 UNSUPPORTED_MEDIA_TYPE
curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate -H 'Content-Type: text/plain' -d 'hello'
# {"error":{"code":"UNSUPPORTED_MEDIA_TYPE","message":"Content-Type must be application/json."}}
# HTTP 415

# 405 METHOD_NOT_ALLOWED (note the Allow: POST header)
curl -s -i -X GET localhost:3000/api/v1/calculate
# status 405, header Allow: POST, body:
# {"error":{"code":"METHOD_NOT_ALLOWED","message":"Method GET not allowed on /api/v1/calculate."}}

# 404 NOT_FOUND (JSON, Cache-Control: no-store)
curl -s -i localhost:3000/api/v1/nope
# status 404, header Cache-Control: no-store, body:
# {"error":{"code":"NOT_FOUND","message":"Route GET /api/v1/nope not found."}}
```

In the README:

- replace `<zod message>` and the `...` in the operations example with the real output;
- paste the real 405 and 404 output, including the `Allow: POST` and `Cache-Control: no-store` headers;
- mention the 10 kB / 413 limit, without an example.

---

## 4. Backend plan (`/backend`)

§3 is authoritative for every HTTP detail, and nothing in this section overrides it.

### 4.0 Ground rules

- Use **Node.js (≥ 22.12) + Express 5 + TypeScript (strict) + zod 4 + Vitest + supertest + v8 coverage**. Do not use Go, Jest, class-validator, NestJS, Fastify or Koa.
- The package is **ESM**:
  - Set `"type": "module"`, and set `module` and `moduleResolution` to `NodeNext`.
  - Relative imports in `.ts` source **must end in `.js`** (for example `import { AppError } from './errors.js'`). `tsx`, `tsc` and Vitest all resolve `.js` to `.ts`.
  - Use `import type` for type-only imports, because `verbatimModuleSyntax` is on.
- Do **not** add any of the following:
  - `cors`, `body-parser` (use `express.json`), `express-async-handler`;
  - `dotenv`, pino or winston, rate limiting, compression, auth, request IDs;
  - an OpenAPI spec, history, a database, a shared workspace package.
- Never round inputs, never return results as strings, and never put stack traces or internal error text in responses.
- `src/app.ts` never calls `listen` or `process.exit`. Only `src/server.ts` does.
- `src/calculator.ts` is pure. It must not import Express, zod, `process` or `console`.
- Do not use `any` in `src/`. Use `unknown` and narrow it.
- **Unused parameters** must start with an underscore (`_req`, `_next`), so that both TypeScript's `noUnusedParameters` and ESLint's `argsIgnorePattern: '^_'` pass.
- **Logging** uses only `console.info`, `console.warn` and `console.error`. The backend `no-console` rule forbids `console.log`.
- Run every command from the **repository root**.

### 4.1 Directory tree

See §2.1. `dist/` and `coverage/` are build outputs and are git-ignored.

### 4.2 `backend/package.json`

Install the current stable release within each listed major version, and do not move to a newer major. `vitest` and `@vitest/coverage-v8` must be on the **same** version.

```bash
npm install -w backend express@^5 zod@^4 helmet@^8 morgan@^1
npm install -w backend -D typescript@^5 tsx@^4 @types/node@^24 @types/express@^5 @types/morgan@^1 \
  vitest@^3 @vitest/coverage-v8@^3 supertest@^7 @types/supertest@^6 \
  eslint@^9 @eslint/js@^9 typescript-eslint@^8 eslint-config-prettier@^10 globals@^16 prettier@^3
```

Set the non-dependency fields and scripts exactly as follows:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "clean": "node -e \"require('fs').rmSync('dist',{recursive:true,force:true})\"",
    "build": "npm run clean && tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "typecheck": "tsc -p tsconfig.json",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\" \"*.{ts,js,json}\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"test/**/*.ts\" \"*.{ts,js,json}\"",
    "test": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

- The only runtime `dependencies` are `express`, `zod`, `helmet` and `morgan`. The Docker image installs with `--omit=dev`, so nothing in `dist/` may import a devDependency.
- The backend `format` scripts use explicit globs because Prettier reads `.prettierignore` only from the current directory. The root `npm run format:check` also covers the whole repo.

### 4.3 TypeScript configuration

`backend/tsconfig.json` is used for type-checking and by the ESLint type service. It does not emit anything.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "strict": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "test", "vitest.config.ts"]
}
```

`backend/tsconfig.build.json` emits only `src`, so `dist/server.js` is the entry point:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": false, "rootDir": "src", "outDir": "dist", "sourceMap": true },
  "include": ["src"]
}
```

- Keep `noUncheckedIndexedAccess` **off** in the backend. With it on, `operands[0]` becomes `number | undefined` even after the arity check, which adds noise without adding safety.
- Keep `exactOptionalPropertyTypes` off as well.
- Use these import styles:

  ```ts
  import express from 'express';
  import morgan from 'morgan';
  import helmet from 'helmet';
  import { z } from 'zod';
  import request from 'supertest';
  ```

### 4.4 ESLint and Prettier

`backend/eslint.config.js`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['error', 'warn', 'info'] }],
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      // supertest's res.body is `any`; allow reading it in tests without casting everywhere.
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  { files: ['eslint.config.js'], ...tseslint.configs.disableTypeChecked },
  prettier,
);
```

Two lint traps in tests:

- **`@typescript-eslint/unbound-method`.** Never assert on a method reference such as `console.error`, `res.status` or `res.json`. Assert on a separate spy variable instead, for example `const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); expect(errSpy)…`. §7.3.5 shows the stub pattern for `res`.
- **`no-loss-of-precision`** (in `js.configs.recommended`). Never write a number literal that cannot be stored exactly, such as `123456789012345678`. Build it with `Number('123456789012345678')` or send it inside a raw JSON string.

### 4.5 Vitest configuration

See §7.2 for the exact `backend/vitest.config.ts`.

### 4.6 Module specifications

Implement these signatures and behaviours exactly. The snippets show intent; you write the full code.

#### `src/contract.ts`

Copy it byte for byte from §3.2. Never edit one copy without editing the other.

#### `src/config.ts`

```ts
export type NodeEnv = 'development' | 'production' | 'test';
export interface AppConfig { port: number; nodeEnv: NodeEnv; staticDir?: string }
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig;
```

- **`PORT`:**
  - If it is unset or `''`, use `3000`.
  - Otherwise it must match `/^\d+$/` and be in the range 1–65535. If it does not, throw `Error('Invalid PORT "<value>": expected an integer between 1 and 65535.')`.
- **`NODE_ENV`:**
  - If it is unset or `''`, use `'development'`.
  - Otherwise it must be one of the three allowed values. If it is not, throw `Error('Invalid NODE_ENV "<value>": expected development, production or test.')`.
- **`STATIC_DIR`:**
  - If it is unset or `''`, use `undefined`.
  - Otherwise use `path.resolve(value)`.
- Read no other variables.

#### `src/errors.ts`

`AppError` is exactly as shown in §3.7.4. `MESSAGES`:

```ts
export const MESSAGES = {
  MALFORMED_JSON: 'Request body is not valid JSON.',
  VALIDATION_ERROR: 'Request body failed validation.',
  UNSUPPORTED_MEDIA_TYPE: 'Content-Type must be application/json.',
  PAYLOAD_TOO_LARGE: 'Request body exceeds the 10kb limit.',
  DIVISION_BY_ZERO: 'Division by zero is not allowed.',
  NEGATIVE_SQRT: 'Cannot take the square root of a negative number.',
  NON_FINITE_RESULT: 'The result is not a finite real number.',
  INTERNAL_ERROR: 'An unexpected error occurred.',
  UNSUPPORTED_OPERATION: (op: string, supported: readonly string[]) =>
    `Unsupported operation '${op}'. Supported operations: ${supported.join(', ')}.`,
  INVALID_OPERAND_COUNT: (op: string, arity: number, received: number) =>
    `Operation '${op}' expects ${arity} operand${arity === 1 ? '' : 's'} but received ${received}.`,
  NOT_FOUND: (method: string, path: string) => `Route ${method} ${path} not found.`,
  METHOD_NOT_ALLOWED: (method: string, path: string) => `Method ${method} not allowed on ${path}.`,
} as const;
```

- Callers pass the list of supported operations from `listOperations().map(o => o.name)`.
- `errors.ts` must **not** import `calculator.ts`, because that would create a circular import.

#### `src/calculator.ts` (pure)

- Define `interface OperationDef { symbol: string; arity: 1 | 2; description: string; apply(operands: readonly number[]): number }`.
- `export const OPERATIONS: Readonly<Record<Operation, OperationDef>>`:
  - The keys are **in this insertion order:** add, subtract, multiply, divide, power, sqrt, percent.
  - Copy the symbols and descriptions verbatim from §3.3.2. `subtract` uses `'−'`.
  - `apply` uses destructuring, for example `apply: ([a, b]) => a + b`.
- `divide.apply` throws `new AppError(422, 'DIVISION_BY_ZERO', MESSAGES.DIVISION_BY_ZERO)` when `b === 0`, **before** dividing.
- `sqrt.apply` throws `new AppError(422, 'NEGATIVE_SQRT', MESSAGES.NEGATIVE_SQRT)` when `a < 0`. `-0` passes and is normalised later.
- `power.apply` is `a ** b`. `percent.apply` is `a / 100`.
- `isOperation(name: string): name is Operation` uses `Object.hasOwn(OPERATIONS, name)`. **Never** use `name in OPERATIONS`, which would accept `'toString'`, `'constructor'` and `'__proto__'`.
- `calculate(operation: Operation, operands: readonly number[]): number`. A `readonly` parameter is compatible with the `number[]` in §3.
  1. If `operands.length !== OPERATIONS[operation].arity`, throw `new AppError(400, 'INVALID_OPERAND_COUNT', MESSAGES.INVALID_OPERAND_COUNT(operation, arity, operands.length))`.
  2. Call `apply`.
  3. Return `finalizeResult(raw)`.
  4. Never mutate `operands`.
- Copy `finalizeResult(x: number): number` verbatim from §3.5.
- `listOperations(): OperationInfo[]` returns new objects with exactly the keys `name, symbol, arity, description`, in table order, and without `apply`.

#### `src/validation.ts`

```ts
export const calculateRequestSchema = z.strictObject({
  operation: z.string().min(1),
  operands: z.array(z.number()),
});
export function toValidationIssues(error: z.ZodError): ValidationIssue[];
// path: issue.path.map(String).join('.') or '(root)' when empty; message: issue.message
```

#### `src/middleware/*`

- **`noStore`** `(_req, res, next)`: `res.set('Cache-Control', 'no-store'); next()`.
- **`requireJson`:** if `!req.is('application/json')`, throw `new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', MESSAGES.UNSUPPORTED_MEDIA_TYPE)`. `req.is` returns `null` when there is no body.
- **`pathOf(req)`** (in `notFound.ts`, imported by `methodNotAllowed.ts`) returns `req.originalUrl.split('?')[0]`. Do not use `req.path`, because mounting strips the prefix.
- **`notFoundHandler`:** throws `new AppError(404, 'NOT_FOUND', MESSAGES.NOT_FOUND(req.method, pathOf(req)))`.
- **`methodNotAllowed(allowed: readonly string[]): RequestHandler`:** sets `Allow` to `allowed.join(', ')`, then calls `next(new AppError(405, 'METHOD_NOT_ALLOWED', MESSAGES.METHOD_NOT_ALLOWED(req.method, pathOf(req))))`.
- **`requestLogFormat(nodeEnv): 'dev' | 'combined' | null`:** returns `'dev'` for `development`, `'combined'` for `production` and `null` for `test`.
- **`errorHandler: ErrorRequestHandler`**, with the signature `(err: unknown, _req: Request, res: Response, next: NextFunction)`. It must declare all 4 parameters so that Express recognises it as an error handler.
  1. If `res.headersSent`, call `next(err)` and return.
  2. If `err instanceof AppError`, respond with `err.status` and `{ error: { code, message, ...(details ? { details } : {}) } }`.
  3. If `err` is an object with a string `type` property, map it as follows:
     - `'entity.too.large'` → 413 `PAYLOAD_TOO_LARGE`;
     - `'entity.parse.failed'`, `'request.aborted'` and `'request.size.invalid'` → 400 `MALFORMED_JSON`;
     - `'charset.unsupported'` and `'encoding.unsupported'` → 415 `UNSUPPORTED_MEDIA_TYPE`;
     - any other `type` falls through to step 4.
  4. For anything else, including thrown values that are not `Error` objects, call `console.error('Unhandled error:', err)` and respond with 500 `INTERNAL_ERROR` and the generic message.
  - Always respond with `res.status(s).json(body)`.
- **`mountSpa(app: Express, staticDir: string): void`:**
  - If `fs.existsSync(path.join(staticDir, 'index.html'))` is false, throw `Error('STATIC_DIR "<dir>" does not contain index.html')`, so that startup fails fast.
  - Otherwise:
    ```ts
    app.use(express.static(staticDir));
    app.use((req, res, next) =>
      req.method === 'GET' || req.method === 'HEAD'
        ? res.sendFile('index.html', { root: staticDir })
        : next(),
    );
    ```
    Pass `{ root: staticDir }` rather than an absolute path. With an absolute path, `send` checks every segment of the path for dotfiles, so the fallback would return 404 whenever `STATIC_DIR` sits under a hidden directory such as `~/.worktrees/…`.

#### `src/controllers/*`

- **`getHealth`** `(_req, res)`: `res.json({ status: 'ok' } satisfies HealthResponse)`.
- **`getOperations`** `(_req, res)`: `res.json({ operations: listOperations() } satisfies OperationsResponse)`.
- **`postCalculate`** is synchronous, and Express 5 forwards anything it throws.
  1. Call `calculateRequestSchema.safeParse(req.body)`. On failure, throw `new AppError(400, 'VALIDATION_ERROR', MESSAGES.VALIDATION_ERROR, toValidationIssues(parsed.error))`.
  2. If `!isOperation(operation)`, throw 400 `UNSUPPORTED_OPERATION` with the list of supported names.
  3. `const result = calculate(operation, operands)`.
  4. Respond with `res.status(200).json({ operation, operands, result } satisfies CalculateResponse)`, keeping the keys **in this order**.

#### `src/routes/api.ts`

```ts
export function createApiRouter(): Router {
  const router = express.Router();
  router.route('/health').get(getHealth).all(methodNotAllowed(['GET']));
  router.route('/operations').get(getOperations).all(methodNotAllowed(['GET']));
  router
    .route('/calculate')
    .post(requireJson, express.json({ limit: '10kb', strict: true }), postCalculate)
    .all(methodNotAllowed(['POST']));
  return router;
}
```

#### `src/app.ts`

```ts
export function createApp(config: AppConfig = loadConfig()): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } } }));
  const fmt = requestLogFormat(config.nodeEnv);
  if (fmt) app.use(morgan(fmt));
  app.use('/api', noStore);
  app.use('/api/v1', createApiRouter());
  app.use('/api', notFoundHandler);
  if (config.staticDir) mountSpa(app, config.staticDir);
  app.use(errorHandler);
  return app;
}
```

Tests always pass an explicit config, so they never depend on the developer's environment.

#### `src/server.ts`

1. `const config = loadConfig()`.
2. Start the server:
   ```ts
   const server = createApp(config).listen(config.port, '0.0.0.0', (err?: Error) => {
     if (err) throw err;
     console.info(
       `Calculator API listening on http://0.0.0.0:${config.port} ` +
         `(NODE_ENV=${config.nodeEnv}${config.staticDir ? `, serving ${config.staticDir}` : ''})`,
     );
   });
   ```
3. Register `shutdown(signal)` for both `SIGTERM` and `SIGINT`. It:
   - logs `` `Received ${signal}, shutting down` `` with `console.info`;
   - calls `server.close(() => process.exit(0))`;
   - sets a safety net with `setTimeout(() => process.exit(1), 10_000).unref()`.

---

## 5. Frontend plan (`/frontend`)

The frontend is a classic keypad calculator that evaluates step by step from left to right. Every arithmetic step goes to `POST /api/v1/calculate`. **The frontend never does arithmetic itself.** It does only three things:

- parses typed input with `Number(...)`;
- sends the operands to the API;
- displays `String(result)`.

§3 is authoritative.

### 5.0 Binding frontend decisions

| Decision | Value | Rationale |
|---|---|---|
| Tooling | Vite, React 19, strict TypeScript, CSS Modules | Matches D6. Scoped styles with no runtime cost. |
| Tests | Vitest (`jsdom`), React Testing Library, `@testing-library/user-event`, `@testing-library/jest-dom`, v8 coverage | The same runner as the backend. |
| Vitest version | The **same major version** of `vitest` and `@vitest/coverage-v8` as in `backend/` | Workspaces hoist dependencies, and mismatched majors lead to duplicate installs. |
| Coverage | At least 80% on all four metrics, enforced through `coverage.thresholds` | D9 |
| UI model | Left-to-right chaining: `2 + 3 × 4 =` gives `20`, not `14`. Each binary step makes one API call. | D1 |
| Keypad | `C √ % ÷` / `7 8 9 ×` / `4 5 6 −` / `1 2 3 +` / `0 . ^ =`. Do not add, remove or reorder keys. | D1 |
| Negative numbers | There is no `+/-` key. A negative number can only appear as a **result** (`0 − 5 =` gives `-5`), which can then be used as an operand. | The layout has no sign key. Document this in the README. |
| Repeat-equals | **Not supported.** `=` does nothing when no operation is pending. | Avoids hidden "last operation" state. Document it as an assumption. |
| `=` straight after an operator | `5 × =` computes `multiply [5, 5]` | Follows from the uniform rule that `=` always sends `[accumulator, Number(display)]`. |
| Percent | Unary `x / 100` applied to the display value: `200 + 10 % =` gives `200.1` | D3. Document it, because some phone calculators behave differently. |
| Max input length | 15 digits per typed number. `.` does not count. | Matches the 15-significant-digit rounding. |
| Rounding | **Never** re-round. Display `String(result)` (for example `1e+21` or `1e-7`). | The backend owns rounding. |
| API base URL | Relative URLs only. No `VITE_API_BASE_URL` and no `import.meta.env` variable for the API. | Every mode is same-origin, and the backend has no CORS. |
| Operations list | The keypad is static. Never call `GET /api/v1/operations`. | §3.3.2 |
| Out of scope | Keyboard input, history, `+/-`, backspace, memory keys, an OpenAPI client, i18n, Redux or Zustand, CSS frameworks | D8 |

### 5.1 Directory tree

See §2.1. Tests sit next to the code they test, named `*.test.ts(x)`.

### 5.2 Package, TypeScript, lint and Vite configuration

**Install:**

```bash
npm install -w frontend react@^19 react-dom@^19
npm install -w frontend -D vite@^7 @vitejs/plugin-react@^5 typescript@^5 \
  vitest@^3 @vitest/coverage-v8@^3 jsdom@^26 \
  @testing-library/react@^16 @testing-library/dom@^10 @testing-library/user-event@^14 @testing-library/jest-dom@^6 \
  @types/react@^19 @types/react-dom@^19 @types/node@^24 \
  eslint@^9 @eslint/js@^9 typescript-eslint@^8 eslint-plugin-react-hooks@^5 eslint-plugin-react-refresh@^0.4 \
  eslint-config-prettier@^10 globals@^16
```

If npm reports a peer conflict between `vitest@^3` and `vite@^7`, use `vite@^6` and `@vitejs/plugin-react@^4` instead, and report the change.

**`frontend/package.json` (non-dependency fields):**

```json
{
  "name": "frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "npm run typecheck && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -p tsconfig.json && tsc -p tsconfig.node.json",
    "lint": "eslint . --max-warnings 0",
    "test": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

**`frontend/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

**`frontend/tsconfig.node.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

Import contract types with `import type { ... } from './contract'`, because `verbatimModuleSyntax` is on.

**`frontend/eslint.config.js`:**

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  prettier,
);
```

Lint must exit 0 with **zero warnings**.

**`frontend/vite.config.ts`:**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const apiProxy = { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: false } };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, proxy: apiProxy },
  preview: { port: 4173, strictPort: true, proxy: apiProxy },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Since Vitest 3, restoreMocks only restores vi.spyOn spies; mockReset also clears
    // vi.fn() call history and queued values between tests.
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/api/contract.ts',
        'src/calculator/types.ts',
      ],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
```

**`frontend/src/test/setup.ts`:**

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
```

Do not enable `test.globals`. Import `describe`, `it`, `expect` and `vi` from `vitest` explicitly.

**`frontend/index.html`:**

- Set `lang="en"`, `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Set `<title>Calculator</title>` and add a `theme-color` meta tag.
- Add `<div id="root"></div>` and `<script type="module" src="/src/main.tsx"></script>`.
- **Do not add inline `<script>` or `<style>` blocks, external fonts or CDN links**, because the CSP is `script-src 'self'`. Use a system font stack.

**`main.tsx`:** `createRoot(document.getElementById('root')!)` renders `<StrictMode><App /></StrictMode>` and imports `./index.css`. The reducer is pure, so StrictMode's double invocation does no harm.

### 5.3 API layer (`src/api/`)

**`contract.ts`** is a byte-identical copy of `backend/src/contract.ts`.

**`client.ts`** implements §3.9. You may restructure this reference implementation, but its behaviour must stay the same:

```ts
import type { ApiErrorBody, CalculateResponse, ErrorCode, Operation } from './contract';

export const CALCULATE_URL = '/api/v1/calculate';
export const REQUEST_TIMEOUT_MS = 10_000;

export type ClientErrorCode = ErrorCode | 'NETWORK_ERROR' | 'UNEXPECTED_RESPONSE';

export class ApiError extends Error {
  constructor(public readonly code: ClientErrorCode, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function isApiErrorBody(x: unknown): x is ApiErrorBody {
  if (typeof x !== 'object' || x === null || !('error' in x)) return false;
  const e = (x as { error: unknown }).error;
  return typeof e === 'object' && e !== null
    && typeof (e as { code?: unknown }).code === 'string'
    && typeof (e as { message?: unknown }).message === 'string';
}

function hasFiniteResult(x: unknown): x is CalculateResponse {
  return typeof x === 'object' && x !== null
    && typeof (x as { result?: unknown }).result === 'number'
    && Number.isFinite((x as { result: number }).result);
}

export async function calculate(operation: Operation, operands: number[]): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(CALCULATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ operation, operands }),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Network request failed or timed out.');
  } finally {
    clearTimeout(timer);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError('UNEXPECTED_RESPONSE', 'Response was not valid JSON.', response.status);
  }

  if (!response.ok) {
    if (isApiErrorBody(body)) throw new ApiError(body.error.code, body.error.message, response.status);
    throw new ApiError('UNEXPECTED_RESPONSE', 'Unexpected error response.', response.status);
  }
  if (!hasFiniteResult(body)) {
    throw new ApiError('UNEXPECTED_RESPONSE', 'Response did not contain a finite result.', response.status);
  }
  return body.result;
}
```

The `finally` block clears the timer as soon as the headers arrive. The timeout therefore covers receiving a response, not reading its body.

**`errorMessages.ts`:**

```ts
import { ApiError, type ClientErrorCode } from './client';

export const ERROR_DISPLAY_TEXT: Partial<Record<ClientErrorCode, string>> = {
  DIVISION_BY_ZERO: 'Cannot divide by zero',
  NEGATIVE_SQRT: 'Invalid input',
  NON_FINITE_RESULT: 'Math error',
  NETWORK_ERROR: 'Network error',
};
export const GENERIC_ERROR_TEXT = 'Error';

export function toDisplayMessage(error: unknown): string {
  if (error instanceof ApiError) return ERROR_DISPLAY_TEXT[error.code] ?? GENERIC_ERROR_TEXT;
  return GENERIC_ERROR_TEXT;
}
```

### 5.4 Calculator state machine (`src/calculator/`)

#### 5.4.1 Types (`types.ts`)

```ts
import type { BinaryOperation, Operation, UnaryOperation } from '../api/contract';

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type KeyId = Digit | 'decimal' | BinaryOperation | UnaryOperation | 'equals' | 'clear';

export type Continuation =
  | { kind: 'chain'; next: BinaryOperation } // operator pressed while a binary op was pending with a typed 2nd operand
  | { kind: 'equals' }                       // '=' with a pending binary op
  | { kind: 'unary' };                       // sqrt or percent on the display value

export interface InFlight { requestId: number; continuation: Continuation }

export interface CalcState {
  display: string;                          // text being typed, or String(lastResult); never an error text
  accumulator: number | null;               // left operand of the pending binary op
  pendingOperation: BinaryOperation | null;
  awaitingOperand: boolean;                 // true right after a binary operator: 2nd operand not yet entered
  overwrite: boolean;                       // true when next digit/'.' must REPLACE display (after operator, '=', unary)
  error: string | null;                     // display text of the last error (already mapped), or null
  loading: boolean;                         // a compute request is in flight
  inFlight: InFlight | null;                // invariant: loading === (inFlight !== null)
}

export type CalcAction =
  | { type: 'digit'; digit: Digit }
  | { type: 'decimal' }
  | { type: 'operator'; operation: BinaryOperation }
  | { type: 'clear' }
  | { type: 'computeStart'; requestId: number; continuation: Continuation }
  | { type: 'computeSuccess'; requestId: number; result: number }
  | { type: 'computeFailure'; requestId: number; message: string };

export interface ComputeRequest { operation: Operation; operands: number[]; continuation: Continuation }
```

**Invariants.** The reducer tests assert these after every step:

- `loading === (inFlight !== null)`.
- `awaitingOperand` implies `overwrite`.
- `awaitingOperand` implies `pendingOperation !== null`.
- `pendingOperation !== null` holds exactly when `accumulator !== null`.
- When `error !== null`, the rest of the state equals `initialState`.

#### 5.4.2 Static keypad (`keys.ts`)

Export `KEYPAD: readonly KeyDef[]` in DOM order, where `KeyDef = { id: KeyId; label: string; ariaLabel: string; kind: 'digit' | 'decimal' | 'operator' | 'unary' | 'equals' | 'clear' }`.

| row | id | label | ariaLabel | kind |
|---|---|---|---|---|
| 1 | `clear` | `C` | `Clear` | clear |
| 1 | `sqrt` | `√` | `Square root` | unary |
| 1 | `percent` | `%` | `Percent` | unary |
| 1 | `divide` | `÷` | `Divide` | operator |
| 2 | `7` `8` `9` | same | `7` `8` `9` | digit |
| 2 | `multiply` | `×` | `Multiply` | operator |
| 3 | `4` `5` `6` | same | `4` `5` `6` | digit |
| 3 | `subtract` | `−` (U+2212) | `Subtract` | operator |
| 4 | `1` `2` `3` | same | `1` `2` `3` | digit |
| 4 | `add` | `+` | `Add` | operator |
| 5 | `0` | `0` | `0` | digit |
| 5 | `decimal` | `.` | `Decimal point` | decimal |
| 5 | `power` | `^` | `Power` | operator |
| 5 | `equals` | `=` | `Equals` | equals |

Also export:

- `OPERATOR_SYMBOLS: Record<BinaryOperation, string>`, set to `{ add: '+', subtract: '−', multiply: '×', divide: '÷', power: '^' }`. The frontend owns its display strings.
- `isBinaryKey(k): k is BinaryOperation`.
- `isUnaryKey(k): k is UnaryOperation`.
- `isDigitKey(k): k is Digit`.

#### 5.4.3 Reducer (`reducer.ts`)

Export:

- `MAX_INPUT_DIGITS = 15`;
- `initialState = { display: '0', accumulator: null, pendingOperation: null, awaitingOperand: false, overwrite: false, error: null, loading: false, inFlight: null }`;
- `calculatorReducer(state, action): CalcState`;
- `getComputeRequest(state, key): ComputeRequest | null`;
- `keyToAction(key): CalcAction | null`.

General rules:

- `countDigits(s)` counts the characters `0` to `9`. It lives in `selectors.ts`.
- An **ignored action returns the same `state` object reference**. Tests check this with `toBe`.
- The current value is `Number(display)`, so `'0.'` is `0` and `'5.'` is `5`.

**`digit d`:**

1. If `loading`, return `state`.
2. Let `base = error !== null ? initialState : state`.
3. If `base.overwrite`, return `{ ...base, display: d, overwrite: false, awaitingOperand: false }`.
4. If `base.display === '0'`, return `{ ...base, display: d }` (the leading-zero rule).
5. If `countDigits(base.display) >= MAX_INPUT_DIGITS`, return `base`.
6. Otherwise return `{ ...base, display: base.display + d }`.

**`decimal`:**

1. If `loading`, return `state`.
2. Let `base = error !== null ? initialState : state`.
3. If `base.overwrite`, return `{ ...base, display: '0.', overwrite: false, awaitingOperand: false }`.
4. If `base.display` already contains `.`, return `base`.
5. If `countDigits(base.display) >= MAX_INPUT_DIGITS`, return `base`.
6. Otherwise append `.`.

**`operator op`** (local path only):

1. If `loading` or `error !== null`, return `state`.
2. If `pendingOperation !== null && awaitingOperand`, return `{ ...state, pendingOperation: op }`. This replaces the operator, so `2 + ×` means `2 ×`.
3. If `pendingOperation !== null && !awaitingOperand`, return `state`. Chaining needs the API, and the hook never dispatches this case.
4. Otherwise return `{ ...state, accumulator: Number(display), pendingOperation: op, awaitingOperand: true, overwrite: true }`.

**`clear`:** always return `initialState`, even while loading or in the error state.

**`computeStart`:** return `{ ...state, loading: true, inFlight: { requestId, continuation } }`.

**`computeSuccess { requestId, result }`:**

1. If `inFlight === null || inFlight.requestId !== requestId`, return `state`, because the response is stale.
2. Set the common fields: `display: String(result)`, `loading: false`, `inFlight: null`, `error: null`, `overwrite: true`.
3. Apply the continuation:
   - `chain(next)`: `accumulator: result`, `pendingOperation: next`, `awaitingOperand: true`.
   - `equals`: `accumulator: null`, `pendingOperation: null`, `awaitingOperand: false`.
   - `unary`: `awaitingOperand: false`. Leave `accumulator` and `pendingOperation` unchanged, so that `2 + 9 √ =` sends `add [2, 3]`.

**`computeFailure { requestId, message }`:**

1. If the request ID does not match, return `state`.
2. Otherwise return `{ ...initialState, error: message }`.

After an error:

- the display shows the error text;
- a digit or `.` starts a new number;
- `C` clears;
- operators, `√`, `%` and `=` are ignored.

**`getComputeRequest(state, key)`** is pure:

1. If `state.loading || state.error !== null`, return `null`.
2. If `isUnaryKey(key)`, return `{ operation: key, operands: [Number(display)], continuation: { kind: 'unary' } }`. There is no client-side pre-validation, because the API rejects negative square roots.
3. If `key === 'equals'`:
   - when `pendingOperation !== null`, return `{ operation: pendingOperation, operands: [accumulator, Number(display)], continuation: { kind: 'equals' } }`;
   - otherwise return `null`.
4. If `isBinaryKey(key) && pendingOperation !== null && !awaitingOperand`, return `{ operation: pendingOperation, operands: [accumulator, Number(display)], continuation: { kind: 'chain', next: key } }`.
5. Otherwise return `null`.

**`keyToAction(key)`:**

| key | action |
|---|---|
| digit | `{ type: 'digit', digit }` |
| `decimal` | `{ type: 'decimal' }` |
| binary operator | `{ type: 'operator', operation }` |
| `clear` | `{ type: 'clear' }` |
| `equals`, `sqrt`, `percent` | `null` |

#### 5.4.4 Selectors (`selectors.ts`)

- **`countDigits(s: string): number`.**
- **`selectExpression(state): string`:** when `pendingOperation !== null`, return `` `${String(accumulator)} ${OPERATOR_SYMBOLS[pendingOperation]}` ``, for example `"2 +"` or `"-2 ×"`. Otherwise return `''`.
- **`displaySize(text): 'lg' | 'md' | 'sm'`:**
  - length ≤ 9: `lg`;
  - length 10 to 13: `md`;
  - length 14 or more: `sm`.

  The longest realistic display string is about 24 characters, for example `-1.7976931348623157e+308`. Near ±MAX_VALUE, `finalizeResult` keeps the unrounded value.

#### 5.4.5 Async integration (`useCalculator.ts`)

The hook reads the **latest** state through `stateRef`, never the render-time `state`. Every action goes through `apply()`, which updates the ref synchronously before dispatching. A digit followed by `=` before React re-renders therefore still builds the request from the current display, and `press` stays stable.

```ts
import { useCallback, useReducer, useRef } from 'react';
import { calculate } from '../api/client';
import { toDisplayMessage } from '../api/errorMessages';
import { calculatorReducer, getComputeRequest, initialState, keyToAction } from './reducer';
import type { CalcAction, KeyId } from './types';

export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const stateRef = useRef(initialState); // latest state, updated synchronously by apply()
  const busyRef = useRef(false);         // synchronous guard against double-clicks within one tick
  const lastIdRef = useRef(0);           // latest issued request id; anything else is stale

  const apply = useCallback((action: CalcAction) => {
    stateRef.current = calculatorReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const press = useCallback((key: KeyId) => {
    if (key === 'clear') {
      busyRef.current = false;
      lastIdRef.current += 1;      // invalidates any in-flight request
      apply({ type: 'clear' });
      return;
    }
    if (busyRef.current) return;
    const request = getComputeRequest(stateRef.current, key);
    if (!request) {
      const action = keyToAction(key);
      if (action) apply(action);
      return;
    }
    const requestId = ++lastIdRef.current;
    busyRef.current = true;
    apply({ type: 'computeStart', requestId, continuation: request.continuation });
    calculate(request.operation, request.operands).then(
      (result) => {
        if (requestId !== lastIdRef.current) return;
        busyRef.current = false;
        apply({ type: 'computeSuccess', requestId, result });
      },
      (error: unknown) => {
        if (requestId !== lastIdRef.current) return;
        busyRef.current = false;
        apply({ type: 'computeFailure', requestId, message: toDisplayMessage(error) });
      },
    );
  }, [apply]);

  return { state, press };
}
```

Implement all four layers of race handling:

1. While `loading` is true, every key except `C` is disabled.
2. `busyRef` drops a second press that arrives before React re-renders.
3. `stateRef` ensures compute requests use the latest state, even for presses made before a re-render.
4. Stale responses are discarded both in the hook (`lastIdRef`) **and** in the reducer (the `requestId` check).

Pressing `C` during a request resets the state immediately, and the late response is ignored. Do not abort the fetch, because the client signature has no signal parameter.

### 5.5 Components and UI

- **`Key`** takes `{ def: KeyDef; onPress(id: KeyId): void; disabled: boolean; pressed?: boolean }`.
  - It renders `<button type="button" aria-label={def.ariaLabel} disabled={disabled} data-kind={def.kind}>{def.label}</button>`.
  - `aria-pressed={pressed}` is set **only** when `def.kind === 'operator'`.
  - A click calls `onPress(def.id)`.
  - The CSS class depends on `kind`: digit (for both `digit` and `decimal`), function (for `clear` and `unary`), operator, or equals.
- **`Keypad`** takes `{ onPress; disabled: boolean; activeOperation: BinaryOperation | null }`.
  - It renders `<div role="group" aria-label="Keypad">` containing the 20 `KEYPAD` keys in order.
  - `disabled` applies to every key **except** `clear`.
  - Each operator key gets `pressed = activeOperation === def.id`.
- **`Display`** takes `{ value: string; error: string | null; expression: string }`.
  - The expression line is `<div data-testid="expression" aria-hidden="true">{expression}</div>`. It is small and muted, and shows a non-breaking space (`' '`) when empty.
  - The main line is `<div role="status" aria-live="polite" aria-atomic="true" data-size={displaySize(text)} data-error={error !== null ? 'true' : undefined}>{text}</div>`, where `text = error ?? value`.
- **`Calculator`** uses `useCalculator()` and renders:
  ```tsx
  <section aria-label="Calculator" aria-busy={state.loading}>
    <Display value={state.display} error={state.error} expression={selectExpression(state)} />
    <Keypad
      onPress={press}
      disabled={state.loading}
      activeOperation={state.awaitingOperand ? state.pendingOperation : null}
    />
  </section>
  ```
  There is no spinner. Disabled keys plus reduced keypad opacity under `[aria-busy="true"]` are enough.
- **`App`** renders `<main>` containing a visually hidden `<h1>Calculator</h1>` (using a global `.visually-hidden` class in `index.css`) and `<Calculator />`.

**Styling (CSS Modules plus tokens in `index.css`):**

- **Tokens.** Define these on `:root`: `--bg`, `--surface`, `--display-bg`, `--text`, `--muted`, `--key-digit`, `--key-fn`, `--key-op`, `--key-eq`, `--key-text`, `--focus`, `--error`.
  - Give `body` `background: var(--bg)`, a system font stack and `margin: 0`.
  - Aim for at least WCAG AA contrast (4.5:1).
  - **(stretch)** Redefine the tokens under `@media (prefers-color-scheme: dark)`.
- **Layout.** Mobile first.
  - `main` is centered, with `min-height: 100dvh` and `padding: 16px`.
  - The calculator is `width: min(100%, 380px)`.
  - The keypad is `display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px`.
  - Keys use `aspect-ratio: 1 / 1`, `min-height: 48px`, `font-size: 1.5rem` and rounded corners.
- **Breakpoints:**
  - `@media (max-width: 359px)`: gap `6px` and key font `1.25rem`.
  - `@media (min-width: 480px)`: the calculator becomes a card with padding and a shadow.
  - `@media (max-height: 540px) and (orientation: landscape)`: keys use `aspect-ratio: auto; height: 44px`.
- **The page must not scroll horizontally at 320 px width.** M7 checks this, and the brief requires it.
- **Display.**
  - `text-align: right`, `white-space: nowrap`, `font-variant-numeric: tabular-nums` and, as a last resort, `overflow-x: auto`.
  - `data-size` sets the font size: `lg` is 2.75rem, `md` is 2rem and `sm` is 1.25rem.
  - `[data-error]` uses `color: var(--error)`.
- **Keys:**
  - `:focus-visible` shows a 3px outline in `--focus`.
  - `:active` darkens or scales the key slightly, except under `prefers-reduced-motion: reduce`.
  - `[aria-pressed="true"]` inverts the operator colours.
  - `:disabled` sets `opacity: .5; cursor: not-allowed`.
- Tests never assert CSS class names. They assert roles, names, text, and the `data-size`, `data-error`, `aria-pressed`, `aria-busy` and `disabled` attributes.
- **Do not attach `keydown` listeners.** Native Tab, Enter and Space activation of buttons must keep working.

---

## 6. Infrastructure: Docker and CI

### 6.1 Single multi-stage `Dockerfile` (one container, one port)

Express serves both the API and the SPA on port `3000`. Compose reuses the intermediate `api` target, so there is only one backend recipe. Create the root `Dockerfile` with exactly this content:

```dockerfile
# syntax=docker/dockerfile:1

ARG NODE_VERSION=24

# ---- 1. Install all workspace dependencies (cached on lockfile changes only)
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

# ---- 2a. Build the backend (TypeScript -> backend/dist)
FROM deps AS build-backend
COPY . .
RUN npm run build -w backend

# ---- 2b. Build the frontend (Vite -> frontend/dist)
FROM deps AS build-frontend
COPY . .
RUN npm run build -w frontend

# ---- 3. Production-only dependencies for the backend workspace
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
# npm may nest some backend deps under backend/node_modules; make sure the directory exists so it can be copied.
RUN npm ci --omit=dev --workspace=backend && mkdir -p backend/node_modules && npm cache clean --force

# ---- 4. API-only runtime (used by docker-compose as target "api")
FROM node:${NODE_VERSION}-alpine AS api
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=build-backend /app/backend/package.json ./backend/package.json
COPY --from=build-backend /app/backend/dist ./backend/dist
# Files stay root-owned (read-only for the app); the process runs as the unprivileged "node" user.
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/health || exit 1
CMD ["node", "backend/dist/server.js"]

# ---- 5. Default target: API + built SPA on one port
FROM api AS app
ENV STATIC_DIR=/app/public
COPY --from=build-frontend /app/frontend/dist ./public
```

Summarise these design points in the README:

- **Layer caching.** Only the manifests and the lockfile are copied before `npm ci`.
- **Lean runtime.** No compilers, no dev dependencies and no frontend sources. **(stretch)** Keep the image under 250 MB.
- **Both `node_modules` directories are copied.** With npm workspaces, the lockfile may place a backend dependency under `backend/node_modules` when versions conflict, so copying only the root directory could fail at runtime with `ERR_MODULE_NOT_FOUND`.
- **`backend/package.json` is copied** because its `"type": "module"` field controls how `dist/*.js` is loaded as ESM.
- **Non-root.** The process runs as `node`, and the files stay root-owned.
- **`127.0.0.1` in the healthcheck**, because on Alpine `localhost` can resolve to `::1` while the server binds IPv4 only.
- **Health check timing.** The first probe runs one `interval` (10 s) after start. `--start-interval` is not used, so the Dockerfile works on Docker Engine 24.
- **Exec-form `CMD`** makes `node` PID 1, so `SIGTERM` reaches `server.ts`.
- **`STATIC_DIR` is set only in the `app` stage.** The `api` stage serves only the API.

**Fallback.** If `npm ci --omit=dev --workspace=backend` fails, replace that line with `RUN npm ci --omit=dev && mkdir -p backend/node_modules && npm cache clean --force` and report the change.

### 6.2 `.dockerignore` (repo root; applies to both Dockerfiles)

```
**/node_modules
**/dist
**/coverage
**/*.tsbuildinfo
**/*.log
**/.env
**/.env.*
.git
.github
.vscode
.idea
.DS_Store
**/*.md
docker-compose.yml
```

### 6.3 docker-compose: nginx frontend + backend container

nginx serves the SPA on host port `8080` (container port `80`) and proxies `/api` and `/api/` to `backend:3000`. The backend is **not** published to the host.

`frontend/Dockerfile`. Its build context is the repo root:

```dockerfile
# syntax=docker/dockerfile:1

ARG NODE_VERSION=24

# ---- Build the SPA
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci
COPY . .
RUN npm run build -w frontend

# ---- Serve it with nginx
FROM nginx:1.28-alpine AS runtime
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
```

`frontend/nginx.conf`:

```nginx
server {
  listen 80;
  server_name _;
  server_tokens off;

  root /usr/share/nginx/html;
  index index.html;

  # Exact /api (no trailing slash): proxy it too, so Express answers with its JSON 404
  # instead of nginx issuing a 301 redirect to /api/.
  location = /api {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 5s;
    proxy_read_timeout 15s;
  }

  # API: proxy to the backend service. No URI on proxy_pass, so the /api/v1/... path is forwarded unchanged.
  # Backend responses keep their own headers (helmet, Cache-Control: no-store, JSON errors incl. 404/405/413).
  location /api/ {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 5s;
    proxy_read_timeout 15s;
  }

  # Hashed, immutable build assets.
  location /assets/ {
    try_files $uri =404;
    expires 1y;
    add_header X-Content-Type-Options "nosniff" always;
  }

  # SPA: real files first, otherwise index.html (client-side routes). index.html is never cached.
  location / {
    try_files $uri $uri/ /index.html;
    expires -1;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'" always;
  }
}
```

- Keep the security headers in the static `location` blocks, **not** at `server` level. At `server` level they would duplicate helmet's headers on `/api/`.
- The CSP mirrors helmet 8's default CSP, without `upgrade-insecure-requests`.
- Leave `client_max_body_size` at its 1 MB default. Bodies between 10 kB and 1 MB then reach Express, which returns the JSON 413 envelope.

Root `docker-compose.yml`:

```yaml
name: calculator

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: api
    environment:
      NODE_ENV: production
      PORT: '3000'
    expose:
      - '3000'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '-qO-', 'http://127.0.0.1:3000/api/v1/health']
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 10s

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - '8080:80'
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
```

- The backend reuses the root `api` target, so there is one backend recipe and no `STATIC_DIR`.
- `depends_on: service_healthy` avoids a race with nginx's start-up DNS lookup of `backend`.
- **Known limitation (include it in the README):** nginx resolves `backend` once, at start-up. If the backend container is recreated with a new IP, restart `frontend` as well.

### 6.4 GitHub Actions CI

**Required CI jobs**, per D8: `repo-checks` and the `package` matrix, which runs lint, typecheck, test with coverage, and build for each package. The `docker` job is **stretch** and belongs to M13.

Create `.github/workflows/ci.yml` with this content. Prettier may reformat whitespace, which is fine.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  repo-checks:
    name: Contract & formatting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Contract copies are byte-identical
        run: npm run check:contract
      - name: Prettier
        run: npm run format:check

  package:
    name: ${{ matrix.workspace }} (lint, typecheck, test+coverage, build)
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        workspace: [backend, frontend]
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Lint
        run: npm run lint -w ${{ matrix.workspace }}
      - name: Typecheck
        run: npm run typecheck -w ${{ matrix.workspace }}
      - name: Test with coverage (fails below 80%)
        run: npm run test -w ${{ matrix.workspace }}
      - name: Build
        run: npm run build -w ${{ matrix.workspace }}
      - name: Coverage summary
        if: always()
        run: |
          echo "### Coverage — ${{ matrix.workspace }}" >> "$GITHUB_STEP_SUMMARY"
          node scripts/coverage-summary.mjs ${{ matrix.workspace }} >> "$GITHUB_STEP_SUMMARY" || true
      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-${{ matrix.workspace }}
          path: ${{ matrix.workspace }}/coverage/
          if-no-files-found: warn
          retention-days: 14
```

**(stretch, M13)** Add this `docker` job under `jobs:`. Every check stores the curl output in a variable before grepping it. Piping `curl` straight into `grep -q` can make curl exit 23 (SIGPIPE), which fails the step under `bash -eo pipefail`.

```yaml
  docker:
    name: Docker build & smoke test
    needs: [repo-checks, package]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Build single image
        run: docker build -t calculator:ci .

      - name: Smoke test single image
        run: |
          docker run -d --name calc -p 3000:3000 calculator:ci
          for i in $(seq 1 30); do curl -fsS localhost:3000/api/v1/health >/dev/null && break; sleep 1; done
          out=$(curl -fsS localhost:3000/api/v1/health); grep -q '"status":"ok"' <<<"$out"
          out=$(curl -fsS -X POST localhost:3000/api/v1/calculate \
            -H 'Content-Type: application/json' \
            -d '{"operation":"add","operands":[0.1,0.2]}'); grep -q '"result":0.3' <<<"$out"
          out=$(curl -fsS localhost:3000/); grep -q '<div id="root">' <<<"$out"
          test "$(docker exec calc whoami)" = "node"

      - name: Single image logs
        if: failure()
        run: docker logs calc || true

      - name: Compose build & smoke test
        run: |
          docker compose up -d --build --wait --wait-timeout 120
          out=$(curl -fsS localhost:8080/api/v1/health); grep -q '"status":"ok"' <<<"$out"
          out=$(curl -fsS -X POST localhost:8080/api/v1/calculate \
            -H 'Content-Type: application/json' \
            -d '{"operation":"sqrt","operands":[16]}'); grep -q '"result":4' <<<"$out"
          out=$(curl -fsS localhost:8080/); grep -q '<div id="root">' <<<"$out"

      - name: Compose logs
        if: failure()
        run: docker compose logs || true

      - name: Tear down
        if: always()
        run: |
          docker rm -f calc || true
          docker compose down -v || true
```

- Pin actions to a major version tag, never `@main`. You may move to a newer major if it works.
- Do not add deployment, publishing, secrets or third-party coverage services.
- Validate the YAML locally (for example with `npx --yes yaml-lint .github/workflows/ci.yml`) and run every `run` command locally.

---

## 7. Testing strategy and coverage

### 7.0 MUST and SHOULD test rows

| Priority | Backend | Frontend |
|---|---|---|
| **MUST** (always write these) | contract rows 1–44, D1–D48, V1–V10, C1–C9 | R1–R45, FC1–FC11, UI1–UI21 |
| **SHOULD** (write them unless the §0a priority cut applies) | A1–A33, E1–E4, M1–M6 | S1–S5, FE1–FE6, K1–K6, DS1–DS4, AP1 |

- Write the MUST rows of a milestone first, then its SHOULD rows.
- Even with SHOULD rows skipped, coverage must stay at least 80%.
- List every skipped SHOULD row in your final report.

### 7.1 Strategy

| Layer | What | Tool | Mocking |
|---|---|---|---|
| Backend domain | `calculator.ts`, `errors.ts`, `validation.ts` and `config.ts`, as pure unit tests | Vitest | none |
| Backend HTTP | Every contract rule: status, code, headers, order of checks | Vitest + supertest against `createApp()` (no ports opened) | `calculate` wrapped in `vi.fn`, overridden only for the 500 row |
| Backend middleware | Edge branches that are hard to reach over HTTP | Vitest with stub `req` and `res` | stubs |
| Frontend client | `fetch` handling, timeout, error mapping | Vitest | `vi.stubGlobal('fetch', …)` |
| Frontend logic | The pure reducer state machine and selectors | Vitest | a fake API, **only** inside the test helper |
| Frontend UI | Components and the full calculator integration | Vitest + RTL + user-event | `vi.mock` of `api/client` (keeping the real `ApiError`) |

General rules:

- Each table row is its own `it(...)`, unless the row lists several inputs that can be asserted together. Table-driven `it.each` is allowed, and recommended for the D, V, R and FE rows, as long as each row stays a separate case.
- **Never assert zod message text or CSS class names.**
- **Never write a number literal that loses precision** (ESLint `no-loss-of-precision`). Use `Number('...')` or a raw JSON string.

### 7.2 Coverage configuration and reports

`backend/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    env: { NODE_ENV: 'test' },
    // mockReset clears vi.fn() history between tests; in Vitest 3 it resets to the implementation
    // passed to vi.fn(impl), so the api.test.ts wrapper keeps the real calculate().
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // server.ts only wires listen/signals (covered by the manual smoke test in M3);
      // contract.ts is types-only and compiles to an empty module.
      exclude: ['src/server.ts', 'src/contract.ts'],
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
```

The frontend coverage block lives in `frontend/vite.config.ts` (§5.2).

- **Exclusions.** Exclude only process bootstrap (`server.ts`, `main.tsx`), types-only files (`contract.ts`, `types.ts`, `*.d.ts`), test files and test setup. **Never exclude real logic to reach the threshold.**
- **Thresholds.** If lines, branches, functions or statements fall below 80%, `vitest` exits non-zero, which fails `npm test`, `npm run verify` and CI. Aim for at least 95% in practice.
- **What "fails the build" (D9) means.** It refers to the CI pipeline and `npm run verify`. The coverage threshold makes `vitest` exit non-zero, which fails the CI step `Test with coverage` before the `Build` step runs. By design, `npm run build` and the Docker builds only compile, which keeps image builds fast. State this in the README's Testing section.
- **Reports.**
  - HTML/lcov: `backend/coverage/` and `frontend/coverage/`, each containing `index.html`, `lcov.info` and `coverage-summary.json`. These directories are git-ignored, and CI uploads them as artifacts.
  - **Committed text report: `docs/coverage.md`.** The brief lists a coverage report as a deliverable, and without a push no CI artifact exists. Generate it like this:
    1. Run `npm run test:coverage 2>&1 | tee /tmp/calc-coverage.txt`.
    2. Write `docs/coverage.md` with: the summary table that the script printed at the end; each package's per-file `text` reporter table, copied from the run into a ```` ```text ```` fence under a `## backend` or `## frontend` heading; and a final line `_Generated on YYYY-MM-DD at commit <short-sha>._`, where `<short-sha>` is the output of `git rev-parse --short HEAD` at the moment you ran the coverage command, before the docs commit.
    3. Link it from the README.
  - Also paste the summary table into the README.
- **Prove the gate** in both packages:
  ```bash
  npm run test -w backend -- --coverage.thresholds.lines=101; echo "exit=$?"
  ```
  This must print an error such as `ERROR: Coverage for lines (…%) does not meet global threshold (101%)`, followed by `exit=1`. Repeat it with `-w frontend`.

### 7.3 Backend tests

Every domain-error assertion checks `instanceof AppError`, `status` and `code`. Use this helper:

```ts
function expectAppError(fn: () => unknown, status: number, code: ErrorCode) {
  try { fn(); } catch (e) {
    expect(e).toBeInstanceOf(AppError);
    expect((e as AppError).status).toBe(status);
    expect((e as AppError).code).toBe(code);
    return;
  }
  throw new Error('expected AppError');
}
```

#### 7.3.1 Contract matrix (`backend/test/api.test.ts`, rows 1–44)

Set up the test file like this:

```ts
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import type { ApiErrorBody } from '../src/contract.js';

vi.mock('../src/calculator.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/calculator.js')>();
  return { ...actual, calculate: vi.fn(actual.calculate) }; // real behaviour unless overridden (row 43)
});

import { calculate } from '../src/calculator.js';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

const app = createApp(loadConfig({ NODE_ENV: 'test' })); // hermetic: ignores the developer's env
const calc = (body: object) => request(app).post('/api/v1/calculate').send(body);
const raw = (text: string, type = 'application/json') =>
  request(app).post('/api/v1/calculate').set('Content-Type', type).send(text);
// Typed accessor for validation detail paths (res.body is `any`; this keeps typecheck and lint clean).
const paths = (res: { body: unknown }) =>
  (res.body as ApiErrorBody).error.details?.map((d) => d.path) ?? [];
```

Each row asserts:

- the HTTP status;
- `body.error.code` for errors, or `body.result` for successes;
- the `Allow` header on 405 rows;
- for validation rows, the detail paths, always through the helper, for example `expect(paths(res)).toContain('operands.0')`.

| # | request | expected |
|---|---|---|
| 1 | `GET /api/v1/health` | 200 `{status:"ok"}` |
| 2 | `GET /api/v1/operations` | 200, 7 entries in §3.3.2 order with the correct arity |
| 3 | POST `{add,[2,3]}` | 200, result `5`, operation and operands echoed |
| 4 | POST `{add,[0.1,0.2]}` | 200, result `0.3` |
| 5 | POST `{subtract,[0.3,0.1]}` | 200, result `0.2` |
| 6 | POST `{multiply,[-1,0]}` | 200, result `0` |
| 7 | POST `{divide,[10,4]}` | 200, result `2.5` |
| 8 | POST `{divide,[1,3]}` | 200, result `0.333333333333333` |
| 9 | POST `{divide,[5,0]}` | 422 `DIVISION_BY_ZERO` |
| 10 | POST `{divide,[0,0]}` | 422 `DIVISION_BY_ZERO` |
| 11 | POST `{power,[2,10]}` | 200, result `1024` |
| 12 | POST `{power,[2,-1]}` | 200, result `0.5` |
| 13 | POST `{power,[0,0]}` | 200, result `1` |
| 14 | POST `{power,[0,-1]}` | 422 `NON_FINITE_RESULT` |
| 15 | POST `{power,[10,400]}` | 422 `NON_FINITE_RESULT` |
| 16 | POST `{power,[-8,0.5]}` | 422 `NON_FINITE_RESULT` |
| 17 | POST `{multiply,[1e308,10]}` | 422 `NON_FINITE_RESULT` |
| 18 | POST `{add,[1.7976931348623157e308,0]}` | 200, result `Number.MAX_VALUE` (the rounding-overflow fallback) |
| 19 | POST `{sqrt,[9]}` | 200, result `3` |
| 20 | POST `{sqrt,[2]}` | 200, result `1.4142135623731` |
| 21 | POST `{sqrt,[-4]}` | 422 `NEGATIVE_SQRT` |
| 22 | POST `{percent,[50]}` | 200, result `0.5` |
| 23 | POST `{operation:"modulo",operands:[1,2]}` | 400 `UNSUPPORTED_OPERATION` |
| 24 | POST `{operation:"ADD",operands:[1,2]}` | 400 `UNSUPPORTED_OPERATION` |
| 25 | POST `{sqrt,[1,2]}` | 400 `INVALID_OPERAND_COUNT` |
| 26 | POST `{add,[1]}` | 400 `INVALID_OPERAND_COUNT` |
| 27 | POST `{add,[]}` | 400 `INVALID_OPERAND_COUNT` |
| 28 | POST `{add,["2",3]}` | 400 `VALIDATION_ERROR`, with a detail at path `operands.0` |
| 29 | POST `{add,[true,3]}` and `{add,[null,3]}` | 400 `VALIDATION_ERROR` |
| 30 | POST raw `{"operation":"add","operands":[1e309,1]}` | 400 `VALIDATION_ERROR` |
| 31 | POST `{operands:[1,2]}` (operation missing) | 400 `VALIDATION_ERROR`, path `operation` |
| 32 | POST `{add,[1,2],extra:1}` | 400 `VALIDATION_ERROR` |
| 33 | POST `{operation:"modulo",operands:["x"]}` | 400 `VALIDATION_ERROR` (the shape check runs before the lookup) |
| 34 | POST `[1,2]` | 400 `VALIDATION_ERROR` |
| 35 | POST raw `{"operation":` (malformed) | 400 `MALFORMED_JSON` |
| 36 | POST raw `null` | 400 `MALFORMED_JSON` |
| 37 | POST with `Content-Type: text/plain` | 415 `UNSUPPORTED_MEDIA_TYPE` |
| 38 | POST a body over 10 kB (`operation` = 11,000 × `"a"`) | 413 `PAYLOAD_TOO_LARGE` |
| 39 | `GET /api/v1/calculate` | 405 `METHOD_NOT_ALLOWED`, `Allow: POST` |
| 40 | `POST /api/v1/health` | 405, `Allow: GET` |
| 41 | `GET /api/v1/nope` and `GET /api/v2/calculate` | 404 `NOT_FOUND`, JSON content type |
| 42 | any API response | `Cache-Control: no-store`, and no `X-Powered-By` header |
| 43 | `vi.mocked(calculate).mockImplementationOnce(() => { throw new Error('boom: secret internals'); })`, with `console.error` spied and silenced | 500 `INTERNAL_ERROR`, message `An unexpected error occurred.` (see the row 43 details below) |
| 44 | Static app (see below): `GET /` and `GET /some/client/route` | 200 HTML. `GET /api/v1/nope` still returns 404 JSON |

**Row 43 details.** In addition to the status, code and message, assert that:

- `JSON.stringify(res.body)` contains neither `boom` nor `at `;
- `Object.keys(res.body.error)` equals `['code','message']`;
- the spy was called once.

**Row 44 setup.**

1. Create `dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spa-'))`.
2. Write `index.html` (`<!doctype html><title>spa</title>`) and `assets/app.js` into it.
3. Build a second app with `createApp({ ...loadConfig({ NODE_ENV: 'test' }), staticDir: dir })`.
4. Delete `dir` in `afterAll`.

#### 7.3.2 Additional HTTP rows (`api.test.ts`)

| # | Request | Expected |
|---|---|---|
| A1 | `request(app).post('/api/v1/calculate')` with no body and no Content-Type | 415 `UNSUPPORTED_MEDIA_TYPE` |
| A2 | `raw('{"operation":"add","operands":[2,3]}', 'application/json; charset=utf-8')` | 200, result `5` |
| A3 | `raw('x'.repeat(11_000), 'text/plain')` | 415, not 413 (the content-type check runs first) |
| A4 | `calc({})` | 400 `VALIDATION_ERROR`. The paths include `operation` and `operands` |
| A5 | `calc({ operation: '', operands: [1, 2] })` | 400 `VALIDATION_ERROR`, path `operation` |
| A6 | `calc({ operation: 123, operands: [1, 2] })` | 400 `VALIDATION_ERROR`, path `operation` |
| A7 | `calc({ operation: 'add', operands: '1,2' })` | 400 `VALIDATION_ERROR`, path `operands` |
| A8 | `calc({ operation: 'add', operands: [[1], 2] })` and `[{}, 2]` | 400 `VALIDATION_ERROR`, path `operands.0` |
| A9 | `calc({ operation: 'constructor', operands: [1, 2] })` and `'toString'` | 400 `UNSUPPORTED_OPERATION` |
| A10 | `calc({ operation: 'modulo', operands: [1, 2] })` | The message is exactly the §3.7.2 `UNSUPPORTED_OPERATION` text for `modulo` |
| A11 | `calc({ operation: 'percent', operands: [1, 2] })` | 400 `INVALID_OPERAND_COUNT`, message `Operation 'percent' expects 1 operand but received 2.` |
| A12 | `raw('{"operation":"divide","operands":[1,-0]}')` | 422 `DIVISION_BY_ZERO` |
| A13 | `add [1e308, 1e308]` and `subtract [-1e308, 1e308]` | 422 `NON_FINITE_RESULT` |
| A14 | `divide [1e308, 1e-10]` | 422 `NON_FINITE_RESULT` |
| A15 | `multiply [1e-200, 1e-200]` | 200, result `0` |
| A16 | `percent [-50]` | 200, result `-0.5` |
| A17 | `calc({ operation: 'add', operands: [Number('123456789012345678'), 0] })` (no lossy literal) | 200, result `123456789012346000` |
| A18 | A successful `add [2, 3]` | `Object.keys(res.body)` equals `['operation','operands','result']`. `typeof result === 'number'`. Content-Type matches `/application\/json; charset=utf-8/` |
| A19 | An error response (for example row 9) | `Object.keys(res.body)` equals `['error']`, and there is no `details` key |
| A20 | `OPTIONS /api/v1/calculate` and `PUT /api/v1/operations` | 405, with `Allow: POST` and `Allow: GET` respectively |
| A21 | `GET /api/v1/calculate` | The message is exactly `Method GET not allowed on /api/v1/calculate.` |
| A22 | `HEAD /api/v1/health` | 200 |
| A23 | `POST /api/v1/nope` and `GET /api` | 404 `NOT_FOUND`. The first message is exactly `Route POST /api/v1/nope not found.` |
| A24 | 404 and 422 responses | Both carry `Cache-Control: no-store` |
| A25 | Any API response | `x-content-type-options: nosniff` is present. The CSP does **not** contain `upgrade-insecure-requests` |
| A26 | App **without** `STATIC_DIR`: `GET /` | 404 (the Express default). `index.html` is never served |
| A27 | Static app: `GET /assets/app.js` | 200 with a JavaScript content type |
| A28 | Static app: `HEAD /` | 200 |
| A29 | Static app: `POST /some/client/route` | 404, not `index.html` |
| A30 | Static app: `GET /api/v1/health` | 200 JSON |
| A31 | `add [2,3]` posted to `/api/v1/calculate?x=1` | 200, result `5` |
| A32 | `raw('{"operation":"add","operands":[2,3]}', 'application/json; charset=latin1')` | 415 `UNSUPPORTED_MEDIA_TYPE` (body-parser `charset.unsupported`) |
| A33 | `request(app).post('/api/v1/calculate').set('Content-Type','application/json').set('Content-Encoding','bogus').send('{}')` | 415 `UNSUPPORTED_MEDIA_TYPE` (body-parser `encoding.unsupported`) |

#### 7.3.3 Domain (`backend/test/calculator.test.ts`)

| # | Call | Expected |
|---|---|---|
| D1 | `finalizeResult(0.30000000000000004)` | `0.3` |
| D2 | `finalizeResult(-0)` | `Object.is(r, 0)` |
| D3 | `finalizeResult(Infinity)` | 422 `NON_FINITE_RESULT` |
| D4 | `finalizeResult(-Infinity)` | 422 `NON_FINITE_RESULT` |
| D5 | `finalizeResult(NaN)` | 422 `NON_FINITE_RESULT` |
| D6 | `finalizeResult(Number.MAX_VALUE)` | `Number.MAX_VALUE` |
| D7 | `finalizeResult(-Number.MAX_VALUE)` | `-Number.MAX_VALUE` |
| D8 | `finalizeResult(Number('123456789012345678'))` (no lossy literal) | `123456789012346000` |
| D9 | `finalizeResult(Number.MIN_VALUE)` | `5e-324` |
| D10 | `finalizeResult(42)` and `finalizeResult(1e21)` | unchanged |
| D11 | `calculate('add', [2, 3])` | `5` |
| D12 | `calculate('add', [0.1, 0.2])` | `0.3` |
| D13 | `calculate('add', [1e308, 1e308])` | 422 `NON_FINITE_RESULT` |
| D14 | `calculate('subtract', [0.3, 0.1])` | `0.2` |
| D15 | `calculate('subtract', [5, 8])` | `-3` |
| D16 | `calculate('subtract', [-1e308, 1e308])` | 422 `NON_FINITE_RESULT` |
| D17 | `calculate('multiply', [0.1, 3])` | `0.3` |
| D18 | `calculate('multiply', [-1, 0])` | `Object.is(r, 0)` |
| D19 | `calculate('multiply', [1e-200, 1e-200])` | `0` |
| D20 | `calculate('multiply', [1e308, 10])` | 422 `NON_FINITE_RESULT` |
| D21 | `calculate('divide', [10, 4])` | `2.5` |
| D22 | `calculate('divide', [1, 3])` | `0.333333333333333` |
| D23 | `calculate('divide', [2, 3])` | `0.666666666666667` |
| D24 | `calculate('divide', [-6, 3])` | `-2` |
| D25 | `calculate('divide', [5, 0])` | 422 `DIVISION_BY_ZERO` |
| D26 | `calculate('divide', [5, -0])` | 422 `DIVISION_BY_ZERO` |
| D27 | `calculate('divide', [0, 0])` | 422 `DIVISION_BY_ZERO` |
| D28 | `calculate('divide', [1e308, 1e-10])` | 422 `NON_FINITE_RESULT` |
| D29 | `calculate('power', [2, 10])` | `1024` |
| D30 | `calculate('power', [2, -1])` | `0.5` |
| D31 | `calculate('power', [0, 0])` | `1` |
| D32 | `calculate('power', [-2, 3])` | `-8` |
| D33 | `calculate('power', [2, 0.5])` | `1.4142135623731` |
| D34 | `calculate('power', [0, -1])` | 422 `NON_FINITE_RESULT` |
| D35 | `calculate('power', [10, 400])` | 422 `NON_FINITE_RESULT` |
| D36 | `calculate('power', [-8, 0.5])` | 422 `NON_FINITE_RESULT` |
| D37 | `calculate('sqrt', [9])` | `3` |
| D38 | `calculate('sqrt', [2])` | `1.4142135623731` |
| D39 | `calculate('sqrt', [0])` and `[-0]` | both `Object.is(r, 0)` |
| D40 | `calculate('sqrt', [-4])` and `[-1e-300]` | 422 `NEGATIVE_SQRT` |
| D41 | `calculate('percent', …)` with `[50]`, `[-50]`, `[0.1]`, `[0]` | `0.5`, `-0.5`, `0.001`, `0` |
| D42 | `calculate('sqrt', [1, 2])` | 400 `INVALID_OPERAND_COUNT`, message exactly `Operation 'sqrt' expects 1 operand but received 2.` |
| D43 | `calculate('add', [1])` and `calculate('add', [])` | 400 `INVALID_OPERAND_COUNT`. The first message is exactly `Operation 'add' expects 2 operands but received 1.` |
| D44 | `calculate('add', Object.freeze([1, 2]))` | `3`, with no mutation error |
| D45 | `isOperation` for each of the 7 names | `true` |
| D46 | `isOperation` for `'ADD'`, `'modulo'`, `''`, `'toString'`, `'constructor'`, `'__proto__'`, `'hasOwnProperty'` | `false` |
| D47 | `listOperations()` | Deep-equals the §3.3.2 array: order, symbols (including `'−'`), arity and descriptions. Each entry's `Object.keys` is `['name','symbol','arity','description']`. In particular, `listOperations().map(o => o.name)` equals `['add','subtract','multiply','divide','power','sqrt','percent']` |
| D48 | Domain error messages | The `DIVISION_BY_ZERO`, `NEGATIVE_SQRT` and `NON_FINITE_RESULT` errors carry the exact §3.7.2 messages, and `name === 'AppError'` |

#### 7.3.4 Validation, errors and config

These rows go in `validation.test.ts`, `errors.test.ts` and `config.test.ts`.

| # | Case | Expected |
|---|---|---|
| V1 | `{operation:'add', operands:[1,2]}` | Succeeds, and `data` equals the input |
| V2 | `{operation:'add', operands:['2',3]}` | Fails, path `operands.0` |
| V3 | Operands `[Infinity,1]`, and `JSON.parse('{"operation":"add","operands":[1e309,1]}')` | Fails, path `operands.0` |
| V4 | Operands `[NaN,1]` | Fails, path `operands.0` |
| V5 | Operands `[true,1]`, `[null,1]`, `[[1],1]`, `[{},1]` | Each fails at `operands.0` |
| V6 | `{operation:'add', operands:[1,2], extra:1}` | Fails, and one issue has path `(root)` |
| V7 | `{operation:'', operands:[1,2]}` and `{operation:123, operands:[1,2]}` | Fails at `operation` |
| V8 | `{operation:'add'}` and `{operation:'add', operands:'1,2'}` | Fails at `operands` |
| V9 | `[1,2]`, `null`, `42`, `undefined` | Fails, path `(root)` |
| V10 | `toValidationIssues` on the result for `{}` | Two issues, with paths `operation` and `operands`, each with a non-empty string `message` |
| E1 | `new AppError(422,'DIVISION_BY_ZERO','m')` | `instanceof Error`, `name === 'AppError'`, `status`, `code` and `message` set, `details` undefined |
| E2 | `MESSAGES.UNSUPPORTED_OPERATION('modulo', ['add','subtract','multiply','divide','power','sqrt','percent'])` (a literal array, so this test does not depend on `calculator.ts`; D47 checks that `listOperations()` returns the same names) | Exactly `Unsupported operation 'modulo'. Supported operations: add, subtract, multiply, divide, power, sqrt, percent.` |
| E3 | `MESSAGES.INVALID_OPERAND_COUNT` with arity 1 and 2 received, then arity 2 and 1 received | Singular "1 operand" and plural "2 operands" |
| E4 | `MESSAGES.NOT_FOUND('GET','/api/v1/nope')` and `MESSAGES.METHOD_NOT_ALLOWED('GET','/api/v1/calculate')` | `Route GET /api/v1/nope not found.` and `Method GET not allowed on /api/v1/calculate.` |
| C1 | `loadConfig({})` | `{ port: 3000, nodeEnv: 'development', staticDir: undefined }` |
| C2 | `loadConfig({ PORT: '8081', NODE_ENV: 'production' })` | port `8081`, nodeEnv `'production'` |
| C3 | `PORT: ''` | port `3000` |
| C4 | `PORT` set to `'abc'`, `'0'`, `'70000'` or `'3000.5'` | Throws `/Invalid PORT/` |
| C5 | `NODE_ENV: 'staging'` | Throws `/Invalid NODE_ENV/` |
| C6 | `NODE_ENV: 'test'` | nodeEnv `'test'` |
| C7 | `STATIC_DIR: ''` | `staticDir` is undefined |
| C8 | `STATIC_DIR: 'relative/dir'` | The result is absolute and ends with `path.join('relative','dir')` |
| C9 | `STATIC_DIR: '/abs/dir'` | `path.resolve('/abs/dir')` |

#### 7.3.5 Middleware (`backend/test/middleware.test.ts`)

Build the stub `res` from separate spy variables, and assert on those variables. Never assert on `res.status` or `res.json`, because that trips `@typescript-eslint/unbound-method`:

```ts
const status = vi.fn();
const json = vi.fn();
const res = { headersSent: false, status, json } as unknown as Response;
status.mockReturnValue(res);
const next = vi.fn();
const req = {} as Request;
```

| # | Case | Expected |
|---|---|---|
| M1 | `requestLogFormat('development' / 'production' / 'test')` | `'dev'` / `'combined'` / `null` |
| M2 | `errorHandler(err, req, res, next)` with a stub whose `headersSent` is `true` | `next` is called with `err`, and `status` is not called |
| M3 | `errorHandler('boom', req, res, next)` with `console.error` spied and silenced | `status` is called with `500`. `json` is called with `{ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } }`. The spy was called once |
| M4 | `createApp({ port: 3000, nodeEnv: 'test', staticDir: <empty temp dir> })` | Throws `/does not contain index.html/` |
| M5 | `createApp({ port: 3000, nodeEnv: 'production' })` | Returns an app without throwing. Make no request |
| M6 | `errorHandler({ type: 'request.aborted' }, …)` and `errorHandler({ type: 'request.size.invalid' }, …)` | `status` is called with `400`, and `json` with code `MALFORMED_JSON` |

### 7.4 Frontend tests

#### 7.4.1 Reducer and selectors (`reducer.test.ts`, `selectors.test.ts`)

Write a helper `run(keys: KeyId[], fakeApi = defaultFake)` that mirrors the hook. For each key:

1. Call `getComputeRequest`.
2. If the result is not null:
   - dispatch `computeStart`;
   - then dispatch `computeSuccess` with `fakeApi(request)`, or `computeFailure` if `fakeApi` throws;
   - record the request in `requests`.
3. Otherwise dispatch `keyToAction(key)`, if that is not null.
4. Assert the §5.4.1 invariants after every step.

The helper returns `{ state, requests }`.

`defaultFake` is the **only** place in the frontend that does arithmetic: add, subtract, multiply, divide, power, `Math.sqrt` and `/100`.

| # | Input | Expected |
|---|---|---|
| R1 | `initialState` | Equals the §5.4.3 object |
| R2 | `5` | display `'5'` |
| R3 | `0 0` | display `'0'` |
| R4 | `0 7` | display `'7'` |
| R5 | `1 2 3` | display `'123'` |
| R6 | `.` | display `'0.'` |
| R7 | `1 . . 5` | display `'1.5'`. The second `.` returns the same reference |
| R8 | `0 . 0 5` | display `'0.05'` |
| R9 | `9` × 16 | 15 nines. The 16th press returns the same reference |
| R10 | `1 .` then `2` × 15 | display `'1.' + '2'.repeat(14)` |
| R11 | 15 digits then `.` | Ignored (same reference) |
| R12 | `2 add` | accumulator 2, pending `add`, awaitingOperand true, overwrite true, display `'2'`, no request |
| R13 | `2 add multiply` | pending `multiply`, no request |
| R14 | `2 add 3` | display `'3'`, awaitingOperand false, overwrite false, accumulator 2 |
| R15 | `2 add .` | display `'0.'` |
| R16 | `getComputeRequest` after `2 add 3`, for `multiply` | `{ operation:'add', operands:[2,3], continuation:{kind:'chain', next:'multiply'} }` |
| R17 | `computeStart`, then `computeSuccess(5)` with chain(multiply) | display `'5'`, accumulator 5, pending `multiply`, awaitingOperand true, loading false, inFlight null |
| R18 | `2 add 3 multiply 4 equals` | display `'20'`. Requests `[add [2,3], multiply [5,4]]` |
| R19 | `5 equals` | `getComputeRequest` returns `null`. The state is unchanged |
| R20 | `2 add 3 equals` | Request `add [2,3]` with `equals`. Display `'5'`, accumulator null, pending null, overwrite true, awaitingOperand false |
| R21 | `…equals` (giving 5), then `7` | display `'7'` |
| R22 | `…equals`, then `.` | display `'0.'` |
| R23 | `…equals` (giving 5), then `add 1 equals` | The last request is `add [5,1]`. Display `'6'` |
| R24 | `5 multiply equals` | Request `multiply [5,5]`. Display `'25'` |
| R25 | `2 add 3 equals equals` | Exactly one request |
| R26 | `9 sqrt` | Request `sqrt [9]` with `unary`. Display `'3'`, overwrite true, awaitingOperand false |
| R27 | `2 add 9 sqrt equals` | Requests `[sqrt [9], add [2,3]]`. Display `'5'` |
| R28 | `2 add sqrt` | Request `sqrt [2]`. pending is still `add`, accumulator 2 |
| R29 | `5 0 percent` | Request `percent [50]`. Display `'0.5'` |
| R30 | `9 sqrt 4` | display `'4'` |
| R31 | `5 . add 1 equals` | Requests `[add [5,1]]` |
| R32 | `3 subtract 5 equals multiply 3 equals` | Display `'-2'`, then `'-6'`. The second request is `multiply [-2,3]` |
| R33 | `0 subtract 4 equals sqrt` | Request `sqrt [-4]` (no client pre-validation) |
| R34 | `computeFailure` (matching ID, `'Cannot divide by zero'`) | `{ ...initialState, error: 'Cannot divide by zero' }` |
| R35 | Error state, then `add`, `sqrt` or `equals` | `getComputeRequest` returns `null` for each. The `operator` action returns the same reference |
| R36 | Error state, then `7` | `{ ...initialState, display: '7' }` |
| R37 | Error state, then `.` | display `'0.'`, error null |
| R38 | Error state, then `clear` | `toEqual(initialState)` |
| R39 | Loading, then a `digit`, `decimal` or `operator` action | Same reference each time |
| R40 | Loading, then `getComputeRequest` for `equals`, `add` or `sqrt` | `null` |
| R41 | `computeSuccess` with a mismatched `requestId` | Same reference, still loading |
| R42 | `clear` during loading, then `computeSuccess` with the old ID | `initialState`, then the same reference |
| R43 | `computeFailure` with a stale ID | Same reference |
| R44 | Success with `1e21` / `1e-7` / `0.3` | display `'1e+21'` / `'1e-7'` / `'0.3'` |
| R45 | Operator path 3 (pending, not awaiting) dispatched directly | Same reference |
| S1 | `selectExpression` with nothing pending | `''` |
| S2 | `selectExpression` after `2 add` / after a `-2` result then `multiply` / after `2 power` | `'2 +'` / `'-2 ×'` / `'2 ^'` |
| S3 | `displaySize` | `'0'` → lg. 9 characters → lg. 10 → md. 13 → md. 14 → sm. `'-1.7976931348623157e+308'` → sm |
| S4 | `countDigits` | `'12.5'` → 3. `'-0.05'` → 3. `'1e+21'` → 3 |
| S5 | `keyToAction` | `'7'` → digit, `'decimal'` → decimal, `'add'` → operator, `'clear'` → clear. `'equals'`, `'sqrt'` and `'percent'` → `null` |

#### 7.4.2 API client (`client.test.ts`)

Setup:

- Stub fetch with `vi.stubGlobal('fetch', vi.fn())`.
- Build responses with `new Response(body, { status, headers })`.
- In `afterEach`, call `vi.unstubAllGlobals()` and `vi.useRealTimers()`.

| # | Scenario | Expected |
|---|---|---|
| FC1 | 200 `{"operation":"add","operands":[2,3],"result":5}` | Resolves to `5`. Fetch is called once with `'/api/v1/calculate'`, `method:'POST'`, the headers `Content-Type: application/json` and `Accept: application/json`, the body `JSON.stringify({operation:'add',operands:[2,3]})` and an `AbortSignal` |
| FC2 | 422 `DIVISION_BY_ZERO` envelope | `ApiError` with code `DIVISION_BY_ZERO`, status 422, the server's message, `instanceof Error` and `name 'ApiError'` |
| FC3 | 400 `VALIDATION_ERROR` envelope with `details` | code `VALIDATION_ERROR`, status 400 |
| FC4 | 422 `NEGATIVE_SQRT` / 422 `NON_FINITE_RESULT` | Those codes |
| FC5 | `fetch` rejects with `TypeError('Failed to fetch')` | `NETWORK_ERROR`, status undefined |
| FC6 | Fake timers, and a fetch that rejects only when its signal aborts | After `vi.advanceTimersByTime(REQUEST_TIMEOUT_MS)`: `NETWORK_ERROR`, and the signal is `aborted` |
| FC7 | 502 with `<html>Bad Gateway</html>` (`text/html`) | `UNEXPECTED_RESPONSE`, status 502 |
| FC8 | 500 with `{"foo":1}` | `UNEXPECTED_RESPONSE`, status 500 |
| FC9 | 200 with `{"result":"5"}` / `{}` / `{"result":null}` | `UNEXPECTED_RESPONSE`, status 200 |
| FC10 | 200 with a non-JSON body | `UNEXPECTED_RESPONSE`, status 200 |
| FC11 | Success under fake timers | `vi.getTimerCount()` is `0` afterwards |

#### 7.4.3 Error messages (`errorMessages.test.ts`)

| # | Input | Expected |
|---|---|---|
| FE1 | `ApiError('DIVISION_BY_ZERO', …)` | `'Cannot divide by zero'` |
| FE2 | `NEGATIVE_SQRT` | `'Invalid input'` |
| FE3 | `NON_FINITE_RESULT` | `'Math error'` |
| FE4 | `NETWORK_ERROR` | `'Network error'` |
| FE5 | `VALIDATION_ERROR`, `UNSUPPORTED_OPERATION`, `UNEXPECTED_RESPONSE`, `INTERNAL_ERROR` | `'Error'` for each |
| FE6 | `new Error('x')`, `'boom'`, `undefined` | `'Error'` for each |

#### 7.4.4 Components (`Key`, `Keypad`, `Display` and `App` tests)

| # | Scenario | Expected |
|---|---|---|
| K1 | `Key` for `add`, then a click | `onPress('add')`. The button is named `Add` and has `type="button"` |
| K2 | `Key` for a digit | No `aria-pressed` attribute |
| K3 | A disabled `Key`, then a click | `onPress` is not called |
| K4 | `Keypad` renders | 20 buttons in this order: `Clear, Square root, Percent, Divide, 7, 8, 9, Multiply, 4, 5, 6, Subtract, 1, 2, 3, Add, 0, Decimal point, Power, Equals` |
| K5 | `Keypad` with `disabled` | 19 buttons are disabled, and `Clear` is enabled |
| K6 | `Keypad` with `activeOperation='add'` | `Add` has `aria-pressed="true"`, and the other 4 operators have `"false"` |
| DS1 | `Display` with `value='123'` | The status shows `123`, has `data-size="lg"` and has no `data-error` |
| DS2 | `Display` with `error='Math error'` | The status shows `Math error` with `data-error="true"` |
| DS3 | `Display` with `expression='2 +'` | `getByTestId('expression')` has the text `2 +` |
| DS4 | A 22-character value | `data-size="sm"` |
| AP1 | `App` renders | A heading named `Calculator` and a region named `Calculator` |

#### 7.4.5 Integration (`Calculator.test.tsx`)

Mock the client module, keeping the real `ApiError`, and give each test a clean mock:

```ts
vi.mock('../../api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/client')>()),
  calculate: vi.fn(),
}));

import { calculate } from '../../api/client';

beforeEach(() => {
  vi.mocked(calculate).mockReset();
  vi.mocked(calculate).mockResolvedValue(0); // safe default; tests override per call
});
```

Testing approach:

- Every test that expects a call sets its own `mockResolvedValueOnce` or `mockRejectedValueOnce`, or uses a deferred.
- Use `userEvent.setup()`.
- Find keys with `getByRole('button', { name })`.
- Read the display with `getByRole('status')`.
- Control pending requests with a `deferred<number>()` helper.
- The empty expression line contains a non-breaking space, so assert it with `expect(screen.getByTestId('expression').textContent).toBe(' ')`. Do not use `toHaveTextContent('')`, which matches any content.

| # | Scenario | Expected |
|---|---|---|
| UI1 | Initial render | The display shows `0`, `calculate` has not been called, and `aria-busy="false"` |
| UI2 | Click `1 2 3` | Display `123`, no call |
| UI3 | `2 + 3 =`, with the mock resolving `5` | One call, `('add', [2, 3])`. The display shows `5` (use `findByText` or `waitFor`), and the expression's `textContent` is `' '` |
| UI4 | `2 + 3 ×` (mock `5`), then `4 =` (mock `20`) | The first call is `('add',[2,3])`. Then the display is `5`, the expression is `5 ×` and `Multiply` has `aria-pressed="true"`. The second call is `('multiply',[5,4])`, and the display ends at `20` |
| UI5 | `2 + × 3 =` | One call, `('multiply',[2,3])` |
| UI6 | `9 √` | `('sqrt',[9])` |
| UI7 | `5 0 %` | `('percent',[50])` |
| UI8 | `2 ^ 1 0 =` | `('power',[2,10])` |
| UI9 | `2 + 3 =` with a deferred promise | Before it resolves: every key except `Clear` is disabled and `aria-busy="true"`. After it resolves: the keys are enabled and `aria-busy="false"` |
| UI10 | Click `Clear` while a deferred is pending | Display `0` and the keys are enabled. Resolving the deferred with `99` leaves the display at `0` |
| UI11 | Click `2 + 3`, make `calculate` return a pending `deferred<number>()`, then `await user.dblClick(Equals)` | `calculate` was called exactly once, with `('add',[2,3])`. After the deferred resolves with 5, the display shows `5` |
| UI12 | The mock rejects with `new ApiError('DIVISION_BY_ZERO','…',422)` after `5 ÷ 0 =` | The status shows `Cannot divide by zero` with `data-error="true"` |
| UI13 | The mock rejects with `NEGATIVE_SQRT`, `NON_FINITE_RESULT`, `NETWORK_ERROR` or `VALIDATION_ERROR`, or with a plain `Error` | `Invalid input` / `Math error` / `Network error` / `Error` / `Error` |
| UI14 | After an error, click `+`, `√` and `=` | No further calls, and the error text stays |
| UI15 | After an error, click `7` | Display `7`, with no `data-error` |
| UI16 | After an error, click `Clear` | Display `0` |
| UI17 | `5 =` | No call, and the display stays `5` |
| UI18 | `3 − 5 =` (mock `-2`), then `× 3 =` | The display shows `-2`. The next call is `('multiply',[-2,3])` |
| UI19 | The mock resolves `1.23456789012346e+21` | The display text is `1.23456789012346e+21`, with `data-size="sm"` |
| UI20 | 16 clicks on `9` | 15 nines |
| UI21 | Click `. .` then `5` | Display `0.5` |

---

## 8. Documentation

### 8.1 README.md outline

Write the README **last**, from a working system. **Every command output you paste must come from a real run.** If a real output differs from what this prompt expects, investigate before you paste it. Use these sections, in this order:

1. **Title and summary.**
   - `# Calculator`.
   - **CI badge:** add `![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)` only if you pushed and the URL is real. Otherwise leave this HTML comment: `<!-- CI badge: add ![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg) after pushing -->`.
   - Two or three sentences: a React + TypeScript keypad calculator backed by an Express + TypeScript REST microservice that does all the arithmetic.
   - **(stretch)** A screenshot at `docs/screenshot.png`.
2. **Features.**
   - The 7 operations: binary add, subtract, multiply, divide and power; unary sqrt and percent.
   - Left-to-right chaining.
   - Input validation and friendly errors (see the design decision "Frontend input validation and error handling").
   - A responsive layout.
   - A JSON REST API with stable error codes.
   - At least 80% coverage, enforced in CI.
   - Two Docker modes.
3. **Quick start.**
   - `docker build -t calculator . && docker run --rm -p 3000:3000 calculator`, then open `http://localhost:3000`.
   - Or `npm install && npm run dev`, then open `http://localhost:5173`.
4. **Prerequisites.**
   - Node 24 LTS (minimum 22.12; `nvm use` reads `.nvmrc`) and npm 10 or later.
   - Docker 24 or later with Compose v2, needed only for the Docker modes.
5. **Setup.**
   - `git clone …`, `cd …`, `nvm use`, `npm install`.
   - Explain the npm-workspaces monorepo: one install covers both packages.
6. **Running in development.**
   - `npm run dev` runs both packages:
     - the backend on `:3000` with `tsx watch`;
     - the frontend on `:5173` with Vite HMR, proxying `/api` to `127.0.0.1:3000`.
   - To run them separately: `npm run dev -w backend`, and `npm run dev -w frontend` (which needs the backend for calculations).
   - The environment variables table (no other variables exist):

     | variable | default | meaning |
     |---|---|---|
     | `PORT` | `3000` | Port the backend listens on |
     | `NODE_ENV` | `development` | `development`, `production` or `test`; controls the morgan log format |
     | `STATIC_DIR` | unset | Path to the built frontend. When it is set, Express also serves the SPA |
7. **Production build without Docker.**
   - `npm run build`
   - `NODE_ENV=production STATIC_DIR="$PWD/frontend/dist" node backend/dist/server.js`, then open `http://localhost:3000`.
   - Also show `npm start -w backend` for API-only mode.
8. **Testing and coverage.**
   - Commands:
     - `npm test`
     - `npm run test -w backend` and `npm run test -w frontend`
     - `npm run test:watch -w <pkg>`
     - `npm run test:coverage`
     - `npm run lint`, `npm run typecheck`, `npm run format`
     - `npm run verify` (everything CI runs except Docker)
   - What is tested:
     - **Backend:** pure calculator unit tests, plus supertest contract tests covering all 44 rows of the API matrix and the extra edge cases.
     - **Frontend:** RTL component and state tests with the API client mocked, plus client tests with `fetch` stubbed.
   - The committed coverage report: a link to `docs/coverage.md`.
   - The HTML reports (`backend/coverage/index.html`, `frontend/coverage/index.html`) are git-ignored and uploaded by CI as artifacts.
   - Coverage exclusions and why:
     - `server.ts` and `main.tsx` are bootstrap code;
     - `contract.ts`, `types.ts` and `*.d.ts` are types-only;
     - test files and test setup.
   - The 80% threshold fails the run. Include the §7.2 explanation of what "fails the build" means.
   - **Coverage summary:** paste the table from `npm run test:coverage`, followed by `_Generated on YYYY-MM-DD at commit <short-sha>._`. Use the same date and SHA as `docs/coverage.md` (`git rev-parse --short HEAD`, taken when you ran the coverage command, before the docs commit).
9. **Docker.**
   - **Single container:**
     - `docker build -t calculator .` and `docker run --rm -p 3000:3000 calculator`, or the `npm run docker:*` scripts;
     - the stages (deps, build-backend, build-frontend, prod-deps, api, app);
     - runs as non-root, with a health check;
     - `docker build --target api` builds an API-only image.
   - **Compose:**
     - `docker compose up --build`, then open `http://localhost:8080`, and stop with `docker compose down`;
     - a diagram: `browser → nginx :8080 → (static files | /api, /api/* → backend:3000)`;
     - the backend is not published to the host;
     - the nginx DNS limitation.
   - **When to use which:**
     - the single container is the easiest to run and suits a PaaS;
     - compose shows a typical production topology.
10. **API reference.**
    - Base path `/api/v1`, JSON only, `Cache-Control: no-store`.
    - An endpoints table with the request and response shapes.
    - The operations table with its edge cases (§3.4).
    - The error envelope and the full code table (§3.7.2). Clients branch on `code`, never on `message`.
    - **All curl examples from §3.10**, with real outputs. For compose, replace `localhost:3000` with `localhost:8080`.
    - Mention the 10 kB / 413 limit.
11. **Design decisions.** Give each decision a heading, two to four sentences, and the trade-off it accepts:
    1. **Backend language: Node.js instead of Go.** The brief lists Go as the preferred backend language. By explicit stakeholder decision, Node.js + TypeScript was chosen instead to have one language across the stack, shared contract types and one toolchain. The trade-off is a heavier runtime than a Go binary.
    2. **Monorepo with npm workspaces.**
    3. **A single `POST /calculate` endpoint plus an operation table.** `GET /operations` is generated from the same table. The trade-off is an RPC style rather than one resource per operation.
    4. **The backend does all the arithmetic.** Chaining runs **left to right**, like a pocket calculator (`2 + 3 × 4 = 20`), with one API call per binary step. Unary keys apply immediately.
    5. **Number handling.** Doubles, with only results rounded to 15 significant digits (`0.1 + 0.2 → 0.3`). The **trade-off** is large-integer precision (`123456789012345678 → 123456789012346000`). Non-finite results are rejected, and `-0` is normalised.
    6. **Operation semantics.** Unary `percent = x/100`. `sqrt` of a negative number is rejected. `0/0` is `DIVISION_BY_ZERO`. `0^0 = 1`.
    7. **Status-code policy** (400 vs 422, §3.7.3), with one envelope and stable codes. The UI maps codes to short strings.
    8. **Strict validation with zod 4.** No coercion, unknown keys rejected, the shape checked before the operation lookup, and finite numbers only.
    9. **Contract types duplicated, not shared** (the §3.2 rationale plus the CI check).
    10. **No CORS** (§3.8). OPTIONS requests return 405.
    11. **Security headers.** helmet, with `upgrade-insecure-requests` disabled for plain HTTP. nginx sends the same CSP as helmet 8's default, minus `upgrade-insecure-requests`.
    12. **Express 5, with `createApp()` separate from `listen()`.** This lets supertest run without opening ports. The modules are layered from the pure `calculator.ts` through the controllers and the router to `createApp`, and then `server.ts`.
    13. **Frontend.** Vite + React + CSS Modules, with no UI library. A pure reducer plus a small async hook that reads the latest state through a ref. Tests mock the client module, not `fetch`.
    14. **Frontend input validation and error handling.** List the concrete mechanisms: at most 15 digits, one decimal point, no leading zeros, operator replacement (`2 + ×`), keys disabled while a request is in flight, the double-click guard, discarding stale responses, client checks of the response shape (`UNEXPECTED_RESPONSE`), and API error codes mapped to short display texts. Domain checks (÷0, √ of a negative) are deliberately left to the backend, the single source of truth.
    15. **Testing strategy and coverage gate.**
    16. **Two deployment modes** sharing the `api` target.
12. **Assumptions.**
    - Single user and stateless: no auth, persistence or history.
    - English UI only.
    - Mouse and touch input only; keyboard input is out of scope.
    - Negative numbers are entered as results (`0 − 5 =`).
    - There is no repeat-equals, and `5 × =` gives `25`.
    - Percent is `x/100` (`200 + 10 % =` gives `200.1`).
    - Input is limited to 15 digits.
    - The display shows `String(result)`, including exponent notation, and never re-rounds.
    - Errors are shown as short texts mapped from the API `code`. Normal UI use cannot produce `VALIDATION_ERROR`.
    - When the backend is down behind a running proxy (the Vite dev server or nginx), the display shows `Error`, because the proxy returns a non-JSON 5xx (`UNEXPECTED_RESPONSE`). `Network error` appears only when the request itself fails or times out.
    - There is no `VITE_API_BASE_URL`, because every mode is same-origin.
    - Only modern evergreen browsers are supported.
    - The 2–4 hour timebox, including which SHOULD test rows were skipped, if any.
    - Every assumption you made under rule 0d.7.
13. **Project structure.** An annotated tree of the real repo. Use `tree -I 'node_modules|dist|coverage' -L 3`. If `tree` is not installed, use `find . -path ./node_modules -prune -o -path '*/node_modules' -prune -o -path '*/dist' -prune -o -path '*/coverage' -prune -o -path ./.git -prune -o -print | sort`.
14. **Continuous integration.** The jobs: `repo-checks` (Contract & formatting), the `package` matrix with a backend leg and a frontend leg, and `docker` (only if you completed M13). Say what each one checks, where the coverage artifacts are, and mention `workflow_dispatch`.
15. **Limitations and future improvements.**
    - Keyboard input.
    - History.
    - An OpenAPI spec and a generated client.
    - Arbitrary-precision decimals (for example `decimal.js`).
    - An operator-precedence mode.
    - Rate limiting.
    - Compression or gzip.
    - Structured logging with request IDs.
    - E2E tests (Playwright).
    - An accessibility audit.
    - nginx dynamic DNS re-resolution.
    - Publishing images.
    - Known limitations:
      - `(-8) ** (1/3)` gives `NON_FINITE_RESULT` rather than `-2`;
      - large integers lose precision beyond 15 digits.
16. **AI usage.** One paragraph linking to `PROMPTS.md`.

Rules for the README:

- No section may describe a feature that does not exist.
- Keep it scannable: tables, short paragraphs and code blocks.
- Run `npm run format` afterwards.

### 8.2 PROMPTS.md

The brief requires an honest record of the AI prompts that were used.

- Do not invent prompts or outcomes, and do not claim that no AI was used.
- Entry 2 must contain **this entire implementation prompt verbatim**. It starts with the line `# Implementation Prompt: Full-Stack Calculator (React + Node.js)` and ends with the line `*End of implementation prompt.*`.
  - Wrap it in a **four-tilde fence** (`~~~~markdown` … `~~~~`) inside the `<details>` block. This prompt contains three-backtick and three-tilde fences, which do not close a four-tilde fence.
  - **Preferred route (deterministic):** if a file with this prompt exists in your working directory or the project directory (for example `calculator-plan.md` or `IMPLEMENTATION_PROMPT.md`), insert it with a shell command instead of retyping it. For example, write everything before the fence to `/tmp/prompts-head.md` and everything after it to `/tmp/prompts-tail.md`, then run `{ cat /tmp/prompts-head.md; echo '~~~~markdown'; cat <prompt file>; echo '~~~~'; cat /tmp/prompts-tail.md; } > PROMPTS.md`.
  - **Fallback:** if no such file exists, write the prompt into the file in several chunks. Then check that the pasted section starts with the first line and ends with the last line named above.
  - If you cannot reproduce it completely, insert `Rafael Teodosio: paste the implementation prompt verbatim` instead and list it under Open items in your final report.
  - `PROMPTS.md` is in `.prettierignore`, so Prettier will not reformat it.
- Use `Rafael Teodosio` only where you cannot know the content, such as the planning conversation, other tools used and the human review.

Template:

~~~markdown
# AI Prompts Used

This project was built with AI assistance. This file records the prompts used, what each was for,
and how the output was reviewed, as requested by the assignment.

## Tools

- **Claude Code** (Anthropic) — planning and implementation.
- Rafael Teodosio: list any other tools (e.g. ChatGPT, Copilot) or write "none".

## Workflow summary

1. **Planning.** The assignment brief was discussed with an AI assistant; design decisions were made by
   the author (UI style, API shape, operations, number handling, stack, deployment, CI, repo layout).
2. **Implementation prompt.** The decisions were compiled into a single detailed, self-contained
   implementation prompt (reproduced below) and given to Claude Code.
3. **Implementation.** Claude Code implemented the repository from that prompt and verified each step by
   running the tests, coverage, builds, Docker images and curl checks.
4. **Review.** Rafael Teodosio: describe how you reviewed and tested the result yourself.

## Prompt log

### 1. Planning conversation

- **Goal:** turn the take-home brief into concrete decisions and a step-by-step plan.
- **Prompt(s):**

  Rafael Teodosio: paste the planning prompts verbatim.

- **Outcome:** a written implementation plan with an API contract, test matrix and README outline.

### 2. Implementation prompt

- **Goal:** implement the complete repository without further questions.
- **Prompt:**

  <details>
  <summary>Full implementation prompt (click to expand)</summary>

  (paste this entire prompt here, verbatim, inside a ~~~~ fence)

  </details>

- **Outcome:** <filled in by the implementing agent: a short factual list of what was built and verified>

### 3. Follow-up prompts

| # | Prompt (verbatim) | Why | Result |
|---|---|---|---|
| 1 | Rafael Teodosio | | |

## What was checked by a human

- Rafael Teodosio: e.g. "Read every source file", "Ran the app in both Docker modes", "Tried edge cases X, Y, Z".

## Notes and corrections

- Rafael Teodosio: anything the AI got wrong and how it was fixed.
~~~

Fill in entry 2's **Outcome** with facts:

- the packages created;
- the test counts per package, and any SHOULD rows skipped;
- the coverage percentages;
- which Docker modes you verified, and which checks were not verified and why.

---

## 9. Ordered master task list

The estimates assume an efficient run. The full list takes **about 4 to 5 hours**, and the MUST path (MUST test rows, no stretch items) fits in **about 3.5 hours**. Items marked **(stretch)** are optional. Run every command from the repo root. Use the background-process pattern from §0d.3 for every server.

### M0. Root scaffolding (10 min)

- [ ] Check `node --version`. If it is below 22.12, follow the remedy in §2.2.
- [ ] If `<project directory>/.git` does not exist, run `git init -b main` there, then check `git rev-parse --show-toplevel` (§0d.4).
- [ ] Create every root file from §2.3, including the `scripts/` directory.
- [ ] Create a stub `backend/package.json` (`{"name":"backend","version":"1.0.0","private":true}`) and a stub `frontend/package.json` (`{"name":"frontend","version":"1.0.0","private":true}`) so npm can resolve the workspaces. Later milestones replace them.
- [ ] Run `npm install -D concurrently prettier`.

**Acceptance:**

- `node --version` is at least 22.12.
- `npm install` creates a single root `package-lock.json` and `node_modules/`.
- `npm run format:check` exits 0. Run `npm run format` first if needed.

**Commit:** `chore: scaffold npm workspaces monorepo with tooling config`

### M1. Contract types (5 min)

- [ ] Create `backend/src/contract.ts` and `frontend/src/api/contract.ts` with the exact §3.2 content.

**Acceptance:**

- `npm run check:contract` prints `check:contract: OK — …` and exits 0.
- Change one character in the frontend copy. The command now exits 1 and names both files. Revert the change.

**Commit:** `feat: add shared API contract types`

### M2. Backend scaffold and pure domain (30 min)

Commits in this milestone must pass typecheck, lint and `npx -w backend vitest run`. The coverage gate does not apply yet (§0d.4).

- [ ] **B1.** Create `backend/package.json` from §4.2 (run both install commands), both tsconfigs (§4.3), `eslint.config.js` (§4.4) and `vitest.config.ts` (§7.2). Add a temporary `src/app.ts` that exports a `createApp` returning `express()`, and a placeholder test.
  - `npm install` exits 0.
  - `npm run typecheck -w backend` and `npm run lint -w backend` exit 0.
  - `npx -w backend vitest run` reports 1 passing test.
- [ ] **B2.** `npm run typecheck -w backend` exits 0 with `contract.ts` in place.
- [ ] **B3.** Add `src/errors.ts` and `test/errors.test.ts` (E1–E4, SHOULD). `npx -w backend vitest run test/errors.test.ts` passes. E2 uses a literal array, so it does not need `calculator.ts`.
- [ ] **B4.** Add `src/calculator.ts` and `test/calculator.test.ts` (D1–D48), replacing the placeholder test.
  - All D-rows pass.
  - `grep -E "express|zod|process|console" backend/src/calculator.ts` prints nothing.
- [ ] **B5.** Add `src/validation.ts` and `test/validation.test.ts` (V1–V10). All pass.
- [ ] **B6.** Add `src/config.ts` and `test/config.test.ts` (C1–C9). All pass.

**Commits:**

- `feat(backend): implement operation table and result rounding`
- `test(backend): add calculator unit tests`

### M3. Backend HTTP layer, contract tests and server (40 min)

From this milestone on, every backend commit must pass `npm run test -w backend`, including the 80% gate.

- [ ] **B7.** Add all of `src/middleware/*`, `src/controllers/*`, `src/routes/api.ts`, the final `src/app.ts` (§4.6) and `test/middleware.test.ts` (M1–M6).
  - `npm run typecheck -w backend` and `npm run lint -w backend` exit 0.
  - The M-rows pass.
- [ ] **B8.** Add `test/api.test.ts` covering **every** contract row 1–44 (§7.3.1) and A1–A33 (§7.3.2).
  - `npm run test -w backend` exits 0, with at least 80% on all four metrics (expect far more).
  - Prove the gate: `npm run test -w backend -- --coverage.thresholds.lines=101; echo "exit=$?"` prints a threshold error and `exit=1`.
- [ ] **B9.** Add `src/server.ts`, then run these checks.
  - Build:
    ```bash
    npm run build -w backend                                  # exits 0
    test -f backend/dist/server.js && echo OK                 # OK
    find backend/dist -name '*.test.*' | wc -l                # 0
    ```
  - API-only server:
    ```bash
    PORT=3000 node backend/dist/server.js > /tmp/calc-srv.log 2>&1 &
    PID=$!
    for i in $(seq 1 20); do curl -fs localhost:3000/api/v1/health >/dev/null && break; sleep 0.5; done
    grep 'Calculator API listening' /tmp/calc-srv.log         # the listening line
    # ... run every curl from §3.10 here (see the expectations below) ...
    curl -s -w '\nHTTP %{http_code}\n' -X POST localhost:3000/api/v1/calculate \
      -H 'Content-Type: application/json' -d ''              # VALIDATION_ERROR, HTTP 400 (empty JSON body → {})
    kill -INT $PID; wait $PID; echo "exit=$?"                 # exit=0
    grep 'Received SIGINT, shutting down' /tmp/calc-srv.log   # present
    ```
  - **Expectations for the §3.10 curls:**
    - Every output with an explicit expected line matches it character for character, key order included.
    - The `/operations` output equals the §3.3.2 JSON minified: no whitespace, with `−` as raw UTF-8.
    - The 405 response has the header `Allow: POST` and exactly the body `{"error":{"code":"METHOD_NOT_ALLOWED","message":"Method GET not allowed on /api/v1/calculate."}}`.
    - The 404 response has the header `Cache-Control: no-store` and exactly the body `{"error":{"code":"NOT_FOUND","message":"Route GET /api/v1/nope not found."}}`.
    - The `VALIDATION_ERROR` example matches except for the zod `message` text.
  - Static mode:
    ```bash
    D=$(mktemp -d) && echo '<!doctype html><title>spa</title>' > "$D/index.html"
    STATIC_DIR="$D" PORT=3000 node backend/dist/server.js > /tmp/calc-static.log 2>&1 &
    PID=$!
    for i in $(seq 1 20); do curl -fs localhost:3000/api/v1/health >/dev/null && break; sleep 0.5; done
    curl -s -o /dev/null -w '%{http_code} %{content_type}\n' localhost:3000/             # 200 text/html; charset=UTF-8
    curl -s localhost:3000/some/route                                                     # the same HTML
    curl -s -w '\nHTTP %{http_code}\n' localhost:3000/api/v1/nope                         # NOT_FOUND JSON, HTTP 404
    kill -INT $PID; wait $PID; echo "exit=$?"                                             # exit=0
    ```
  - Failure cases (each exits immediately):
    ```bash
    STATIC_DIR=/nonexistent node backend/dist/server.js; echo "exit=$?"   # error mentions "does not contain index.html"; exit≠0
    PORT=abc node backend/dist/server.js; echo "exit=$?"                  # error mentions "Invalid PORT"; exit≠0
    ```
  - Watch mode:
    ```bash
    npm run dev -w backend > /tmp/calc-dev.log 2>&1 &
    PID=$!
    sleep 3; touch backend/src/config.ts; sleep 3
    grep -c 'Calculator API listening' /tmp/calc-dev.log      # 2 or more (restarted on save)
    kill -INT $PID; wait $PID
    lsof -i :3000                                             # prints nothing (exit status 1 is expected)
    ```
    If anything is still listening on `:3000`, run `lsof -ti :3000 | xargs kill` and check again.
- [ ] **B10.** Run `npm run format -w backend`. Then each of these exits 0:
  - `npm run format:check -w backend`
  - `npm run lint -w backend`
  - `npm run typecheck -w backend`
  - `npm run test -w backend`
  - `npm run build -w backend`
  - `npm run check:contract`

**Commits:**

- `feat(backend): add express app with validation and error handling`
- `test(backend): add API contract tests`
- `feat(backend): serve built frontend when STATIC_DIR is set`

### M4. Frontend scaffold and API layer (20 min)

Commits in M4 and M5 must pass frontend typecheck, lint and `npx -w frontend vitest run`. The frontend coverage gate starts in M6 (§0d.4).

- [ ] **F-T1.** Create the package (run both §5.2 install commands), both tsconfigs (with the exact `tsconfig.node.json` from §5.2), the ESLint config, `vite.config.ts`, `index.html`, `main.tsx`, a placeholder `App.tsx`, `index.css`, `vite-env.d.ts` and `test/setup.ts`.
  - `npm install` exits 0.
  - `npm run typecheck -w frontend` and `npm run lint -w frontend` exit 0.
  - The dev server serves the page:
    ```bash
    npm run dev -w frontend > /tmp/calc-vite.log 2>&1 &
    PID=$!
    for i in $(seq 1 30); do curl -fs localhost:5173/ >/dev/null && break; sleep 0.5; done
    curl -s -o /dev/null -w '%{http_code}\n' localhost:5173/   # 200
    kill -INT $PID; wait $PID
    lsof -i :5173                                              # prints nothing
    ```
- [ ] **F-T2.** `npm run check:contract` exits 0.
- [ ] **F-T3.** Add `client.ts`, `errorMessages.ts` and the tests FC1–FC11 and FE1–FE6. `npx -w frontend vitest run src/api` passes.

**Commit:** `feat(frontend): scaffold vite react app and API client`

### M5. Frontend state machine (25 min)

- [ ] **F-T4.** Add `types.ts`, `keys.ts`, `reducer.ts` and `selectors.ts` (§5.4.1–§5.4.4), with tests R1–R45 and S1–S5.
  - All tests pass.
  - `grep -rn "from 'react'" frontend/src/calculator/reducer.ts frontend/src/calculator/selectors.ts` prints nothing.
  - `reducer.ts` and `selectors.ts` do not import `../api/client`.
- [ ] **F-T5.** Add `useCalculator.ts` (§5.4.5). `npm run typecheck -w frontend` and `npm run lint -w frontend` exit 0. UI1–UI21 in M6 test it.

**Commit:** `feat(frontend): add calculator state machine and chaining logic`

### M6. Frontend UI, styles and quality gates (35 min)

From this milestone on, every frontend commit must pass `npm run test -w frontend`, including the 80% gate.

- [ ] **F-T6.** Implement §5.5 with tests K1–K6, DS1–DS4, AP1 and UI1–UI21. All pass.
- [ ] **F-T7.** Quality gates:
  - `npm run test -w frontend` exits 0, with at least 80% on all metrics.
  - `frontend/coverage/lcov.info` and `frontend/coverage/index.html` exist.
  - The gate proof `npm run test -w frontend -- --coverage.thresholds.lines=101; echo "exit=$?"` prints `exit=1`.
  - `npm run lint -w frontend` (zero warnings) and `npm run typecheck -w frontend` exit 0.
  - `npm run build -w frontend` exits 0 and creates `frontend/dist/index.html` plus hashed files in `frontend/dist/assets/`.
  - No inline scripts in the built HTML:
    ```bash
    grep -Ec '<script([[:space:]][^>]*)?>[^<]+' frontend/dist/index.html || true   # 0 (no inline script bodies)
    grep -c '<script' frontend/dist/index.html                                     # 1 (the module script with src=)
    ```

**Commits:**

- `feat(frontend): add keypad, display and responsive styles`
- `test(frontend): add client, state and component tests`

### M7. End-to-end smoke test in dev (10 min)

- [ ] Start both packages in the background:
  ```bash
  npm run dev > /tmp/calc-devall.log 2>&1 &
  DEVPID=$!
  for i in $(seq 1 40); do curl -fs localhost:5173/api/v1/health >/dev/null && break; sleep 0.5; done
  grep -E '^\[backend\]' /tmp/calc-devall.log | head -n 1    # output is prefixed [backend] ...
  grep -E '^\[frontend\]' /tmp/calc-devall.log | head -n 1   # ... and [frontend]
  curl -s localhost:5173/api/v1/health                       # {"status":"ok"}
  ```
- [ ] Browser checks at `http://localhost:5173`. If you have no browser, mark them "not verified: no browser":
  - `2 + 3 × 4 =` shows `20`.
  - `0.1 + 0.2 =` shows `0.3`.
  - `1 ÷ 0 =` shows `Cannot divide by zero`, and then `7` starts a new number.
  - `0 − 4 = √` shows `Invalid input`.
  - `1 0 ^ 4 0 0 =` shows `Math error`.
  - `9 √` shows `3`.
  - `5 0 %` shows `0.5`.
  - With only the backend stopped (for example `kill` the `tsx` process found with `lsof -ti :3000`), `1 + 1 =` shows `Error`. The Vite proxy returns a non-JSON 500, which is `UNEXPECTED_RESPONSE`. `Network error` appears only when `fetch` itself rejects or times out, which FC5, FC6 and UI13 cover.
- [ ] **Responsive check (required by the brief).** At 320×568 and 375×667:
  - every key is visible and tappable;
  - the page does not scroll horizontally;
  - `9 9 9 9 9 9 9 9 ^ 9 =` fits the display.

  If no browser is available, mark this "not verified: no browser".
- [ ] **(stretch)** At 768×1024 and in landscape at 667×375, the same checks pass, Tab shows a focus ring, and Enter or Space activates the focused key.
- [ ] Stop the dev servers and confirm the ports are free before M8:
  ```bash
  kill -INT $DEVPID; wait $DEVPID
  lsof -i :3000 -i :5173                                     # prints nothing (exit status 1 is expected)
  curl -s -o /dev/null -w '%{http_code}\n' --max-time 2 localhost:3000/api/v1/health   # 000
  ```
  If something is still listening, run `lsof -ti :3000 -ti :5173 | xargs kill` and check again.
- [ ] `npm run test:coverage` ends with a Markdown table that has one row for backend and one for frontend, with every value at least 80.
- [ ] `npm run lint` and `npm run typecheck` exit 0 at the root.

**Commit:** none needed, unless you fixed something. In that case, use `fix(...)`.

### M8. Single-image Dockerfile (15 min)

- [ ] Create the `Dockerfile` (§6.1) and `.dockerignore` (§6.2).
- [ ] Check that nothing is listening on `:3000` (`lsof -i :3000` prints nothing).

**Acceptance:**

```bash
docker build -t calculator .                      # succeeds
docker build --target api -t calculator-api .     # succeeds
docker run --rm -w /app/backend calculator-api node -e \
  "import('express').then(()=>import('zod')).then(()=>import('helmet')).then(()=>import('morgan')).then(()=>console.log('deps ok'))"
                                                  # deps ok
docker run -d --rm --name calculator -p 3000:3000 calculator
for i in $(seq 1 45); do [ "$(docker inspect -f '{{.State.Health.Status}}' calculator)" = healthy ] && break; sleep 1; done
docker inspect -f '{{.State.Health.Status}}' calculator   # healthy
docker exec calculator whoami                     # node
curl -s localhost:3000/api/v1/health              # {"status":"ok"}
curl -s -X POST localhost:3000/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"add","operands":[0.1,0.2]}'   # {"operation":"add","operands":[0.1,0.2],"result":0.3}
curl -s localhost:3000/ | grep -c '<div id="root">'            # 1
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' localhost:3000/some/client/route
                                                  # 200 text/html; charset=utf-8 (or charset=UTF-8)
curl -s -i localhost:3000/api/v1/nope | head -n 1 # HTTP/1.1 404 Not Found  (JSON body, not index.html)
docker stop calculator                            # exits within ~1s (graceful SIGTERM)
lsof -i :3000                                     # prints nothing
```

**(stretch)** `docker image ls calculator --format '{{.Size}}'` reports less than 250 MB.

**(stretch)** In a browser at `http://localhost:3000`, `9 √` shows `3`, and the console shows no CSP violations.

**Commit:** `build(docker): add multi-stage single-image Dockerfile`

### M9. docker-compose with nginx (10 min)

- [ ] Make sure the M8 container is stopped and nothing is listening on `:3000` or `:8080` (`docker ps --filter name=calculator` lists nothing, and `lsof -i :3000 -i :8080` prints nothing).
- [ ] Create `frontend/Dockerfile`, `frontend/nginx.conf` and `docker-compose.yml` (§6.3).

**Acceptance:**

```bash
docker compose up -d --build --wait               # both services healthy
docker compose ps                                 # backend + frontend "running (healthy)"; only 0.0.0.0:8080->80 published
curl -s localhost:8080/api/v1/health              # {"status":"ok"}
curl -s -X POST localhost:8080/api/v1/calculate -H 'Content-Type: application/json' \
  -d '{"operation":"divide","operands":[10,4]}'   # {"operation":"divide","operands":[10,4],"result":2.5}
curl -s -i localhost:8080/api/v1/nope | grep -i -E '^(HTTP|content-type|cache-control)'
                                                  # 404, application/json; charset=utf-8, no-store (from Express)
curl -s -o /dev/null -w '%{http_code}\n' localhost:8080/api                 # 404 (JSON from Express, no 301)
curl -s -o /dev/null -w '%{http_code}\n' localhost:8080/some/client/route   # 200
curl -s -o /dev/null -w '%{http_code}\n' --max-time 2 localhost:3000/api/v1/health   # 000 (backend not exposed)
docker compose down
```

**(stretch)** In a browser at `http://localhost:8080`, `2 + 3 × 4 =` shows `20` and `5 ÷ 0 =` shows `Cannot divide by zero`.

**Commit:** `build(docker): add docker-compose with nginx frontend`

### M10. GitHub Actions CI (10 min)

- [ ] Create `.github/workflows/ci.yml` with the required jobs from §6.4 (`repo-checks` and `package`), and validate the YAML locally.
- [ ] This passes locally:
  ```bash
  npm ci && npm run check:contract && npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build
  ```

**Commit:** `ci: add GitHub Actions workflow with lint, typecheck and coverage`

### M11. README, coverage report and PROMPTS.md (20 min)

- [ ] Generate `docs/coverage.md` as described in §7.2.
- [ ] Write `README.md` following §8.1, pasting real outputs and the real coverage table.
- [ ] Write `PROMPTS.md` following §8.2, with this prompt inserted verbatim (preferably with `cat`) and the Outcome filled in.
- [ ] Run `npm run format`.

**Commit:** `docs: add README, coverage report and PROMPTS.md`

### M12. Final verification and delivery (10 min)

- [ ] Verify from a clean clone, which catches any file missing from git:
  ```bash
  rm -rf /tmp/calc-verify && git clone . /tmp/calc-verify && cd /tmp/calc-verify
  nvm use || true
  npm ci
  npm run verify          # check:contract, format:check, lint, typecheck, test:coverage, build: all exit 0
  ```
  Then, if Docker is available, rerun the M8 and M9 acceptance blocks from that clone.
- [ ] `git ls-files | grep -E 'node_modules|dist/|coverage/|\.env'` prints nothing, and `git status` is clean.
- [ ] **Publishing**, only if the person running you explicitly asked for it, and only if `gh auth status` succeeds:
  1. Run `gh repo create calculator --public --source . --remote origin --push`.
  2. Replace the README badge comment with the real badge, commit with `docs: add CI badge`, and push.
  3. Run `gh run watch` and confirm that every job is green: `repo-checks` (Contract & formatting), both legs of the `package` matrix (backend and frontend), and `docker` if you added it in M13.

  If you were not asked to publish, **do not push**. Put the exact commands in your report instead.

### M13. (stretch) Extras

Do these only if time remains after M12.

- [ ] Add the `docker` CI job from §6.4. Run its smoke-test commands locally first. Commit with `ci: add docker build and smoke test job`.
- [ ] Add dark-mode token overrides (§5.5).
- [ ] Confirm that the single image is under 250 MB.
- [ ] Add a README screenshot at `docs/screenshot.png`.
- [ ] Update the README CI section to match, and rerun `npm run verify`.

---

## 10. Definition of Done and final delivery checklist

- [ ] M0–M12 are complete, with every acceptance criterion met or explicitly reported as "not verified: <reason>".
- [ ] Every **MUST** row exists as a test and passes:
  - backend: contract rows 1–44, D1–D48, V1–V10, C1–C9;
  - frontend: R1–R45, FC1–FC11, UI1–UI21.
- [ ] Every **SHOULD** row (A1–A33, E1–E4, M1–M6, S1–S5, FE1–FE6, K1–K6, DS1–DS4, AP1) exists and passes, or is listed as skipped in the final report.
- [ ] `npm run verify` passes from a clean clone.
- [ ] Coverage is at least 80% on all four metrics in both packages, and the gate demonstrably fails below the threshold. The README table and `docs/coverage.md` are current.
- [ ] `npm run check:contract` passes, and fails on a one-byte change.
- [ ] The single image builds, becomes healthy, runs as `node`, and serves the UI and the API on `:3000`.
- [ ] Compose comes up healthy, serves the UI and the API on `:8080`, and does not publish the backend.
- [ ] The layout has no horizontal scroll at 320 px and every key is tappable, or this is reported as not verified.
- [ ] Every README command was run, and the pasted output matches. No section describes a feature that does not exist.
- [ ] The README covers setup, how to run the frontend and backend, the API examples, the design decisions (including Node.js instead of Go and the frontend validation mechanisms), the assumptions, coverage and Docker.
- [ ] `PROMPTS.md` exists. It contains this prompt verbatim and an honest Outcome, with `Rafael Teodosio` only where the content is unknowable.
- [ ] No excluded feature was added (§0d.6).
- [ ] No secrets, `.env`, `node_modules`, `dist` or `coverage` are in git.
- [ ] The git history is a clean series of Conventional Commits on `main`, and the final `git status` is clean.
- [ ] The CI YAML is valid, and every step passes locally.

---

## 11. Risks, assumptions and explicit non-goals

### 11.1 Risks and mitigations

| Risk | Mitigation |
|---|---|
| Peer-dependency conflicts (Vitest 3 vs Vite 7, React 19 vs RTL) | Keep the specified majors. Fall back to `vite@^6` and `@vitejs/plugin-react@^4`. Install `@testing-library/dom` explicitly. Report any change. |
| `vitest` and `@vitest/coverage-v8` version mismatch | Install both at the same version in each package. |
| Mock state leaking between tests (Vitest 3 `restoreMocks` no longer clears `vi.fn()`) | `mockReset: true` in both configs, plus the explicit `beforeEach` reset in `Calculator.test.tsx`. |
| zod message text changes between versions | Tests assert only `code`, status and `details[].path`. |
| Express 5 routing differences (wildcards, HEAD, OPTIONS) | Use a plain `app.use` SPA fallback and `.all(methodNotAllowed)` on each route. Tests A20, A22 and A26–A29 cover these. |
| `npm ci --omit=dev --workspace=backend` fails in Docker | Use the documented fallback `npm ci --omit=dev` and report it. |
| A backend dependency nested under `backend/node_modules` is missing at runtime | The `api` stage copies both `node_modules` directories, and M8 runs the `deps ok` check. |
| Docker, a browser or GitHub is unavailable in your environment | Write all files anyway, validate them statically (`docker compose config`, a YAML parse), and report the affected checks as "not verified: <reason>". Never fake output. |
| A leftover dev server blocks ports for Docker | Use the background-process pattern from §0d.3, and check the ports at the end of M7 and the start of M8 and M9. |
| nginx caches the backend's DNS at start-up | `depends_on: service_healthy`, with the limitation documented. |
| CRLF line endings break the contract byte check | `.gitattributes` with `eol=lf`. |
| Precision loss for integers above 15 significant digits | An accepted trade-off, documented and tested (D8, A17). |

### 11.2 Assumptions already decided

These go into the README.

- The UI is single-user, stateless, English only, and driven by mouse and touch.
- There is no repeat-equals, and `5 × =` gives `25`.
- Negative numbers are entered as results.
- Percent is unary `x/100`.
- Input is limited to 15 digits.
- The display shows `String(result)` and never re-rounds.
- `0^0 = 1`.
- `0/0` is `DIVISION_BY_ZERO`.
- `(-8)^(1/3)` is `NON_FINITE_RESULT`.
- With the backend down behind a running proxy, the UI shows `Error`, not `Network error`.
- Only modern evergreen browsers are supported.

### 11.3 Explicit non-goals (do not build)

- An OpenAPI spec or a generated client.
- Keyboard input or `keydown` listeners.
- Calculation history or persistence.
- `+/-`, backspace and memory keys; operator precedence.
- CORS; a configurable API base URL.
- Auth, rate limiting, compression, request IDs, pino or winston, dotenv.
- A shared workspace package; Redux or Zustand; CSS or UI frameworks; i18n.
- E2E browser tests; deployment or publishing in CI; third-party coverage services.

---

## 12. Final report

When you finish, reply with a report that has **exactly** these sections, in this order:

1. **Repository.**
   - The absolute local path.
   - If you pushed: the GitHub URL and the CI run URL, with the job statuses.
2. **Milestones.** One line per milestone M0–M12 (and M13 if attempted) and per Definition of Done item (§10), marked pass, fail or "not verified: <reason>". Give the reason for anything that did not pass.
3. **Commands run and results.** The exit status and key output of each of these:
   - `npm run verify` (from the clean clone);
   - `npm run check:contract`, including the negative test;
   - the coverage-gate proofs for both packages;
   - the backend server smoke tests (M3 / B9);
   - the M8 and M9 acceptance blocks;
   - the M7 browser and responsive checks, or "not verified".
4. **Tests and coverage.**
   - The number of tests per test file and the total per package, all passing.
   - Every SHOULD row you skipped, or "none".
   - The table printed by `npm run test:coverage` (statements, branches, functions and lines per package).
   - Any frontend file below 90%.
   - The report paths: `docs/coverage.md`, `backend/coverage/index.html` and `frontend/coverage/index.html`.
5. **Docker.**
   - The single-image size.
   - The output of `docker compose ps` once it is healthy.
6. **Installed versions** of `express`, `zod`, `helmet`, `typescript`, `vitest`, `@vitest/coverage-v8`, `react`, `vite`, `@vitejs/plugin-react` and `@testing-library/react`, plus the Node and npm versions.
7. **File trees.** The final `backend/` and `frontend/` trees, excluding `node_modules`, `dist` and `coverage`.
8. **Deviations and conflicts.**
   - Every deviation from this prompt and the reason for it. Examples: a version fallback, the Docker `npm ci` fallback, a changed action version, a different script command.
   - Every conflict you found between sections, and how you resolved it.
   - Write "none" if there were none.
9. **Assumptions** you added under rule 0d.7, as recorded in the README.
10. **Known limitations.**
11. **Open items for the human.**
    - The `Rafael Teodosio` placeholders in `PROMPTS.md`, including the prompt itself if you could not insert it verbatim.
    - Adding the CI badge after pushing, if you did not push.
    - If you did not push:
      - `gh repo create calculator --public --source . --remote origin --push`, or `git remote add origin <url> && git push -u origin main`;
      - replacing the README badge comment with the real badge;
      - sharing the repository URL with the reviewers.
    - The README screenshot, if you skipped it.
    - Every check marked "not verified".

*End of implementation prompt.*


