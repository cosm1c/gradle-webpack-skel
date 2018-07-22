import * as classNames from 'classnames';
import * as React from 'react';
import {AppTabs} from './appTabs/AppTabs';

export interface AppMainProps {
  className?: string;
  style?: React.CSSProperties;
}

export default class AppMain extends React.Component<AppMainProps> {

  public render() {
    const {className, style} = this.props;
    const componentClass = classNames(className, 'app-main');

    return (
      <div className={componentClass} style={style}>
        <AppTabs/>
      </div>
    );
  }
}
