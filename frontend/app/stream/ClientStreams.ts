import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
import {Store} from 'redux';
import {IRootAction} from '../store';
import {globalErrorActionCreators} from '../globalError';
import {WebSocketStream} from './websocket';

export class ClientStreams {

  public readonly connect: () => void;
  public readonly disconnect: () => void;

  private readonly webSocketStream: WebSocketStream;
  private readonly streams: Map<string, Observer<any>> = new Map<string, Observer<any>>();

  private streamCounter = 0;

  constructor(wsUrl: string,
              initialObservers: Map<string, Observer<any>>,
              private readonly store: Store<any>) {
    this.webSocketStream = new WebSocketStream(wsUrl, store, this.receiveElement);
    this.connect = this.webSocketStream.connect.bind(this);
    this.disconnect = this.webSocketStream.disconnect.bind(this);

    initialObservers.forEach((observer, streamId) => {
      this.streams.set(streamId, observer);
    });
  }

  subscribeStream(streamURI: string, observer: Observer<any>): Subscription {
    const streamId = this.nextStreamId();

    this.webSocketStream.send(streamId, streamURI);
    this.streams.set(streamId, observer);

    const unsubscribeCallback = () => {
      this.webSocketStream.send(streamId, null);
    };

    return new Subscription(unsubscribeCallback);
  }

  private readonly receiveElement: (msg: any) => IRootAction[] =
    msg => {
      if (typeof msg !== 'object') {
        return [globalErrorActionCreators.globalError(new Error(`MalformedStreamMessage: ${JSON.stringify(msg)}`))];
      }

      Object.entries(msg)
        .filter(([streamId]) => streamId !== '_stream')
        .forEach(
          ([streamId, value]) => {
            if (this.streams.has(streamId)) {
              this.streams.get(streamId)!.next(value);
            } else {
              this.store.dispatch(
                globalErrorActionCreators.globalError(new Error(`UnknownStream streamId="${streamId}" value=${JSON.stringify(value)}`)));
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
                  this.store.dispatch(
                    globalErrorActionCreators.globalError(new Error(`CompleteUnknownStream streamId="${streamId}"`)));
                }

              } else if (typeof cmd === 'string') {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.error(cmd);
                } else {
                  this.store.dispatch(
                    globalErrorActionCreators.globalError(new Error(`ErrorUnknownStream streamId="${streamId}" value=${cmd}`)));
                }

              } else {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.error(`InvalidStreamCommand streamId="${streamId}" value=${JSON.stringify(cmd)}`);
                } else {
                  this.store.dispatch(
                    globalErrorActionCreators.globalError(new Error(`InvalidUnknownStreamCmd streamId="${streamId}" value=${JSON.stringify(cmd)}`)));
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
