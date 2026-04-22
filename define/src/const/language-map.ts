import { LanguageList } from './language';

export const ZH_languageMap = LanguageList.reduce(
  (obj, item) => {
    obj[item.value] = item.zh;
    return obj;
  },
  {} as Record<string, string>,
);
export const EN_languageMap = LanguageList.reduce(
  (obj, item) => {
    obj[item.value] = item.en;
    return obj;
  },
  {} as Record<string, string>,
);
