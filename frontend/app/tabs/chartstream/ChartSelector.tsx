import * as React from 'react';
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';

export interface ChartSelectorProps {
}

interface State {
  dropdownOpen: boolean;
}

export default class ChartSelector extends React.Component<ChartSelectorProps, State> {

  public state: State = {
    dropdownOpen: false,
  };

  constructor(props: ChartSelectorProps) {
    super(props);
  }

  public render() {
    return (
      <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>
          Dropdown
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem disabled>Action</DropdownItem>
          <DropdownItem>Another Action</DropdownItem>
          <DropdownItem divider/>
          <DropdownItem>Another Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  private toggle = () => {
    this.setState({dropdownOpen: !this.state.dropdownOpen});
  };
}
