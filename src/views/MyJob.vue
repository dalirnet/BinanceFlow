<template>
    <div class="config">
        <div class="row at-row"></div>
    </div>
</template>

<script>
export default {
    computed: {
        baseSymbol: {
            get() {
                return this.$store.state.pair.base
            },
            set(value) {
                this.$store.commit('baseSymbol', value)
            }
        },
        quoteSymbol: {
            get() {
                return this.$store.state.pair.quote
            },
            set(value) {
                this.$store.commit('quoteSymbol', value)
            }
        },
        apiKey: {
            get() {
                return this.$store.state.api.key
            },
            set(value) {
                this.$store.commit('apiKey', value)
            }
        },
        apiSecret: {
            get() {
                return this.$store.state.api.secret
            },
            set(value) {
                this.$store.commit('apiSecret', value)
            }
        }
    }
}
</script>
