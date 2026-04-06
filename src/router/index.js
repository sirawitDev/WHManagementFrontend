import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../pages/LoginView.vue'
import RegisterView from '../pages/RegisterView.vue'
import HomeView from '../pages/HomeView.vue'
import AdminDashboardView from '../pages/admins/DashboardView.vue'
import MaterialView from '../pages/admins/materials/MaterialView.vue'
import SettingView from '../pages/admins/settings/SettingView.vue'
import GoodIssuedView from '../pages/admins/reports/GoodIssuedView.vue'
import StockView from '../pages/admins/StockView.vue'

import DashboardViewChecker from '../pages/checker/DashboardView.vue'
import GoodIssuedCheckerView from '../pages/checker/reports/GoodIssuedCheckerView.vue'
import MaterialCheckerView from '../pages/checker/material/MaterialCheckerView.vue'

const routes = [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/home', component: HomeView },

    //Admin
    { path: '/admin', component: AdminDashboardView },
    { path: '/materials', component: MaterialView },
    { path: '/settings', component: SettingView },
    { path: '/reports/goods-issue', component: GoodIssuedView },
    { path: '/reports/stock', component: StockView },

    //Checker
    { path: '/checker/dashboard', component: DashboardViewChecker },
    { path: '/checker/good-issue', component: GoodIssuedCheckerView },
    { path: '/checker/materials', component: MaterialCheckerView },

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router