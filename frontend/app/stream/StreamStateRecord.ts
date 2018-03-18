import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';

export enum StreamStateEnum {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  DISCONNECTING,
}

export function streamStateDisplay(streamStateEnum: StreamStateEnum) {
  return StreamStateEnum[streamStateEnum];
}

interface IStreamState {
  connection: StreamStateEnum;
  errorMessage: string;
}

const defaultStreamState: IStreamState = {
  connection: StreamStateEnum.DISCONNECTED,
  errorMessage: '',
};

export interface IStreamStateRecord extends TypedRecord<IStreamStateRecord>, IStreamState {
}

export const StreamStateRecordFactory = makeTypedFactory<IStreamState, IStreamStateRecord>(defaultStreamState);

export const initialStreamState = StreamStateRecordFactory();
