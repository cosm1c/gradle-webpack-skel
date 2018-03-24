import * as classNames from 'classnames';
import * as React from 'react';
import {ListGroup, Panel} from 'react-bootstrap';
import {ChartView} from './ChartView';

export interface ChartStreamsProps {
  className?: string;
  style?: React.CSSProperties;
}

type State = {
  charts: ChartView[];
};

export class ChartStreams extends React.Component<ChartStreamsProps, State> {
  state: State = {
    charts: [],
  };

  /*
  addStream: (streamUri: string) => void =
    (streamUri: string) => {
      const subscribable = clientStreams.subscribeStream(streamUri);

      // TODO: dismiss(): remove from charts array and unsubscribe
      const dismiss = () => {
        console.warn('dismiss() not implemented');
      };

      const chartView = new ChartView({
        header: 'Some header',
      });

      this.setState(prevState => ({
        charts: [...prevState.charts, chartView]
      }));

      // TODO: set key for charts children list
    };
  */

  render() {
    const {className, style} = this.props;
    const {charts} = this.state;
    const componentClass = classNames(className, 'chart-streams');

    return (
      <Panel className={componentClass} style={style} bsStyle='info'>
        <Panel.Heading>
          <Panel.Title componentClass='h3'>Streams</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <ListGroup>
            {charts}
          </ListGroup>
        </Panel.Body>
      </Panel>
    );
  }
}
