import * as classNames from 'classnames';
import * as React from 'react';
import {Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem} from 'reactstrap';
import {ConnectionStatusConnected} from './connection/ConnectionConnected';
import {MetricsConnected} from './metrics/MetricsConnected';

export interface AppNavBarProps {
  className?: string;
  style?: React.CSSProperties;
}

type State = {
  isOpen: boolean;
};

export class AppNavBar extends React.Component<AppNavBarProps, State> {

  state: State = {
    isOpen: true,
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  render() {
    const {className, style} = this.props;
    const componentClass = classNames(className, 'app-nav-bar');

    return (
      <Navbar color='light' light expand='md' className={componentClass} style={style}>
        <NavbarBrand href='/'>Webpack-Skel</NavbarBrand>
        <NavbarToggler onClick={this.toggle}/>
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className='ml-auto' navbar>
            <NavItem>
              <MetricsConnected/>
            </NavItem>
            <NavItem>
              <ConnectionStatusConnected/>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }

}
