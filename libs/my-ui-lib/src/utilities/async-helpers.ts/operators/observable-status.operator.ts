import type { WritableSignal } from '@angular/core'
import { signal } from '@angular/core'
import type { MonoTypeOperatorFunction } from 'rxjs'
import { Observable, tap } from 'rxjs'

import type { ObservableStatus } from '../types'

const STATUS: Record<string, ObservableStatus> = {
  IDLE: { loading: false, error: null, completed: false },
  LOADING: { loading: true, error: null, completed: false },
  COMPLETED: { loading: false, error: null, completed: true },
}

export function createObservableStatus(options: Partial<ObservableStatus> = {}) {
  const OBSERVABLE_STATUS_DEFAULTS = STATUS['LOADING']
  const resultOptions = Object.assign(OBSERVABLE_STATUS_DEFAULTS, options)
  return signal<ObservableStatus>(resultOptions)
}

export function bindStatus<T>(
  signal: WritableSignal<ObservableStatus>,
): MonoTypeOperatorFunction<T> {
  const setStatus = (status: ObservableStatus) => {
    signal.set(status)
  }
  const updateStatus = (status: Partial<ObservableStatus>) => {
    signal.update(prevValue => ({ ...prevValue, ...status }))
  }
  return source$ => {
    return new Observable(observer => {
      setStatus(STATUS['LOADING'])
      return source$
        .pipe(
          tap({
            subscribe: () => updateStatus({ loading: true, completed: false }),
            next: () => updateStatus({ loading: false, error: null }),
            error: error => updateStatus({ loading: false, error }),
            finalize: () => updateStatus({ completed: true }),
          }),
        )
        .subscribe(observer)
    })
  }
}
