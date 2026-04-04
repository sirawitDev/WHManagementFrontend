import { defineStore } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useStockReportStore = defineStore('stockReport', {
    state: () => ({
        stockReports: [],
        loading: false,
        error: null
    }),

    actions: {
        // Fetch all stock reports
        async fetchStockReports() {
            this.loading = true
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports/stock-reports`)
                this.stockReports = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Unable to fetch stock reports'
                console.error('Error fetching stock reports:', error)

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
        // async fetchStockReportById(id) {
        //     this.loading = true
        //     try {
        //         const response = await axios.get(`${import.meta.env.VITE_API_URL}/reports/stock-reports/${id}`)
        //         return { success: true, data: response.data }
        //     } catch (error) {
        //         const message = error.response?.data?.message || 'Unable to fetch stock report'
        //         console.error('Error fetching stock report:', error)

        //         Swal.fire({
        //             icon: 'error',
        //             title: 'Error',
        //             text: message
        //         })

        //         return { success: false, error: message }
        //     } finally {
        //         this.loading = false
        //     }
        // },

        // Delete report (ถ้ามี)
        // async deleteStockReport(id, code) {
        //     const confirm = await Swal.fire({
        //         title: 'Confirm Deletion',
        //         text: `Delete report "${code}" ?`,
        //         icon: 'warning',
        //         showCancelButton: true,
        //         confirmButtonText: 'Yes, delete',
        //         cancelButtonText: 'Cancel',
        //         confirmButtonColor: '#d33'
        //     })

        //     if (!confirm.isConfirmed) return { success: false, cancelled: true }

        //     this.loading = true
        //     try {
        //         await axios.delete(`${import.meta.env.VITE_API_URL}/reports/stock-reports/${id}`)
        //         await this.fetchStockReports()

        //         Swal.fire({
        //             icon: 'success',
        //             title: 'Deleted!',
        //             text: 'Stock report deleted successfully',
        //             timer: 1500,
        //             showConfirmButton: false
        //         })

        //         return { success: true }
        //     } catch (error) {
        //         this.error = error.response?.data?.message || 'Unable to delete stock report'
        //         console.error('Error deleting stock report:', error)

        //         Swal.fire({
        //             icon: 'error',
        //             title: 'Error',
        //             text: this.error
        //         })

        //         return { success: false, error: this.error }
        //     } finally {
        //         this.loading = false
        //     }
        // },

        clearError() {
            this.error = null
        }
    },

    getters: {

        totalStockReports: (state) => state.stockReports.length,

        // 🔥 filter by material
        filterByMaterial: (state) => (materialId) => {
            return state.stockReports.filter(r => r.materialId === materialId)
        },

        // 🔥 filter by date
        filterByDate: (state) => (from, to) => {
            return state.stockReports.filter(r => {
                const d = new Date(r.createdAt)
                return d >= new Date(from) && d <= new Date(to)
            })
        }
    }
})