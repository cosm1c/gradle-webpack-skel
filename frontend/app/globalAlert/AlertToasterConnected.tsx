import {bindActionCreators} from 'redux';
import {connect, Dispatch} from 'react-redux';
import {IRootAction, IRootStateRecord} from '../store';
import {AlertToaster} from './AlertToaster';
import {selectGlobalAlert} from './selectors';
import {globalAlertActionCreators} from './actions';

const mapStateToProps = (state: IRootStateRecord) => ({
  globalAlert: selectGlobalAlert(state),
});

const mapDispatchToProps = (dispatch: Dispatch<IRootAction>) => bindActionCreators({
  ackGlobalAlert: globalAlertActionCreators.ackGlobalAlert,
}, dispatch);

export const AlertToasterConnected = connect(mapStateToProps, mapDispatchToProps)(AlertToaster);
