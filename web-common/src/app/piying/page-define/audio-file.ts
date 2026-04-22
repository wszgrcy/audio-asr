import * as v from 'valibot';
import { actions, NFCSchema } from '@piying/view-angular-core';

import { safeDefine } from '../define';

import { AudioDataService } from '../../service/audio/audio-router.service';
import {
  AudioDeviceItemSubtitle,
  BackButton,
  TitleInputDefine,
} from '../preset';
import { AudioFileComponent } from '../../component/audio-file/component';

export const AudioFilePageDefine = v.pipe(
  v.object({
    __head: v.pipe(
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

    __device: v.pipe(NFCSchema, safeDefine.setComponent(AudioFileComponent)),
  }),
  actions.providers.patch([AudioDataService]),
);
