import * as classNames from 'classnames';
import * as React from 'react';
import {Alert, Button, Collapse} from 'react-bootstrap';

export interface ClientCountProps {
  errorMessage: string;
  handleDismiss: () => any;
  className?: string;
  style?: React.CSSProperties;
}

export const ErrorToaster: React.SFC<ClientCountProps> = (props) => {
  const {className, style, errorMessage, handleDismiss} = props;
  const componentClass = classNames(className, 'error-toaster');

  return (
    <div className={componentClass} style={style}>
      <Collapse in={errorMessage !== ''}>
        <Alert bsStyle='danger' onDismiss={handleDismiss}>
          <h4>Error!</h4>
          <p>{errorMessage}</p>
          <p>
            <Button onClick={handleDismiss}>Dismiss</Button>
          </p>
        </Alert>
      </Collapse>
    </div>
  );
};
