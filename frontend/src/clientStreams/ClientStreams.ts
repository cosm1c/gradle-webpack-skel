import {Map as ImmutableMap} from 'immutable';
import {Observer, Subscription} from 'rxjs';
import {empty} from 'rxjs/internal/Observer';
import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/webSocket';
import {AnyAction} from 'redux';
import store, {epicMiddleware} from '../reduxStore/store';
import {AlertLevel, fireGlobalAlert} from '../appAlert';
import {globalAlert} from '../appAlert/actions';
import {createWebSocketEpic} from './epic';
import {connectConnection, connectionConnected, connectionDisconnected} from './actions';
import {ClientStreamsAction} from './redux-duck';

interface ClientStream {
  readonly streamURI: string;
  readonly observer: Observer<any>;
}

interface Connection {
  readonly connectionId: string;
  readonly wsUrl: string;
  isConnected: boolean;
  streams: ImmutableMap<string, ClientStream>;
  readonly webSocketSubject$: WebSocketSubject<any>;
}

export interface SubStreamPayload {
  readonly connectionId: string;
  readonly data: any;
}

class ClientStreams {

  private static readonly streamCtlId = '_stream';
  private static readonly streamWebSocketDisconnectedError = 'WebSocket Disconnected';

  private connectionsMap = ImmutableMap<string, Connection>();
  private persistentConnectionsMap = ImmutableMap<string, Observer<SubStreamPayload>>();
  private streamCounter = 0;

  constructor(private readonly dispatchClientStreamsAction: (action: ClientStreamsAction) => any) {
  }

  public connectWebSocket(connectionId: string, url: string): void {
    if (this.connectionsMap.has(connectionId)) {
      throw new Error(`${connectionId} WebSocket already registered`);
    }

    const webSocketSubjectConfig: WebSocketSubjectConfig<any> = {
      url,
      openObserver: this.webSocketOpenObserverFor(connectionId),
      closeObserver: this.webSocketCloseObserverFor(connectionId),
    };

    const webSocketSubject = new WebSocketSubject(webSocketSubjectConfig);

    const connection: Connection = {
      connectionId,
      wsUrl: url,
      isConnected: false,
      streams: this.initialStreamsForConnection(connectionId),
      webSocketSubject$: webSocketSubject,
    };

    this.connectionsMap = this.connectionsMap.set(connectionId, connection);

    epicMiddleware.run(
      createWebSocketEpic(
        connectionId,
        webSocketSubject,
        this.receiveWebSocketFrameFor(connection)));

    this.dispatchClientStreamsAction(connectConnection(connectionId));
  }

  public subscribeStream: (connectionId: string, streamURI: string, observer: Observer<any>) => Subscription =
    (connectionId, streamURI, observer) => {
      try {
        decodeURI(streamURI);
      } catch (e) {
        const err = 'Invalid streamURI - ' + e;
        console.error(err);
        observer.error(err);
        throw err;
      }

      const connection = this.connectionsMap.get(connectionId);
      if (!connection) {
        const err = `Unknown connection '${connectionId}'`;
        console.error(err);
        observer.error(err);
        throw err;
      }

      const streamId = this.nextStreamId();

      connection.streams = connection.streams.set(streamId, {streamURI, observer});

      const subscription = new Subscription(() => {
        if (connection.isConnected) {
          connection.webSocketSubject$.next({[streamId]: null});
        }
      });

      subscription.add(() => {
        connection.streams = connection.streams.set(streamId, {
          streamURI,
          observer: empty,
        });
      });

      if (connection.isConnected) {
        connection.webSocketSubject$.next({[streamId]: streamURI});
      } else {
        console.debug(`${connectionId} WebSocket queueing subsription for stream ${streamId}:${streamURI} until reconnect`);
      }

      return subscription;
    };

  public subscribeMergeStream: (streamURI: string, observer: Observer<SubStreamPayload>) => Subscription =
    (streamURI, observer) => {
      try {
        decodeURI(streamURI);
      } catch (e) {
        const err = 'Invalid streamURI - ' + e;
        console.error(err);
        observer.error(err);
        throw err;
      }

      if (this.persistentConnectionsMap.has(streamURI)) {
        const err = `Duplicate merge stream for streamURI '${streamURI}'`;
        console.error(err);
        observer.error(err);
        throw err;
      }

      this.persistentConnectionsMap = this.persistentConnectionsMap.set(streamURI, observer);

      this.connectionsMap.keySeq().forEach((connectionId) => {
        if (connectionId) {
          const subStreamPayloadObserver: Observer<any> = {
            complete: observer.complete,
            error: observer.error,
            next: (data: any) => observer.next({connectionId, data}),
          };
          this.subscribeStream(connectionId, streamURI, subStreamPayloadObserver);
        }
      });

      return new Subscription(() => {
        console.warn('TODO: unsubscribeMergeStream', streamURI);
      });
    };

