<template>
    <NavbarLayout>
        <div class="min-h-screen py-6 sm:py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div class="mb-6 sm:mb-8">
                    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 text-center mb-2">
                        <div class="flex justify-center">
                            <div class="flex items-center mx-3">
                                <Box class="w-7 h-7" />
                            </div>
                            <p>Warehouse Report</p>
                        </div>
                    </h1>
                    <p class="text-gray-600 text-center text-sm sm:text-base">
                        Warehouse Inventory Report
                    </p>
                </div>

                <div class="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <!-- Search -->
                        <div class="lg:col-span-2">
                            <div class="block text-sm font-medium text-gray-700 mb-2">
                                <div class="flex gap-2">
                                    <Search class="w-4 h-4" />
                                    <p>Search</p>
                                </div>
                            </div>
                            <input v-model="searchQuery" @input="resetPage" type="text"
                                placeholder="Search Code or Product Name…"
                                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                        </div>

                        <div>
                            <div class="block text-sm font-medium text-gray-700 mb-2">
                                <div class="flex gap-2">
                                    <MapPinHouse class="w-4 h-4" />
                                    <p>Location</p>
                                </div>
                            </div>
                            <SearchableSelect v-model="selectedLocation" :options="uniqueLocations" value-key="value"
                                label-key="label" name="location-select" search-placeholder="Find a location..."
                                placeholder="All" @change="resetPage" />
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center justify-between mt-4 gap-3">
                        <div class="text-sm text-gray-600">
                            Found <span class="font-semibold text-blue-600">{{ filteredMaterials.length }}</span> items
                        </div>
                        <button v-if="searchQuery || selectedLocation" @click="resetFilters"
                            class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                            Clear Filters
                        </button>
                    </div>
                </div>

                <MaterialTable :materials="filteredMaterials" :current-page="currentPage" :items-per-page="itemsPerPage"
                    @update:current-page="currentPage = $event" />

                <div class="mt-8 flex flex-col lg:flex-row lg:gap-6">
                    <div class="flex-1 w-full lg:w-1/2 mb-6 lg:mb-0">
                        <div class="bg-white rounded-xl shadow-md overflow-hidden h-full">
                            <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 sm:px-6">
                                <h2 class="text-lg font-semibold text-gray-800">Storage Location Details</h2>
                                <p class="text-sm text-gray-500">Comprehensive information on all storage locations.</p>
                            </div>
                            <LocationTable :locations="locationWhStore.locations" :items-per-page="10" />
                        </div>
                    </div>

                    <div class="flex-1 w-full lg:w-1/2">
                        <div class="bg-white rounded-xl shadow-md overflow-hidden h-full">
                            <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 sm:px-6">
                                <h2 class="text-lg font-semibold text-gray-800">Additional Section</h2>
                                <p class="text-sm text-gray-500">Space for additional information.</p>
                            </div>
                            <div class="p-6 text-center text-gray-500">
                                <p>Under Development…</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </NavbarLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NavbarLayout from '../layouts/NavbarLayout.vue'
import MaterialTable from '../components/tables/material/MaterialTable.vue'
import LocationTable from '../components/tables/locations/LocationTable.vue'
import { Box, Search, MapPinHouse } from 'lucide-vue-next'
import SearchableSelect from '../components/Dropdown/SearchableSelect.vue';

import { useMaterialStore } from '../stores/admins/materialStore';
import { useUnitStore } from '../stores/admins/unitStore';
import { useLocationWhStore } from '../stores/admins/locationWhStore';

const materialStore = useMaterialStore()
const unitStore = useUnitStore()
const locationWhStore = useLocationWhStore()

const searchQuery = ref('')
const selectedLocation = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const uniqueLocations = computed(() => {
    const locations = materialStore.materials.map(item => item.warehouseLocation)
    const unique = [...new Set(locations)].filter(Boolean).sort()
    return unique.map(loc => ({ value: loc, label: loc }))
})

const filteredMaterials = computed(() => {
    let filtered = materialStore.materials

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(item =>
            item.code?.toLowerCase().includes(query) ||
            item.productName?.toLowerCase().includes(query)
        )
    }

    if (selectedLocation.value) {
        filtered = filtered.filter(item =>
            item.warehouseLocation === selectedLocation.value
        )
    }

    return filtered
})

const resetFilters = () => {
    searchQuery.value = ''
    selectedLocation.value = ''
    currentPage.value = 1
}

const resetPage = () => {
    currentPage.value = 1
}

onMounted(async () => {
    await materialStore.fetchMaterials()
    await unitStore.fetchUnits()
    await locationWhStore.fetchLocations()
    console.log('material : ', locationWhStore.locations)
})
</script>

<style scoped>
@media (max-width: 1023px) {
    .lg\:flex-row {
        gap: 0;
    }
}

@media (max-width: 640px) {
    :deep(.location-table),
    :deep(.material-table) {
        font-size: 0.875rem;
    }
}
</style>