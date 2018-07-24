import {connect} from 'react-redux';
import {AppRootState} from '../../../reduxStore/store';
import {Widget, WidgetList, WidgetListProps} from '../widgetlist/WidgetList';
import {selectChartKeys} from './redux-duck';
import {createSelector, OutputSelector} from 'reselect';
import {chartStreamToWidget} from './ChartView';

export const selectChartKeysWidgetArray: OutputSelector<AppRootState, Widget[], (res1: string[]) => Widget[]> =
  createSelector(
    selectChartKeys,
    (chartStreamRecordArray) => chartStreamRecordArray.map(chartStreamToWidget));

const mapStateToProps: (state: AppRootState) => WidgetListProps =
  (state: AppRootState) => ({
    widgets: selectChartKeysWidgetArray(state),
  });

export const ChartListConnected = connect(mapStateToProps)(WidgetList);
