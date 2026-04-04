import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useGoodIssueStore = defineStore('goodIssue', {
    state: () => ({
        goodIssues: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all good issues
        async fetchGoodIssues() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports/goodissue`)
                this.goodIssues = response.data.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch good issues'
                console.error('Error fetching good issues:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })
            } finally {
                this.loading = false
            }
        },

        // Get by ID
        async fetchGoodIssueById(id) {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports/goodissue/${id}`)
                return { success: true, data: response.data }
            } catch (error) {
                const message = error.response?.data?.message || 'Unable to fetch good issue'
                console.error('Error fetching good issue by id:', error)
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

        async createGoodIssue(data) {
            const confirmResult = await Swal.fire({
                title: 'Confirm Create',
                text: 'Do you want to create this Good Issue?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, create',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#2563eb'
            })

            if (!confirmResult.isConfirmed) {
                return { success: false, cancelled: true }
            }

            this.loading = true

            Swal.fire({
                title: 'Saving...',
                text: 'Please wait',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/reports/goodissue`,
                    data
                )

                await this.fetchGoodIssues()
                Swal.close()

                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Good Issue created successfully',
                    timer: 1500,
                    showConfirmButton: false
                })

                return { success: true, data: response.data }
            } catch (error) {
                Swal.close()

                this.error = error.response?.data?.message || 'Unable to create good issue'
                console.error('Error creating good issue:', error)

                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: this.error
                })

                return { success: false, error: this.error }
            } finally {
                this.loading = false
            }
        },

        // Delete good issue
        async deleteGoodIssue(id, code) {
            const result = await Swal.fire({
                title: 'Confirm Deletion',
                text: `Are you sure you want to delete "${code}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33'
            })

            if (!result.isConfirmed) return { success: false, cancelled: true }

            this.loading = true
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/reports/goodissue/${id}`)
                await this.fetchGoodIssues()

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Good Issue deleted successfully',
                    timer: 1500,
                    showConfirmButton: false
                })

                return { success: true }
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to delete good issue'
                console.error('Error deleting good issue:', error)
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
        getGoodIssueByIdFromState: (state) => (id) => {
            return state.goodIssues.find(g => g._id === id)
        },
        totalGoodIssues: (state) => state.goodIssues.length,
    }
})