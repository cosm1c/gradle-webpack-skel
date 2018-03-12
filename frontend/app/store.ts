import {applyMiddleware, createStore} from 'redux';
import {combineEpics, createEpicMiddleware, Epic} from 'redux-observable';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {combineReducers} from 'redux-immutable';
import {initialStreamState, IStreamStateRecord, StreamAction, streamReducer} from './stream/';
import {webSocketEpic} from './stream/websocket/websocket';
import {emptyMonoidStore, MonoidAction, monoidStoreReducer, MonoidStoreRoot} from './monoidstore';

export type IRootAction =
  StreamAction
  | MonoidAction;

interface IRootState {
  streamState: IStreamStateRecord;
  monoidStore: MonoidStoreRoot;
}

const defaultRootState: IRootState = {
  streamState: initialStreamState,
  monoidStore: emptyMonoidStore,
};

export interface IRootStateRecord extends TypedRecord<IRootStateRecord>, IRootState {
}

const InitialStateFactory = makeTypedFactory<IRootState, IRootStateRecord>(defaultRootState);

const initialState = InitialStateFactory(defaultRootState);

const rootReducer = combineReducers<IRootStateRecord>(
  {
    streamState: streamReducer,
    monoidStore: monoidStoreReducer,
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
  applyMiddleware(epicMiddleware)
);

export default store;
