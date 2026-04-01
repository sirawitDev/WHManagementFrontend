import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useMaterialStore = defineStore('material', {
    state: () => ({
        materials: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all materials
        async fetchMaterials() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/materials`)
                this.materials = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch materials'
                console.error('Error fetching materials:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })
            } finally {
                this.loading = false
            }
        },

        // Create material
        async createMaterial(materialData) {
            this.loading = true
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/materials`, materialData)
                await this.fetchMaterials()
                return { success: true, data: response.data }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to create material'
                console.error('Error creating material:', error)
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

        // Update material
        async updateMaterial(id, materialData) {
            this.loading = true
            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/materials/${id}`, materialData)
                await this.fetchMaterials()
                return { success: true, data: response.data }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to update material'
                console.error('Error updating material:', error)
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

        // Delete material
        async deleteMaterial(id, name) {
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
                await axios.delete(`${import.meta.env.VITE_API_URL}/materials/${id}`)
                await this.fetchMaterials()
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Material has been deleted successfully',
                    showConfirmButton: false,
                    timer: 1500
                })
                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to delete material'
                console.error('Error deleting material:', error)
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
        getMaterialById: (state) => (id) => {
            return state.materials.find(mat => mat._id === id)
        },
        totalMaterials: (state) => state.materials.length
    }
})