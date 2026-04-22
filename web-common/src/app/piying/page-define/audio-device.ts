import * as v from 'valibot';
import { actions, NFCSchema } from '@piying/view-angular-core';

import { safeDefine } from '../define';

import { BackButton } from '../preset/back-button';
import { AudioDeviceItemSubtitle } from '../preset/audio-item-subtitle';
import { TitleInputDefine } from '../preset/title-input';
import { AudioDeviceComponent } from '../../component/audio-device/component';
import { AudioDataService } from '../../service/audio/audio-router.service';
export const AudioDevicePageDefine = v.pipe(
  v.object({
    __head2: v.pipe(
      v.object({
        start: BackButton,
        end: v.pipe(
          v.object({
            __subtitle: AudioDeviceItemSubtitle,
          }),
        ),
        center: TitleInputDefine,
      }),
      safeDefine.setComponent('navbar'),
      actions.class.top('sticky top-0 bg-base-200 z-9'),
    ),

    __device: v.pipe(NFCSchema, safeDefine.setComponent(AudioDeviceComponent)),
  }),
  actions.providers.patch([AudioDataService]),
);
