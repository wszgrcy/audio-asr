const MayBeLanguage = [
  process.env['LANG'],
  process.env['LANGUAGE'],
  process.env['LC_ALL'],
  process.env['LC_MESSAGES'],
  process.env['LC_TIME'],
  process.env['LC_MONETARY'],
]
  .filter(Boolean)
  .map((item) => {
    return item!.toLowerCase();
  });

export const IsChinese =
  MayBeLanguage.includes('zh') || MayBeLanguage.includes('cn');
