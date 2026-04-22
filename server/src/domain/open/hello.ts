import { toJsonSchema } from '@valibot/to-json-schema';
import { FastifyPluginCallback } from 'fastify';
import { Injector } from 'static-injector';
import * as v from 'valibot';

export function helloRoutes(injector: () => Injector): FastifyPluginCallback {
  return (instance, options) => {
    instance.get(
      '/ping',
      {
        schema: {
          querystring: toJsonSchema(
            v.object({ value: v.optional(v.string()) }),
          ),
          security: [{ apiKey: [] }],
          tags: ['hello'],
        },
      },
      (req) => {
        return `pong ${(req.query as any)['value']}`;
      },
    );
    instance.post(
      '/ping',
      {
        schema: {
          body: toJsonSchema(v.object({ value: v.optional(v.string()) })),
          tags: ['hello'],
        },
      },
      (req) => {
        return `pong ${(req.body as any)['value']}`;
      },
    );
  };
}
