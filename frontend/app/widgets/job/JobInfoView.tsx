import * as classNames from 'classnames';
import * as React from 'react';
import {Label, ProgressBar} from 'react-bootstrap';
import {JobState} from './selectors';
import {Widget} from "../widgetlist/selectors";

export interface JobInfoViewProps {
  jobState: JobState;
  className?: string;
  style?: React.CSSProperties;
}

function killJob(jobId: number) {
  fetch(`/job/${jobId}`, {method: 'DELETE'})
    .then(response => console.debug('Kill job - DELETE response:', response))
    .catch(e => console.error('Failed to kill job', e));
}

export const JobInfoView: React.SFC<JobInfoViewProps> = (props) => {
  const {className, jobState} = props;
  const {jobInfo, percentage} = jobState;
  const componentClass = classNames(className, 'job-list');

  return (
    <div className={componentClass}>
      <Label>{jobState.jobInfo.description}</Label>
      {jobInfo.has('startDateTime') && <Label bsStyle='info'>Started: {jobInfo.get('startDateTime')}</Label>}
      {jobInfo.has('endDateTime') &&
      <span> <Label bsStyle='info'>Completed: {jobInfo.get('endDateTime')}</Label></span>}
      {jobInfo.has('error') && <span> <Label bsStyle='danger'>Failed: {jobInfo.get('error')}</Label></span>}
      <a onClick={() => killJob(jobInfo.get('jobId'))} className='close align-text-top' href='#'>&times;</a>
      {(typeof percentage === 'number') ?
        <ProgressBar
          label={percentage + '%'}
          active={jobInfo.get('endDateTime') === undefined}
          now={percentage}/>
        : (typeof jobInfo.get('curr') !== 'undefined') ?
          <ProgressBar
            label={jobInfo.get('curr') + ' done'}
            active={jobInfo.get('endDateTime') === undefined}
            now={100}/>
          : <ProgressBar/>
      }
    </div>
  );
};

export function jobStateToWidget(jobState: JobState): Widget {
  return {
    key: `job:${jobState.jobInfo.get('jobId')}`,
    className: 'job-info-widget',
    header: `Job ${jobState.jobInfo.get('jobId')}`,
    element: <JobInfoView jobState={jobState}/>
  };
}
