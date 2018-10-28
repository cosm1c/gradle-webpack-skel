<template>
    <div class="card">
        <div class="card-body">

            <h5 class="card-title">
                <button type="button" class="close" aria-label="Close" v-on:click="killJob">
                    <span aria-hidden="true">⨯</span>
                </button>
                {{jobInfo.jobId.toLocaleString()}} - {{jobInfo.description}}
            </h5>

            <h6 class="text-right card-subtitle">{{subTitle}}</h6>

            <p class="card-text">
                <span v-if="jobInfo.agent" class="badge badge-info">Agent: {{jobInfo.agent}}</span>
                <span v-if="jobInfo.startDateTime"
                      class="badge badge-info">Started: {{jobInfo.startDateTime}}</span>
                <span v-if="jobInfo.endDateTime"
                      class="badge badge-info">Completed: {{jobInfo.endDateTime}}</span>
                <span v-if="jobInfo.error" class="badge badge-danger">Error: {{jobInfo.error}}</span>
            </p>

            <div class="progress">

                <div class="progress-bar progress-bar-striped"
                     :class="{ 'progress-bar-animated': !jobInfo.endDateTime }"
                     role="progressbar" :aria-valuenow="calcPercentage" aria-valuemin="0" :aria-valuemax="jobInfo.total"
                     :style="{ width: calcPercentage + '%' }">{{calcPercentage}}%
                </div>

            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {globalAlert} from '@/main';

    export interface JobInfo {
        jobId: number;
        agent?: string;
        curr?: number;
        total?: number;
        startDateTime?: Date;
        endDateTime?: Date;
        error?: string;
        description?: string;
    }

    @Component
    export default class Job extends Vue {

        @Prop() public jobInfo!: JobInfo;

        get subTitle(): string {
            if (this.jobInfo.curr) {
                const curr = (this.jobInfo.curr as number).toLocaleString();

                if (this.jobInfo.total) {
                    const total = (this.jobInfo.total as number).toLocaleString();

                    if (this.jobInfo.endDateTime && curr === total) {
                        return `${total}`;
                    }

                    return `${curr} of ${total}`;
                }
            }
            if (this.jobInfo.total) {
                return `${(this.jobInfo.total as number).toLocaleString()} Expected`;
            }
            return 'Idle';
        }

        get calcPercentage(): number | null {
            if (this.jobInfo.total && this.jobInfo.curr && this.jobInfo.total > 0) {
                return Math.floor(100 * this.jobInfo.curr / this.jobInfo.total);
            }
            return null;
        }

        private killJob() {
            fetch(`/job/${this.jobInfo.jobId}`, {method: 'DELETE'})
                .catch(globalAlert);
        }

    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
    .progress {
        display: flex;
        height: 1rem;
        overflow: hidden;
        font-size: .75rem;
        background-color: #e9ecef;
        border-radius: .25rem;
    }

    .progress-bar-animated {
        animation: progress-bar-stripes 1s linear infinite;
    }

    .progress-bar-striped {
        background-image: linear-gradient(45deg, hsla(0, 0%, 100%, .15) 25%, transparent 0, transparent 50%, hsla(0, 0%, 100%, .15) 0, hsla(0, 0%, 100%, .15) 75%, transparent 0, transparent);
        background-size: 1rem 1rem;
    }

    .progress-bar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        background-color: #007bff;
        transition: width .6s ease;
    }

    @keyframes progress-bar-stripes {
        0% {
            background-position: 1rem 0;
        }
        to {
            background-position: 0 0;
        }
    }
</style>
