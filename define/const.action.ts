import * as v from 'valibot';
import { renderConfig } from '@piying/view-angular-core';
export const ReadOnlyIdFn = (id: v.BaseSchema<any, any, any>) =>
  v.pipe(v.optional(id), renderConfig({ hidden: true }));
export const ReadOnlyId = v.pipe(
  v.optional(v.string()),
  renderConfig({ hidden: true }),
);
