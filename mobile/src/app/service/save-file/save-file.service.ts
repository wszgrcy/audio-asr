import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SaveFileService {
  async getDir() {
    return '';
  }
  async save(file: File, options?: { dir: string }) {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
