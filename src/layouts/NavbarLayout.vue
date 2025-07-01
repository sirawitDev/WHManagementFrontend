<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const showAside = ref(false)
const toggleAside = () => {
    showAside.value = !showAside.value
}
</script>>

<template>
    <div class="">
        <transition name="fade">
            <div v-if="showAside" class="fixed inset-0 bg-black bg-opacity-30 z-30" @click="showAside = false"></div>
        </transition>
        <transition name="slide">
            <aside v-if="showAside" class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col">
                <div class="flex items-center justify-between px-4 py-4 border-b">
                    <span class="font-bold text-lg text-indigo-700">เมนู</span>
                    <button @click="showAside = false" class="text-gray-500 hover:text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav class="flex-1 p-4 space-y-2">
                    <a href="/home"
                        class="block px-3 py-2 rounded hover:bg-indigo-50 text-indigo-700 font-medium">หน้าแรก</a>
                </nav>
            </aside>
        </transition>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="navbar bg-base-100 border-2 shadow-md rounded-xl mt-3 sticky">
                <div class="flex-none">
                    <button class="btn btn-square btn-ghost" @click="toggleAside">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            class="inline-block h-5 w-5 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex-1">
                    <a class="btn btn-ghost text-xl">VueStructure</a>
                </div>
                <div class="flex-none">
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                            <div class="w-10 rounded-full">
                                <img alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                            </div>
                        </div>
                        <ul tabindex="0"
                            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li>
                                <a class="justify-between">
                                    Profile
                                    <span class="badge">New</span>
                                </a>
                            </li>
                            <li><a>Settings</a></li>
                            <li><a @click="authStore.logout()">Logout</a></li>
                        </ul>
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
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.2s;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
}
</style>