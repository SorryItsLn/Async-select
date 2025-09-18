import { SelectOptionDirective } from './directives'
import { SelectComponent } from './select.component'

export * from './consts'
export * from './directives'
export * from './select.component'
export * from './types'

export const MUISelect = [SelectComponent, SelectOptionDirective] as const
