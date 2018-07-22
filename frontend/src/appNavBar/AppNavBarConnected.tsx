import {connect} from 'react-redux';
import {AppRootState} from '../reduxStore/store';
import {selectConnectionsMap} from '../clientStreams/redux-duck';
import {AppNavBar} from './AppNavBar';

const mapStateToProps =
  (state: AppRootState) => ({
    clientStreamsMap: selectConnectionsMap(state),
  });

export const AppNavBarConnected = connect(mapStateToProps)(AppNavBar);
