import { z } from 'zod';
import type { ValidationIssue } from './contract.js';
export const calculateRequestSchema = z.strictObject({
  operation: z.string().min(1),
  operands: z.array(z.number()),
});
export function toValidationIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join('.') || '(root)',
    message: issue.message,
  }));
}
