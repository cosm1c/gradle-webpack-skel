<template>
    <div class="charts-view">
        <div class="navroot">
            <nav class="jobs-nav">
                <div class="navbarcollapse">
                    <ul class="navbarnav">
                        <li class="navitem">
                            <button @click="addChart"
                                    class="btn btn-outline-primary">Add Chart
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>

        <ul class="charts-list">
            <li class="charts-list-item"
                v-for="(id, index) in charts"
                :key="id">
                <ChartCard v-on:close-chart="closeChart(index)"/>
            </li>
        </ul>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import ChartCard from '@/components/ChartCard.vue';

    @Component({
        components: {
            ChartCard,
        },
    })
    export default class ChartsList extends Vue {

        private static readonly CHARTS: string = 'charts';

        public data() {
            return {
                charts: [],
            };
        }

        public addChart() {
            this.$data[ChartsList.CHARTS].push(Date.now());
        }

        public closeChart(index: number) {
            this.$delete(this.$data[ChartsList.CHARTS], index);
        }
    }
</script>

<style scoped lang="less">
    .charts-list {
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        margin-top: 0;
    }
</style>
