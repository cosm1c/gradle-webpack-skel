import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';

export const enum ConnectionStatusEnum {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
  OFFLINE,
}

interface IConnectionState {
  id: string;
  connectedSince: Date;
  status: ConnectionStatusEnum;
}

const defaultStreamState: IConnectionState = {
  id: 'Invalid Connection',
  connectedSince: new Date(),
  status: ConnectionStatusEnum.DISCONNECTED,
};

export interface IConnectionStateRecord extends TypedRecord<IConnectionStateRecord>, IConnectionState {
}

export const ConnectionStateRecordFactory = makeTypedFactory<IConnectionState, IConnectionStateRecord>(defaultStreamState);

export const initialConnectionState = ConnectionStateRecordFactory();
