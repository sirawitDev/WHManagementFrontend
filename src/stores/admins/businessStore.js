import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useBusinessPartnerStore = defineStore('businessPartner', {
    state: () => ({
        businessPartners: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all
        async fetchBusinessPartners() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/businesspartner`)
                this.businessPartners = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch business partners'
                console.error('Error fetching business partners:', error)
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
        async createBusinessPartner(data) {
            this.loading = true
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/businesspartner`, data)
                await this.fetchBusinessPartners()
                return { success: true, data: response.data }
            } catch (error) {
                // handle duplicate key (MongoDB)
                if (error.response?.data?.code === 11000) {
                    this.error = 'Business Partner name already exists'
                } else {
                    this.error = error.response?.data?.message || 'Unable to create business partner'
                }

                console.error('Error creating business partner:', error)
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
        async updateBusinessPartner(id, data) {
            this.loading = true
            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/businesspartner/${id}`, data)
                await this.fetchBusinessPartners()
                return { success: true, data: response.data }
            } catch (error) {
                if (error.response?.data?.code === 11000) {
                    this.error = 'Business Partner name already exists'
                } else {
                    this.error = error.response?.data?.message || 'Unable to update business partner'
                }

                console.error('Error updating business partner:', error)
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
        async deleteBusinessPartner(id, name) {
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
                await axios.delete(`${import.meta.env.VITE_API_URL}/businesspartner/${id}`)
                await this.fetchBusinessPartners()

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Business Partner deleted successfully',
                    showConfirmButton: false,
                    timer: 1500
                })

                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to delete business partner'
                console.error('Error deleting business partner:', error)
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
        getBusinessPartnerById: (state) => (id) => {
            return state.businessPartners.find(bp => bp._id === id)
        },
        getBusinessPartnerNameByCode: (state) => (code) => {
            const bp = state.businessPartners.find(b => b.code === code)
            return bp ? bp.name : (code ?? '-')
        },
        totalBusinessPartners: (state) => state.businessPartners.length
    }
})