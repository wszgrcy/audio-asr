const folders = ['desktop', 'mobile', 'web-common', 'server', 'define'];

async function main() {
  const { $ } = await import('execa');
  for (const folder of folders) {
    await $({ stdio: 'inherit', cwd: folder })('i18n', [
      './',
      './i18n',
      '--locales',
      'en',
    ]);
    // await $({ stdio: 'inherit', cwd: folder })('trans', [
    //   `./${folder}/i18n/extract.en.json`,
    //   '中文',
    //   '英文',
    // ]);
  }
}

main();
