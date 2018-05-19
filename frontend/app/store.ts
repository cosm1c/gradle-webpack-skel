import 'rxjs/add/operator/mergeMap';
import {ActionsObservable, combineEpics, createEpicMiddleware, Epic} from 'redux-observable';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {ConnectionAction} from './navbar/connection/actions';
import {IConnectionStateRecord, initialConnectionState} from './navbar/connection/ConnectionStateRecord';
import {MonoidStoreAction} from './monoidstore/actions';
import {emptyMonoidStore, monoidStoreReducer, MonoidStoreRoot} from './monoidstore/reducer';
import {GlobalAlertAction} from './globalAlert/actions';
import {IGlobalAlertStateRecord, initialGlobalAlertState} from './globalAlert/GlobalAlertStateRecord';
import {ChartStreamAction, ChartStreamList, chartStreamReducer, emptyChartStreamList} from './tabs/chartstream';
import {combineReducers} from 'redux-immutable';
import {globalAlertReducer} from './globalAlert/reducer';
import {connectionStateReducer} from './navbar/connection/reducer';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {applyMiddleware, createStore, MiddlewareAPI, Reducer, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {IRootAction, IRootState, IRootStateRecord, RootEpic} from './store';

export type IRootAction =
  GlobalAlertAction
  | ConnectionAction
  | MonoidStoreAction
  | ChartStreamAction;

export interface IRootState {
  globalAlert: IGlobalAlertStateRecord;
  connectionState: IConnectionStateRecord;
  store: MonoidStoreRoot;
  chartStreams: ChartStreamList;
}

export interface IRootStateRecord extends TypedRecord<IRootStateRecord>, IRootState {
}

export type RootEpic = Epic<IRootAction, IRootStateRecord>;

const defaultRootState: IRootState = {
  globalAlert: initialGlobalAlertState,
  connectionState: initialConnectionState,
  store: emptyMonoidStore,
  chartStreams: emptyChartStreamList,
};

const InitialStateFactory = makeTypedFactory<IRootState, IRootStateRecord>(defaultRootState);

const initialState = InitialStateFactory(defaultRootState);

const rootReducer: Reducer<IRootStateRecord> = combineReducers<IRootStateRecord>(
  {
    globalAlert: globalAlertReducer,
    connectionState: connectionStateReducer,
    store: monoidStoreReducer,
    chartStreams: chartStreamReducer,
  }
  // do we need to provide getDefaultState here?
);

export const rootEpic$: BehaviorSubject<RootEpic> = new BehaviorSubject(combineEpics(
  // Add epics to start on page load here
));

/*
console.log('singletons loaded');
rootEpic$.subscribe({
  next: () => {
    console.warn('rootEpic$ subscription received:', Date.now(), arguments);
    // debugger;
  }
});
*/

const rootEpic: RootEpic =
  (action$: ActionsObservable<IRootAction>, store: MiddlewareAPI<IRootStateRecord>) =>
    rootEpic$.mergeMap(epic =>
      epic(action$, store, undefined)
    );

const epicMiddleware = createEpicMiddleware(rootEpic);

export const rootStore: Store<IRootStateRecord> = createStore(
  rootReducer,
  initialState!,
  composeWithDevTools(applyMiddleware(epicMiddleware))
);
