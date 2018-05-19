import {AnyAction, Reducer} from 'redux';
import {
  CONNECTION_CONNECTED,
  CONNECTION_CONNECTING,
  CONNECTION_DISCONNECTED,
  CONNECTION_DISCONNECTING,
  CONNECTION_ERROR,
  CONNECTION_OFFLINE,
} from './actions';
import {ConnectionStateEnum, IConnectionStateRecord, initialConnectionState} from './ConnectionStateRecord';

function setConnectionState(state: IConnectionStateRecord, newValue: ConnectionStateEnum): IConnectionStateRecord {
  return state.setIn(['connection'], newValue);
}

export const connectionStateReducer: Reducer<IConnectionStateRecord> =
  (state: IConnectionStateRecord = initialConnectionState, action: AnyAction): IConnectionStateRecord => {
    switch (action.type) {
      // case CONNECT_CONNECTION:
      //   return setConnectionState(state, ConnectionStateEnum.CONNECTING);
      //
      // case DISCONNECT_CONNECTION:
      //   return setConnectionState(state, ConnectionStateEnum.DISCONNECTING);

      case CONNECTION_CONNECTED:
        return setConnectionState(state, ConnectionStateEnum.CONNECTED);

      case CONNECTION_ERROR:
        return state.setIn(['errorMessage'], action.errorMessage);

      case CONNECTION_CONNECTING:
        return setConnectionState(state, ConnectionStateEnum.CONNECTING);

      case CONNECTION_DISCONNECTING:
        return setConnectionState(state, ConnectionStateEnum.DISCONNECTING);

      case CONNECTION_DISCONNECTED:
        return setConnectionState(state, ConnectionStateEnum.DISCONNECTED);

      case CONNECTION_OFFLINE:
        return setConnectionState(state, ConnectionStateEnum.OFFLINE);

      default:
        return state;
    }
  };
