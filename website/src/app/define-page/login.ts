import { $localize } from '@cyia/localize';
import * as v from 'valibot';
import {
  actions,
  NFCSchema,
  setAlias,
  setComponent,
} from '@piying/view-angular-core';
import { AuthService } from '../service/auth.service';
import { map } from 'rxjs';
export const LoginDefine = v.pipe(
  v.object({
    email: v.pipe(
      v.string(),
      v.email(),
      actions.wrappers.set(['label-wrapper']),
      v.title($localize`邮箱`),
      actions.class.component('w-full'),
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8),
      actions.wrappers.set(['label-wrapper']),
      v.title($localize`密码`),
      actions.class.component('w-full'),
      setComponent('password'),
    ),
    __button: v.pipe(
      v.optional(
        v.tuple([
          v.pipe(
            NFCSchema,
            setComponent('button'),
            actions.inputs.patch({
              content: $localize`注册`,
              color: 'accent',
            }),
            actions.inputs.patchAsync({
              clicked: (field) => {
                return () => {
                  return field.injector.get(AuthService).toRegister();
                };
              },
            }),
          ),
          v.pipe(
            NFCSchema,
            setComponent('button'),
            actions.inputs.patch({
              content: $localize`登录`,
              color: 'primary',
            }),
            actions.attributes.patch({ type: 'submit' }),
            actions.inputs.patchAsync({
              clicked: (field) => {
                const parent = field.get(['@login'])!;
                return () => {
                  return field.injector
                    .get(AuthService)
                    .login(parent.form.control?.value);
                };
              },
              disabled: (field) => {
                const parent = field.get(['@login'])!;
                return parent.form.control!.statusChanges.pipe(
                  map(() => parent.form.control!.invalid),
                );
              },
            }),
            actions.hooks.merge({
              allFieldsResolved: (field) => {},
            }),
          ),
        ]),
      ),
      actions.wrappers.patch([
        { type: 'div', attributes: { class: 'flex gap-2 *:flex-1' } },
      ]),
    ),
  }),
  setAlias('login'),
);
export const LoginPageDefine = v.pipe(
  v.object({
    __logo: v.pipe(
      NFCSchema,
      setComponent('common-data'),
      actions.inputs.patch({
        content: {
          icon: { fontSet: 'icon', fontIcon: 'icon-logo' },
        },
      }),
    ),
    __login: v.pipe(
      v.pipe(LoginDefine, setComponent('fieldset')),
      actions.class.top('max-w-[50vw] w-full'),
    ),
  }),
  actions.wrappers.set(['form']),
  actions.class.top('flex items-center justify-center h-[100vh] flex-col'),
);
