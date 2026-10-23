import type { ApiErrorBody, CalculateResponse, ErrorCode, Operation } from './contract';

export const CALCULATE_URL = '/api/v1/calculate';
export const REQUEST_TIMEOUT_MS = 10_000;

export type ClientErrorCode = ErrorCode | 'NETWORK_ERROR' | 'UNEXPECTED_RESPONSE';

export class ApiError extends Error {
  constructor(
    public readonly code: ClientErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isApiErrorBody(x: unknown): x is ApiErrorBody {
  if (typeof x !== 'object' || x === null || !('error' in x)) return false;
  const e = (x as { error: unknown }).error;
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof (e as { code?: unknown }).code === 'string' &&
    typeof (e as { message?: unknown }).message === 'string'
  );
}

function hasFiniteResult(x: unknown): x is CalculateResponse {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as { result?: unknown }).result === 'number' &&
    Number.isFinite((x as { result: number }).result)
  );
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
    if (isApiErrorBody(body))
      throw new ApiError(body.error.code, body.error.message, response.status);
    throw new ApiError('UNEXPECTED_RESPONSE', 'Unexpected error response.', response.status);
  }
  if (!hasFiniteResult(body)) {
    throw new ApiError(
      'UNEXPECTED_RESPONSE',
      'Response did not contain a finite result.',
      response.status,
    );
  }
  return body.result;
}
