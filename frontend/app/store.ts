import {applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {combineEpics, createEpicMiddleware, Epic} from 'redux-observable';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {combineReducers} from 'redux-immutable';
import {initialStreamState, IStreamStateRecord, StreamAction, streamReducer} from './stream/';
import {webSocketEpic} from './stream/websocket/webSocketEpic';
import {emptyMonoidStore, MonoidAction, monoidStoreReducer, MonoidStoreRoot} from './monoidstore';

export type IRootAction =
  StreamAction
  | MonoidAction;

interface IRootState {
  streamState: IStreamStateRecord;
  store: MonoidStoreRoot;
}

const defaultRootState: IRootState = {
  streamState: initialStreamState,
  store: emptyMonoidStore,
};

export interface IRootStateRecord extends TypedRecord<IRootStateRecord>, IRootState {
}

const InitialStateFactory = makeTypedFactory<IRootState, IRootStateRecord>(defaultRootState);

const initialState = InitialStateFactory(defaultRootState);

const rootReducer = combineReducers<IRootStateRecord>(
  {
    streamState: streamReducer,
    store: monoidStoreReducer,
  }
  // do we need to provide getDefaultState here?
);

export type RootEpic = Epic<IRootAction, IRootStateRecord>;

const rootEpic: RootEpic = combineEpics(
  webSocketEpic,
);

const epicMiddleware = createEpicMiddleware(rootEpic);

const store = createStore(
  rootReducer,
  initialState!,
  composeWithDevTools(applyMiddleware(epicMiddleware))
);

export default store;
