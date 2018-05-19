import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/dom/webSocket';
import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/observable/dom/WebSocketSubject';
import {ConnectionAction, connectionActionCreators} from '../navbar/connection/actions';
import {createWebSocketEpic} from './epic';
import {IRootAction, rootEpic$, rootStore} from '../store';
import {GlobalAlertAction, globalAlertActionCreators} from '../globalAlert/actions';
import {MonoidStoreObserver} from '../monoidstore/MonoidStoreObserver';
import {MonoidStoreAction} from '../monoidstore/actions';

class ClientStreams {

  private static readonly DISCONNECTED_STREAM_OBSERVER: Observer<any> = {
    next: () => {
    },
    error: () => {
    },
    complete: () => {
    },
  };

  private readonly streams: Map<string, Observer<any>> = new Map<string, Observer<any>>();
  private webSocketSubject?: WebSocketSubject<any>;

  private streamCounter = 0;

  constructor(dispatchConnectionAction: (connectionAction: ConnectionAction) => any,
              private readonly dispatchGlobalAlertAction: (globalAlertAction: GlobalAlertAction) => any,
              dispatchMonoidStoreAction: (monoidStoreAction: MonoidStoreAction) => any) {

    this.streams.set('store', new MonoidStoreObserver(dispatchGlobalAlertAction, dispatchMonoidStoreAction));

    this.connectWebSocket(dispatchConnectionAction)
      .then(webSocketSubject => {
        if (!webSocketSubject) {
          dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert('Failed to connect WebSocket', 'danger'));
        } else {
          this.webSocketSubject = webSocketSubject;
        }
      });
  }

  private receiveError = (err: any) => {
    console.error('WebSocket Error', err);
    // this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(`WebSocket error ${JSON.stringify(err)}`, 'danger'));
  };

  dispose = () => {
    this.webSocketSubject && this.webSocketSubject.unsubscribe();
  };

  subscribeStream: (streamURI: string, observer: Observer<any>) => Subscription =
    (streamURI, observer) => {
      const streamId = this.nextStreamId();
      this.send(streamId, streamURI);
      this.streams.set(streamId, observer);

      const subscription = new Subscription(() => {
        this.send(streamId, null);
      });

      subscription.add(() => {
        this.streams.set(streamId, ClientStreams.DISCONNECTED_STREAM_OBSERVER);
      });

      return subscription;
    };

  private send = (streamId: string, data: any) => {
    // console.warn('send', streamId, data);
    if (!this.webSocketSubject) {
      console.warn('Attempted to subscribe before WebSocket connected', data);
    } else {
      this.webSocketSubject.next(JSON.stringify({[streamId]: data}));
    }
  };

  private connectWebSocket(dispatchConnectionAction: (connectionAction: ConnectionAction) => any): Promise<WebSocketSubject<any>> {
    let eventualWsUrl = ClientStreams.fetchWsUrl();
    return eventualWsUrl
      .then(url => {
        const webSocketSubjectConfig: WebSocketSubjectConfig = {
          url,
          openObserver: {
            next: () => {
              console.info(`[${new Date().toISOString()}] WebSocket connected - ${url}`);
              dispatchConnectionAction(connectionActionCreators.connectionConnected());
            }
          },
          closeObserver: {
            next: () => {
              console.info(`[${new Date().toISOString()}] WebSocket disconnected - ${url}`);
              this.allStreamsDisconnected();
              dispatchConnectionAction(connectionActionCreators.connectionDisconnected());
            }
          },
        };

        const webSocketSubject = Observable.webSocket(webSocketSubjectConfig) as WebSocketSubject<any>;

        rootEpic$.next(createWebSocketEpic(webSocketSubject, this.receiveFrame));

        webSocketSubject.subscribe({
          error: this.receiveError
        });

        dispatchConnectionAction(connectionActionCreators.connectConnection());

        return webSocketSubject;
      });
  }

  private allStreamsDisconnected() {
    console.debug('allStreamsDisconnected');
    // this.streams.forEach(i => i.error('Main socket disconnected'));
    // this.streams.clear();
  }

  private static fetchWsUrl(): Promise<string> {
    // FIXME: TODO: uncomment code
    // if (process.env.NODE_ENV !== 'production') {
    const wsUrl = 'ws://localhost:8080/ws';
    console.warn(`[${new Date().toISOString()}] DEVELOPMENT MODE ENGAGED`);
    return Promise.resolve(wsUrl);
    // }
    //
    // if (window.location.protocol !== 'https:') {
    //   console.warn('Using insecure ws protocol as page loaded with', window.location.protocol);
    // }
    //
    // const httpPathPrefix = window.location.pathname.substring(1, window.location.pathname.indexOf('/', 1));
    // const fetchWsURl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/${httpPathPrefix}/wsUrl`;
    // return new Promise((resolve, reject) => {
    //   console.debug('Fetching WebSocket URL from', fetchWsURl);
    //   try {
    //     const xhr = new XMLHttpRequest();
    //     xhr.open('get', fetchWsURl, true);
    //     xhr.responseType = 'json';
    //     xhr.onload = () => {
    //       const status = xhr.status;
    //       const wsUrl = (typeof xhr.response === 'string') ? JSON.parse(xhr.response).wsUrl : xhr.response.wsUrl;
    //       if (status === 200 && wsUrl) {
    //         console.info('Using wsUrl:', wsUrl);
    //         resolve(wsUrl);
    //       } else {
    //         const err = `Failed to fetch wsUrl from ${fetchWsURl} - http response status ${status}`;
    //         reject(err);
    //         console.error(err, xhr.response);
    //       }
    //     };
    //     xhr.send();
    //   } catch (e) {
    //     const err = `Failed to fetch wsUrl from ${fetchWsURl} - error: ${e}`;
    //     console.log(err, e);
    //     reject(err);
    //   }
    // });
  }

  private receiveFrame: (msg: any) => IRootAction[] =
    msg => {
      if (typeof msg !== 'object') {
        return [globalAlertActionCreators.globalAlert(`MalformedStreamMessage: ${JSON.stringify(msg)}`, 'danger')];
      }

      Object.keys(msg)
        .forEach(streamId => {
          if (streamId !== '_stream') {
            if (this.streams.has(streamId)) {
              this.streams.get(streamId)!.next(msg[streamId]);
            } else {
              this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(`UnknownStream streamId="${streamId}" value=${JSON.stringify(msg[streamId])}`, 'warning'));
            }
          }
        });

      if (msg._stream) {
        Object.keys(msg._stream)
          .forEach(streamId => {
              const cmd = msg._stream[streamId];
              if (cmd === null) {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.complete();
                  this.streams.delete(streamId);
                } else {
                  this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(`CompleteUnknownStream streamId="${streamId}"`, 'warning'));
                }

              } else if (typeof cmd === 'string') {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.error(cmd);
                  this.streams.delete(streamId);
                } else {
                  this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(`ErrorUnknownStream streamId="${streamId}" value=${cmd}`, 'warning'));
                }

              } else {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.error(`InvalidStreamCommand streamId="${streamId}" value=${JSON.stringify(cmd)}`);
                  this.streams.delete(streamId);
                } else {
                  this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(`InvalidUnknownStreamCmd streamId="${streamId}" value=${JSON.stringify(cmd)}`, 'danger'));
                }
              }
            },
            this);
      }

      return [];
    };

  private nextStreamId(): string {
    return `s${this.streamCounter++}`;
  }
}

const clientStreams = new ClientStreams(
  rootStore.dispatch,
  rootStore.dispatch,
  rootStore.dispatch,
);

export default clientStreams;
