import { $localize } from '@cyia/localize';
import { initSet } from './init';
// 本地初始化使用
export async function main() {
  console.log($localize`准备初始化`);
  await initSet();
}
main();
