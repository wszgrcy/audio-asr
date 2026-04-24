import { $localize } from '@cyia/localize';

export function readFileAsText(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target!.result);
    };

    reader.onerror = () => {
      reject(reader.error || new Error($localize`读取文件失败`));
    };

    reader.readAsText(file);
  });
}
