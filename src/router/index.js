import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../pages/LoginView.vue'
import RegisterView from '../pages/RegisterView.vue'
import HomeView from '../pages/HomeView.vue'
import AdminDashboardView from '../pages/admins/DashboardView.vue'
import MaterialView from '../pages/admins/materials/MaterialView.vue'
import SettingView from '../pages/admins/settings/SettingView.vue'

const routes = [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/home', component: HomeView },
    { path: '/admin', component: AdminDashboardView },
    { path: '/materials', component: MaterialView },
    { path: '/settings', component: SettingView },

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router