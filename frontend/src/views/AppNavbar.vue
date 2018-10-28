<template>
    <nav class="navroot">

        <a class="navbrand"><img src="../assets/logo.png" width="30" height="30" class="navbrandimg">gradle-webpack-skel</a>

        <button type="button" class="navbartoggler" @click="toggle()">
            <span class="navbartogglericon"></span>
        </button>

        <div class="navbarcollapse" v-show="active">
            <ul class="navbarnav">
                <div class="navitem"
                     v-for="route in $router.options.routes"
                     :key="route.path">
                    <router-link class="navlink"
                                 :to="route.path">
                        {{route.name}}
                    </router-link>
                </div>
            </ul>

            <ul class="navbarnav">
                <slot></slot>
            </ul>
        </div>
    </nav>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';

    @Component
    export default class AppNavbar extends Vue {

        private active: boolean = true;

        public toggle(): void {
            this.active = !this.active;
        }
    }
</script>

<style lang="less">

    .navbar-light .navbar-nav .active {
        color: rgba(0, 0, 0, .9);
    }

    .navroot {
        margin: 0;
        background-color: #f8f9fa !important;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        position: relative;
        padding: .5rem 1rem;
    }

    .navbrand {
        display: inline-block;
        padding-top: .3125rem;
        padding-bottom: .3125rem;
        margin-right: 1rem;
        font-size: 1.25rem;
        line-height: inherit;
        white-space: nowrap;
    }

    .navbrandimg {
        display: inline-block !important;
        vertical-align: top !important;
        border-style: none;
    }

    .navlink {
        display: block;
        padding: .5rem 1rem;
    }

    .navbartoggler {
        cursor: pointer;
        color: rgba(0, 0, 0, .5);
        padding: .25rem .75rem;
        font-size: 1.25rem;
        line-height: 1;
        background-color: transparent;
        border: 1px solid transparent;
        border-color: rgba(0, 0, 0, .1);
        border-radius: .25rem;
    }

    .navbartogglericon {
        background-image: url("data:image/svg+xml;charset=utf8,<svg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'><path stroke='rgba(0, 0, 0, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/></svg>");
        display: inline-block;
        width: 1.5rem;
        height: 1.5rem;
        vertical-align: middle;
        content: "";
        background-attachment: scroll;
        background-clip: border-box;
        background-size: 100% 100%;
    }

    .navbarcollapse {
        flex-basis: 100%;
        flex-grow: 1;
        align-items: center;
    }

    .navbarnav {
        &:not(:first-child) {
            margin-left: auto !important;
        }

        display: flex;
        flex-direction: column;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        margin-top: 0;
    }

    .navlink {
        display: block;
        padding: .5rem 1rem;
    }

    @media (min-width: 768px) {
        .navroot {
            flex-flow: row nowrap;
            justify-content: flex-start;
        }

        .navbartoggler {
            display: none;
        }

        .navbarcollapse {
            display: flex !important;
            flex-basis: auto;
        }

        .navbarnav {
            flex-direction: row;
        }
    }
</style>
