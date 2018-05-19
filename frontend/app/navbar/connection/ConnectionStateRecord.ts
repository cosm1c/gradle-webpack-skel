import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';

export const enum ConnectionStateEnum {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  OFFLINE,
}

interface IConnectionState {
  connection: ConnectionStateEnum;
}

const defaultStreamState: IConnectionState = {
  connection: ConnectionStateEnum.DISCONNECTED,
};

export interface IConnectionStateRecord extends TypedRecord<IConnectionStateRecord>, IConnectionState {
}

export const ConnectionStateRecordFactory = makeTypedFactory<IConnectionState, IConnectionStateRecord>(defaultStreamState);

export const initialConnectionState = ConnectionStateRecordFactory();
