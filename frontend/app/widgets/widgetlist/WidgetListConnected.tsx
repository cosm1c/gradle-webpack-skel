import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {WidgetList, selectWidgetArray} from './index';

const mapStateToProps = (state: IRootStateRecord) => ({
  widgets: selectWidgetArray(state),
});

export const WidgetListConnected = connect(mapStateToProps)(WidgetList);
