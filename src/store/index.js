import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import lockr from 'lockr'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        pair: {
            base: 'BTC',
            quote: 'USDT'
        },
        api: {
            rest: 'https://api.binance.com/',
            ws: 'wss://stream.binance.com:9443/',
            key: lockr.get('apiKey', null),
            secret: lockr.get('apiSecret', null)
        },
        bot: {
            fund: lockr.get('botFund', {}),
            profit: lockr.get('botProfit', {}),
            stoploss: lockr.get('botStoploss', {}),
            timefream: lockr.get('botTimefream', {}),
            chain: lockr.get('botChain', {})
        }
    },
    getters: {
        botFund(state) {
            return _.get(state.bot.fund, [state.pair.base, state.pair.quote].join(''), 100)
        },
        botProfit(state) {
            return _.get(state.bot.profit, [state.pair.base, state.pair.quote].join(''), 5)
        },
        botStoploss(state) {
            return _.get(state.bot.stoploss, [state.pair.base, state.pair.quote].join(''), 5)
        },
        botTimefream(state) {
            return _.get(state.bot.timefream, [state.pair.base, state.pair.quote].join(''), '1m')
        },
        botChain(state) {
            return _.get(state.bot.chain, [state.pair.base, state.pair.quote].join(''), {
                upToDown: 1,
                downToUp: 1
            })
        }
    },
    mutations: {
        baseSymbol(state, value) {
            state.pair.base = _.toUpper(value)
        },
        quoteSymbol(state, value) {
            state.pair.quote = _.toUpper(value)
        },
        apiKey(state, value) {
            state.api.key = value
            lockr.set('apiKey', value)
        },
        apiSecret(state, value) {
            state.api.secret = value
            lockr.set('apiSecret', value)
        },
        botFund(state, value = null) {
            state.bot.fund[[state.pair.base, state.pair.quote].join('')] = value
            lockr.set('botFund', state.bot.fund)
        },
        botProfit(state, value = null) {
            state.bot.profit[[state.pair.base, state.pair.quote].join('')] = value
            lockr.set('botProfit', state.bot.profit)
        },
        botStoploss(state, value = null) {
            state.bot.stoploss[[state.pair.base, state.pair.quote].join('')] = value
            lockr.set('botStoploss', state.bot.stoploss)
        },
        botTimefream(state, value = null) {
            state.bot.timefream[[state.pair.base, state.pair.quote].join('')] = value
            lockr.set('botTimefream', state.bot.timefream)
        },
        botChain(state, value = { upToDown: 1, downToUp: 1 }) {
            state.bot.chain[[state.pair.base, state.pair.quote].join('')] = value
            lockr.set('botChain', state.bot.chain)
        }
    },
    actions: {}
})
