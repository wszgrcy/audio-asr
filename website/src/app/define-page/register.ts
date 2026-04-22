import * as v from 'valibot';
import {
  actions,
  NFCSchema,
  setAlias,
  setComponent,
} from '@piying/view-angular-core';
import { AuthService } from '../service/auth.service';
import { map } from 'rxjs';
export const RegisterDefine = v.pipe(
  v.object({
    email: v.pipe(
      v.string(),
      v.email(),
      actions.wrappers.set(['label-wrapper']),
      v.title('邮箱'),
      actions.class.component('w-full'),
    ),
    name: v.pipe(
      v.string(),
      actions.wrappers.set(['label-wrapper']),
      v.title('用户名'),
      actions.class.component('w-full'),
    ),
    password1: v.pipe(
      v.string(),
      v.minLength(8),
      actions.wrappers.set(['label-wrapper']),
      v.title('密码'),
      actions.class.component('w-full'),
      setComponent('password'),
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8),
      actions.wrappers.set(['label-wrapper']),
      v.title('确认密码'),
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
              content: '注册',
              color: 'accent',
            }),
            actions.attributes.patch({
              type: 'submit',
            }),
            actions.inputs.patchAsync({
              clicked: (field) => {
                return () => {
                  const parent = field.get(['@register'])!;

                  return field.injector
                    .get(AuthService)
                    .register(parent.form.control?.value);
                };
              },
              disabled: (field) => {
                const parent = field.get(['@register'])!;
                return parent.form.control?.valueChanges.pipe(
                  map(() => parent.form.control?.invalid),
                );
              },
            }),
          ),
        ]),
      ),
    ),
  }),
  setAlias('register'),
  v.check((item) => {
    return item.password === item.password1;
  }),
);
export const RegisterPageDefine = v.pipe(
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
      RegisterDefine,
      actions.wrappers.patch(['form']),
      actions.class.top('max-w-[50vw] w-full flex gap-2 flex-col '),
    ),
  }),
  actions.wrappers.set(['div']),
  actions.class.top('flex items-center justify-center h-[100vh] flex-col'),
);
