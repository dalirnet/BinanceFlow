<template>
    <div class="analytics">
        <div class="row at-row">
            <div class="col-24">
                <at-card :no-hover="true">
                    <h4 slot="title">
                        <span>Book order</span>
                        <at-tag :color="loading ? 'info' : connected ? 'success' : 'error'" @click.native="toggle">{{
                            loading ? 'loading' : connected ? 'Connect' : 'Disconect'
                        }}</at-tag>
                    </h4>
                    <div slot="extra">
                        <at-button
                            :icon="connected ? 'icon-wifi' : 'icon-wifi-off'"
                            :class="loading ? 'info-color' : connected ? 'success-color' : 'error-color'"
                            size="smaller"
                            :disabled="loading"
                            @click.native="toggle"
                        ></at-button>
                    </div>
                    <div class="watch-header"></div>
                    <div class="watch-box">
                        <div v-for="type in ['sell', 'buy']" :key="type" :class="type + '-box'">
                            <div v-for="({ price = 0, value = 0 }, key) in book[type]" :key="key" :class="type">
                                <span class="price" v-html="betterNumber(price)"></span>
                                <span class="len" v-html="betterNumber(value)"></span>
                                <span class="value" :style="{ width: stepLineValue(value) }"></span>
                            </div>
                        </div>
                        <div class="current">
                            <span class="content">
                                <strong :class="currentStatus" v-html="betterNumber(book.current)"></strong>
                                <small v-html="betterNumber(step.mid)"></small>
                            </span>
                        </div>
                    </div>
                    <div class="watch-footer">
                        <span v-for="type in ['sell', 'buy']" :key="type" :class="['item', type]">
                            <span class="sq"></span>
                            <span>{{ type.charAt(0).toUpperCase() + type.slice(1) }}</span>
                            <small class="space"></small>
                            <small class="sum" v-html="betterNumber(sumValue[type])"></small>
                        </span>
                    </div>
                </at-card>
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    data() {
        return {
            ws: null,
            loading: false,
            connected: false,
            step: {},
            book: {
                current: 0,
                sell: {},
                buy: {}
            }
        }
    },
    computed: {
        sumValue() {
            return {
                sell: _.floor(_.sum(_.map(this.book.sell, item => _.get(item, 'value', 0))), 6),
                buy: _.floor(_.sum(_.map(this.book.buy, item => _.get(item, 'value', 0))), 6)
            }
        },
        baseSymbol() {
            return this.$store.state.pair.base
        },
        quoteSymbol() {
            return this.$store.state.pair.quote
        },
        currentStatus() {
            return this.connected ? (this.sumValue.buy >= this.sumValue.sell ? 'success-color' : 'error-color') : null
        }
    },
    watch: {
        $route() {
            this.$store.commit('baseSymbol', this.$route.params.base)
            this.$store.commit('quoteSymbol', this.$route.params.quote)
            this.reOpenSocket()
        }
    },
    mounted() {
        this.$store.commit('baseSymbol', this.$route.params.base)
        this.$store.commit('quoteSymbol', this.$route.params.quote)
        this.reset()
        this.toggle()
    },
    methods: {
        reset() {
            this.step = {
                max: 0,
                up6: 0,
                up5: 0,
                up4: 0,
                up3: 0,
                up2: 0,
                up1: 0,
                up0: 0,
                mid: 0,
                down0: 0,
                down1: 0,
                down2: 0,
                down3: 0,
                down4: 0,
                down5: 0,
                down6: 0,
                min: 0
            }
            this.book.current = 0
            this.book.sell = {
                max: {},
                up6: {},
                up5: {},
                up4: {},
                up3: {},
                up2: {},
                up1: {}
            }
            this.book.buy = {
                down1: {},
                down2: {},
                down3: {},
                down4: {},
                down5: {},
                down6: {},
                min: {}
            }
        },
        toggle() {
            if (!this.loading) {
                if (this.connected) {
                    this.closeSocket()
                } else {
                    this.openSocket()
                }
            }
            this.loading = true
        },
        betterNumber(input) {
            let [intValue = '0', floatValue = '00'] = _.split(input, '.')
            return `<strong>${_.replace(intValue, /\B(?=(\d{3})+(?!\d))/g, ',')}</strong><small>.${_.padEnd(
                floatValue,
                6,
                '0'
            )}</small>`
        },
        stepLineValue(value) {
            return `${(value * 60) / (this.sumValue.sell + this.sumValue.buy)}%`
        },
        reOpenSocket() {
            this.closeSocket()
            this.openSocket()
        },
        openSocket() {
            this.ws = new WebSocket(
                `wss://stream.binance.com:9443/stream?streams=${_.toLower(
                    [this.baseSymbol, this.quoteSymbol].join('')
                )}@depth`
            )
            this.ws.addEventListener('open', () => {
                this.loading = false
                this.connected = true
                this.reset()
            })
            this.ws.addEventListener('message', ({ data }) => {
                this.calc(JSON.parse(data))
            })
            this.ws.addEventListener('error', e => {
                this.ws.close()
                console.log(e)
            })
            this.ws.addEventListener('close', () => {
                this.loading = false
                this.connected = false
            })
        },
        calc({ data: { a: sell, b: buy } }) {
            this.book.current = _.floor((_.toNumber(_.get(sell, '0.0', 0)) + _.toNumber(_.get(buy, '0.0', 0))) / 2, 6)
            if (this.step.mid === 0) {
                // first calc
                let unit = this.book.current * 0.1
                _.forEach([0.002, 0.005, 0.01, 0.03, 0.04, 0.05, 0.07], (value, key) => {
                    this.step[`up${key}`] = _.floor(this.book.current + this.book.current * value, 6)
                    this.step[`down${key}`] = _.floor(this.book.current - this.book.current * value, 6)
                })
                this.step.max = _.floor(this.book.current + unit, 6)
                this.step.mid = _.floor(this.book.current, 6)
                this.step.min = _.floor(this.book.current - unit, 6)
            }
            _.forEach({ sell, buy }, (list, key) => {
                _.forEach(list, ([price, value]) => {
                    price = _.floor(_.toNumber(price), 6)
                    value = _.floor(_.toNumber(value), 6)
                    if (value > 0) {
                        if (key == 'sell') {
                            if (price > this.step.up6) {
                                this.book.sell.max = { price, value }
                            } else if (price > this.step.up5) {
                                this.book.sell.up6 = { price, value }
                            } else if (price > this.step.up4) {
                                this.book.sell.up5 = { price, value }
                            } else if (price > this.step.up3) {
                                this.book.sell.up4 = { price, value }
                            } else if (price > this.step.up2) {
                                this.book.sell.up3 = { price, value }
                            } else if (price > this.step.up1) {
                                this.book.sell.up2 = { price, value }
                            } else if (price > this.step.up0) {
                                this.book.sell.up1 = { price, value }
                            }
                        } else {
                            if (price < this.step.down6) {
                                this.book.buy.min = { price, value }
                            } else if (price < this.step.down5) {
                                this.book.buy.down6 = { price, value }
                            } else if (price < this.step.down4) {
                                this.book.buy.down5 = { price, value }
                            } else if (price < this.step.down3) {
                                this.book.buy.down4 = { price, value }
                            } else if (price < this.step.down2) {
                                this.book.buy.down3 = { price, value }
                            } else if (price < this.step.down1) {
                                this.book.buy.down2 = { price, value }
                            } else if (price < this.step.down0) {
                                this.book.buy.down1 = { price, value }
                            }
                        }
                    }
                })
            })
        },
        closeSocket() {
            if (this.ws) {
                this.ws.close()
            }
        }
    },
    beforeDestroy() {
        this.closeSocket()
    }
}
</script>

