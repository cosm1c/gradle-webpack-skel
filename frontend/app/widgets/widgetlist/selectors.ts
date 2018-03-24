import {Iterable} from 'immutable';
import {createSelector, OutputSelector} from 'reselect';
import {ReactElement} from 'react';
import {IRootStateRecord} from '../../store';
import {JobState, jobStateToWidget, selectJobStates} from '../job';

export type Widget = {
  key: string;
  className?: string;
  header: string;
  element: ReactElement<any>;
};

export function sortByKey(lhs: Widget, rhs: Widget): number {
  return lhs.key.localeCompare(rhs.key);
}

export const selectJobInfoWidgetList: OutputSelector<IRootStateRecord, Iterable<number, Widget>, (res: Iterable<number, JobState>) => Iterable<number, Widget>> =
  createSelector(
    selectJobStates,
    (jobsStateArray) => jobsStateArray.map((jobState) => jobStateToWidget(jobState!))
  );

export const selectWidgetList: (state: IRootStateRecord) => (Widget[]) =
  state => selectJobInfoWidgetList(state).sort(sortByKey).toArray();
