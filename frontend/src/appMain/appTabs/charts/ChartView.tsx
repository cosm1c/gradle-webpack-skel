import * as moment from 'moment';
import {Moment} from 'moment';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
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
  UncontrolledDropdown
} from 'reactstrap';
import {Chart, ChartDataSets, ChartPoint, ChartScales} from 'chart.js';
import {DaySelector} from './DaySelector';
import {StartEndSelector} from './StartEndSelector';
import {StartEndStepSelector} from './StartEndStepSelector';
import store from '../../../reduxStore/store';
import clientStreams from '../../../clientStreams/ClientStreams';
import {Widget} from '../widgetlist/WidgetList';
import {delChartStream} from './actions';

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

  private readonly chartUpdate$: Subject<any> =
    new Subject().pipe(
      debounceTime(15)
    ) as Subject<any>;

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
    const {className, style} = this.props;
    const {error, subscription, configReactComponent, title, started, ended} = this.state;
    const componentClass = classNames(className, 'chart-view');

    return (
      <Card body={true} className={componentClass} style={style}>
        <CardBody>
          <CardTitle>
            <button
              type='button'
              className='close'
              aria-label='Close'
              onClick={this.closeChartStream}
            >
              <span aria-hidden='true'>&times;</span>
            </button>
            <Button
              disabled={subscription === undefined}
              className='float-right clearfix'
              size='sm'
              color={this.streamButtonColor()}
              onClick={this.cancelStream}
            >
              {this.streamButtonText()}
            </Button>
            {title} {(ended !== undefined) && (<span> [{(ended - started!).toFixed(2)}ms]</span>)}
          </CardTitle>
          <CardSubtitle>{this.state.error !== undefined && (<Badge color='danger'>{error}</Badge>)}</CardSubtitle>
          {(started === undefined) && (
            <UncontrolledDropdown>
              <DropdownToggle caret={true}>Choose Chart</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={this.selectSolar}>Solar</DropdownItem>
                <DropdownItem onClick={this.selectSolarSlow}>Solar Slow</DropdownItem>
                <DropdownItem divider={true}/>
                <DropdownItem onClick={this.selectCount}>Count</DropdownItem>
                <DropdownItem onClick={this.selectCountSlow}>Count Slow</DropdownItem>
                <DropdownItem divider={true}/>
                <DropdownItem onClick={this.selectSine}>Sine</DropdownItem>
                <DropdownItem onClick={this.selectSineSlow}>Sine Slow</DropdownItem>
                <DropdownItem divider={true}/>
                <DropdownItem onClick={this.selectError}>Error Source</DropdownItem>
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

  private selectSolar = () => {
    this.displayChartConfig((
      <DaySelector
        title='Pick Day'
        onPickDate={this.onPickSolarDate}
      />
    ));
  };

  private onPickSolarDate = (momentDate: Moment) => this.solarDateChart(false, momentDate);

  private selectSolarSlow = () => {
    this.displayChartConfig((
      <DaySelector
        title='Pick Day'
        onPickDate={this.onPickSolarSlowDate}
      />
    ));
  };

  private onPickSolarSlowDate = (momentDate: Moment) => this.solarDateChart(true, momentDate);

  private selectCount = () => {
    this.displayChartConfig((
      <StartEndSelector
        title='Enter Start and End'
        initStart={0}
        initEnd={10}
        onSubmit={this.onPickCountRange}
      />
    ));
  };

  private onPickCountRange = (start: number, end: number) => this.startEndChart('count', start, end);

  private selectCountSlow = () => {
    this.displayChartConfig((
      <StartEndSelector
        title='Enter Start and End'
        initStart={0}
        initEnd={10}
        onSubmit={this.onPickCountSlowRange}
      />
    ));
  };

  private onPickCountSlowRange = (start: number, end: number) => this.startEndChart('countSlow', start, end);

  private selectSine = () => {
    this.displayChartConfig((
      <StartEndStepSelector
        title='Enter Start and End'
        initStart={0}
        initEnd={32}
        onSubmit={this.onPickSineRange}
      />
    ));
  };

  private onPickSineRange = (start: number, end: number, step: number) => this.startEndStepChart('sine', start, end, step);

  private selectSineSlow = () => {
    this.displayChartConfig((
      <StartEndStepSelector
        title='Enter Start and End'
        initStart={0}
        initEnd={32}
        onSubmit={this.onPickSineSlowRange}
      />
    ));
  };

  private onPickSineSlowRange = (start: number, end: number, step: number) => this.startEndStepChart('sineSlow', start, end, step);

  private selectError = () => {
    this.configChart('error', 'Error Source', {}, []);
  };

  private closeChartStream = () => store.dispatch(delChartStream(this.props.widgetKey));

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
        .subscribeStream(
          clientStreams.listConnectionIds().next().value,
          streamUri,
          {
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
      ]
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
      ]
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
      ]
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
