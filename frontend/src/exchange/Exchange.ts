import RxSocket from '@/exchange/RxSocket';
import {NextObserver, Observer, Subscription} from 'rxjs';

interface MergeStreamObserver {
  streamURI: string;
  observer: Observer<any>;
  onReconnect?: () => void;
}

export class Exchange {

  private connectionMap = new Map<string, RxSocket>();
  private mergeObserversMap = new Map<Observer<any>, MergeStreamObserver>();

  public connect(name: string,
                 url: string,
                 autoReconnect: boolean = true,
                 openObserver?: NextObserver<Event>,
                 closeObserver?: NextObserver<CloseEvent>,
                 closingObserver?: NextObserver<void>) {
    if (this.connectionMap.has(name)) {
      throw new Error(`Duplicate connection for "${name}"`);
    }

    const rxSocket = new RxSocket(
      url,
      {
        next: (event) => {
          this.mergeObserversMap
            .forEach(({streamURI, observer, onReconnect}) =>
              rxSocket.subscribeStream(streamURI, observer, onReconnect));

          if (openObserver) {
            openObserver.next(event);
          }
        },
      },
      {
        next: (closeEvent) => {
          if (autoReconnect) {
            // TODO: increase reconnect timeouts: 929, 1999, 3989, 7919
            setTimeout(() => rxSocket.connect(), 1999);
          }

          if (closeObserver) {
            closeObserver.next(closeEvent);
          }
        },
      },
      closingObserver);

    this.connectionMap.set(name, rxSocket);
    rxSocket.connect();
  }

  public list(): IterableIterator<string> {
    return this.connectionMap.keys();
  }

  public subscribeStream(streamURI: string, observer: Observer<any>, onReconnect?: () => void, connectionName?: string): Subscription {
    let name: string;
    if (connectionName) {
      name = connectionName;

    } else if (this.connectionMap.size === 0) {
      observer.error('No connection');
      return Subscription.EMPTY;

    } else {
      name = this.connectionMap.keys().next().value;
    }

    const rxSocket = this.connectionMap.get(name);
    if (!rxSocket) {
      throw new Error(`Unknown connection "${connectionName}"`);
    }

    return rxSocket.subscribeStream(streamURI, observer, onReconnect);
  }

  public subscribeMergedStream(streamURI: string, observer: Observer<any>, onReconnect?: () => void): Subscription {
    this.mergeObserversMap.set(observer, {streamURI, observer, onReconnect});

    this.connectionMap.forEach((conn) => conn.subscribeStream(streamURI, observer));

    return new Subscription(() => {
      this.unsubscribeMergedStream(observer);
    });
  }

  public unsubscribeMergedStream(observer: Observer<any>): void {
    this.mergeObserversMap.delete(observer);
  }

}

export default new Exchange();
