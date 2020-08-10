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
                            <at-button class="col">
                                <span class="success-color" v-html="betterNumber(myCoin.base.free)"></span>
                                <span class="space"></span>
                                <span>{{ baseSymbol }}</span>
                                <span class="space"></span>
                                <span class="error-color" v-html="betterNumber(myCoin.base.locked)"></span>
                            </at-button>
                            <i class="icon icon-activity primary-color space"></i>
                            <at-button class="col">
                                <span class="success-color" v-html="betterNumber(myCoin.quote.free)"></span>
                                <span class="space"></span>
                                <span>{{ quoteSymbol }}</span>
                                <span class="space"></span>
                                <span class="error-color" v-html="betterNumber(myCoin.quote.locked)"></span>
                            </at-button>
                        </div>
                    </div>
                    <div class="watch-box">
                        <div class="row" ref="candleBox">
                            <div class="candle-box">
                                <div
                                    v-for="candle in candles"
                                    :key="candle.key"
                                    class="candle"
                                    :class="candle.chain.status ? 'green' : 'red'"
                                    @click="
                                        $Notify({
                                            title: 'Timefream',
                                            type: candle.chain.status ? 'success' : 'error',
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
                                    <span class="area" :style="candlePositionStyle([candle.weightMoveAvg])"></span>
                                    <span class="line" :style="candlePositionStyle([candle.high, candle.low])"></span>
                                    <span class="bar" :style="candlePositionStyle([candle.open, candle.close])"></span>
                                </div>
                                <div class="current" :style="candlePositionStyle([lastPrice])">
                                    <span class="item">
                                        <span v-html="betterNumber(lastPrice)"></span>
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
                        <i class="icon icon-watch primary-color"></i>
                    </div>
                    <div>
                        <div class="row at-row">
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.fund + ' ' + quoteSymbol" icon="inbox" disabled>
                                        <template slot="prepend">
                                            <span>Current fund</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-input
                                        v-model="bot.keep.fund"
                                        :placeholder="`Fund as ${quoteSymbol}`"
                                        @keyup.enter.native="setBotFund"
                                        icon="inbox"
                                    ></at-input>
                                </div>
                            </div>
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.minProfit + ' ' + quoteSymbol" icon="trending-up" disabled>
                                        <template slot="prepend">
                                            <span>Current min profit</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-input
                                        v-model="bot.keep.minProfit"
                                        :placeholder="`Min profit as ${quoteSymbol}`"
                                        @keyup.enter.native="setBotMinProfit"
                                        icon="trending-up"
                                    ></at-input>
                                </div>
                            </div>
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.stoploss + ' ' + quoteSymbol" icon="trending-down" disabled>
                                        <template slot="prepend">
                                            <span>Current stoploss</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-input
                                        v-model="bot.keep.stoploss"
                                        :placeholder="`Stoploss as ${quoteSymbol}`"
                                        @keyup.enter.native="setBotStoploss"
                                        icon="trending-down"
                                    ></at-input>
                                </div>
                            </div>
                            <div class="row col">
                                <div class="col-24 at-row">
                                    <at-input :value="bot.state" icon="activity" disabled>
                                        <template slot="prepend">
                                            <span>Current state</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-select v-model="bot.state" placeholder="Quote">
                                        <at-option value="off">Shut down</at-option>
                                        <at-option value="test">Test mode</at-option>
                                        <at-option value="start">Start</at-option>
                                    </at-select>
                                </div>
                            </div>
                        </div>
                        <div class="row at-row">
                            <div class="col">
                                <pre>{{ bot.result }}</pre>
                            </div>
                        </div>
                    </div>
                </at-card>
            </div>
            <div class="col-24 trdae-box">
                <at-card :no-hover="true">
                    <h4 slot="title">Trade</h4>
                    <div slot="extra">
                        <i class="icon icon-shopping-cart primary-color"></i>
                    </div>
                    <div class="row flex-middle">
                        <at-button class="col" :type="mytrade.remaining.base >= 0 ? 'success' : 'error'">
                            <small>Remaining</small>
                            <span class="space"></span>
                            <span v-html="betterNumber(mytrade.remaining.base)"></span>
                            <span class="space"></span>
                            <small>{{ baseSymbol }}</small>
                        </at-button>
                        <span class="space"></span>
                        <at-button class="col" :type="mytrade.remaining.quote >= 0 ? 'success' : 'error'">
                            <small>Remaining</small>
                            <span class="space"></span>
                            <span v-html="betterNumber(mytrade.remaining.quote)"></span>
                            <span class="space"></span>
                            <small>{{ quoteSymbol }}</small>
                        </at-button>
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
            amir: 'off',
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
                    quote: 0
                }
            },
            keepCandles: {},
            bot: {
                fund: 0,
                minProfit: 0,
                stoploss: 0,
                state: 'off',
                result: {
                    trade: [],
                    profit: [],
                    loss: []
                },
                keep: {
                    fund: null,
                    minProfit: null,
                    stoploss: null
                }
            }
        }
    },
    watch: {
        candles() {
            this.$nextTick(() => {
                this.$refs.candleBox.scrollLeft = this.$refs.candleBox.scrollWidth
            })
        }
    },
    computed: {
        requestName() {
            return [
                'api/v3/klines?symbol=',
                this.baseSymbol,
                this.quoteSymbol,
                '&interval=15m',
                '&limit=191',
                '&startTime=',
                moment()
                    .subtract(2, 'days')
                    .valueOf()
            ].join('')
        },
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@kline_15m'].join('')
        },
        candles() {
            // let timefream = _.take(_.reverse(_.keys(this.keepCandles)), 30)
            let timefream = _.reverse(_.keys(this.keepCandles))
            return _.map(timefream, (key, index) => {
                let current = this.keepCandles[key]
                current.key = key
                current.chain = {
                    state: false,
                    status: current.close > current.open,
                    from: current.open,
                    to: current.close,
                    volume: current.volume,
                    length: 1
                }
                let chainCheck = true
                let moveAvg = _.map(_.range(10), prevIndex => {
                    let prevKey = _.get(timefream, index + prevIndex + 1, key)
                    let { open, close, volume } = this.keepCandles[prevKey]
                    if (chainCheck && key !== prevKey && current.chain.status === close > open) {
                        current.chain.volume = _.floor(current.chain.volume + volume, 6)
                        current.chain.from = open
                        current.chain.length++
                    } else {
                        chainCheck = false
                    }
                    return { open, close, volume }
                })
                let sumMoveAvgVolume = _.sum(_.map(moveAvg, 'volume'))
                current.weightMoveAvg = _.floor(
                    _.sum(_.map(moveAvg, ({ close, volume }) => (close * volume) / sumMoveAvgVolume)),
                    6
                )
                if (current.close > current.weightMoveAvg) {
                    current.chain.state = true
                }
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
        lastPrice() {
            return _.get(_.head(this.candles), 'close', 0)
        }
    },
    mounted() {
        this.toggleConnection()
        this.fetchMyCoin()
        this.fetchMyOpenOrder()
        this.fetchMyTrade()
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
            this.myOpenOrder = {}
            this.keepCandles = {}
            this.mytrade = {
                list: [],
                remaining: {
                    base: 0,
                    quote: 0
                }
            }
        },
        listenOnSocket({ data: { k: timefream } }) {
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
        },
        candlePositionStyle(input = [0]) {
            let pos = {
                top: `${200 - ((_.max(input) - this.minOfCandles) * 200) / this.offsetOfCandles}px`
            }
            if (input.length > 1) {
                pos.bottom = `${((_.min(input) - this.minOfCandles) * 200) / this.offsetOfCandles}px`
            }
            return pos
        },
        updateKeepCandles(open, high, low, close, volume, trade, from, to, closed) {
            this.$set(
                this.keepCandles,
                [moment(from).format('MMDDHHmmss'), moment(to).format('MMDDHHmmss')].join('-'),
                {
                    from: moment(from).format('MM-DD HH:mm:ss'),
                    to: moment(to).format('MM-DD HH:mm:ss'),
                    open: _.floor(_.toNumber(open), 6),
                    high: _.floor(_.toNumber(high), 6),
                    low: _.floor(_.toNumber(low), 6),
                    close: _.floor(_.toNumber(close), 6),
                    volume: _.floor(_.toNumber(volume), 6),
                    trade,
                    closed
                }
            )
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
                            this.bot.fund = _.floor(_.toNumber(this.myCoin.quote.free) * 0.2, 6)
                        }
                        if (this.bot.minProfit === 0) {
                            this.bot.minProfit = _.floor(_.toNumber(this.myCoin.quote.free) * 0.02, 6)
                        }
                        if (this.bot.stoploss === 0) {
                            this.bot.stoploss = this.bot.minProfit * -1
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
            }
        },
        setBotMinProfit() {
            let number = _.toNumber(this.bot.keep.minProfit)
            if (number > 0) {
                this.bot.minProfit = number
            }
        },
        setBotStoploss() {
            let number = _.toNumber(this.bot.keep.stoploss)
            if (number > 0) {
                this.bot.stoploss = number
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

        .at-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            margin: 4px;
        }
    }

    .watch-box {
        justify-content: flex-start;
        align-items: flex-start;
        height: 236px;
        overflow: hidden;

        .row {
            margin: 0;
            height: 251px;
            min-width: 100%;
            padding: 16px;
            overflow-x: scroll;
            overflow-y: hidden;
            scroll-behavior: smooth;
        }

        .candle-box {
            position: relative;
            display: flex;
            flex-wrap: nowrap;
            flex-direction: row-reverse;
            margin: 0;
            padding: 0 100px;
            flex: 1;

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
                transition: top 1000ms linear;

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
                border-radius: 5px;
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

    .trdae-box {
        .row {
            margin: 0;
        }
    }
}
</style>
