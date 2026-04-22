import * as NFCCGroup from '@piying-lib/angular-daisyui/non-field-control';
import * as FCCGroup from '@piying-lib/angular-daisyui/field-control';
import * as FGCGroup from '@piying-lib/angular-daisyui/field-group';
import { reflectComponentType, Type } from '@angular/core';
import { PiViewConfig, PiyingViewGroup } from '@piying/view-angular';
import { RouterOutlet } from '@angular/router';

import {
  ExtComponentGroup,
  ExtWrapperGroup,
} from '@piying-lib/angular-daisyui/extension';
import * as WrapperGroup from '@piying-lib/angular-daisyui/wrapper';
import { InputFCC } from '@piying-lib/angular-daisyui/field-control';
import { actions, setComponent } from '@piying/view-angular-core';

import { ValidateTooltipbWC } from './component/wrapper/validate-tooltip/component';
import { ThemeControllerNFCC } from './component/theme-controller/component';
import { PasswordInputFCC } from './component/password';
import {
  DivNFCC,
  DivWC,
  StrOrTemplateComponent,
} from '@piying-lib/angular-core';
import { EditGroupFGC } from './component/edit-group/component';
import { FormWC } from './component/wrapper/form/component';
import { CheckboxListFCC } from './component/checkbox-list2';
import { FileInputButtonNFCC } from './component/file-input-button';
import { UnionArrayFGC } from './component/union-array/component';
import { UnionGroupFGC } from './component/union-group';
import { RefWrapper } from './define-page/dev/wrapper/component';
import { ArrayRepeatFAC } from './array/array/array-repeat.component';

const selectorPrefix = 'app-';

const list = [
  ...Object.values(NFCCGroup),
  ...Object.values(FCCGroup),
  ...Object.values(FGCGroup),
  ...Object.values(ExtComponentGroup),
] as Type<any>[];

const types = list.reduce(
  (obj, item) => {
    const result = reflectComponentType(item);
    if (!result) {
      return obj;
    }
    obj[
      result.selector.startsWith(selectorPrefix)
        ? result.selector.slice(selectorPrefix.length)
        : result.selector
    ] = {
      type: item,
    };
    return obj;
  },
  {} as Record<string, any>,
);
const defaultWrapper = [
  ...Object.values(WrapperGroup),
  ...Object.values(ExtWrapperGroup),
].reduce(
  (obj, item) => {
    const result = reflectComponentType(item as any);
    if (!result) {
      return obj;
    }
    obj[
      result.selector.startsWith(selectorPrefix)
        ? result.selector.slice(selectorPrefix.length)
        : result.selector
    ] = {
      type: item,
    };
    return obj;
  },
  {} as Record<string, any>,
);
export const FormDefine = {
  string: {
    actions: [
      setComponent(InputFCC),
      actions.wrappers.set(['label-wrapper', 'validate-tooltip-wrapper']),
      actions.props.patch({
        labelPosition: 'left',
      }),
    ],
  },
  password: {
    actions: [
      setComponent(PasswordInputFCC),
      actions.wrappers.set(['label-wrapper', 'validate-tooltip-wrapper']),
      actions.props.patch({
        labelPosition: 'left',
      }),
    ],
  },
  number: {
    actions: [
      setComponent(InputFCC),
      actions.inputs.set({ type: 'number' }),
      actions.wrappers.set(['label-wrapper', 'validate-tooltip-wrapper']),
    ],
  },
  range: {
    actions: [
      setComponent(FCCGroup.RangeFCC),
      actions.wrappers.set(['label-wrapper']),
    ],
  },
  date: {
    actions: [
      setComponent(InputFCC),
      actions.inputs.set({ type: 'date' }),
      actions.wrappers.set(['label-wrapper']),
    ],
  },
  boolean: {
    actions: [
      setComponent(FCCGroup.CheckboxFCC),
      actions.wrappers.set(['label-wrapper']),
      actions.props.patch({
        labelPosition: 'right',
      }),
    ],
  },
  toggle: {
    actions: [
      setComponent(FCCGroup.ToggleFCC),
      actions.wrappers.set(['label-wrapper']),
      actions.props.patch({
        labelPosition: 'right',
      }),
    ],
  },
  select: {
    actions: [
      setComponent(FCCGroup.SelectFCC),
      actions.wrappers.set(['label-wrapper', 'validate-tooltip-wrapper']),
    ],
  },
  enum: {
    actions: [
      setComponent(FCCGroup.SelectFCC),
      actions.wrappers.set(['label-wrapper']),
      actions.class.component('flex-1'),
    ],
  },
  picklist: {
    actions: [
      setComponent(FCCGroup.SelectFCC),
      actions.wrappers.set(['label-wrapper', 'validate-tooltip-wrapper']),
      actions.inputs.mapAsync((field) => {
        return (data) => {
          return {
            ...data,
            options: data.options ? data.options : field.props()['options'],
          };
        };
      }),
    ],
  },
  radio: {
    actions: [
      setComponent(FCCGroup.RadioFCC),
      actions.wrappers.set(['label-wrapper']),
    ],
  },
  textarea: {
    actions: [
      setComponent(FCCGroup.TextareaFCC),
      actions.wrappers.set(['label-wrapper']),
    ],
  },
  array: {
    actions: [setComponent(PiyingViewGroup)],
  },
  'array-repeat': {
    actions: [setComponent(ArrayRepeatFAC)],
  },
  record: {
    actions: [setComponent(PiyingViewGroup)],
  },
  tuple: {
    actions: [setComponent(PiyingViewGroup)],
  },
  'edit-group': {
    actions: [setComponent(EditGroupFGC)],
  },
  'checkbox-list': {
    actions: [setComponent(CheckboxListFCC)],
  },
  'intersect-group': {
    actions: [setComponent(PiyingViewGroup)],
  },
  union: {
    actions: [setComponent(PiyingViewGroup)],
  },
} as PiViewConfig['types'];

export const FieldGlobalConfig: PiViewConfig = {
  types: {
    ...types,
    ...FormDefine,
    'router-outlet': { type: RouterOutlet },
    object: { type: PiyingViewGroup },
    loose_object: { type: PiyingViewGroup },
    div: {
      type: DivNFCC,
    },
    'common-data': {
      type: StrOrTemplateComponent,
    },

    'theme-controller': {
      actions: [setComponent(ThemeControllerNFCC)],
    },
    'file-input-button': {
      actions: [setComponent(FileInputButtonNFCC)],
    },
    'union-array': {
      actions: [setComponent(UnionArrayFGC)],
    },
    'union-group': {
      actions: [setComponent(UnionGroupFGC)],
    },
  },
  wrappers: {
    ...defaultWrapper,
    div: {
      type: DivWC,
    },
    form: {
      type: FormWC,
    },
    'validate-tooltip-wrapper': {
      type: ValidateTooltipbWC,
    },
    'ref-wrapper': {
      type: RefWrapper,
    },
  },
};
