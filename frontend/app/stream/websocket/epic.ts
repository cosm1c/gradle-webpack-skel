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
import {combineEpics, Epic} from 'redux-observable';
import {IRootAction, IRootStateRecord} from '../../store';
import {globalErrorActionCreators} from '../../globalError';
import {CONNECT_WEBSOCKET, DISCONNECT_WEBSOCKET, WEBSOCKET_ERROR} from './actions';

// TODO: use exponential backoff - eg: Math.min(30, (Math.pow(2, k) - 1)) * 1000
const RECONNECT_DELAY_MS = 1000;

const noRootAction: IRootAction[] = [];

export function createWebSocketEpic(webSocketSubject: WebSocketSubject<any>,
                                    receiveFrame: (data: any) => IRootAction[]): Epic<IRootAction, IRootStateRecord> {
  // TODO: dispatch WEBSOCKET_OFFLINE, WEBSOCKET_CONNECTING and WEBSOCKET_DISCONNECTING events
  return combineEpics(
    (action$/*, store, dependencies*/) =>
      action$.ofType(CONNECT_WEBSOCKET)
        .switchMap(() =>
          webSocketSubject
            .retryWhen(errors => errors.mergeMap(() => {
              if (window.navigator.onLine) {
                console.debug(`Reconnecting WebSocket in ${RECONNECT_DELAY_MS}ms`);
                return Observable.timer(RECONNECT_DELAY_MS);
              }
              return Observable.fromEvent(window, 'online')
                .take(1);
            }))
            .takeUntil(action$.ofType(DISCONNECT_WEBSOCKET))
            .flatMap(data => {
              receiveFrame(data);
              return noRootAction;
            })
        ),
    (action$) =>
      action$.ofType(WEBSOCKET_ERROR)
        .map((value: any) => globalErrorActionCreators.globalError(
          value instanceof Error ? value : new Error(JSON.stringify(value))
        ))
  );
}
