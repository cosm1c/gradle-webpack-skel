import * as classNames from 'classnames';
import * as React from 'react';
import {Alert, Button, Collapse} from 'react-bootstrap';
import {IGlobalErrorStateRecord} from './GlobalErrorStateRecord';

export interface ErrorToasterProps {
  globalError: IGlobalErrorStateRecord;
  ackGlobalError: () => any;
  className?: string;
  style?: React.CSSProperties;
}

export const ErrorToaster: React.SFC<ErrorToasterProps> = (props) => {
  const {className, style, globalError, ackGlobalError} = props;
  const componentClass = classNames(className, 'error-toaster');

  return (
    <div className={componentClass} style={style}>
      <Collapse in={globalError.lastAckDate < globalError.date}>
        <Alert bsStyle='danger' onDismiss={ackGlobalError}>
          <h4>Error - {globalError.date.toISOString()}</h4>
          <p>{globalError.error && globalError.error.message}</p>
          <p>
            <Button onClick={ackGlobalError}>Dismiss</Button>
          </p>
        </Alert>
      </Collapse>
    </div>
  );
};
