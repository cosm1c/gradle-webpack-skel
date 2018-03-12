import './main.less';
import store from './store';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Col, Grid, Nav, Navbar, NavItem, Row} from 'react-bootstrap';
import stream, {StreamStatusConnected} from './stream';
import {UserCountConnected} from './userCount';

const Root = (
  <Provider store={store}>
    <Grid>
      <Row>
        <Col>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>Gradle Webpack Skeleton</Navbar.Brand>
            </Navbar.Header>
            <Nav pullRight={true}>
              <NavItem eventKey={1}><StreamStatusConnected/></NavItem>
              <NavItem eventKey={2}><UserCountConnected/></NavItem>
            </Nav>
          </Navbar>
        </Col>
      </Row>
    </Grid>
  </Provider>
);

function onStart() {
  stream.connect();
}

render(Root, document.getElementById('root'), onStart);
