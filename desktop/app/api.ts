import { initTRPC } from '@trpc/server';
import { ContextType } from './router.context';
import { unset } from 'es-toolkit/compat';
export const t = initTRPC.context<ContextType>().create({
  errorFormatter: (opts) => {
    (opts.shape.data as any).data = (opts.error as any).data || {};
    unset(opts.shape.data, 'stack');
    return opts.shape;
  },
  isServer: true,
});
