import {
  OpenAITranslationService,
  TranslateConfigToken,
} from '@@domain/audio/translation.service';
import { ChunkListItemType } from '@@ref/define/src/define/asr';
import { inject, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { promise as fastq } from 'fastq';
import { TranslateConfigValueType } from '@@ref/define/src/define/asr-config';

@Injectable({
  providedIn: 'root',
})
export class TranslateSubtitleService {
  #injector = inject(Injector);
  translate(
    config: TranslateConfigValueType,
    source: string,
    list: ChunkListItemType[],
  ) {
    const subject = new Subject<{ type: string; value: any }>();
    const injector = Injector.create({
      providers: [
        { provide: TranslateConfigToken, useValue: config },
        OpenAITranslationService,
      ],
    });
    const translateService = injector.get(OpenAITranslationService);

    const queue = fastq(
      async (task: { item: ChunkListItemType; target: string }) => {
        const result = await translateService.translate(
          task.item.origin!,
          source,
          task.target,
        );
        subject.next({
          type: 'translate',
          value: {
            id: task.item.id,
            target: task.target,
            content: result,
          },
        });
      },
      1,
    );

    queue.drain = () => {
      subject.complete();
    };

    for (const item of list) {
      for (const target of config.target!) {
        queue.push({ item, target });
      }
    }

    return subject;
  }
}
