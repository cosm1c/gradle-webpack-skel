import * as classNames from 'classnames';
import * as React from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import {Widget} from './selectors';

export interface WidgetListProps {
  widgets: Widget[];
  className?: string;
  style?: React.CSSProperties;
}

export const WidgetList: React.SFC<WidgetListProps> = (props) => {
  const {className, style, widgets} = props;
  const componentClass = classNames(className, 'widget-list');
debugger;
  return (
    <ListGroup className={componentClass} style={style}>{
      widgets.map(widget =>
        <ListGroupItem key={widget.key} header={widget.header} className={widget.className}>
          {widget.element}
        </ListGroupItem>)
    }</ListGroup>
  );
};
