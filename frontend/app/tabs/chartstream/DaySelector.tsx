import * as moment from 'moment';
import * as classNames from 'classnames';
import * as React from 'react';
import {Card, CardTitle} from 'reactstrap';
import {Calendar} from 'react-yearly-calendar';

export interface DaySelectorProps {
  title: string;
  onPickDate: (moment: moment.Moment) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const DaySelector: React.SFC<DaySelectorProps> = (props) => {
  const {className, style, title, onPickDate} = props;
  const componentClass = classNames(className, 'day-selector');

  return (
    <Card className={componentClass} style={style}>
      <CardTitle>{title}</CardTitle>
      <Calendar
        year={new Date().getFullYear()}
        onPickDate={onPickDate}
      />
    </Card>
  );
};
