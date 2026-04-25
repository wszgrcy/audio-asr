export const locale = Intl.DateTimeFormat().resolvedOptions().locale;
export const localeKey = locale.startsWith('zh') ? 'zh' : 'en';
