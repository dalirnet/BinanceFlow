import _ from 'lodash'
import moment from 'moment'
import superagent from 'superagent'
import queryString from 'query-string'
import hmacSHA256 from 'crypto-js/hmac-sha256'

export default {
    data() {
        return {
            sign: superagent
        }
    },
    methods: {
        signRequest() {
            let payload = {
                symbol: 'BTCUSDT',
                timestamp: moment().valueOf(),
                recvWindow: 20000
            }
            payload.signature = hmacSHA256(queryString.stringify(payload), this.$store.state.api.secret).toString()
            console.log('key', this.$store.state.api.key)
            console.log('secret', this.$store.state.api.secret)
            console.log('payload', queryString.stringify(payload))
            // this.sign
            //     .get([this.$store.state.api.rest, 'allOrders'].join(''))
            //     .query(queryString.stringify(payload))
            //     .set('X-MBX-APIKEY', this.$store.state.api.key)
            //     .withCredentials()
            //     .then(data => {
            //         console.log('data', data)
            //     })
            //     .catch(error => {
            //         console.log('error', error)
            //     })
        }
    }
}
