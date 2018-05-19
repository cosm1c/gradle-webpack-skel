import * as classNames from 'classnames';
import * as React from 'react';
import {Button, Card, CardHeader, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import {ConnectionStateEnum} from '../navbar/connection/ConnectionStateRecord';
import {ChartStreamsListConnected, JobsListConnected} from './widgetlist';
import clientStreams from '../stream/ClientStreams';
import {chartStreamActionCreators} from './chartstream';
import {rootStore} from '../store';

export interface AppTabsProps {
  connectionState: ConnectionStateEnum;
  className?: string;
  style?: React.CSSProperties;
}

interface State {
  activeTab: string;
}

export class AppTabs extends React.Component<AppTabsProps, State> {

  public state: State = {
    activeTab: '1',
  };

  constructor(props: AppTabsProps) {
    super(props);
  }

  public componentWillUnmount() {
    clientStreams.dispose();
  }

  public render() {
    const {className, style} = this.props;
    const componentClass = classNames(className, 'app');

    return (
      <div className={componentClass} style={style}>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classNames({active: this.state.activeTab === '1'})}
              onClick={() => {
                this.toggle('1');
              }}>Jobs</NavLink></NavItem>
          <NavItem>
            <NavLink
              className={classNames({active: this.state.activeTab === '2'})}
              onClick={() => {
                this.toggle('2');
              }}>Charts</NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId='1'>
            <JobsListConnected/>
          </TabPane>
          <TabPane tabId='2'>
            <Card>
              <CardHeader>
                <Button color='primary' size='sm'
                        onClick={() => rootStore.dispatch(chartStreamActionCreators.addChartStream())}
                >Add Chart</Button>
              </CardHeader>
              <ChartStreamsListConnected/>
            </Card>
          </TabPane>
        </TabContent>
      </div>
    );
  }

  private toggle = (activeTab: string) => {
    if (this.state.activeTab !== activeTab) {
      this.setState({activeTab});
    }
  };
}
