import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        pair: {
            base: 'BTC',
            quote: 'USDT'
        },
        api: {
            rest: 'https://api.binance.com/api/v3/',
            ws: 'wss://stream.binance.com:9443/',
            key: null,
            secret: null
        }
    },
    mutations: {
        baseSymbol(state, value) {
            state.pair.base = value.toUpperCase()
        },
        quoteSymbol(state, value) {
            state.pair.quote = value.toUpperCase()
        },
        apiKey(state, value) {
            state.api.key = value
        },
        apiSecret(state, value) {
            state.api.secret = value
        }
    },
    actions: {}
})
