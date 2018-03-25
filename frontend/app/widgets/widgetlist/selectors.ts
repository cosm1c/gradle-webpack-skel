import {createSelector, OutputSelector} from 'reselect';
import * as React from 'react';
import {ReactElement} from 'react';
import {IRootStateRecord} from '../../store';
import {JobState, jobStateToWidget, selectJobStates} from '../job';
import {chartStreamToWidget, IChartStreamRecord, selectChartStreams} from '../chartstream';

export type Widget = {
  itemKey: string;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  element: ReactElement<any>;
};

const selectChartStreamsWidgetArray: OutputSelector<IRootStateRecord, Widget[], (res1: IChartStreamRecord[]) => Widget[]> =
  createSelector(
    selectChartStreams,
    (chartStreamRecordArray) => chartStreamRecordArray.map((chartStreamRecord) => chartStreamToWidget(chartStreamRecord)));

const selectJobStatesWidgetArray: OutputSelector<IRootStateRecord, Widget[], (res1: JobState[]) => Widget[]> =
  createSelector(
    selectJobStates,
    (jobsStateArray) => jobsStateArray.map((jobState) => jobStateToWidget(jobState)));

export const selectWidgetArray: OutputSelector<IRootStateRecord, Widget[], (res1: Widget[], res2: Widget[]) => Widget[]> =
  createSelector(
    selectChartStreamsWidgetArray,
    selectJobStatesWidgetArray,
    (chartStreamsWidgetArray, jobInfoWidgetArray) => chartStreamsWidgetArray.concat(jobInfoWidgetArray));
