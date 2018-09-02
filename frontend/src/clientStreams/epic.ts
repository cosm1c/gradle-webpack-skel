import {fromEvent, timer} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {filter, flatMap, map, mergeMap, retryWhen, switchMap, takeUntil} from 'rxjs/operators';
import {AnyAction} from 'redux';
import {ActionsObservable, combineEpics, Epic, ofType} from 'redux-observable';
import {CONNECT_CONNECTION, CONNECTION_ERROR, DISCONNECT_CONNECTION} from './actions';
import {AlertLevel} from '../appAlert';
import {globalAlert} from '../appAlert/actions';

// TODO: use exponential backoff - eg: Math.min(30, (Math.pow(2, k) - 1)) * 1000
const RECONNECT_DELAY_MS = 1000;

export function createWebSocketEpic(name: string,
                                    webSocketSubject: WebSocketSubject<any>,
                                    receiveFrame: (data: any) => AnyAction[]): Epic {
  // TODO: dispatch CONNECTION_OFFLINE, CONNECTION_CONNECTING and CONNECTION_DISCONNECTING events
  const reconnectEpic = (action$: ActionsObservable<AnyAction>/*, state$, dependencies*/) =>
    action$.pipe(
      ofType(CONNECT_CONNECTION),
      filter((event) => event.payload.id === name),
      switchMap(() =>
        webSocketSubject.pipe(
          // startWith(connectionConnecting(connectionId)),
          retryWhen((errors) =>
            errors.pipe(
              mergeMap((err) => {
                console.error(`${name} WebSocket error`, err);
                if (window.navigator.onLine) {
                  console.debug(`${name} WebSocket reconnecting in ${RECONNECT_DELAY_MS}ms`);
                  return timer(RECONNECT_DELAY_MS).pipe(
                    // startWith(connectionOffline(connectionId, err)),
                    map(() => document.createEvent('CustomEvent'))
                  );
                }
                return fromEvent(window, 'online').pipe(
                  // startWith(connectionDisconnected(connectionId, err)),
                );
              })
            )
          ),
          takeUntil(action$.ofType(DISCONNECT_CONNECTION)),
          flatMap(receiveFrame)
        )
      )
    );

  const errorEpic = (action$: ActionsObservable<AnyAction>/*, state$, dependencies*/) =>
    action$.pipe(
      ofType(CONNECTION_ERROR),
      map((err) =>
        globalAlert(
          `[${name}] WebSocket error ${JSON.stringify(err)}`,
          AlertLevel.DANGER))
    );

  return combineEpics(reconnectEpic, errorEpic);
}
