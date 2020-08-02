import Vue from 'vue'
import VueRouter from 'vue-router'
import Config from '../views/Config.vue'
import Analytics from '../views/Analytics.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'config',
        component: Config
    },
    {
        path: '/analytics',
        name: 'analytics',
        component: Analytics
    }
]

const router = new VueRouter({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
})

export default router
