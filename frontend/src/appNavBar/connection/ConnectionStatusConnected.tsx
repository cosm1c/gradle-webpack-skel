import {connect} from 'react-redux';
import {ConnectionStatus, ConnectionStatusOwnProps} from './ConnectionStatus';
import {AppRootState} from '../../reduxStore/store';
import {selectConnectionState} from '../../clientStreams/redux-duck';

const mapStateToProps =
  (state: AppRootState, connectionStatusOwnProps: ConnectionStatusOwnProps) => ({
    connectionState: selectConnectionState(state, connectionStatusOwnProps.connectionId),
  });

export const ConnectionStatusConnected = connect(mapStateToProps)(ConnectionStatus);
