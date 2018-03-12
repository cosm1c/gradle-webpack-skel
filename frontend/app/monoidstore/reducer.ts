import {Map} from 'immutable';
import {AnyAction, Reducer} from 'redux';
import {MONOID_APPLY, MonoidAction} from './actions';
import {MonoidStoreRoot} from './index';

// streamId -> data
export type MonoidStoreRoot = Map<string, any>;

export const emptyMonoidStore: MonoidStoreRoot = Map<string, any>();

function applyMonoidAction(state: MonoidStoreRoot, action: MonoidAction): MonoidStoreRoot {
  return action
    .removePaths.reduce((acc, value) => acc.deleteIn(value), state)
    .mergeDeep(action.upsert);
}

export const monoidStoreReducer: Reducer<MonoidStoreRoot> =
  (state: MonoidStoreRoot = emptyMonoidStore, action: AnyAction): MonoidStoreRoot => {
    switch (action.type) {
      case MONOID_APPLY:
        return applyMonoidAction(state, action as MonoidAction);

      default:
        return state;
    }
  };
