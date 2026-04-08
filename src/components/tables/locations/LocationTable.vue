<template>
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <!-- <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin class="w-5 h-5 text-blue-600" />
                    รายการตำแหน่งคลังสินค้า
                </h2> -->

                <div class="w-full sm:w-full">
                    <div class="relative">
                        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input v-model="searchQuery" @input="resetPage" type="text"
                            placeholder="ค้นหาด้วย Code หรือ ชื่อ..."
                            class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                    </div>
                </div>
            </div>
        </div>

        <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            ลำดับ
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            Code
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            Name
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(location, index) in paginatedLocations" :key="location._id"
                        class="hover:bg-blue-50 transition-colors"
                        :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="font-mono text-sm font-semibold text-blue-600">
                                {{ location.code }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm text-gray-900 font-medium flex items-center gap-1">
                                <MapPin class="w-4 h-4 text-gray-400" />
                                {{ location.name }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm text-gray-600">
                                {{ location.description || '-' }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="paginatedLocations.length === 0">
                        <td colspan="6" class="px-6 py-12 text-center">
                            <div class="flex flex-col items-center justify-center text-gray-400">
                                <MapPin class="w-16 h-16 mb-4" />
                                <p class="text-lg font-medium">ไม่พบข้อมูลตำแหน่งคลัง</p>
                                <p class="text-sm">ลองค้นหาใหม่หรือเพิ่มข้อมูลตำแหน่งคลัง</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="md:hidden divide-y divide-gray-200">
            <div v-for="(location, index) in paginatedLocations" :key="location._id"
                class="p-4 hover:bg-blue-50 transition-colors">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xs text-gray-500">#{{ (currentPage - 1) * itemsPerPage + index + 1
                                }}</span>
                            <span class="font-mono text-xs font-semibold text-blue-600 px-2 py-1 bg-blue-50 rounded">
                                {{ location.code }}
                            </span>
                        </div>
                        <h3 class="font-semibold text-gray-900 flex items-center gap-1">
                            <MapPin class="w-4 h-4 text-gray-400" />
                            {{ location.name }}
                        </h3>
                    </div>
                </div>

                <div class="space-y-2 text-sm">
                    <div v-if="location.description" class="flex items-start text-gray-600">
                        <span class="w-24 font-medium shrink-0">คำอธิบาย:</span>
                        <span class="flex-1">{{ location.description }}</span>
                    </div>
                </div>
            </div>

            <div v-if="paginatedLocations.length === 0" class="p-12 text-center">
                <div class="flex flex-col items-center justify-center text-gray-400">
                    <MapPin class="w-16 h-16 mb-4" />
                    <p class="text-lg font-medium">ไม่พบข้อมูลตำแหน่งคลัง</p>
                    <p class="text-sm">ลองค้นหาใหม่หรือเพิ่มข้อมูลตำแหน่งคลัง</p>
                </div>
            </div>
        </div>

        <div v-if="totalPages > 1" class="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-sm text-gray-700">
                    แสดง
                    <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                    ถึง
                    <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
                    จาก
                    <span class="font-medium">{{ totalItems }}</span>
                    รายการ
                </div>

                <div class="flex items-center gap-2">
                    <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="currentPage === 1
                            ? 'bg-gray-200 text-gray-400'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'">
                        ← ก่อนหน้า
                    </button>

                    <div class="hidden sm:flex gap-1">
                        <button v-for="page in totalPages" :key="page"
                            v-show="Math.abs(page - currentPage) < 3 || page === 1 || page === totalPages"
                            @click="goToPage(page)" class="w-10 h-10 rounded-lg text-sm font-medium transition-all"
                            :class="page === currentPage
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'">
                            {{ page }}
                        </button>
                    </div>

                    <div
                        class="sm:hidden px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                        {{ currentPage }} / {{ totalPages }}
                    </div>

                    <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="currentPage === totalPages
                            ? 'bg-gray-200 text-gray-400'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'">
                        ถัดไป →
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MapPin, Search } from 'lucide-vue-next'

const props = defineProps({
    locations: {
        type: Array,
        required: true,
        default: () => []
    },
    itemsPerPage: {
        type: Number,
        default: 10
    }
})

const searchQuery = ref('')
const currentPage = ref(1)

const filteredLocations = computed(() => {
    if (!searchQuery.value) return props.locations

    const query = searchQuery.value.toLowerCase()
    return props.locations.filter(location =>
        location.code?.toLowerCase().includes(query) ||
        location.name?.toLowerCase().includes(query) ||
        location.description?.toLowerCase().includes(query)
    )
})

const totalItems = computed(() => filteredLocations.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage))

const paginatedLocations = computed(() => {
    const start = (currentPage.value - 1) * props.itemsPerPage
    const end = start + props.itemsPerPage
    return filteredLocations.value.slice(start, end)
})

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

const resetPage = () => {
    currentPage.value = 1
}
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
    height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>