<template>
    <div class="card">
        <div class="card-body">

            <h5 class="card-title">
                <button type="button" class="close" aria-label="Close" v-on:click="closeChart">
                    <span aria-hidden="true">⨯</span>
                </button>
                <button
                    :disabled="!hasSubscription"
                    class="btn btn-sm float-right clearfix badge"
                    :class="streamButtonColor"
                    @click="cancelStream">
                    {{streamButtonText}}
                </button>
                {{title}}
                <span v-if="ended" class="badge badge-dark">{{ (ended - started).toFixed(2) }}ms</span>
            </h5>

            <span class="badge badge-info"
                  v-show="started">streamUri: {{streamUri}}</span>

            <span class="badge badge-danger"
                  v-show="error">Error: {{error}}</span>

            <div v-if="!started" class="card-text">
                <p>
                    <select v-model="selectedChart"
                            @change="setDefaultStreamUri">
                        <option value="solar">Solar</option>
                        <option value="solarSlow">Solar Slow</option>
                        <option disabled>──────────</option>
                        <option value="count">Count</option>
                        <option value="countSlow">Count Slow</option>
                        <option disabled>──────────</option>
                        <option value="sine">Sine</option>
                        <option value="sineSlow">Sine Slow</option>
                        <option disabled>──────────</option>
                        <option value="error">Error</option>
                    </select>
                </p>
                <p>
                    <input class="streamUri" v-model="streamUri"/>
                </p>
                <p>
                    <button class="btn" @click="runChart">Run</button>
                </p>
            </div>

            <div v-show="started" class="chartjs-container">
                <canvas ref="chartEl"></canvas>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import {Subject, Subscription} from 'rxjs';
    import Chart, {ChartDataSets, ChartPoint, ChartScales} from 'chart.js';
    import {throttleTime} from 'rxjs/operators';

    Chart.defaults.global.animation = Chart.defaults.global.animation || {};
    Chart.defaults.global.animation.duration = 41;

    interface QueryParamMap {
        [name: string]: string;
    }

    @Component
    export default class ChartCard extends Vue {

        private chartUpdate$?: Subject<any> = undefined;
        private chart?: Chart = undefined;
        private subscription?: Subscription = undefined;
        private buffer: ChartPoint[][] = [];

        constructor() {
            super();

            Vue.nextTick(this.setDefaultStreamUri);
        }

        public data() {
            return {
                selectedChart: 'solar',
                streamUri: '',
                hasSubscription: false,
                title: null,
                started: 0,
                ended: 0,
                error: null,
            };
        }

        public destroyed() {
            this.cancelStream();

            if (this.chart) {
                this.chart.destroy();
                this.chart = undefined;
            }
        }

        private setDefaultStreamUri() {
            switch (this.$data.selectedChart) {
                case 'solar':
                    const solarStartDate = new Date();
                    solarStartDate.setHours(-48, 0, 0, 0);
                    const solarEndDate = new Date();
                    solarEndDate.setHours(0, 0, 0, 0);
                    this.$data.streamUri = `solar?startDate=${solarStartDate.toISOString()}&endDate=${solarEndDate.toISOString()}&ticks=100`;
                    break;

                case 'solarSlow':
                    const startDate = new Date();
                    startDate.setHours(-48, 0, 0, 0);
                    const endDate = new Date();
                    endDate.setHours(0, 0, 0, 0);
                    this.$data.streamUri = `solarSlow?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&ticks=100`;
                    break;

                case 'count':
                    this.$data.streamUri = 'count?start=1&end=100&step=1';
                    break;

                case 'countSlow':
                    this.$data.streamUri = 'countSlow?start=1&end=10&step=1';
                    break;

                case 'sine':
                    this.$data.streamUri = 'sine?start=0&end=32&step=0.25';
                    break;

                case 'sineSlow':
                    this.$data.streamUri = 'sineSlow?start=0&end=32&step=0.25';
                    break;

                case 'error':
                    this.$data.streamUri = 'error';
                    break;

                default:
                    console.warn('Unknown chart', this.$data.selectedChart);
            }
        }

        private runChart() {
            this.$data.started = window.performance.now();

            this.chartUpdate$ = new Subject().pipe(
                throttleTime(41) // 41ms ~= 24fps
            ) as Subject<any>;

            this.chartUpdate$.subscribe(this.flushBufferToChart);

            switch (this.$data.selectedChart) {
                case 'solar':
                case 'solarSlow':
                    this.solarDateChart();
                    break;

                case 'count':
                case 'countSlow':
                    this.startEndStepChart('Count');
                    break;

                case 'sine':
                case 'sineSlow':
                    this.startEndStepChart('Sine');
                    break;

                case 'error':
                    this.configChart('Error', {}, []);
                    break;

                default:
                    console.error('Unknown selected chart', this.$data.selectedChart);
            }

            this.subscription = this.$exchange.subscribeStream(
                this.$data.streamUri,
                {
                    next: this.bufferChartPoints,
                    error: this.nextError,
                    complete: this.nextComplete,
                });

            this.$data.hasSubscription = true;
        }

        private cancelStream(): void {
            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = undefined;
                this.$data.hasSubscription = false;
            }
        }

        private nextError(error: any) {
            this.$data.error = `${error}`;
            this.endOfStream();
        }

        private nextComplete() {
            this.endOfStream();
        }

        private endOfStream() {
            this.$data.ended = window.performance.now();

            this.subscription = undefined;
            this.$data.hasSubscription = false;

            this.flushBufferToChart();
        }

        private throttledChartUpdate() {
            if (this.chartUpdate$) {
                this.chartUpdate$!.next(0);
            }
        }

        // TODO: Support receiving array of points per series over WebSocket (server-side conflate up to packetSize)
        private bufferChartPoints(chartPoints: Chart.ChartPoint[]) {
            const length = Math.max(this.buffer.length, chartPoints.length);
            for (let i = 0; i < length; i++) {
                if (chartPoints[i] !== null) {
                    if (!this.buffer[i]) {
                        this.buffer[i] = [];
                    }
                    this.buffer[i].push(chartPoints[i]);
                }
            }

            this.throttledChartUpdate();
        }

        private flushBufferToChart() {
            if (this.chart) {
                const chartDataSets = this.chart.data.datasets!;
                const length = Math.max(this.buffer.length, chartDataSets.length);
                for (let i = 0; i < length; i++) {
                    if (this.buffer[i] !== null) {
                        if (!chartDataSets[i]) {
                            chartDataSets[i] = {data: []};
                        }
                        const data = chartDataSets[i].data as ChartPoint[];
                        data.push.apply(data, this.buffer[i]);
                    }
                }

                this.buffer = [];

                this.chart.update();
            }
        }

        private parseStreamUriParams(): QueryParamMap {
            const a = document.createElement('a');
            a.href = this.$data.streamUri;
            const query = a.search.substring(1);

            const result: QueryParamMap = {};
            query.split('&').forEach((param) => {
                const pair = param.split('=');
                result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            });
            return result;
        }

        private solarDateChart(): void {
            const streamUriParams = this.parseStreamUriParams();

            this.configChart(
                `Solar ${streamUriParams.startDate} to ${streamUriParams.endDate}`,
                {
                    xAxes: [{
                        type: 'time',
                        time: {
                            min: streamUriParams.startDate,
                            max: streamUriParams.endDate,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'DateTime',
                        },
                    }],
                    yAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: 'Degrees',
                            },
                        },
                    ],
                },
                [
                    {
                        label: 'Azimuth',
                        backgroundColor: 'blue',
                        borderColor: 'black',
                        pointRadius: 1.75,
                        fill: false,
                        data: [], // ChartPoint[]
                    },
                    {
                        label: 'ZenithAngle',
                        backgroundColor: 'yellow',
                        borderColor: 'green',
                        pointRadius: 1.75,
                        fill: false,
                        data: [], // ChartPoint[]
                    },
                ]
            );
        }

        private startEndStepChart(dataLabel: string): void {
            const streamUriParams = this.parseStreamUriParams();
            this.configChart(
                `${dataLabel} ${streamUriParams.start} to ${streamUriParams.end} step ${streamUriParams.step}`,
                {
                    xAxes: [{
                        type: 'linear',
                        ticks: {
                            min: parseFloat(streamUriParams.start),
                            max: parseFloat(streamUriParams.end),
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'X',
                        },
                    }],
                    yAxes: [
                        {
                            /*ticks: {
                                min: parseFloat(streamUriParams.start),
                                max: parseFloat(streamUriParams.end),
                            },*/
                            scaleLabel: {
                                display: true,
                                labelString: 'Y',
                            },
                        },
                    ],
                },
                [
                    {
                        label: dataLabel,
                        backgroundColor: 'blue',
                        borderColor: 'black',
                        pointRadius: 1.75,
                        fill: false,
                        data: [], // ChartPoint[]
                    },
                ]
            );
        }

        private configChart(title: string,
                            scales: ChartScales,
                            datasets: ChartDataSets[]) {
            if (!this.$refs.chartEl) {
                throw new Error('chartEl missing');
            }

            this.$data.title = title;

            this.chart = new Chart(
                this.$refs.chartEl as HTMLCanvasElement,
                {
                    type: 'line',
                    options: {
                        scales,
                        animation: {
                            duration: 0, // general animation time
                        },
                        hover: {
                            animationDuration: 0, // duration of animations when hovering an item
                        },
                        responsiveAnimationDuration: 0, // animation duration after a resize
                        elements: {
                            line: {
                                tension: 0, // disables bezier curves
                            },
                        },
                        maintainAspectRatio: false,
                    },
                    data: {
                        datasets,
                    },
                });
        }

        private closeChart(): void {
            this.$emit('close-chart');
        }

        get streamButtonColor() {
            if (this.$data.error) {
                return 'badge-danger';
            }
            if (this.$data.ended) {
                return 'badge-success';
            }
            if (this.$data.hasSubscription) {
                return 'badge-warning';
            }
            return 'badge-warning';
        }

        get streamButtonText() {
            if (this.$data.error) {
                return 'Error';
            }
            if (this.$data.ended) {
                return 'Complete';
            }
            if (this.$data.hasSubscription) {
                return 'Cancel';
            }
            if (!this.$data.started) {
                return 'Idle';
            }
            return 'Cancelled';
        }

    }
</script>

<style lang="less">
    .chartjs-container {
        position: relative;
        height: 20rem;
        width: 100%;
    }

    .streamUri {
        width: 100%;
    }
</style>
