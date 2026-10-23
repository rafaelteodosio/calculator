# Delivery report

## 1. Repository

`C:\Users\Administrador\Documents\sezzle_test\calculator` on branch `main`.
No remote was created and nothing was pushed, following PLAN.md §0d.11.

## 2. Milestones

| Milestone | Result                                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M0        | Pass — Node 24.22.1, npm 11.19.1, isolated Git repository and workspace scaffolding.                                                                         |
| M1        | Pass — identical types-only contracts and positive/negative byte-check proofs.                                                                               |
| M2        | Pass — pure domain, validation, config and error tests; strict typecheck/lint.                                                                               |
| M3        | Pass — all backend rows, coverage gate, build, HTTP/static/startup/watch smoke checks. POSIX signals verified in Docker.                                     |
| M4        | Pass — Vite HTTP 200, client tests FC1–FC11 and FE1–FE6.                                                                                                     |
| M5        | Pass — R1–R45, S1–S5 and asynchronous hook; logic modules do not import React/client.                                                                        |
| M6        | Pass — components and UI1–UI21, coverage, lint, typecheck, build and external-script-only HTML.                                                              |
| M7        | Pass for dev proxy, outage response, coverage/lint/typecheck and cleanup. Not verified: browser arithmetic and responsive checks; no browser available.      |
| M8        | Pass — both images build; runtime dependencies, health, non-root execution, routing and graceful shutdown verified.                                          |
| M9        | Pass — healthy Compose services, proxy routing, JSON errors, internal-only backend and teardown.                                                             |
| M10       | Pass locally — valid YAML, clean install and all CI run commands. Not verified: hosted Actions; no remote publication requested.                             |
| M11       | Pass — README with real curl output, committed coverage, versions and verbatim prompt record.                                                                |
| M12       | Pass — fresh local clone, lockfile install and verify exit 0; both Docker acceptance blocks repeated from the clone. Tracked files and clean status checked. |
| M13       | Not attempted as a milestone. Image size measured at 259 MB; optional under-250-MB target not met. No Docker CI job, dark-mode override or screenshot.       |

Definition of Done, in the original order:

| §10 item                                    | Result                                                                                                                                                   |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. M0–M12 complete or explicitly unverified | Pass. Browser and hosted CI limitations explicitly documented.                                                                                           |
| 2. Every MUST test row                      | Pass.                                                                                                                                                    |
| 3. Every SHOULD test row                    | Pass; none skipped.                                                                                                                                      |
| 4. Verify from a clean clone                | Pass; npm ci and npm run verify exited 0 in a fresh clone.                                                                                               |
| 5. Coverage and gate proofs                 | Pass; both packages exceed 80% on all metrics and exit 1 at a 101% line threshold.                                                                       |
| 6. Contract positive and negative proofs    | Pass.                                                                                                                                                    |
| 7. Single image                             | Pass.                                                                                                                                                    |
| 8. Compose                                  | Pass.                                                                                                                                                    |
| 9. Responsive layout                        | Not verified: no browser surface available.                                                                                                              |
| 10. README commands and outputs             | Pass for local executable workflows and recorded API outputs; Bash syntax adapted to Windows. Remote clone/publish instructions are pending publication. |
| 11. README required coverage                | Pass.                                                                                                                                                    |
| 12. PROMPTS content and honest outcome      | Pass; entire supplied implementation prompt preserved. Human-only context remains Rafael Teodosio.                                                       |
| 13. No excluded features                    | Pass.                                                                                                                                                    |
| 14. No generated outputs or secrets in Git  | Pass; no node_modules, dist, coverage directories or environment files are tracked.                                                                      |
| 15. Conventional Commits/main/clean status  | Pass; clean main with Conventional Commits.                                                                                                              |
| 16. CI YAML and local steps                 | Pass locally; hosted run not verified because no push was requested.                                                                                     |

## 3. Commands run and results

