<template>
    <div class='app-container'>

        <div class="navbar-container">
            <AppNavbar>
                <li class="navitem"
                    v-for="name in connectionNames"
                    :key="name">
                    <Meta :name="name"/>
                </li>
            </AppNavbar>
        </div>

        <main class="app-main">
            <keep-alive>
                <router-view/>
            </keep-alive>
        </main>

        <div class="footer-container">
            <Footer/>
        </div>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import AppNavbar from '@/views/AppNavbar.vue';
    import Meta from '@/components/Meta.vue';
    import Footer from '@/views/Footer.vue';

    @Component({
        components: {
            Meta,
            AppNavbar,
            Footer,
    },
    })
    export default class App extends Vue {
        get connectionNames() {
            return this.$store.state.exchange.names;
        }
    }
</script>

<style lang="less">
    html,
    body,
    #app,
    .app-container {
        width: 100%;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segui UI Emoji, Segoe UI Symbol, Noto Color Emoji;
    }

    #app {
        margin: 0;
    }

    .app-container {
        display: flex;
        flex-direction: column;
    }

    .app-main {
        flex: 1 1 auto;
        position: relative;
        overflow-y: auto;
        margin-bottom: 0;

        display: flex;
        flex-direction: column;
    }

    .footer-container {
    }

    a {
        color: #007bff;
        text-decoration: none;
        background-color: transparent;
    }

    button.close {
        padding: 0;
        background-color: transparent;
        border: 0;
        -webkit-appearance: none;
    }

    .close {
        float: right;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        opacity: .5;
    }

    .close:not(:disabled):not(.disabled) {
        cursor: pointer;
    }

    .text-right {
        text-align: right !important;
    }

    .badge-success {
        color: #fff;
        background-color: #28a745;
    }

    .badge-info {
        color: #fff;
        background-color: #17a2b8;
    }

    .badge-danger {
        color: #fff;
        background-color: #dc3545;
    }

    .badge-warning {
        color: #212529;
        background-color: #ffc107;
    }

    .badge-secondary {
        color: #fff;
        background-color: #6c757d;
    }

    .badge-dark {
        color: #fff;
        background-color: #343a40;
    }

    .badge {
        display: inline-block;
        padding: .25rem .4rem;
        font-size: 75%;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: .25rem;
    }


    .card {
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: #fff;
        background-clip: border-box;
        border: 1px solid rgba(0, 0, 0, .125);
        border-radius: .25rem;
    }

    .card-body {
        flex: 1 1 auto;
        padding: 1.25rem;
    }

    .card-title {
        margin-bottom: .75rem;
        margin-top: 0;
    }

    .card-subtitle, .card-text:last-child {
        margin-bottom: 0;
    }

    .card-subtitle {
        margin-top: -.375rem;
    }


    .btn:not(:disabled):not(.disabled) {
        cursor: pointer;
    }

    .btn-outline-primary:hover {
        color: #fff;
        background-color: #007bff;
        border-color: #007bff;
    }

    .btn:focus, .btn:hover {
        text-decoration: none;
    }

    .btn-outline-primary {
        color: #007bff;
        background-color: transparent;
        background-image: none;
        border-color: #007bff;
    }

    .btn {
        display: inline-block;
        font-weight: 400;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        border: 1px solid transparent;
        padding: .375rem .75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: .25rem;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    .btn-group-sm > .btn, .btn-sm {
        padding: .25rem .5rem;
        font-size: .875rem;
        line-height: 1.5;
        border-radius: .2rem;
    }

    .clearfix::after {
        display: block;
        clear: both;
        content: "";
    }

    .float-right {
        float: right !important;
    }

    .text-white {
        color: #fff!important;
    }

    .bg-danger {
        background-color: #dc3545!important;
    }
</style>
