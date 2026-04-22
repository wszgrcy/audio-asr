import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { PiDialogContainer } from '../component/dialog/component';
import { FieldGlobalConfig } from '../define';
import * as v from 'valibot';
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  #dialog = inject(Dialog);
  #options = {
    fieldGlobalConfig: FieldGlobalConfig,
  };

  openDialog<T extends v.BaseSchema<any, any, any>, ReturnValue>(data: {
    title: string;
    schema: T;
    value?: any;
    applyValue?: (value: v.InferOutput<T>) => Promise<ReturnValue>;
  }) {
    return this.#dialog.open<ReturnValue>(PiDialogContainer, {
      data: { ...data, options: this.#options },
      maxHeight: '80%',
    });
  }
}
