export const ADD_CHART_STREAM = 'ADD_CHART_STREAM';
export const DEL_CHART_STREAM = 'DEL_CHART_STREAM';

export interface ChartStreamActions {
  ADD_CHART_STREAM: { type: typeof ADD_CHART_STREAM };
  DEL_CHART_STREAM: { type: typeof DEL_CHART_STREAM, key: string };
}

export type ChartStreamAction = ChartStreamActions[keyof ChartStreamActions];

export const chartStreamActionCreators = {
  addChartStream: () => ({
    type: ADD_CHART_STREAM as typeof ADD_CHART_STREAM,
  }),
  delChartStream: (key: string) => ({
    type: DEL_CHART_STREAM as typeof DEL_CHART_STREAM,
    key,
  }),
};
