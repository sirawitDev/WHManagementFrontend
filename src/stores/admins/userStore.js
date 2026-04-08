import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all users
        async fetchUsers() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`)
                this.users = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch users'
                console.error('Error fetching users:', error)

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })
            } finally {
                this.loading = false
            }
        },

        // Get user by ID
        async fetchUserById(id) {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`)
                return { success: true, data: response.data }
            } catch (error) {
                const message = error.response?.data?.message || 'Unable to fetch user'
                console.error('Error fetching user:', error)

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                })

                return { success: false, error: message }
            } finally {
                this.loading = false
            }
        },

        // Create user
        async createUser(data) {
            const confirm = await Swal.fire({
                title: 'Create User?',
                text: 'Do you want to create this user?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, create',
                cancelButtonText: 'Cancel'
            })
        
            if (!confirm.isConfirmed) {
                return { success: false, cancelled: true }
            }
        
            try {
                Swal.fire({
                    title: 'Creating...',
                    text: 'Please wait',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })
        
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/users`, data)
        
                this.users.unshift(response.data)
        
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'User created successfully',
                    timer: 1500,
                    showConfirmButton: false
                })
        
                return { success: true, data: response.data }
        
            } catch (error) {
                const message = error.response?.data?.message || 'Unable to create user'
        
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                })
        
                return { success: false, error: message }
            }
        },

        // Update user
        async updateUser(id, data) {
            const confirm = await Swal.fire({
                title: 'Confirm Update',
                text: 'Do you want to update this user?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, update'
            })
        
            if (!confirm.isConfirmed) return { success: false }
        
            showLoading('Updating user...')
            this.loading = true
        
            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}`, data)
        
                const index = this.users.findIndex(u => u._id === id)
                if (index !== -1) this.users[index] = response.data
        
                closeLoading()
        
                Swal.fire({
                    icon: 'success',
                    title: 'Updated',
                    text: 'User updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                })
        
                return { success: true }
            } catch (error) {
                closeLoading()
        
                this.error = error.response?.data?.message || 'Unable to update user'
        
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })
        
                return { success: false }
            } finally {
                this.loading = false
            }
        },

        // Delete user
        async deleteUser(id, name) {
            const confirm = await Swal.fire({
                title: 'Confirm Deletion',
                text: `Delete user "${name}" ?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33'
            })

            if (!confirm.isConfirmed) return { success: false, cancelled: true }

            this.loading = true
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`)

                // 🔥 remove from state
                this.users = this.users.filter(u => u._id !== id)

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'User deleted successfully',
                    timer: 1500,
                    showConfirmButton: false
                })

                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to delete user'
                console.error('Error deleting user:', error)

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })

                return { success: false, error: this.error }
            } finally {
                this.loading = false
            }
        },

        clearError() {
            this.error = null
        }
    },

    getters: {
        getUserById: (state) => (id) => {
            return state.users.find(u => u._id === id)
        },

        totalUsers: (state) => state.users.length,

        // 🔥 filter by role
        filterByRole: (state) => (role) => {
            return state.users.filter(u => u.role === role)
        }
    }
})