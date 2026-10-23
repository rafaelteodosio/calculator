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
