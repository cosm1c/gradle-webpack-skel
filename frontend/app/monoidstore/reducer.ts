import {Map} from 'immutable';
import {AnyAction, Reducer} from 'redux';
import {MONOID_APPLY, MONOID_CLEAR, MonoidStoreRoot} from './';

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
      case MONOID_APPLY:
        return applyMonoidAction(state, action.removePaths, action.upsert);

      case MONOID_CLEAR:
        return state.clear();

      default:
        return state;
    }
  };
