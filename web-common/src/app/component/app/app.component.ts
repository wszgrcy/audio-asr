import { Component, inject } from '@angular/core';
import {
  ConfirmPortal,
  FormDialogPortal,
  ToastPortal,
} from '@piying-lib/angular-daisyui/overlay';
import { RouterOutlet } from '@angular/router';
import { DbService } from '../../service/db/db.service';

@Component({
  selector: 'div[id=app]',
  templateUrl: 'app.component.html',
  standalone: true,

  imports: [ConfirmPortal, ToastPortal, FormDialogPortal, RouterOutlet],
})
export class AppComponent {}
