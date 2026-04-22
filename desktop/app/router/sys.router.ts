import { t } from '../api';

import { app } from 'electron';
export const SysRouter = t.router({
  reboot: t.procedure.query(async ({ input, ctx }) => {
    app.relaunch();
    app.quit();
  }),
});
