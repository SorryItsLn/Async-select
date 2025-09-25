import { Directive, input } from '@angular/core'

import { SelectHandler } from '../types'

@Directive({
  selector: '[muiOption]',
})
export class SelectOptionDirective<T> {
  readonly muiOptionFrom = input<SelectHandler<T>>()

  static ngTemplateContextGuard<T>(
    _dir: SelectOptionDirective<T>,
    _ctx: unknown,
  ): _ctx is { $implicit: T } {
    return true
  }
}
