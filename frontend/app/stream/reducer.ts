import {AnyAction, Reducer} from 'redux';
import {CONNECT_STREAM, DISCONNECT_STREAM, STREAM_CONNECTED, STREAM_DISCONNECTED} from './actions';
import {initialStreamState, IStreamStateRecord, StreamStateEnum} from './StreamStateRecord';

function setStreamState(state: IStreamStateRecord, newValue: StreamStateEnum): IStreamStateRecord {
  return state.setIn(['connection'], newValue);
}

export const streamReducer: Reducer<IStreamStateRecord> =
  (state: IStreamStateRecord = initialStreamState, action: AnyAction): IStreamStateRecord => {
    switch (action.type) {
      case CONNECT_STREAM:
        return setStreamState(state, StreamStateEnum.CONNECTING);

      case STREAM_CONNECTED:
        return setStreamState(state, StreamStateEnum.CONNECTED);

      case DISCONNECT_STREAM:
        return setStreamState(state, StreamStateEnum.DISCONNECTING);

      case STREAM_DISCONNECTED:
        return setStreamState(state, StreamStateEnum.DISCONNECTED);

      default:
        return state;
    }
  };
