export const MONOID_APPLY = 'MONOID_APPLY';

export type MonoidActions = {
  MONOID_APPLY: { type: typeof MONOID_APPLY, removePaths: string[][], upsert: any },
};

export type MonoidAction = MonoidActions[keyof MonoidActions];

export const monoidActionCreators = {
  monoidApply: (removePaths: string[][], upsert: any) => ({
    type: MONOID_APPLY as typeof MONOID_APPLY,
    removePaths,
    upsert,
  }),
};
