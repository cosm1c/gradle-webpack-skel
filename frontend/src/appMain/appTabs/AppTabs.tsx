import * as classNames from 'classnames';
import * as React from 'react';
import {Button, ButtonGroup, Card, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import {JobsListConnected} from './job/JobsListConnected';
import {AlertLevel, fireGlobalAlert} from '../../appAlert';

export interface AppTabsProps {
  className?: string;
  style?: React.CSSProperties;
}

interface State {
  activeTab: string;
}

export class AppTabs extends React.Component<AppTabsProps, State> {

  private static startExampleJob() {
    console.warn('startExampleJob for demo only');
    fetch('/job?description=Example job with random length&total=' + Math.round(Math.random() * 997), {method: 'POST'})
      .catch((error) => {
        fireGlobalAlert(error, AlertLevel.DANGER);
      });
  }

  private static addChartStream() {
    console.warn('TODO: addChartStream');
  }

  public state: State = {
    activeTab: '1',
  };

  constructor(props: AppTabsProps) {
    super(props);
  }

  public render() {
    const {className, style} = this.props;
    const componentClass = classNames(className, 'app');

    return (
      <div className={componentClass} style={style}>
        <Card className='sticky-top'>
          <Nav tabs={true}>
            <NavItem>
              <NavLink
                className={classNames({active: this.state.activeTab === '1'})}
                onClick={this.selectJobsTab}
              >
                Jobs
              </NavLink></NavItem>
            <NavItem>
              <NavLink
                className={classNames({active: this.state.activeTab === '2'})}
                onClick={this.selectChartsTab}
              >
                Charts
              </NavLink>
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
            TODO: Charts Tab
          </TabPane>
        </TabContent>
      </div>
    );
  }

  private selectJobsTab = () => this.toggle('1');

  private selectChartsTab = () => this.toggle('2');

  private toggle = (activeTab: string) => {
    if (this.state.activeTab !== activeTab) {
      this.setState({activeTab});
    }
  };
}
