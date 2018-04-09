import * as moment from 'moment';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import * as classNames from 'classnames';
import * as React from 'react';
import {Button, DropdownButton, Label, MenuItem, Panel} from 'react-bootstrap';
import {Chart, ChartDataSets, ChartScales} from 'chart.js';
import store from '../../store';
import {clientStreams} from '../../main';
import {Widget} from '../widgetlist';
import {chartStreamActionCreators, DaySelector} from './';

export interface ChartViewProps {
  widgetKey: string;
  className?: string;
  style?: React.CSSProperties;
}

type State = {
  title: string;
  configReactComponent?: JSX.Element;
  subscription?: Subscription;
  started?: number;
  ended?: number;
  error?: string | Error;
};

Chart.defaults.global.animation = Chart.defaults.global.animation || {};
Chart.defaults.global.animation.duration = 100;

export class ChartView extends React.Component<ChartViewProps, State> {

  state: State = {
    title: 'Chart'
  };

  private readonly chartUpdate$: Subject<any> = new Subject().debounceTime(15) as Subject<any>;

  private element?: HTMLCanvasElement;
  private chart?: Chart;

  constructor(props: ChartViewProps) {
    super(props);
    this.chartUpdate$.subscribe(_ignore => this.forceChartUpdate());
    this.onPickSolarDate = this.onPickSolarDate.bind(this);
    this.onPickSolarSlowDate = this.onPickSolarSlowDate.bind(this);
  }

  render() {
    const {className, style, widgetKey} = this.props;
    const {error, subscription, configReactComponent, title, started, ended} = this.state;
    const componentClass = classNames(className, 'chart-view');

    return (
      <Panel className={componentClass} style={style} bsStyle={this.panelBsStyle()}>
        <Panel.Heading>
          <a onClick={() => store.dispatch(chartStreamActionCreators.delChartStream(widgetKey))}
             className='close align-text-top' href='#'>&times;</a>
          <Button disabled={subscription === undefined} className='pull-right clearfix' bsStyle='warning'
                  bsSize='xsmall' onClick={this.cancelStream}>Cancel Stream</Button>
          <h4>{title} {(ended !== undefined) && (<span> [{(ended - started!).toFixed(2)}ms]</span>)}
            {this.state.error !== undefined &&
            (<span> - <Label bsStyle='danger'>{error instanceof Error ? error.message : error}</Label></span>)}</h4>
        </Panel.Heading>
        <Panel.Body>
          <div hidden={started === undefined} className='chartjs-container'>
            <canvas ref={this.ref}/>
          </div>
          {(started === undefined) && (
            <DropdownButton title='Choose Chart' id='dropdown-basic-large'>
              <MenuItem eventKey='1' onSelect={() =>
                this.displayChartConfig(<DaySelector title='Pick Day'
                                                     onPickDate={this.onPickSolarDate}/>)}>Solar</MenuItem>
              <MenuItem eventKey='2' onSelect={() =>
                this.displayChartConfig(<DaySelector title='Pick Day'
                                                     onPickDate={this.onPickSolarSlowDate}/>)}>Solar Slow</MenuItem>
            </DropdownButton>
          )}
          {(configReactComponent)}
        </Panel.Body>
      </Panel>
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
          }
        },
        maintainAspectRatio: false,
      },
      data: {
        datasets
      }
    });

    this.setState({
      configReactComponent: undefined,

      title,

      subscription: clientStreams.subscribeStream(streamUri, {
        next: (chartPoints: Chart.ChartPoint[]) => {
          // Support array of chart points rather than send one point at a time
          // console.debug('ChartView NEXT:', chartPoint);
          const chartDataSets: Chart.ChartDataSets[] = this.chart!.data.datasets!;
          for (let i = 0; i < chartPoints.length; i++) {
            (chartDataSets[i].data! as Chart.ChartPoint[]).push(chartPoints[i]);
          }
          this.throttledChartUpdate();
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
        }
      }),

      started: window.performance.now()
    });
  }

  private onPickSolarDate(moment: moment.Moment): void {
    this.configSolarDate(false, moment);
  }

  private onPickSolarSlowDate(moment: moment.Moment): void {
    this.configSolarDate(true, moment);
  }

  private configSolarDate(isSlow: boolean, moment: moment.Moment): void {
    const startDateISOString = moment.toISOString();
    const endDateISOString = moment.add(1, 'day').toISOString();
    this.configChart(
      `solar${isSlow ? 'Slow' : ''}?startDate=${startDateISOString}&endDate=${endDateISOString}`,
      `Solar ${moment.format('dddd, MMMM Do YYYY')}`,
      {
        xAxes: [{
          type: 'time',
          time: {
            min: startDateISOString,
            max: endDateISOString,
          },
          scaleLabel: {
            display: true,
            labelString: 'DateTime'
          }
        }],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Degrees'
            }
          }
        ]
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
        }
      ]
    );
  }

  private throttledChartUpdate(): void {
    this.chartUpdate$.next(0);
  }

  private forceChartUpdate(): void {
    if (this.chart) {
      this.chart.update();
    }
  }

  private ref = (element: HTMLCanvasElement) => {
    this.element = element;
  };

  componentWillUnmount() {
    console.debug('ChartStream componentWillUnmount', this.props.widgetKey);
    this.cancelStream();
    if (this.chart !== undefined) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private cancelStream: () => void =
    () => {
      if (this.state.subscription) {
        this.state.subscription.unsubscribe();
        this.setState({subscription: undefined});
      }
    };

  private panelBsStyle: () => string | undefined = () => {
    if (this.state.error) return 'danger';
    if (this.state.subscription) return 'success';
    return undefined;
  };
}

export function chartStreamToWidget(key: string): Widget {
  return {
    itemKey: key,
    itemClassName: 'chart-stream-widget',
    element: <ChartView widgetKey={key}/>
  };
}
