import {AnyAction, Reducer} from 'redux';
import {ChartOptions} from 'chart.js';
import {ADD_CHART_STREAM, ChartStreamMap, ChartStreamRecordFactory, emptyChartStreamMap} from './';

const chartOption: ChartOptions = {
  animation: {
    duration: 0, // general animation time
  },
  hover: {
    animationDuration: 0, // duration of animations when hovering an item
  },
  responsiveAnimationDuration: 0, // animation duration after a resize
  elements: {
    line: {
      tension: 0, // disables bezier curves
    }
  },
  scales: {
    xAxes: [{
      type: 'time',
      scaleLabel: {
        display: true,
        labelString: 'DateTime'
      }
    }],
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'value'
      }
    }]
  },
};

export const chartStreamReducer: Reducer<ChartStreamMap> =
  (state: ChartStreamMap = emptyChartStreamMap, action: AnyAction): ChartStreamMap => {
    switch (action.type) {
      case ADD_CHART_STREAM:
        const chartId = `c:${Date.now()}`;
        switch (action.streamURI) {
          case 'sine':
          case 'sineSlow':
          case 'count':
          case 'countSlow':
          default:
            // TODO: parse URIs for arguments to set in chart config
            return state.set(chartId, ChartStreamRecordFactory({
              key: chartId,
              streamURI: action.streamURI,
              chartConfig: {

                type: 'line',

                data: {
                  labels: [],
                  datasets: [{
                    label: 'My First dataset',
                    backgroundColor: 'blue',
                    borderColor: 'black',
                    fill: false,
                  }]
                },

                options: {
                  ...chartOption,
                  title: {
                    text: `Chart.js uri="${action.streamURI}"`
                  },
                }
              }
            }));
        }

      default:
        return state;
    }
  };
