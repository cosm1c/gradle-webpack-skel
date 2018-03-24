import {bindActionCreators} from 'redux';
import {connect, Dispatch} from 'react-redux';
import {IRootAction, IRootStateRecord} from '../store';
import {ErrorToaster} from './ErrorToaster';
import {selectGlobalErrorMessage} from './selectors';
import {globalErrorActionCreators} from './actions';

const mapStateToProps = (state: IRootStateRecord) => ({
  globalError: selectGlobalErrorMessage(state),
});

const mapDispatchToProps = (dispatch: Dispatch<IRootAction>) => bindActionCreators({
  ackGlobalError: globalErrorActionCreators.ackGlobalError,
}, dispatch);

export const ErrorToasterConnected = connect(mapStateToProps, mapDispatchToProps)(ErrorToaster);
