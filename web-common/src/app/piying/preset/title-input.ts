import { actions, setComponent } from '@piying/view-angular-core';
import * as v from 'valibot';
import { effect, untracked } from '@angular/core';
import { TitleInputFCC } from '../../component/title-input/component';
import { AsrService } from '../../service/asr.service';
import { AudioDataService } from '../../service/audio/audio-router.service';

export const TitleInputDefine = v.pipe(
  v.string(),
  setComponent(TitleInputFCC),
  actions.hooks.merge({
    allFieldsResolved: (field) => {
      const dataService = field.injector.get(AudioDataService);
      effect(
        () => {
          if (
            !dataService.id$() ||
            dataService.current$$().audioItem$$.isLoading()
          ) {
            return;
          }
          const value = dataService.current$$().audioItem$$.value();
          untracked(() => {
            field.form.control!.updateValue(value!.title);
          });
        },
        { injector: field.injector },
      );
      const asr = field.injector.get(AsrService);
      field.form.control?.valueChanges.subscribe(async (newValue) => {
        const value = dataService.current$$().audioItem$$.value();
        if (value?.title !== newValue) {
          await asr.changeTitle({
            id: dataService.id$()!,
            title: newValue,
          });
        }
      });
    },
  }),
  actions.wrappers.set([])
);
