import {Map as ImmutableMap} from 'immutable';
import * as React from 'react';
import {Badge} from 'reactstrap';
import * as classNames from 'classnames';
import {ConnectionStatusEnum, IConnectionStateRecord} from '../../clientStreams/ConnectionStateRecord';
import clientStreams from '../../clientStreams/ClientStreams';
import {Observer, Subscription} from 'rxjs/index';

export interface ConnectionStatusOwnProps {
  connectionId: string;
}

export interface ConnectionStatusProps {
  connectionState: IConnectionStateRecord;
  className?: string;
  style?: React.CSSProperties;
}

function ConnectionStatusBadge(id: string, connectionStatus: ConnectionStatusEnum) {
  switch (connectionStatus) {
    case ConnectionStatusEnum.DISCONNECTED:
      return (<Badge color='danger'>{id} Disconnected</Badge>);
    case ConnectionStatusEnum.CONNECTING:
      return (<Badge color='info'>{id} Connecting</Badge>);
    case ConnectionStatusEnum.CONNECTED:
      return (<Badge color='success'>{id} Connected</Badge>);
    case ConnectionStatusEnum.DISCONNECTING:
      return (<Badge color='info'>{id} Disconnecting</Badge>);
    case ConnectionStatusEnum.OFFLINE:
      return (<Badge color='default'>{id} Offline</Badge>);
    default:
      console.log('Unknown streamState', connectionStatus);
      return (<Badge color='warning'>{id} Unknown</Badge>);
  }
}

function display(value: any): string {
  if (isNaN(value)) {
    return `${value}`;
  }
  return value.toLocaleString();
}

interface State {
  meta: ImmutableMap<any, any>;
  subscription?: Subscription;
}

export class ConnectionStatus extends React.Component<ConnectionStatusProps & ConnectionStatusOwnProps, State> {

  public state: State = {
    meta: ImmutableMap(),
  };

  private readonly metaObserver: Observer<any>;

  constructor(props: ConnectionStatusProps & ConnectionStatusOwnProps) {
    super(props);

    this.metaObserver = {
      next: this.receiveMetaNext,
      error: this.receiveMetaError,
      complete: this.receiveMetaComplete,
    };
  }

  public render() {
    const {className, style, connectionId, connectionState} = this.props;
    const {meta} = this.state;
    const componentClass = classNames(className, 'connection-status');
    const connectionStatus = connectionState.get('status');

    return (
      <div className={componentClass} style={style}>
        {ConnectionStatusBadge(connectionId, connectionStatus)}
        {meta.entrySeq().map((entry) => (
          <Badge color='info' key={entry![0]}>{display(entry![0])}: {display(entry![1])}</Badge>
        ))}
      </div>
    );
  }

  public componentDidMount(): void {
    console.debug(`Connection ${this.props.connectionId} mounting`);
    this.reconnect();
  }

  public componentWillUnmount(): void {
    console.debug(`Connection ${this.props.connectionId} unmounting`);
    if (this.state.subscription) {
      this.state.subscription.unsubscribe();
      this.setState({subscription: undefined});
    }
  }

  private receiveMetaNext = (msg: any) => {
    this.setState((prevState) => {
      return {meta: prevState.meta.merge(msg)};
    });
  };

  private receiveMetaError = (err: any) => {
    console.error(`Connection ${this.props.connectionId} meta Error`, err);
    this.reconnect();
  };

  private receiveMetaComplete = () => {
    console.error(`Connection ${this.props.connectionId} meta complete`);
    this.reconnect();
  };

  private reconnect = () => {
    this.setState({
      meta: ImmutableMap(),
      subscription: clientStreams.subscribeStream(this.props.connectionId, 'meta', this.metaObserver),
    });
  };

}
