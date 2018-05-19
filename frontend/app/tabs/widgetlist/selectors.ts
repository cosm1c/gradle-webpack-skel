import {createSelector, OutputSelector} from 'reselect';
import * as React from 'react';
import {ReactNode} from 'react';
import {IRootStateRecord} from '../../store';
import {JobState, jobStateToWidget, selectJobStates} from '../job';
import {chartStreamToWidget, selectChartKeys} from '../chartstream';

export interface Widget {
  itemKey: string;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
  element: ReactNode;
}

export const selectChartKeysWidgetArray: OutputSelector<IRootStateRecord, Widget[], (res1: string[]) => Widget[]> =
  createSelector(
    selectChartKeys,
    (chartStreamRecordArray) => chartStreamRecordArray.map(chartStreamToWidget));

export const selectJobStatesWidgetArray: OutputSelector<IRootStateRecord, Widget[], (res1: JobState[]) => Widget[]> =
  createSelector(
    selectJobStates,
    (jobsStateArray) => jobsStateArray.map(jobStateToWidget));
