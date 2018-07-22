import {Map as ImmutableMap} from 'immutable';
import {Reducer} from 'redux';
import {ActionType} from 'typesafe-actions';
import reducerRegistry from '../reduxStore/reducerRegistry';
import * as connectionAction from './actions';
import {
  CONNECTION_CONNECTED,
  CONNECTION_CONNECTING,
  CONNECTION_DISCONNECTED,
  CONNECTION_DISCONNECTING,
  CONNECTION_ERROR,
  CONNECTION_OFFLINE
} from './actions';
import {ConnectionStatusEnum, IConnectionStateRecord, initialConnectionState} from './ConnectionStateRecord';
import {AppRootState} from '../reduxStore/store';
import {IClientStreamsStateRecord, initialClientStreamState} from './ClientStreamsStateRecord';

const reducerName = 'clientStreams';

export type ClientStreamsAction = ActionType<typeof connectionAction>;

export type ClientStreamsMap = ImmutableMap<string, IConnectionStateRecord>;

const reducer: Reducer<IClientStreamsStateRecord> =
  (state = initialClientStreamState, action) => {
    switch (action.type) {
      // case CONNECT_CONNECTION:
      //   return setConnectionState(state, ConnectionStatusEnum.CONNECTING);
      //
      // case DISCONNECT_CONNECTION:
      //   return setConnectionState(state, ConnectionStatusEnum.DISCONNECTING);

      case CONNECTION_CONNECTED:
        return state.setIn(['connectionsMap', action.payload.id, 'status'], ConnectionStatusEnum.CONNECTED);
      case CONNECTION_ERROR:
        return state.setIn(['connectionsMap', action.payload.id, 'message'], action.payload.errorMessage);
      case CONNECTION_CONNECTING:
        return state.setIn(['connectionsMap', action.payload.id, 'status'], ConnectionStatusEnum.CONNECTING);
      case CONNECTION_DISCONNECTING:
        return state.setIn(['connectionsMap', action.payload.id, 'status'], ConnectionStatusEnum.DISCONNECTING);
      case CONNECTION_DISCONNECTED:
        return state.setIn(['connectionsMap', action.payload.id, 'status'], ConnectionStatusEnum.DISCONNECTED);
      case CONNECTION_OFFLINE:
        return state.setIn(['connectionsMap', action.payload.id, 'status'], ConnectionStatusEnum.OFFLINE);
      default:
        return state;
    }
  };

reducerRegistry.register(reducerName, reducer);

export default reducer;

export const selectConnectionsMap: (state: AppRootState) => ClientStreamsMap =
  (state) => state.get(reducerName, initialClientStreamState).get('connectionsMap', ImmutableMap());

export const selectConnectionState: (state: AppRootState, connectionId: string) => IConnectionStateRecord =
  (state, connectionId) => selectConnectionsMap(state).get(connectionId, initialConnectionState);
