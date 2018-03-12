import * as classNames from 'classnames';
import * as React from 'react';
import {Label} from 'react-bootstrap';

export interface UserCountProps {
  userCount: number;
  className?: string;
  style?: React.CSSProperties;
}

export const UserCount: React.SFC<UserCountProps> = (props) => {
  const {className, style, userCount} = props;
  const componentClass = classNames(className, 'user-count');

  return (
    <div>
      <Label className={componentClass} style={style}
             bsStyle='info'>Users: {userCount}</Label>
    </div>
  );
};
