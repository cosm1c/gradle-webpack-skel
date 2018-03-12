import {getUserCount} from './selectors';
import {connect} from 'react-redux';
import {IRootStateRecord} from '../store';
import {UserCount} from './UserCount';

const mapStateToProps = (state: IRootStateRecord) => ({
  userCount: getUserCount(state),
});

export const UserCountConnected = connect(mapStateToProps)(UserCount);
