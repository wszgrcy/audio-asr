import { $localize } from '@cyia/localize';
import { Injectable } from '@angular/core';
const AudioFile = {
  name: $localize`音频文件`,
  extensions: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
};
const VideoFile = {
  name: $localize`视频文件`,
  extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'],
};
const fileFilters = [
  {
    name: $localize`音频和视频文件`,
    extensions: [...AudioFile.extensions, ...VideoFile.extensions],
  },
  AudioFile,
  VideoFile,
];
@Injectable({
  providedIn: 'root',
})
export class FileFilterService {
  audiovideo = fileFilters;
  srt = [
    {
      name: $localize`字幕`,
      extensions: ['srt'],
    },
  ];
}
