import { $localize } from '@cyia/localize';
import * as v from 'valibot';
import {
  actions,
  asVirtualGroup,
  NFCSchema,
  setAlias,
} from '@piying/view-angular-core';
import { computed } from '@angular/core';

import { safeDefine } from '../define';
import { LoginToken } from '../../service/login/login.token';
export const ConnectConfig = v.pipe(
  v.object({
    enableEnc: v.pipe(
      v.optional(v.boolean(), false),
      v.title('🔒'),
      actions.class.top('!flex-none'),
      actions.props.patch({ labelPosition: 'top' }),
      safeDefine.setComponent('boolean', (actions) => {
        return [
          actions.inputs.patch({
            color: 'primary',
          }),
        ];
      }),
    ),
    serverUrl: v.pipe(
      v.optional(v.string(), '127.0.0.1:3000'),
      v.title($localize`地址`),
      actions.class.top('flex-1'),
      safeDefine.setComponent('string', (actions) => {
        return [
          actions.inputs.patch({
            color: 'primary',
          }),
        ];
      }),
    ),
  }),
  actions.wrappers.patch(['div']),
  actions.class.top('flex gap-2'),
);
export const LoginConfig = v.pipe(
  v.object({
    email: v.pipe(
      v.string(),
      v.email(),

      safeDefine.setComponent('string', (actions) => {
        return [
          actions.inputs.patch({
            color: 'primary',
          }),
        ];
      }),
      // actions.wrappers.set(['label-wrapper']),
      v.title($localize`邮箱`),
      actions.class.component('w-full'),
      // actions.wrappers.patch(['item']),
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8),
      actions.wrappers.set(['label-wrapper']),
      v.title($localize`密码`),
      actions.class.component('w-full'),
      // actions.wrappers.patch(['item']),
      safeDefine.setComponent('password', (actions) => {
        return [];
      }),
    ),
  }),
  actions.class.top('gap-4 grid '),
);
export type ConnectConfigType = v.InferOutput<typeof ConnectConfig>;
export type LoginDataType = {
  connectConfig: ConnectConfigType;
  loginConfig: v.InferOutput<typeof LoginConfig>;
};
export const LoginPage = v.pipe(
  v.intersect([
    v.pipe(
      v.object({
        connectConfig: ConnectConfig,
      }),
    ),
    v.pipe(
      v.object({
        loginConfig: LoginConfig,
      }),
    ),

    v.pipe(
      NFCSchema,
      safeDefine.setComponent('button', (actions) => {
        return [
          actions.attributes.patch({ type: 'submit' }),
          actions.class.bottom('btn-block'),
          actions.inputs.patch({
            content: $localize`登录`,
            color: 'primary',
          }),
          actions.inputs.patchAsync({
            disabled: (field) => {
              return computed(() => {
                return field.form.parent.status$$() !== 'VALID';
              });
            },
            clicked: (field) => {
              const loginService = field.injector.get(LoginToken);
              return async () => {
                let loginData = field.get(['@loginData'])!;
                const data = loginData.form.control!.value;
                await loginService.login(data);
                loginData.get(['loginConfig'])!.form.control!.reset();
              };
            },
          }),
        ];
      }),
      // actions.wrappers.patch(['item']),
    ),
  ]),
  setAlias('loginData'),
  asVirtualGroup(),
  actions.wrappers.set(['form']),
  // actions.class.top('gap-4 grid w-[80%] m-auto'),
  // actions.wrappers.patch(['fieldset']),
);
export type LoginConfigType = Omit<
  v.InferOutput<typeof LoginPage>,
  'email' | 'password'
>;
export const LoginPageDefine = v.pipe(
  v.intersect([
    v.pipe(
      LoginPage,
      actions.class.top('max-w-[80dvw] gap-2 grid w-[80%] m-auto'),
    ),
  ]),
  asVirtualGroup(),
  actions.wrappers.set(['div']),
  actions.class.top('flex items-center justify-center h-[100vh] flex-col'),
);
