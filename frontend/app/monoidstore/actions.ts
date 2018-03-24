export const MONOID_CLEAR = 'MONOID_CLEAR';
export const MONOID_APPLY = 'MONOID_APPLY';

export type MonoidActions = {
  MONOID_CLEAR: { type: typeof MONOID_CLEAR },
  MONOID_APPLY: { type: typeof MONOID_APPLY, removePaths: string[][], upsert: any },
};

export type MonoidAction = MonoidActions[keyof MonoidActions];

export const monoidActionCreators = {
  monoidClear: () => ({
    type: MONOID_CLEAR as typeof MONOID_CLEAR,
  }),
  monoidApply: (removePaths: string[][], upsert: any) => ({
    type: MONOID_APPLY as typeof MONOID_APPLY,
    removePaths,
    upsert,
  }),
};
