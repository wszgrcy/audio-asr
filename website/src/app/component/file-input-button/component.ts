import {
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { AttributesDirective } from '@piying/view-angular';
import { Color, Size } from '@piying-lib/angular-core';
import { ThemeService } from '@piying-lib/angular-daisyui/service';
import {
  CssPrefixPipe,
  MergeClassPipe,
  TwPrefixPipe,
} from '@piying-lib/angular-daisyui/pipe';
import { SelectorlessOutlet } from '@cyia/ngx-common/directive';
import { StrOrTemplateComponent } from '@piying-lib/angular-core';
@Component({
  selector: 'app-button',
  templateUrl: './component.html',
  imports: [
    AttributesDirective,
    CssPrefixPipe,
    SelectorlessOutlet,
    MergeClassPipe,
    TwPrefixPipe,
  ],
})
export class FileInputButtonNFCC {
  static __version = 2;
  readonly StrOrTemplateComponent = StrOrTemplateComponent;
  templateRef = viewChild.required('templateRef');
  color = input<Color>();
  style = input<'outline' | 'dash' | 'soft' | 'ghost' | 'link'>();
  size = input<Size>();
  shape = input<'wide' | 'block' | 'square' | 'circle'>();
  active = input<boolean>();
  content = input<any>('Default');
  multiple = input<boolean>();

  clicked = input<(event: File[] | File) => Promise<void>>();
  disabled = input(false);
  disableLoadingIcon = input(false);
  accept = input();
  isLoading$ = signal(false);

  #theme = inject(ThemeService);
  wrapperClass$ = computed(() => {
    return this.#theme.setClass(
      this.#theme.addPrefix('btn'),
      this.#theme.setColor('btn', this.color()),
      this.#theme.setSize('btn', this.size()),
      this.style() ? this.#theme.addPrefix(`btn-${this.style()}`) : undefined,
      this.shape() ? this.#theme.addPrefix(`btn-${this.shape()}`) : undefined,
      this.active() ? this.#theme.addPrefix(`btn-active`) : undefined,
    );
  });

  async fileChange(input: HTMLInputElement) {
    if (!input.files || !input.files.length) {
      return;
    }
    let fileData;
    if (this.multiple()) {
      fileData = [...input.files];
    } else {
      fileData = input.files[0];
    }

    this.isLoading$.set(true);
    try {
      await this.clicked()?.(fileData);
    } catch (error) {
      throw error;
    } finally {
      this.isLoading$.set(false);
    }
  }
}
