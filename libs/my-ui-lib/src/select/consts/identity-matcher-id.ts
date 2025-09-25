import type { TuiIdentityMatcher } from '@taiga-ui/cdk'

export const byId: TuiIdentityMatcher<{ id: string | number }> = (a, b) =>
  a.id === b.id
