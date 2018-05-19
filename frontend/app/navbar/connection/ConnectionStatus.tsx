import * as React from 'react';
import {Badge} from 'reactstrap';
import * as classNames from 'classnames';
import {ConnectionStateEnum} from './ConnectionStateRecord';

export interface ConnectionStatusProps {
  connectionState: ConnectionStateEnum;
  className?: string;
  style?: React.CSSProperties;
}

function ConnectionStatusBadge(streamState: ConnectionStateEnum) {
  switch (streamState) {
    case ConnectionStateEnum.DISCONNECTED:
      return (<Badge color='danger'>Disconnected</Badge>);
    case ConnectionStateEnum.CONNECTING:
      return (<Badge color='info'>Connecting</Badge>);
    case ConnectionStateEnum.CONNECTED:
      return (<Badge color='success'>Connected</Badge>);
    case ConnectionStateEnum.DISCONNECTING:
      return (<Badge color='info'>Disconnecting</Badge>);
    case ConnectionStateEnum.OFFLINE:
      return (<Badge color='default'>Offline</Badge>);
    default:
      return (<Badge color='warning'>Unknown</Badge>);
  }
}

export const ConnectionStatus: React.SFC<ConnectionStatusProps> = (props) => {
  const {className, style, connectionState} = props;
  const componentClass = classNames(className, 'connection-status');

  return (<div className={componentClass} style={style}>{ConnectionStatusBadge(connectionState)}</div>);
};
