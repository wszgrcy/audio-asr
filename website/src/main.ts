import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import '@valibot/i18n/zh-CN';
import { setGlobalConfig } from 'valibot';
const browserLanguage = navigator.language;
if (browserLanguage.startsWith('zh')) {
  setGlobalConfig({ lang: 'zh-CN' });
}
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
