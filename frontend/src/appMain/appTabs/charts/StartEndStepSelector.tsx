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

export interface StartEndStepSelectorProps {
  title: string;
  initStart: number;
  initEnd: number;
  onSubmit: (start: number, end: number, step: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface State {
  start: number;
  end: number;
  step: number;
}

export class StartEndStepSelector extends React.Component<StartEndStepSelectorProps, State> {

  public state: State = {
    start: 0,
    end: 32,
    step: 0.25,
  };

  constructor(props: StartEndStepSelectorProps) {
    super(props);
    const {initStart, initEnd} = this.props;

    this.handleStartChange = this.handleStartChange.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.state.start = initStart;
    this.state.end = initEnd;
  }

  public getValidationState() {
    const {start, end, step} = this.state;

    if (start < end && step > 0) {
      return true;
    } else if (start === end) {
      return true;
    } else if (start > end || step <= 0) {
      return false;
    }
    return undefined;
  }

  public handleStartChange(e: any) {
    this.setState({start: e.target.value});
  }

  public handleEndChange(e: any) {
    this.setState({end: e.target.value});
  }

  public render() {
    const {className, style, title} = this.props;
    const {start, end, step} = this.state;
    const componentClass = classNames(className, 'start-end-selector');

    return (
      <Card className={componentClass} style={style}>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <form>
            <FormGroup>
              <Label>Start</Label>
              <Input
                type='number'
                value={start}
                placeholder='Enter start'
                valid={this.getValidationState()}
                onChange={this.handleStartChange}
              />

              <Label>End</Label>
              <Input
                type='number'
                value={end}
                placeholder='Enter end'
                valid={this.getValidationState()}
                onChange={this.handleEndChange}
              />

              <Label>Step</Label>
              <Input
                type='number'
                value={step}
                placeholder='Enter step'
                valid={this.getValidationState()}
                onChange={this.handleEndChange}
              />

              <FormFeedback/>
              <FormText>Invalid values do not prevent submission to allow for testing error conditions.</FormText>
            </FormGroup>
          </form>
        </CardBody>
        <CardFooter>
          <Button onClick={this.submitForm} color='primary'>Submit</Button>
        </CardFooter>
      </Card>
    );
  }

  private submitForm = () => {
    const {onSubmit} = this.props;
    const {start, end, step} = this.state;

    onSubmit(Number(start), Number(end), Number(step));
  };
}
