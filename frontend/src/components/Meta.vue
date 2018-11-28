<template>
    <div class="connection-status">
        <span class="badge" :class="classObject">{{name}} {{isConnected ? '✓' : '✗'}}
        <span class="badge"
              v-for="(value, key) in metaData"
              :key="key"
              :class="classObjectFor(key, value)">{{key}}: {{value}}</span></span>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {vueMerge} from '@/exchange/vueMerge';


    @Component
    export default class Meta extends Vue {

        private static readonly METADATA_NAME: string = 'metaData';

        @Prop() public name!: string;

        get isConnected() {
            return this.$store.state.exchange[this.name].isConnected;
        }

        get classObject() {
            return {
                'badge-success': this.isConnected,
                'badge-danger': !this.isConnected,
            };
        }

        public classObjectFor(key: string, value: string) {
            if (!this.isConnected) {
                return 'badge-secondary';
            }

            switch (key) {
                case 'isHealthy':
                    return value ? 'badge-success' : 'badge-danger';

                default:
                    return 'badge-info';
            }
        }

        public data() {
            return {
                metaData: {},
            };
        }

        public mounted() {
            this.subscribeStream();
        }

        private subscribeStream() {
            const self = this;
            this.$exchange.subscribeStream(
                'meta',
                {
                    next: (json) => {
                        // console.debug(this.name, 'next', json);
                        vueMerge(json, self.$data.metaData);
                    },
                    error: (err) => {
                        // console.error(this.name, 'error', err);
                        this.subscribeStream();
                    },
                    complete: () => {
                        // console.log(this.name, 'complete');
                        this.subscribeStream();
                    },
                },
                () => {
                    this.$set(this, Meta.METADATA_NAME, {});
                },
                this.name
            );
        }
    }
</script>
