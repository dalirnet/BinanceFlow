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
                            <at-button class="coll">
                                <span class="success-color" v-html="betterNumber(myCoin.base.free)"></span>
                                <span class="space"></span>
                                <span>{{ baseSymbol }}</span>
                                <span class="space"></span>
                                <span class="error-color" v-html="betterNumber(myCoin.base.locked)"></span>
                            </at-button>
                            <i class="icon icon-activity primary-color space"></i>
                            <at-button class="coll">
                                <span class="success-color" v-html="betterNumber(myCoin.quote.free)"></span>
                                <span class="space"></span>
                                <span>{{ quoteSymbol }}</span>
                                <span class="space"></span>
                                <span class="error-color" v-html="betterNumber(myCoin.quote.locked)"></span>
                            </at-button>
                        </div>
                    </div>
                    <div class="watch-box">
                        <div class="row"></div>
                    </div>
                    <div class="watch-footer"></div>
                </at-card>
            </div>
            <div class="col-24 bot-box">
                <at-card :no-hover="true">
                    <h4 slot="title">Bot</h4>
                    <div slot="extra">
                        <i class="icon icon-shopping-cart primary-color"></i>
                    </div>
                    <div>
                        <div class="row at-row">
                            <div class="col">
                                <div class="col at-row">
                                    <at-input :value="bot.fund + ' ' + quoteSymbol" icon="inbox" disabled>
                                        <template slot="prepend">
                                            <span>Current fund</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col">
                                    <at-input
                                        v-model="bot.keep.fund"
                                        :placeholder="`Fund as ${quoteSymbol}`"
                                        @keyup.enter.native="setBotFund"
                                        icon="inbox"
                                    ></at-input>
                                </div>
                            </div>
                            <div class="col">
                                <div class="col at-row">
                                    <at-input :value="bot.profit + ' ' + quoteSymbol" icon="trending-up" disabled>
                                        <template slot="prepend">
                                            <span>Current profit</span>
                                        </template>
                                    </at-input>
                                </div>
                                <div class="col">
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
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@kline_1m'].join('')
        }
    },
    mounted() {
        // this.toggleConnection()
        this.fetchMyCoin()
        // this.signRequest('get', 'api/v3/allOrders', {
        //     symbol: 'ETHUSDT'
        // }).then(({ status, body }) => {
        //     console.log(status, body)
        // })
    },
    methods: {
        reset() {
            this.history = {}
        },
        listenOnSocket({ data }) {
            console.log(data)
        },
        fetchMyCoin() {
            this.signRequest('get', 'sapi/v1/capital/config/getall').then(({ status, body }) => {
                if (status) {
                    let base = _.find(body, { coin: this.baseSymbol })
                    if (base) {
                        this.myCoin.base = {
                            free: _.toNumber(base.free),
                            locked: _.toNumber(base.locked)
                        }
                    }
                    let quote = _.find(body, { coin: this.quoteSymbol })
                    if (quote) {
                        this.myCoin.quote = {
                            free: _.toNumber(quote.free),
                            locked: _.toNumber(quote.locked)
                        }
                    }
                    if (this.bot.fund === 0) {
                        this.bot.fund = _.floor(this.myCoin.quote.free * 0.2, 6)
                    }
                    if (this.bot.profit === 0) {
                        this.bot.profit = _.floor(this.myCoin.quote.free * 0.02, 6)
                    }
                }
            })
        },
        setBotFund() {
            let number = _.toNumber(this.bot.keep.fund)
            if (!_.isNaN(number)) {
                this.bot.fund = number
            }
        },
        setBotProfit() {
            let number = _.toNumber(this.bot.keep.profit)
            if (!_.isNaN(number)) {
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
}
</style>
