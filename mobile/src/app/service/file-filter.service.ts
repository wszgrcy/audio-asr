import { Injectable } from '@angular/core';

export interface FileFilter {
  name: string;
  extensions: string[];
}

const AudioFile: FileFilter = {
  name: '音频文件',
  extensions: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
};

const VideoFile: FileFilter = {
  name: '视频文件',
  extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'],
};

@Injectable({
  providedIn: 'root',
})
export class FileFilterService {
  audiovideo = [...AudioFile.extensions, ...VideoFile.extensions].join(',');
  srt = '.srt';
}