| Check                                   | Exit / key result                                                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`                        | 0 in both the working repository and fresh clone after npm ci. All checks and builds passed.                                |
| `npm run check:contract`                | 0; both copies identical.                                                                                                   |
| Contract with one changed byte          | 1; names both differing files. Original restored; exits 0 again.                                                            |
| Backend line threshold 101%             | 1; `Coverage for lines (100%) does not meet global threshold (101%)`.                                                       |
| Frontend line threshold 101%            | 1; `Coverage for lines (99.43%) does not meet global threshold (101%)`.                                                     |
| Backend build                           | 0; `backend/dist/server.js`, no emitted tests.                                                                              |
| API-only and static server smoke checks | 0; 23 HTTP responses captured, startup failures exit 1 as expected, watch restart verified, ports released.                 |
| README curl examples                    | 0; 20 actual curl runs matched the previous live HTTP responses.                                                            |
| `npm run dev` smoke                     | 0; prefixed output, health 200, add result 0.3, backend-down proxy response 500, ports released.                            |
| API SIGINT in Linux container           | 0; `Received SIGINT, shutting down`; container exit 0.                                                                      |
| M8 Docker build and acceptance          | 0; `deps ok`, `healthy`, `node`, UI 200, API 404 JSON, result 0.3. SIGTERM exit 0 in 277 ms.                                |
| M9 Compose acceptance                   | 0; both services healthy, result 2.5, `/api` returns JSON 404 without redirect, client route 200, host backend request 000. |
| CI and Compose YAML parse               | 0 using installed js-yaml; `docker compose config --quiet` also exits 0.                                                    |
| M7 browser arithmetic/mobile sizes      | Not verified: browser inventory empty and in-app browser unavailable.                                                       |

Native Windows process shutdown uses owned-process cleanup; POSIX SIGINT/SIGTERM behavior was checked in Linux containers.

## 4. Tests and coverage

| Package            | File                                            | Passing tests |
| ------------------ | ----------------------------------------------- | ------------: |
| Backend            | `test/api.test.ts`                              |            77 |
| Backend            | `test/calculator.test.ts`                       |            48 |
| Backend            | `test/config.test.ts`                           |             9 |
| Backend            | `test/errors.test.ts`                           |             4 |
| Backend            | `test/middleware.test.ts`                       |             6 |
| Backend            | `test/validation.test.ts`                       |            10 |
| **Backend total**  | **6 files**                                     |       **154** |
| Frontend           | `src/api/client.test.ts`                        |            11 |
| Frontend           | `src/api/errorMessages.test.ts`                 |             6 |
| Frontend           | `src/calculator/reducer.test.ts`                |            46 |
| Frontend           | `src/calculator/selectors.test.ts`              |             5 |
| Frontend           | `src/components/Calculator/Calculator.test.tsx` |            23 |
| Frontend           | `src/components/Display/Display.test.tsx`       |             4 |
| Frontend           | `src/components/Key/Key.test.tsx`               |             3 |
| Frontend           | `src/components/Keypad/Keypad.test.tsx`         |             3 |
| Frontend           | `src/App.test.tsx`                              |             1 |
| **Frontend total** | **9 files**                                     |       **102** |

Skipped SHOULD rows: **none**.

| Package  | Statements | Branches | Functions | Lines  |
| -------- | ---------- | -------- | --------- | ------ |
| backend  | 100%       | 99.04%   | 100%      | 100%   |
| frontend | 99.43%     | 99.31%   | 100%      | 99.43% |

No frontend file has a metric below 90%. The lowest is reducer.ts at 98.11% statements/lines and 98.5% branches.
Committed report: [coverage.md](coverage.md). Generated reports: `backend/coverage/index.html` and `frontend/coverage/index.html`.
Coverage was generated on 2026-10-23 at commit `e3cbe48`, before the documentation commit.

## 5. Docker

Single image: **259 MB** as reported by `docker image ls calculator --format '{{.Size}}'`.
Healthy Compose output is preserved in [compose-ps.txt](compose-ps.txt). It shows the backend with internal
`3000/tcp` only and nginx with `0.0.0.0:8080->80/tcp` and IPv6 host binding. Both were healthy.
Containers and the Compose network were removed after testing.

## 6. Installed versions

| Tool                   | Version |
| ---------------------- | ------- |
| Node                   | 24.22.1 |
| npm                    | 11.19.1 |
| Express                | 5.3.0   |
| zod                    | 4.6.7   |
| Helmet                 | 8.3.0   |
| TypeScript             | 5.9.3   |
| Vitest                 | 3.2.7   |
| @vitest/coverage-v8    | 3.2.7   |
| React                  | 19.3.1  |
| Vite                   | 7.3.7   |
| @vitejs/plugin-react   | 5.2.0   |
| @testing-library/react | 16.3.3  |
| Docker Engine          | 29.9.2  |

The actual dependency listing is preserved in [versions.txt](versions.txt). All mandated majors were retained; no peer-conflict fallback was needed.

## 7. File trees

The final backend and frontend trees, excluding `node_modules`, `dist` and `coverage`, are preserved
in [file-trees.txt](file-trees.txt) and the README's Project structure section.

## 8. Deviations and conflicts

- Windows equivalents replaced Bash job control, `lsof`, shell environment assignments and Unix cleanup commands. Servers ran hidden with logs and readiness checks; owned process trees were stopped and ports checked. POSIX signals were verified using Linux Docker containers.
- Bundler ancestor-directory access and Docker required execution outside the sandbox. Network-dependent npm installation also required elevated execution. Repository Git operations remained sandboxed; no global Git settings were changed.
- Milestone changes were grouped into one substantive commit per code milestone rather than splitting each example commit. M7 required no code change. Git author is `Codex <codex@openai.com>` to avoid inventing the user's identity.
- The M8 container was retained briefly after stop to inspect its exit status and shutdown log, then removed. This provides the same cleanup with stronger verification than immediate `--rm`.
- YAML was parsed using the already installed js-yaml rather than downloading yaml-lint.
- No Docker install fallback, dependency major fallback or action-version change was needed.
- The brief at the top of PLAN.md says Node, while the reproduced brief says Go preferred. Confirmed D5 wins and the required README language decision explains Node.js + TypeScript.
- D9's phrase “fails the build” is clarified by §7.2: coverage gates CI and verify; plain compile and Docker build do not run coverage.
- The prompt-log template names Claude Code. It was adapted to truthfully identify OpenAI Codex; the embedded implementation prompt itself remains unchanged.
- A clean clone is verified within the writable workspace rather than `/tmp`, preserving the required isolation on Windows.

## 9. Assumptions

Additional assumptions recorded in README: Windows commands can be adapted without changing application behavior;
the client timeout covers response headers, matching the reference implementation. All other calculator assumptions
come directly from the plan: unary percent, no repeat-equals, 15 digits, negative numbers as results and same-origin networking.

## 10. Known limitations

- Browser arithmetic and visual/mobile verification remain unverified; no browser is available in this session.
- Hosted CI and repository publishing are pending an explicit publish request.
- The 259-MB image misses the optional under-250-MB stretch target.
- Vitest 3 is mandated and currently carries development dependency audit findings: 2 moderate and 2 critical.
  The available fix changes the mandated major. Production-only npm audit reports zero vulnerabilities.
- IEEE-754 arithmetic and 15-significant-digit rounding lose precision on large integers; negative fractional powers can be non-real.
- nginx resolves the backend at startup; restart frontend after the backend is recreated with a different IP.
- Timeout covers response headers only. No keyboard listeners, history, precedence mode, E2E browser suite or other excluded features were added.

## 11. Open items for the human

- Fill the three external `Rafael Teodosio` entries in PROMPTS.md: prior planning tools, planning prompts and human review. TODO text inside the embedded source prompt is preserved verbatim and is not an unfilled implementation task.
- Run the M7 browser sequences, responsive checks at 320×568 and 375×667, and optional tablet/landscape/focus checks. A README screenshot is optional and was skipped.
- After explicitly choosing to publish, from the calculator directory run `gh repo create calculator --public --source . --remote origin --push`, or `git remote add origin <url>` followed by `git push -u origin main`.
- Replace the README badge comment with the actual CI badge, inspect the hosted workflow and share the repository URL with reviewers.
- Review whether to authorize a newer Vitest major to address the development-tool audit findings.
