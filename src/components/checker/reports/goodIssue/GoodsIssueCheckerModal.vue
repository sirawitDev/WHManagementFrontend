<script setup>
import { ref, computed, onMounted } from 'vue'
import { X, Plus, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-vue-next'
import SearchableSelect from '../../../Dropdown/SearchableSelect.vue'
import { useMaterialStore } from '../../../../stores/admins/materialStore'
import { useUnitStore } from '../../../../stores/admins/unitStore'
import { useBusinessPartnerStore } from '../../../../stores/admins/businessStore'
import { useCategoryStore } from '../../../../stores/admins/categoryStore'
import { useAuthStore } from '../../../../stores/auth'

import { useGoodIssueStore } from '../../../../stores/checker/checkerGoodIssueStore'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const materialStore = useMaterialStore()
const unitStore = useUnitStore()
const businessPartnerStore = useBusinessPartnerStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()
const goodIssueStore = useGoodIssueStore()

const searchCode = ref('')
const isLoading = ref(false)
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const activeTab = ref('search')
const issueItems = ref([])
let nextId = 1
let blurTimeout = null

const selectedBpCode = ref('')
const vendorReference = ref('')
const selectedCategories = ref([])
const showCategoryDropdown = ref(false)
const remark = ref('')
const quantityErrors = ref({})

const totalItems = computed(() => issueItems.value.length)

const currentDateText = computed(() => {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear() + 543
    return `${dd}/${mm}/${yyyy}`
})

const getRemainingStock = (materialId, currentItemId) => {
    const material = materialStore.materials.find(m => m._id === materialId)
    if (!material) return 0

    const originalStock = parseInt(material.quantity) || 0

    const otherItemsTotal = issueItems.value
        .filter(item => item.id !== currentItemId && item.materialId === materialId)
        .reduce((sum, item) => sum + (item.quantity || 0), 0)

    return Math.max(0, originalStock - otherItemsTotal)
}

const filteredMaterials = computed(() => {
    if (!searchCode.value.trim()) {
        return []
    }

    const searchTerm = searchCode.value.toLowerCase().trim()
    return materialStore.materials
        .filter(material =>
        (material.code.toLowerCase().includes(searchTerm) ||
            material.productName.toLowerCase().includes(searchTerm))
        )
        .slice(0, 10)
})

const getRemainingStockAfterThisItem = (materialId, currentItemId, currentItemQuantity) => {
    const material = materialStore.materials.find(m => m._id === materialId)
    if (!material) return 0

    const originalStock = parseInt(material.quantity) || 0

    const otherItemsTotal = issueItems.value
        .filter(item => item.id !== currentItemId && item.materialId === materialId)
        .reduce((sum, item) => sum + (item.quantity || 0), 0)

    return Math.max(0, originalStock - otherItemsTotal - currentItemQuantity)
}

const selectAndAddMaterial = (material) => {
    const materialId = material._id

    const existingItems = issueItems.value.filter(item => item.materialId === materialId)

    const originalStock = parseInt(material.quantity) || 0
    const usedStock = existingItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const remainingStock = originalStock - usedStock

    if (remainingStock <= 0) {
        alert(`วัสดุ ${material.code} หมดสต็อกแล้ว ไม่สามารถเบิกเพิ่มได้`)
        return
    }

    issueItems.value.push({
        id: nextId++,
        code: material.code,
        productName: material.productName,
        quantity: 1,
        quantityInStock: remainingStock,
        warehouseLocation: material.warehouseLocation || '',
        unitId: material.unitId,
        remark: '',
        materialId: material._id,
        originalStock: originalStock
    })

    searchCode.value = ''
    showDropdown.value = false
    selectedIndex.value = -1
}

const handleKeydown = (e) => {
    if (!showDropdown.value || filteredMaterials.value.length === 0) return

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault()
            selectedIndex.value = (selectedIndex.value + 1) % filteredMaterials.value.length
            break
        case 'ArrowUp':
            e.preventDefault()
            selectedIndex.value = selectedIndex.value <= 0
                ? filteredMaterials.value.length - 1
                : selectedIndex.value - 1
            break
        case 'Enter':
            e.preventDefault()
            if (selectedIndex.value >= 0 && filteredMaterials.value[selectedIndex.value]) {
                selectAndAddMaterial(filteredMaterials.value[selectedIndex.value])
            }
            break
        case 'Escape':
            showDropdown.value = false
            selectedIndex.value = -1
            break
    }
}

