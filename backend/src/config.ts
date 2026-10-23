import path from 'node:path';
export type NodeEnv = 'development' | 'production' | 'test';
export interface AppConfig {
  port: number;
  nodeEnv: NodeEnv;
  staticDir?: string;
}
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const raw = env.PORT || '3000';
  const port = Number(raw);
  if (!/^\d+$/.test(raw) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT "${raw}": expected an integer between 1 and 65535.`);
  }
  const nodeEnv = env.NODE_ENV || 'development';
  if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    throw new Error(`Invalid NODE_ENV "${nodeEnv}": expected development, production or test.`);
  }
  return { port, nodeEnv, staticDir: env.STATIC_DIR ? path.resolve(env.STATIC_DIR) : undefined };
}
