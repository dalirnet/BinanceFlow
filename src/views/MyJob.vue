<template>
    <div class="my-job">
        <div class="row at-row">
            <div class="col-24 at-row">
                <at-card :no-hover="true">
                    <ConnectionCardHeaderTitle
                        slot="title"
                        title="My job"
                        :loading="loading"
                        :connected="connected"
                        @click="toggleConnection"
                    />
                    <ConnectionCardHeaderExtra
                        slot="extra"
                        :loading="loading"
                        :connected="connected"
                        @click="toggleConnection"
                    />
                    <div class="watch-header">
                        <div class="row flex-middle">
                            <div class="col flex">
                                <at-button>
                                    <span class="success-color" v-html="betterNumber(myCoin.base.free)"></span>
                                    <span class="space"></span>
                                    <span>{{ baseSymbol }}</span>
                                    <span class="space"></span>
                                    <span class="error-color" v-html="betterNumber(myCoin.base.locked)"></span>
                                </at-button>
                            </div>
                            <div class="col flex" style="flex: 0;">
                                <i class="icon icon-activity primary-color space"></i>
                            </div>
                            <div class="col flex">
                                <at-button>
                                    <span class="success-color" v-html="betterNumber(myCoin.quote.free)"></span>
                                    <span class="space"></span>
                                    <span>{{ quoteSymbol }}</span>
                                    <span class="space"></span>
                                    <span class="error-color" v-html="betterNumber(myCoin.quote.locked)"></span>
                                </at-button>
                            </div>
                        </div>
                    </div>
                    <div class="watch-box">
                        <div class="row" ref="candleBox">
                            <div class="candle-box">
                                <div
                                    v-for="(candle, index) in candles"
                                    :key="candle.key"
                                    class="candle"
                                    :class="[
                                        candle.chain.status ? 'green' : 'red',
                                        index == bot.pointer ? 'pointer' : null
                                    ]"
                                    @click="
                                        $Notify({
                                            title: 'Timefream',
                                            type: 'info',
                                            message: [
                                                'From : ' + candle.from,
                                                'To : ' + candle.to,
                                                'High : ' + candle.high,
                                                'Open : ' + candle.open,
                                                'Close : ' + candle.close,
                                                'Low : ' + candle.low
                                            ].join('\n'),
                                            duration: 20000
                                        })
                                    "
                                >
                                    <span
                                        class="area"
                                        :style="candlePositionStyle([candle.weightMoveAvg, minOfCandles])"
                                    ></span>
                                    <span class="line" :style="candlePositionStyle([candle.high, candle.low])"></span>
                                    <span class="bar" :style="candlePositionStyle([candle.open, candle.close])"></span>
                                </div>
                                <div class="current" :style="candlePositionStyle([currentCandelPrice])">
                                    <span class="item">
                                        <span v-html="betterNumber(currentCandelPrice)"></span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="watch-footer row">
                        <at-button
                            v-for="order in myOpenOrder"
                            :key="order.id"
                            :type="order.side == 'Buy' ? 'success' : 'error'"
                            :loading="order.loading"
                            :disabled="order.loading"
                            class="col-24 flex flex-middle"
                            hollow
                        >
                            <span class="item">
                                <small>type</small>
                                <span class="space"></span>
                                <strong>{{ order.side }}</strong>
                            </span>
                            <span class="item">
                                <span class="space">|</span>
                            </span>
                            <span class="item">
                                <small>value</small>
                                <span class="space"></span>
                                <span class="flex">
                                    <strong v-html="betterNumber(order.value)"></strong>
                                    <span class="space"></span>
                                    <small>{{ baseSymbol }}</small>
                                </span>
                            </span>
                            <span class="item">
                                <span class="space">x</span>
                            </span>
                            <span class="item">
                                <small>price</small>
                                <span class="space"></span>
                                <span class="flex">
                                    <strong v-html="betterNumber(order.price)"></strong>
                                    <span class="space"></span>
                                    <small>{{ quoteSymbol }}</small>
                                </span>
                            </span>
                            <span class="item">
                                <span class="space">=</span>
                            </span>
                            <span class="item">
                                <small>total</small>
                                <span class="space"></span>
                                <span class="flex">
                                    <strong v-html="betterNumber(order.total)"></strong>
                                    <span class="space"></span>
                                    <small>{{ quoteSymbol }}</small>
                                </span>
                            </span>
                            <span class="item">
                                <span class="space">|</span>
                            </span>
                            <span class="item">
                                <small>date</small>
                                <span class="space"></span>
                                <strong>{{ order.date }}</strong>
                            </span>
                            <span class="item">
                                <span class="space">|</span>
                            </span>
                            <span class="item" @click="cancelOrder(order.id)">
                                <strong>
                                    <i class="icon icon-trash-2"></i>
                                </strong>
                                <span class="space"></span>
                                <small>cancel</small>
                            </span>
                        </at-button>
                    </div>
                </at-card>
            </div>
            <div class="col-24 bot-box at-row">
                <at-card :no-hover="true">
                    <h4 slot="title">Bot</h4>
                    <div slot="extra">
                        <i class="icon icon-clipboard primary-color"></i>
                    </div>
                    <div>
                        <div class="row at-row">
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.fund + ' ' + quoteSymbol" icon="inbox" disabled>
                                        <template slot="prepend">
                                            <span>Fund</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-input
                                        v-model="bot.keep.fund"
                                        :placeholder="`Fund as ${quoteSymbol}`"
                                        :class="{ disabled: !connected }"
                                        @keyup.enter.native="setBotFund"
                                        icon="inbox"
                                    ></at-input>
                                </div>
                            </div>
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.profit + ' ' + quoteSymbol" icon="trending-up" disabled>
                                        <template slot="prepend">
                                            <span>Profit</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-input
                                        v-model="bot.keep.profit"
                                        :placeholder="`Min profit as ${quoteSymbol}`"
                                        :class="{ disabled: !connected }"
                                        @keyup.enter.native="setBotProfit"
                                        icon="trending-up"
                                    ></at-input>
                                </div>
                            </div>
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.stoploss + ' ' + quoteSymbol" icon="trending-down" disabled>
                                        <template slot="prepend">
                                            <span>Stoploss</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-input
                                        v-model="bot.keep.stoploss"
                                        :placeholder="`Max stoploss as ${quoteSymbol}`"
                                        :class="{ disabled: !connected }"
                                        @keyup.enter.native="setBotStoploss"
                                        icon="trending-down"
                                    ></at-input>
                                </div>
                            </div>
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.timefream" icon="clock" disabled>
                                        <template slot="prepend">
                                            <span>Timefream</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-select
                                        v-model="bot.timefream"
                                        :class="{ disabled: !connected }"
                                        @on-change="changeBotTimefream"
                                    >
                                        <at-option value="1m">1 Minute</at-option>
                                        <at-option value="5m">5 Minute</at-option>
                                        <at-option value="15m">15 Minute</at-option>
                                        <at-option value="30m">30 Minute</at-option>
                                        <at-option value="1h">1 Hour</at-option>
                                        <at-option value="6h">6 Hour</at-option>
                                        <at-option value="1d">1 Day</at-option>
                                        <at-option value="3d">3 Day</at-option>
                                    </at-select>
                                </div>
                            </div>
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.status" icon="activity" disabled>
                                        <template slot="prepend">
                                            <span>Status</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-select
                                        v-model="bot.status"
                                        :class="{ disabled: !connected }"
                                        @on-change="changeBotStatus"
                                    >
                                        <at-option value="stop">Stop</at-option>
                                        <at-option value="test">Test</at-option>
                                        <at-option value="trade">Trade</at-option>
                                    </at-select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col flex">
                                <at-button type="success" hollow>
                                    <span>Buy</span>
                                    <span class="space"></span>
                                    <span>{{ bot.result.trade.buy.length }}</span>
                                </at-button>
                            </div>
                            <div class="col flex">
                                <at-button type="error" hollow>
                                    <span>Sell</span>
                                    <span class="space"></span>
                                    <span>{{ bot.result.trade.sell.length }}</span>
                                </at-button>
                            </div>
                            <div class="col flex">
                                <at-button type="success" hollow>
                                    <span>Profit</span>
                                    <span class="space"></span>
                                    <span>{{ bot.result.profit }}</span>
                                </at-button>
                            </div>
                            <div class="col flex">
                                <at-button type="error" hollow>
                                    <span>Loss</span>
                                    <span class="space"></span>
                                    <span>{{ bot.result.loss }}</span>
                                </at-button>
                            </div>
                        </div>
                    </div>
                </at-card>
            </div>
            <div class="col-24 trdae-box">
                <at-card :no-hover="true">
                    <h4 slot="title">Today trade</h4>
                    <div slot="extra">
                        <i class="icon icon-shopping-cart primary-color"></i>
                    </div>
                    <div class="row flex-middle">
                        <div class="col flex">
                            <at-button
                                class="col"
                                :type="fixFloatNumber(mytrade.remaining.base) >= 0 ? 'success' : 'error'"
                            >
                                <small>Remaining base</small>
                                <span class="space"></span>
                                <span v-html="betterNumber(mytrade.remaining.base)"></span>
                                <span class="space"></span>
                                <small>{{ baseSymbol }}</small>
                            </at-button>
                        </div>
                        <div class="col flex">
                            <at-button
                                class="col"
                                :type="fixFloatNumber(mytrade.remaining.feeAsBNB) >= 0 ? 'success' : 'error'"
                            >
                                <small>Fee</small>
                                <span class="space"></span>
                                <span v-html="betterNumber(mytrade.remaining.feeAsBNB)"></span>
                                <span class="space"></span>
                                <small>BNB</small>
                            </at-button>
                        </div>
                        <div class="col flex">
                            <at-button
                                class="col"
                                :type="fixFloatNumber(mytrade.remaining.quote) >= 0 ? 'success' : 'error'"
                            >
                                <small>Remaining quote</small>
                                <span class="space"></span>
                                <span v-html="betterNumber(mytrade.remaining.quote)"></span>
                                <span class="space"></span>
                                <small>{{ quoteSymbol }}</small>
                            </at-button>
                        </div>
                    </div>
                    <div class="row">
                        <at-button
                            v-for="trade in mytrade.list"
                            :key="trade.id"
                            :class="trade.side == 'Buy' ? 'success-color' : 'error-color'"
                            class="col-24 flex flex-middle"
                            hollow
                        >
                            <span class="item">
                                <small>type</small>
                                <span class="space"></span>
                                <strong>{{ trade.side }}</strong>
                            </span>
                            <span class="item">
                                <span class="space">|</span>
                            </span>
                            <span class="item">
                                <small>value</small>
                                <span class="space"></span>
                                <span class="flex">
                                    <strong v-html="betterNumber(trade.value)"></strong>
                                    <span class="space"></span>
                                    <small>{{ baseSymbol }}</small>
                                </span>
                            </span>
                            <span class="item">
                                <span class="space">x</span>
                            </span>
                            <span class="item">
                                <small>price</small>
                                <span class="space"></span>
                                <span class="flex">
                                    <strong v-html="betterNumber(trade.price)"></strong>
                                    <span class="space"></span>
                                    <small>{{ quoteSymbol }}</small>
                                </span>
                            </span>
                            <span class="item">
                                <span class="space">=</span>
                            </span>
                            <span class="item">
                                <small>total</small>
                                <span class="space"></span>
                                <span class="flex">
                                    <strong v-html="betterNumber(trade.total)"></strong>
                                    <span class="space"></span>
                                    <small>{{ quoteSymbol }}</small>
                                </span>
                            </span>
                            <span class="item">
                                <span class="space">|</span>
                            </span>
                            <span class="item">
                                <small>date</small>
                                <span class="space"></span>
                                <strong>{{ trade.date }}</strong>
                            </span>
                        </at-button>
                    </div>
                </at-card>
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import baseMixin from '@/mixins/base'
import signMixin from '@/mixins/sign'
import ConnectionCardHeaderTitle from '@/components/ConnectionCardHeaderTitle'
import ConnectionCardHeaderExtra from '@/components/ConnectionCardHeaderExtra'