const onSearchInput = () => {
    showDropdown.value = true
    selectedIndex.value = -1
}

const onInputBlur = () => {
    blurTimeout = setTimeout(() => {
        showDropdown.value = false
        selectedIndex.value = -1
    }, 200)
}

const removeItem = (id) => {
    issueItems.value = issueItems.value.filter(item => item.id !== id)
    delete quantityErrors.value[id]
}

const updateQuantity = (item, newQuantity) => {
    const qty = parseInt(newQuantity)

    const remainingStock = getRemainingStock(item.materialId, item.id)

    delete quantityErrors.value[item.id]

    if (isNaN(qty) || qty < 1) {
        item.quantity = 1
        quantityErrors.value[item.id] = 'จำนวนต้องมากกว่า 0'

        setTimeout(() => {
            delete quantityErrors.value[item.id]
        }, 3000)

    } else if (qty > remainingStock) {
        item.quantity = remainingStock
        quantityErrors.value[item.id] =
            `Max quantity ${remainingStock} ${unitStore.getUnitNameByCode(item.unitId)}`

        setTimeout(() => {
            delete quantityErrors.value[item.id]
        }, 3000)

    } else {
        item.quantity = qty
    }

    issueItems.value = [...issueItems.value]
}

const toggleCategory = (categoryName) => {
    const index = selectedCategories.value.indexOf(categoryName)
    if (index > -1) {
        selectedCategories.value.splice(index, 1)
    } else {
        selectedCategories.value.push(categoryName)
    }
}

const clearCategories = () => {
    selectedCategories.value = []
}

const selectAllCategories = () => {
    selectedCategories.value = categoryStore.categories.map(cat => cat.name)
}

const saveGoodsIssue = async () => {
    if (issueItems.value.length === 0) {
        alert('กรุณาเพิ่มรายการวัสดุ')
        return
    }

    const invalidItems = issueItems.value.filter(
        item => !item.warehouseLocation || item.quantity <= 0
    )

    if (invalidItems.length > 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน')
        return
    }

    isLoading.value = true
    try {
        const goodsIssueData = {
            issueDate: new Date().toISOString(),
            businessPartnerCode: selectedBpCode.value,
            vendorReference: vendorReference.value,
            categories: selectedCategories.value,
            remark: remark.value,
            items: issueItems.value.map(item => ({
                materialId: item.materialId,
                code: item.code,
                productName: item.productName,
                quantity: item.quantity,
                warehouseLocation: item.warehouseLocation,
                unitId: item.unitId,
                remark: item.remark
            })),
            createdBy: authStore.user.memberId
        }

        const result = await goodIssueStore.createGoodIssue(goodsIssueData)
        if (result.success) {
            closeModal()
            emit('saved')
        }
    } catch (error) {
        console.error('Error saving goods issue:', error)
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
        isLoading.value = false
    }
}

const closeModal = () => {
    issueItems.value = []
    searchCode.value = ''
    nextId = 1
    showDropdown.value = false
    remark.value = ''
    selectedIndex.value = -1
    quantityErrors.value = {}
    selectedBpCode.value = ''
    selectedCategories.value = []
    vendorReference.value = ''
    showCategoryDropdown.value = false
    activeTab.value = 'search'
    emit('update:modelValue', false)
}

onMounted(async () => {
    await materialStore.fetchMaterials()
    await unitStore.fetchUnits()
    await businessPartnerStore.fetchBusinessPartners()
    await categoryStore.fetchCategories()
})
</script>

