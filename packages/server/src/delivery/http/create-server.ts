import fs from 'node:fs';
import path from 'node:path';
import type { ServerResponse } from 'node:http';
import fastify from 'fastify';
import staticPlugin from '@fastify/static';
import type { AppConfig } from '@ses-admin/server/config/config';
import { AppError } from '@ses-admin/server/domain/errors/app-error';
import type { MessagesPort } from '@ses-admin/server/domain/ports/messages-port';
import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';
import { registerRoutes } from '@ses-admin/server/delivery/http/routes';

export type ServerDeps = {
  config: AppConfig;
  ses: SesPort;
  messages: MessagesPort;
};

export const createServer = ({ config, ses, messages }: ServerDeps) => {
  const app = fastify({ logger: true });
  const reloadClients = new Set<ServerResponse>();

  app.addContentTypeParser(
    'multipart/form-data',
    { bodyLimit: 10 * 1024 * 1024 },
    (_req, payload, done) => {
      done(null, payload);
    },
  );

  if (config.NODE_ENV === 'development') {
    app.get('/__reload', (_request, reply) => {
      reply.hijack();
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      reply.raw.write('retry: 1000\n\n');
      reloadClients.add(reply.raw);
      reply.raw.on('close', () => {
        reloadClients.delete(reply.raw);
      });
      return reply;
    });

    app.post('/__reload', (_request, reply) => {
      const payload = `event: reload\ndata: ${Date.now()}\n\n`;
      reloadClients.forEach((client) => client.write(payload));
      reply.send({ ok: true });
    });
  }

  const candidates = [
    process.env.UI_DIST_PATH ? path.resolve(process.env.UI_DIST_PATH) : undefined,
    path.resolve(process.cwd(), 'ui', 'dist'),
    path.resolve(process.cwd(), 'packages', 'ui', 'dist'),
    path.resolve(process.cwd(), '..', 'ui', 'dist'),
    path.resolve(process.cwd(), '..', 'packages', 'ui', 'dist'),
  ].filter(Boolean) as string[];

  const uiRoot = candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
  app.register(staticPlugin, {
    root: uiRoot,
    prefix: '/',
    index: ['index.html'],
  });

  registerRoutes(app, { ses, messages });

  app.setNotFoundHandler((request, reply) => {
    if (request.method === 'GET' && !request.url.startsWith('/api')) {
      reply.type('text/html').sendFile('index.html');
      return;
    }
    reply.status(404).send({ error: 'NOT_FOUND', message: 'Route not found' });
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.status).send({ error: error.code, message: error.message });
      return;
    }
    app.log.error(error);
    reply.status(500).send({ error: 'INTERNAL_ERROR', message: 'Unexpected error' });
  });

  return app;
};
