import {Observable} from 'rxjs/Observable';
import {WebSocketSubject} from 'rxjs/observable/dom/WebSocketSubject';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import {ActionsObservable, combineEpics} from 'redux-observable';
import {IRootAction, RootEpic} from '../store';
import {CONNECT_CONNECTION, CONNECTION_ERROR, DISCONNECT_CONNECTION} from '../navbar/connection/actions';
import {globalAlertActionCreators} from '../globalAlert/actions';

// TODO: use exponential backoff - eg: Math.min(30, (Math.pow(2, k) - 1)) * 1000
const RECONNECT_DELAY_MS = 1000;

const noRootAction: IRootAction[] = [];

export function createWebSocketEpic(webSocketSubject: WebSocketSubject<any>,
                                    receiveFrame: (data: any) => IRootAction[]): RootEpic {
  // TODO: dispatch CONNECTION_OFFLINE, CONNECTION_CONNECTING and CONNECTION_DISCONNECTING events
  return combineEpics(
    (action$: ActionsObservable<IRootAction>/*, rootStore, dependencies*/) =>
      action$.ofType(CONNECT_CONNECTION)
        .switchMap(() =>
          webSocketSubject
            .retryWhen((errors) => errors.mergeMap((err) => {
              console.error('WebSocket error', err);
              if (window.navigator.onLine) {
                console.debug(`Reconnecting WebSocket in ${RECONNECT_DELAY_MS}ms`);
                return Observable.timer(RECONNECT_DELAY_MS);
              }
              return Observable.fromEvent(window, 'online')
                .take(1);
            }))
            .takeUntil(action$.ofType(DISCONNECT_CONNECTION))
            .flatMap((data) => {
              receiveFrame(data);
              return noRootAction;
            }),
        ),
    (action$) =>
      action$.ofType(CONNECTION_ERROR)
        .map((value: any) => globalAlertActionCreators.globalAlert(value, 'danger')),
  );
}
