<template>
    <div id="app">
        <div class="container container-fluid">
            <at-menu mode="horizontal" :active-name="$route.name">
                <at-menu-item name="config">
                    <router-link :to="{ name: 'config' }">
                        <i class="icon icon-settings"></i>
                        <span>Config</span>
                    </router-link>
                </at-menu-item>
                <at-submenu>
                    <template slot="title">
                        <i class="icon icon-sliders"></i>
                        <span>Process</span>
                    </template>
                    <at-menu-item
                        name="lastTrade"
                        @click.native="
                            $router
                                .push({
                                    name: 'lastTrade',
                                    params: {
                                        base: $store.state.pair.base.toLowerCase(),
                                        quote: $store.state.pair.quote.toLowerCase()
                                    }
                                })
                                .catch(() => {})
                        "
                    >
                        <i class="icon icon-bar-chart-2"></i>
                        <span>Last trade</span>
                    </at-menu-item>
                    <at-menu-item
                        name="lastOrder"
                        @click.native="
                            $router
                                .push({
                                    name: 'lastOrder',
                                    params: {
                                        base: $store.state.pair.base.toLowerCase(),
                                        quote: $store.state.pair.quote.toLowerCase()
                                    }
                                })
                                .catch(() => {})
                        "
                    >
                        <i class="icon icon-activity"></i>
                        <span>Last order</span>
                    </at-menu-item>
                    <at-menu-item
                        name="myJob"
                        @click.native="
                            $router
                                .push({
                                    name: 'myJob',
                                    params: {
                                        base: $store.state.pair.base.toLowerCase(),
                                        quote: $store.state.pair.quote.toLowerCase()
                                    }
                                })
                                .catch(() => {})
                        "
                    >
                        <i class="icon icon-target"></i>
                        <span>My job</span>
                    </at-menu-item>
                </at-submenu>
                <at-menu-item style="float: right;pointer-events: none;">
                    <small>
                        <span>{{ $store.state.pair.base }}</span>
                        <i class="icon icon-activity primary-color" style="margin: 0 2px;font-size: 10px;"></i>
                        <span>{{ $store.state.pair.quote }}</span>
                    </small>
                </at-menu-item>
            </at-menu>
        </div>
        <div class="main container container-fluid">
            <router-view />
        </div>
    </div>
</template>

<style lang="scss">
@import url('assets/css/at.css');
@font-face {
    font-family: 'BinancePlex';
    font-display: swap;
    src: url('assets/fonts/BinancePlex-Light.woff2') format('woff2');
    font-weight: 200;
}
@font-face {
    font-family: 'BinancePlex';
    font-display: swap;
    src: url('assets/fonts/BinancePlex-Light.woff2') format('woff2');
    font-weight: 300;
}
@font-face {
    font-family: 'BinancePlex';
    font-display: swap;
    src: url('assets/fonts/BinancePlex-Regular.woff2') format('woff2');
    font-weight: 400;
}
@font-face {
    font-family: 'BinancePlex';
    font-display: swap;
    src: url('assets/fonts/BinancePlex-Medium.woff2') format('woff2');
    font-weight: 500;
}
@font-face {
    font-family: 'BinancePlex';
    font-display: swap;
    src: url('assets/fonts/BinancePlex-SemiBold.woff2') format('woff2');
    font-weight: 600;
}
@font-face {
    font-family: 'BinancePlex';
    font-display: swap;
    src: url('assets/fonts/BinancePlex-SemiBold.woff2') format('woff2');
    font-weight: 700;
}
@font-face {
    font-family: 'BinancePlex';
    font-display: swap;
    src: url('assets/fonts/BinancePlex-SemiBold.woff2') format('woff2');
    font-weight: 800;
}
body {
    font-family: BinancePlex, Arial, PingFangSC-Regular, 'Microsoft YaHei', sans-serif !important;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-y: scroll;
    color: #0b0e11;

    #app {
        padding-top: 24px;
    }

    .main {
        padding: 24px;
    }

    .space {
        margin: 0 4px;
    }

    .at-row {
        margin-bottom: 12px;
    }

    .normal-color,
    .primary-color {
        color: #f0b90b;
    }

    .success-color {
        color: #13ce66;
    }

    .error-color {
        color: #ff4949;
    }

    .warning-color {
        color: #ffc82c;
    }

    .info-color {
        color: #78a4fa;
    }

    .at-select {
        .at-select__input {
            margin: 0;
            padding: 0 24px 0 12px;
            box-sizing: border-box;
        }
        .at-select__selection {
            min-height: 32px;
            line-height: 30px;
            padding: 0 24px 0 12px;
        }
    }

    .at-tag {
        padding: 1px 4px;
        line-height: normal;
        margin: 0 2px;
        cursor: pointer;

        .at-tag__text {
            font-size: 9px;
            font-weight: 400;
        }
    }

    .at-menu__item--disabled {
        cursor: default;
    }

    .at-btn__loading {
        display: flex;
        width: 15px;
        height: 15px;
        align-items: center;
        justify-content: center;
    }

    .watch-box {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row-reverse;
        background: linear-gradient(
            90deg,
            rgba(255, 200, 44, 0.06),
            rgba(255, 255, 255, 1) 20%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 1) 80%,
            rgba(255, 200, 44, 0.06)
        );
        border-radius: 4px;
        border: 1px solid #ececec;
        font-size: 12px;
    }

    .watch-header,
    .watch-footer {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        margin: 8px 0;

        .item {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
        }
    }

    .watch-footer {
        flex-direction: row-reverse;
    }
}
</style>
