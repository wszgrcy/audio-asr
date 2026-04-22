import { Component, inject, viewChild } from '@angular/core';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { AudioService } from '../../service/audio/audio.service';
import { AudioDataService } from '../../service/audio/audio-router.service';

@Component({
  selector: 'audio-file',
  templateUrl: './component.html',
  imports: [DatePipe, KeyValuePipe],
  providers: [AudioService],
})
export class AudioFileComponent {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  dataService = inject(AudioDataService);
}
