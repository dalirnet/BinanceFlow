import _ from 'lodash'

export default {
    data() {
        return {
            ws: null,
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
        $route() {
            this.$store.commit('baseSymbol', this.$route.params.base)
            this.$store.commit('quoteSymbol', this.$route.params.quote)
            this.reOpenSocket()
        }
    },
    mounted() {
        this.$store.commit('baseSymbol', this.$route.params.base)
        this.$store.commit('quoteSymbol', this.$route.params.quote)
        this.reset()
        setTimeout(() => {
            // this.toggle()
        }, 1000)
    },
    methods: {
        betterNumber(input) {
            let [intValue = '0', floatValue = '00'] = _.split(input, '.')
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
        toggle() {
            if (!this.loading) {
                if (this.connected) {
                    this.closeSocket()
                } else {
                    this.openSocket()
                }
            }
            this.loading = true
        },
        openSocket() {
            this.ws = new WebSocket([this.$store.state.ws, 'stream?streams=', this.streamName].join(''))
            this.ws.addEventListener('open', () => {
                this.loading = false
                this.connected = true
                if (this.reset) {
                    this.reset()
                }
            })
            this.ws.addEventListener('message', ({ data }) => {
                if (this.listenOnSocket) {
                    this.listenOnSocket(JSON.parse(data))
                }
            })
            this.ws.addEventListener('error', e => {
                this.ws.close()
                console.log(e)
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
