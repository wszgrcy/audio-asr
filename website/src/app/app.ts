import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './service/toast.service';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatIcon } from '@angular/material/icon';
import { ConfirmService } from './service/confirm.service';
import { StrOrTemplateComponent } from '@piying-lib/angular-core';
import { SelectorlessOutlet } from '@cyia/ngx-common/directive';
import { PurePipe } from '@cyia/ngx-common/pipe';
import { MergeClassPipe } from '@piying-lib/angular-daisyui/pipe';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CdkCopyToClipboard,
    MatIcon,
    SelectorlessOutlet,
    PurePipe,
    MergeClassPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  #toast = inject(ToastService);
  readonly list$$ = this.#toast.list$$;
  #confirm = inject(ConfirmService);
  readonly dialogList$$ = this.#confirm.list$$;
  readonly StrOrTemplateComponent = StrOrTemplateComponent;

  buttonContent = (content: any) => {
    return { content };
  };
}
