import {Map as ImmutableMap} from 'immutable';
import {createSelector, OutputSelector} from 'reselect';
import {IJobInfoRecord} from './index';
import {AppRootState} from '../../../reduxStore/store';
import {selectStore} from '../../../monoidStore/redux-duck';
import clientStreams, {SubStreamPayload} from '../../../clientStreams/ClientStreams';
import {AlertLevel, fireGlobalAlert} from '../../../appAlert';
import {Observer} from 'rxjs/index';
import {dispatchMonoidStoreAction} from '../../../monoidStore';
import {jsonToNestedMonoidActions} from '../../../monoidStore/protocol';

export type JobsMap = ImmutableMap<string, IJobInfoRecord>;

const emptyJobs: JobsMap = ImmutableMap<string, IJobInfoRecord>();

export interface JobState {
  jobInfo: IJobInfoRecord;
  percentage: number | null;
}

export function sortByJobId(lhs: JobState, rhs: JobState): number {
  return lhs.jobInfo.jobId - rhs.jobInfo.jobId;
}

export class Jobs {

  public static readonly storePath = 'jobs';

  private static calcPercentage(jobInfo: IJobInfoRecord): number | null {
    if (typeof jobInfo.get('total') === 'number' && typeof jobInfo.get('curr') === 'number' && jobInfo.get('total') > 0) {
      return Math.floor(100 * jobInfo.get('curr') / jobInfo.get('total'));
    }
    return null;
  }

  public readonly outputSelector: OutputSelector<AppRootState, JobState[], (res: JobsMap) => JobState[]>;

  constructor() {
    this.outputSelector = createSelector(
      (rootState: AppRootState) =>
        selectStore(rootState)
          .get(Jobs.storePath, emptyJobs),
      (jobsMap) =>
        jobsMap
          .valueSeq()
          .map((jobInfo: IJobInfoRecord) => {
            return {
              jobInfo,
              percentage: Jobs.calcPercentage(jobInfo),
            };
          })
          .toArray()
          .sort(sortByJobId)
    );

    const jobsObserver: Observer<SubStreamPayload> = {
      complete: () => fireGlobalAlert('Jobs Stream completed', AlertLevel.WARNING),
      error: (err) => fireGlobalAlert(JSON.stringify(err), AlertLevel.DANGER),
      next: (value: SubStreamPayload) => dispatchMonoidStoreAction(jsonToNestedMonoidActions(Jobs.storePath, value.data)),
    };

    clientStreams.subscribeMergeStream('jobs', jobsObserver);
  }

}

const jobs = new Jobs();

export default jobs;
