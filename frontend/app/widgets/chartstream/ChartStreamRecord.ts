import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {ChartConfiguration} from 'chart.js';

interface IChartStream {
  key: string;
  streamURI: string;
  chartConfig: ChartConfiguration;
}

const defaultChartStream: IChartStream = {
  key: '',
  streamURI: '',
  chartConfig: {},
};

export interface IChartStreamRecord extends TypedRecord<IChartStreamRecord>, IChartStream {
}

export const ChartStreamRecordFactory = makeTypedFactory<IChartStream, IChartStreamRecord>(defaultChartStream);

export const emptyChartStream: IChartStreamRecord = ChartStreamRecordFactory();
