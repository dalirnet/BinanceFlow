<template>
    <h4>
        <span>{{ title }}</span>
        <at-tag :color="loading ? 'info' : connected ? 'success' : 'error'" @click.native="$emit('click')">
            <span>{{ loading ? 'loading' : connected ? 'Connect' : 'Disconect' }}</span>
        </at-tag>
    </h4>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: null
        },
        loading: {
            type: Boolean,
            default: false
        },
        connected: {
            type: Boolean,
            default: false
        }
    }
}
</script>
