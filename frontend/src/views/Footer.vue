<template>
    <GlobalErrorToaster/>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import GlobalErrorToaster from '../components/GlobalErrorToaster.vue';

    @Component({
        components: {
            GlobalErrorToaster,
        },
    })
    export default class Footer extends Vue {
    }
</script>
