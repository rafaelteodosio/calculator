import { it, expect } from 'vitest';
import { calculateRequestSchema as schema, toValidationIssues } from '../src/validation.js';
function invalid(input: unknown, path: string) {
  const parsed = schema.safeParse(input);
  expect(parsed.success).toBe(false);
  if (!parsed.success) expect(toValidationIssues(parsed.error).map((i) => i.path)).toContain(path);
}
it('V1 accepts numeric operands without altering inputs', () => {
  const input = { operation: 'add', operands: [1, 2] };
  expect(schema.parse(input)).toEqual(input);
});
it('V2 rejects string operands', () =>
  invalid({ operation: 'add', operands: ['2', 3] }, 'operands.0'));
it('V3 rejects Infinity including JSON overflow', () => {
  invalid({ operation: 'add', operands: [Infinity, 1] }, 'operands.0');
  invalid(JSON.parse('{"operation":"add","operands":[1e309,1]}'), 'operands.0');
});
it('V4 rejects NaN', () => invalid({ operation: 'add', operands: [NaN, 1] }, 'operands.0'));
it('V5 rejects coercible or compound operands', () => {
  for (const n of [true, null, [1], {}])
    invalid({ operation: 'add', operands: [n, 1] }, 'operands.0');
});
it('V6 rejects unknown keys', () =>
  invalid({ operation: 'add', operands: [1, 2], extra: 1 }, '(root)'));
it('V7 requires a nonempty string operation', () => {
  for (const op of ['', 123]) invalid({ operation: op, operands: [1, 2] }, 'operation');
});
it('V8 requires an operands array', () => {
  invalid({ operation: 'add' }, 'operands');
  invalid({ operation: 'add', operands: '1,2' }, 'operands');
});
it('V9 requires an object', () => {
  for (const input of [[1, 2], null, 42, undefined]) invalid(input, '(root)');
});
it('V10 maps paths and messages', () => {
  const p = schema.safeParse({});
  if (p.success) throw new Error('Expected failure');
  const issues = toValidationIssues(p.error);
  expect(issues.map((i) => i.path)).toEqual(['operation', 'operands']);
  for (const i of issues) expect(i.message.length).toBeGreaterThan(0);
});
