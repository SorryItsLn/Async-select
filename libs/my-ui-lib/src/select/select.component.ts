import { AsyncPipe, NgTemplateOutlet } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  input,
  output,
  signal
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ReactiveFormsModule } from '@angular/forms'
import {
  TUI_DEFAULT_IDENTITY_MATCHER,
  TuiBooleanHandler,
  TuiIdentityMatcher,
  TuiStringHandler,
} from '@taiga-ui/cdk'
import {
  TuiDataList,
  TuiError,
  TuiHint,
  TuiLoader,
  TuiSizeL,
  TuiSizeS,
  TuiTextfield,
} from '@taiga-ui/core'
import {
  TuiChevron,
  TuiComboBox,
  TuiDataListWrapper,
  TuiFieldErrorPipe,
  TuiFilterByInputPipe,
  TuiInputChip,
  TuiMultiSelect,
} from '@taiga-ui/kit'
import { PolymorpheusContent } from '@taiga-ui/polymorpheus'
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  isObservable,
  map,
  of,
  scan,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs'


import { FormControlWrapper, HandleTriggerDirective } from '../utilities'
import { bindStatus, createObservableStatus } from '../utilities/async-helpers.ts'
import { SelectOptionDirective } from './directives'
import type { ChipAppearance, ChipAppearanceHandler, ChipHandler, SelectHandler } from './types'
import { isFunction, isString } from './types/type-guards'

@Component({
  selector: 'mui-select',
  imports: [
    AsyncPipe,
    HandleTriggerDirective,
    NgTemplateOutlet,
    ReactiveFormsModule,
    TuiChevron,
    TuiComboBox,
    TuiDataList,
    TuiDataListWrapper,
    TuiError,
    TuiFieldErrorPipe,
    TuiFilterByInputPipe,
    TuiHint,
    TuiInputChip,
    TuiLoader,
    TuiMultiSelect,
    TuiTextfield,
  ],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T> extends FormControlWrapper implements OnDestroy {
  readonly optionTemplate = contentChild<SelectOptionDirective<T>, TemplateRef<T>>(
    SelectOptionDirective,
    {
      read: TemplateRef,
    },
  )

  readonly items = input.required<SelectHandler<T> | T[] | Observable<T[]>>()
  readonly refresher = input<Observable<void>>()

  readonly checkedAll = input(false, { transform: booleanAttribute })
  readonly cleaner = input(true, { transform: booleanAttribute })
  readonly multiple = input(false, { transform: booleanAttribute })
  readonly strictMode = input(true, { transform: booleanAttribute })
  readonly readOnly = input(false, { transform: booleanAttribute })
  readonly withoutLabel = input(false, { transform: booleanAttribute })

  readonly iconStart = input<string>('')
  readonly groupLabel = input<string | null | undefined>(null)
  readonly placeholder = input<string>('')
  readonly size = input<TuiSizeS | TuiSizeL>('l')

  readonly optionSelected = output<T>()

  readonly chipAppearance = input<ChipAppearance | ChipAppearanceHandler<T>>(() => 'info')
  readonly chipIcon = input<string | ChipHandler<T, string>>(() => '')
  readonly chipHint = input<string | ChipHandler<T, string>>(() => '')
  readonly rows = input<number>(Infinity)

  readonly stringify = input<TuiStringHandler<T>>(String)
  readonly identityMatcher = input<TuiIdentityMatcher<T>>(TUI_DEFAULT_IDENTITY_MATCHER)
  readonly disabledItemHandler = input<TuiBooleanHandler<T>>()

  readonly emptyContent = input<PolymorpheusContent<TemplateRef<T>>>()

  protected readonly isAsync = signal(false)
  protected readonly page = signal(1)

  protected search$ = new BehaviorSubject<string | null>(null)
  protected capacity$ = new BehaviorSubject<number>(10)
  protected pageTrigger$ = new Subject<void>()
  protected focus$ = new Subject<void>()
  protected refresher$ = new Subject<void>()
  protected handler$ = new ReplaySubject<SelectHandler<T>>()

  get search() {
    return this.search$.value
  }

  private itemsEffect = effect(() => {
    const items = this.items()
    if (isFunction(items)) {
      this.isAsync.set(true)
      this.handler$.next(items)
      return
    }

    const items$ = isObservable(items) ? items : of(items)
    const handler: any = () =>
      items$.pipe(
        map(data => ({
          options: data,
          metadata: { pageNumber: 1, pageCapacity: data.length, total: data.length },
        })),
      )
    this.handler$.next(handler)
  })

  private refresherEffect = effect(() => {
    const refresher = this.refresher()
    if (!refresher) return
    refresher.pipe(debounceTime(0), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.refresher$.next()
    })
  })

  protected itemsDataStatus$ = createObservableStatus()
  protected availableData$ = combineLatest({
    handler: this.handler$,
    pageTrigger: this.pageTrigger$.pipe(startWith(undefined)),
    pageCapacity: this.capacity$,
    search: this.search$.pipe(
      debounceTime(300),
      filter(() => this.isAsync() && (this.multiple() || !this.control.value)),
      startWith(null),
      tap(() => this.page.update(() => 1)),
    ),
    refresher: this.refresher$.pipe(
      startWith(undefined),
      tap(() => this.page.update(() => 1)),
    ),
    focus: this.focus$.pipe(take(1)),
  }).pipe(
    switchMap(({ pageCapacity, search, handler }) => {
      return handler({ pageCapacity, pageNumber: this.page(), search }).pipe(
        bindStatus(this.itemsDataStatus$),
        catchError(() => {
          return of({
            options: [],
            metadata: {
              pageNumber: 1,
              pageCapacity: 10,
              total: 0,
            },
          })
        }),
      )
    }),
    scan((acc, curr) => {
      const { metadata } = curr
      if (metadata.pageNumber === 1) return curr
      return { metadata: metadata, options: [...acc.options, ...curr.options] }
    }),
  )

  protected onSearch(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return
    this.search$.next(event.target.value)
  }

  createChipHandler = <K>(arg: string | ChipHandler<K, string>): ChipHandler<K, string> => {
    return isString(arg) ? () => arg : arg
  }

  protected defaultDisabledItemHandler = computed(() => {
    const singleItemHandler = () => false
    const multiItemHandler = (item: T) => this.strictMode() && this.search$.value === item
    return this.multiple() ? multiItemHandler : singleItemHandler
  })

  override ngOnDestroy(): void {
    super.ngOnDestroy()
    this.itemsEffect.destroy()
    this.refresherEffect.destroy()
  }
}
