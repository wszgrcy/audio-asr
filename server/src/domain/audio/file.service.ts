import { OpenAI } from 'openai';
import { Subject } from 'rxjs';
import { v4 } from 'uuid';
import {
  ITranslationConfig,
  OpenAITranslationService,
  TranslateConfigToken,
} from './translation.service';
import { inject, Injector } from 'static-injector';
export type FileCallback = (data: { type: string; value: any }) => void;
type FileAudioConfig = {
  file: {
    audio: {
      baseURL: string;
      apiKey?: string;
      model?: string;
      language?: string;
    };
    translate: {
      enable: boolean;
      value?: {
        baseURL: string;
        apiKey?: string;
        model: string;
        target: string[];
      };
    };
  };
};
/**
 * 用于处理整个音频文件的上传和转译
 * 与StreamAudioService不同，它不需要处理流式chunk
 */
export class FileAudioService {
  #injector = inject(Injector);

  /**
   * 处理整个音频文件
   * @param filePath 音频文件路径
   * @param callback 回调函数
   */
  async processBuffer(data: FormData, fileAudioConfig: FileAudioConfig) {
    const subject = new Subject<{ type: string; value: any }>();

    const audioConfig = fileAudioConfig.file;
    const fileBuffer = data.get('file')! as any as File;
    try {
      (async () => {
        try {
          const op = new OpenAI({
            baseURL: audioConfig.audio.baseURL,
            apiKey: audioConfig.audio.apiKey ?? ' ',
          });

          const start = performance.now();
          const transcription = await op.audio.transcriptions.create({
            file: fileBuffer,
            model: audioConfig.audio.model ?? 'whisper',
            response_format: 'verbose_json',
            language: audioConfig.audio.language,
          });
          console.log('音频转写用时:', performance.now() - start, 'ms');
          const list = transcription.segments!.map((item) => {
            return {
              id: v4(),
              type: 'output',
              range: [item.start * 1000, item.end * 1000],
              origin: item.text,
            };
          });
          subject.next({ type: 'origin', value: list });
          // text start end
          transcription.segments!;
          if (audioConfig.translate.enable && audioConfig.translate.value) {
            const targetLanguages = audioConfig.translate.value.target;
            if (!targetLanguages) {
              return;
            }
            const translationService = Injector.create({
              providers: [
                OpenAITranslationService,
                {
                  provide: TranslateConfigToken,
                  useValue: {
                    apiKey: audioConfig.translate.value!.apiKey,
                    baseURL: audioConfig.translate.value!.baseURL,
                    model: audioConfig.translate.value!.model,
                  } as ITranslationConfig,
                },
              ],
              parent: this.#injector,
            }).get(OpenAITranslationService);
            const translateStart = performance.now();
            const translations = await Promise.all(
              targetLanguages.flatMap((language) => {
                return list.map(async (item) => {
                  try {
                    const translatedText = await translationService.translate(
                      item.origin,
                      language,
                      audioConfig.audio.language!,
                    );
                    subject.next({
                      type: 'translate',
                      value: {
                        id: item.id,
                        translateText: { [language]: translatedText },
                      },
                    });
                  } catch (error) {
                    console.error(
                      `翻译失败:${item.origin} (${language} => ${audioConfig.audio.language!}):`,
                      error,
                    );
                    console.error(`转译段翻译失败 (${item.origin}):`, error);
                    subject.next({
                      type: 'error',
                      value: {
                        id: item.id,
                        error: `翻译失败：${(error as Error).message}`,
                      },
                    });
                  }
                });
              }),
            );
            console.log('翻译用时:', performance.now() - translateStart, 'ms');
            // console.log(translations);
          }
          subject.complete();
        } catch (error) {
          console.error('音频转写或处理失败:', error);
          subject.next({
            type: 'error',
            value: { error: (error as Error).message },
          });
        }
      })();

      // 翻译完成
    } catch (error) {
      console.error('处理音频文件时出错:', error);
      throw error;
    }
    return subject;
  }
}
