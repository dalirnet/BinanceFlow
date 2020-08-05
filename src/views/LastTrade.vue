<template>
    <div class="last-trade">
        <div class="row at-row">
            <div class="col-24">
                <at-card :no-hover="true">
                    <h4 slot="title">
                        <span>Last trade</span>
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
                    <div class="watch-box">
                        <div class="states-box">
                            <div class="states-inner-box">
                                <div
                                    v-for="(state, stateKey) in states"
                                    class="state-box"
                                    :class="stateKey"
                                    :key="stateKey"
                                >
                                    <div
                                        v-for="(direction, directionKey) in state"
                                        class="direction-box"
                                        :class="directionKey"
                                        :key="directionKey"
                                    >
                                        <span class="content">
                                            <template v-if="directionKey != 'avg'">
                                                <span>
                                                    <span v-html="betterNumber(direction.price.high)"></span>
                                                    <br />
                                                    <span v-html="betterNumber(direction.price.low)"></span>
                                                </span>
                                                <span>{{ cubic[stateKey][directionKey] }}<small>%</small></span>
                                            </template>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="line">
                                <div class="status" :class="status">
                                    <i class="icon icon-arrow-down-left"></i>
                                </div>
                                <span class="label">
                                    <span>Avg Price</span>
                                </span>
                            </div>
                        </div>
                        <div class="info-box">
                            <span class="item">
                                <strong>Timefream</strong>
                                <span class="space"></span>
                                <span>{{ timefream }}</span>
                            </span>
                            <span class="item">
                                <strong>As of</strong>
                                <span class="space"></span>
                                <span>{{ startTime.format('lll') }}</span>
                            </span>
                            <hr />
                            <span class="item">
                                <strong>Real time</strong>
                                <span class="space"></span>
                                <span class="primary-color" v-html="betterNumber(realTimePrice)"></span>
                            </span>
                            <hr />
                            <span class="item">
                                <strong>Low price</strong>
                                <span class="space"></span>
                                <span class="error-color" v-html="betterNumber(lowPrice)"></span>
                            </span>
                            <span class="item">
                                <strong>High price</strong>
                                <span class="space"></span>
                                <span class="success-color" v-html="betterNumber(highPrice)"></span>
                            </span>
                            <hr />
                            <span class="item">
                                <strong>Over avg</strong>
                                <span class="space"></span>
                                <span class="success-color">{{ cubic.axis.x.over }}<small>%</small></span>
                            </span>
                            <span class="item">
                                <strong>Under avg</strong>
                                <span class="space"></span>
                                <span class="error-color">{{ cubic.axis.x.under }}<small>%</small></span>
                            </span>
                            <hr />
                            <span class="item">
                                <strong>Up state</strong>
                                <span class="space"></span>
                                <span class="success-color">{{ cubic.axis.y.up }}<small>%</small></span>
                            </span>
                            <span class="item">
                                <strong>Down state</strong>
                                <span class="space"></span>
                                <span class="error-color">{{ cubic.axis.y.down }}<small>%</small></span>
                            </span>
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
import connectionMixin from '@/mixins/connection'

