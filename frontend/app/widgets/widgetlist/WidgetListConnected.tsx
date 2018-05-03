import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {selectWidgetArray, WidgetList} from './index';

const mapStateToProps = (state: IRootStateRecord) => ({
  widgets: selectWidgetArray(state),
});

const WidgetListConnected = connect(mapStateToProps)(WidgetList);

export default WidgetListConnected;
