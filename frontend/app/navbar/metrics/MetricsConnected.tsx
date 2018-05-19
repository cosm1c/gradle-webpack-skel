import {selectClientCount} from './selectors';
import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {Metrics} from './Metrics';

const mapStateToProps = (state: IRootStateRecord) => ({
  webSocketCount: selectClientCount(state),
});

export const MetricsConnected = connect(mapStateToProps)(Metrics);
