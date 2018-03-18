import * as classNames from 'classnames';
import {Observer} from 'rxjs/Observer';
import * as React from 'react';
import {ListGroup, Panel} from 'react-bootstrap';

export interface ChartStreamsProps {
  className?: string;
  style?: React.CSSProperties;
}

type State = {
  // charts: ChartView;
};

// TODO: implement ChartStreams
export class ChartStreams extends React.Component<ChartStreamsProps, State> {
  state: State = {
    charts: [],
  };

  addStream = () => {
  };

  render() {
    const {className, style, children} = this.props;
    const componentClass = classNames(className, 'chart-streams');

    return (
      <Panel className={componentClass} style={style} bsStyle='info'>
        <Panel.Heading>
          <Panel.Title componentClass='h3'>Streams</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <ListGroup>
            {children}
          </ListGroup>
        </Panel.Body>
      </Panel>
    );
  }
}

export const exampleObserver: Observer<any> = {

  next(value: any) {
    console.info('NEXT:', value);
  },

  error(err: any) {
    console.error('ERROR', err);
  },

  complete() {
    console.info('COMPLETE');
  }
};
