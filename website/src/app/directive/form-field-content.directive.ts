import { FocusMonitor } from '@angular/cdk/a11y';
import {
  computed,
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { merge, Subject } from 'rxjs';

@Directive({
  selector: '[formFieldContent]',
  standalone: true,
  providers: [
    { provide: MatFormFieldControl, useExisting: FormFiledContentDirective },
  ],
})
export class FormFiledContentDirective implements MatFormFieldControl<any> {
  static nextId = 0;
  /** 必选 */
  _required = input<boolean>(false, { alias: 'required' });
  _controlType = input<string>('auto', { alias: 'controlType' });
  focusSelector = input<string>('input');
  focusAction = input<'click' | 'focus'>('click');
  customFocus = input<(el: ElementRef, event: PointerEvent) => void>();
  accessor = inject(NG_VALUE_ACCESSOR);
  ngControl = inject(NgControl, { self: true });
  readonly #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  focusMonitor = inject(FocusMonitor);
  #status = new Subject<void>();
  constructor() {
    this.focusMonitor
      .monitor(this.#elementRef, true)
      .pipe(takeUntilDestroyed())
      .subscribe((origin) => {
        if (!origin && this._focused()) {
          this._focused.set(false);
        }
      });
    effect(() => {
      this._focused();
      this.#status.next();
    });
  }

  get value() {
    return this.ngControl.value;
  }
  get stateChanges() {
    return merge(this.#status, this.ngControl.statusChanges!);
  }
  id = `form-field-content-${FormFiledContentDirective.nextId++}`;
  /** 占位符 */
  _placeholder = input<string>('', { alias: 'placeholder' });
  get placeholder() {
    return this._placeholder();
  }
  _focused = signal(false);
  get focused() {
    return this._focused();
  }
  @HostListener('focusin')
  focusinEvent() {
    this._focused.set(true);
  }
  @HostListener('focusout')
  focusoutEvent() {
    this._focused.set(false);
  }
  get empty() {
    return this.ngControl.value == null || this.ngControl.value === '';
  }
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }
  get required() {
    return this._required();
  }
  get disabled() {
    return !!this.ngControl.disabled;
  }
  get errorState() {
    return !!this.ngControl.invalid && !!this.ngControl.dirty;
  }

  get controlType() {
    return this._controlType();
  }
  setDescribedByIds(_ids: string[]): void {
    const controlElement = this.#elementRef.nativeElement;
    controlElement.setAttribute('aria-describedby', _ids.join(' '));
  }
  onContainerClick(event: PointerEvent): void {
    this._focused.set(true);
    if (this.customFocus()) {
      this.customFocus()!(this.#elementRef, event);
    } else {
      const selectEl = this.#focusEl$$();
      if (
        event.target &&
        (selectEl === event.target || selectEl?.contains(event.target as any))
      ) {
        return;
      }
      this.#focusEl$$()?.[this.focusAction()]();
    }
  }
  #focusEl$$ = computed<HTMLElement | null>(() => {
    return this.focusSelector()
      ? this.#elementRef.nativeElement.querySelector(this.focusSelector())
      : this.#elementRef.nativeElement;
  });
}
