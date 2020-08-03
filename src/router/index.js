import Vue from 'vue'
import VueRouter from 'vue-router'
import Config from '../views/Config.vue'
import BookOrder from '../views/BookOrder.vue'
import MyJob from '../views/MyJob.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'config',
        component: Config
    },
    {
        path: '/bookOrder/:base/:quote',
        name: 'bookOrder',
        component: BookOrder
    },
    {
        path: '/myJob',
        name: 'myJob',
        component: MyJob
    }
]

const router = new VueRouter({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
})

export default router
