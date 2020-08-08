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
                        <div class="row">op</div>
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
                                    <at-input :value="bot.profit + ' ' + quoteSymbol" icon="trending-up" disabled>
                                        <template slot="prepend">
                                            <span>Current profit</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col-24">
                                    <at-input
                                        v-model="bot.keep.profit"
                                        :placeholder="`Profit as ${quoteSymbol}`"
                                        @keyup.enter.native="setBotProfit"
                                        icon="trending-up"
                                    ></at-input>
                                </div>
                            </div>
                        </div>
                        <div class="row at-row">
                            <div class="col"></div>
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
            bot: {
                fund: 0,
                profit: 0,
                keep: {
                    fund: null,
                    profit: null
                }
            },
            history: {}
        }
    },
    computed: {
        requestName() {
            return [
                'api/v3/klines?symbol=',
                this.baseSymbol,
                this.quoteSymbol,
                '&interval=1m',
                '&startTime=',
                moment()
                    .subtract(60, 'minutes')
                    .valueOf()
            ].join('')
        },
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@kline_1m'].join('')
        }
    },
    mounted() {
        // this.toggleConnection()
        // this.fetchMyCoin()
        // this.fetchMyOpenOrder()
        // this.fetchMyTrade()
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
            this.mytrade = {
                list: [],
                remaining: {
                    base: 0,
                    quote: 0
                }
            }
            this.history = {}
        },
        listenOnSocket({ data: { k: timefream } }) {
            console.log('listenOnSocket', timefream)
        },
        listenOnRest(data) {
            console.log('listenOnRest', data)
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
                        if (this.bot.profit === 0) {
                            this.bot.profit = _.floor(_.toNumber(this.myCoin.quote.free) * 0.02, 6)
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
        setBotProfit() {
            let number = _.toNumber(this.bot.keep.profit)
            if (number > 0) {
                this.bot.profit = number
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
