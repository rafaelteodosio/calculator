# Calculator

<!-- CI badge: add ![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg) after pushing -->

A React + TypeScript keypad calculator backed by an Express + TypeScript REST microservice.
The backend performs every arithmetic operation; the frontend manages input and displays results.

## Features

- Seven operations: add, subtract, multiply, divide, power, square root and percent.
- Left-to-right chaining: `2 + 3 × 4 = 20`.
- Validated input, short error messages and a responsive keypad with accessible native buttons.
- JSON REST API with stable error codes and strict validation.
- An enforced 80% coverage threshold for both workspaces.
- Single-container and nginx/Compose deployment modes.

## Quick start

From this repository directory:

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Or use one container:

```bash
docker build -t calculator .
docker run --rm -p 3000:3000 calculator
```

Open <http://localhost:3000>.

## Prerequisites

Node 24 LTS (minimum 22.12) and npm 10 or later. `.nvmrc` selects Node 24 when using `nvm use`.
Docker Engine 24 or later with Compose v2 is required only for container deployment.
Development was verified with Node 24.22.1, npm 11.19.1 and Docker Engine 29.9.2 on Windows.

## Setup

This repository has not been published. After downloading or cloning it, open the `calculator` directory.
One root install covers both npm workspaces; the root lockfile makes clean installs reproducible.

```bash
npm ci
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.
After publication, clone the repository URL shared by the author. A remote URL and CI badge are intentionally pending.

## Running in development

```bash
npm run dev
```

Concurrently prefixes output with `[backend]` and `[frontend]`. Express listens on port 3000 using
`tsx watch`; Vite serves port 5173 with HMR and proxies `/api` to `http://127.0.0.1:3000`.
To run the services separately in two terminals:

```bash
npm run dev -w backend
npm run dev -w frontend
```

| Variable     | Default       | Meaning                                                           |
| ------------ | ------------- | ----------------------------------------------------------------- |
| `PORT`       | `3000`        | Backend port, an integer from 1 to 65535                          |
| `NODE_ENV`   | `development` | `development`, `production` or `test`; selects request log format |
| `STATIC_DIR` | unset         | Directory containing the built SPA; resolved to an absolute path  |

These are the only application environment variables. The frontend uses a relative API URL.

## Production build without Docker

```bash
npm run build
```

Bash:

```bash
NODE_ENV=production STATIC_DIR="$PWD/frontend/dist" node backend/dist/server.js
```

PowerShell:

```powershell
$env:NODE_ENV = 'production'
$env:STATIC_DIR = (Resolve-Path frontend/dist).Path
node backend/dist/server.js
```

Open <http://localhost:3000>. For API-only mode, unset `STATIC_DIR` and run:

```bash
npm start -w backend
```

## Testing and coverage

```bash
npm test
npm run test -w backend
npm run test -w frontend
npm run test:watch -w backend
npm run test:watch -w frontend
npm run test:coverage
npm run lint
npm run typecheck
npm run format
npm run verify
```

Backend: **154 tests** covering domain arithmetic, config, validation, errors, middleware and all 44
HTTP contract rows plus A1–A33. Frontend: **102 tests** covering the API client, error mapping,
all R1–R45 reducer cases, selectors, components and UI1–UI21 integration cases. No SHOULD rows were skipped.
Component tests mock the client module; only client tests stub `fetch`. Additional integration tests
exercise same-tick input, duplicate presses and late failures after a newer result.

`npm test` enforces at least 80% for statements, branches, functions and lines. Both gates were proved
to fail with exit 1 when the line threshold was temporarily overridden to 101%.
The gate fails `npm run verify` and CI before the build step. `npm run build` and Docker builds
only compile, so they do not independently enforce coverage.

The committed [coverage report](docs/coverage.md) includes the real per-file output.
Generated HTML reports are `backend/coverage/index.html` and `frontend/coverage/index.html`, alongside
`lcov.info` and `coverage-summary.json`; these are ignored by Git and uploaded as CI artifacts.
Coverage excludes process bootstrap (`server.ts`, `main.tsx`), types-only files, tests and test setup.
No frontend file has any metric below 90%.

