export function isFunction(value: unknown): value is CallableFunction {
  return typeof value === 'function';
}
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
