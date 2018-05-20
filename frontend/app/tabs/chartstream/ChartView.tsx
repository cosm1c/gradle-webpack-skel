import * as moment from 'moment';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import * as classNames from 'classnames';
import * as React from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from 'reactstrap';
import {Chart, ChartDataSets, ChartPoint, ChartScales} from 'chart.js';
import clientStreams from '../../stream/ClientStreams';
import {rootStore} from '../../store';
import {Widget} from '../widgetlist';
import {chartStreamActionCreators, DaySelector, StartEndSelector, StartEndStepSelector} from './index';

export interface ChartViewProps {
  widgetKey: string;
  className?: string;
  style?: React.CSSProperties;
}

interface State {
  title: string;
  configReactComponent?: JSX.Element;
  subscription?: Subscription;
  started?: number;
  ended?: number;
  error?: string;
}

Chart.defaults.global.animation = Chart.defaults.global.animation || {};
Chart.defaults.global.animation.duration = 100;

export class ChartView extends React.Component<ChartViewProps, State> {

  // TODO: Support receiving array of points per series over WebSocket
  private static bufferChartPoints(buffer: ChartPoint[][], chartPoints: Chart.ChartPoint[]) {
    const length = Math.max(buffer.length, chartPoints.length);
    for (let i = 0; i < length; i++) {
      if (chartPoints[i] !== null) {
        if (!buffer[i]) {
          buffer[i] = [];
        }
        buffer[i].push(chartPoints[i]);
      }
    }
  }

  private static appendChartPoints(dataSets: ChartDataSets[], buffer: ChartPoint[][]) {
    const length = Math.max(buffer.length, dataSets.length);
    for (let i = 0; i < length; i++) {
      if (buffer[i] !== null) {
        if (!dataSets[i]) {
          dataSets[i] = {data: []};
        }
        dataSets[i].data!.push.apply(dataSets[i].data, buffer[i]);
      }
    }
  }

  public state: State = {
    title: 'Please select a chart',
  };

  private readonly chartUpdate$: Subject<any> = new Subject().debounceTime(15) as Subject<any>;

  private element?: HTMLCanvasElement;
  private chart?: Chart;
  private buffer: ChartPoint[][] = [];

  constructor(props: ChartViewProps) {
    super(props);
    this.chartUpdate$.subscribe(() => this.forceChartUpdate());
    this.configChart = this.configChart.bind(this);
    this.startEndChart = this.startEndChart.bind(this);
    this.solarDateChart = this.solarDateChart.bind(this);
  }

  public componentWillUnmount() {
    console.debug('unmounting ChartStream', this.props.widgetKey);
    this.cancelStream();
    if (this.chart !== undefined) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  public render() {
    const {className, style, widgetKey} = this.props;
    const {error, subscription, configReactComponent, title, started, ended} = this.state;
    const componentClass = classNames(className, 'chart-view');

    return (
      <Card body className={componentClass} style={style}>
        <CardBody>
          <CardTitle>
            <button type='button' className='close' aria-label='Close'
                    onClick={() => rootStore.dispatch(chartStreamActionCreators.delChartStream(widgetKey))}>
              <span aria-hidden='true'>&times;</span>
            </button>
            <Button disabled={subscription === undefined} className='float-right clearfix' size='sm'
                    color={this.streamButtonColor()} onClick={this.cancelStream}>{this.streamButtonText()}</Button>
            {title} {(ended !== undefined) && (<span> [{(ended - started!).toFixed(2)}ms]</span>)}
          </CardTitle>
          <CardSubtitle>{this.state.error !== undefined && (<Badge color='danger'>{error}</Badge>)}</CardSubtitle>
          {(started === undefined) && (
            <UncontrolledDropdown>
              <DropdownToggle caret>Choose Chart</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() =>
                  this.displayChartConfig(<DaySelector title='Pick Day' onPickDate={(momentDate) =>
                    this.solarDateChart(false, momentDate)}/>)}>Solar</DropdownItem>
                <DropdownItem onClick={() =>
                  this.displayChartConfig(<DaySelector title='Pick Day' onPickDate={(momentDate) =>
                    this.solarDateChart(true, momentDate)}/>)}>Solar Slow</DropdownItem>
                <DropdownItem divider/>
                <DropdownItem onClick={() =>
                  this.displayChartConfig(<StartEndSelector title='Enter Start and End'
                                                            initStart={0} initEnd={10} onSubmit={(start, end) =>
                    this.startEndChart('count', start, end)}/>)}>Count</DropdownItem>
                <DropdownItem onClick={() =>
                  this.displayChartConfig(<StartEndSelector title='Enter Start and End'
                                                            initStart={0} initEnd={10} onSubmit={(start, end) =>
                    this.startEndChart('countSlow', start, end)}/>)}>Count Slow</DropdownItem>
                <DropdownItem divider/>
                <DropdownItem onClick={() =>
                  this.displayChartConfig(<StartEndStepSelector title='Enter Start and End'
                                                                initStart={0} initEnd={32}
                                                                onSubmit={(start, end, step) =>
                                                                  this.startEndStepChart('sine', start, end, step)}/>)}>Sine</DropdownItem>
                <DropdownItem onClick={() =>
                  this.displayChartConfig(<StartEndStepSelector title='Enter Start and End'
                                                                initStart={0} initEnd={32}
                                                                onSubmit={(start, end, step) =>
                                                                  this.startEndStepChart('sineSlow', start, end, step)}/>)}>Sine
                  Slow</DropdownItem>
                <DropdownItem divider/>
                <DropdownItem onClick={() =>
                  this.configChart('error', 'Error Source', {}, [])}>Error Source</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          )}
        </CardBody>
        {(configReactComponent)}
        <div hidden={started === undefined} className='chartjs-container'>
          <canvas ref={this.ref}/>
        </div>
      </Card>
    );
  }

