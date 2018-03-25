import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/observable/dom/WebSocketSubject';
import {Store} from 'redux';
import {IRootAction, rootEpic$} from '../../store';
import {createWebSocketEpic, websocketActionCreators} from './';

export class WebSocketStream {

  private readonly webSocketSubject: WebSocketSubject<any>;

  constructor(readonly wsUrl: string,
              private readonly store: Store<any>,
              readonly receiveFrame: (msg: any) => IRootAction[],
              readonly openObserver: () => void,
              readonly closeObserver: () => void) {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.receiveError = this.receiveError.bind(this);

    const webSocketSubjectConfig: WebSocketSubjectConfig = {
      url: wsUrl,
      openObserver: {
        next: () => {
          console.info(`[${new Date().toISOString()}] WebSocket connected`);
          store.dispatch(websocketActionCreators.webSocketConnected());
          openObserver();
        }
      },
      closeObserver: {
        next: () => {
          console.info(`[${new Date().toISOString()}] WebSocket disconnected`);
          store.dispatch(websocketActionCreators.webSocketDisconnected());
          closeObserver();
        }
      },
    };

    this.webSocketSubject = WebSocketSubject.create(webSocketSubjectConfig) as WebSocketSubject<any>;

    rootEpic$.next(createWebSocketEpic(this.webSocketSubject, this.receiveFrame));

    this.webSocketSubject.subscribe({
      error: this.receiveError
    });
  }

  connect(): void {
    this.store.dispatch(websocketActionCreators.connectWebSocket());
  }

  disconnect(): void {
    this.store.dispatch(websocketActionCreators.disconnectWebSocket());
  }

  send(streamId: string, data: any) {
    this.webSocketSubject.next(JSON.stringify({[streamId]: data}));
  }

  private receiveError(err: string): void {
    this.store.dispatch(websocketActionCreators.webSocketError(err));
  }

}
