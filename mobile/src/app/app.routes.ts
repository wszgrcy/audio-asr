import { Routes } from '@angular/router';
import { safeDefine } from './piying/define';
import { inject } from '@angular/core';

import { GlobalConfigDefine } from './piying/page-define/global-config';
import { RemoteService } from './remote/remote.service';
import { GlobalConfigService, routes as CRoutes } from '@@web-common';
CRoutes[2].children![4].children![2].data = {
  schema: () => GlobalConfigDefine,
  options: () => {
    return {
      fieldGlobalConfig: safeDefine.define,
    };
  },
  model: () => {
    const config = inject(GlobalConfigService);
    return config.getConfig$$();
  },
};
export const routes: Routes = CRoutes;
