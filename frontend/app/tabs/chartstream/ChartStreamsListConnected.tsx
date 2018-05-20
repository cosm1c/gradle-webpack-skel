import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {selectChartKeysWidgetArray, WidgetList, WidgetListProps} from '../widgetlist';

const mapStateToProps: (state: IRootStateRecord) => WidgetListProps =
  (state: IRootStateRecord) => ({
    widgets: selectChartKeysWidgetArray(state),
  });

export const ChartStreamsListConnected = connect(mapStateToProps)(WidgetList);
