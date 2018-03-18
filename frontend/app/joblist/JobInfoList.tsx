import * as classNames from 'classnames';
import * as React from 'react';
import {ListGroup, Panel} from 'react-bootstrap';
import {IJobInfoRecord, initialJobInfo, JobInfoView} from './';

export interface JobListProps {
  jobs: IJobInfoRecord[];
  className?: string;
  style?: React.CSSProperties;
}

export const JobInfoList: React.SFC<JobListProps> = (props) => {
  const {className, jobs, style} = props;
  const componentClass = classNames(className, 'job-list');

  return (
    <Panel className={componentClass} style={style} bsStyle='primary'>
      <Panel.Heading>
        <Panel.Title componentClass='h3'>Jobs</Panel.Title>
        {jobs.length} running
      </Panel.Heading>
      <Panel.Body>
        <ListGroup>
          {jobs.map((jobInfo, key) => <JobInfoView key={key} jobInfo={jobInfo || initialJobInfo}/>)}
        </ListGroup>
      </Panel.Body>
    </Panel>
  );
};
