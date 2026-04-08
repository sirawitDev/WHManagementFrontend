<script setup>
import { ref, computed } from 'vue'
import { SquarePlus, Users, Edit, Trash2, Eye } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import { useBusinessPartnerStore } from '../../../stores/admins/businessStore'

const businessPartnerStore = useBusinessPartnerStore()
const emit = defineEmits(['open-modal'])

const openAddModal = () => {
    emit('open-modal', 'businessPartner')
}

const editBusinessPartner = (bp) => {
    emit('open-modal', 'businessPartner', bp)
}

const deleteBusinessPartner = async (id, name) => {
    await businessPartnerStore.deleteBusinessPartner(id, name)
}

const truncateDescription = (description, maxLength = 15) => {
    if (!description || description === '-') return '-'
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
}

const viewFullDescription = (bp) => {
    Swal.fire({
        title: bp.name,
        html: `
            <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                <p><b>Description:</b> ${bp.description || '-'}</p>
                <p><b>Tel 1:</b> ${bp.tel1 || '-'}</p>
                <p><b>Tel 2:</b> ${bp.tel2 || '-'}</p>
                <p><b>Fax:</b> ${bp.fax || '-'}</p>
                <p><b>Mobile Phone:</b> ${bp.mobilePhone || '-'}</p>
                <p><b>Email:</b> ${bp.email || '-'}</p>
                <p><b>Business Type:</b> ${bp.businessType || '-'}</p>
                <p><b>Website:</b> ${bp.website || '-'}</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Close',
        confirmButtonColor: '#3b82f6',
        width: '500px'
    })
}

const isDescriptionLong = (description, maxLength = 10) => {
    return description && description !== '-' && description.length > maxLength
}

const itemsPerPage = 5
const currentPage = ref(1)

const paginatedBP = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return businessPartnerStore.businessPartners.slice(start, end)
})

const totalPages = computed(() => {
    return Math.ceil(businessPartnerStore.businessPartners.length / itemsPerPage)
})

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}
</script>

<template>
    <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <div class="p-4 sm:p-5 lg:p-6">

            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-[#DDE0FF] rounded-lg">
                        <Users class="w-5 h-5 sm:w-6 sm:h-6 text-[#14158C]" />
                    </div>
                    <p class="text-lg sm:text-xl font-semibold text-gray-800">
                        Business Partner Settings
                    </p>
                </div>

                <button @click="openAddModal"
                    class="bg-[#14158C] hover:bg-[#8A8CEB] text-white font-semibold px-4 py-2.5 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                    type="button">
                    <SquarePlus class="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>ADD</span>
                </button>
            </div>

            <div class="mt-4 text-sm text-gray-500">
                Manage business partners
            </div>

            <div v-if="businessPartnerStore.loading" class="mt-6 text-center py-4">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#14158C]"></div>
                <p class="text-sm text-gray-500 mt-2">Loading...</p>
            </div>

            <div v-else class="mt-6 overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                            </th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Description
                            </th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="bp in paginatedBP" :key="bp._id" class="hover:bg-gray-50">
                            <td class="px-4 py-3 text-sm font-medium text-gray-900">
                                {{ bp.name }}
                            </td>

                            <td class="px-4 py-3 text-sm text-gray-500">
                                <div class="flex items-center gap-2">
                                    <span>{{ truncateDescription(bp.description) }}</span>
                                    <button v-if="isDescriptionLong(bp.description)" @click="viewFullDescription(bp)"
                                        class="text-[#14158C] hover:text-[#8A8CEB] text-xs">
                                        <Eye class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </td>

                            <td class="px-4 py-3 text-right text-sm">
                                <button @click="editBusinessPartner(bp)"
                                    class="text-[#14158C] hover:text-[#8A8CEB] mr-3">
                                    <Edit class="w-4 h-4 inline" />
                                </button>

                                <button @click="deleteBusinessPartner(bp._id, bp.name)"
                                    class="text-red-600 hover:text-red-900">
                                    <Trash2 class="w-4 h-4 inline" />
                                </button>
                            </td>
                        </tr>

                        <tr v-if="businessPartnerStore.businessPartners.length === 0">
                            <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-500">
                                No business partners found. Click "ADD" to create one.
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="businessPartnerStore.businessPartners.length > itemsPerPage" class="flex justify-end mt-4">
                    <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                        class="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50">
                        Prev
                    </button>

                    <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="[
                        'px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
                        page === currentPage ? 'font-bold bg-[#8A8CEB] text-[#14158C] hover:bg-[#8A8CEB]' : ''
                    ]">
                        {{ page }}
                    </button>
                    <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50">
                        Next
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>