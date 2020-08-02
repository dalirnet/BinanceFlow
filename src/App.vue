<template>
    <div id="app">
        <div class="container-fluid">
            <at-menu mode="horizontal" active-name="1">
                <at-menu-item name="1"
                    ><i class="icon icon-home"></i>Navigation One</at-menu-item
                >
                <at-menu-item name="2" disabled
                    ><i class="icon icon-layers"></i>Navigation
                    Two</at-menu-item
                >
                <at-submenu>
                    <template slot="title"
                        ><i class="icon icon-life-buoy"></i>Navigation Three -
                        Submenu</template
                    >
                    <at-menu-item-group title="Group One">
                        <at-menu-item name="3-1">Submenu One</at-menu-item>
                        <at-menu-item name="3-2" disabled
                            >Submenu Two</at-menu-item
                        >
                    </at-menu-item-group>
                    <at-menu-item-group title="Group Two">
                        <at-menu-item name="3-3">Submenu Three</at-menu-item>
                        <at-menu-item name="3-4">Submenu Four</at-menu-item>
                    </at-menu-item-group>
                </at-submenu>
                <at-menu-item name="4"
                    ><i class="icon icon-settings"></i>Navigation
                    Four</at-menu-item
                >
            </at-menu>
        </div>
        <div class="main container-fluid">
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
    font-family: BinancePlex, Arial, PingFangSC-Regular, 'Microsoft YaHei',
        sans-serif !important;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #0b0e11;

    .main {
        padding: 24px;
    }
}
</style>
