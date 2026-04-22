import { signal } from '@angular/core';
import { _PiResolvedCommonViewFieldConfig } from '@piying/view-angular-core';

export class QueryBuilderService {
  fieldList$$ = signal<string[]>([]);
  fieldSet = new Set<_PiResolvedCommonViewFieldConfig>([]);
  rootField!: _PiResolvedCommonViewFieldConfig;
  setRootField(field: _PiResolvedCommonViewFieldConfig) {
    this.rootField = field;
  }
  setFieldList(list: string[]) {
    this.fieldList$$.set(list);
  }
  addField(field: _PiResolvedCommonViewFieldConfig) {
    this.fieldSet.add(field);
  }
  removeField(field: _PiResolvedCommonViewFieldConfig) {
    this.fieldSet.delete(field);
  }
  getField() {
    const rootLength = this.rootField.form.control!.valuePath;
    const list = this.fieldSet.values().map((field) => {
      const valuePath = field.form.control!.valuePath.slice(rootLength.length);
      const title = field.props()?.['title'];
      const actionList = [`mapToBuilder({list:${JSON.stringify(valuePath)}})`];
      const wrapperList = [];
      if (typeof title === 'string') {
        actionList.push(`v.title(${title})`);
      }
      const ruleDefine = field.get(['@rule']);
      if (ruleDefine!.form.control!.value.optional) {
        const value = ruleDefine!.form.control!.value.value!;
        if (value === undefined) {
          wrapperList.push((item: string) => {
            return `v.optional(${item})`;
          });
          wrapperList.push((item: string) => {
            return `v.optional(${item},${value})`;
          });
        } else {
        }
      }
      const schemaStr = wrapperList.reduce((str, item) => {
        return item(str);
      }, 'v.any()');
      if (actionList.length) {
        return `v.pipe(${schemaStr},${actionList.join(',')}) `;
      }
      return `v.pipe(${schemaStr})`;
    });

    return `v.tuple([${[...list].join(',')}])`;
  }
}
