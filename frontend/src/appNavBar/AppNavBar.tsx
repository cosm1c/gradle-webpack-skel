import * as classNames from 'classnames';
import * as React from 'react';
import {Badge, Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem} from 'reactstrap';
import {ClientStreamsMap} from '../clientStreams/redux-duck';
import {ConnectionStatus} from './connection/ConnectionStatus';

export interface AppNavBarProps {
  clientStreamsMap: ClientStreamsMap;
  className?: string;
  style?: React.CSSProperties;
}

interface State {
  isOpen: boolean;
}

export class AppNavBar extends React.Component<AppNavBarProps, State> {

  public state: State = {
    isOpen: true,
  };

  public toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  public render() {
    const {className, style, clientStreamsMap} = this.props;
    const componentClass = classNames(className, 'app-nav-bar');

    return (
      <Navbar color='light' light={true} expand='md' className={componentClass} style={style}>
        <NavbarBrand href='/'>Webpack-Skel</NavbarBrand>
        <NavbarToggler onClick={this.toggle}/>
        <Collapse isOpen={this.state.isOpen} navbar={true}>
          <Nav className='ml-auto' navbar={true}>
            {clientStreamsMap.isEmpty() && (
              <NavItem>
                <Badge color='warning'>No Connections</Badge>
              </NavItem>
            )}
            {clientStreamsMap.entrySeq().map((i) => (
              <NavItem key={i![0]}>
                <ConnectionStatus connectionId={i![0]} connectionState={i![1]!}/>
              </NavItem>
            ))}
          </Nav>
        </Collapse>
      </Navbar>
    );
  }

}