  private displayChartConfig(configReactComponent: JSX.Element) {
    this.cancelStream();
    this.setState({configReactComponent});
  }

  private configChart(streamUri: string,
                      title: string,
                      scales: ChartScales,
                      datasets: ChartDataSets[]) {
    if (!this.element) {
      throw new Error('element ref missing');
    }

    this.chart = new Chart(this.element, {
      type: 'line',
      options: {
        scales,
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
          },
        },
        maintainAspectRatio: false,
      },
      data: {
        datasets,
      },
    });

    const subscription: Subscription =
      clientStreams
        .subscribeStream(streamUri, {
          next: (chartPoints: Chart.ChartPoint[]) => {
            this.throttledChartUpdate(chartPoints);
          },
          error: (error: any) => {
            console.error(this.props.widgetKey, 'ChartView ERROR', error);
            this.setState({error, ended: window.performance.now()});
            this.cancelStream();
            this.forceChartUpdate();
          },
          complete: () => {
            // console.debug('ChartView COMPLETE', this);
            const ended = window.performance.now();
            this.setState({ended});
            this.cancelStream();
            this.forceChartUpdate();
          },
        });

    this.setState({
      configReactComponent: undefined,
      title,
      subscription,
      started: window.performance.now(),
    });
  }

  private startEndChart(uriPath: string, start: number, end: number): void {
    this.configChart(
      `${uriPath}?start=${start}&end=${end}`,
      `${uriPath} ${start} to ${end}`,
      {
        xAxes: [{
          type: 'linear',
          ticks: {
            min: start,
            max: end,
          },
          scaleLabel: {
            display: true,
            labelString: 'X',
          },
        }],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Y',
            },
          },
        ],
      },
      [
        {
          label: uriPath,
          backgroundColor: 'blue',
          borderColor: 'black',
          pointRadius: 1.75,
          fill: false,
          data: [], // ChartPoint[]
        },
      ],
    );
  }

  private startEndStepChart(uriPath: string, start: number, end: number, step: number): void {
    this.configChart(
      `${uriPath}?start=${start}&end=${end}&step=${step}`,
      `${uriPath} ${start} to ${end} step ${step}`,
      {
        xAxes: [{
          type: 'linear',
          ticks: {
            min: start,
            max: end,
          },
          scaleLabel: {
            display: true,
            labelString: 'X',
          },
        }],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Y',
            },
          },
        ],
      },
      [
        {
          label: uriPath,
          backgroundColor: 'blue',
          borderColor: 'black',
          pointRadius: 1.75,
          fill: false,
          data: [], // ChartPoint[]
        },
      ],
    );
  }

  private solarDateChart(isSlow: boolean, startMoment: moment.Moment): void {
    const startDateISOString = startMoment.toISOString();
    const endDateISOString = startMoment.add(1, 'day').toISOString();
    this.configChart(
      `solar${isSlow ? 'Slow' : ''}?startDate=${startDateISOString}&endDate=${endDateISOString}`,
      `Solar ${startMoment.format('dddd, MMMM Do YYYY')}`,
      {
        xAxes: [{
          type: 'time',
          time: {
            min: startDateISOString,
            max: endDateISOString,
          },
          scaleLabel: {
            display: true,
            labelString: 'DateTime',
          },
        }],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Degrees',
            },
          },
        ],
      },
      [
        {
          label: 'Azimuth',
          backgroundColor: 'blue',
          borderColor: 'black',
          pointRadius: 1.75,
          fill: false,
          data: [], // ChartPoint[]
        },
        {
          label: 'ZenithAngle',
          backgroundColor: 'yellow',
          borderColor: 'green',
          pointRadius: 1.75,
          fill: false,
          data: [], // ChartPoint[]
        },
      ],
    );
  }

  private throttledChartUpdate = (chartPoints: Chart.ChartPoint[]) => {
    ChartView.bufferChartPoints(this.buffer, chartPoints);
    this.chartUpdate$.next(0);
  };

  private forceChartUpdate(): void {
    if (this.chart) {
      ChartView.appendChartPoints(this.chart!.data.datasets!, this.buffer);
      this.buffer = [];
      this.chart.update();
    }
  }

  private ref = (element: HTMLCanvasElement) => {
    this.element = element;
  };

  private cancelStream: () => void =
    () => {
      if (this.state.subscription) {
        this.state.subscription.unsubscribe();
        this.setState({subscription: undefined});
      }
    };

  private streamButtonText: () => string = () => {
    if (this.state.error) {
      return 'Error';
    }
    if (this.state.ended) {
      return 'Complete';
    }
    if (this.state.subscription) {
      return 'Cancel';
    }
    if (!this.state.started) {
      return 'Idle';
    }
    return 'Cancelled';
  };

  private streamButtonColor: () => string = () => {
    if (this.state.error) {
      return 'danger';
    }
    if (this.state.ended) {
      return 'success';
    }
    if (this.state.subscription) {
      return 'warning';
    }
    return 'warning';
  };
}

export function chartStreamToWidget(key: string): Widget {
  return {
    itemKey: key,
    itemClassName: 'chart-stream-widget',
    element: <ChartView widgetKey={key}/>,
  };
}
