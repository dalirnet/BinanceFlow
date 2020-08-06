<template>
    <div class="my-job">
        <div class="row at-row">
            <div class="col-24">
                <at-card :no-hover="true">
                    <ConnectionCardHeaderTitle
                        slot="title"
                        title="My job"
                        :loading="loading"
                        :connected="connected"
                        @click="toggleConnection"
                    />
                    <ConnectionCardHeaderExtra
                        slot="extra"
                        :loading="loading"
                        :connected="connected"
                        @click="toggleConnection"
                    />
                    <div class="watch-header"></div>
                    <div class="watch-box"></div>
                    <div class="watch-footer"></div>
                </at-card>
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import connectionMixin from '@/mixins/connection'
import ConnectionCardHeaderTitle from '@/components/ConnectionCardHeaderTitle'
import ConnectionCardHeaderExtra from '@/components/ConnectionCardHeaderExtra'

export default {
    mixins: [connectionMixin],
    components: { ConnectionCardHeaderTitle, ConnectionCardHeaderExtra },
    data() {
        return {
            history: {}
        }
    },
    computed: {
        streamName() {
            return [_.toLower(this.baseSymbol), _.toLower(this.quoteSymbol), '@ticker'].join('')
        }
    },
    methods: {
        reset() {
            this.history = {}
        },
        listenOnSocket({ data }) {
            console.log(data)
        }
    }
}
</script>

<style lang="scss">
.my-job {
}
</style>