export default {
    mixins: [baseMixin, signMixin],
    components: { ConnectionCardHeaderTitle, ConnectionCardHeaderExtra },
    data() {
        return {
            myCoin: {
                base: {
                    free: 0,
                    locked: 0
                },
                quote: {
                    free: 0,
                    locked: 0
                }
            },
            myOpenOrder: {},
            mytrade: {
                list: [],
                remaining: {
                    base: 0,
                    quote: 0,
                    feeAsBNB: 0
                }
            },
            keepCandles: {},
            bot: {
                fund: this.$store.getters['botFund'],
                profit: this.$store.getters['botProfit'],
                stoploss: this.$store.getters['botStoploss'],
                timefream: this.$store.getters['botTimefream'],
                status: 'stop',
                pointer: 0,
                keep: {
                    fund: null,
                    profit: null,
                    stoploss: null
                },
                flow: {
                    side: 'buy',
                    rate: 0,
                    amount: 0
                },
                result: {
                    trade: {
                        buy: [],
                        sell: []
                    },
                    profit: [],
                    loss: []
                }
            }
        }
    },
    watch: {
        currentCandel(newValue, oldValue) {
            if (oldValue && newValue) {
                if (newValue.key !== oldValue.key) {
                    this.flow(this.botUnderTesting ? newValue : oldValue)
                }
            }
        }
    },
    computed: {
        botTimefreamValue() {
            return _.replace(this.bot.timefream, /[^0-9]/g, '')
        },
        botTimefreamPeriod() {
            return _.get(
                {
                    m: 'minutes',
                    h: 'hours',
                    d: 'days'
                },
                _.replace(this.bot.timefream, /[0-9]/g, '')
            )
        },
        botUnderTesting() {
            return this.bot.status === 'test'
        },
        requestName() {
            return [
                'api/v3/klines?symbol=',
                this.baseSymbol,
                this.quoteSymbol,
                '&interval=',
                this.bot.timefream,
                '&limit=120',
                '&startTime=',
                moment()
                    .subtract(this.botTimefreamValue * 120, this.botTimefreamPeriod)
                    .valueOf()
            ].join('')
        },
        streamName1() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@kline_', this.bot.timefream].join('')
        },
        candles() {
            let timefream = _.take(_.reverse(_.keys(this.keepCandles)), 120)
            return _.map(timefream, (key, index) => {
                let current = this.keepCandles[key]
                current.key = key
                current.chain = {
                    state: false,
                    status: current.close > current.open,
                    body: [current.body],
                    shadow: [current.shadow],
                    from: current.open,
                    to: current.close,
                    volume: current.volume,
                    length: 1
                }
                let chainCheck = true
                let moveAvg = _.map(_.range(10), prevIndex => {
                    let prevKey = _.get(timefream, index + prevIndex + 1, key)
                    let { open, close, body, shadow, volume } = this.keepCandles[prevKey]
                    if (chainCheck && key !== prevKey && current.chain.status === close > open) {
                        current.chain.body.push(body)
                        current.chain.shadow.push(shadow)
                        current.chain.volume = _.floor(current.chain.volume + volume, 6)
                        current.chain.from = open
                        current.chain.length++
                    } else {
                        chainCheck = false
                    }
                    return { open, close, volume }
                })
                current.chain.body = _.floor(_.sum(current.chain.body) / current.chain.length, 6)
                current.chain.shadow = _.floor(_.sum(current.chain.shadow) / current.chain.length, 6)
                let sumWeightMoveAvgVolume = _.sum(_.map(moveAvg, 'volume'))
                current.weightMoveAvg = _.floor(
                    _.sum(_.map(moveAvg, ({ close, volume }) => (close * volume) / sumWeightMoveAvgVolume)),
                    6
                )
                current.chain.state = current.close > current.weightMoveAvg

                return current
            })
        },
        maxOfCandles() {
            return _.max(_.map(this.candles, 'high'))
        },
        minOfCandles() {
            return _.min(_.map(this.candles, 'low'))
        },
        offsetOfCandles() {
            return this.maxOfCandles - this.minOfCandles
        },
        currentCandel() {
            let candles = this.candles
            let candlesKey = _.keys(candles)
            let candle = _.get(candles, _.get(candlesKey, this.bot.pointer, candlesKey.length), _.head(candles))
            if (candle) {
                candle.prevKey = null
                if (this.bot.pointer < candlesKey.length) {
                    candle.prevKey = _.get(candles, [candlesKey[this.bot.pointer + 1], 'key'].join('.'), null)
                }
            }

            return candle
        },
        currentCandelPrice() {
            return _.get(this.currentCandel, 'close', 0)
        }
    },
    methods: {
        reset() {
            this.myCoin = {
                base: {
                    free: 0,
                    locked: 0
                },
                quote: {
                    free: 0,
                    locked: 0
                }
            }
            this.mytrade = {
                list: [],
                remaining: {
                    base: 0,
                    quote: 0,
                    feeAsBNB: 0
                }
            }
            this.myOpenOrder = {}
            this.keepCandles = {}
        },
        listenOnSocket({ data: { k: timefream } }) {
            if (!this.botUnderTesting) {
                this.updateKeepCandles(
                    timefream.o,
                    timefream.h,
                    timefream.l,
                    timefream.c,
                    timefream.V,
                    timefream.n,
                    timefream.t,
                    timefream.T,
                    timefream.x
                )
            }
        },
        listenOnRest(data) {
            _.forEach(data, timefream => {
                this.updateKeepCandles(
                    timefream[1],
                    timefream[2],
                    timefream[3],
                    timefream[4],
                    timefream[5],
                    timefream[8],
                    timefream[0],
                    timefream[6],
                    true
                )
            })
            if (this.$store.state.api.key && this.$store.state.api.secret) {
                // this.fetchMyCoin()
                // this.fetchMyOpenOrder()
                // this.fetchMyTrade()
            }
        },
        candlePositionStyle(input = [0]) {
            return {
                top: `${200 - ((_.max(input) - this.minOfCandles) * 200) / this.offsetOfCandles}px`,
                bottom: `${((_.min(input) - this.minOfCandles) * 200) / this.offsetOfCandles}px`
            }
        },
        updateKeepCandles(open, high, low, close, volume, trade, from, to, closed) {
            let body, shadow
            open = _.floor(_.toNumber(open), 6)
            high = _.floor(_.toNumber(high), 6)
            low = _.floor(_.toNumber(low), 6)
            close = _.floor(_.toNumber(close), 6)
            volume = _.floor(_.toNumber(volume), 6)
            body = _.floor(((_.max([open, close]) - _.min([open, close])) * 100) / (high - low), 2)
            shadow = 100 - body
            this.$set(this.keepCandles, [moment(from).format('MMDDHHmmss'), moment(to).format('MMDDHHmmss')].join(''), {
                from: moment(from).format('MM-DD HH:mm:ss'),
                to: moment(to).format('MM-DD HH:mm:ss'),
                open,
                high,
                low,
                close,
                volume,
                trade,
                body,
                shadow,
                closed
            })
        },
        fetchMyCoin() {
            this.signRequest('get', 'sapi/v1/capital/config/getall').then(({ status, data }) => {
                if (status) {
                    let base = _.find(data, { coin: this.baseSymbol })
                    if (base) {
                        this.myCoin.base = {
                            free: base.free,
                            locked: base.locked
                        }
                    }
                    let quote = _.find(data, { coin: this.quoteSymbol })
                    if (quote) {
                        this.myCoin.quote = {
                            free: quote.free,
                            locked: quote.locked
                        }
                        if (this.bot.fund === 0) {
                            this.bot.fund = _.floor(_.toNumber(this.myCoin.quote.free) * 0.5, 6)
                            this.$store.commit('botFund', this.bot.fund)
                        }
                        if (this.bot.profit === 0) {
                            this.bot.profit = _.floor(_.toNumber(this.myCoin.quote.free) * 0.05, 6)
                            this.$store.commit('botProfit', this.bot.profit)
                        }
                        if (this.bot.stoploss === 0) {
                            this.bot.stoploss = this.bot.profit * -1
                            this.$store.commit('botStoploss', this.bot.stoploss)
                        }
                    }
                }
            })
        },
        fetchMyOpenOrder() {
            this.signRequest('get', 'api/v3/openOrders', {
                symbol: [this.baseSymbol, this.quoteSymbol].join('')
            }).then(({ status, header, data }) => {
                if (status) {
                    _.forEach(data, order => {
                        this.$set(this.myOpenOrder, order.orderId, {
                            id: order.orderId,
                            side: _.upperFirst(_.toLower(order.side)),
                            date: moment(order.time).format('MM-DD HH:mm:ss'),
                            value: _.toNumber(order.origQty),
                            price: _.toNumber(order.price),
                            total: _.toNumber(order.origQty) * _.toNumber(order.price),
                            loading: false
                        })
                    })
                }
            })
        },
        fetchMyTrade() {
            this.signRequest('get', 'api/v3/myTrades', {
                symbol: [this.baseSymbol, this.quoteSymbol].join('')
            }).then(({ status, header, data }) => {
                if (status) {
                    this.mytrade.list = _.map(_.reverse(_.sortBy(data, ['time'])), trade => {
                        let commission = _.toNumber(trade.commission)
                        let value = _.toNumber(trade.qty)
                        let price = _.toNumber(trade.price)
                        let total = value * price
                        if (trade.commissionAsset == this.baseSymbol) {
                            value -= commission
                            total = value * price
                        } else if (trade.commissionAsset == this.quoteSymbol) {
                            total -= commission
                        } else {
                            this.mytrade.remaining.feeAsBNB -= commission
                        }
                        if (trade.isBuyer) {
                            this.mytrade.remaining.base += value
                            this.mytrade.remaining.quote -= total
                        } else {
                            this.mytrade.remaining.base -= value
                            this.mytrade.remaining.quote += total
                        }
                        return {
                            id: trade.id,
                            side: trade.isBuyer ? 'Buy' : 'Sell',
                            date: moment(trade.time).format('MM-DD HH:mm:ss'),
                            value: _.floor(value, 6),
                            price: _.floor(price, 6),
                            total: _.floor(total, 6)
                        }
                    })
                }
            })
        },
        cancelOrder(id) {
            if (!this.myOpenOrder[id].loading) {
                this.myOpenOrder[id].loading = true
                this.signRequest('delete', 'api/v3/order', {
                    symbol: [this.baseSymbol, this.quoteSymbol].join(''),
                    orderId: id
                }).then(({ status, body }) => {
                    if (status) {
                        this.$delete(this.myOpenOrder, id)
                    }
                })
            }
        },
        setBotFund() {
            let number = _.toNumber(this.bot.keep.fund)
            if (number > 0) {
                this.bot.fund = number
                this.$store.commit('botFund', number)
            }
        },
        setBotProfit() {
            let number = _.toNumber(this.bot.keep.profit)
            if (number > 0) {
                this.bot.profit = number
                this.$store.commit('botProfit', number)
            }
        },
        setBotStoploss() {
            let number = _.toNumber(this.bot.keep.stoploss)
            if (number > 0) {
                this.bot.stoploss = number
                this.$store.commit('botStoploss', number)
            }
        },
        changeBotTimefream(value) {
            this.$store.commit('botTimefream', value)
            this.$nextTick(() => {
                this.toggleConnection(true)
            })
        },
        changeBotStatus(value) {
            if (this.botUnderTesting) {
                this.botTest()
            }
        },
        botTest() {
            this.bot.result = {
                trade: {
                    buy: [],
                    sell: []
                },
                profit: [],
                loss: []
            }
            this.$store.commit('flowSide', 'buy')
            this.$store.commit('flowRate', 0)
            this.$store.commit('flowAmount', 0)
            let count = this.candles.length - 1
            this.$nextTick(() => {
                for (let i = 0; i <= count; i++) {
                    setTimeout(() => {
                        this.bot.pointer = count - i
                        if (i == count) {
                            this.$nextTick(() => {
                                this.bot.status = 'stop'
                                this.$Notify({
                                    title: 'Bot',
                                    type: 'success',
                                    message: 'Test compelete',
                                    duration: 6000
                                })
                            })
                        }
                    }, i * 100)
                }
            })
        },
        flow(current) {
            let prev = _.get(this.keepCandles, current.prevKey, false)
            if (prev) {
                if (current.chain.status != prev.chain.status && prev.chain.length >= 2) {
                    // let side = this.$store.getters['flowSide']
                    // if (side === 'buy') {
                    //     this.bot.result.trade.buy.push('1')
                    //     this.$store.commit('flowSide', 'sell')
                    // } else {
                    //     this.bot.result.trade.sell.push('1')
                    //     this.$store.commit('flowSide', 'buy')
                    // }
                    // console.log('signal', this.$store.getters['flowSide'])
                    // if (flow.allow.buy && timefream.chain.status && timefream.high < timefream.weightMoveAvg) {
                    //     // flow.rate = prevTimeFream.chain.to + prevTimeFream.chain.space * 0.2
                    //     console.log('buy', timefream)
                    //     flow.allow.buy = false
                    //     flow.allow.sell = true
                    // } else if (flow.allow.sell && !timefream.chain.status) {
                    //     console.log('sell', timefream)
                    //     flow.allow.buy = true
                    //     flow.allow.sell = false
                    // }
                }
            }
        }
    }
}
</script>

