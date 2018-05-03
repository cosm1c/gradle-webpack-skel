import {Observer} from 'rxjs/Observer';
import {Store} from 'redux';
import {ClientStreams} from './stream';
import {MonoidStoreObserver} from './monoidstore';
import {default as store, IRootStateRecord} from './store';

class App {

  public readonly clientStreams: ClientStreams;

  constructor(public readonly store: Store<IRootStateRecord>) {
    this.clientStreams = new ClientStreams(
      this.calcWsUrl(),
      new Map<string, Observer<any>>([
        ['store', new MonoidStoreObserver(store)]
      ]), store);
    this.clientStreams.connect();
  }

  private calcWsUrl(): string {
    if (process.env.NODE_ENV !== 'production') {
      const wsUrl = 'ws://localhost:8080/ws';
      console.warn(`[${new Date().toISOString()}] DEVELOPMENT MODE ENGAGED - WebSocket URL: ${wsUrl}`);
      return wsUrl;
    }

    if (window.location.protocol !== 'https:') {
      console.warn('Using insecure ws protocol as page loaded with', window.location.protocol);
    }

    return window.location.protocol === 'https:' ? `wss://${window.location.host}:8080/ws` : `ws://${window.location.host}/ws`;
  }

}

const app: App = new App(store);

export default app;
