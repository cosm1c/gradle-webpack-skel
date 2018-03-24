import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {applyMiddleware, createStore, MiddlewareAPI, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {ActionsObservable, combineEpics, createEpicMiddleware, Epic} from 'redux-observable';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {combineReducers} from 'redux-immutable';
import {GlobalErrorAction, globalErrorReducer, IGlobalErrorStateRecord, initialGlobalErrorState} from './globalError';
import {emptyMonoidStore, MonoidAction, monoidStoreReducer, MonoidStoreRoot} from './monoidstore';
import {initialWebSocketState, IWebSocketStateRecord, WebSocketAction, websocketStateReducer} from './stream/websocket';

// TODO: refactor to use Redux reducer registry so each WebSocket registers itself -- http://nicolasgallagher.com/redux-modules-and-code-splitting/

export type IRootAction =
  WebSocketAction
  | MonoidAction
  | GlobalErrorAction;

interface IRootState {
  webSocketState: IWebSocketStateRecord;
  store: MonoidStoreRoot;
  globalError: IGlobalErrorStateRecord;
}

const defaultRootState: IRootState = {
  webSocketState: initialWebSocketState,
  store: emptyMonoidStore,
  globalError: initialGlobalErrorState,
};

export interface IRootStateRecord extends TypedRecord<IRootStateRecord>, IRootState {
}

const InitialStateFactory = makeTypedFactory<IRootState, IRootStateRecord>(defaultRootState);

const initialState = InitialStateFactory(defaultRootState);

const rootReducer = combineReducers<IRootStateRecord>(
  {
    webSocketState: websocketStateReducer,
    store: monoidStoreReducer,
    globalError: globalErrorReducer,
  }
  // do we need to provide getDefaultState here?
);

export type RootEpic = Epic<IRootAction, IRootStateRecord>;

export const rootEpic$: BehaviorSubject<RootEpic> = new BehaviorSubject(combineEpics(
  // Add epics to start on page load here
));

export const rootEpic: RootEpic =
  (action$: ActionsObservable<IRootAction>, store: MiddlewareAPI<IRootStateRecord>) =>
    rootEpic$.mergeMap(epic =>
      epic(action$, store, undefined)
    );

const epicMiddleware = createEpicMiddleware(rootEpic);

const store: Store<IRootStateRecord> = createStore(
  rootReducer,
  initialState!,
  composeWithDevTools(applyMiddleware(epicMiddleware))
);

export default store;
