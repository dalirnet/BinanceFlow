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
                                <div class="candle-box-inner" v-if="!botUnderTesting">
                                    <div
                                        v-for="(candle, index) in candles"
                                        :key="candle.key"
                                        class="candle"
                                        :class="[
                                            candle.status != candle.chain.status
                                                ? candle.status
                                                    ? 'greenToRed'
                                                    : 'redToGreen'
                                                : candle.status
                                                ? 'green'
                                                : 'red',
                                            index == bot.pointer ? 'pointer' : null,
                                            includeKey(botBuyOrderKeys, candle.key) ? 'buyOrder' : null,
                                            includeKey(botBuyTradeKeys, candle.key) ? 'buyTrade' : null,
                                            includeKey(botSellOrderKeys, candle.key) ? 'sellOrder' : null,
                                            includeKey(botSellTradeKeys, candle.key) ? 'sellTrade' : null
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
                                        <span
                                            class="line"
                                            :style="candlePositionStyle([candle.high, candle.low])"
                                        ></span>
                                        <span
                                            class="bar"
                                            :style="candlePositionStyle([candle.open, candle.close])"
                                        ></span>
                                    </div>
                                    <div class="current" :style="candlePositionStyle([currentCandelPrice])">
                                        <span class="item">
                                            <span class="price" v-html="betterNumber(currentCandelPrice)"></span>
                                            <span class="close-at">
                                                <strong>{{ currentCandelCloseAt }}</strong>
                                                <small> s</small>
                                            </span>
                                        </span>
                                    </div>
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
                                    <at-input :value="bot.chain.downToUp" icon="trending-up" disabled>
                                        <template slot="prepend">
                                            <span>Chain to up</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-select
                                        v-model="bot.chain.downToUp"
                                        :class="{ disabled: !connected }"
                                        @on-change="changeBotChainDownToUp"
                                    >
                                        <at-option :value="1">1</at-option>
                                        <at-option :value="2">2</at-option>
                                        <at-option :value="3">3</at-option>
                                        <at-option :value="4">4</at-option>
                                        <at-option :value="5">5</at-option>
                                        <at-option :value="6">6</at-option>
                                    </at-select>
                                </div>
                            </div>
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.chain.upToDown" icon="trending-down" disabled>
                                        <template slot="prepend">
                                            <span>Chain to down</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-select
                                        v-model="bot.chain.upToDown"
                                        :class="{ disabled: !connected }"
                                        @on-change="changeBotChainUpToDown"
                                    >
                                        <at-option :value="1">1</at-option>
                                        <at-option :value="2">2</at-option>
                                        <at-option :value="3">3</at-option>
                                        <at-option :value="4">4</at-option>
                                        <at-option :value="5">5</at-option>
                                        <at-option :value="6">6</at-option>
                                    </at-select>
                                </div>
                            </div>
                        </div>
                        <div class="row at-row">
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
                                <at-button type="info" hollow>
                                    <span>Check</span>
                                    <span class="space"></span>
                                    <span>{{ bot.flow.check.length }}</span>
                                    <span class="space"></span>
                                    <small>Candles</small>
                                </at-button>
                            </div>
                            <div class="col flex">
                                <at-button type="success" hollow>
                                    <span>{{ bot.trade.buy.length }}</span>
                                    <span class="space"></span>
                                    <span>Buy</span>
                                    <span class="space"></span>
                                    <small>Order</small>
                                </at-button>
                            </div>
                            <div class="col flex">
                                <at-button type="success" hollow>
                                    <span v-html="betterNumber(botTrade.profit.value)"></span>
                                    <span class="space"></span>
                                    <small>{{ quoteSymbol }}</small>
                                    <span class="space"></span>
                                    <span>Profit</span>
                                    <span class="space"></span>
                                    <small>in</small>
                                    <span class="space"></span>
                                    <span>{{ botTrade.profit.count }}</span>
                                    <span class="space"></span>
                                    <small>Trade</small>
                                </at-button>
                            </div>
                            <div class="col flex">
                                <at-button type="error" hollow>
                                    <span>{{ bot.trade.sell.length }}</span>
                                    <span class="space"></span>
                                    <span>Sell</span>
                                    <span class="space"></span>
                                    <small>Order</small>
                                </at-button>
                            </div>
                            <div class="col flex">
                                <at-button type="error" hollow>
                                    <span v-html="betterNumber(botTrade.loss.value)"></span>
                                    <span class="space"></span>
                                    <small>{{ quoteSymbol }}</small>
                                    <span class="space"></span>
                                    <span>Loss</span>
                                    <span class="space"></span>
                                    <small>in</small>
                                    <span class="space"></span>
                                    <span>{{ botTrade.loss.count }}</span>
                                    <span class="space"></span>
                                    <small>Trade</small>
                                </at-button>
                            </div>
                            <div class="col flex">
                                <at-button type="info" hollow>
                                    <small>Remaining</small>
                                    <span class="space"></span>
                                    <span v-html="betterNumber(botTrade.profit.value - botTrade.loss.value)"></span>
                                    <span class="space"></span>
                                    <small>{{ quoteSymbol }}</small>
                                </at-button>
                            </div>
                        </div>
                        <div class="row bot-log">
                            <div
                                class="item-box"
                                v-for="(log, index) in bot.flow.log"
                                :key="index"
                                :class="log.side == 'Buy' ? 'success-color' : 'error-color'"
                            >
                                <strong class="item">{{ index + 1 }}</strong>
                                <span class="space"> - </span>
                                <span class="item">{{ log.side }}</span>
                                <span class="space"> - </span>
                                <span class="item">{{ log.type }}</span>
                                <span class="space"> - </span>
                                <span class="item" v-html="betterNumber(log.rate)"></span>
                                <span class="space"> - </span>
                                <span class="item">{{ log.amount }}</span>
                                <span class="space"> - </span>
                                <span class="item">{{ log.time }}</span>
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
                fund: 0,
                profit: 0,
                stoploss: 0,
                timefream: 0,
                chain: {
                    upToDown: 0,
                    downToUp: 0
                },
                limit: 120,
                status: 'stop',
                pointer: 0,
                keep: {
                    fund: null,
                    profit: null,
                    stoploss: null
                },
                flow: {
                    order: false,
                    side: 'buy',
                    rate: 0,
                    amount: 0,
                    key: null,
                    check: [],
                    log: []
                },
                trade: {
                    buy: [],
                    sell: []
                }
            }
        }
    },
    created() {
        this.bot.fund = this.$store.getters['botFund']
        this.bot.profit = this.$store.getters['botProfit']
        this.bot.stoploss = this.$store.getters['botStoploss']
        this.bot.timefream = this.$store.getters['botTimefream']
        this.bot.chain = this.$store.getters['botChain']
    },
    watch: {
        currentCandel(newValue, oldValue) {
            if (this.botUnderTesting || this.botUnderTrading) {
                if (oldValue && newValue) {
                    if (newValue.key !== oldValue.key) {
                        this.flow(this.botUnderTesting ? newValue : oldValue)
                    }
                }
            }
        }
    },
    computed: {
        requestName() {
            return [
                'api/v3/klines?symbol=',
                this.baseSymbol,
                this.quoteSymbol,
                '&interval=',
                this.bot.timefream,
                '&limit=',
                this.bot.limit,
                '&startTime=',
                moment()
                    .subtract(this.botTimefreamValue * this.bot.limit, this.botTimefreamPeriod)
                    .valueOf()
            ].join('')
        },
        streamName1() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@kline_', this.bot.timefream].join('')
        },
        candles() {
            // convert large shadow to prev status
            let timefream = _.take(_.reverse(_.keys(this.keepCandles)), this.bot.limit)
            return _.map(
                _.map(timefream, (key, index) => {
                    let current = this.keepCandles[key]
                    current.key = key
                    current.prev = []
                    current.chain = {
                        state: false,
                        status: current.status,
                        body: [current.body],
                        shadow: [current.shadow],
                        from: current.open,
                        to: current.close,
                        volume: current.volume,
                        length: 1
                    }
                    current.weightMoveAvg = current.close
                    let needNormalize = current.body < current.shadow * 0.75
                    let moveAvg = _.filter(
                        _.map(_.range(15), prevIndex => {
                            let key = _.get(timefream, index + prevIndex + 1)
                            let prevCandle = _.get(this.keepCandles, key, false)
                            if (prevCandle) {
                                if (needNormalize && prevCandle.body > prevCandle.shadow * 0.75) {
                                    current.chain.status = prevCandle.status
                                    needNormalize = false
                                }
                                current.prev.push(key)
                                return { open: prevCandle.open, close: prevCandle.close, volume: prevCandle.volume }
                            }
                            return false
                        })
                    )
                    if (moveAvg.length) {
                        let sumWeightMoveAvgVolume = _.sum(_.map(moveAvg, 'volume'))
                        current.weightMoveAvg = _.floor(
                            _.sum(_.map(moveAvg, ({ close, volume }) => (close * volume) / sumWeightMoveAvgVolume)),
                            6
                        )
                        current.chain.state = current.close > current.weightMoveAvg
                    }
                    return current
                }),
                candle => {
                    let chainCheck = true
                    _.forEach(candle.prev, prevKey => {
                        if (chainCheck) {
                            let prevCandle = this.keepCandles[prevKey]
                            if (candle.chain.status === prevCandle.chain.status) {
                                candle.chain.body.push(prevCandle.body)
                                candle.chain.shadow.push(prevCandle.shadow)
                                candle.chain.volume = _.floor(candle.chain.volume + prevCandle.volume, 6)
                                candle.chain.from = prevCandle.open
                                candle.chain.length++
                            } else {
                                chainCheck = false
                            }
                        }
                    })
                    candle.chain.body = _.floor(_.sum(candle.chain.body) / candle.chain.length, 6)
                    candle.chain.shadow = _.floor(_.sum(candle.chain.shadow) / candle.chain.length, 6)
                    return candle
                }
            )
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
        },
        currentCandelCloseAt() {
            return moment(_.get(this.currentCandel, 'closeAt', moment().valueOf())).diff(moment().valueOf(), 'seconds')
        },
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
        botUnderTrading() {
            return this.bot.status === 'trade'
        },
        botTrade() {
            let out = {
                profit: {
                    count: 0,
                    value: 0
                },
                loss: {
                    count: 0,
                    value: 0
                }
            }
            _.forEach(this.bot.trade.buy, (buy, index) => {
                let sell = _.get(this.bot.trade.sell, index, false)
                if (sell) {
                    if (sell.total > buy.total) {
                        out.profit.count++
                        out.profit.value += sell.total - buy.total
                    } else {
                        out.loss.count++
                        out.loss.value += buy.total - sell.total
                    }
                }
            })
            return out
        },
        botBuyOrderKeys() {
            return _.map(this.bot.trade.buy, 'key.order')
        },
        botBuyTradeKeys() {
            return _.map(this.bot.trade.buy, 'key.trade')
        },
        botSellOrderKeys() {
            return _.map(this.bot.trade.sell, 'key.order')
        },
        botSellTradeKeys() {
            return _.map(this.bot.trade.sell, 'key.trade')
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
                closeAt: to,
                status: close > open,
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
        changeBotChainDownToUp(value) {
            this.$store.commit('botChain', {
                upToDown: this.bot.chain.upToDown,
                downToUp: value
            })
        },
        changeBotChainUpToDown(value) {
            this.$store.commit('botChain', {
                upToDown: value,
                downToUp: this.bot.chain.downToUp
            })
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
            } else if (this.botUnderTrading) {
                this.$Notify({
                    title: 'Bot',
                    type: 'success',
                    message: 'Start bot trading',
                    duration: 6000
                })
            }
        },
        botTest() {
            this.bot.flow = {
                order: false,
                side: 'buy',
                rate: 0,
                amount: 0,
                key: null,
                check: [],
                log: []
            }
            this.bot.trade.buy = []
            this.bot.trade.sell = []
            let count = this.candles.length - 1
            this.$nextTick(async () => {
                for (let i = 0; i <= count; i++) {
                    await this.movePointer(count - i)
                }
                this.bot.status = 'stop'
                this.$Notify({
                    title: 'Bot',
                    type: 'success',
                    message: 'Test compelete',
                    duration: 6000
                })
            })
        },
        movePointer(pointer) {
            return new Promise(resolve => {
                this.bot.pointer = pointer
                this.$nextTick(() => {
                    resolve()
                })
            })
        },
        flow(current) {
            let prev = _.get(this.keepCandles, current.prevKey, false)
            if (prev) {
                this.bot.flow.check.push(current.key)
                if (this.bot.flow.order) {
                    if (this.bot.flow.rate >= current.low && this.bot.flow.rate <= current.high) {
                        this.bot.flow.order = false
                        if (this.bot.flow.side === 'sell') {
                            this.bot.trade.sell.push({
                                key: {
                                    order: this.bot.flow.key,
                                    trade: current.key
                                },
                                rate: this.bot.flow.rate,
                                amount: this.bot.flow.amount,
                                total: this.bot.flow.rate * this.bot.flow.amount
                            })
                            this.bot.flow.log.push({
                                side: 'Sell',
                                type: 'Trade',
                                rate: this.bot.flow.rate,
                                amount: this.bot.flow.amount,
                                time: current.from
                            })
                            this.bot.flow.side = 'buy'
                            this.bot.flow.rate = 0
                            this.bot.flow.amount = 0
                            this.bot.flow.key = null
                        } else {
                            this.bot.trade.buy.push({
                                key: {
                                    order: this.bot.flow.key,
                                    trade: current.key
                                },
                                rate: this.bot.flow.rate,
                                amount: this.bot.flow.amount,
                                total: this.bot.flow.rate * this.bot.flow.amount
                            })
                            this.bot.flow.log.push({
                                side: 'Buy',
                                type: 'Trade',
                                rate: this.bot.flow.rate,
                                amount: this.bot.flow.amount,
                                time: current.from
                            })
                            this.bot.flow.side = 'sell'
                        }
                    }
                }
                if (this.bot.flow.side === 'sell' && !current.chain.status) {
                    if (
                        prev.chain.status &&
                        prev.chain.length >= this.bot.chain.downToUp &&
                        current.close * this.bot.flow.amount >
                            this.bot.flow.rate * this.bot.flow.amount + this.bot.profit
                    ) {
                        this.bot.flow.rate = current.close
                        this.bot.flow.key = current.key
                        this.bot.flow.order = true
                        this.bot.flow.log.push({
                            side: 'Sell',
                            type: 'Order',
                            rate: this.bot.flow.rate,
                            amount: this.bot.flow.amount,
                            time: current.from
                        })
                    } else if (
                        current.close * this.bot.flow.amount <
                        this.bot.flow.rate * this.bot.flow.amount - this.bot.stoploss
                    ) {
                        this.bot.flow.rate = current.close
                        this.bot.flow.key = current.key
                        this.bot.flow.order = true
                        this.bot.flow.log.push({
                            side: 'Sell',
                            type: 'Order',
                            rate: this.bot.flow.rate,
                            amount: this.bot.flow.amount,
                            time: current.from
                        })
                    }
                } else if (
                    this.bot.flow.side === 'buy' &&
                    current.chain.status &&
                    current.chain.body > current.chain.shadow * 0.5 &&
                    current.high < current.weightMoveAvg &&
                    !prev.chain.status &&
                    prev.chain.length >= this.bot.chain.upToDown &&
                    prev.high < prev.weightMoveAvg
                ) {
                    let rate = _.floor(current.open + (prev.open - prev.close) * 0.5, 6)
                    if (rate >= current.low && rate <= current.high) {
                        this.bot.flow.rate = rate
                        this.bot.flow.amount = _.floor(this.bot.fund / rate, 6)
                        this.bot.flow.key = current.key
                        this.bot.flow.order = true
                        this.bot.flow.log.push({
                            side: 'Buy',
                            type: 'Order',
                            rate: this.bot.flow.rate,
                            amount: this.bot.flow.amount,
                            time: current.from
                        })
                    }
                }
            }
        },
        includeKey(array, key) {
            return _.includes(array, key)
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
            overflow-x: auto;
        }

        .candle-box {
            position: relative;
            display: flex;
            flex: 1;
            min-height: 200px;

            .candle-box-inner {
                position: relative;
                display: flex;
                flex-wrap: nowrap;
                flex-direction: row-reverse;
                margin: 0;
                padding: 0 100px;
                flex: 1;
            }

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
                    display: flex;
                    width: 100px;
                    top: -1px;
                    padding: 0 8px;
                    box-sizing: border-box;
                    font-size: 10px;
                    flex-direction: column;

                    .price,
                    .close-at {
                        background: #ffc82c;
                        color: #0b0e11;
                        border-radius: 4px;
                    }

                    .price {
                        padding: 2px 4px 0px 4px;
                        border-radius: 4px 4px 0 0;
                    }
                    .close-at {
                        padding: 0px 4px 2px 4px;
                        border-radius: 0 0 4px 4px;
                    }
                }
            }
        }

        .candle {
            position: relative;
            width: 7px;
            height: 200px;
            border-radius: 4px;
            cursor: pointer;

            &.pointer,
            &:hover {
                background: linear-gradient(
                    0deg,
                    rgba(240, 185, 11, 0.6),
                    rgba(240, 185, 11, 0.2),
                    rgba(240, 185, 11, 0.1),
                    rgba(240, 185, 11, 0.2),
                    rgba(240, 185, 11, 0.6)
                );
            }

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

            &.greenToRed,
            &.redToGreen {
                &::before {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: 1px;
                    right: 1px;
                    height: 2px;
                    border-radius: 4px;
                }
            }

            &.greenToRed {
                &::before {
                    background: #13ce66;
                }

                .bar {
                    background: #ff4949;
                }
            }

            &.redToGreen {
                &::before {
                    background: #ff4949;
                }

                .bar {
                    background: #13ce66;
                }
            }

            &.buyTrade,
            &.sellTrade {
                background: linear-gradient(
                    0deg,
                    rgba(120, 164, 250, 0.4),
                    rgba(120, 164, 250, 0.2),
                    rgba(120, 164, 250, 0.1),
                    rgba(120, 164, 250, 0.2),
                    rgba(120, 164, 250, 0.4)
                ) !important;
            }

            &.buyOrder {
                background: linear-gradient(
                    0deg,
                    rgba(19, 206, 102, 0.4),
                    rgba(19, 206, 102, 0.2),
                    rgba(19, 206, 102, 0.1),
                    rgba(19, 206, 102, 0.2),
                    rgba(19, 206, 102, 0.4)
                ) !important;
            }

            &.sellOrder {
                background: linear-gradient(
                    0deg,
                    rgba(255, 73, 73, 0.4),
                    rgba(255, 73, 73, 0.2),
                    rgba(255, 73, 73, 0.1),
                    rgba(255, 73, 73, 0.2),
                    rgba(255, 73, 73, 0.4)
                ) !important;
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

        .bot-log {
            margin: 8px 0 0 0;
            border-radius: 4px;
            padding: 4px;
            box-sizing: border-box;
            border: 1px solid #ececec;

            .item-box {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
                background: #f1f1f1;
                padding: 10px;
                border-radius: 4px;
                margin: 4px;
                font-size: 12px;
                white-space: nowrap;

                .space {
                    margin: 0 10px;
                }
            }
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
