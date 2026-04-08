<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useMaterialStore } from '../../../stores/admins/materialStore'
import CheckerLayout from '../../../layouts/CheckerLayout.vue'
import { useAuthStore } from '../../../stores/auth'
import { useVendorStore } from '../../../stores/admins/vendorStore'
import { useUnitStore } from '../../../stores/admins/unitStore'
import { useLocationWhStore } from '../../../stores/admins/locationWhStore'
import { Trash2, Edit2, Search, ChevronLeft, ChevronRight, Plus, Package, Barcode, X } from 'lucide-vue-next'
import JsBarcode from 'jsbarcode'

const materialStore = useMaterialStore()
const auth = useAuthStore()
const vendorStore = useVendorStore()
const unitStore = useUnitStore()
const locationWhStore = useLocationWhStore()

const showBarcodeModal = ref(false)
const selectedMaterial = ref(null)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 5

function normalizeLoose(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[\s\-_]/g, '')
}

function materialLocationSearchParts(m) {
    const parts = []
    const wl = m.warehouseLocation
    const locs = locationWhStore.locations

    if (wl == null || wl === '') return parts

    if (typeof wl === 'string') {
        parts.push(wl)
        const byId = locs.find(l => String(l._id) === String(wl))
        const byCode = locs.find(l => l.code === wl)
        const loc = byId || byCode
        if (loc) {
            if (loc.code) parts.push(loc.code)
            if (loc.name) parts.push(loc.name)
        }
    } else if (typeof wl === 'object') {
        if (wl.code) parts.push(wl.code)
        if (wl.name) parts.push(wl.name)
        if (wl._id) {
            const loc = locs.find(l => String(l._id) === String(wl._id))
            if (loc) {
                if (loc.code) parts.push(loc.code)
                if (loc.name) parts.push(loc.name)
            }
        }
    }

    return parts.map(p => String(p).trim()).filter(Boolean)
}

const filteredMaterials = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return materialStore.materials
    const qLoose = normalizeLoose(q)

    return materialStore.materials.filter(m => {
        if (
            (m.code || '').toLowerCase().includes(q) ||
            (m.productName || '').toLowerCase().includes(q) ||
            (m.ownerName || '').toLowerCase().includes(q)
        ) {
            return true
        }

        const locParts = materialLocationSearchParts(m)
        const locHaystack = locParts.join(' ').toLowerCase()
        if (locHaystack.includes(q)) return true
        if (qLoose && normalizeLoose(locHaystack).includes(qLoose)) return true

        return false
    })
})

const totalPages = computed(() => Math.ceil(filteredMaterials.value.length / itemsPerPage))

const paginatedMaterials = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return filteredMaterials.value.slice(start, start + itemsPerPage)
})

const pageNumbers = computed(() => {
    const pages = []
    const total = totalPages.value
    const current = currentPage.value
    if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i)
    } else {
        pages.push(1)
        if (current > 3) pages.push('...')
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
        if (current < total - 2) pages.push('...')
        pages.push(total)
    }
    return pages
})

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const showBarcode = (material) => {
    selectedMaterial.value = material
    showBarcodeModal.value = true

    setTimeout(() => {
        const canvas = document.getElementById('barcode-canvas')
        if (canvas) {
            JsBarcode(canvas, material.code, {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: true,
                fontSize: 16,
                margin: 10
            })
        }
    }, 100)
}

const printBarcode = () => {
    const canvas = document.getElementById('barcode-canvas')
    const imgData = canvas ? canvas.toDataURL('image/png') : ''

    const win = window.open('', '_blank', 'width=900,height=800')
    win.document.write(`
        <html>
            <head>
                <title>Print Barcode</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; margin: 0; }
                    .barcode-row {
                        display: flex;
                        align-items: center;
                        gap: 32px;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 16px 24px;
                        width: fit-content;
                    }
                    .info-block { text-align: center; min-width: 120px; }
                    .label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
                    .value { font-size: 15px; font-weight: 700; color: #111827; }
                    .divider { width: 1px; height: 80px; background: #e5e7eb; }
                    img { display: block; }
                </style>
            </head>
            <body>
                <div class="barcode-row">
                    <div class="info-block">
                        <div class="value">${selectedMaterial.value?.code}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="info-block">
                        <div class="value">${selectedMaterial.value?.productName}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="info-block">
                        <img src="${imgData}" style="height:80px;" />
                    </div>
                </div>
                <script>window.onload = () => { window.print(); window.close(); }<\/script>
            </body>
        </html>
    `)
    win.document.close()
}

