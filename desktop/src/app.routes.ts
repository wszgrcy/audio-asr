import { Routes } from '@angular/router';

import { GlobalConfigDefine } from '@desktop/define';
import { safeDefine } from './app/piying/define';
import * as v from 'valibot';
import { actions, asVirtualGroup, NFCSchema } from '@piying/view-angular-core';
import { debounceTime } from 'rxjs';
import { inject } from '@angular/core';
import {
  GlobalConfigService,
  LoginToken,
  routes as CRoutes,
  BackButton,
} from '@@web-common';

CRoutes[2].children![4].children![2].data = {
  schema: () =>
    v.pipe(
      v.intersect([
        v.pipe(
          v.object({
            start: BackButton,
            center: v.pipe(
              NFCSchema,
              safeDefine.setComponent('common-data', (actions) => {
                return [actions.inputs.patch({ content: '配置' })];
              }),
            ),
          }),
          safeDefine.setComponent('navbar'),
          actions.class.top('sticky top-0 bg-base-200 z-9'),
        ),
        ...GlobalConfigDefine.options,
        v.pipe(
          NFCSchema,
          safeDefine.setComponent('button', (actions) => {
            return [
              actions.inputs.patch({
                content: '退出',
                color: 'error',
                shape: 'block',
              }),
              actions.inputs.patchAsync({
                clicked: (field) => {
                  return async () => {
                    field.injector.get(LoginToken).signOut();
                  };
                },
              }),
            ];
          }),
          actions.class.bottom('mt-2'),
        ),
      ]),
      asVirtualGroup(),
      actions.hooks.merge({
        allFieldsResolved(field) {
          const control = field.form.control!;
          control.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
            if (!control.touched$$() && !control.dirty$$()) {
              return;
            }

            field.injector.get(GlobalConfigService).patchConfig(value);
          });
        },
      }),
    ),
  model: () => {
    const globalConfig = inject(GlobalConfigService);
    return globalConfig.getConfig$$();
  },
  options: () => {
    return {
      fieldGlobalConfig: safeDefine.define,
    };
  },
};
export const routes: Routes = CRoutes;