  private receiveWebSocketFrameFor(connection: Connection): (msg: any) => AnyAction[] {
    return (msg: any) => {

      if (typeof msg !== 'object') {
        return [globalAlert(`[${connection.connectionId}] MalformedStreamMessage: ${JSON.stringify(msg)}`, 'danger')];
      }

      Object.keys(msg)
        .forEach((streamId) => {
          if (streamId !== ClientStreams.streamCtlId) {
            const clientStream = connection.streams.get(streamId);
            if (clientStream) {
              clientStream.observer.next(msg[streamId]);
            } else {
              connection.webSocketSubject$.next({[streamId]: `Unknown streamId '${streamId}'`});
              fireGlobalAlert(`UnknownStream with id "${streamId}" on connection "${connection.connectionId}" received: ${JSON.stringify(msg[streamId])}`, AlertLevel.WARNING);
            }
          }
        });

      if (msg._stream) {
        Object.keys(msg._stream)
          .forEach((streamId) => {
              const cmd = msg._stream[streamId];
              const clientStream = connection.streams.get(streamId);
              if (cmd === null) {
                if (clientStream) {
                  clientStream.observer.complete();
                  connection.streams = connection.streams.delete(streamId);
                } else {
                  fireGlobalAlert(`CompleteUnknownStream connectionId="${connection.connectionId}" streamId="${streamId}"`, AlertLevel.WARNING);
                }

              } else if (typeof cmd === 'string') {
                if (clientStream) {
                  clientStream.observer.error(cmd);
                  connection.streams = connection.streams.delete(streamId);
                } else {
                  fireGlobalAlert(`ErrorUnknownStream connectionId="${connection.connectionId}" streamId="${streamId}" value=${cmd}`, AlertLevel.WARNING);
                }

              } else {
                if (clientStream) {
                  clientStream.observer.error(`InvalidStreamCommand connectionId="${connection.connectionId}" streamId="${streamId}" value=${JSON.stringify(cmd)}`);
                  connection.streams = connection.streams.delete(streamId);
                } else {
                  fireGlobalAlert(`InvalidUnknownStreamCmd connectionId="${connection.connectionId}" streamId="${streamId}" value=${JSON.stringify(cmd)}`, AlertLevel.DANGER);
                }
              }
            },
            this);
      }

      return [];
    };
  }

  private webSocketOpenObserverFor(connectionId: string) {
    return {
      next: (event: Event) => {
        console.info(`${connectionId} WebSocket connected`, event);
        const connection = this.connectionsMap.get(connectionId);
        if (!connection) {
          console.error(`${connectionId} WebSocket connected but not known`);

        } else if (!connection.isConnected) {
          // dispatch connect action before setting isConnected flag so all are batched in first call
          this.dispatchClientStreamsAction(connectionConnected(connectionId));
          connection.isConnected = true;

          if (!connection.streams.isEmpty()) {
            console.debug(`${connectionId} WebSocket subscribing ${connection.streams.size} queued streams`);
            connection.webSocketSubject$.next(connection.streams.mapEntries((entry) => {
              return [entry![0], entry![1].streamURI];
            }).toJS());
          }
        }
      },
    };
  }

  private webSocketCloseObserverFor(connectionId: string) {
    return {
      next: (closeEvent: CloseEvent) => {
        console.info(`${connectionId} WebSocket disconnected`, closeEvent);
        const connection = this.connectionsMap.get(connectionId);
        if (!connection) {
          console.error(`webSocketDisconnected called for unknown connection '${connectionId}'`);

        } else if (connection.isConnected) {
          connection.isConnected = false;
          const streamsToClose = connection.streams;

          connection.streams = this.initialStreamsForConnection(connectionId);

          this.dispatchClientStreamsAction(connectionDisconnected(connectionId));

          streamsToClose.forEach((stream) => stream && stream.observer.error(ClientStreams.streamWebSocketDisconnectedError));
        }
      },
    };
  }

  private initialStreamsForConnection(connectionId: string): ImmutableMap<string, ClientStream> {
    return this.persistentConnectionsMap.mapEntries((entry) => {
      const streamURI: string = entry![0];
      const substreamObserver: Observer<SubStreamPayload> = entry![1];

      const toSubStreamPayload: (data: any) => SubStreamPayload = (data) => ({connectionId, data});

      const observer: Observer<any> = {
        next: (value: any) => {
          substreamObserver.next(toSubStreamPayload(value));
        },
        error: substreamObserver.error,
        complete: substreamObserver.complete,
      };

      const clientStream: ClientStream = {streamURI, observer};

      return [this.nextStreamId(), clientStream];
    }) as ImmutableMap<string, ClientStream>;
  }

  private nextStreamId = () => `${this.streamCounter++}`;

}

const clientStreams = new ClientStreams(store.dispatch);

export default clientStreams;
