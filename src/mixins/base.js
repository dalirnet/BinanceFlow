import _ from 'lodash'
import superagent from 'superagent'
import symbols from '@/symbols.json'

export default {
    beforeRouteEnter(to, from, next) {
        if (
            _.includes(_.keys(symbols.base), _.toUpper(_.get(to, 'params.base', null))) &&
            _.includes(_.keys(symbols.quote), _.toUpper(_.get(to, 'params.quote', null)))
        ) {
            next()
        } else {
            next({ name: 'config' })
        }
    },
    data() {
        return {
            ws: null,
            rest: superagent,
            loading: false,
            connected: false
        }
    },
    computed: {
        baseSymbol() {
            return this.$store.state.pair.base
        },
        baseSymbolStep() {
            let [integer = null, decimal = null] = _.split(symbols.base[this.$store.state.pair.base].step, '.')
            return decimal ? decimal.length : 0
        },
        quoteSymbol() {
            return this.$store.state.pair.quote
        },
        apiKey() {
            return this.$store.state.api.key
        },
        apiSecret() {
            return this.$store.state.api.secret
        },
        currentStatus() {
            return this.connected ? (this.sumValue.buy >= this.sumValue.sell ? 'success-color' : 'error-color') : null
        }
    },
    watch: {
        loading(flag) {
            if (flag) {
                this.$Loading.start()
            } else {
                this.$Loading.finish()
            }
        },
        $route() {
            window.location.reload()
        }
    },
    created() {
        this.$store.commit('baseSymbol', _.get(this.$route, 'params.base', null))
        this.$store.commit('quoteSymbol', _.get(this.$route, 'params.quote', null))
        if (this.reset) {
            this.reset()
        }
    },
    mounted() {
        this.toggleConnection()
    },
    methods: {
        console(message) {
            console.log(message)
        },
        fixFloatNumber(input, floor = 6) {
            return Number.parseFloat(input).toFixed(floor)
        },
        betterNumber(input, floor = 6) {
            let number = this.fixFloatNumber(input, floor)
            let decimal = _.repeat('0', floor)
            let [intValue = '0', floatValue = decimal] = _.split(
                number === (floor == 0 ? '-0' : '-0.' + decimal) ? 0 : number,
                '.'
            )
            let out = ['<strong>', _.replace(intValue, /\B(?=(\d{3})+(?!\d))/g, ','), '</strong>']
            if (floor > 0) {
                out.push(...['<small>.</small>', '<small>', _.padEnd(floatValue, floor, '0'), '</small>'])
            }
            return out.join('')
        },
        toggleConnection(refresh = false) {
            if (!this.loading) {
                this.loading = true
                if (refresh) {
                    this.closeSocket()
                }
                if (!this.connected) {
                    if (this.reset) {
                        this.reset()
                    }
                    if (this.requestName) {
                        this.httpRequest()
                            .then(({ body }) => {
                                if (this.listenOnRest) {
                                    this.listenOnRest(body)
                                }
                                if (this.streamName) {
                                    this.openSocket()
                                } else {
                                    this.loading = false
                                    this.connected = true
                                }
                            })
                            .catch(e => {
                                console.log(e)
                                this.loading = false
                            })
                    } else if (this.streamName) {
                        this.openSocket()
                    }
                } else {
                    this.closeSocket()
                }
            }
        },
        httpRequest() {
            return new Promise((resolve, reject) => {
                this.rest([this.$store.state.api.rest, this.requestName].join(''))
                    .then(data => {
                        this.$Notify({
                            title: 'Request',
                            type: 'success',
                            message: ['Resolve', 'Name : ' + _.truncate(this.requestName)].join('\n'),
                            duration: 6000
                        })
                        resolve(data)
                    })
                    .catch(error => {
                        this.$Notify({
                            title: 'Request',
                            type: 'error',
                            message: ['Reject', 'Name : ' + _.truncate(this.requestName)].join('\n'),
                            duration: 12000
                        })
                        reject(error)
                    })
            })
        },
        openSocket() {
            this.ws = new WebSocket([this.$store.state.api.ws, 'stream?streams=', this.streamName].join(''))
            this.ws.addEventListener('open', () => {
                this.loading = false
                this.connected = true
                this.$Notify({
                    title: 'Socket',
                    type: 'success',
                    message: ['Already open', 'Stream : ' + this.streamName].join('\n'),
                    duration: 6000
                })
            })
            this.ws.addEventListener('message', ({ data }) => {
                if (this.connected && this.listenOnSocket) {
                    this.listenOnSocket(JSON.parse(data))
                }
            })
            this.ws.addEventListener('error', e => {
                console.log(e)
                this.ws.close()
                this.$Notify({
                    title: 'Socket',
                    type: 'error',
                    message: 'Has error occurred',
                    duration: 12000
                })
            })
            this.ws.addEventListener('close', () => {
                this.loading = false
            })
        },
        reOpenSocket() {
            this.closeSocket()
            this.openSocket()
        },
        closeSocket() {
            this.connected = false
            if (this.ws) {
                this.ws.close()
            }
        }
    },
    beforeDestroy() {
        this.closeSocket()
    }
}
