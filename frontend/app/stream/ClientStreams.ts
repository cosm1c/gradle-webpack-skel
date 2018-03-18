import {Observer} from 'rxjs/Observer';
import store, {IRootAction} from '../store';
import {monoidStoreObserver} from '../monoidstore';
import {streamActionCreators} from './actions';
import {webSocketSubject} from './websocket/webSocketEpic';

const errorMessageObserver: Observer<any> = {

  next(value: any) {
    store.dispatch(streamActionCreators.streamError(
      typeof value === 'string' ? value : JSON.stringify(value)
    ));
  },

  error(err: any) {
    console.error('storeError', err);
    store.dispatch(streamActionCreators.streamError(
      typeof err === 'string' ? err : JSON.stringify(err)
    ));
  },

  complete() {
    console.info('storeComplete');
    store.dispatch(streamActionCreators.streamError('storeComplete'));
  }
};

class ClientStreams {

  private readonly streams: Map<string, Observer<any>> = new Map<string, Observer<any>>();

  constructor() {
    this.streams.set('errorMessage', errorMessageObserver);
    this.streams.set('store', monoidStoreObserver);
  }

  subscribe(streamId: string, streamURI: string, observer: Observer<any>) {
    this.streams.set(streamId, observer);
    const req = {};
    req[streamId] = streamURI;
    webSocketSubject.next(JSON.stringify(req));
  }

  receive: (msg: any) => IRootAction[] =
    msg => {
      if (typeof msg !== 'object') {
        errorMessageObserver.next(`MalformedStreamMessage: ${JSON.stringify(msg)}`);
      }

      Object.entries(msg)
        .filter(([streamId]) => streamId !== '_stream')
        .forEach(
          ([streamId, value]) => {
            if (this.streams.has(streamId)) {
              this.streams.get(streamId)!.next(value);
            } else {
              errorMessageObserver.next(`UnknownStream streamId="${streamId}" value=${JSON.stringify(value)}`);
            }
          },
          this
        );

      if (msg._stream) {
        Object.entries(msg._stream)
          .forEach(([streamId, cmd]) => {
              if (cmd === null) {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.complete();
                } else {
                  errorMessageObserver.next(`CompleteUnknownStream streamId="${streamId}"`);
                }

              } else if (typeof cmd === 'string') {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.error(cmd);
                } else {
                  errorMessageObserver.next(`ErrorUnknownStream streamId="${streamId}" value=${cmd}`);
                }

              } else {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.error(`InvalidStreamCommand streamId="${streamId}" value=${JSON.stringify(cmd)}`);
                } else {
                  errorMessageObserver.next(`InvalidUnknownStreamCmd streamId="${streamId}" value=${JSON.stringify(cmd)}`);
                }
              }
            },
            this);
      }

      return [];
    }

}

export const clientStreams = new ClientStreams();