| Package  | Statements | Branches | Functions | Lines  |
| -------- | ---------- | -------- | --------- | ------ |
| backend  | 100%       | 99.04%   | 100%      | 100%   |
| frontend | 99.43%     | 99.31%   | 100%      | 99.43% |

_Generated on 2026-10-23 at commit e3cbe48._

## Docker

### Single container

```bash
docker build -t calculator .
docker build --target api -t calculator-api .
docker run --rm -p 3000:3000 calculator
```

The stages are `deps`, `build-backend`, `build-frontend`, `prod-deps`, `api` and `app`.
Manifest-first copying caches dependency installs. The runtime includes compiled assets and production
dependencies; both root and backend `node_modules` are copied to support nested workspace dependencies.
`backend/package.json` preserves ESM loading. Files remain root-owned while the process runs as `node`.
The healthcheck probes IPv4 `127.0.0.1`; exec-form CMD delivers signals directly to Node.
`STATIC_DIR` is set only in the final `app` stage. The API-only target is reused by Compose.
The production install worked without a fallback. The measured single image was **259 MB**;
the optional under-250-MB target was not met. Health, routes, non-root execution and graceful SIGTERM
were verified. SIGINT was separately verified in the Linux API container (exit 0).

### Compose

```bash
docker compose config --quiet
docker compose up --build
docker compose down
```

Open <http://localhost:8080> while the stack is running.

```text
browser → nginx :8080 → static SPA
                     → /api, /api/* → backend:3000
```

Only nginx is published to the host; the backend stays on the internal network. Both services have
healthchecks. `depends_on: service_healthy` waits for the backend before nginx starts.
nginx resolves the backend once at startup: restart the frontend if a recreated backend gets a new IP.
The single container is easiest for local use or a PaaS; Compose demonstrates separate web and API services.
Both modes were built and smoke-tested, then stopped and removed.

## API reference

Base path: `/api/v1`. All API responses are JSON with `Cache-Control: no-store`.

| Method and path   | Request                         | Response                                                         |
| ----------------- | ------------------------------- | ---------------------------------------------------------------- |
| `GET /health`     | none                            | `{"status":"ok"}`                                                |
| `GET /operations` | none                            | `{operations: [{name,symbol,arity,description}]}` in table order |
| `POST /calculate` | `{operation,operands:number[]}` | `{operation,operands,result:number}`                             |

GET routes support HEAD. Other methods, including OPTIONS, return 405 with `Allow`.
Unknown `/api` routes return JSON 404 even when static serving is enabled.
POST requires `Content-Type: application/json`; UTF-8 parameters are accepted. Bodies exceeding **10 kB**
return 413. The validation order is media type, JSON parser, strict shape, operation lookup, arity and computation.
Inputs must be finite JSON numbers, with no coercion or unknown keys. `1e309` is rejected.

