export const ADD_CHART_STREAM = 'ADD_CHART_STREAM';

export type ChartStreamActions = {
  ADD_CHART_STREAM: { type: typeof ADD_CHART_STREAM, streamURI: string },
};

export type ChartStreamAction = ChartStreamActions[keyof ChartStreamActions];

export const chartStreamActionCreators = {
  addChartStream: (streamURI: string) => ({
    type: ADD_CHART_STREAM as typeof ADD_CHART_STREAM,
    streamURI,
  }),
};
