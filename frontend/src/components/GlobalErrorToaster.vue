<template>
    <div v-if="globalErrorsCount > 0" class="global-error">
        <div class="card text-white bg-danger">
            <div class="card-body">

                <h5 class="card-title">
                    <button type="button" class="close" aria-label="Close" v-on:click="dismissGlobalAlert">
                        <span aria-hidden="true">⨯</span>
                    </button>
                    Global Alert
                    <span v-show="globalErrorsCount > 1">(1 of {{globalErrorsCount}})</span>
                </h5>

                <div class="card-text">
                    {{$store.state.errors[0]}}
                </div>

            </div>
            <button @click="dismissGlobalAlert">Dismiss</button>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';

    @Component
    export default class GlobalErrorToaster extends Vue {

        get globalErrorsCount(): boolean {
            return this.$store.state.errors.length;
        }

        private dismissGlobalAlert() {
            this.$store.dispatch('dismissGlobalAlert');
        }
    }
</script>
