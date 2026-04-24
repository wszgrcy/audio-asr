import { FastifyPluginCallback } from 'fastify';
import { Injector } from 'static-injector';
import { auth } from '@@domain/auth/auth';
import { StreamAudioService } from '@@domain/audio/audio.service';
import { db } from '../../db';
import { asrEntity } from '@project/define';
import { and, eq, not } from 'drizzle-orm';
import { fromNodeHeaders } from 'better-auth/node';
import { $localize } from '@cyia/localize';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}
export function websocketRoutes(
  injector: () => Injector,
): FastifyPluginCallback {
  return (instance, options) => {
    instance.decorateRequest('userId', undefined);
    instance.addHook('onRequest', async (req) => {
      const token = (req.query as { cookie?: string })?.cookie;
      let headers;
      if (token) {
        headers = [['cookie', token] as [string, string]];
      } else {
        const authorization = (req.query as any)['authorization'];
        if (authorization) {
          // bearer
          headers = [['authorization', authorization] as [string, string]];
        } else {
          headers = fromNodeHeaders(req.headers);
        }
      }

      const result = await auth.api.getSession({
        headers: headers,
        query: {
          disableCookieCache: true,
        },
      });
      if (!result) {
        throw new Error($localize`验证失败`);
      } else {
        req.userId = result.user.id;
      }
      // const list = req.routeOptions.url!.slice('/ws/'.length).split('/');
      // const data = await auth.api.verifyApiKey({
      //   body: {
      //     key: token,
      //     permissions: {
      //       ws: [list[0]],
      //     },
      //   },
      // });
      // if (!data.valid) {
      //   throw new Error(data.error?.code);
      // }

      // // todo 可以为组织,也可以为用户,目前只为用户
      // req.userId = data.key!.referenceId;
    });
    const ij = injector();
    instance.get('/file-queue', { websocket: true }, (socket, req) => {
      socket.on('message', (message, isBinary) => {
        console.log(message.toString('utf-8'));
        if (isBinary) {
          return;
        }
        const config = JSON.parse(message.toString('utf-8')) as {
          type: string;
          value: any;
        };
        switch (config.type) {
          case 'request-item': {
            db.select()
              .from(asrEntity)
              .where(
                and(
                  eq(asrEntity.id, config.value.id),
                  eq(asrEntity.userId, req.userId!),
                  not(eq(asrEntity.status, 0)),
                ),
              )
              .limit(1)
              .then((result) => {
                if (result.length === 0) {
                  socket.send(
                    JSON.stringify({
                      type: 'data',
                      id: config.value.id,
                      value: undefined,
                    }),
                  );
                } else {
                  socket.send(
                    JSON.stringify({
                      type: 'data',
                      id: config.value.id,
                      value: result[0],
                    }),
                  );
                }
              });
            break;
          }

          default:
            break;
        }
      });
    });
    instance.get('/audio-stream/:id', { websocket: true }, (socket, req) => {
      const service = ij.get(StreamAudioService);
      const id = (req.params as { id: string }).id;
      let chunkId!: string;
      socket.on('message', (message, isBinary) => {
        if (isBinary) {
          service.add(id, { id: chunkId, buffer: message as Buffer });
        } else {
          const config = JSON.parse(message.toString('utf-8')) as {
            type: string;
            value: any;
          };
          switch (config.type) {
            case 'init':
              service.init(id, config.value, (value) => {
                socket.send(JSON.stringify(value));
              });
              break;
            case 'chunkStart':
              if (chunkId) {
                service.end(id, chunkId);
              }
              chunkId = config.value;
              break;
            case 'chunkEnd':
              break;
            default:
              break;
          }
        }
      });
      socket.on('error', () => {
        service.clear(id);
      });
      socket.on('close', () => {
        service.clear(id);
      });
    });
  };
}
