import { PiyingViewGroup, typedComponent } from '@piying/view-angular';
import { PresetDefine } from '@piying-lib/angular-daisyui/preset';
import { StrOrTemplateComponent } from '@piying-lib/angular-core';
import { DialogSelectActions } from './preset/dialog-select-actions';

export const safeDefine = typedComponent({
  ...PresetDefine,
  types: {
    ...PresetDefine.types,
    intersect: { type: PiyingViewGroup },
    tuple: { type: PiyingViewGroup },
    select: {
      type: StrOrTemplateComponent,
      actions: DialogSelectActions,
    },
    'intersect-group': { type: PiyingViewGroup },
  },
  wrappers: {
    ...PresetDefine.wrappers,
  },
});
export const FieldGlobalConfig = safeDefine.define;
