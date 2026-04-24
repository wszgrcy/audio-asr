import { $localize } from '@cyia/localize';
import { ActivatedRoute } from '@angular/router';
import { NFCSchema } from '@piying/view-angular-core';
import { safeDefine } from '../define';
import * as v from 'valibot';
import { AsrService } from '../../service/asr.service';

export const AudioDeviceItemSubtitle = v.pipe(
  NFCSchema,
  safeDefine.setComponent('picker-ref', (actions) => {
    return [
      actions.inputs.patch({
        trigger: v.pipe(
          NFCSchema,
          safeDefine.setComponent('button', (actions) => {
            return [
              actions.inputs.patch({
                content: { icon: { fontIcon: 'menu' } },
                shape: 'circle',
                style: 'ghost',
                size: 'sm',
              }),
            ];
          }),
        ),
        content: v.pipe(
          NFCSchema,
          safeDefine.setComponent('menu-tree', (actions) => {
            return [
              actions.inputs.patchAsync({
                list: (field) => {
                  const fn = async (options: any) => {
                    const ac = field.injector.get(ActivatedRoute);
                    const id = ac.snapshot.params['id'];
                    const asr = field.injector.get(AsrService);
                    await asr.exportSrt({
                      id,
                      options: options,
                    });
                    field.context['close']();
                  };
                  return [
                    {
                      title: $localize`源字幕`,
                      async clicked(event, item) {
                        fn({ origin: true });
                      },
                    },
                    {
                      title: $localize`翻译字幕`,
                      async clicked(event, item) {
                        fn({ translate: true });
                      },
                    },
                  ];
                },
              }),
            ];
          }),
          actions.class.top('bg-base-200 shadow-md'),
        ),
      }),
    ];
  }),
);
