import {AnyAction, Reducer} from 'redux';
import {ADD_CHART_STREAM, ChartStreamList, DEL_CHART_STREAM, emptyChartStreamList} from './index';

export const chartStreamReducer: Reducer<ChartStreamList> =
  (state: ChartStreamList = emptyChartStreamList, action: AnyAction): ChartStreamList => {
    switch (action.type) {
      case ADD_CHART_STREAM:
        return state.push(`c:${Date.now()}`);

      case DEL_CHART_STREAM:
        const existingIndex = state.indexOf(action.key);
        return existingIndex >= 0 ? state.delete(existingIndex) : state;

      default:
        return state;
    }
  };