<style lang="scss">
.my-job {
    .watch-header {
        margin-top: 0;

        .row {
            flex: 1;
        }

        .at-tag .at-tag__text {
            font-size: 10px;
        }
    }

    .watch-box {
        .row {
            margin: 0;
            padding: 24px 0;
            box-sizing: border-box;
            scroll-behavior: smooth;
            flex: 1;
        }

        .candle-box {
            position: relative;
            display: flex;
            flex-wrap: nowrap;
            flex-direction: row-reverse;
            margin: 0;
            padding: 0 100px;
            flex: 1;
            min-height: 200px;

            .current {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                top: 0;
                bottom: auto;
                left: 0px;
                right: 0px;
                height: 0;
                border-top: dashed 1px #ffc82c;
                transition: top 200ms linear;

                .item {
                    position: relative;
                    width: 100px;
                    top: -1px;
                    padding: 0 8px;
                    box-sizing: border-box;
                    font-size: 10px;

                    > span {
                        background: #ffc82c;
                        padding: 1px 4px 2px;
                        color: #0b0e11;
                        border-radius: 4px;
                    }
                }
            }
        }

        .candle {
            position: relative;
            width: 7px;
            height: 200px;
            border-radius: 4px;

            .line {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 3px;
                right: 3px;
            }

            .bar {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 1px;
                right: 1px;
                border-radius: 4px;
                cursor: pointer;
            }

            .area {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(0deg, rgba(0, 0, 0, 0) 50%, #78a4fa);
                border-radius: 2px 2px 0 0;
                opacity: 0.25;
            }

            &.green {
                .line,
                .bar {
                    background: #13ce66;
                }
            }

            &.red {
                .line,
                .bar {
                    background: #ff4949;
                }
            }

            &.pointer {
                background: linear-gradient(
                    0deg,
                    rgba(240, 185, 11, 0.6),
                    rgba(240, 185, 11, 0.2),
                    rgba(240, 185, 11, 0.1),
                    rgba(240, 185, 11, 0.2),
                    rgba(240, 185, 11, 0.6)
                );
            }
        }
    }

    .watch-footer {
        margin: 0;

        .at-btn.col-24 {
            .at-btn__loading {
                position: absolute;
                top: 50%;
                left: 50%;
                margin: -7.5px 0 0 -7.5px;
            }

            &:disabled {
                .at-btn__text {
                    opacity: 0.3;
                }
            }
        }
    }

    .bot-box {
        .at-input--disabled {
            .at-input-group__prepend,
            .at-input__icon,
            input {
                cursor: pointer;
                color: #0b0e11;
            }
        }

        .at-select__selected {
            color: #c9cac9;
        }

        .at-input.disabled,
        .at-select.disabled {
            opacity: 0.8;
            pointer-events: none;
        }
    }

    .watch-footer,
    .trdae-box {
        .at-btn.col-24 {
            position: relative;
            margin-top: 8px;

            .at-btn__text {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .item {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .flex {
                        align-items: baseline;

                        .space {
                            margin: 0 2px;
                        }
                    }
                }
            }
        }
    }

    .row > .col > .at-btn {
        justify-content: center;
        flex: 1;
    }
}
</style>
