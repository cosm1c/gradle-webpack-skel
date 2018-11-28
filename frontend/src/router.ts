import Vue from 'vue';
import Router from 'vue-router';
import JobList from '@/components/JobsList.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'jobs',
      component: JobList,
    },
    {
      path: '/charts',
      name: 'charts',
      component: () => import(/* webpackChunkName: "chartsList" */ './components/ChartsList.vue'),
    },
  ],
});
