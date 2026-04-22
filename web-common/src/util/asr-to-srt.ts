import { LanguageList } from '@@ref/define/src/const/language';
import { ChunkListItemType } from '@@ref/define/src/define/asr';
import dayjs from 'dayjs';

/** SRT 字幕生成选项 */
export interface SRTGenerateOptions {
  originLanguage: string;
  origin?: boolean;
  translate?: string[] | boolean;
  mixed?: {
    format: 'origin+translate' | 'translate+origin';
    language: string[] | true;
  }[];
}

/** SRT 字幕结果 */
export interface SRTResult {
  type: 'origin' | 'translate' | 'mixed';
  languages: string[];
  value: string;
}

/**
 * 将 ASR 数据转换为 SRT 字幕格式
 */
export function asrToSRT(
  chunkList: ChunkListItemType[],
  options: SRTGenerateOptions,
): SRTResult[] {
  const results: SRTResult[] = [];
  const { originLanguage } = options;

  // 生成源文本字幕
  if (options.origin !== false) {
    const srt = chunkList
      .map((item, index) =>
        formatSRTChunk(index + 1, item.range, item.origin ?? ''),
      )
      .join('\n');
    results.push({ type: 'origin', languages: [originLanguage], value: srt });
  }

  // 生成翻译字幕
  if (options.translate) {
    const languages =
      options.translate === true
        ? LanguageList.map((l) => l.value)
        : options.translate;

    if (languages) {
      languages.forEach((lang) => {
        const srt = chunkList
          .map((item, index) => {
            const text = item.translateText?.[lang];
            if (!text) return null;
            return formatSRTChunk(index + 1, item.range, text);
          })
          .filter((x): x is string => !!x)
          .join('\n');

        if (srt) {
          results.push({ type: 'translate', languages: [lang], value: srt });
        }
      });
    }
  }

  // 生成混合字幕
  if (options.mixed) {
    options.mixed.forEach(({ format, language }) => {
      const languages = Array.isArray(language)
        ? language
        : language === true
          ? LanguageList.map((l) => l.value)
          : [language];

      languages.forEach((lang) => {
        let mixedLanguages: string[];
        if (format === 'origin+translate') {
          mixedLanguages = [originLanguage, lang];
        } else {
          mixedLanguages = [lang, originLanguage];
        }
        const srt = chunkList
          .map((item, index) => {
            const translateText = item.translateText?.[lang];
            if (!translateText) return null;

            let mixedText: string;
            if (format === 'origin+translate') {
              mixedText = `${item.origin ?? ''}\n${translateText}`;
            } else {
              mixedText = `${translateText}\n${item.origin ?? ''}`;
            }

            return formatSRTChunk(index + 1, item.range, mixedText);
          })
          .filter((x): x is string => !!x)
          .join('\n');

        if (srt) {
          results.push({
            type: 'mixed',
            languages: mixedLanguages,
            value: srt,
          });
        }
      });
    });
  }

  return results;
}

function formatSRTChunk(
  index: number,
  range: [number, number] | undefined,
  text: string,
): string {
  const [start, end] = range ?? [0, 0];
  const startSRT = formatTime(start);
  const endSRT = formatTime(end);

  return `${index}\n${startSRT} --> ${endSRT}\n${text}`;
}

function formatTime(ms: number): string {
  return dayjs(ms).format('HH:mm:ss,SSS');
}
