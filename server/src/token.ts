import { InjectionToken } from 'static-injector';

export const StartupToken = new InjectionToken<(() => Promise<void>)[]>(
  'Startup',
);
