<template>
    <div class="last-order">
        <div class="row at-row">
            <div class="col-24">
                <at-card :no-hover="true">
                    <h4 slot="title">
                        <span>Last order</span>
                        <at-tag
                            :color="loading ? 'info' : connected ? 'success' : 'error'"
                            @click.native="toggleConnection"
                            >{{ loading ? 'loading' : connected ? 'Connect' : 'Disconect' }}</at-tag
                        >
                    </h4>
                    <div slot="extra">
                        <at-button
                            :icon="connected ? 'icon-wifi' : 'icon-wifi-off'"
                            :class="loading ? 'info-color' : connected ? 'success-color' : 'error-color'"
                            size="smaller"
                            :disabled="loading"
                            @click.native="toggleConnection"
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
import connectionMixin from '@/mixins/connection'

export default {
    mixins: [connectionMixin],
    data() {
        return {
            step: {},
            book: {
                current: 0,
                sell: {},
                buy: {}
            }
        }
    },
    computed: {
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@depth'].join('')
        },
        sumValue() {
            return {
                sell: _.floor(_.sum(_.map(this.book.sell, item => _.get(item, 'value', 0))), 6),
                buy: _.floor(_.sum(_.map(this.book.buy, item => _.get(item, 'value', 0))), 6)
            }
        }
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
        stepLineValue(value) {
            return `${(value * 60) / (this.sumValue.sell + this.sumValue.buy)}%`
        },
        listenOnSocket({ data: { a: sell, b: buy } }) {
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
        }
    }
}
</script>

<style lang="scss">
.last-order {
    .at-card__body {
        padding: 8px 24px;
    }

    .watch-box {
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
