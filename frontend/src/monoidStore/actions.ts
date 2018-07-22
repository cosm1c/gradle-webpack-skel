import {action} from 'typesafe-actions';

export const MONOID_STORE_CLEAR = 'MONOID_STORE_CLEAR';
export const MONOID_STORE_APPLY = 'MONOID_STORE_APPLY';

export const monoidStoreClear = () => action(MONOID_STORE_CLEAR);

export const monoidStoreApply = (removePaths: string[][], upsert: any) =>
  action(
    MONOID_STORE_APPLY,
    {
      removePaths,
      upsert,
    }
  );
