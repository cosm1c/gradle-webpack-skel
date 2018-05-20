import * as classNames from 'classnames';
import * as React from 'react';
import {ReactNode} from 'react';
import {Widget} from '../widgetlist';
import {IJobInfoRecord, JobState} from './index';
import {Badge, Card, CardBody, CardSubtitle, CardText, CardTitle, Progress} from 'reactstrap';

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

function subTitle(jobInfo: IJobInfoRecord): ReactNode {
  if (jobInfo.has('curr')) {
    const curr = jobInfo.get('curr');

    if (jobInfo.has('total')) {
      const total = jobInfo.get('total');

      if (jobInfo.has('endDateTime') && curr === total) {
        return `${total}`;
      }

      return `${curr} of ${total}`;
    }
  }
  if (jobInfo.has('total')) {
    return `${jobInfo.get('total')} Expected`;
  }

  return 'Idle';
}

export const JobView: React.SFC<JobViewProps> = (props) => {
  const {className, style, jobState} = props;
  const {jobInfo, percentage} = jobState;
  const componentClass = classNames(className, 'job-view');

  return (
    <Card className={componentClass} style={style}>
      <CardBody>
        <CardTitle>
          <button type='button' className='close' aria-label='Close' onClick={() => killJob(jobInfo.get('jobId'))}>
            <span aria-hidden='true'>&times;</span>
          </button>
          #{jobInfo.get('jobId').toFixed()} {jobInfo.get('description')}
        </CardTitle>
        <CardSubtitle className='text-right'>{subTitle(jobInfo)}</CardSubtitle>
        <CardText>
          {jobInfo.has('startDateTime') &&
          <span><Badge color='info'>Started: {jobInfo.get('startDateTime')}</Badge> </span>}
          {jobInfo.has('endDateTime') &&
          <span> <Badge color='info'>Completed: {jobInfo.get('endDateTime')}</Badge></span>}
          {jobInfo.has('error') && <span> <Badge color='danger'>Failed: {jobInfo.get('error')}</Badge></span>}
          </CardText>
        <Progress
          animated={!jobInfo.has('endDateTime')}
          value={(typeof percentage === 'number') ? percentage : 100}>{(typeof percentage === 'number') ? `${percentage}%` : ''}</Progress>
      </CardBody>
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
