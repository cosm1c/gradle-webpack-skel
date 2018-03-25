import * as classNames from 'classnames';
import * as React from 'react';
import {Label, ProgressBar} from 'react-bootstrap';
import {Widget} from '../widgetlist';
import {JobState} from './';

export interface JobViewProps {
  jobState: JobState;
  className?: string;
  style?: React.CSSProperties;
}

function killJob(jobId: number) {
  fetch(`/job/${jobId}`, {method: 'DELETE'})
    .then(response => console.debug('Kill job - DELETE response:', response))
    .catch(e => console.error('Failed to kill job', e));
}

export const JobView: React.SFC<JobViewProps> = (props) => {
  const {className, style, jobState} = props;
  const {jobInfo, percentage} = jobState;
  const componentClass = classNames(className, 'job-view');

  return (
    <div className={componentClass} style={style}>
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
    itemKey: `job:${jobState.jobInfo.get('jobId')}`,
    itemClassName: 'job-info-widget',
    element: <JobView jobState={jobState}/>
  };
}
