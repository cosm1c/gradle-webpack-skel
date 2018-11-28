<template>
    <div class="jobs-view">

        <div class="navroot">
            <nav class="jobs-nav">
                <div class="navbarcollapse">
                    <ul class="navbarnav">
                        <li class="navitem">
                            <button @click="runDemoJob"
                                    class="btn btn-outline-primary">Run demo job
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>

        <ul class="jobs-list">
            <li class="jobs-list-item"
                v-for="(jobInfo, jobId) in jobs"
                :key="jobId">
                <Job :jobInfo="jobInfo"/>
            </li>
        </ul>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import Job from '../views/Job.vue';
    import {vueMerge} from '@/exchange/vueMerge';
    import {globalAlert} from '@/main';

    @Component({
        components: {
            Job,
        },
    })
    export default class JobsList extends Vue {

        private static readonly JOBS = 'jobs';
        private static readonly creatJobPrefix =
            process.env.NODE_ENV !== 'production' ?
                'http://localhost:8080/job?description=Example job with random length&total=' :
                '/job?description=Example job with random length&total=';

        public data() {
            return {
                jobs: {},
            };
        }

        public runDemoJob() {
            fetch(JobsList.creatJobPrefix + Math.round(Math.random() * 997), {method: 'POST'})
                .catch(globalAlert);
        }

        public mounted() {
            Vue.nextTick(this.subscribeStream);
        }

        private subscribeStream() {
            this.$exchange.subscribeMergedStream(
                'jobs',
                {
                    next: (json) => {
                        // console.log('JobsList.next', json);
                        vueMerge(json, this.$data[JobsList.JOBS]);
                    },
                    error: (err) => {
                        // console.error('JobsList.error', err);
                        this.subscribeStream();
                    },
                    complete: () => {
                        // console.log('JobsList.complete');
                        this.subscribeStream();
                    },
                }
                // TODO: handle reconnect
            );
        }
    }
</script>

<style scoped lang="less">
    .jobs-list {
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        margin-top: 0;
    }
</style>
