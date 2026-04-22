import { FastifyPluginCallback } from 'fastify';
import { Injector } from 'static-injector';
import { helloRoutes } from './hello';
import { auth } from '@@domain/auth/auth';
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}
export function openRoutes(injector: () => Injector): FastifyPluginCallback {
  return (instance, options) => {
    instance.decorateRequest('userId', undefined);
    instance.addHook('onRequest', async (req) => {
      if (!req.headers.authorization) {
        throw new Error('无效的apiky');
      }
      const apikey = req.headers.authorization.slice(`Bearer `.length);
      const list = req.routeOptions.url!.slice('/open/'.length).split('/');
      if (list.length !== 2) {
        throw new Error('地址请求错误');
      }
      const data = await auth.api.verifyApiKey({
        body: {
          key: apikey,
          permissions: {
            [list[0]]: [list[1]],
          },
        },
      });
      if (!data.valid) {
        throw new Error(data.error?.code);
      }

      // todo 可以为组织,也可以为用户,目前只为用户
      req.userId = data.key!.referenceId;
    });
    instance.register(helloRoutes(injector));
  };
}
