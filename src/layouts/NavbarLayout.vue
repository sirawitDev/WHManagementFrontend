<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()

const showAside = ref(false)
const showUserMenu = ref(false)

const toggleAside = () => {
    showAside.value = !showAside.value
}

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
}

onMounted(() => {
    console.log('isAuthenticated : ', authStore.isAuthenticated)
})
</script>

<template>
    <div class="">
        <!-- Backdrop for aside -->
        <transition name="fade">
            <div v-if="showAside" class="fixed inset-0 bg-black bg-opacity-30 z-30" @click="showAside = false"></div>
        </transition>

        <!-- Sidebar Menu -->
        <transition name="slide">
            <aside v-if="showAside" class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col">
                <div class="flex items-center justify-between px-4 py-4 border-b">

                    <div class="flex justify-center w-full">
                        <img src="../assets/img/CNLOGO2.png" alt="" class=" w-[96px] h-[96px]">
                    </div>

                    <button @click="showAside = false" class="text-gray-500 hover:text-green-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav class="flex-1 p-4 space-y-2">
                    <a href="/home"
                        class="block px-3 py-2 rounded-lg hover:bg-green-50 text-green-700 font-medium transition-colors">หน้าแรก</a>
                </nav>
            </aside>
        </transition>

        <!-- Navbar -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white border-2 shadow-md rounded-xl mt-3 sticky top-0 z-20">
                <div class="flex items-center justify-between px-4 py-3">
                    <!-- Left section - Menu button -->
                    <div class="flex items-center gap-2">
                        <button @click="toggleAside"
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="h-5 w-5 stroke-current stroke-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        <div class="">
                            <a href="/"
                                class="text-xl font-bold text-green-700 hover:text-emerald-800 transition-colors">
                                Warehouse
                            </a>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <div v-if="authStore.isAuthenticated === false" class="flex gap-2">
                            <div>
                                <RouterLink to="/login"
                                    class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors cursor-pointer">
                                    เข้าสู่ระบบจัดการ
                                </RouterLink>
                            </div>
                        </div>
                        <div v-else class="relative">
                            <button @click="toggleUserMenu"
                                class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                    <img alt="User avatar"
                                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                        class="w-full h-full object-cover" />
                                </div>
                            </button>

                            <!-- Dropdown menu -->
                            <div v-if="showUserMenu"
                                class="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border z-30 py-1">
                                <a href="/profile"
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                    Profile
                                    <span
                                        class="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">New</span>
                                </a>
                                <a href="/settings"
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                    Settings
                                </a>
                                <hr class="my-1">
                                <button @click="authStore.logout()"
                                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <main class="py-8">
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>
/* Fade transition for backdrop */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Slide transition for sidebar */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
}
</style>