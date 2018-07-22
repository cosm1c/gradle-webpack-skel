import * as classNames from 'classnames';
import * as React from 'react';
import {Badge, Card, CardBody, CardSubtitle, CardText, CardTitle, Progress} from 'reactstrap';
import {Widget} from '../widgetlist/WidgetList';
import {JobState} from './Jobs';

export interface JobViewProps {
  jobState: JobState;
  className?: string;
  style?: React.CSSProperties;
}

export class JobView extends React.Component<JobViewProps> {

  constructor(props: JobViewProps) {
    super(props);
  }

  public render() {
    const {className, style, jobState} = this.props;
    const {jobInfo, percentage} = jobState;
    const componentClass = classNames(className, 'job-view');

    return (
      <Card className={componentClass} style={style}>
        <CardBody>
          <CardTitle>
            <button type='button' className='close' aria-label='Close' onClick={this.killJob}>
              <span aria-hidden='true'>&times;</span>
            </button>
            #{(jobInfo.get('jobId') as number).toLocaleString()} {jobInfo.get('description')}
          </CardTitle>
          <CardSubtitle className='text-right'>{this.subTitle()}</CardSubtitle>
          <CardText>
            {jobInfo.has('agent') && <span><Badge color='info'>Agent: {jobInfo.get('agent')}</Badge> </span>}
            {jobInfo.has('startDateTime') &&
            <span><Badge color='info'>Started: {jobInfo.get('startDateTime')}</Badge> </span>}
            {jobInfo.has('endDateTime') &&
            <span> <Badge color='info'>Completed: {jobInfo.get('endDateTime')}</Badge></span>}
            {jobInfo.has('error') && <span> <Badge color='danger'>Failed: {jobInfo.get('error')}</Badge></span>}
          </CardText>
          <Progress
            animated={!jobInfo.has('endDateTime')}
            value={(typeof percentage === 'number') ? percentage : 100}
          >
            {(typeof percentage === 'number') ? `${percentage.toLocaleString()}%` : ''}
          </Progress>
        </CardBody>
      </Card>
    );
  }

  private subTitle(): string {
    const {jobInfo} = this.props.jobState;

    if (jobInfo.has('curr')) {
      const curr = (jobInfo.get('curr') as number).toLocaleString();

      if (jobInfo.has('total')) {
        const total = (jobInfo.get('total') as number).toLocaleString();

        if (jobInfo.has('endDateTime') && curr === total) {
          return `${total}`;
        }

        return `${curr} of ${total}`;
      }
    }
    if (jobInfo.has('total')) {
      return `${(jobInfo.get('total') as number).toLocaleString()} Expected`;
    }

    return 'Idle';
  }

  private killJob = () => {
    fetch(`${this.props.jobState.jobInfo.get('agent', '')}/job/${this.props.jobState.jobInfo.get('jobId')}`, {method: 'DELETE'})
      .then((response) => console.debug('Kill job - DELETE response:', response))
      .catch((e) => console.error('Failed to kill job', e));
  };
}

export function jobStateToWidget(jobState: JobState): Widget {
  return {
    itemKey: `job:${jobState.jobInfo.get('jobId')}`,
    itemClassName: 'job-info-widget',
    element: <JobView jobState={jobState}/>,
  };
}
