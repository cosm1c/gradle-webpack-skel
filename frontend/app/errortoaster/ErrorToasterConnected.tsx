import {bindActionCreators} from 'redux';
import {connect, Dispatch} from 'react-redux';
import {IRootAction, IRootStateRecord} from '../store';
import {ErrorToaster} from './ErrorToaster';
import {selectErrorMessage, streamActionCreators} from '../stream';

const mapStateToProps = (state: IRootStateRecord) => ({
  errorMessage: selectErrorMessage(state),
});

const mapDispatchToProps = (dispatch: Dispatch<IRootAction>) => bindActionCreators({
  handleDismiss: () => dispatch(streamActionCreators.streamError('')),
}, dispatch);

export const ErrorToasterConnected = connect(mapStateToProps, mapDispatchToProps)(ErrorToaster);
