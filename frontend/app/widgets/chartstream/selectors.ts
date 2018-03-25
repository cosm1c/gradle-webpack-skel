import {Map} from 'immutable';
import {createSelector, OutputSelector} from 'reselect';
import {IRootStateRecord} from '../../store';
import {IChartStreamRecord} from './';

export type ChartStreamMap = Map<string, IChartStreamRecord>;

export const emptyChartStreamMap = Map<string, IChartStreamRecord>();

function sortChartStreamRecordByKey(lhs: IChartStreamRecord, rhs: IChartStreamRecord) {
  return lhs.get('key').localeCompare(rhs.get('key'));
}

export const selectChartStreams: OutputSelector<IRootStateRecord, IChartStreamRecord[], (res: ChartStreamMap) => IChartStreamRecord[]> =
  createSelector(
    (rootState: IRootStateRecord) => rootState.get('chartStreams', emptyChartStreamMap),
    (chartStreamsMap) => chartStreamsMap.valueSeq().toArray().sort(sortChartStreamRecordByKey)
  );
