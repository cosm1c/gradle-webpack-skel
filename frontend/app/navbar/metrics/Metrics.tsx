import * as classNames from 'classnames';
import * as React from 'react';
import {Badge} from 'reactstrap';

export interface MetricsProps {
  webSocketCount: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Metrics: React.SFC<MetricsProps> = (props) => {
  const {className, style, webSocketCount} = props;
  const componentClass = classNames(className, 'app-metrics');

  return (
    <Badge className={componentClass} style={style} color='info'>WebSockets: {webSocketCount}</Badge>
  );

};
