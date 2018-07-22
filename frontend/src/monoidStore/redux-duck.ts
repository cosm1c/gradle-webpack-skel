import {Map as ImmutableMap} from 'immutable';
import {Reducer} from 'redux';
import * as monoidStoreAction from './actions';
import {MONOID_STORE_APPLY, MONOID_STORE_CLEAR} from './actions';
import {ActionType} from 'typesafe-actions';
import reducerRegistry from '../reduxStore/reducerRegistry';
import {AppRootState} from '../reduxStore/store';

export const reducerName = 'store';

// streamId -> data
export type MonoidStore = ImmutableMap<string, any>;

export const initialMonoidStore: MonoidStore = ImmutableMap<string, any>();

export type MonoidStoreAction = ActionType<typeof monoidStoreAction>;

function applyMonoidAction(state: MonoidStore, removePaths: string[][], upsert: any): MonoidStore {
  return removePaths.reduce((acc, value) =>
    acc.deleteIn(value), state)
    .mergeDeep(upsert);
}

const reducer: Reducer<MonoidStore> =
  (state = initialMonoidStore, action) => {
    switch (action.type) {
      case MONOID_STORE_APPLY:
        return applyMonoidAction(state, action.payload.removePaths, action.payload.upsert);

      case MONOID_STORE_CLEAR:
        return state.clear();

      default:
        return state;
    }
  };

export default reducer;

reducerRegistry.register(reducerName, reducer);

export const selectStore: (state: AppRootState) => MonoidStore =
  (state) => state.get(reducerName, initialMonoidStore);
