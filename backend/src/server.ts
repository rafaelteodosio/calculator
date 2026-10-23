import { loadConfig } from './config.js';
import { createApp } from './app.js';
const config = loadConfig();
const server = createApp(config).listen(config.port, '0.0.0.0', (err?: Error) => {
  if (err) throw err;
  console.info(
    `Calculator API listening on http://0.0.0.0:${config.port} (NODE_ENV=${config.nodeEnv}${config.staticDir ? `, serving ${config.staticDir}` : ''})`,
  );
});
function shutdown(signal: string) {
  console.info(`Received ${signal}, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
