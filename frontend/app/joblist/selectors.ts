import {Map} from 'immutable';
import {createSelector, OutputSelector} from 'reselect';
import {IRootStateRecord} from '../store';
import {emptyMonoidStore} from '../monoidstore';
import {IJobInfoRecord} from './';

export type JobsMap = Map<number, IJobInfoRecord>;

const emptyJobs: JobsMap = Map<number, IJobInfoRecord>();

export const selectJobs: OutputSelector<IRootStateRecord, IJobInfoRecord[], (res: JobsMap) => IJobInfoRecord[]> =
  createSelector(
    (rootState: IRootStateRecord) => rootState.get('store', emptyMonoidStore).get('jobs', emptyJobs),
    (jobsMap) => jobsMap.valueSeq().toArray()
  );
