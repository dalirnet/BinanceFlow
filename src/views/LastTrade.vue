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
                    <div class="watch-header"></div>
                    <div class="watch-box">
                        <div class="states-box">
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
                                        <span>{{ direction.count }}</span>
                                        <span>{{ direction.volume }}</span>
                                        <span>{{ direction.trade }}</span>
                                        <span>{{ direction.price.high }}</span>
                                        <span>{{ direction.price.avg }}</span>
                                        <span>{{ direction.price.low }}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="watch-footer"></div>
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
            states: {}
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
                    '&interval=5m&startTime=',
                    moment()
                        .subtract(1, 'days')
                        .valueOf()
                ].join('')
            ]
        },
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@kline_1m'].join('')
        }
    },
    mounted() {
        this.reset()
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
                    hight: 0,
                    avg: 0,
                    low: 0
                }
            }
            this.states = {
                max: {
                    down: _.cloneDeep(instance),
                    avg: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                },
                mid: {
                    down: _.cloneDeep(instance),
                    avg: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                },
                min: {
                    down: _.cloneDeep(instance),
                    avg: _.cloneDeep(instance),
                    up: _.cloneDeep(instance)
                }
            }
        },
        listenOnSocket({
            data: {
                k: { t: startTime, T: closeTime, o: open, c: close, h: high, l: low, n: trade, V: volume }
            }
        }) {
            // init
            open = _.floor(_.toNumber(open), 6)
            close = _.floor(_.toNumber(close), 6)
            high = _.floor(_.toNumber(high), 6)
            low = _.floor(_.toNumber(low), 6)
            volume = _.floor(_.toNumber(volume), 6)
            // start
            this.history[startTime + '-' + closeTime] = {
                open,
                close,
                high,
                low,
                trade,
                volume
            }
            console.log(this.history)
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
                let direction = open <= close ? 'up' : 'down'
                let state = open >= avg && close >= avg ? 'max' : open <= avg && close <= avg ? 'min' : 'mid'
                this.states[state][direction].count++
                this.states[state][direction].volume += volume
                this.states[state][direction].trade += count
                this.states[state][direction].price.list.push(hight)
                this.states[state][direction].price.list.push(low)
            })

            // mid
            _.forEach(['up', 'down'], direction => {
                _.forEach(['count', 'volume', 'trade'], key => {
                    this.states.mid[direction][key] = this.getAvg([
                        this.states.min[direction][key],
                        this.states.max[direction][key]
                    ])
                })
            })

            // avgPrice
            _.forEach(this.states, (state, stateKey) => {
                _.forEach(['count', 'volume', 'trade'], key => {
                    this.states[stateKey].avg[key] = this.getAvg([
                        this.states[stateKey].down[key],
                        this.states[stateKey].up[key]
                    ])
                })
                _.forEach(state, (direction, directionKey) => {
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
                })
            })
            console.log(this.states)
        },
        getAvg(array) {
            return _.floor(_.sum(array) / array.length, 6)
        },
        getBoxPosition() {}
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
        flex-direction: column;
        border-radius: 4px;
        border: 1px solid #ececec;
        overflow: hidden;
    }

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

            &.down {
            }

            &.avg {
            }

            &.up {
            }

            .content {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                z-index: 10;
            }
        }

        &.max {
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

        &.mid {
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

        &.min {
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
</style>
