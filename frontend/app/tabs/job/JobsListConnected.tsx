import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {selectJobStatesWidgetArray, WidgetList} from '../widgetlist';

const mapStateToProps = (state: IRootStateRecord) => ({
  widgets: selectJobStatesWidgetArray(state),
});

export const JobsListConnected = connect(mapStateToProps)(WidgetList);
