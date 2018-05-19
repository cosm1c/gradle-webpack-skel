import {List} from 'immutable';
import {createSelector, OutputSelector} from 'reselect';
import {IRootStateRecord} from '../../store';

export type ChartStreamList = List<string>;

export const emptyChartStreamList = List<string>();

export const selectChartKeys: OutputSelector<IRootStateRecord, string[], (res: ChartStreamList) => string[]> =
  createSelector(
    (rootState: IRootStateRecord) => rootState.get('chartStreams', emptyChartStreamList),
    (chartStreamsList) => chartStreamsList.valueSeq().toArray(),
  );
