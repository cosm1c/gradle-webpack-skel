import {Map as ImmutableMap} from 'immutable';
import {applyMiddleware, createStore, Reducer, ReducersMapObject, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {combineReducers} from 'redux-immutable';
import {createEpicMiddleware} from 'redux-observable';
import reducerRegistry from './reducerRegistry';

// To add epics: epicMiddleware.run(rootEpic);
export const epicMiddleware = createEpicMiddleware({
  // dependencies: ??? TODO: pass global services as Epic dependencies (can be used in testing)
});

export type AppRootState = ImmutableMap<string, any>;

// Could be loaded from localStorage
export const initialAppRootState: AppRootState = ImmutableMap();

const noopReducer: Reducer = (state = null) => state;

// Preserve initial state for not-yet-loaded reducers
const combine: (reducers: ReducersMapObject) => Reducer<AppRootState> =
  (reducers: ReducersMapObject) => {
    // Prevent Redux throwing away state that is not tied to a known reducer
    const reducerNames = Object.keys(reducers);
    Object.keys(initialAppRootState)
      .forEach((item) => {
        if (reducerNames.indexOf(item) === -1) {
          // reducers[item] = (state = null) => state;
          reducers[item] = noopReducer;
        }
      });
    return combineReducers(reducers) as  Reducer<AppRootState>;
  };

const reducer = combine(reducerRegistry.getReducers());

const store: Store<AppRootState> =
  createStore(
    reducer,
    initialAppRootState,
    composeWithDevTools(applyMiddleware(...[epicMiddleware])));

reducerRegistry.setChangeListener((reducers) => {
  store.replaceReducer(combine(reducers));
});

export default store;
