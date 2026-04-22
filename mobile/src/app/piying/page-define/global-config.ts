import * as v from 'valibot';
import { actions, asVirtualGroup, NFCSchema } from '@piying/view-angular-core';

import { safeDefine } from '../define';

import { debounceTime } from 'rxjs';
import { LoginService } from '../../service/login.service';
import { RemoteService } from '../../remote/remote.service';
import { BackButton, GlobalConfigService } from '@@web-common';
import { CommonConfigDefine } from '@@ref/define/src/define/common-global.config';

export const GlobalConfigDefine = v.pipe(
  v.intersect([
    v.pipe(
      v.object({
        start: BackButton,
        center: v.pipe(
          NFCSchema,
          safeDefine.setComponent('common-data', (actions) => {
            return [actions.inputs.patch({ content: '配置' })];
          }),

          // todo 点击后菜单
        ),
      }),
      safeDefine.setComponent('navbar'),
      actions.class.top('sticky top-0 bg-base-200 z-9'),
    ),
    v.pipe(
      v.intersect([
        CommonConfigDefine,
        v.pipe(
          v.intersect([
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
                        field.injector.get(LoginService).signOut();
                      };
                    },
                  }),
                ];
              }),
              actions.class.bottom('mt-2'),
            ),
          ]),
          asVirtualGroup(),
        ),
      ]),
      asVirtualGroup(),
      actions.wrappers.patch(['div']),
      actions.class.top('p-2'),
    ),
  ]),
  asVirtualGroup(),

  actions.hooks.merge({
    allFieldsResolved: (field) => {
      const control = field.form.control!;
      field.form.root.valueChanges
        .pipe(debounceTime(500))
        .subscribe(async (value) => {
          if (!control.touched$$() && !control.dirty$$()) {
            return;
          }
          field.injector.get(GlobalConfigService).patchConfig(value);
          (
            await field.injector.get(RemoteService).trpcClient$$()
          ).user.syncConfig.mutate(value);
        });
    },
  }),
);
