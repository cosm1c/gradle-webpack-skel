import * as classNames from 'classnames';
import * as React from 'react';
import {Alert, Button, Collapse} from 'reactstrap';
import {IGlobalAlertStateRecord} from './GlobalAlertStateRecord';

export interface ErrorToasterProps {
  globalAlert: IGlobalAlertStateRecord;
  ackGlobalAlert: () => any;
  className?: string;
  style?: React.CSSProperties;
}

export const AlertToaster: React.SFC<ErrorToasterProps> = (props) => {
  const {className, style, globalAlert, ackGlobalAlert} = props;
  const componentClass = classNames(className, 'error-toaster');

  return (
    <div className={componentClass} style={style}>
      <Collapse isOpen={globalAlert.lastAckDate < globalAlert.date}>
        <Alert color={globalAlert.color} toggle={ackGlobalAlert}>
          <h4>Error - {globalAlert.date.toISOString()}</h4>
          <p>{globalAlert.message}</p>
          <p>
            <Button onClick={ackGlobalAlert}>Dismiss</Button>
          </p>
        </Alert>
      </Collapse>
    </div>
  );
};
