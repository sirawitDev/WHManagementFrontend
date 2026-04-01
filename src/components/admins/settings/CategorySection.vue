<!-- components/admins/settings/CategorySection.vue -->
<script setup>
import { ref, computed } from 'vue'
import { SquarePlus, Tag, Edit, Trash2, Eye } from 'lucide-vue-next'
import Swal from 'sweetalert2'
import { useCategoryStore } from '../../../stores/admins/categoryStore'

const categoryStore = useCategoryStore()
const emit = defineEmits(['open-modal'])

const openAddModal = () => {
    emit('open-modal', 'category')
}

const editCategory = (category) => {
    emit('open-modal', 'category', category)
}

const deleteCategory = async (id, name) => {
    await categoryStore.deleteCategory(id, name)
}

const truncateDescription = (description, maxLength = 15) => {
    if (!description || description === '-') return '-'
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
}

const viewFullDescription = (description, categoryName) => {
    if (!description || description === '-') {
        Swal.fire({
            icon: 'info',
            title: categoryName,
            text: 'No description provided for this category.',
            confirmButtonColor: '#10b981'
        })
        return
    }
    
    Swal.fire({
        title: categoryName,
        html: `<div style="text-center: left; max-height: 400px; overflow-y: auto;">
                    <p style="font-size: 1rem; line-height: 1.5; color: #374151;">
                        ${description}
                    </p>
                </div>`,
        icon: 'info',
        confirmButtonText: 'Close',
        confirmButtonColor: '#3b82f6',
        width: '500px'
    })
}

const isDescriptionLong = (description, maxLength = 24) => {
    return description && description !== '-' && description.length > maxLength
}

const itemsPerPage = 5
const currentPage = ref(1)

const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return categoryStore.categories.slice(start, end)
})

const totalPages = computed(() => {
    return Math.ceil(categoryStore.categories.length / itemsPerPage)
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
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-[#DDE0FF] rounded-lg">
                        <Tag class="w-5 h-5 sm:w-6 sm:h-6 text-[#14158C]" />
                    </div>
                    <p class="text-lg sm:text-xl font-semibold text-gray-800">
                        Category Issued Settings
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
                Manage product and service categories
            </div>

            <!-- Loading State -->
            <div v-if="categoryStore.loading" class="mt-6 text-center py-4">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#14158C]"></div>
                <p class="text-sm text-gray-500 mt-2">Loading...</p>
            </div>

            <!-- Categories Table -->
            <div v-else class="mt-6 overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col"
                                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col"
                                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th scope="col"
                                class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="category in paginatedCategories" :key="category._id"
                            class="hover:bg-gray-50 transition-colors">
                            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {{ category.name }}
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-500">
                                <div class="flex items-center gap-2">
                                    <span class="truncate">
                                        {{ truncateDescription(category.description) }}
                                    </span>
                                    <button 
                                        v-if="isDescriptionLong(category.description)"
                                        @click="viewFullDescription(category.description, category.name)"
                                        class="text-[#14158C] hover:text-[#8A8CEB] transition-colors inline-flex items-center gap-1 text-xs font-medium"
                                        title="View full description">
                                        <Eye class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button @click="editCategory(category)"
                                    class="text-[#14158C] hover:text-[#8A8CEB] mr-3 transition-colors"
                                    title="Edit">
                                    <Edit class="w-4 h-4 inline" />
                                </button>
                                <button @click="deleteCategory(category._id, category.name)"
                                    class="text-red-600 hover:text-red-900 transition-colors"
                                    title="Delete">
                                    <Trash2 class="w-4 h-4 inline" />
                                </button>
                            </td>
                        </tr>
                        <tr v-if="categoryStore.categories.length === 0">
                            <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-500">
                                No categories found. Click "ADD" to create one.
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- Pagination -->
                <div v-if="categoryStore.categories.length > itemsPerPage" class="flex justify-end mt-4">
                    <nav class="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            @click="goToPage(currentPage - 1)"
                            :disabled="currentPage === 1"
                            class="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            v-for="page in totalPages"
                            :key="page"
                            @click="goToPage(page)"
                            :class="[
                                'px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
                                page === currentPage ? 'font-bold bg-[#8A8CEB] text-[#14158C] hover:bg-[#8A8CEB]' : ''
                            ]"
                        >
                            {{ page }}
                        </button>
                        <button
                            @click="goToPage(currentPage + 1)"
                            :disabled="currentPage === totalPages"
                            class="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</template>