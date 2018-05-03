import 'babel-polyfill';
import './main.less';
import {default as store} from './store';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Button, Nav, Navbar, NavItem} from 'react-bootstrap';
import {ErrorToasterConnected} from './globalError';
import {WebSocketStreamStatusConnected} from './stream';
import {ClientCountConnected} from './clientsCount';
import {chartStreamActionCreators} from './widgets/chartstream';
import WidgetListConnected from './widgets/widgetlist/WidgetListConnected';

// TODO: dynamic imports for code splitting

const Root = (
  <Provider store={store}>
    <div className='root-container'>

      <Navbar className='navbar-row'>
        <Navbar.Header>
          <Navbar.Brand>Gradle Webpack Skeleton</Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight={true}>
            <NavItem eventKey={1}><WebSocketStreamStatusConnected/></NavItem>
            <NavItem eventKey={2}><ClientCountConnected/></NavItem>
            <NavItem eventKey={3}>
              <Button bsStyle='primary' bsSize='xsmall'
                      onClick={() => store.dispatch(chartStreamActionCreators.addChartStream())}>Add Chart</Button>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <main className='main-container'>
        <WidgetListConnected/>
      </main>

      <ErrorToasterConnected className='footer'/>

    </div>
  </Provider>
);

render(Root, document.getElementById('root'));
