import { Injectable, signal } from '@angular/core';

export type Button<T> = {
  close?: () => Promise<T>;
};

type UnionCloseReturns<T extends readonly any[]> = T extends readonly []
  ? never
  : {
      [K in keyof T]: T[K] extends { close?: (...args: any[]) => infer R }
        ? R
        : never;
    }[number];

export interface AlertItem<BList extends Button<any>[] = any[]> {
  id: number;
  title: string;
  message: string;
  buttons: BList;
  close: (value: any) => Promise<any>;
  modal?: boolean;
}
const Undefined$$ = Promise.resolve(undefined);
@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  readonly #list$ = signal<AlertItem[]>([]);
  private nextId = 0;

  list$$ = this.#list$.asReadonly();

  open<TB extends Button<any>[]>(options: Omit<AlertItem<TB>, 'id' | 'close'>) {
    const id = this.nextId++;
    const p = Promise.withResolvers<UnionCloseReturns<TB>>();
    this.#addToList({
      ...options,
      id,
      close: async (index: number | undefined) => {
        (index === undefined
          ? Undefined$$
          : options.buttons[index].close
            ? options.buttons[index].close()
            : Undefined$$
        ).then((value) => {
          p.resolve(value);
          this.remove(id);
        });
      },
    });

    return p.promise;
  }
  #addToList(item: AlertItem) {
    this.#list$.update((current) => [...current, item]);
  }

  remove(id: number): void {
    this.#list$.update((current) => current.filter((item) => item.id !== id));
  }
}
