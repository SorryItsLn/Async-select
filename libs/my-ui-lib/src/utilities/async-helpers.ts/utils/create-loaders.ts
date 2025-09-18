import type { WritableSignal } from '@angular/core'
import { signal } from '@angular/core'

export function createLoadersMap<T, LoaderId extends T[keyof T]>(
  rows: T[] = [],
  extractIdFn?: (item: T) => LoaderId,
): Map<LoaderId, WritableSignal<boolean>> {
  const loadersMap = new Map<LoaderId, WritableSignal<boolean>>()
  if (!extractIdFn) {
    return loadersMap
  }
  rows.forEach(item => {
    const id = extractIdFn(item)
    loadersMap.set(id, signal(false))
  })
  return loadersMap
}
