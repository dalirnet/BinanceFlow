<template>
    <div class="last-trade">
        <div class="row at-row">
            <div class="col-24">
                <at-card :no-hover="true">
                    <h4 slot="title">
                        <span>Last trade</span>
                        <at-tag :color="loading ? 'info' : connected ? 'success' : 'error'" @click.native="toggle">{{
                            loading ? 'loading' : connected ? 'Connect' : 'Disconect'
                        }}</at-tag>
                    </h4>
                    <div slot="extra">
                        <at-button
                            :icon="connected ? 'icon-wifi' : 'icon-wifi-off'"
                            :class="loading ? 'info-color' : connected ? 'success-color' : 'error-color'"
                            size="smaller"
                            :disabled="loading"
                            @click.native="toggle"
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
import socketMixin from '@/mixins/socket'

export default {
    mixins: [socketMixin],
    data() {
        return {
            history: {}
        }
    },
    computed: {
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@kline_1m'].join('')
        }
    },
    methods: {
        reset() {
            this.history = {}
        },
        listenOnSocket({
            data: {
                k: {
                    t: startTime,
                    T: closeTime,
                    o: open,
                    c: close,
                    h: high,
                    l: low,
                    n: trade,
                    v: mainAssets,
                    V: takerAssets,
                    makerAssets = 0
                }
            }
        }) {
            // init
            open = _.floor(_.toNumber(open), 6)
            close = _.floor(_.toNumber(close), 6)
            high = _.floor(_.toNumber(high), 6)
            low = _.floor(_.toNumber(low), 6)
            mainAssets = _.floor(_.toNumber(mainAssets), 6)
            takerAssets = _.floor(_.toNumber(takerAssets), 6)
            makerAssets = _.floor(mainAssets - takerAssets, 6)
            // start
            this.history[startTime + '-' + closeTime] = {
                open,
                close,
                high,
                low,
                trade,
                takerAssets,
                makerAssets
            }
            console.log(this.history)
        }
    }
}
</script>