const downloadBarcode = () => {
    const canvas = document.getElementById('barcode-canvas')
    if (canvas) {
        const link = document.createElement('a')
        link.download = `barcode-${selectedMaterial.value.code}.png`
        link.href = canvas.toDataURL()
        link.click()
    }
}

watch(searchQuery, () => { currentPage.value = 1 })

const formData = ref({
    code: '',
    categoryId: '',
    unitId: '',
    productName: '',
    ownerName: '',
    receivedAt: '',
    quantity: '',
    warehouseLocation: '',
    createdBy: auth.user.memberId
})

onMounted(async () => {
    await vendorStore.fetchVendors()
    await unitStore.fetchUnits()
    await locationWhStore.fetchLocations()
    await materialStore.fetchMaterials()
})
</script>

<template>
    <CheckerLayout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

            <div class="p-4 text-white flex justify-between" style="
                        background: linear-gradient(135deg, #14158C 0%, #1e3a8a 50%, #1d4ed8 100%);
                        border-radius: 1rem;
                        box-shadow: 0 4px 20px rgba(20, 21, 140, 0.3);
            ">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 
                    bg-white/15 
                    rounded-xl 
                    flex items-center justify-center 
                    backdrop-blur-sm 
                    shrink-0">
                        <Package class="w-5 h-5 text-white" />
                    </div>

                    <div>
                        <p class="text-white font-semibold text-xl">
                            Manage Materials / Equipment
                        </p>
                    </div>
                </div>

                <div class="bg-white/15 
                        backdrop-blur-sm 
                        border border-white/25 
                        rounded-xl 
                        py-2 px-4 
                        text-center">
                    <p class="text-2xl font-semibold text-white">
                        {{ materialStore.totalMaterials }}
                    </p>

                    <p class="text-sm text-white/80">
                        Total Items
                    </p>
                </div>
            </div>

            <div class="mt-7 mb-5 flex gap-5">
                <div class="relative w-full">
                    <Search
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input v-model="searchQuery" type="text" placeholder="Search code, name, vendor, location..."
                        class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gradient-to-r from-[#14158C] to-[#1a1aa3]">
                                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Material Code</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Vendor</th>
                                <th class="px-6 py-4 text-center text-sm font-semibold text-white">Quantity</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Unit</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                                <th class="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="material in paginatedMaterials" :key="material._id"
                                class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4 text-sm text-gray-900 font-medium">
                                    <div>
                                        <p
                                            class="inline-block bg-blue-50 text-blue-700 border border-blue-200 py-[0.2rem] px-[0.55rem] rounded-md text-[0.78rem] font-semibold whitespace-nowrap">
                                            {{ material.code }}
                                        </p>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ material.productName || '-' }}</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="inline-block bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md font-semibold">
                                        {{ vendorStore.getVendorNameByCode(material.ownerName) || "-" }}
                                    </span>
                                </td>

                                <td class="px-6 py-4 text-sm text-gray-900 font-semibold text-center">{{
                                    material.quantity }}</td>
                                    <td class="px-6 py-4 text-sm">
                                    <span
                                        class="inline-block bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
                                        {{ unitStore.getUnitNameByCode(material.unitId) || "-" }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                                        {{ locationWhStore.getLocationNameByCode(material.warehouseLocation) || '-' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <div class="flex justify-center gap-2">
                                        <button @click="showBarcode(material)"
                                            class="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition">
                                            <Barcode class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="paginatedMaterials.length === 0">
                                <td colspan="6" class="text-center py-8 text-gray-500">
                                    {{ searchQuery ? 'No results found' : 'No materials found' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="md:hidden space-y-4 p-4">
                    <div v-for="material in paginatedMaterials" :key="material._id"
                        class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                        <div class="space-y-3">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="text-xs text-gray-500 uppercase">Material Code</p>
                                    <p class="text-sm font-semibold text-gray-900">
                                        <span
                                            class="inline-flex items-center mt-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                                            {{ material.code }}
                                        </span>
                                    </p>
                                </div>
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    {{ material.quantity }} pcs
                                </span>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 uppercase">Name</p>
                                <p class="text-sm text-gray-700">{{ material.productName || '-' }}</p>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <p class="text-xs text-gray-500 uppercase">Vendor</p>
                                    <span
                                        class="inline-flex items-center mt-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                                        {{ vendorStore.getVendorNameByCode(material.ownerName) || '-' }}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 uppercase">Unit</p>
                                    <span
                                        class="inline-flex items-center mt-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                                        {{ unitStore.getUnitNameByCode(material.unitId) || '-' }}
                                    </span>
                                </div>
                            </div>
                            <div class="">
                                <p class="text-xs text-gray-500 uppercase">Location</p>
                                <span
                                    class="inline-flex items-center mt-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-semibold">
                                    {{ locationWhStore.getLocationNameByCode(material.warehouseLocation) || '-' }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div v-if="paginatedMaterials.length === 0" class="text-center py-8 text-gray-500">
                        {{ searchQuery ? 'No results found' : 'No materials found' }}
                    </div>
                </div>

                <div v-if="totalPages > 1"
                    class="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t bg-gray-50">
                    <!-- Info -->
                    <p class="text-sm text-gray-500">
                        Showing {{ (currentPage - 1) * itemsPerPage + 1 }}–{{ Math.min(currentPage * itemsPerPage,
                            filteredMaterials.length) }}
                        of {{ filteredMaterials.length }} items
                    </p>

                    <!-- Page Buttons -->
                    <div class="flex items-center gap-1">
                        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                            class="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition">
                            <ChevronLeft class="w-4 h-4" />
                        </button>

                        <template v-for="page in pageNumbers" :key="page">
                            <span v-if="page === '...'" class="px-2 text-gray-400 select-none">…</span>
                            <button v-else @click="goToPage(page)" :class="[
                                'w-9 h-9 rounded-lg text-sm font-medium transition',
                                page === currentPage
                                    ? 'bg-[#14158C] text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-200'
                            ]">
                                {{ page }}
                            </button>
                        </template>

                        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                            class="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition">
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showBarcodeModal"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click.self="showBarcodeModal = false">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div class="flex justify-between items-center p-6 border-b">
                    <h2 class="text-xl font-semibold text-gray-900">
                        Material Barcode
                    </h2>
                    <button @click="showBarcodeModal = false" class="text-gray-400 hover:text-gray-600 transition">
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <div id="barcode-print-area" class="p-6">
                    <div class="flex items-stretch border border-gray-200 rounded-lg mx-auto">
                        <div class="flex-1 flex flex-col">
                            <div class="text-center pt-4">
                                <p class="text-xs text-gray-500 mb-1">Material Code</p>
                            </div>
                            <div class="flex-1 flex items-center justify-center pb-4">
                                <p class="text-base font-bold text-gray-900">{{ selectedMaterial?.code }}</p>
                            </div>
                        </div>

                        <div class="w-px bg-gray-200"></div>

                        <div class="flex-1 flex flex-col">
                            <div class="text-center pt-4">
                                <p class="text-xs text-gray-500 mb-1">Product Name</p>
                            </div>
                            <div class="flex-1 flex items-center justify-center pb-4">
                                <p class="text-base font-bold text-gray-900 text-center">{{ selectedMaterial?.productName }}</p>
                            </div>
                        </div>

                        <div class="w-px bg-gray-200"></div>

                        <div class="flex-1 flex flex-col">
                            <div class="text-center pt-4">
                                <p class="text-xs text-gray-500 mb-1">Barcode</p>
                            </div>
                            <div class="flex-1 flex items-center justify-center pb-4">
                                <canvas id="barcode-canvas"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 p-6 border-t">
                    <button @click="showBarcodeModal = false"
                        class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition">
                        Close
                    </button>
                    <button @click="downloadBarcode"
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition">
                        Download
                    </button>
                    <button @click="printBarcode"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">
                        Print
                    </button>
                </div>
            </div>
        </div>
    </CheckerLayout>
</template>

<style scoped>
table tbody tr:last-child {
    border-bottom: none;
}

@media print {
    body * {
        visibility: hidden;
    }

    #barcode-print-area,
    #barcode-print-area * {
        visibility: visible;
    }

    #barcode-print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
    }

    .no-print {
        display: none !important;
    }
}
</style>