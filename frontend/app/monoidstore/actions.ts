export const MONOID_STORE_CLEAR = 'MONOID_STORE_CLEAR';
export const MONOID_STORE_APPLY = 'MONOID_STORE_APPLY';

export interface MonoidStoreActions {
  MONOID_CLEAR: { type: typeof MONOID_STORE_CLEAR };
  MONOID_APPLY: { type: typeof MONOID_STORE_APPLY, removePaths: string[][], upsert: any };
}

export type MonoidStoreAction = MonoidStoreActions[keyof MonoidStoreActions];

export const monoidStoreActionCreators = {
  monoidStoreClear: () => ({
    type: MONOID_STORE_CLEAR as typeof MONOID_STORE_CLEAR,
  }),
  monoidStoreApply: (removePaths: string[][], upsert: any) => ({
    type: MONOID_STORE_APPLY as typeof MONOID_STORE_APPLY,
    removePaths,
    upsert,
  }),
};
