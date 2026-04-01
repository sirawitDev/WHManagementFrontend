import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all categories
        async fetchCategories() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`)
                this.categories = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch categories'
                console.error('Error fetching categories:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })
            } finally {
                this.loading = false
            }
        },

        // Create category
        async createCategory(categoryData) {
            this.loading = true
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/categories`, categoryData)
                await this.fetchCategories()
                return { success: true, data: response.data }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to create category'
                console.error('Error creating category:', error)
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

        // Update category
        async updateCategory(id, categoryData) {
            this.loading = true
            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/categories/${id}`, categoryData)
                await this.fetchCategories()
                return { success: true, data: response.data }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to update category'
                console.error('Error updating category:', error)
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

        // Delete category
        async deleteCategory(id, name) {
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
                await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`)
                await this.fetchCategories()
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Category has been deleted successfully',
                    showConfirmButton: false,
                    timer: 1500
                })
                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to delete category'
                console.error('Error deleting category:', error)
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
        getCategoryById: (state) => (id) => {
            return state.categories.find(cat => cat._id === id)
        },
        totalCategories: (state) => state.categories.length
    }
})