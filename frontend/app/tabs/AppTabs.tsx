import * as classNames from 'classnames';
import * as React from 'react';
import {Button, ButtonGroup, Card, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import {ConnectionStateEnum} from '../navbar/connection/ConnectionStateRecord';
import {ChartStreamsListConnected, JobsListConnected} from './widgetlist';
import {chartStreamActionCreators} from './chartstream';
import {rootStore} from '../store';
import {globalAlertActionCreators} from '../globalAlert/actions';

export interface AppTabsProps {
  connectionState: ConnectionStateEnum;
  className?: string;
  style?: React.CSSProperties;
}

interface State {
  activeTab: string;
}

export class AppTabs extends React.Component<AppTabsProps, State> {

  private static startExampleJob() {
    fetch('/job?description=Example job with random length&total=' + Math.round(Math.random() * 997), {method: 'POST'})
      .catch((error) => {
        rootStore.dispatch(globalAlertActionCreators.globalAlert(error, 'danger'));
      });
  }

  private static addChartStream() {
    return rootStore.dispatch(chartStreamActionCreators.addChartStream());
  }

  public state: State = {
    activeTab: '1',
  };

  constructor(props: AppTabsProps) {
    super(props);
  }

  /*
  public componentWillUnmount() {
    clientStreams.dispose();
  }
  */

  public render() {
    const {className, style} = this.props;
    const componentClass = classNames(className, 'app');

    return (
      <div className={componentClass} style={style}>
        <Card className='sticky-top'>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classNames({active: this.state.activeTab === '1'})}
                onClick={() => this.toggle('1')}>Jobs</NavLink></NavItem>
            <NavItem>
              <NavLink
                className={classNames({active: this.state.activeTab === '2'})}
                onClick={() => this.toggle('2')}>Charts</NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId='1'>
              <ButtonGroup>
                <Button color='info' onClick={AppTabs.startExampleJob}>Start Random Job</Button>
              </ButtonGroup>
            </TabPane>
            <TabPane tabId='2'>
              <ButtonGroup>
                <Button color='primary' onClick={AppTabs.addChartStream}>Add Chart</Button>
              </ButtonGroup>
            </TabPane>
          </TabContent>
        </Card>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId='1'>
            <JobsListConnected/>
          </TabPane>
          <TabPane tabId='2'>
            <ChartStreamsListConnected/>
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
