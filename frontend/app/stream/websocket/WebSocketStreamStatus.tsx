import * as React from 'react';
import {Label} from 'react-bootstrap';
import * as classNames from 'classnames';
import {ConnectionStateEnum} from './WebSocketStateRecord';

interface WebSocketStreamStatusProps {
  connectionState: ConnectionStateEnum;
  className?: string;
  style?: React.CSSProperties;
}

function connectionStateLabel(streamState: ConnectionStateEnum) {
  switch (streamState) {
    case ConnectionStateEnum.DISCONNECTED:
      return (<Label bsStyle='danger'>Disconnected</Label>);
    case ConnectionStateEnum.CONNECTING:
      return (<Label bsStyle='info'>Connecting</Label>);
    case ConnectionStateEnum.CONNECTED:
      return (<Label bsStyle='success'>Connected</Label>);
    case ConnectionStateEnum.DISCONNECTING:
      return (<Label bsStyle='info'>Disconnecting</Label>);
    case ConnectionStateEnum.OFFLINE:
      return (<Label bsStyle='default'>Offline</Label>);
    default:
      return (<Label bsStyle='warning'>Unknown</Label>);
  }
}

export const WebSocketStreamStatus: React.SFC<WebSocketStreamStatusProps> = (props) => {
  const {className, style, connectionState} = props;
  const componentClass = classNames(className, 'web-socket-stream-status');

  return (<div className={componentClass} style={style}>{connectionStateLabel(connectionState)}</div>);
};
