import {
  Component,
  computed,
  inject,
  Injector,
  viewChild,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';

import {
  AudioService,
  AudioState,
  AudioStream,
} from '../../service/audio/audio.service';

import { AsrService, getFileTimestamp } from '../../service/asr.service';
import { PurePipe } from '@cyia/ngx-common/pipe';
import { SRTGenerateOptions } from '@@web-common';
import { CdkMenuItem, CdkMenuTrigger, CdkMenu } from '@angular/cdk/menu';
import { FormDialogService } from '@piying-lib/angular-daisyui/overlay';
import dayjs from 'dayjs';
import * as v from 'valibot';
import {
  actions,
  asVirtualGroup,
  NFCSchema,
  setComponent,
} from '@piying/view-angular-core';
import { AudioDataService } from '../../service/audio/audio-router.service';
@Component({
  selector: 'audio-device',
  templateUrl: './component.html',
  imports: [
    MatTooltipModule,
    NgTemplateOutlet,
    DatePipe,
    KeyValuePipe,
    PurePipe,
    CdkMenuItem,
    CdkMenuTrigger,
    CdkMenu,
  ],
  providers: [AudioService],
})
export class AudioDeviceComponent {
  static __version = 2;
  templateRef = viewChild('templateRef');
  dataService = inject(AudioDataService);
  #audioService = inject(AudioService);
  #activateRoute = inject(ActivatedRoute);
  #id$$ = toSignal<string>(
    this.#activateRoute.params.pipe(map((item) => item['id'])),
  );
  isReadonly$$ = toSignal<boolean>(
    this.#activateRoute.data.pipe(map((item) => item['readonly'])),
  );
  input = this.#audioService.create('input');
  output = this.#audioService.create('output');
  #asrService = inject(AsrService);
  readonly READY_STATUS = AudioState.READY;
  workingHint$$ = computed(() => {
    const list = [];
    if (this.input.start$()) {
      list.push('麦克风');
    }
    if (this.output.start$()) {
      list.push('扬声器');
    }
    if (list.length) {
      return `${list.join('/')}工作中`;
    }
    return '';
  });
  async start(control: AudioStream) {
    control.start();
  }
  stop(control: AudioStream) {
    control.stop();
  }

  exportSrt(options: Partial<SRTGenerateOptions>) {
    this.#asrService.exportSrt({ id: this.#id$$()!, options: options });
  }
  ngOnDestroy(): void {
    this.input.stop();
    this.output.stop();
  }
  reverseList = <T extends any[]>(list: T) => {
    return list.slice().reverse();
  };
  #confirm = inject(FormDialogService);
  #injector = inject(Injector);
  async saveAbove(item: any) {
    const savedItem = this.dataService.current$$().list$$();
    const index = savedItem.findIndex((chunkItem) => chunkItem.id === item.id);
    const ref = await this.#confirm.open({
      title: `归档${index + 1}项`,
      schema: v.pipe(
        v.object({
          __range: v.pipe(
            NFCSchema,
            setComponent('common-data'),
            actions.inputs.patch({
              content: `${dayjs(savedItem[0].range![0]).format('YYYY-MM-DD HH:mm')}->${dayjs(savedItem[index].range![1]).format('YYYY-MM-DD HH:mm')}`,
            }),
            v.title('时间范围'),
            actions.wrappers.patch(['label-wrapper']),
            actions.props.patch({ labelPosition: 'top' }),
          ),
          title: v.pipe(v.string(), v.title(`归档标题`)),
        }),

        asVirtualGroup(),
        setComponent('object'),
      ),
      value: { title: `[归档]${getFileTimestamp()}` },
      injector: this.#injector,
      async applyValue(value) {
        return value;
      },
    });
    if (!ref) {
      return;
    }
    this.#asrService
      .archiveChunk({
        id: this.#id$$()!,
        data: { id: item.id, title: ref.title },
      })
      .then(() => {
        this.dataService.current$$().updateList();
      });
  }
  deleteItem(item: any) {
    this.#asrService
      .deleteChunkItem({ id: this.#id$$()!, chunkId: item.id })
      .then(() => {
        this.dataService.current$$().updateList();
      });
  }
}
