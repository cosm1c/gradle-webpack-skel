import {List} from 'immutable';
import {ActionType} from 'typesafe-actions';
import {Reducer} from 'redux';
import * as chartAction from './actions';
import {ADD_CHART_STREAM, addChartStream, DEL_CHART_STREAM} from './actions';
import reducerRegistry from '../../../reduxStore/reducerRegistry';
import {createSelector, OutputSelector} from 'reselect';
import store, {AppRootState} from '../../../reduxStore/store';

const reducerName = 'charts';

export type ChartAction = ActionType<typeof chartAction>;

export type ChartStreamList = List<string>;

export const emptyChartStreamList = List<string>();

const reducer: Reducer<ChartStreamList> =
  (prevState = emptyChartStreamList, newAction) => {
    switch (newAction.type) {
      case ADD_CHART_STREAM:
        return prevState.push(`c:${Date.now()}`);

      case DEL_CHART_STREAM:
        const existingIndex = prevState.indexOf(newAction.payload.key);
        return existingIndex >= 0 ? prevState.delete(existingIndex) : prevState;

      default:
        return prevState;
    }
  };

reducerRegistry.register(reducerName, reducer);

export default reducer;

export const selectChartKeys: OutputSelector<AppRootState, string[], (res: ChartStreamList) => string[]> =
  createSelector(
    (rootState: AppRootState) => rootState.get(reducerName, emptyChartStreamList),
    (chartStreamsList) => chartStreamsList.valueSeq().toArray()
  );

export const fireAddChart = () => store.dispatch(addChartStream());
