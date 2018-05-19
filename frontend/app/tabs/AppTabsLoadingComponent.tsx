import * as React from 'react';
import * as Loadable from 'react-loadable';

export class AppTabsLoadingComponent extends React.Component<Loadable.LoadingComponentProps> {
  public render() {
    return <div>Loading... {JSON.stringify(this.props)}</div>;
  }
}
