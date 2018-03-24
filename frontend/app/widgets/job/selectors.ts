import {Iterable, Map} from 'immutable';
import {createSelector, OutputSelector} from 'reselect';
import {IRootStateRecord} from '../../store';
import {emptyMonoidStore} from '../../monoidstore';
import {IJobInfoRecord} from './';

export type JobsMap = Map<string, IJobInfoRecord>;

const emptyJobs: JobsMap = Map<string, IJobInfoRecord>();

function calcPercentage(jobInfo: IJobInfoRecord): number | null {
  if (typeof jobInfo.get('total') === 'number' && typeof jobInfo.get('curr') === 'number' && jobInfo.get('total') > 0) {
    return Math.floor(100 * jobInfo.get('curr') / jobInfo.get('total'));
  }
  return null;
}

export type JobState = {
  jobInfo: IJobInfoRecord;
  percentage: number | null;
};

export function sortByJobId(lhs: JobState, rhs: JobState): number {
  return lhs.jobInfo.jobId - rhs.jobInfo.jobId;
}

export const selectJobStates: OutputSelector<IRootStateRecord, Iterable<number, JobState>, (res: JobsMap) => Iterable<number, JobState>> =
  createSelector(
    (rootState: IRootStateRecord) => rootState.get('store', emptyMonoidStore).get('jobs', emptyJobs),
    (jobsMap) => jobsMap
      .valueSeq()
      .map((jobInfo: IJobInfoRecord) => {
        return {
          jobInfo,
          percentage: calcPercentage(jobInfo),
        };
      })
  );
