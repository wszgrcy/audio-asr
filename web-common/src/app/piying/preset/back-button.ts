import { NFCSchema } from '@piying/view-angular-core';
import * as v from 'valibot';
import { safeDefine } from '../define';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

export const BackButton = v.pipe(
  NFCSchema,
  safeDefine.setComponent('button', (actions) => {
    return [
      actions.inputs.patch({
        content: { icon: { fontIcon: 'arrow_back' } },
        style: 'ghost',
        shape: 'circle',
      }),
      actions.inputs.patchAsync({
        clicked: (field) => {
          return async () => {
            const router = field.injector.get(Router);
            if (history.length) {
              field.injector.get(Location).back();
            } else {
              const ar = field.injector.get(ActivatedRoute);
              await router.navigate(['/'], { relativeTo: ar.parent });
            }
            // const ar = field.injector.get(ActivatedRoute);

            // const pre =
            //   router.lastSuccessfulNavigation()?.previousNavigation?.finalUrl;
            // if (pre) {
            //   await router.navigateByUrl(pre);
            // } else {
            //   await router.navigate(['/'], { relativeTo: ar.parent });
            // }
          };
        },
      }),
    ];
  }),
);
