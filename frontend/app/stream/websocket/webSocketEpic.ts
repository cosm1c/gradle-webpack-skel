/*
 * websocket.ts
 */
import {Observable} from 'rxjs/Observable';
import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/observable/dom/WebSocketSubject';
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
import {default as store, IRootAction, IRootStateRecord} from '../../store';
import {CONNECT_STREAM, DISCONNECT_STREAM, streamActionCreators as wsActions} from '../index';
import {clientStreams} from '../ClientStreams';

// Used by DefinePlugin
declare const IS_PROD: string;

// TODO: use exponential backoff - eg: Math.min(30, (Math.pow(2, k) - 1)) * 1000
const RECONNECT_DELAY_MS = 1000;

function calcWsUrl(): string {
  if (!IS_PROD) {
    const wsUrl = 'ws://localhost:8080/ws';
    const msg = `[${new Date().toISOString()}] DEVELOPMENT MODE ENGAGED - websocket URL:`;
    // '='.repeat(msg.length + wsUrl.length + 1) +
    console.warn(`======================================\n${msg}`, wsUrl);
    return wsUrl;
  }

  if (window.location.protocol !== 'https:') {
    console.warn('Using insecure ws protocol as page loaded with', window.location.protocol);
  }

  return window.location.protocol === 'https:' ? `wss://${window.location.host}:8080/ws` : `ws://${window.location.host}/ws`;
}

// TODO: for unit testing use store dependencies to inject websocket creator
const webSocketSubjectConfig: WebSocketSubjectConfig = {
  url: calcWsUrl(),
  openObserver: {
    next: () => {
      console.info(`[${new Date().toISOString()}] WebSocket connected`);
      store.dispatch(wsActions.streamConnected());
    }
  },
  closeObserver: {
    next: () => {
      console.info(`[${new Date().toISOString()}] WebSocket disconnected`);
      store.dispatch(wsActions.streamDisconnected());
    }
  },
};

export const webSocketSubject: WebSocketSubject<any> =
  WebSocketSubject.create(webSocketSubjectConfig) as WebSocketSubject<any>;

export const webSocketEpic: Epic<IRootAction, IRootStateRecord> =
  combineEpics(
    (action$/*, store*/) =>
      action$.ofType(CONNECT_STREAM)
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
            .takeUntil(action$.ofType(DISCONNECT_STREAM))
            .flatMap(clientStreams.receive)
        ));
