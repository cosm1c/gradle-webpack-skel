import {getStreamState} from './selectors';
import {connect} from 'react-redux';
import {IRootStateRecord} from '../store';
import {StreamStatus} from './StreamStatus';

const mapStateToProps = (state: IRootStateRecord) => ({
  streamState: getStreamState(state),
});

export const StreamStatusConnected = connect(mapStateToProps)(StreamStatus);
