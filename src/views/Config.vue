<template>
    <div class="config">
        <div class="row at-row">
            <div class="col-md-8 col-xs-24 at-row">
                <at-card :no-hover="true">
                    <h4 slot="title">Favorite pairs</h4>
                    <div slot="extra">
                        <i class="icon icon-star primary-color"></i>
                    </div>
                    <div>
                        <div class="row at-row">
                            <div class="col">
                                <at-select v-model="baseSymbol" placeholder="Base">
                                    <at-option v-for="(symbol, index) in symbols.base" :key="index" :value="index">{{
                                        symbol.name
                                    }}</at-option>
                                </at-select>
                            </div>
                        </div>
                        <div class="row at-row">
                            <div class="col">
                                <at-select v-model="quoteSymbol" placeholder="Quote">
                                    <at-option v-for="(symbol, index) in symbols.quote" :key="index" :value="index">{{
                                        symbol.name
                                    }}</at-option>
                                </at-select>
                            </div>
                        </div>
                        <div class="flex flex-end">
                            <router-link
                                :to="{
                                    name: 'lastTrade',
                                    params: {
                                        base: $store.state.pair.base.toLowerCase(),
                                        quote: $store.state.pair.quote.toLowerCase()
                                    }
                                }"
                            >
                                <at-button type="primary" hollow>Last trade</at-button>
                            </router-link>
                            <span class="space"></span>
                            <router-link
                                :to="{
                                    name: 'lastOrder',
                                    params: {
                                        base: $store.state.pair.base.toLowerCase(),
                                        quote: $store.state.pair.quote.toLowerCase()
                                    }
                                }"
                            >
                                <at-button type="primary">Last order</at-button>
                            </router-link>
                        </div>
                    </div>
                </at-card>
            </div>
            <div class="col-md-16 col-xs-24">
                <at-card :no-hover="true">
                    <h4 slot="title">
                        <span>Api access</span>
                        <at-tag color="primary">Optional</at-tag>
                    </h4>
                    <div slot="extra">
                        <i class="icon icon-zap primary-color"></i>
                    </div>
                    <div>
                        <div class="row at-row">
                            <div class="col">
                                <at-input v-model="apiKey" placeholder="Api Key" icon="link"></at-input>
                            </div>
                        </div>
                        <div class="row at-row">
                            <div class="col">
                                <at-input v-model="apiSecret" placeholder="Api Secret" icon="lock"></at-input>
                            </div>
                        </div>
                        <div class="flex flex-end">
                            <router-link
                                :to="{
                                    name: 'myJob',
                                    params: {
                                        base: $store.state.pair.base.toLowerCase(),
                                        quote: $store.state.pair.quote.toLowerCase()
                                    }
                                }"
                            >
                                <at-button type="primary">My job</at-button>
                            </router-link>
                        </div>
                    </div>
                </at-card>
            </div>
        </div>
    </div>
</template>

<script>
import symbols from '@/symbols.json'

export default {
    data() {
        return {
            symbols
        }
    },
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
