import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';
import { actions } from '@piying/view-angular';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../service/auth.service';
export const MainPage = v.pipe(
  v.object({
    content: v.object({
      navbar: v.pipe(
        v.object({
          start: v.object({
            menu: v.pipe(
              NFCSchema,
              setComponent('button'),
              actions.inputs.patch({
                content: { icon: { fontIcon: 'menu' } },
                shape: 'square',
                style: 'ghost',
              }),
              actions.attributes.patch({
                for: 'drawer-0',
              }),
            ),
          }),
          end: v.pipe(
            v.object({
              theme: v.pipe(NFCSchema, setComponent('theme-controller')),
              logout: v.pipe(
                NFCSchema,
                setComponent('button'),
                actions.inputs.patch({
                  content: { icon: { fontIcon: 'logout' } },
                }),
                actions.class.component('btn-circle btn-ghost'),
                actions.inputs.patchAsync({
                  clicked: (field) => {
                    return async () => {
                      await field.injector.get(AuthService).logout();
                    };
                  },
                }),
              ),
            }),
            actions.wrappers.patch(['div']),
            actions.class.top('flex items-center gap-2'),
          ),
        }),
        setComponent('navbar'),
        actions.class.top('sticky top-0 bg-base-100 z-9'),
      ),
      router: v.pipe(
        NFCSchema,
        setComponent('div'),
        actions.directives.patch([{ type: RouterOutlet }]),
      ),
    }),
    side: v.pipe(
      v.object({
        list: v.pipe(
          NFCSchema,
          setComponent('menu-tree'),
          actions.inputs.patch({
            list: [
              { title: 'user', router: { routerLink: './user' } },
              {
                title: 'organization',
                router: { routerLink: './organization' },
              },
              {
                title: 'default-role',
                router: { routerLink: './default-role' },
              },
              { type: 'divider' },

              {
                title: 'apikey',
                router: { routerLink: './apikey' },
              },
            ],
          }),
          actions.class.top('min-w-[250px]'),
        ),
      }),
      actions.wrappers.set([{ type: 'div' }]),
      actions.class.top('bg-base-100 h-full z-9'),
    ),
  }),
  setComponent('drawer'),
  actions.inputs.patch({
    contentClass: 'flex flex-col *:last:flex-1',
  }),
  actions.class.top('lg:drawer-open'),
);
