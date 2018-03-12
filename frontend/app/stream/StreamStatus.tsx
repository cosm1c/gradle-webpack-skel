import * as React from 'react';
import {Label} from 'react-bootstrap';
import * as classNames from 'classnames';
import {streamStateDisplay, StreamStateEnum} from './StreamStateRecord';

interface StreamStatusProps {
  streamState: StreamStateEnum;
  className?: string;
  style?: React.CSSProperties;
}

function websocketLabel(streamState: StreamStateEnum) {
  switch (streamState) {
    case StreamStateEnum.DISCONNECTED:
      return (<Label bsStyle='danger'>Disconnected</Label>);
    case StreamStateEnum.CONNECTING:
      return (<Label bsStyle='info'>Connecting</Label>);
    case StreamStateEnum.CONNECTED:
      return (<Label bsStyle='success'>Connected</Label>);
    case StreamStateEnum.DISCONNECTING:
      return (<Label bsStyle='default'>Disconnecting</Label>);
    default:
      return (<Label bsStyle='warning'>Unknown {streamStateDisplay(streamState)}</Label>);
  }
}

export const StreamStatus: React.SFC<StreamStatusProps> = (props) => {
  const {className, style, streamState} = props;
  const digraphClass = classNames(className, 'stream-status');

  return (<div className={digraphClass} style={style}>{websocketLabel(streamState)}</div>);
};
