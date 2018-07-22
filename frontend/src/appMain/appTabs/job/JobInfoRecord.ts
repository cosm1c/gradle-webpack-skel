import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';

interface IJobInfo {
  jobId: number;
  curr?: number;
  total?: number;
  startDateTime?: Date;
  endDateTime?: Date;
  error?: string;
  description?: string;
  agent?: string;
}

const defaultStreamState: IJobInfo = {
  jobId: -1,
};

export interface IJobInfoRecord extends TypedRecord<IJobInfoRecord>, IJobInfo {
}

export const JobInfoRecordFactory = makeTypedFactory<IJobInfo, IJobInfoRecord>(defaultStreamState);

export const initialJobInfo: IJobInfoRecord = JobInfoRecordFactory();