export default {
    mixins: [connectionMixin],
    data() {
        return {
            timefream: '30m',
            startTime: moment().subtract(7, 'days'),
            states: {},
            price: [],
            realTimePrice: 0
        }
    },
    computed: {
        requestNames() {
            return [
                ['ticker/24hr?symbol=', this.baseSymbol, this.quoteSymbol].join(''),
                [
                    'klines?symbol=',
                    this.baseSymbol,
                    this.quoteSymbol,
                    '&interval=',
                    this.timefream,
                    '&startTime=',
                    this.startTime.valueOf()
                ].join('')
            ]
        },
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@ticker'].join('')
        },
        cubic() {
            let keep = {
                overDown: (this.states.over.down.volume / this.states.over.down.count) * this.states.over.down.trade,
                overUp: (this.states.over.up.volume / this.states.over.up.count) * this.states.over.up.trade,
                betweenDown:
                    (this.states.between.down.volume / this.states.between.down.count) * this.states.between.down.trade,
                betweenUp:
                    (this.states.between.up.volume / this.states.between.up.count) * this.states.between.up.trade,
                underDown:
                    (this.states.under.down.volume / this.states.under.down.count) * this.states.under.down.trade,
                underUp: (this.states.under.up.volume / this.states.under.up.count) * this.states.under.up.trade
            }
            let fullValue = _.sum(_.values(keep))
            let out = {
                over: {
                    down: _.floor((keep.overDown * 100) / fullValue, 2),
                    up: _.floor((keep.overUp * 100) / fullValue, 2)
                },
                between: {
                    down: _.floor((keep.betweenDown * 100) / fullValue, 2),
                    up: _.floor((keep.betweenUp * 100) / fullValue, 2)
                },
                under: {
                    down: _.floor((keep.underDown * 100) / fullValue, 2),
                    up: _.floor((keep.underUp * 100) / fullValue, 2)
                },
                axis: {
                    x: {
                        over: 0,
                        between: 0,
                        under: 0
                    },
                    y: {
                        down: 0,
                        uo: 0
                    }
                }
            }
            out.axis.x.over = _.floor(out.over.down + out.over.up, 2)
            out.axis.x.between = _.floor(out.between.down + out.between.up, 2)
            out.axis.x.under = _.floor(out.under.down + out.under.up, 2)
            out.axis.y.down = _.floor(out.over.down + out.between.down + out.under.down, 2)
            out.axis.y.up = _.floor(out.over.up + out.between.up + out.under.up, 2)
            return out
        },
        status() {
            let className = []
            if (this.cubic.axis.x.over > 0) {
                if (this.cubic.axis.x.over > this.cubic.axis.x.under) {
                    className.push('under')
                } else {
                    className.push('over')
                }
                if (this.cubic.axis.y.down > this.cubic.axis.y.down) {
                    className.push('up')
                } else {
                    className.push('down')
                }
            }
            return className
        },
        lowPrice() {
            return _.floor(_.min(this.price), 6)
        },
        highPrice() {
            return _.floor(_.max(this.price), 6)
        }
    },
    created() {
        this.reset()
    },
    mounted() {
        this.toggleConnection()
    },
    methods: {
        reset() {
            let instance = {
                count: 0,
                volume: 0,
                trade: 0,
                price: {
                    list: [],
                    high: 0,
                    avg: 0,
                    low: 0
                }
            }
            this.states = {
                over: {
                    down: _.cloneDeep(instance),
                    avg: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                },
                between: {
                    down: _.cloneDeep(instance),
                    avg: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                },
                under: {
                    down: _.cloneDeep(instance),
                    avg: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                }
            }
            this.price = []
            this.realTimePrice = 0
        },
        listenOnSocket({ data: { c: price } }) {
            this.realTimePrice = _.toNumber(price)
        },
        listenOnRest([{ weightedAvgPrice: avg, volume: allVolume, count: allCount }, details]) {
            avg = _.floor(_.toNumber(avg), 6)
            allVolume = _.floor(_.toNumber(allVolume), 6)
            _.forEach(details, ([openTime, open, hight, low, close, volume, closeTime, quoteVolume, count]) => {
                open = _.floor(_.toNumber(open), 6)
                hight = _.floor(_.toNumber(hight), 6)
                low = _.floor(_.toNumber(low), 6)
                close = _.floor(_.toNumber(close), 6)
                volume = _.floor(_.toNumber(volume), 6)
                let state = open >= avg && close >= avg ? 'over' : open <= avg && close <= avg ? 'under' : 'between'
                let direction = open <= close ? 'up' : 'down'
                this.states[state][direction].count++
                this.states[state][direction].volume += volume
                this.states[state][direction].trade += count
                this.states[state][direction].price.list.push(...[open, close])
                this.price.push(...[hight, low])
            })
            // avgPrice
            _.forEach(this.states, (state, stateKey) => {
                _.forEach(state, (direction, directionKey) => {
                    if (directionKey != 'avg') {
                        this.states[stateKey][directionKey].price.high = _.max(
                            this.states[stateKey][directionKey].price.list
                        )
                        this.states[stateKey][directionKey].price.low = _.min(
                            this.states[stateKey][directionKey].price.list
                        )
                        this.states[stateKey][directionKey].price.avg = this.getAvg([
                            this.states[stateKey][directionKey].price.high,
                            this.states[stateKey][directionKey].price.low
                        ])
                    }
                })
            })
        },
        getAvg(array) {
            return _.floor(_.sum(array) / array.length, 6)
        }
    }
}
</script>

