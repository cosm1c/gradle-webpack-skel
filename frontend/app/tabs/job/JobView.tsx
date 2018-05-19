import * as classNames from 'classnames';
import * as React from 'react';
import {Widget} from '../widgetlist';
import {JobState} from './index';
import {Badge, Card, CardText, CardTitle, Progress} from 'reactstrap';

export interface JobViewProps {
  jobState: JobState;
  className?: string;
  style?: React.CSSProperties;
}

function killJob(jobId: number) {
  fetch(`/job/${jobId}`, {method: 'DELETE'})
    .then((response) => console.debug('Kill job - DELETE response:', response))
    .catch((e) => console.error('Failed to kill job', e));
}

export const JobView: React.SFC<JobViewProps> = (props) => {
  const {className, style, jobState} = props;
  const {jobInfo, percentage} = jobState;
  const componentClass = classNames(className, 'job-view');

  return (
    <Card body className={componentClass} style={style}>
      <CardTitle>{jobState.jobInfo.description}</CardTitle>
      <CardText>
        {jobInfo.has('startDateTime') && <Badge color='info'>Started: {jobInfo.get('startDateTime')}</Badge>}
        {jobInfo.has('endDateTime') &&
        <span> <Badge color='info'>Completed: {jobInfo.get('endDateTime')}</Badge></span>}
        {jobInfo.has('error') && <span> <Badge color='danger'>Failed: {jobInfo.get('error')}</Badge></span>}
        <a onClick={() => killJob(jobInfo.get('jobId'))} className='close align-text-top' href='#'>&times;</a>
        {(typeof percentage === 'number') ?
          <Progress
            animated={jobInfo.get('endDateTime') === undefined}
            value={percentage}>{percentage + '%'}</Progress>
          : (typeof jobInfo.get('curr') !== 'undefined') ?
            <Progress
              animated={jobInfo.get('endDateTime') === undefined}
              value={100}>{jobInfo.get('curr') + ' done'}</Progress>
            : <Progress/>
        }
      </CardText>
    </Card>
  );
};

export function jobStateToWidget(jobState: JobState): Widget {
  return {
    itemKey: `job:${jobState.jobInfo.get('jobId')}`,
    itemClassName: 'job-info-widget',
    element: <JobView jobState={jobState}/>,
  };
}
