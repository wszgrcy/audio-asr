import { TRPCError, initTRPC } from '@trpc/server';
import { ContextType } from '../type/trpc.type';
// import { LoggerService } from './domain/logger/logger.service';
import { unset } from 'es-toolkit/compat';
import { OverrideProperties } from 'type-fest';
import { auth } from '@@domain/auth/auth';
import { fromNodeHeaders } from 'better-auth/node';
// 报错断这里
export const t = initTRPC.context<ContextType>().create({
  errorFormatter: (opts) => {
    (opts.shape.data as any).data = (opts.error as any).data || {};
    unset(opts.shape.data, 'stack');
    return opts.shape;
  },
});
export const middleware = t.middleware;
// const Logger = middleware(async (opts) => {
//   let service = opts.ctx.injector.get(LoggerService);
//   // todo 需要等待调用
//   return opts.next();
// });
export const VerifyMiddleware = middleware(async ({ ctx, path, next }) => {
  const headers = ctx.req.headers;
  const data = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });
  if (!data) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '没有登录' });
  }
  return next({ ctx: { user: data.user } });
});

/**
 * 应该仅允许测试时使用
 * @deprecated
 */
export const RootProcedure = t.procedure.use(({ ctx, path, next }) => {
  return next();
});
export const VerifyProcedure = RootProcedure.use(VerifyMiddleware);

// .use(Logger);
export const router = t.router;

export type VerifyInput<T> = OverrideProperties<
  Parameters<
    Extract<
      Parameters<(typeof VerifyProcedure)['use']>[0],
      (...args: any[]) => any
    >
  >[0],
  { input: T }
>;
