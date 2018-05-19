import {connect} from 'react-redux';
import {IRootStateRecord} from '../store';
import {selectConnectionState} from '../navbar/connection/selectors';
import {AppTabs} from './AppTabs';

const mapStateToProps = (state: IRootStateRecord) => ({
  connectionState: selectConnectionState(state),
});

export const AppTabsConnected = connect(mapStateToProps)(AppTabs);
