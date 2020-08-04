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
                    <div class="watch-box">-</div>
                    <div class="watch-footer"></div>
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
            history: {}
        }
    },
    computed: {
        requestName() {
            return ['klines?symbol=', this.baseSymbol, this.quoteSymbol, '&interval=5m&startTime=1596137400000'].join(
                ''
            )
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
            this.history = {}
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
        listenOnRest(data) {
            console.log('data', data)
        }
    }
}
</script>
