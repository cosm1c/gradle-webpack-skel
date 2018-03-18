import {selectClientCount} from './selectors';
import {connect} from 'react-redux';
import {IRootStateRecord} from '../store';
import {ClientCount} from './ClientCount';

const mapStateToProps = (state: IRootStateRecord) => ({
  clientCount: selectClientCount(state),
});

export const ClientCountConnected = connect(mapStateToProps)(ClientCount);
