import type { OnDestroy, OnInit } from '@angular/core'
import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import type { ControlValueAccessor } from '@angular/forms'
import {
  FormControl,
  FormControlDirective,
  FormControlName,
  NgControl,
  NgModel,
} from '@angular/forms'
import { EMPTY_FUNCTION } from '@taiga-ui/cdk'

@Directive()
export class FormControlWrapper
  implements OnInit, OnDestroy, ControlValueAccessor
{
  protected ngControl = inject(NgControl, { optional: true, self: true })
  protected changeDetectorRef = inject(ChangeDetectorRef)
  protected destroyRef = inject(DestroyRef)

  private onChange = EMPTY_FUNCTION
  private onTouched = EMPTY_FUNCTION

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this
    }
  }

  private _control!: FormControl

  get control(): FormControl {
    return this._control
  }

  writeValue() {
    if (this.changeDetectorRef) {
      this.changeDetectorRef.markForCheck()
    }
    if (this.control) {
      this.control.markAsTouched()
      this.control.markAsDirty()
    }
  }

  registerOnTouched(fn: typeof this.onChange): void {
    this.onTouched = fn
  }

  registerOnChange(fn: typeof this.onTouched) {
    this.onChange = fn
  }

  readonly disable = input<boolean>(false)

  private readonly disabledEffect = effect(() => {
    const disabled = this.disable()
    disabled ? this.control?.disable() : this.control?.enable()
  })

  ngOnInit() {
    if (
      this.ngControl instanceof FormControlDirective ||
      this.ngControl instanceof FormControlName
    ) {
      this._control = this.ngControl.control
    } else if (this.ngControl instanceof NgModel) {
      this._control = this.ngControl.control
      this._control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          if (this.ngControl?.control) {
            this.ngControl?.viewToModelUpdate(value)
          }
        })
    } else {
      this._control = new FormControl()
    }
  }
  ngOnDestroy(): void {
    this.disabledEffect.destroy()
  }
}
