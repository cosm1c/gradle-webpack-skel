import {connect} from 'react-redux';
import {IRootStateRecord} from '../store';
import {JobInfoList, selectJobs} from './';

const mapStateToProps = (state: IRootStateRecord) => ({
  jobs: selectJobs(state),
});

export const JobInfoListConnected = connect(mapStateToProps)(JobInfoList);
