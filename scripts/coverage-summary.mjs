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
    console.error(
      `coverage-summary: no ${ws}/coverage/coverage-summary.json; run "npm run test -w ${ws}" first.`,
    );
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