| name       | symbol       | arity | semantics (`a` = operands[0], `b` = operands[1]) | edge cases                                                                                                                                                                                                            |
| ---------- | ------------ | ----- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add`      | `+`          | 2     | `a + b`                                          | Overflow (`1e308 + 1e308`) gives `NON_FINITE_RESULT`.                                                                                                                                                                 |
| `subtract` | `−` (U+2212) | 2     | `a - b`                                          | Overflow (`-1e308 - 1e308`) gives `NON_FINITE_RESULT`. `0.3 - 0.1` gives `0.2` after rounding.                                                                                                                        |
| `multiply` | `×`          | 2     | `a * b`                                          | Overflow gives `NON_FINITE_RESULT`. Underflow (`1e-200 * 1e-200`) gives `0`, which is fine. `-1 * 0` gives `-0`, which is normalised to `0`.                                                                          |
| `divide`   | `÷`          | 2     | `a / b`                                          | When `b === 0` (including `-0`), throw `DIVISION_BY_ZERO` **before** dividing. `0 / 0` is also `DIVISION_BY_ZERO`. Overflow (`1e308 / 1e-10`) gives `NON_FINITE_RESULT`.                                              |
| `power`    | `^`          | 2     | `a ** b`                                         | `0 ** 0` gives `1` (the JS convention, which is accepted). `0 ** -1` is Infinity, so `NON_FINITE_RESULT`. `10 ** 400` gives `NON_FINITE_RESULT`. `(-8) ** 0.5` is NaN, so `NON_FINITE_RESULT`. `2 ** -1` gives `0.5`. |
| `sqrt`     | `√`          | 1     | `Math.sqrt(a)`                                   | When `a < 0`, throw `NEGATIVE_SQRT` before computing. `sqrt(-0)` gives `-0`, which is normalised to `0`. `sqrt(2)` gives `1.4142135623731`.                                                                           |
| `percent`  | `%`          | 1     | `a / 100`                                        | Unary, as on a phone calculator: `50` gives `0.5` and `-50` gives `-0.5`. Never fails on finite input.                                                                                                                |

Errors have `{"error":{"code":"…","message":"…"}}`. Only `VALIDATION_ERROR` includes
`details: [{path,message}]`. Clients branch on `code`, never the message; zod message text is not stable.

| code                     | HTTP | trigger                                                                                                                       | `message` (exact)                                                                                                   |
| ------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `MALFORMED_JSON`         | 400  | The body is not valid JSON or is a top-level primitive, or the request was aborted or its size did not match `Content-Length` | `Request body is not valid JSON.`                                                                                   |
| `VALIDATION_ERROR`       | 400  | The zod shape check failed                                                                                                    | `Request body failed validation.`                                                                                   |
| `UNSUPPORTED_OPERATION`  | 400  | `operation` is not one of the 7 names                                                                                         | `` `Unsupported operation '${op}'. Supported operations: add, subtract, multiply, divide, power, sqrt, percent.` `` |
| `INVALID_OPERAND_COUNT`  | 400  | `operands.length` ≠ arity                                                                                                     | `` `Operation '${op}' expects ${arity} operand${arity === 1 ? '' : 's'} but received ${n}.` ``                      |
| `UNSUPPORTED_MEDIA_TYPE` | 415  | A POST to `/calculate` without a JSON content type, or with an unsupported charset or content encoding                        | `Content-Type must be application/json.`                                                                            |
| `PAYLOAD_TOO_LARGE`      | 413  | The body is larger than 10 kB                                                                                                 | `Request body exceeds the 10kb limit.`                                                                              |
| `DIVISION_BY_ZERO`       | 422  | `divide` with `b === 0`                                                                                                       | `Division by zero is not allowed.`                                                                                  |
| `NEGATIVE_SQRT`          | 422  | `sqrt` with `a < 0`                                                                                                           | `Cannot take the square root of a negative number.`                                                                 |
| `NON_FINITE_RESULT`      | 422  | The result is ±Infinity or NaN                                                                                                | `The result is not a finite real number.`                                                                           |
| `NOT_FOUND`              | 404  | An unknown path under `/api` (including `/api` itself)                                                                        | `` `Route ${method} ${path} not found.` ``                                                                          |
| `METHOD_NOT_ALLOWED`     | 405  | A known path with the wrong method (also sets `Allow`)                                                                        | `` `Method ${method} not allowed on ${path}.` ``                                                                    |
| `INTERNAL_ERROR`         | 500  | Any unexpected error                                                                                                          | `An unexpected error occurred.`                                                                                     |

### Curl examples and recorded output

These outputs were captured from real curl runs against the built backend on 2026-10-23.
Examples use Bash quoting; in PowerShell use `curl.exe` and shell-appropriate quoting.
For Compose, replace port 3000 with 8080. Headers and timestamps below are from those actual requests.

### Health

```bash
curl -s http://localhost:3000/api/v1/health
```

```text
{"status":"ok"}
```

### Supported operations

```bash
curl -s http://localhost:3000/api/v1/operations
```

```text
{"operations":[{"name":"add","symbol":"+","arity":2,"description":"Sum of a and b"},{"name":"subtract","symbol":"−","arity":2,"description":"a minus b"},{"name":"multiply","symbol":"×","arity":2,"description":"Product of a and b"},{"name":"divide","symbol":"÷","arity":2,"description":"a divided by b; b must not be 0"},{"name":"power","symbol":"^","arity":2,"description":"a raised to the power b"},{"name":"sqrt","symbol":"√","arity":1,"description":"Square root of a; a must be >= 0"},{"name":"percent","symbol":"%","arity":1,"description":"a divided by 100"}]}
```

### Addition

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"add","operands":[0.1,0.2]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"operation":"add","operands":[0.1,0.2],"result":0.3}
HTTP 200
```

