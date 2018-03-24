import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {WidgetList, selectWidgetList} from './index';

const mapStateToProps = (state: IRootStateRecord) => ({
  widgets: selectWidgetList(state),
});

export const WidgetListConnected = connect(mapStateToProps)(WidgetList);
