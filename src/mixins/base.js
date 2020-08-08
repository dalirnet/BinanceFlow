import _ from 'lodash'
import superagent from 'superagent'

export default {
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
        if (this.reset) {
            this.reset()
        }
    },
    mounted() {
        this.$store.commit('baseSymbol', _.get(this.$route, 'params.base', ''))
        this.$store.commit('quoteSymbol', _.get(this.$route, 'params.quote', ''))
        // this.toggleConnection()
    },
    methods: {
        betterNumber(input) {
            let [intValue = '0', floatValue = '00'] = _.split(Number.parseFloat(input).toFixed(6), '.')
            return [
                '<strong>',
                _.replace(intValue, /\B(?=(\d{3})+(?!\d))/g, ','),
                '</strong>',
                '<small>.</small>',
                '<small>',
                _.padEnd(floatValue, 6, '0'),
                '</small>'
            ].join('')
        },
        toggleConnection() {
            if (!this.loading) {
                this.loading = true
                if (this.connected) {
                    this.closeSocket()
                } else {
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
                                }
                            })
                            .catch(e => {
                                console.log(e)
                                this.loading = false
                            })
                    } else if (this.streamName) {
                        this.openSocket()
                    }
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
                if (this.listenOnSocket) {
                    this.listenOnSocket(JSON.parse(data))
                }
            })
            this.ws.addEventListener('error', e => {
                this.ws.close()
                console.log(e)
                this.$Notify({
                    title: 'Socket',
                    type: 'error',
                    message: 'Has error occurred',
                    duration: 12000
                })
            })
            this.ws.addEventListener('close', () => {
                this.loading = false
                this.connected = false
            })
        },
        reOpenSocket() {
            this.closeSocket()
            this.openSocket()
        },
        closeSocket() {
            if (this.ws) {
                this.ws.close()
            }
        }
    },
    beforeDestroy() {
        this.closeSocket()
    }
}
