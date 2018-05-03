import {createSelector, OutputSelector} from 'reselect';
import * as React from 'react';
import {ReactElement} from 'react';
import {IRootStateRecord} from '../../store';
import {JobState, jobStateToWidget, selectJobStates} from '../job';
import {chartStreamToWidget, selectChartKeys} from '../chartstream';

export type Widget = {
  itemKey: string;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  element: ReactElement<any>;
};

const selectChartKeysWidgetArray: OutputSelector<IRootStateRecord, Widget[], (res1: string[]) => Widget[]> =
  createSelector(
    selectChartKeys,
    (chartStreamRecordArray) => chartStreamRecordArray.map(chartStreamToWidget));

const selectJobStatesWidgetArray: OutputSelector<IRootStateRecord, Widget[], (res1: JobState[]) => Widget[]> =
  createSelector(
    selectJobStates,
    (jobsStateArray) => jobsStateArray.map(jobStateToWidget));

export const selectWidgetArray: OutputSelector<IRootStateRecord, Widget[], (res1: Widget[], res2: Widget[]) => Widget[]> =
  createSelector(
    selectChartKeysWidgetArray,
    selectJobStatesWidgetArray,
    (chartStreamsWidgetArray, jobInfoWidgetArray) => chartStreamsWidgetArray.concat(jobInfoWidgetArray));
