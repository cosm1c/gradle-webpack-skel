import * as moment from 'moment';
import * as classNames from 'classnames';
import * as React from 'react';
import {Panel} from 'react-bootstrap';
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

  return (<Panel className={componentClass} style={style}>
      <Panel.Heading>
        <Panel.Title componentClass='h3'>{title}</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <Calendar
          year={new Date().getFullYear()}
          onPickDate={onPickDate}
        />
      </Panel.Body>
    </Panel>
  );
};
