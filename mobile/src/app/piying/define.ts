import { PiyingViewGroup, typedComponent } from '@piying/view-angular';
import { PresetDefine } from '@piying-lib/angular-daisyui/preset';
import { StrOrTemplateComponent } from '@piying-lib/angular-core';
import { DialogSelectActions } from '@@web-common';
export const safeDefine = typedComponent({
  ...PresetDefine,
  types: {
    ...PresetDefine.types,
    intersect: { type: PiyingViewGroup },
    tuple: { type: PiyingViewGroup },
    'intersect-group': { type: PiyingViewGroup },
    select: {
      type: StrOrTemplateComponent,
      actions: DialogSelectActions,
    },
  },
  wrappers: {
    ...PresetDefine.wrappers,
  },
});
export const FieldGlobalConfig = safeDefine.define;
