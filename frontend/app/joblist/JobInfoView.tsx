import * as classNames from 'classnames';
import * as React from 'react';
import {Label, ListGroupItem, ProgressBar} from 'react-bootstrap';
import {IJobInfoRecord} from './JobInfo';

export interface JobInfoViewProps {
  jobInfo: IJobInfoRecord;
  className?: string;
  style?: React.CSSProperties;
}

// TODO: perform calcPercentage in reducer with reselect
function calcPercentage(jobInfo: IJobInfoRecord) {
  if (typeof jobInfo.get('total') === 'number' && typeof jobInfo.get('curr') === 'number' && jobInfo.get('total') > 0) {
    return Math.floor(100 * jobInfo.get('curr') / jobInfo.get('total'));
  }
  return null;
}

function killJob(jobId: number) {
  fetch(`/job/${jobId}`, {method: 'DELETE'})
    .then(response => console.debug('Kill job - DELETE response:', response))
    .catch(e => console.error('Failed to kill job', e));
}

export const JobInfoView: React.SFC<JobInfoViewProps> = (props) => {
  const {className, jobInfo} = props;
  const componentClass = classNames(className, 'job-list');
  const percentage = calcPercentage(jobInfo);

  return (
    <ListGroupItem header={jobInfo.get('jobId') + ' - ' + jobInfo.get('description')} className={componentClass}>
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
    </ListGroupItem>
  );
};
