import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {selectConnectionState} from './selectors';
import {ConnectionStatus} from './ConnectionStatus';

const mapStateToProps = (state: IRootStateRecord) => ({
  connectionState: selectConnectionState(state),
});

export const ConnectionStatusConnected = connect(mapStateToProps)(ConnectionStatus);
