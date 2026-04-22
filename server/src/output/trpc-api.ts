import type { AppService } from '../app.service';
export type AppRouter = Awaited<ReturnType<AppService['getRouter']>>;
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export type TopRouterKey = keyof RouterInput;
