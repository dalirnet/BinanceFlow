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
                    recvWindow: 10000,
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
                    .then(({ body: { data = {}, header = {} } = {} }) => {
                        this.$Notify({
                            title: 'Resolve',
                            type: 'success',
                            message: [
                                'Method : ' + method,
                                'Path : ' + action,
                                'Used weight : ' + _.get(header, 'x-mbx-used-weight', 0)
                            ].join('\n'),
                            duration: 6000
                        })
                        resolve({ status: true, data, header })
                    })
                    .catch(({ body: { data = {}, header = {} } = {} }) => {
                        this.$Notify({
                            title: 'Reject',
                            type: 'error',
                            message: 'Path : ' + action,
                            duration: 12000
                        })
                        resolve({ status: false, data, header })
                    })
            })
        }
    }
}
