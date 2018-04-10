import * as classNames from 'classnames';
import * as React from 'react';
import {Button, ControlLabel, FormControl, FormGroup, HelpBlock, Panel} from 'react-bootstrap';

export interface StartEndSelectorProps {
  title: string;
  initStart: number;
  initEnd: number;
  onSubmit: (start: number, end: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

type State = {
  start: number;
  end: number;
};

export class StartEndSelector extends React.Component<StartEndSelectorProps, State> {

  state: State = {
    start: 0,
    end: 10,
  };

  constructor(props: StartEndSelectorProps) {
    super(props);
    const {initStart, initEnd} = this.props;

    this.handleStartChange = this.handleStartChange.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.state.start = initStart;
    this.state.end = initEnd;
  }

  getValidationState() {
    const {start, end} = this.state;

    if (start < end) return 'success';
    else if (start === end) return 'warning';
    else if (start > end) return 'error';
    return null;
  }

  handleStartChange(e: any) {
    this.setState({start: e.target.value});
  }

  handleEndChange(e: any) {
    this.setState({end: e.target.value});
  }

  render() {
    const {className, style, title, onSubmit} = this.props;
    const {start, end} = this.state;
    const componentClass = classNames(className, 'start-end-selector');

    return (<Panel className={componentClass} style={style}>
        <Panel.Heading>
          <Panel.Title componentClass='h3'>{title}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <form>
            <FormGroup controlId='formStartEnd' validationState={this.getValidationState()}>
              <ControlLabel>Start</ControlLabel>
              <FormControl type='number' value={start} placeholder='Enter start' onChange={this.handleStartChange}/>

              <ControlLabel>End</ControlLabel>
              <FormControl type='number' value={end} placeholder='Enter end' onChange={this.handleEndChange}/>

              <FormControl.Feedback/>
              <HelpBlock>Invalid values do not prevent submission to allow for testing error conditions.</HelpBlock>
            </FormGroup>
          </form>
        </Panel.Body>
        <Panel.Footer>
          <Button onClick={() => onSubmit(start, end)} bsStyle='primary'>Submit</Button>
        </Panel.Footer>
      </Panel>
    );
  }

}
