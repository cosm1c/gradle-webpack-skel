import {Map as ImmutableMap} from 'immutable';
import {NextObserver, Observer, Subscription} from 'rxjs';
import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/webSocket';
import {empty} from 'rxjs/internal/Observer';

interface SubStream {
  readonly streamURI: string;
  readonly observer: Observer<any>;
  readonly onReconnect?: () => {};
}

export default class RxSocket {

  private static readonly streamCtlId = '_stream';
  private static readonly streamWebSocketDisconnectedError = 'WebSocket Disconnected';

  private readonly webSocketSubjectConfig: WebSocketSubjectConfig<any>;

  private webSocketSubject$: WebSocketSubject<any>;
  private subscription?: Subscription;
  private streamCounter = 0;
  private isOpen: boolean = false;
  private streams: ImmutableMap<string, SubStream> = ImmutableMap();

  constructor(readonly url: string,
              openObserver?: NextObserver<Event>,
              closeObserver?: NextObserver<CloseEvent>,
              closingObserver?: NextObserver<void>) {

    this.webSocketSubjectConfig = {

      url,
      closingObserver,

      openObserver: {
        next: (event: Event) => {
          console.info(`webSocketSubject openObserver url=${url}`, event);

          if (openObserver) {
            openObserver.next(event);
          }

          this.isOpen = true;

          if (!this.streams.isEmpty()) {
            this.webSocketSubject$!.next(
              this.streams.mapEntries((entry) => [entry![0], entry![1].streamURI]).toJS());
          }
        },
      },

      closeObserver: {
        next: (closeEvent: CloseEvent) => {
          console.info(`webSocketSubject closeObserver url=${url}`, closeEvent);
          this.subscription = undefined;

          this.isOpen = false;

          const streamsToClose = this.streams;
          this.streams = ImmutableMap();
          streamsToClose.forEach((stream) => {
            stream!.observer.error(RxSocket.streamWebSocketDisconnectedError);
            if (stream!.onReconnect) {
              stream!.onReconnect!();
            }
          });

          if (closeObserver) {
            closeObserver.next(closeEvent);
          }
        },
      },
    };

    this.webSocketSubject$ = new WebSocketSubject(this.webSocketSubjectConfig);
  }

  public connect(): void {
    if (this.subscription) {
      throw new Error(`webSocketSubject already subscribed url=${this.url}`);
    }

    this.subscription = this.webSocketSubject$.subscribe(
      this.receiveWebSocketFrame,
      (err: any) => console.error(`webSocketSubject onError url=${this.url}`, err),
      () => console.info(`webSocketSubject onComplete url=${this.url}`)
    );
  }

  public disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public subscribeStream(streamURI: string, observer: Observer<any>, onReconnect?: () => void): Subscription {

    try {
      decodeURI(streamURI);
    } catch (e) {
      const err = new Error('Invalid streamURI - ' + e);
      console.error(err);
      observer.error(err);
      throw err;
    }

    const streamId = this.nextStreamId();

    this.streams = this.streams.set(streamId, {streamURI, observer});

    const subscription = new Subscription(() => {
      if (this.isOpen) {
        this.webSocketSubject$!.next({[streamId]: null});
      }
    });

    subscription.add(() => {
      this.streams = this.streams.set(streamId, {
        streamURI,
        observer: empty,
      });
    });

    if (this.isOpen) {
      if (onReconnect) {
        onReconnect();
      }

      this.webSocketSubject$!.next({[streamId]: streamURI});

    } else {
      console.debug(`webSocketSubject queueing subscription for stream ${streamId}:${streamURI} until reconnect - url=${this.url}`);
    }

    return subscription;
  }

  private receiveWebSocketFrame: (msg: any) => void =
    (msg) => {
      if (typeof msg !== 'object') {
        console.error(`url=${this.url} MalformedStreamMessage: ${JSON.stringify(msg)}`);
        return;
      }

      Object.keys(msg)
        .forEach((streamId) => {
          if (streamId !== RxSocket.streamCtlId) {
            const clientStream = this.streams.get(streamId);
            if (clientStream) {
              clientStream.observer.next(msg[streamId]);
            } else {
              this.webSocketSubject$!.next({[streamId]: `Unknown streamId '${streamId}'`});
              console.warn(`UnknownStream with id "${streamId}" url="${this.url}" received: ${JSON.stringify(msg[streamId])}`);
            }
          }
        });

      if (msg._stream) {
        Object.keys(msg._stream)
          .forEach((streamId) => {
              const cmd = msg._stream[streamId];
              const clientStream = this.streams.get(streamId);
              if (cmd === null) {
                if (clientStream) {
                  clientStream.observer.complete();
                  this.streams = this.streams.delete(streamId);
                } else {
                  console.warn(`CompleteUnknownStream url="${this.url}" streamId="${streamId}"`);
                }

              } else if (typeof cmd === 'string') {
                if (clientStream) {
                  clientStream.observer.error(cmd);
                  this.streams = this.streams.delete(streamId);
                } else {
                  console.warn(`ErrorUnknownStream url="${this.url}" streamId="${streamId}" value=${cmd}`);
                }

              } else {
                if (clientStream) {
                  clientStream.observer.error(`InvalidStreamCommand url="${this.url}" streamId="${streamId}" value=${JSON.stringify(cmd)}`);
                  this.streams = this.streams.delete(streamId);
                } else {
                  console.error(`InvalidUnknownStreamCmd url="${this.url}" streamId="${streamId}" value=${JSON.stringify(cmd)}`);
                }
              }
            },
            this);
      }
    };

  private nextStreamId = () => `${this.streamCounter++}`;

}
