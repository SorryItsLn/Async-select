export type ChipHandler<T, K> = (context: { index: number; item: T }) => K

export type ChipAppearanceHandler<T> = ChipHandler<T, ChipAppearance>

export type ChipAppearance =
  | ''
  | 'accent'
  | 'error'
  | 'floating'
  | 'info'
  | 'outline-grayscale'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'whiteblock'
