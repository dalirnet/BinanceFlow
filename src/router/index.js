import Vue from 'vue'
import VueRouter from 'vue-router'
import Config from '../views/Config.vue'
import LastTrade from '../views/LastTrade.vue'
import LastOrder from '../views/LastOrder.vue'
import MyJob from '../views/MyJob.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'config',
        component: Config
    },
    {
        path: '/lastTrade/:base/:quote',
        name: 'lastTrade',
        component: LastTrade
    },
    {
        path: '/lastOrder/:base/:quote',
        name: 'lastOrder',
        component: LastOrder
    },
    {
        path: '/myJob/:base/:quote',
        name: 'myJob',
        component: MyJob
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
