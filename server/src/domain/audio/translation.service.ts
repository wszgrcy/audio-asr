import { OpenAI } from 'openai';
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';
import { inject, InjectionToken } from '@angular/core';

/**
 * 翻译服务配置
 */
export interface ITranslationConfig {
  baseURL: string;
  apiKey?: string;
  model: string;
}

export interface ITranslationService {
  translate(
    input: string,
    sourceLanguage: string,
    target: string,
  ): Promise<string>;
}
export const TranslateConfigToken = new InjectionToken<ITranslationConfig>(
  'TranslateConfigToken',
);

export class OpenAITranslationService implements ITranslationService {
  config = inject(TranslateConfigToken);
  op;
  constructor() {
    this.op = new OpenAI({
      baseURL: this.config.baseURL,
      apiKey: this.config.apiKey ?? ' ',
      dangerouslyAllowBrowser: true,
    });
  }

  async translate(
    input: string,
    sourceLanguage: string,
    target: string,
  ): Promise<string> {
    const jsonSchema = toJsonSchema(
      v.object({
        description: v.literal(`${sourceLanguage} => ${target}`),
        source: v.literal(input),
        target: v.string(),
      }),
    );

    const result = await this.op.chat.completions.create({
      model: this.config.model,
      stream: false,
      messages: [
        {
          role: 'assistant',
          content: `请将输入带待翻译文本从**${sourceLanguage}**翻译为**${target}**。 
## 输入格式
待翻译待翻译文本
## 输出格式 
${jsonSchema}`,
        },
        { role: 'user', content: `${input}` },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          schema: jsonSchema as any,
          name: '',
        },
      },
    });

    const response = JSON.parse(result.choices[0].message.content!) as {
      target: string;
    };
    return response.target;
  }
}