<style lang="scss">
.last-trade {
    .watch-box {
        padding: 24px;
    }

    .states-box {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        .line {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            top: -16px;
            left: -16px;
            right: -16px;
            bottom: -16px;
            z-index: 10;

            &::before,
            &::after {
                content: '';
                position: absolute;
            }

            &::before {
                left: 0;
                right: 0;
                top: 50%;
                height: 1px;
                border-top: dashed 1px #f0b90b;
            }

            &::after {
                top: 0;
                bottom: 0;
                left: 50%;
                width: 1px;
                border-left: dashed 1px #f0b90b;
            }

            .status {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 108px;
                height: 108px;
                top: 50%;
                left: 50%;
                margin: -54px 0 0 -54px;
                border-radius: 50%;
                background: #ffffff;
                z-index: 1;
                font-size: 160px;
                opacity: 0;

                i {
                    opacity: 0.2;
                }

                &.up,
                &.down {
                    opacity: 1;
                }

                &.up {
                    color: #13ce66;
                }

                &.down {
                    color: #ff4949;
                }

                &.over {
                    &.up {
                        transform: scale(-1);
                    }
                    &.down {
                        transform: scale(1, -1);
                    }
                }

                &.under {
                    &.up {
                        transform: scale(-1, 1);
                    }
                    &.down {
                        transform: scale(1);
                    }
                }
            }

            .label {
                z-index: 2;
                background: #f0b90b;
                color: #0b0e11;
                font-weight: bold;
                padding: 2px 4px;
                border-radius: 4px;
                font-size: 10px;
                opacity: 0.8;
            }
        }

        .states-inner-box {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            border-radius: 4px;
            border: 1px solid #ececec;
            overflow: hidden;

            .state-box {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: row;

                .direction-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 140px;
                    height: 140px;

                    .content {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        z-index: 20;

                        > span {
                            background: rgba(255, 255, 255, 0.6);
                            padding: 2px 4px;
                            border-radius: 4px;
                            margin: 2px 0;
                        }
                    }
                }

                &.over {
                    .down {
                        background: rgba(255, 73, 73, 0.2);
                    }

                    .avg {
                        background: linear-gradient(90deg, rgba(255, 73, 73, 0.2), rgba(19, 206, 102, 0.6));
                    }

                    .up {
                        background: rgba(19, 206, 102, 0.6);
                    }
                }

                &.between {
                    .down {
                        background: linear-gradient(-180deg, rgba(255, 73, 73, 0.2), rgba(255, 73, 73, 0.6));
                    }

                    .avg {
                        z-index: 9;

                        &::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: #fff;
                            transform: scale(1.02);
                            border-radius: 4px;
                        }
                    }

                    .up {
                        background: linear-gradient(0deg, rgba(19, 206, 102, 0.2), rgba(19, 206, 102, 0.6));
                    }
                }

                &.under {
                    .down {
                        background: rgba(255, 73, 73, 0.6);
                    }

                    .avg {
                        background: linear-gradient(90deg, rgba(255, 73, 73, 0.6), rgba(19, 206, 102, 0.2));
                    }

                    .up {
                        background: rgba(19, 206, 102, 0.2);
                    }
                }
            }
        }
    }

    .info-box {
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        flex-direction: column;
        align-self: stretch;
        flex: 1;
        padding: 16px 0;
        box-sizing: border-box;

        .item {
            margin-bottom: 8px;
        }
    }
}
</style>