### Subtraction

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"subtract","operands":[10,4]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"operation":"subtract","operands":[10,4],"result":6}
HTTP 200
```

### Multiplication

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"multiply","operands":[6,7]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"operation":"multiply","operands":[6,7],"result":42}
HTTP 200
```

### Division

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"divide","operands":[10,4]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"operation":"divide","operands":[10,4],"result":2.5}
HTTP 200
```

### Exponentiation

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"power","operands":[2,10]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"operation":"power","operands":[2,10],"result":1024}
HTTP 200
```

### Square root

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"sqrt","operands":[16]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"operation":"sqrt","operands":[16],"result":4}
HTTP 200
```

### Percent

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"percent","operands":[50]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"operation":"percent","operands":[50],"result":0.5}
HTTP 200
```

### Division by zero

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"divide","operands":[1,0]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"DIVISION_BY_ZERO","message":"Division by zero is not allowed."}}
HTTP 422
```

### Negative square root

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"sqrt","operands":[-4]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"NEGATIVE_SQRT","message":"Cannot take the square root of a negative number."}}
HTTP 422
```

### Non-finite result

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"power","operands":[10,400]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"NON_FINITE_RESULT","message":"The result is not a finite real number."}}
HTTP 422
```

### Unsupported operation

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"modulo","operands":[1,2]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"UNSUPPORTED_OPERATION","message":"Unsupported operation 'modulo'. Supported operations: add, subtract, multiply, divide, power, sqrt, percent."}}
HTTP 400
```

### Wrong operand count

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"sqrt","operands":[1,2]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"INVALID_OPERAND_COUNT","message":"Operation 'sqrt' expects 1 operand but received 2."}}
HTTP 400
```

### Invalid operand

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":"add","operands":["2",3]}' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"VALIDATION_ERROR","message":"Request body failed validation.","details":[{"path":"operands.0","message":"Invalid input: expected number, received string"}]}}
HTTP 400
```

