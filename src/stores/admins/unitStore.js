// stores/unitStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useUnitStore = defineStore('unit', {
    state: () => ({
        units: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all units
        async fetchUnits() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/units`)
                this.units = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch units data'
                console.error('Error fetching units:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })
            } finally {
                this.loading = false
            }
        },

        // Create new unit
        async createUnit(unitData) {
            this.loading = true
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/units`, unitData)
                await this.fetchUnits() // Refresh the list
                return { success: true, data: response.data }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to create unit'
                console.error('Error creating unit:', error)
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

        // Update existing unit
        async updateUnit(id, unitData) {
            this.loading = true
            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/units/${id}`, unitData)
                await this.fetchUnits() // Refresh the list
                return { success: true, data: response.data }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to update unit'
                console.error('Error updating unit:', error)
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

        // Delete unit
        async deleteUnit(id, name) {
            console.log('id : ', id)
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
                await axios.delete(`${import.meta.env.VITE_API_URL}/units/${id}`)
                await this.fetchUnits() // Refresh the list
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Unit has been deleted successfully',
                    showConfirmButton: false,
                    timer: 1500
                })
                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to delete unit'
                console.error('Error deleting unit:', error)
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

        // Clear error
        clearError() {
            this.error = null
        }
    },

    getters: {
        getUnitById: (state) => (id) => {
            return state.units.find(unit => unit.id === id)
        },

        getUnitNameByCode: (state) => (code) => {
            const unit = state.units.find(u => u.code === code)
            return unit ? unit.name : code // fallback ถ้าไม่เจอ
        },

        totalUnits: (state) => state.units.length
    }
})