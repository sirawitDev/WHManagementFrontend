import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../pages/LoginView.vue'
import RegisterView from '../pages/RegisterView.vue'
import HomeView from '../pages/HomeView.vue'

const routes = [
    { path: '/', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/home', component: HomeView },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router