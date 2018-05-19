import * as classNames from 'classnames';
import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  FormFeedback,
  FormGroup,
  FormText,
  Input,
  Label
} from 'reactstrap';

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

    if (start < end) return true;
    else if (start === end) return true; // warning
    else if (start > end) return false;
    return undefined;
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

    return (<Card className={componentClass} style={style}>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <form>
            <FormGroup>
              <Label>Start</Label>
              <Input type='number' value={start} placeholder='Enter start' valid={this.getValidationState()}
                     onChange={this.handleStartChange}/>

              <Label>End</Label>
              <Input type='number' value={end} placeholder='Enter end' valid={this.getValidationState()}
                     onChange={this.handleEndChange}/>

              <FormFeedback/>
              <FormText>Invalid values do not prevent submission to allow for testing error conditions.</FormText>
            </FormGroup>
          </form>
        </CardBody>
        <CardFooter>
          <Button onClick={() => onSubmit(start, end)} color='primary'>Submit</Button>
        </CardFooter>
      </Card>
    );
  }

}
