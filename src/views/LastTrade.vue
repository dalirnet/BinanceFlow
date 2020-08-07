<template>
    <div class="last-trade">
        <div class="row at-row">
            <div class="col-24">
                <at-card :no-hover="true">
                    <ConnectionCardHeaderTitle
                        slot="title"
                        title="Last trade"
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
                    <div class="watch-box">
                        <div class="states-box">
                            <div class="states-inner-box">
                                <div
                                    v-for="(state, stateKey) in states"
                                    class="state-box"
                                    :class="stateKey"
                                    :key="stateKey"
                                >
                                    <div class="direction-box up">
                                        <span class="content">
                                            <span class="item">
                                                <span class="success-color" v-html="betterNumber(state.up.max)"></span>
                                                <br />
                                                <span class="error-color" v-html="betterNumber(state.up.min)"></span>
                                            </span>
                                            <strong class="item">{{ state.up.percent }}<small>%</small></strong>
                                        </span>
                                    </div>
                                    <div class="direction-box boxSpace">
                                        <span class="content"></span>
                                    </div>
                                    <div class="direction-box down">
                                        <span class="content">
                                            <span class="item">
                                                <span
                                                    class="success-color"
                                                    v-html="betterNumber(state.down.max)"
                                                ></span>
                                                <br />
                                                <span class="error-color" v-html="betterNumber(state.down.min)"></span>
                                            </span>
                                            <strong class="item">{{ state.down.percent }}<small>%</small></strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="line">
                                <div class="status" :class="status">
                                    <i class="icon icon-arrow-down-left"></i>
                                </div>
                                <span class="label">
                                    <span>Insight !</span>
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
                                <strong class="info-color">{{ startTime.startOf('minute').format('HH:mm:ss') }}</strong>
                                <span class="space"></span>
                                <small class="info-color">({{ startTime.format('MMM D') }})</small>
                            </span>
                            <span class="item">
                                <strong>To</strong>
                                <span class="space"></span>
                                <strong class="success-color">{{ lastTimefream.format('HH:mm:ss') }}</strong>
                                <span class="space"></span>
                                <small class="success-color">({{ lastTimefream.format('MMM D') }})</small>
                            </span>
                            <hr />
                            <span class="item">
                                <strong>Current price</strong>
                                <span class="space"></span>
                                <span
                                    :class="price.current >= price.avg ? 'success-color' : 'error-color'"
                                    v-html="betterNumber(price.current)"
                                ></span>
                            </span>
                            <span class="item">
                                <strong>Avg price</strong>
                                <span class="space"></span>
                                <span class="primary-color" v-html="betterNumber(price.avg)"></span>
                            </span>
                            <hr />
                            <span class="item">
                                <strong>High price</strong>
                                <span class="space"></span>
                                <span class="success-color" v-html="betterNumber(highPrice)"></span>
                            </span>
                            <span class="item">
                                <strong>Low price</strong>
                                <span class="space"></span>
                                <span class="error-color" v-html="betterNumber(lowPrice)"></span>
                            </span>
                            <hr />
                            <span class="item">
                                <strong>Over state</strong>
                                <span class="space"></span>
                                <span class="success-color">{{ cubic.over }}<small>%</small></span>
                            </span>
                            <span class="item">
                                <strong>Under State</strong>
                                <span class="space"></span>
                                <span class="error-color">{{ cubic.under }}<small>%</small></span>
                            </span>
                            <span class="item">
                                <strong>Up state</strong>
                                <span class="space"></span>
                                <span class="success-color">{{ cubic.up }}<small>%</small></span>
                            </span>
                            <span class="item">
                                <strong>Down state</strong>
                                <span class="space"></span>
                                <span class="error-color">{{ cubic.down }}<small>%</small></span>
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
import baseMixin from '@/mixins/base'
import ConnectionCardHeaderTitle from '@/components/ConnectionCardHeaderTitle'
import ConnectionCardHeaderExtra from '@/components/ConnectionCardHeaderExtra'