<style lang="scss">
.analytics {
    .at-card__body {
        padding: 8px 24px;
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

        .sell-box,
        .buy-box {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-direction: column;
            flex: 1;
        }

        .sell-box {
            justify-content: flex-end;
            flex-direction: column-reverse;
        }

        .sell,
        .buy {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            height: 36px;
            margin: 2px 0;
            padding: 0 8px;
            box-sizing: border-box;

            .price,
            .len {
                background: #efefef;
                border: 1px solid #e2e2e2;
                text-align: center;
                padding: 0 6px;
                font-size: 11px;
                z-index: 1;
            }

            .price {
                opacity: 0.8;
            }

            .value {
                position: relative;
                width: 0%;
                height: 5px;
                transition: width 100ms linear 100ms;
                opacity: 0.9;
            }
        }

        .sell {
            flex-direction: row-reverse;

            .price {
                border-radius: 0 4px 4px 0;
                border-left: none;
            }

            .len {
                border-radius: 4px 0 0 4px;
                color: #ff4949;
            }
            .value {
                border-radius: 4px 0 0 4px;
                background: #ff4949;
            }
        }

        .buy {
            .price {
                border-radius: 4px 0 0 4px;
                border-right: none;
            }
            .len {
                border-radius: 0 4px 4px 0;
                color: #13ce66;
            }
            .value {
                border-radius: 0 4px 4px 0;
                background: #13ce66;
            }
        }

        .current {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            width: 90px;
            height: 90px;
            left: 50%;
            top: 50%;
            margin-top: -45px;
            margin-left: -45px;

            .content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #efefef;
                border: 1px solid #e2e2e2;
                padding: 0 8px;
                border-radius: 4px;
                z-index: 1;

                small {
                    opacity: 0.6;
                }
            }
        }
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

        .item {
            .sq {
                position: relative;
                display: flex;
                width: 10px;
                height: 10px;
                margin: 0 8px;
                border-radius: 4px;
            }

            .space {
                margin: 0 4px;
            }

            .small {
                font-size: 10px;
            }

            &.sell {
                flex-direction: row-reverse;

                .sq {
                    background: #ff4949;
                }
                .sum {
                    color: #ff4949;
                }
            }

            &.buy {
                .sq {
                    background: #13ce66;
                }
                .sum {
                    color: #13ce66;
                }
            }
        }
    }
}
</style>
