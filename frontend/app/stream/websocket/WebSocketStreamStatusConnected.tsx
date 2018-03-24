import {selectWebSocketConnectionState} from './selectors';
import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {WebSocketStreamStatus} from './WebSocketStreamStatus';

const mapStateToProps = (state: IRootStateRecord) => ({
  connectionState: selectWebSocketConnectionState(state),
});

export const WebSocketStreamStatusConnected = connect(mapStateToProps)(WebSocketStreamStatus);
