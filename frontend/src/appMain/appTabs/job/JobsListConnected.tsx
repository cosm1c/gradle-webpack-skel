import {createSelector, OutputSelector} from 'reselect';
import {connect} from 'react-redux';
import {AppRootState} from '../../../reduxStore/store';
import {Widget, WidgetList} from '../widgetlist/WidgetList';
import {jobStateToWidget} from './JobView';
import {default as jobs, JobState} from './Jobs';

const selectJobStatesWidgetArray: OutputSelector<AppRootState, Widget[], (res1: JobState[]) => Widget[]> =
  createSelector(
    jobs.outputSelector,
    (jobsStateArray) => jobsStateArray.map(jobStateToWidget));

const mapStateToProps =
  (state: AppRootState) => ({
    widgets: selectJobStatesWidgetArray(state),
  });

export const JobsListConnected = connect(mapStateToProps)(WidgetList);
