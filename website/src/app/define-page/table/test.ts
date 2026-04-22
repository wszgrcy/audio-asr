import { HttpClient } from '@angular/common/http';
import {
  actions,
  NFCSchema,
  setAlias,
  setComponent,
} from '@piying/view-angular-core';
import { firstValueFrom } from 'rxjs';
import * as v from 'valibot';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../service/toast.service';
import { OpenApiService } from '../../service/openapi.service';
import { GroupDefine, QueryBuilderService } from '@project/define/web';

const ButtonDefine = v.pipe(NFCSchema, setComponent('button'));
export const TestPage = v.object({
  apikey: v.pipe(
    v.tuple([
      v.pipe(v.string(), v.title('apikey')),
      v.pipe(
        NFCSchema,
        setComponent('button'),
        actions.inputs.patch({
          content: '测试',
        }),
        actions.inputs.patchAsync({
          clicked: (field) => {
            return async () => {
              const value = field.get(['..', 0])?.form.control?.value;
              const result = await firstValueFrom(
                field.injector
                  .get(HttpClient)
                  .get(`${environment.prefix}/open/test/demo`, {
                    headers: { authorization: `Bearer ${value}` },
                  }),
              );
              if (result) {
                field.injector
                  .get(ToastService)
                  .add('测试成功', { type: 'success' });
              }
            };
          },
        }),
      ),
      v.pipe(
        NFCSchema,
        setComponent('button'),
        actions.inputs.patch({
          content: '测试查询带标签',
        }),
        actions.inputs.patchAsync({
          clicked: (field) => {
            return async () => {
              const value = field.get(['..', 0])?.form.control?.value;
              const result = await firstValueFrom(
                field.injector.get(HttpClient).post(
                  `${environment.prefix}/open/docVector/query`,
                  { content: 'abc', tags: ['querytag'] },
                  {
                    headers: { authorization: `Bearer ${value}` },
                  },
                ),
              );
              if (result) {
                field.injector
                  .get(ToastService)
                  .add('测试成功', { type: 'success' });
              }
            };
          },
        }),
      ),
      v.pipe(
        NFCSchema,
        setComponent('button'),
        actions.inputs.patch({
          content: '测试查询标签',
        }),
        actions.inputs.patchAsync({
          clicked: (field) => {
            return async () => {
              const value = field.get(['..', 0])?.form.control?.value;
              const result = await firstValueFrom(
                field.injector.get(HttpClient).post(
                  `${environment.prefix}/open/docVector/tags`,
                  {},
                  {
                    headers: { authorization: `Bearer ${value}` },
                  },
                ),
              );
              console.log(result);
            };
          },
        }),
      ),
    ]),
  ),
  testQueue: v.pipe(
    ButtonDefine,
    actions.inputs.patch({ content: '测试队列' }),
    actions.inputs.patchAsync({
      clicked: (field) => {
        return () => {
          const value = field.get(['..', 'apikey', 0])?.form.control?.value;
          console.log(value);

          field.injector
            .get(OpenApiService)
            .convertUrlDoc(
              { data: { test: 1 } },
              {
                headers: { authorization: `Bearer ${value}` },
              },
            )
            .subscribe((xx) => {
              console.log(xx);
            });
        };
      },
    }),
  ),

  queryBuilder: v.pipe(
    v.tuple([
      v.pipe(
        GroupDefine,
        setAlias('qb'),
        // actions.hooks.merge({
        //   allFieldsResolved: (field) => {
        //     field.form.root.valueChanges.subscribe((data) => {
        //       console.log('值变更', data);
        //     });
        //   },
        // }),
      ),
      v.pipe(
        NFCSchema,
        setComponent('button'),
        actions.inputs.patch({ content: '提交' }),
        actions.inputs.patchAsync({
          clicked: (field) => {
            return () => {
              console.log(field.get(['@qb'])?.form.control?.value);
              console.log(field.injector.get(QueryBuilderService).getField());
            };
          },
        }),
      ),
    ]),
    actions.providers.patch([QueryBuilderService]),
    actions.hooks.merge({
      allFieldsResolved: (field) => {
        field.injector
          .get(QueryBuilderService)
          .setFieldList(['list1', 'list2']);
        field.injector
          .get(QueryBuilderService)
          .setRootField(field.get(['@qb'])!);
      },
    }),
  ),

  addUrlQueue: v.pipe(
    NFCSchema,
    setComponent('button'),
    actions.inputs.patch({
      content: '测试添加',
    }),
    actions.inputs.patchAsync({
      clicked: (field) => {
        return async () => {
          // trpc.devUse.addUrlQueue.mutate({}).then((a) => {
          //   console.log('执行完成', a);
          // });
        };
      },
    }),
  ),
});
