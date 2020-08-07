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
        signRequest(method, action, payload = {}) {
            return new Promise(resolve => {
                payload = {
                    timestamp: moment().valueOf(),
                    recvWindow: 5000,
                    ...payload
                }
                payload.signature = hmacSHA256(queryString.stringify(payload), this.$store.state.api.secret).toString()
                this.sign
                    .post('http://localhost:9550/bridge/')
                    .send({
                        method,
                        url: [this.$store.state.api.rest, action].join(''),
                        query: queryString.stringify(payload),
                        header: {
                            'X-MBX-APIKEY': this.$store.state.api.key
                        }
                    })
                    .then(({ body = {} }) => {
                        resolve({ status: true, body })
                    })
                    .catch(({ body = {} }) => {
                        resolve({ status: false, body })
                    })
            })
        }
    }
}
