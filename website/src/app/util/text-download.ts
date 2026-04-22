export function textDownload(text: string, fileName: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
}
