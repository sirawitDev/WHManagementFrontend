<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { RouterLink } from 'vue-router'
import { LayoutDashboard, Boxes, FileBarChart2, Settings, PackageSearch, LogIn, User } from 'lucide-vue-next'
const authStore = useAuthStore()

const showAside = ref(false)
const showUserMenu = ref(false)
const isMobile = ref(false)
const userMenuRef = ref(null)
const showReportsMenu = ref(false)
const reportsMenuRef = ref(null)

const toggleAside = () => {
    showAside.value = !showAside.value
}

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
}

const toggleReportsMenu = () => {
    showReportsMenu.value = !showReportsMenu.value
}

const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 768
}

// ฟังก์ชันตรวจจับคลิกนอกเมนู
const handleClickOutside = (event) => {
    if (
        showUserMenu.value &&
        userMenuRef.value &&
        !userMenuRef.value.contains(event.target)
    ) {
        showUserMenu.value = false
    }
    if (
        showReportsMenu.value &&
        reportsMenuRef.value &&
        !reportsMenuRef.value.contains(event.target)
    ) {
        showReportsMenu.value = false
    }
}

onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
    document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
    <div class="flex">
        <aside v-if="!isMobile" class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col z-10">
            <div class="flex items-center justify-between px-4 py-4 border-b">
                <div class="flex justify-center w-full">
                    <img src="../assets/img/CNLOGO2.png" alt="" class="w-[96px] h-[96px]">
                </div>
            </div>
            <nav class="flex-1 p-4 space-y-2">
                <RouterLink to="/checker/dashboard"
                    class="block cursor-pointer w-full px-3 py-2 rounded-lg hover:bg-green-100 text-green-700 font-medium transition-colors border-2 border-green-700">
                    <span class="flex items-center gap-2">
                        <LayoutDashboard class="w-5 h-5" />
                        <p>Dashboard</p>
                    </span>
                </RouterLink>

                <RouterLink to="/checker/materials"
                    class="block cursor-pointer w-full px-3 py-2 rounded-lg hover:bg-green-100 text-green-700 font-medium transition-colors border-2 border-green-700">
                    <span class="flex items-center gap-2">
                        <Boxes class="w-5 h-5" />
                        <p>Materials</p>
                    </span>
                </RouterLink>

                <!-- <RouterLink to="/reports/stock" class="block cursor-pointer w-full px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] font-medium transition-colors border-2 border-green-600">
                    <span class="flex items-center gap-2">
                        <PackageSearch class="w-5 h-5" />
                        <p>รายงาน Stock</p>
                    </span>
                </RouterLink> -->

                <!-- <div class="relative" ref="reportsMenuRef">
                    <button 
                        @click="toggleReportsMenu"
                        class="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] font-medium transition-colors border-2 border-[#14158C]"
                    >
                        <span class="flex items-center gap-2">
                            <FileBarChart2 class="w-5 h-5" />
                            <span>รายงานสินค้าในคลัง</span>
                        </span>
                        <svg 
                            :class="['w-4 h-4 transition-transform duration-200', showReportsMenu ? 'rotate-180' : '']"
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    <div 
                        v-if="showReportsMenu"
                        class="mt-1 ml-4 space-y-1 overflow-hidden transition-all duration-200"
                    >
                        <RouterLink 
                            to="/reports/goods-receipt" 
                            class="block px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] text-sm transition-colors flex items-center gap-2"
                        >
                            <FileBarChart2 class="w-4 h-4" />
                            Goods Receipt
                        </RouterLink>
                        <RouterLink 
                            to="/reports/goods-issue" 
                            class="block px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] text-sm transition-colors flex items-center gap-2"
                        >
                            <FileBarChart2 class="w-4 h-4" />
                            Goods Issue
                        </RouterLink>
                        <RouterLink 
                            to="/reports/inventory-transfer" 
                            class="block px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] text-sm transition-colors flex items-center gap-2"
                        >
                            <FileBarChart2 class="w-4 h-4" />
                            Inventory Transfer
                        </RouterLink>
                    </div>
                </div> -->

                <RouterLink to="/checker/good-issue"
                    class="block cursor-pointer w-full px-3 py-2 rounded-lg hover:bg-green-100 text-green-700 font-medium transition-colors border-2 border-green-700">
                    <span class="flex items-center gap-2">
                        <FileBarChart2 class="w-5 h-5" />
                        <p>GoodIssue</p>
                    </span>
                </RouterLink>
            </nav>
        </aside>

        <div v-if="isMobile">
            <transition name="fade">
                <div v-if="showAside" class="fixed inset-0 bg-black bg-opacity-30 z-30" @click="showAside = false">
                </div>
            </transition>

            <transition name="slide">
                <aside v-if="showAside" class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col">
                    <div class="flex items-center justify-between px-4 py-4 border-b">
                        <div class="flex justify-center w-full">
                            <img src="../assets/img/CNLOGO2.png" alt="" class="w-[96px] h-[96px]">
                        </div>
                        <button @click="showAside = false" class="text-gray-500 hover:text-green-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav class="flex-1 p-4 space-y-2">
                        <RouterLink to="/checker/dashboard"
                            class="block px-3 py-2 rounded-lg hover:bg-green-100 text-green-700 font-medium transition-colors">
                            <span class="flex items-center gap-2">
                                <LayoutDashboard class="w-5 h-5" />
                                Dashboard
                            </span>
                        </RouterLink>

                        <RouterLink to="/checker/materials"
                            class="block px-3 py-2 rounded-lg hover:bg-green-100 text-green-700 font-medium transition-colors">
                            <span class="flex items-center gap-2">
                                <Boxes class="w-5 h-5" />
                                Materials
                            </span>
                        </RouterLink>

                        <!-- Mobile Reports Dropdown -->
                        <!-- <div class="relative">
                            <button 
                                @click="toggleReportsMenu"
                                class="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] font-medium transition-colors"
                            >
                                <span class="flex items-center gap-2">
                                    <FileBarChart2 class="w-5 h-5" />
                                    <span>รายงานสินค้าในคลัง</span>
                                </span>
                                <svg 
                                    :class="['w-4 h-4 transition-transform duration-200', showReportsMenu ? 'rotate-180' : '']"
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            <div 
                                v-if="showReportsMenu"
                                class="mt-1 ml-4 space-y-1 overflow-hidden"
                            >
                                <RouterLink 
                                    to="/reports/goods-receipt" 
                                    class="block px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] text-sm transition-colors flex items-center gap-2"
                                    @click="showAside = false"
                                >
                                    <FileBarChart2 class="w-4 h-4" />
                                    Goods Receipt
                                </RouterLink>
                                <RouterLink 
                                    to="/reports/goods-issue" 
                                    class="block px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] text-sm transition-colors flex items-center gap-2"
                                    @click="showAside = false"
                                >
                                    <FileBarChart2 class="w-4 h-4" />
                                    Goods Issue
                                </RouterLink>
                                <RouterLink 
                                    to="/reports/inventory-transfer" 
                                    class="block px-3 py-2 rounded-lg hover:bg-[#DDE0FF] text-[#14158C] text-sm transition-colors flex items-center gap-2"
                                    @click="showAside = false"
                                >
                                    <FileBarChart2 class="w-4 h-4" />
                                    Inventory Transfer
                                </RouterLink>
                            </div>
                        </div> -->

                        <RouterLink to="/checker/good-issue"
                            class="block px-3 py-2 rounded-lg hover:bg-green-100 text-green-700 font-medium transition-colors">
                            <span class="flex items-center gap-2">
                                <Settings class="w-5 h-5" />
                                GoodIssue
                            </span>
                        </RouterLink>
                    </nav>
                </aside>
            </transition>
        </div>

        <div :class="[!isMobile ? 'ml-64' : 'ml-0', 'flex-1']">
            <!-- Navbar -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="bg-white border-2 shadow-sm rounded-lg mt-3 sticky top-0 z-20">
                    <div class="flex items-center justify-between px-4 py-3">
                        <!-- Left section - Menu button (mobile only) -->
                        <div class="flex items-center gap-2">
                            <button v-if="isMobile" @click="toggleAside"
                                class="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-700">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    class="h-5 w-5 stroke-current stroke-2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16">
                                    </path>
                                </svg>
                            </button>

                            <div class="">
                                <a href="/checker/dashboard"
                                    class="text-xl font-bold text-green-700 hover:text-green-800 transition-colors">
                                    Checker Management
                                </a>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <RouterLink to="/checker/dashboard" v-if="authStore.user.role === 'checker'"
                                class="inline-flex mr-5 items-center gap-2 rounded-lg border-2 border-green-600 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm transition-colors hover:bg-green-50 hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                                <LayoutDashboard />
                                HomePage
                            </RouterLink>
                            <div v-if="authStore.isAuthenticated === false" class="flex gap-2">
                                <div>
                                    <RouterLink to="/login"
                                        class="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors cursor-pointer">
                                        เข้าสู่ระบบจัดการ
                                    </RouterLink>
                                </div>
                            </div>
                            <div v-else class="relative" ref="userMenuRef">
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
                                    <!-- <a href="/profile"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                        Profile
                                    </a> -->
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

            <main class="py-8 px-4 sm:px-6 lg:px-8">
                <slot></slot>
            </main>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
}
</style>