import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';
import * as classNames from 'classnames';
import * as React from 'react';
import {Button, Label, Panel} from 'react-bootstrap';
import {Chart} from 'chart.js';
import {clientStreams} from '../../main';
import {Widget} from '../widgetlist';
import {IChartStreamRecord} from './';

export interface ChartViewProps {
  chartStream: IChartStreamRecord;
  className?: string;
  style?: React.CSSProperties;
}

type State = {
  subscription?: Subscription;
  error?: string;
};

Chart.defaults.global.animation = Chart.defaults.global.animation || {};
Chart.defaults.global.animation.duration = 100;

export class ChartView extends React.Component<ChartViewProps, State> {

  state: State = {};

  private element?: HTMLCanvasElement;
  private chart?: Chart;

  private readonly chartUpdate$: Subject<any> = new Subject().debounceTime(10) as Subject<any>;

  constructor(props: ChartViewProps) {
    super(props);
    const {chartStream} = props;

    this.state.subscription = clientStreams.subscribeStream(chartStream.get('streamURI'), {
      next: (chartPoint: Chart.ChartPoint) => {
        // Support array of chart points rather than send one point at a time
        // console.debug('ChartView NEXT:', data);
        if (this.chart) {
          if (!this.chart.data.datasets) {
            throw new Error('Undefined this.chart.data.datasets');
          }

          (this.chart.data.datasets[0].data! as Chart.ChartPoint[]).push(chartPoint);
          this.throttledChartUpdate();

        } else {
          console.error('No chart when onNext called in ChartView', this);
        }
      },
      error: (error: any) => {
        console.error('ChartView ERROR:', error, this);
        this.setState({error});
        this.cancelStream();
        this.forceChartUpdate();
      },
      complete: () => {
        // console.debug('ChartView COMPLETE', this);
        this.cancelStream();
        this.forceChartUpdate();
      }
    });
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

  componentDidMount() {
    this.chart = new Chart(this.element!, this.props.chartStream.get('chartConfig'));
    this.chartUpdate$.subscribe(_ignore => {
      if (this.chart) {
        this.chart.update();

      } else {
        throw new Error();
      }
    });
  }

  componentWillUnmount() {
    console.debug('ChartStream componentWillUnmount', this.props.chartStream);
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

  render() {
    const {className, style, chartStream} = this.props;
    const {error, subscription} = this.state;
    const componentClass = classNames(className, 'chart-view');

    return (
      <Panel className={componentClass} style={style} bsStyle={this.panelBsStyle()}>
        <Panel.Heading>
          {/*<a onClick={() => console.log('TODO: close Chart')} className='close align-text-top' href='#'>&times;</a>*/}
          <Button disabled={subscription === undefined} className='pull-right clearfix' bsStyle='warning'
                  bsSize='xsmall' onClick={this.cancelStream}>Cancel Stream</Button>
          <h4>Chart {chartStream.get('streamURI')}
            {typeof error === 'string' && <span> - <Label bsStyle='danger'>{error}</Label></span>}</h4>
        </Panel.Heading>
        <Panel.Body>
          <canvas ref={this.ref}/>
        </Panel.Body>
      </Panel>
    );
  }
}

export function chartStreamToWidget(chartStream: IChartStreamRecord): Widget {
  return {
    itemKey: `chart:${chartStream.get('key')}`,
    itemClassName: 'chart-stream-widget',
    element: <ChartView chartStream={chartStream}/>
  };
}
