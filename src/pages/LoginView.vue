<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, KeyRound } from "lucide-vue-next"
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
    username: '',
    password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
    if (!formData.value.username || !formData.value.password) {
        error.value = 'Please fill in all required fields.'
        Swal.fire({
            icon: 'warning',
            title: 'Please fill in all required fields.'
        })
        return
    }

    loading.value = true
    error.value = ''

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/users/login`,
            formData.value,
            { headers: { 'Content-Type': 'application/json' } }
        )
        
        Swal.fire({
            icon: 'success',
            title: 'Login successful',
            showConfirmButton: false,
            timer: 1500
        })

        authStore.login(response.data.user)
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            error.value = err.response.data.message
            Swal.fire({
                icon: 'error',
                title: 'Login failed',
                text: err.response.data.message
            })
        } else {
            error.value = 'A connection error occurred.'
            Swal.fire({
                icon: 'error',
                title: 'An error occurred.',
                text: 'A connection error occurred.'
            })
        }
    } finally {
        loading.value = false
    }
}

const goToRegister = () => {
    router.push('/register')
}

const goToHome = () => {
    router.push('/')
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-300">
        <div class="max-w-md w-full space-y-8 p-8">
            <div class="bg-white rounded-2xl shadow-xl p-8">
                <div class="text-center mb-8">
                    <!-- <div class="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <User class="text-blue-600 h-7 w-7"/>
                    </div> -->
                    <div class="flex justify-center mb-2">
                        <img src="../assets/img/CNLOGO2.png" alt="" class="w-[96px] h-[96px]">
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">
                        Warehouse System
                    </h2>
                    <p class="text-gray-600">Please sign in to access the system.</p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User class="w-5 h-5 text-gray-400"/>
                                </div>
                                <input 
                                    id="username" 
                                    v-model="formData.username" 
                                    type="text" 
                                    required
                                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter Username" 
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound class="w-5 h-5 text-gray-400"/>
                                </div>
                                <input 
                                    id="password" 
                                    v-model="formData.password" 
                                    type="password" 
                                    required
                                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter Password" 
                                />
                            </div>
                        </div>
                    </div>

                    <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                        {{ error }}
                    </div>

                    <div class="space-y-4">
                        <button
                            type="submit"
                            :disabled="loading"
                            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105"
                        >
                            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {{ loading ? 'Logging in...' : 'Log In' }}
                        </button>

                        <button
                            type="button"
                            @click="goToHome"
                            class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                        >
                            Back to Home
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>