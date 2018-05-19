import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {selectChartKeysWidgetArray, WidgetList} from './index';
import {WidgetListProps} from './WidgetList';

const mapStateToProps: (state: IRootStateRecord) => WidgetListProps =
  (state: IRootStateRecord) => ({
    widgets: selectChartKeysWidgetArray(state),
  });

export const ChartStreamsListConnected = connect(mapStateToProps)(WidgetList);
