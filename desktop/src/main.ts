import { loadTranslations } from '@cyia/localize';
console.log(process.env.WORK_PLATFORM);
console.log(process.env.NODE_ENV);

let locale = Intl.DateTimeFormat().resolvedOptions().locale;
let lang = locale.startsWith('zh') ? 'extract' : 'extract.en';

fetch(`./assets/i18n/${lang}.json`).then(async (value) => {
  loadTranslations(await value.json());
  return import('./bootstrap')
});
