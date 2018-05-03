import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/mergeMap';
import {applyMiddleware, createStore, MiddlewareAPI, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {ActionsObservable, combineEpics, createEpicMiddleware, Epic} from 'redux-observable';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {combineReducers} from 'redux-immutable';
import {GlobalErrorAction, globalErrorReducer, IGlobalErrorStateRecord, initialGlobalErrorState} from './globalError';
import {emptyMonoidStore, MonoidAction, monoidStoreReducer, MonoidStoreRoot} from './monoidstore';
import {initialWebSocketState, IWebSocketStateRecord, WebSocketAction, websocketStateReducer} from './stream/websocket';
import {ChartStreamAction, ChartStreamList, chartStreamReducer, emptyChartStreamList} from './widgets/chartstream';

export type IRootAction =
  WebSocketAction
  | MonoidAction
  | ChartStreamAction
  | GlobalErrorAction;

interface IRootState {
  webSocketState: IWebSocketStateRecord;
  store: MonoidStoreRoot;
  globalError: IGlobalErrorStateRecord;
  chartStreams: ChartStreamList;
}

const defaultRootState: IRootState = {
  webSocketState: initialWebSocketState,
  store: emptyMonoidStore,
  globalError: initialGlobalErrorState,
  chartStreams: emptyChartStreamList,
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
    chartStreams: chartStreamReducer,
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
