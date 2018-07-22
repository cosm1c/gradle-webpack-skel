import {Map as ImmutableMap} from 'immutable';
import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';

interface IClientStreamsState {
  connectionsMap: ImmutableMap<string, IClientStreamsStateRecord>;
}

const defaultClientStreamsState: IClientStreamsState = {
  connectionsMap: ImmutableMap<string, IClientStreamsStateRecord>(),
};

export interface IClientStreamsStateRecord extends TypedRecord<IClientStreamsStateRecord>, IClientStreamsState {
}

export const ClientStreamsStateRecordFactory = makeTypedFactory<IClientStreamsState, IClientStreamsStateRecord>(defaultClientStreamsState);

export const initialClientStreamState = ClientStreamsStateRecordFactory();
