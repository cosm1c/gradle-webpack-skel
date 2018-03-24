import {AnonymousSubscription} from 'rxjs/Subscription';
import * as classNames from 'classnames';
import * as React from 'react';
import {Button, ListGroupItem} from 'react-bootstrap';

export interface ChartViewProps {
  header: string;
  className?: string;
  style?: React.CSSProperties;
}

type State = {
  error?: any;
  subscription: AnonymousSubscription;
};

export class ChartView extends React.Component<ChartViewProps, State> {

  constructor(props: ChartViewProps) {
    super(props);
    const {} = props;

    /*
        const self = this;
        const subscription = subscribable.subscribe({
          next(value: any) {
            console.info('NEXT:', value);
          },

          error(err: any) {
            console.error('ERROR', err);
            self.setState({
              isOpen: false,
              error: err
            });
          },

          complete() {
            console.info('COMPLETE');
            self.setState({
              isOpen: false
            });
          }
        });

        this.setState({isOpen: true, subscription});
      }

      private unsubscribe() {
        if (this.state.isOpen) {
          this.state.subscription.unsubscribe();
        }
      }

      componentWillUnmount() {
        this.unsubscribe();
    */
  }

  render() {
    const {className, style, header} = this.props;
    const {error, subscription} = this.state;
    const componentClass = classNames(className, 'chart-view');

    // TODO: display error
    return (
      <ListGroupItem header={header} bsStyle={typeof error === 'undefined' ? '' : 'danger'}
                     className={componentClass} style={style}>
        <Button hidden={false} bsStyle='warning' bsSize='xsmall'
                onClick={subscription.unsubscribe}>unsubscribe</Button>
        <a onClick={() => {
        }} className='close align-text-top' href='#'>&times;</a>
        TODO: CHARTJS real time
      </ListGroupItem>
    );
  }
}
