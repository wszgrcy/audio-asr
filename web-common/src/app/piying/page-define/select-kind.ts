import * as v from 'valibot';
import { formConfig, NFCSchema } from '@piying/view-angular-core';
import { actions } from '@piying/view-angular';
import { Router } from '@angular/router';
import { computed } from '@angular/core';
import { safeDefine } from '../define';
import {
  FormDialogService,
  ToastService,
} from '@piying-lib/angular-daisyui/overlay';

import {
  AudioToTextDefine,
  StreamAudioConfig,
} from '@@ref/define/src/define/asr-config';

import {
  DeviceService,
  AsrService,
  GlobalConfigService,
  MediaParseToken,
  FileFilterToken,
} from '@@web-common';

import srtParser2 from 'srt-parser-2';
import { v4 } from 'uuid';

export const SelectKindPage = v.pipe(
  v.tuple([
    v.pipe(
      v.object({
        // start: BackButton,
        // end: v.pipe(
        //   NFCSchema,
        //   safeDefine.setComponent('button', (actions) => {
        //     return [
        //       actions.inputs.patch({
        //         content: {
        //           icon: { fontIcon: 'menu' },
        //         },
        //         style: 'ghost',
        //         shape: 'circle',
        //       }),
        //     ];
        //   }),
        // ),
        center: v.pipe(
          NFCSchema,
          safeDefine.setComponent('common-data', (actions) => {
            return [actions.inputs.patch({ content: '选择处理' })];
          }),

          // todo 点击后菜单
        ),
      }),
      safeDefine.setComponent('navbar'),
      actions.class.top('sticky top-0 bg-base-200 z-9'),
    ),
    v.pipe(
      v.tuple([
        v.pipe(
          NFCSchema,
          safeDefine.setComponent('button', (actions) => {
            return [
              actions.inputs.patch({
                content: { title: '使用上次设备', icon: { fontIcon: 'mic' } },
                color: 'secondary',
                size: 'lg',
              }),
              actions.inputs.patchAsync({
                disabled: (field) => {
                  const device = field.injector.get(DeviceService);
                  return computed(() => {
                    return (
                      device.lastDevice.isLoading() ||
                      !device.lastDevice.value()
                    );
                  });
                },
                clicked: (field) => {
                  return async () => {
                    const device = field.injector.get(DeviceService);
                    const router = field.injector.get(Router);
                    const item = await device.lastDevice.value()!;
                    router.navigateByUrl(`/item/audio-device/${item.id}`);
                  };
                },
              }),
            ];
          }),
        ),
        v.pipe(
          NFCSchema,
          safeDefine.setComponent('button', (actions) => {
            return [
              actions.inputs.patch({
                content: { title: '使用设备', icon: { fontIcon: 'mic' } },
                color: 'primary',
                size: 'lg',
              }),
              actions.inputs.patchAsync({
                clicked: (field) => {
                  return async () => {
                    const formDialog = field.injector.get(FormDialogService);
                    // let remote = field.injector.get(RemoteService);
                    // let trpcClient = (await remote.trpcClient)();
                    const asrService = field.injector.get(AsrService);
                    const configService =
                      field.injector.get(GlobalConfigService);
                    const config = await configService.getConfig$$();
                    const result = await formDialog.open({
                      class: 'page-form-dialog',
                      title: '设置参数',
                      schema: StreamAudioConfig,
                      cancelButton: '取消',
                      value: {
                        device: {
                          input: {
                            audio: config.defaultAudioConfig,
                            translate: config.defalutTranslateConfig,
                          },
                          output: {
                            audio: config.defaultAudioConfig,
                            translate: config.defalutTranslateConfig,
                          },
                        } as any,
                      },
                      async applyValue(value) {
                        return value;
                      },
                      injector: field.injector,
                    });
                    if (!result) {
                      return;
                    }

                    asrService
                      .save({ source: 'audio-device', config: result as any })
                      .then((item) => {
                        return field.injector
                          .get(Router)
                          .navigateByUrl(`/item/audio-device/${item.id}`);
                      });
                  };
                },
              }),
            ];
          }),
        ),
        v.pipe(
          NFCSchema,
          safeDefine.setComponent('button', (actions) => {
            return [
              actions.inputs.patch({
                content: {
                  title: '本地文件',
                  icon: { fontIcon: 'attach_file' },
                },
                size: 'lg',
              }),
              actions.inputs.patchAsync({
                clicked: (field) => {
                  return async () => {
                    const configService =
                      field.injector.get(GlobalConfigService);
                    const config = await configService.getConfig$$();
                    let file: File | undefined;
                    const resultConfig = await field.injector
                      .get(FormDialogService)
                      .open({
                        class: 'page-form-dialog',
                        cancelButton: '取消',
                        injector: field.injector,
                        schema: v.pipe(
                          v.intersect([
                            v.pipe(
                              v.object({
                                filePath: v.pipe(
                                  v.string(),
                                  formConfig({
                                    disabled: true,
                                    disabledValue: 'reserve',
                                  }),
                                ),
                                __btn: v.pipe(
                                  NFCSchema,
                                  safeDefine.setComponent(
                                    'file-input-button',
                                    (actions) => {
                                      return [
                                        actions.inputs.patch({
                                          shape: 'circle',
                                          style: 'ghost',
                                          content: {
                                            icon: { fontIcon: 'attach_file' },
                                          },
                                          accept:
                                            field.injector.get(FileFilterToken)
                                              .audiovideo,
                                        }),
                                        actions.inputs.patchAsync({
                                          clicked: (field) => {
                                            return async (value) => {
                                              file = value as any;
                                              field
                                                .get(['..', 'filePath'])!
                                                .form.control!.updateValue(
                                                  (value as File).name,
                                                );
                                            };
                                          },
                                        }),
                                      ];
                                    },
                                  ),
                                ),
                              }),
                              v.title('文件路径'),

                              actions.wrappers.patch([
                                'label-wrapper',
                                {
                                  type: 'div',
                                  attributes: { class: 'flex items-center' },
                                },
                              ]),
                              actions.props.patch({ labelPosition: 'top' }),
                            ),
                            v.object({
                              file: AudioToTextDefine,
                            }),
                          ]),
                        ),

                        title: '设置',
                        value: {
                          file: {
                            audio: config.defaultAudioConfig,
                            translate: config.defalutTranslateConfig,
                          },
                        } as any,
                        // context: {},
                        async applyValue(value) {
                          return value;
                        },
                      });

                    if (!resultConfig || !file) {
                      return;
                    }

                    const asrService = field.injector.get(AsrService);
                    const saveResult = await asrService.save({
                      source: 'audio-file',
                      config: {
                        ...resultConfig,
                        filePath: resultConfig.filePath,
                      } as any,
                      title: resultConfig.filePath,
                    });
                    const fileAudio = field.injector.get(MediaParseToken);
                    try {
                      await fileAudio.audiovideo(file, saveResult);
                    } catch (error) {
                      field.injector.get(ToastService).add({
                        message:
                          error instanceof Error
                            ? error.message
                            : JSON.stringify(error),
                        type: 'error',
                      });
                      throw error;
                    }

                    await field.injector
                      .get(Router)
                      .navigateByUrl(
                        `/item/${saveResult.source}/${saveResult.id}`,
                      );
                  };
                },
              }),
            ];
          }),
        ),
        v.pipe(
          NFCSchema,
          safeDefine.setComponent('button', (actions) => {
            return [
              actions.inputs.patch({
                content: {
                  title: '字幕文件',
                  icon: { fontIcon: 'subtitles' },
                },
                size: 'lg',
              }),
              actions.inputs.patchAsync({
                clicked: (field) => {
                  return async () => {
                    const configService =
                      field.injector.get(GlobalConfigService);
                    const config = await configService.getConfig$$();
                    let file: File | undefined;
                    const resultConfig = await field.injector
                      .get(FormDialogService)
                      .open({
                        class: 'page-form-dialog',
                        cancelButton: '取消',
                        injector: field.injector,
                        // 文件设置需要用本地的
                        schema: v.pipe(
                          v.intersect([
                            v.pipe(
                              v.object({
                                filePath: v.pipe(
                                  v.string(),
                                  formConfig({
                                    disabled: true,
                                    disabledValue: 'reserve',
                                  }),
                                ),
                                __btn: v.pipe(
                                  NFCSchema,
                                  safeDefine.setComponent(
                                    'file-input-button',
                                    (actions) => {
                                      return [
                                        actions.inputs.patch({
                                          shape: 'circle',
                                          style: 'ghost',
                                          content: {
                                            icon: { fontIcon: 'attach_file' },
                                          },
                                          accept:
                                            field.injector.get(FileFilterToken)
                                              .srt,
                                        }),
                                        actions.inputs.patchAsync({
                                          clicked: (field) => {
                                            return async (value) => {
                                              console.log(value);
                                              file = value as any;
                                              field
                                                .get(['..', 'filePath'])!
                                                .form.control!.updateValue(
                                                  (value as File).name,
                                                );
                                            };
                                          },
                                        }),
                                      ];
                                    },
                                  ),
                                ),
                              }),
                              v.title('文件路径'),

                              actions.wrappers.patch([
                                'label-wrapper',
                                {
                                  type: 'div',
                                  attributes: { class: 'flex items-center' },
                                },
                              ]),
                              actions.props.patch({ labelPosition: 'top' }),
                            ),
                            v.object({
                              file: AudioToTextDefine,
                            }),
                          ]),
                        ),

                        title: '设置',
                        value: {
                          file: {
                            audio: config.defaultAudioConfig,
                            translate: config.defalutTranslateConfig,
                          },
                        } as any,
                        // context: {},
                        async applyValue(value) {
                          return value;
                        },
                      });

                    if (!resultConfig || !file) {
                      return;
                    }

                    const asrService = field.injector.get(AsrService);
                    // todo 字幕可以直接解析保存
                    const titleContent = await field.injector
                      .get(MediaParseToken)
                      .subtitle(file);
                    const parser = new srtParser2();
                    const srt_array = parser.fromSrt(titleContent);
                    const saveResult = await asrService.save2({
                      source: 'subtitle',
                      data: {
                        config: {
                          ...resultConfig,
                          filePath: resultConfig.filePath,
                        } as any,
                        chunkList: srt_array.map((item) => {
                          return {
                            id: v4(),
                            range: [
                              item.startSeconds * 1000,
                              item.endSeconds * 1000,
                            ],
                            type: 'input',
                            status: 1,
                            origin: item.text,
                          };
                        }),
                      },
                      title: resultConfig.filePath,
                    });
                    // todo 英文翻译
                    try {
                    } catch (error) {
                      field.injector.get(ToastService).add({
                        message:
                          error instanceof Error
                            ? error.message
                            : JSON.stringify(error),
                        type: 'error',
                      });
                      throw error;
                    }

                    await field.injector
                      .get(Router)
                      .navigateByUrl(
                        `/item/${saveResult.source}/${saveResult.id}`,
                      );
                  };
                },
              }),
            ];
          }),
        ),
      ]),
      actions.wrappers.patch(['div']),
      // safeDefine.setComponent('content'),
      actions.class.top('p-4 grid gap-4'),
    ),
  ]),
);
