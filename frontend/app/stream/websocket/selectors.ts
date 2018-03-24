import {IRootStateRecord} from '../../store';
import {ConnectionStateEnum} from './WebSocketStateRecord';

export const selectWebSocketConnectionState: (state: IRootStateRecord) => (ConnectionStateEnum) =
  state => state.get('webSocketState').get('connection');

export const selectWebSocketErrorMessage: (state: IRootStateRecord) => string =
  state => state.get('webSocketState').get('errorMessage');