export default {
    mixins: [baseMixin],
    components: { ConnectionCardHeaderTitle, ConnectionCardHeaderExtra },
    data() {
        return {
            timefream: '1m',
            vwapLength: 15,
            vwapKey: 'close',
            startTime: moment()
                .subtract(12, 'hours')
                .subtract(1, 'minutes'),
            lastTimefream: moment()
                .subtract(1, 'minutes')
                .endOf('minute'),
            statesKeep: [],
            vmwapKeep: [],
            price: {
                current: 0,
                avg: 0
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
                this.timefream,
                '&limit=1000',
                '&startTime=',
                this.startTime.valueOf()
            ].join('')
        },
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@kline_', this.timefream].join('')
        },
        states() {
            let instance = {
                percent: 0,
                volume: 0,
                trade: 0,
                max: 0,
                min: 0
            }
            let states = {
                over: {
                    down: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                },
                between: {
                    down: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                },
                under: {
                    down: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                }
            }
            let sumVolume = 0

            _.forEach(this.statesKeep, (timefream, key) => {
                let moveAvg = _.map(_.range(this.vwapLength + 1), index => [
                    _.get(this.statesKeep, key + index, timefream)[this.vwapKey],
                    _.get(this.statesKeep, key + index, timefream).volume
                ])
                let sumMoveAvgVolume = _.sum(_.map(moveAvg, 1))
                let vwap = _.sum(_.map(moveAvg, ([price, weight]) => (price * weight) / sumMoveAvgVolume))
                let min = _.min([timefream.open, timefream.close])
                let max = _.max([timefream.open, timefream.close])
                let state =
                    timefream.open >= vwap && timefream.close >= vwap
                        ? 'over'
                        : timefream.open <= vwap && timefream.close <= vwap
                        ? 'under'
                        : 'between'
                let direction = timefream.open <= timefream.close ? 'up' : 'down'
                states[state][direction].volume += timefream.volume
                states[state][direction].trade += timefream.trade
                if (states[state][direction].max === 0 || states[state][direction].max < max) {
                    states[state][direction].max = max
                }
                if (states[state][direction].min === 0 || states[state][direction].min > min) {
                    states[state][direction].min = min
                }
                if (key === 0) {
                    this.price.avg = _.floor(vwap, 6)
                    this.lastTimefream = moment(timefream.to)
                }
                sumVolume += timefream.volume
            })
            _.forEach(states, (state, stateKey) => {
                _.forEach(state, (direction, directionKey) => {
                    states[stateKey][directionKey].percent = direction.volume
                        ? _.floor((direction.volume * 100) / sumVolume, 2)
                        : 0
                })
            })
            return states
        },
        cubic() {
            return {
                over: _.floor(_.sum(_.map(this.states.over, 'percent')), 2),
                under: _.floor(_.sum(_.map(this.states.under, 'percent')), 2),
                up: _.floor(
                    _.sum([this.states.over.up.percent, this.states.between.up.percent, this.states.under.up.percent]),
                    2
                ),
                down: _.floor(
                    _.sum([
                        this.states.over.down.percent,
                        this.states.between.down.percent,
                        this.states.under.down.percent
                    ]),
                    2
                )
            }
        },
        status() {
            return [
                this.cubic.over > this.cubic.under ? 'under' : 'over',
                this.cubic.up > this.cubic.down ? 'down' : 'up'
            ]
        },
        lowPrice() {
            return _.min(_.map([this.states.over.down.min, this.states.between.down.min, this.states.under.down.min]))
        },
        highPrice() {
            return _.max(_.map([this.states.over.up.max, this.states.between.up.max, this.states.under.up.max]))
        }
    },
    methods: {
        reset() {
            this.statesKeep = []
            this.vmwapKeep = []
            this.price = {
                current: 0,
                avg: 0
            }
        },
        listenOnSocket({ data: { k: timefream } }) {
            this.price.current = _.floor(_.toNumber(timefream[this.vwapKey.charAt(0)]), 6)
            if (timefream.x) {
                this.statesKeep.unshift(
                    this.newState(
                        timefream.o,
                        timefream.h,
                        timefream.l,
                        timefream.c,
                        timefream.V,
                        timefream.n,
                        timefream.t,
                        timefream.T
                    )
                )
            }
        },
        listenOnRest(data) {
            _.forEach(_.tail(_.reverse(data)), row => {
                this.statesKeep.push(this.newState(row[1], row[2], row[3], row[4], row[5], row[8], row[0], row[6]))
            })
        },
        newState(open, hight, low, close, volume, trade, from, to) {
            open = _.floor(_.toNumber(open), 6)
            hight = _.floor(_.toNumber(hight), 6)
            low = _.floor(_.toNumber(low), 6)
            close = _.floor(_.toNumber(close), 6)
            volume = _.floor(_.toNumber(volume), 6)
            return {
                from,
                to,
                open,
                hight,
                low,
                close,
                volume,
                trade,
                price: {
                    high: open > close ? open : close,
                    low: open < close ? open : close
                }
            }
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
                flex-direction: row-reverse;

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

                        .item {
                            background: rgba(255, 255, 255, 0.9);
                            padding: 2px 6px;
                            border-radius: 4px;
                            margin: 2px 0;
                            align-self: stretch;
                            text-align: center;
                        }
                    }
                }

                &.over {
                    .down {
                        background: rgba(255, 73, 73, 0.2);
                    }

                    .boxSpace {
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

                    .boxSpace {
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

                    .boxSpace {
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
