import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useLocationWhStore = defineStore('locationWh', {
    state: () => ({
        locations: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all locations
        async fetchLocations() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/location-wh`)
                this.locations = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch locations'
                console.error('Error fetching locations:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })
            } finally {
                this.loading = false
            }
        },

        // Create location
        async createLocation(data) {
            this.loading = true
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/location-wh`, data)
                await this.fetchLocations()
                return { success: true, data: response.data }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to create location'
                console.error('Error creating location:', error)
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

        // Update location
        async updateLocation(id, data) {
            this.loading = true
            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/location-wh/${id}`, data)
                await this.fetchLocations()
                return { success: true, data: response.data }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to update location'
                console.error('Error updating location:', error)
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

        // Delete location
        async deleteLocation(id, name) {
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
                await axios.delete(`${import.meta.env.VITE_API_URL}/location-wh/${id}`)
                await this.fetchLocations()

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Location deleted successfully',
                    showConfirmButton: false,
                    timer: 1500
                })

                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to delete location'
                console.error('Error deleting location:', error)
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
        getLocationById: (state) => (id) => {
            return state.locations.find(loc => loc._id === id)
        },
        getLocationNameByCode: (state) => (code) => {
            const loc = state.locations.find(l => l.code === code)
            return loc ? loc.name : code // fallback
        },
        totalLocations: (state) => state.locations.length
    }
})