<template>
    <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 class="text-lg sm:text-xl font-semibold text-gray-800">Create New Goods Issue</h2>
                    <p class="text-xs sm:text-sm text-gray-500 mt-1">
                        วันที่ : {{ currentDateText }}
                    </p>
                </div>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <!-- Modal Body -->
            <div class="p-4 sm:p-6">
                <div class="flex border-b border-gray-200 mb-4">
                    <button @click="activeTab = 'search'" :class="[
                        'px-4 py-2 text-sm font-medium transition',
                        activeTab === 'search'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-blue-500'
                    ]">
                        Search
                    </button>

                    <button @click="activeTab = 'category'" :class="[
                        'px-4 py-2 text-sm font-medium transition',
                        activeTab === 'category'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-blue-500'
                    ]">
                        Category
                    </button>
                </div>

                <!-- Category Selection Section -->
                <div v-if="activeTab === 'category'" class="mb-6 bg-gray-50 p-4 rounded-lg">
                    <!-- Category content (same as original) -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <label class="text-sm font-medium text-gray-700">
                            Document Categories (เลือกหมวดหมู่ของเอกสาร)
                            <span class="text-xs text-gray-500 ml-2">({{ selectedCategories.length }}
                                selected)</span>
                        </label>
                        <div class="flex gap-2">
                            <button @click="selectAllCategories"
                                class="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                                Select All
                            </button>
                            <button @click="clearCategories"
                                class="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 transition">
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div class="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <label v-for="category in categoryStore.categories" :key="category._id"
                            class="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 transition cursor-pointer">
                            <input type="checkbox" :value="category.code" v-model="selectedCategories"
                                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            <span class="text-sm text-gray-700">{{ category.name }}</span>
                        </label>
                    </div>

                    <div class="sm:hidden">
                        <button @click="showCategoryDropdown = !showCategoryDropdown"
                            class="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
                            <span class="text-sm text-gray-700">
                                {{ selectedCategories.length }} categories selected
                            </span>
                            <ChevronDown v-if="!showCategoryDropdown" class="w-4 h-4 text-gray-500" />
                            <ChevronUp v-else class="w-4 h-4 text-gray-500" />
                        </button>

                        <div v-if="showCategoryDropdown"
                            class="mt-2 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                            <label v-for="category in categoryStore.categories" :key="category._id"
                                class="flex items-center space-x-2 p-3 border-b border-gray-100 hover:bg-blue-50 transition cursor-pointer">
                                <input type="checkbox" :value="category.name" v-model="selectedCategories"
                                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                <span class="text-sm text-gray-700">{{ category.name }}</span>
                            </label>
                        </div>
                    </div>

                    <div v-if="selectedCategories.length > 0" class="mt-4 pt-3 border-t border-gray-200">
                        <p class="text-xs text-gray-500 mb-2">Selected Categories:</p>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="cat in selectedCategories" :key="cat"
                                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {{ categoryStore.getCategoryNameByCode(cat) }}
                                <button @click="toggleCategory(cat)" class="hover:text-red-900">
                                    <X class="w-3 h-3 text-red-500" />
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Search Section -->
                <div v-if="activeTab === 'search'" class="mb-6 bg-gray-50 p-4 rounded-lg">
                    <!-- Search content (same as original) -->
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Search and Add Materials
                        <span class="text-xs text-gray-500 ml-2">(Type code or name, then click to add)</span>
                    </label>
                    <div class="relative">
                        <div class="flex gap-2">
                            <div class="flex-1 relative">
                                <input v-model="searchCode" @input="onSearchInput" @focus="showDropdown = true"
                                    @blur="onInputBlur" @keydown="handleKeydown" type="text"
                                    placeholder="Type material code or name to search and add…"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

                                <div v-if="showDropdown && filteredMaterials.length > 0"
                                    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    <div v-for="(material, idx) in filteredMaterials" :key="material._id"
                                        @click="selectAndAddMaterial(material)" :class="[
                                            'px-3 py-2 cursor-pointer hover:bg-blue-50 transition',
                                            idx === selectedIndex ? 'bg-blue-100' : ''
                                        ]">
                                        <div class="flex justify-between items-center">
                                            <div class="flex-1">
                                                <div class="font-medium text-gray-900">{{ material.code }}</div>
                                                <div class="text-sm text-gray-600">{{ material.productName }}</div>
                                                <div class="text-sm text-red-600">Location : {{
                                                    material.warehouseLocation }}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-sm text-gray-500">
                                                    Available Stock: <span class="text-gray-800">{{
                                                        material.quantity }}</span> {{
                                                            unitStore.getUnitNameByCode(material.unitId) || "-" }}
                                                </div>
                                                <div class="text-xs text-green-600 mt-1">
                                                    Click to add item
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="showDropdown && searchCode.trim() && filteredMaterials.length === 0"
                                    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-gray-500">
                                    No matching materials found
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-3 text-sm text-gray-600">
                        <span class="font-medium">Added:</span> {{ issueItems.length }} items
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3 w-full mt-3">
                        <div class="w-full sm:w-1/2">
                            <SearchableSelect v-model="selectedBpCode" :options="businessPartnerStore.businessPartners"
                                value-key="code" label-key="name" label="Business Partner" placeholder="-- Select BP --"
                                search-placeholder="Search BP..." name="bp-select" />
                        </div>

                        <div class="w-full sm:w-1/2">
                            <p class="text-sm font-medium text-gray-600 mb-2">Vendor Reference</p>
                            <input type="text" v-model="vendorReference"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter vendor reference" />
                        </div>
                    </div>

                    <div>
                        <div class="mt-2">
                            <p class="text-sm font-medium text-gray-600 mb-2">Remark</p>
                            <input type="text" v-model="remark" placeholder="Enter remark"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
                        </div>
                    </div>
                </div>

                <!-- Items Table (same as original) -->
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <!-- Table content same as original -->
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item No.</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    UoM Name</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Qty in Whse</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    รายละเอียดแสดงในเอกสาร</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(item, index) in issueItems" :key="item.id">
                                <td class="px-4 py-3 text-sm text-gray-900">{{ index + 1 }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900">{{ item.code }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900">{{ item.productName }}</td>
                                <td class="px-4 py-3 text-sm">
                                    <div>
                                        <input v-model.number="item.quantity"
                                            @input="updateQuantity(item, $event.target.value)" type="number" min="1"
                                            :max="item.quantityInStock" :class="[
                                                'w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500',
                                                quantityErrors[item.id] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                            ]" />
                                        <p v-if="quantityErrors[item.id]" class="text-red-600 text-xs mt-1">
                                            {{ quantityErrors[item.id] }}
                                        </p>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    <input v-model="item.warehouseLocation" disabled
                                        class="w-32 px-2 py-1 border border-gray-300 rounded bg-gray-100" />
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900">{{
                                    unitStore.getUnitNameByCode(item.unitId) || "-" }}</td>
                                <td class="px-4 py-3 text-sm">
                                    <div class="space-y-1">
                                        <div>
                                            <span class="text-xs text-gray-500">Stock ปัจจุบัน:</span>
                                            <span class="ml-1 font-medium">{{ getRemainingStock(item.materialId,
                                                item.id) }}</span>
                                        </div>
                                        <div>
                                            <span class="text-xs text-gray-500">คงเหลือหลังเบิก : </span>
                                            <div class="flex items-center">
                                                <span :class="{
                                                    'text-red-600 font-semibold': getRemainingStockAfterThisItem(item.materialId, item.id, item.quantity) < 0,
                                                    'text-green-600 font-semibold': getRemainingStockAfterThisItem(item.materialId, item.id, item.quantity) >= 0
                                                }">
                                                    {{ getRemainingStockAfterThisItem(item.materialId, item.id,
                                                        item.quantity) }}
                                                </span>
                                                <span class="text-xs text-gray-400 ml-1 whitespace-nowrap">
                                                    / {{ item.originalStock }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    <input v-model="item.remark" type="text" placeholder="หมายเหตุ"
                                        class="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    <button @click="removeItem(item.id)"
                                        class="text-red-600 hover:text-red-800 transition">
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="issueItems.length === 0">
                                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                                    <div class="flex flex-col items-center gap-2">
                                        <Search class="w-12 h-12 text-gray-300" />
                                        <p>No materials added yet</p>
                                        <p class="text-sm">Search above and click an item to add.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Summary -->
                <div v-if="issueItems.length > 0" class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-700">All Materials: <span class="font-semibold">{{ totalItems
                            }}</span> items</p>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="sticky bottom-0 bg-white border-t px-4 sm:px-6 py-4 flex justify-end gap-3">
                <button @click="closeModal"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                </button>
                <button @click="saveGoodsIssue" :disabled="isLoading || issueItems.length === 0"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                    {{ isLoading ? 'Saving...' : 'Save' }}
                </button>
            </div>
        </div>
    </div>
</template>