import fs from 'node:fs';
import path from 'node:path';
import express, { type Express } from 'express';
export function mountSpa(app: Express, staticDir: string): void {
  if (!fs.existsSync(path.join(staticDir, 'index.html')))
    throw new Error(`STATIC_DIR "${staticDir}" does not contain index.html`);
  app.use(express.static(staticDir));
  app.use((req, res, next) =>
    req.method === 'GET' || req.method === 'HEAD'
      ? res.sendFile('index.html', { root: staticDir })
      : next(),
  );
}
