import * as classNames from 'classnames';
import * as React from 'react';
import {Widget} from './selectors';

export interface WidgetListProps {
  widgets: Widget[];
  className?: string;
  style?: React.CSSProperties;
}

export const WidgetList: React.SFC<WidgetListProps> = (props) => {
  const {className, style, widgets} = props;
  const componentClass = classNames(className, 'widget-list');

  return (
    <div className={componentClass} style={style}>
      {widgets.map((widget) =>
        <div
          key={widget.itemKey}
          className={widget.itemClassName}
          style={widget.itemStyle}
        >
          {widget.element}
        </div>)}
    </div>
  );
};
