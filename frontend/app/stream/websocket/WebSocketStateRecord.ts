import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';

export enum ConnectionStateEnum {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  OFFLINE,
}

export function connectionStateDisplay(ConnectionStateEnum: ConnectionStateEnum) {
  return ConnectionStateEnum[ConnectionStateEnum];
}

interface IWebSocketState {
  connection: ConnectionStateEnum;
  errorMessage: string;
}

const defaultStreamState: IWebSocketState = {
  connection: ConnectionStateEnum.DISCONNECTED,
  errorMessage: '',
};

export interface IWebSocketStateRecord extends TypedRecord<IWebSocketStateRecord>, IWebSocketState {
}

export const WebSocketStateRecordFactory = makeTypedFactory<IWebSocketState, IWebSocketStateRecord>(defaultStreamState);

export const initialWebSocketState = WebSocketStateRecordFactory();
