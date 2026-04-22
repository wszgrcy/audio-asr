import { PiyingViewGroup, typedComponent } from '@piying/view-angular';
import { PresetDefine } from '@piying-lib/angular-daisyui/preset';
import { DownloadButtonFCC } from '../component/download-button/component';
import { StrOrTemplateComponent } from '@piying-lib/angular-core';
import { DialogSelectActions } from '@@web-common';
import { FileInputButtonNFCC } from '../component/file-input-button/component';

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
    // 选择文件用
    'file-input-button': { type: FileInputButtonNFCC },
    // 下载用
    'download-button': { type: DownloadButtonFCC },
  },
  wrappers: {
    ...PresetDefine.wrappers,
  },
});
export const FieldGlobalConfig = safeDefine.define;
