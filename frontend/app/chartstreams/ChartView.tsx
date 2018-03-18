import * as classNames from 'classnames';
import * as React from 'react';
import {ListGroupItem} from 'react-bootstrap';

export interface ChartViewProps {
  header: string;
  // TODO: chart properties
  // TODO: observer
  cancelStream: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ChartView: React.SFC<ChartViewProps> = (props) => {
  const {className, style, header, cancelStream} = props;
  const componentClass = classNames(className, 'chart-view');

  return (
    <ListGroupItem header={header} className={componentClass} style={style}>
      <a onClick={cancelStream} className='close align-text-top' href='#'>&times;</a>
      TODO: CHARTJS real time
    </ListGroupItem>
  );
};
