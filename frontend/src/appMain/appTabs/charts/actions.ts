import {action} from 'typesafe-actions';

export const ADD_CHART_STREAM = 'ADD_CHART_STREAM';
export const DEL_CHART_STREAM = 'DEL_CHART_STREAM';

export const addChartStream = () =>
  action(ADD_CHART_STREAM);

export const delChartStream = (key: string) =>
  action(
    DEL_CHART_STREAM,
    {
      key,
    }
  );
