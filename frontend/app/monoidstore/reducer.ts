import {Map} from 'immutable';
import {Observer} from 'rxjs/Observer';
import {AnyAction, Reducer} from 'redux';
import store from '../store';
import {jsonToMonoidActions, MONOID_APPLY, MonoidAction, MonoidStoreRoot} from './';

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

export const monoidStoreObserver: Observer<any> = {

  next(value: any) {
    store.dispatch(jsonToMonoidActions(value));
  },

  error(err: any) {
    console.error('storeError', err);
  },

  complete() {
    console.info('storeComplete');
  }
};
