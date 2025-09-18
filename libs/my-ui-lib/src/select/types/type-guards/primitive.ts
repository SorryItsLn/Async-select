export type Primitive =
  | undefined
  | null
  | symbol
  | boolean
  | bigint
  | number
  | string;

export function isDefined<T>(value: T): value is NonNullable<T> {
  return !isUndefined(value) && !isNull(value);
}

export function isPrimitive(value: unknown): value is Primitive {
  return (
    isUndefined(value) ||
    isNull(value) ||
    isSymbol(value) ||
    isBoolean(value) ||
    isBigInt(value) ||
    isNumber(value) ||
    isString(value)
  );
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

export function isPureNumber(value: unknown): value is number {
  if (!isNumber(value)) return false;
  if (Number.isNaN(value)) return false;
  return Number.isFinite(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNull(value: unknown): value is null {
  return value === null;
}
