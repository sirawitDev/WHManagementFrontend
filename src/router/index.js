import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../pages/LoginView.vue'
import RegisterView from '../pages/RegisterView.vue'
import HomeView from '../pages/HomeView.vue'
import NotFound from '../pages/NotFound.vue'

import AdminDashboardView from '../pages/admins/DashboardView.vue'
import MaterialView from '../pages/admins/materials/MaterialView.vue'
import SettingView from '../pages/admins/settings/SettingView.vue'
import GoodIssuedView from '../pages/admins/reports/GoodIssuedView.vue'
import StockView from '../pages/admins/StockView.vue'
import UserManagementView from '../pages/admins/users/UserManagementView.vue'

import DashboardViewChecker from '../pages/checker/DashboardView.vue'
import GoodIssuedCheckerView from '../pages/checker/reports/GoodIssuedCheckerView.vue'
import MaterialCheckerView from '../pages/checker/material/MaterialCheckerView.vue'

const routes = [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/home', component: HomeView },

    // Admin routes
    {
        path: '/admin',
        component: AdminDashboardView,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/materials',
        component: MaterialView,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/settings',
        component: SettingView,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/reports/goods-issue',
        component: GoodIssuedView,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/reports/stock',
        component: StockView,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/users',
        component: UserManagementView,
        meta: { requiresAuth: true, role: 'admin' }
    },

    // Checker routes
    {
        path: '/checker/dashboard',
        component: DashboardViewChecker,
        meta: { requiresAuth: true, role: 'checker' }
    },
    {
        path: '/checker/good-issue',
        component: GoodIssuedCheckerView,
        meta: { requiresAuth: true, role: 'checker' }
    },
    {
        path: '/checker/materials',
        component: MaterialCheckerView,
        meta: { requiresAuth: true, role: 'checker' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const isAuthenticated = authStore.user

    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            next('/login')
        } else if (to.meta.role && authStore.user.role !== to.meta.role) {
            next('/home')
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router