import * as React from 'react';
import * as Loadable from 'react-loadable';

export class AppMainLoading extends React.Component<Loadable.LoadingComponentProps> {
  public render() {
    if (this.props.error) {
      return <div>Error! {this.props.error}</div>;
    } else if (this.props.timedOut) {
      return <div>Taking a long time...</div>;
    } else if (this.props.pastDelay) {
      return <div>Loading...</div>;
    } else {
      return null;
    }
  }
}
