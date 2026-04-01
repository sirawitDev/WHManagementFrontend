import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useVendorStore = defineStore('vendor', {
    state: () => ({
        vendors: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all
        async fetchVendors() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/vendors`)
                this.vendors = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch vendors'
                console.error('Error fetching vendors:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })
            } finally {
                this.loading = false
            }
        },

        // Create
        async createVendor(data) {
            this.loading = true
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/vendors`, data)
                await this.fetchVendors()
                return { success: true, data: response.data }
            } catch (error) {
                if (error.response?.data?.code === 11000) {
                    this.error = 'Vendor name already exists'
                } else {
                    this.error = error.response?.data?.message || 'Unable to create vendor'
                }

                console.error('Error creating vendor:', error)
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

        // Update
        async updateVendor(id, data) {
            this.loading = true
            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/vendors/${id}`, data)
                await this.fetchVendors()
                return { success: true, data: response.data }
            } catch (error) {
                if (error.response?.data?.code === 11000) {
                    this.error = 'Vendor name already exists'
                } else {
                    this.error = error.response?.data?.message || 'Unable to update vendor'
                }

                console.error('Error updating vendor:', error)
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

        // Delete
        async deleteVendor(id, name) {
            const result = await Swal.fire({
                title: 'Confirm Deletion',
                text: `Are you sure you want to delete "${name}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33'
            })

            if (!result.isConfirmed) return { success: false, cancelled: true }

            this.loading = true
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/vendors/${id}`)
                await this.fetchVendors()

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Vendor deleted successfully',
                    showConfirmButton: false,
                    timer: 1500
                })

                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to delete vendor'
                console.error('Error deleting vendor:', error)
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
        getVendorById: (state) => (id) => {
            return state.vendors.find(v => v._id === id)
        },
        getVendorNameByCode: (state) => (code) => {
            const vendor = state.vendors.find(v => v.code === code)
            return vendor ? vendor.name : code // fallback
        },
        totalVendors: (state) => state.vendors.length
    }
})