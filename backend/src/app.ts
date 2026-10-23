import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { loadConfig, type AppConfig } from './config.js';
import { requestLogFormat } from './middleware/requestLogger.js';
import { noStore } from './middleware/noStore.js';
import { createApiRouter } from './routes/api.js';
import { notFoundHandler } from './middleware/notFound.js';
import { mountSpa } from './middleware/spa.js';
import { errorHandler } from './middleware/errorHandler.js';
export function createApp(config: AppConfig = loadConfig()): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } } }));
  const fmt = requestLogFormat(config.nodeEnv);
  if (fmt) app.use(morgan(fmt));
  app.use('/api', noStore);
  app.use('/api/v1', createApiRouter());
  app.use('/api', notFoundHandler);
  if (config.staticDir) mountSpa(app, config.staticDir);
  app.use(errorHandler);
  return app;
}
