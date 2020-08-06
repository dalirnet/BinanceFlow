<template>
    <div>
        <at-button
            :icon="connected ? 'icon-wifi' : 'icon-wifi-off'"
            :class="loading ? 'info-color' : connected ? 'success-color' : 'error-color'"
            size="smaller"
            :disabled="loading"
            @click.native="$emit('click')"
        ></at-button>
    </div>
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
