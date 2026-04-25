import path from 'path';
import { loadTranslations } from '@cyia/localize';
export function loadI18n() {
  let locale = Intl.DateTimeFormat().resolvedOptions().locale;
  let lang = locale.startsWith('zh') ? 'extract' : 'extract.en';
  try {
    const filePath = path.join(__dirname, `./i18n/${lang}.json`);
    loadTranslations(require(filePath));
  } catch (error) {
    console.warn(error);
    loadTranslations({});
  }
}
loadI18n();
