import type { NodeEnv } from '../config.js';
export function requestLogFormat(nodeEnv: NodeEnv): 'dev' | 'combined' | null {
  return nodeEnv === 'test' ? null : nodeEnv === 'production' ? 'combined' : 'dev';
}
