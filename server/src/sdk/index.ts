import type { AppService } from '../app.service';
export type AppRouter = Awaited<ReturnType<AppService['getRouter']>>;
