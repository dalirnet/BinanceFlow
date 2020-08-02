<template>
    <div class="analytics">
        <div class="row at-row">
            <div class="col-24">
                <at-card :no-hover="true">
                    <h4 slot="title">
                        <span>Booking order</span>
                        <at-tag
                            :color="
                                loading
                                    ? 'info'
                                    : connected
                                    ? 'success'
                                    : 'error'
                            "
                            >{{
                                loading
                                    ? 'loading'
                                    : connected
                                    ? 'Connect'
                                    : 'Disconect'
                            }}</at-tag
                        >
                    </h4>
                    <div slot="extra">
                        <at-button
                            :icon="connected ? 'icon-wifi-off' : 'icon-wifi'"
                            :class="
                                loading
                                    ? 'info-color'
                                    : connected
                                    ? 'error-color'
                                    : 'success-color'
                            "
                            size="smaller"
                            :disabled="loading"
                            @click.native="toggle"
                        ></at-button>
                    </div>
                    <div class="watch-header"></div>
                    <div class="watch-box">
                        <div class="sell-box">
                            <div
                                v-for="(sell, key) in book.sell"
                                :key="key"
                                class="sell"
                            >
                                <span
                                    class="price"
                                    v-html="calcStepPrice(sell, step[key])"
                                ></span>
                                <span
                                    class="len"
                                    v-html="calcStepValue(sell)"
                                ></span>
                                <span
                                    class="value"
                                    :style="{ width: calcStepLineValue(sell) }"
                                ></span>
                            </div>
                        </div>
                        <div class="buy-box">
                            <div
                                v-for="(buy, key) in book.buy"
                                :key="key"
                                class="buy"
                            >
                                <span
                                    class="price"
                                    v-html="calcStepPrice(buy, step[key])"
                                ></span>
                                <span
                                    class="len"
                                    v-html="calcStepValue(buy)"
                                ></span>
                                <span
                                    class="value"
                                    :style="{ width: calcStepLineValue(buy) }"
                                ></span>
                            </div>
                        </div>
                        <div class="current">
                            <span class="content">
                                <strong
                                    :class="
                                        connected
                                            ? sumOfBuyReal > sumOfSellReal
                                                ? 'success-color'
                                                : 'error-color'
                                            : null
                                    "
                                    v-html="toPerfectNumber(book.current)"
                                ></strong>
                                <small
                                    v-html="toPerfectNumber(step.mid)"
                                ></small>
                            </span>
                        </div>
                    </div>
                    <div class="watch-footer">
                        <span class="item buy">
                            <span class="sq"></span>
                            <span>Buy</span>
                            <small class="space"></small>
                            <small
                                class="sum"
                                v-html="toPerfectNumber(sumOfBuy)"
                            ></small>
                        </span>
                        <span class="item sell">
                            <span class="sq"></span>
                            <span>Sell</span>
                            <small class="space"></small>
                            <small
                                class="sum"
                                v-html="toPerfectNumber(sumOfSell)"
                            ></small>
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
            step: {
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
            },
            book: {
                current: 0,
                sell: {
                    max: [],
                    up6: [],
                    up5: [],
                    up4: [],
                    up3: [],
                    up2: [],
                    up1: []
                },
                buy: {
                    down1: [],
                    down2: [],
                    down3: [],
                    down4: [],
                    down5: [],
                    down6: [],
                    min: []
                }
            }
        }
    },
    computed: {
        sumOfSellReal() {
            return _.floor(_.sum(_.map(this.book.sell.up1, 'value')), 6)
        },
        sumOfSell() {
            return _.floor(
                _.sum([
                    ..._.map(this.book.sell.up1, 'value'),
                    ..._.map(this.book.sell.up2, 'value'),
                    ..._.map(this.book.sell.up3, 'value'),
                    ..._.map(this.book.sell.up4, 'value'),
                    ..._.map(this.book.sell.up5, 'value'),
                    ..._.map(this.book.sell.up6, 'value'),
                    ..._.map(this.book.sell.max, 'value')
                ]),
                6
            )
        },
        sumOfBuyReal() {
            return _.floor(_.sum(_.map(this.book.buy.down1, 'value')), 6)
        },
        sumOfBuy() {
            return _.floor(
                _.sum([
                    ..._.map(this.book.buy.down1, 'value'),
                    ..._.map(this.book.buy.down2, 'value'),
                    ..._.map(this.book.buy.down3, 'value'),
                    ..._.map(this.book.buy.down4, 'value'),
                    ..._.map(this.book.buy.down5, 'value'),
                    ..._.map(this.book.buy.down6, 'value'),
                    ..._.map(this.book.buy.min, 'value')
                ]),
                6
            )
        }
    },
    methods: {
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
        toPerfectNumber(input) {
            let [intValue = '0', floatValue = '00'] = _.split(input, '.')
            return `<strong>${_.replace(
                intValue,
                /\B(?=(\d{3})+(?!\d))/g,
                ','
            )}</strong><small>.${_.padEnd(floatValue, 6, '0')}</small>`
        },
        calcStepPrice(input, label) {
            let price = _.map(input, 'price')
            return this.toPerfectNumber(
                price.length ? _.floor(_.sum(price) / price.length, 6) : label
            )
        },
        calcStepValue(input) {
            return this.toPerfectNumber(
                _.floor(_.sum(_.map(input, 'value')), 6)
            )
        },
        calcStepLineValue(input) {
            return `${(Math.floor(_.sum(_.map(input, 'value'))) * 60) /
                (this.sumOfSell + this.sumOfBuy)}%`
        },
        openSocket() {
            this.ws = new WebSocket(
                `wss://stream.binance.com:9443/stream?streams=${_.toLower(
                    [
                        this.$store.state.pair.base,
                        this.$store.state.pair.quote
                    ].join('')
                )}@depth`
            )
            this.ws.addEventListener('open', () => {
                this.loading = false
                this.connected = true
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
            let point = _.floor(
                _.sumBy(
                    [_.get(sell, '0.0', 0), _.get(buy, '0.0', 0)],
                    _.toNumber
                ) / 2,
                6
            )
            // first calc
            if (this.step.mid === 0) {
                this.step.max = _.floor(point + point * 0.1, 6)
                this.step.up6 = _.floor(point + point * 0.07, 6)
                this.step.up5 = _.floor(point + point * 0.05, 6)
                this.step.up4 = _.floor(point + point * 0.04, 6)
                this.step.up3 = _.floor(point + point * 0.03, 6)
                this.step.up2 = _.floor(point + point * 0.01, 6)
                this.step.up1 = _.floor(point + point * 0.005, 6)
                this.step.up0 = _.floor(point + point * 0.002, 6)
                this.step.mid = _.floor(point, 6)
                this.step.down0 = _.floor(point - point * 0.002, 6)
                this.step.down1 = _.floor(point - point * 0.005, 6)
                this.step.down2 = _.floor(point - point * 0.01, 6)
                this.step.down3 = _.floor(point - point * 0.03, 6)
                this.step.down4 = _.floor(point - point * 0.04, 6)
                this.step.down5 = _.floor(point - point * 0.05, 6)
                this.step.down6 = _.floor(point - point * 0.07, 6)
                this.step.min = _.floor(point - point * 0.1, 6)
            }
            _.forEach({ sell, buy }, (list, key) => {
                _.forEach(list, ([price, value]) => {
                    price = _.toNumber(price)
                    value = _.toNumber(value)
                    if (value > 0) {
                        if (key == 'sell') {
                            if (price > this.step.up6) {
                                if (this.book.sell.max.length > 36) {
                                    this.book.sell.max.shift()
                                }
                                this.book.sell.max.push({ price, value })
                            } else if (price > this.step.up5) {
                                if (this.book.sell.up6.length > 36) {
                                    this.book.sell.up6.shift()
                                }
                                this.book.sell.up6.push({ price, value })
                            } else if (price > this.step.up4) {
                                if (this.book.sell.up5.length > 36) {
                                    this.book.sell.up5.shift()
                                }
                                this.book.sell.up5.push({ price, value })
                            } else if (price > this.step.up3) {
                                if (this.book.sell.up4.length > 36) {
                                    this.book.sell.up4.shift()
                                }
                                this.book.sell.up4.push({ price, value })
                            } else if (price > this.step.up2) {
                                if (this.book.sell.up3.length > 36) {
                                    this.book.sell.up3.shift()
                                }
                                this.book.sell.up3.push({ price, value })
                            } else if (price > this.step.up1) {
                                if (this.book.sell.up2.length > 36) {
                                    this.book.sell.up2.shift()
                                }
                                this.book.sell.up2.push({ price, value })
                            } else if (price > this.step.up0) {
                                if (this.book.sell.up1.length > 36) {
                                    this.book.sell.up1.shift()
                                }
                                this.book.sell.up1.push({ price, value })
                            }
                        } else {
                            if (price < this.step.down6) {
                                if (this.book.buy.min.length > 36) {
                                    this.book.buy.min.shift()
                                }
                                this.book.buy.min.push({ price, value })
                            } else if (price < this.step.down5) {
                                if (this.book.buy.down6.length > 36) {
                                    this.book.buy.down6.shift()
                                }
                                this.book.buy.down6.push({ price, value })
                            } else if (price < this.step.down4) {
                                if (this.book.buy.down5.length > 36) {
                                    this.book.buy.down5.shift()
                                }
                                this.book.buy.down5.push({ price, value })
                            } else if (price < this.step.down3) {
                                if (this.book.buy.down4.length > 36) {
                                    this.book.buy.down4.shift()
                                }
                                this.book.buy.down4.push({ price, value })
                            } else if (price < this.step.down2) {
                                if (this.book.buy.down3.length > 36) {
                                    this.book.buy.down3.shift()
                                }
                                this.book.buy.down3.push({ price, value })
                            } else if (price < this.step.down1) {
                                if (this.book.buy.down2.length > 36) {
                                    this.book.buy.down2.shift()
                                }
                                this.book.buy.down2.push({ price, value })
                            } else if (price < this.step.down0) {
                                if (this.book.buy.down1.length > 36) {
                                    this.book.buy.down1.shift()
                                }
                                this.book.buy.down1.push({ price, value })
                            }
                        }
                    }
                })
            })
            this.book.current = point
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