### Malformed JSON

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"operation":' -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"MALFORMED_JSON","message":"Request body is not valid JSON."}}
HTTP 400
```

### Unsupported media type

```bash
curl -s -X POST -H 'Content-Type: text/plain' -d hello -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"UNSUPPORTED_MEDIA_TYPE","message":"Content-Type must be application/json."}}
HTTP 415
```

### Wrong method

```bash
curl -s -i http://localhost:3000/api/v1/calculate
```

```text
HTTP/1.1 405 Method Not Allowed
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline'
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Cache-Control: no-store
Allow: POST
Content-Type: application/json; charset=utf-8
Content-Length: 96
ETag: W/"60-eCP1WxRomc75Z3tMvzcX0neh6Dc"
Date: Fri, 23 Oct 2026 21:46:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"METHOD_NOT_ALLOWED","message":"Method GET not allowed on /api/v1/calculate."}}
```

### Unknown API route

```bash
curl -s -i http://localhost:3000/api/v1/nope
```

```text
HTTP/1.1 404 Not Found
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline'
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Cache-Control: no-store
Content-Type: application/json; charset=utf-8
Content-Length: 76
ETag: W/"4c-FJR2gD332zp/+tYA2hEdgmRsOSo"
Date: Fri, 23 Oct 2026 21:46:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"NOT_FOUND","message":"Route GET /api/v1/nope not found."}}
```

### Empty JSON body

```bash
curl -s -X POST -H 'Content-Type: application/json' -d  -w '\nHTTP %{http_code}\n' http://localhost:3000/api/v1/calculate
```

```text
{"error":{"code":"VALIDATION_ERROR","message":"Request body failed validation.","details":[{"path":"operation","message":"Invalid input: expected string, received undefined"},{"path":"operands","message":"Invalid input: expected array, received undefined"}]}}
HTTP 400
```

## Design decisions

### Backend language: Node.js instead of Go

The plan's reproduced brief prefers Go, while its original brief specifies Node. The confirmed D5
decision explicitly chooses Node.js + TypeScript. This provides one language, contract types and
toolchain across the stack, accepting a heavier runtime than a Go binary.

### Monorepo with npm workspaces

One install and lockfile cover both packages. Each workspace still has independent build, lint,
typecheck and test commands; the trade-off is a root install for the whole development toolchain.

### One calculation endpoint and one operation table

`POST /calculate` centralizes validation; `GET /operations` derives metadata from the same table.
This accepts an RPC-style API in exchange for preventing operation and discovery drift.

### Backend arithmetic and left-to-right chaining

Each binary step calls the backend, so `2 + 3 × 4 = 20`. Unary operations apply immediately to
the display value. Network latency is accepted to keep computation in one place.

### Number handling

Inputs are never rounded. Successful float64 results are rounded to 15 significant digits, removing
binary noise such as `0.1 + 0.2`. Large integers lose precision: `123456789012345678` becomes
`123456789012346000`. Non-finite results are rejected, negative zero is normalized, and near
`Number.MAX_VALUE` the finite original is retained if rounding would overflow.

### Operation semantics

Percent is unary `x/100`; `200 + 10 % = 200.1`. Negative square roots are rejected, `0/0`
is division by zero, and `0^0 = 1`. These predictable rules accept differences from some phone calculators.

### Status-code policy

400 indicates a malformed client request; 422 indicates valid input whose arithmetic is undefined.
404, 405, 413, 415 and 500 use the same envelope. The server logs internal exceptions and returns
only a generic 500 message, accepting less client-side diagnostic detail to avoid leaking internals.

### Strict zod validation

zod 4 validates the body before operation lookup, without coercion. Unknown fields and non-finite
numbers fail explicitly; this makes the contract less permissive and easier to test.

### Contract types duplicated, not shared

The two types-only files are byte-identical and checked by `npm run check:contract` in CI.
A third workspace would add build ordering, TypeScript references and Docker copying for only a
small type file. The accepted trade-off is copying edits to both files, with drift rejected by the check.

### Same-origin networking without CORS

Vite proxies during development, Express serves both layers in one container, and nginx fronts both
in Compose. No CORS is needed; OPTIONS returns 405. A separately hosted cross-origin frontend would require redesign.

### Security headers

Helmet supplies API headers; nginx sets corresponding static-response headers without duplicating API headers.
`upgrade-insecure-requests` is disabled to allow local HTTP, accepting that HTTPS enforcement belongs to hosting.

### Express app factory and module layering

`createApp()` never listens; `server.ts` owns listening and graceful signals. Pure domain code feeds
validation/controllers, middleware, router and app assembly. This makes HTTP testing possible without opening a listening server explicitly.

### Frontend state and styling

Vite, React 19 and CSS Modules provide a small UI without a component library. A pure reducer owns
state; a hook reads the latest state through a ref before issuing API calls. The trade-off is an explicit
state machine that is more verbose than scattering state across components, but independently testable.

### Frontend input validation and error handling

Input permits 15 digits, one decimal point and no leading zeros. Operators can be replaced (`2 + ×`).
All keys except Clear are disabled during requests; a synchronous busy guard blocks duplicate presses.
The hook and reducer discard stale responses, while Clear resets immediately. The API client checks
response shape, and error codes map to short display strings. Domain checks remain on the backend.

### Testing strategy and coverage gate

Unit, contract and component tests cover normal paths, validation order, edge cases and races.
The 80% gate includes all real application logic. Visual browser checks remain a separate manual task;
high coverage is not a substitute for layout verification.

### Two deployment modes

The root Dockerfile's `api` target is reused in Compose. The final `app` stage adds the SPA for a single
container. Separate nginx hosting adds operational complexity but demonstrates a common production topology.

## Assumptions

- Single-user, stateless English UI with no authentication, persistence or history.
- Mouse and touch input; native button focus and activation remain, with no keyboard event listeners.
- Negative numbers are entered as results, such as `0 − 5 =`.
- No repeat-equals; `5 × =` gives `25`.
- Percent is unary `x/100`; inputs are limited to 15 digits.
- Display uses `String(result)` including exponent notation; no frontend re-rounding.
- Normal key presses cannot produce shape-validation errors.
- Backend down behind an operating proxy gives `Error` (non-JSON proxy 500); fetch rejection or timeout gives `Network error`.
- Only modern evergreen browsers are supported; no configurable API base URL is needed.
- The API client timeout covers response headers, not subsequent body parsing, following the plan's reference implementation.
- Windows verification uses PowerShell, `npm.cmd`, `curl.exe` and hidden subprocesses instead of Bash, `lsof` and Unix job control. POSIX signals were verified in Docker.
- The supplied 2–4 hour timebox prioritizes correctness and maintainability. No SHOULD tests were skipped.

## Project structure

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── calculate.ts
│   │   ├── health.ts
│   │   └── operations.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── methodNotAllowed.ts
│   │   ├── noStore.ts
│   │   ├── notFound.ts
│   │   ├── requestLogger.ts
│   │   ├── requireJson.ts
│   │   └── spa.ts
│   ├── routes/
│   │   └── api.ts
│   ├── app.ts
│   ├── calculator.ts
│   ├── config.ts
│   ├── contract.ts
│   ├── errors.ts
│   ├── server.ts
│   └── validation.ts
├── test/
│   ├── api.test.ts
│   ├── calculator.test.ts
│   ├── config.test.ts
│   ├── errors.test.ts
│   ├── middleware.test.ts
│   └── validation.test.ts
├── eslint.config.js
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── vitest.config.ts

frontend/
├── src/
│   ├── api/
│   │   ├── client.test.ts
│   │   ├── client.ts
│   │   ├── contract.ts
│   │   ├── errorMessages.test.ts
│   │   └── errorMessages.ts
│   ├── calculator/
│   │   ├── keys.ts
│   │   ├── reducer.test.ts
│   │   ├── reducer.ts
│   │   ├── selectors.test.ts
│   │   ├── selectors.ts
│   │   ├── types.ts
│   │   └── useCalculator.ts
│   ├── components/
│   │   ├── Calculator/
│   │   │   ├── Calculator.module.css
│   │   │   ├── Calculator.test.tsx
│   │   │   └── Calculator.tsx
│   │   ├── Display/
│   │   │   ├── Display.module.css
│   │   │   ├── Display.test.tsx
│   │   │   └── Display.tsx
│   │   ├── Key/
│   │   │   ├── Key.module.css
│   │   │   ├── Key.test.tsx
│   │   │   └── Key.tsx
│   │   └── Keypad/
│   │       ├── Keypad.module.css
│   │       ├── Keypad.test.tsx
│   │       └── Keypad.tsx
│   ├── test/
│   │   └── setup.ts
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── Dockerfile
├── eslint.config.js
├── index.html
├── nginx.conf
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Root `scripts/` holds contract and coverage checks. `.github/workflows/ci.yml` defines CI;
the root Dockerfile and Compose manifest define deployment. Documentation includes this README,
the prompt log and the committed coverage report. Tests sit in `backend/test` or beside frontend code.

## Continuous integration

`repo-checks` checks contract copies and formatting. The `package` matrix independently runs lint,
typecheck, tests with coverage and build for backend and frontend. Coverage summaries appear in job
summaries and HTML/lcov artifacts are retained for 14 days. Pushes to main, pull requests and
`workflow_dispatch` trigger the workflow. YAML and all local run commands were verified;
hosted CI has not run because publication was not requested. The optional Docker CI job was not added.

## Limitations and future improvements

Browser arithmetic and responsive checks at 320×568 and 375×667 are **not verified: no browser surface is
available in this session**. The CSS implements the required breakpoints, but needs visual review.
A screenshot and optional tablet/landscape checks are also pending. Image size is 259 MB.

`(-8) ** (1/3)` gives a non-finite result rather than -2; precision beyond 15 digits is limited.
The fixed Vitest 3 major has development-only audit findings (2 moderate, 2 critical in this lockfile);
the available fix requires changing the mandated major, so it was not applied. `npm audit --omit=dev`
reported zero vulnerabilities. Do not expose the test runner as a public service.

Future work could include keyboard input, history, OpenAPI and a generated client, arbitrary-precision
decimals, operator precedence, rate limiting, gzip, structured request logging, browser E2E tests,
an accessibility audit, nginx dynamic DNS and publishing images. These are intentionally outside this implementation.

## AI usage

OpenAI Codex implemented and verified this repository from the supplied plan. [PROMPTS.md](PROMPTS.md)
contains the full implementation prompt, known follow-up prompts, factual outcomes and placeholders
for the author's unavailable planning conversation and human review.
