import {Map} from 'immutable';
import {AnyAction, Reducer} from 'redux';
import {MONOID_STORE_APPLY, MONOID_STORE_CLEAR} from './actions';

// streamId -> data
export type MonoidStoreRoot = Map<string, any>;

export const emptyMonoidStore: MonoidStoreRoot = Map<string, any>();

function applyMonoidAction(state: MonoidStoreRoot, removePaths: string[][], upsert: any): MonoidStoreRoot {
  return removePaths.reduce((acc, value) => acc.deleteIn(value), state)
    .mergeDeep(upsert);
}

export const monoidStoreReducer: Reducer<MonoidStoreRoot> =
  (state: MonoidStoreRoot = emptyMonoidStore, action: AnyAction): MonoidStoreRoot => {
    switch (action.type) {
      case MONOID_STORE_APPLY:
        return applyMonoidAction(state, action.removePaths, action.upsert);

      case MONOID_STORE_CLEAR:
        return state.clear();

      default:
        return state;
    }
  };
