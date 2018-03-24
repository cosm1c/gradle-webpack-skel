import {AnyAction, Reducer} from 'redux';
import {
  CONNECT_WEBSOCKET,
  DISCONNECT_WEBSOCKET,
  WEBSOCKET_CONNECTED,
  WEBSOCKET_CONNECTING,
  WEBSOCKET_DISCONNECTED,
  WEBSOCKET_DISCONNECTING,
  WEBSOCKET_ERROR,
  WEBSOCKET_OFFLINE
} from './actions';
import {ConnectionStateEnum, initialWebSocketState, IWebSocketStateRecord} from './WebSocketStateRecord';

function setWebSocketConnectionState(state: IWebSocketStateRecord, newValue: ConnectionStateEnum): IWebSocketStateRecord {
  return state.setIn(['connection'], newValue);
}

export const websocketStateReducer: Reducer<IWebSocketStateRecord> =
  (state: IWebSocketStateRecord = initialWebSocketState, action: AnyAction): IWebSocketStateRecord => {
    switch (action.type) {
      case CONNECT_WEBSOCKET:
        return setWebSocketConnectionState(state, ConnectionStateEnum.CONNECTING);

      case DISCONNECT_WEBSOCKET:
        return setWebSocketConnectionState(state, ConnectionStateEnum.DISCONNECTING);

      case WEBSOCKET_CONNECTED:
        return setWebSocketConnectionState(state, ConnectionStateEnum.CONNECTED);

      case WEBSOCKET_ERROR:
        // TODO: don't drop/overwrite error messages - implement class to handle errors in ringbuffer
        return state.setIn(['globalError'], action.errorMessage);

      case WEBSOCKET_CONNECTING:
        return setWebSocketConnectionState(state, ConnectionStateEnum.CONNECTING);

      case WEBSOCKET_DISCONNECTING:
        return setWebSocketConnectionState(state, ConnectionStateEnum.DISCONNECTING);

      case WEBSOCKET_DISCONNECTED:
        return setWebSocketConnectionState(state, ConnectionStateEnum.DISCONNECTED);

      case WEBSOCKET_OFFLINE:
        return setWebSocketConnectionState(state, ConnectionStateEnum.OFFLINE);

      default:
        return state;
    }
  };
