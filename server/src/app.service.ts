import { Injector, createInjector, inject } from 'static-injector';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastify, { FastifyInstance } from 'fastify';
import { t } from './router';

import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import fastifyCors from '@fastify/cors';

import { TestService } from '@@domain/test/test-auth.service';
import { auth } from './domain/auth/auth';
// import { userRouter } from '@@domain/user/user.service';
import { injector$ } from './injector';
import fastifySwagger from '@fastify/swagger';
import path from 'path';
import fs from 'fs/promises';
import { ApikeyRouter } from '@@domain/apikey/router';
import { StartupToken } from './token';

import { websocketRoutes } from '@@domain/websocket';
import ws from '@fastify/websocket';
import { FileAudioRouter } from '@@domain/audio/file-audio.router';
import { StreamAudioService } from '@@domain/audio/audio.service';
import { FileAudioService } from '@@domain/audio/file.service';
import { UserService } from '@@domain/user/user.service';
import { AsrRouter } from '@@domain/asr/router';
import { UserRouter } from '@@domain/user/router';

export class AppService {
  injector = inject(Injector);

  async bootstrap() {
    const server = fastify({
      routerOptions: { maxParamLength: 5000 },
      bodyLimit: 10 * 1024 * 1024,
      logger:
        process.env.NODE_ENV === 'dev'
          ? {
              base: undefined,
              transport: {
                targets: [
                  // {
                  //   level: 'info',
                  //   target: 'pino/file',
                  //   options: {
                  //     destination: path.join(process.cwd(), './log/output'),
                  //     maxWrite: 1,
                  //   },
                  // },
                  {
                    level: 'trace',
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                    },
                  },
                ],
              },
            }
          : true,
    });

    /* eslint-disable no-constant-binary-expression */
    if (false || process.env.NODE_ENV === 'dev') {
      await server.register(fastifySwagger, {
        hideUntagged: true,
        openapi: {
          openapi: '3.0.0',
          info: {
            title: 'Test swagger',
            description: 'Backend',
            version: '0.1.0',
          },
          servers: [
            {
              url: 'http://localhost:3000',
              description: 'Development server',
            },
          ],
          tags: [
            { name: 'hello', description: 'hello' },
            { name: 'code', description: 'Code related end-points' },
          ],

          components: {
            securitySchemes: {
              apiKey: {
                type: 'http',
                scheme: 'bearer',
              },
            },
          },
          externalDocs: {
            url: 'https://swagger.io',
            description: 'Find more info here',
          },
        },
      });
    }

    server.register(fastifyCors, {
      origin: [
        'http://localhost:4202',
        'http://localhost:4200',
        // 'https://editor.swagger.io',
        'https://localhost',
      ],
      credentials: true,
    });
    // server.register(
    //   openRoutes(() => this.injector),
    //   { prefix: '/open' },
    // );
    server.register(ws);

    server.register(
      websocketRoutes(() => this.injector),
      { prefix: '/ws' },
    );

    server.route({
      method: ['GET', 'POST'],
      url: '/api/auth/*',
      async handler(request, reply) {
        try {
          // Construct request URL
          const url = new URL(request.url, `http://${request.headers.host}`);

          // Convert Fastify headers to standard Headers object
          const headers = new Headers();
          Object.entries(request.headers).forEach(([key, value]) => {
            if (value) headers.append(key, value.toString());
          });
          // Create Fetch API-compatible request
          const req = new Request(url.toString(), {
            method: request.method,
            headers,
            ...(request.body ? { body: JSON.stringify(request.body) } : {}),
          });
          // Process authentication request
          const response = await auth.handler(req);
          // Forward response to client
          reply.status(response.status);
          response.headers.forEach((value, key) => reply.header(key, value));
          reply.send(response.body ? await response.text() : null);
        } catch (error: any) {
          server.log.error('Authentication Error:', error);
          reply.status(500).send({
            error: 'Internal authentication error',
            code: 'AUTH_FAILURE',
          });
        }
      },
    });
    server.register(fastifyTRPCPlugin, {
      prefix: '/api',
      trpcOptions: {
        router: await this.getRouter(),
        createContext: await this.#createContext(server),
      },
    });

    try {
      await server.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
      server.log.error(err);
      console.error(err);
    }
    for (const item of this.injector.get(StartupToken, [])) {
      await item();
    }
    /* eslint-disable no-constant-binary-expression */
    if (false || process.env.NODE_ENV === 'dev') {
      const result = server.swagger();
      const dir = path.join(process.cwd(), './docs/swagger');
      await fs.mkdir(dir, { recursive: true });
      fs.writeFile(
        path.join(dir, 'api.json'),
        JSON.stringify(result, undefined, 4),
      );
    }
  }

  async #createContext<T extends FastifyInstance>(server: T) {
    return (opts: CreateFastifyContextOptions) => ({
      injector: this.injector,
      req: opts.req,
      log: opts.req.log,
    });
  }
  async getRouter() {
    this.injector = createInjector({
      providers: [
        TestService,
        UserService,
        StreamAudioService,
        FileAudioService,
      ],
      parent: this.injector,
    });
    injector$.set(this.injector);
    return t.router({
      // test: this.injector.get(TestService).router,
      // user: userRouter,
      apikey: ApikeyRouter,
      fileAudio: FileAudioRouter,
      asr: AsrRouter,
      user: UserRouter,
    });
  }
}
