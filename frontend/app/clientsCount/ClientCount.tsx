import * as classNames from 'classnames';
import * as React from 'react';
import {Label} from 'react-bootstrap';

export interface ClientCountProps {
  clientCount: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ClientCount: React.SFC<ClientCountProps> = (props) => {
  const {className, style, clientCount} = props;
  const componentClass = classNames(className, 'user-count');

  return (
    <Label className={componentClass} style={style} bsStyle='info'>Clients: {clientCount}</Label>
  );
};
