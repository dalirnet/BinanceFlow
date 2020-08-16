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
            chain: lockr.get('botChain', {}),
            vwap: lockr.get('botVwap', {}),
            timefream: lockr.get('botTimefream', {})
        },
        symbols: {
            base: {
                BTC: { name: 'Bitcoin', step: 0.000001 },
                ETH: { name: 'Ethereum', step: 0.00001 },
                XRP: { name: 'Ripple', step: 0.1 },
                ADA: { name: 'Cardano', step: 0.1 },
                LTC: { name: 'Litecoin', step: 0.00001 },
                VET: { name: 'VeChain', step: 1 },
                BAND: { name: 'Band', step: 0.01 },
                ATOM: { name: 'Cosmos', step: 0.001 },
                LINK: { name: 'ChainLink', step: 0.01 },
                BNB: { name: 'BinanceCoin', step: 0.01 }
            },
            quote: {
                USDT: { name: 'Tether' },
                BUSD: { name: 'BinanceUSD' }
            }
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
        botChain(state) {
            return _.get(state.bot.chain, [state.pair.base, state.pair.quote].join(''), {
                upToDown: 1,
                downToUp: 1
            })
        },
        botVwap(state) {
            return _.get(state.bot.vwap, [state.pair.base, state.pair.quote].join(''), 10)
        },
        botTimefream(state) {
            return _.get(state.bot.timefream, [state.pair.base, state.pair.quote].join(''), '1m')
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
        botChain(state, value = { upToDown: 1, downToUp: 1 }) {
            state.bot.chain[[state.pair.base, state.pair.quote].join('')] = value
            lockr.set('botChain', state.bot.chain)
        },
        botVwap(state, value = null) {
            state.bot.vwap[[state.pair.base, state.pair.quote].join('')] = value
            lockr.set('botVwap', state.bot.vwap)
        },
        botTimefream(state, value = null) {
            state.bot.timefream[[state.pair.base, state.pair.quote].join('')] = value
            lockr.set('botTimefream', state.bot.timefream)
        }
    },
    actions: {
        pairSymbol(context, { base = null, quote = null }) {
            if (
                _.includes(_.keys(context.state.symbols.base), _.toUpper(base)) &&
                _.includes(_.keys(context.state.symbols.quote), _.toUpper(quote))
            ) {
                context.commit('baseSymbol', base)
                context.commit('quoteSymbol', quote)
                return Promise.resolve()
            } else {
                return Promise.reject()
            }
        }
    }
})
