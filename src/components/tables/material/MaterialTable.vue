<template>
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gradient-to-r from-blue-500 to-blue-500 text-white">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            Code
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            Product Name
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            Quantity
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            Location
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                            Received
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(item, index) in paginatedMaterials" :key="item._id"
                        class="hover:bg-blue-50 transition-colors" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="font-mono text-sm font-semibold text-blue-600">
                                {{ item.code }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="text-sm text-gray-900 font-medium">
                                {{ item.productName }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span
                                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                {{ item.quantity }} {{ getUnitName(item.unitId) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center text-sm text-gray-700">
                                <MapPin class="mr-1 w-4 h-4" />
                                {{ getLocationName(item.warehouseLocation) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {{ formatDate(item.receivedAt) }}
                        </td>
                    </tr>

                    <!-- Empty State -->
                    <tr v-if="paginatedMaterials.length === 0">
                        <td colspan="6" class="px-6 py-12 text-center">
                            <div class="flex flex-col items-center justify-center text-gray-400">
                                <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p class="text-lg font-medium">ไม่พบข้อมูล</p>
                                <p class="text-sm">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="md:hidden divide-y divide-gray-200">
            <div v-for="item in paginatedMaterials" :key="item._id" class="p-4 hover:bg-blue-50 transition-colors">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="font-mono text-xs text-blue-600 font-semibold mb-1">
                            {{ item.code }}
                        </p>
                        <h3 class="font-semibold text-gray-900">
                            {{ item.productName }}
                        </h3>
                    </div>
                    <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {{ item.quantity }} {{ getUnitName(item.unitId) }}
                    </span>
                </div>

                <div class="space-y-2 text-sm">
                    <div class="flex items-center text-gray-600">
                        <span class="w-20 font-medium">Location:</span>
                        <span>📍 {{ getLocationName(item.warehouseLocation) }}</span>
                    </div>
                    <div class="flex items-center text-gray-600">
                        <span class="w-20 font-medium">Received:</span>
                        <span>{{ formatDate(item.receivedAt) }}</span>
                    </div>
                </div>
            </div>

            <div v-if="paginatedMaterials.length === 0" class="p-12 text-center">
                <div class="flex flex-col items-center justify-center text-gray-400">
                    <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-lg font-medium">ไม่พบข้อมูล</p>
                    <p class="text-sm">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
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
import { computed } from 'vue'
import { MapPin } from 'lucide-vue-next'
import { useUnitStore } from '../../../stores/admins/unitStore'
import { useLocationWhStore } from '../../../stores/admins/locationWhStore'

// Props
const props = defineProps({
    materials: {
        type: Array,
        required: true,
        default: () => []
    },
    currentPage: {
        type: Number,
        required: true,
        default: 1
    },
    itemsPerPage: {
        type: Number,
        required: true,
        default: 10
    }
})

const emit = defineEmits(['update:currentPage'])

const unitStore = useUnitStore()
const locationWhStore = useLocationWhStore()

const totalItems = computed(() => props.materials.length)

const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage))

const paginatedMaterials = computed(() => {
    const start = (props.currentPage - 1) * props.itemsPerPage
    const end = start + props.itemsPerPage
    return props.materials.slice(start, end)
})

const getUnitName = (unitId) => {
    return unitStore.getUnitNameByCode(unitId) || '-'
}

const getLocationName = (locationCode) => {
    return locationWhStore.getLocationNameByCode(locationCode) || locationCode
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        emit('update:currentPage', page)
    }
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