import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {AlertToaster} from './AlertToaster';
import {ackGlobalAlert} from './actions';
import {AppRootState} from '../reduxStore/store';
import {selectGlobalAlert} from './redux-duck';

const mapStateToProps =
  (state: AppRootState) => ({
    globalAlert: selectGlobalAlert(state),
  });

const mapDispatchToProps =
  (dispatch: Dispatch) => ({
    ackGlobalAlert: () => dispatch(ackGlobalAlert()),
  });

export const AlertToasterConnected = connect(mapStateToProps, mapDispatchToProps)(AlertToaster);
