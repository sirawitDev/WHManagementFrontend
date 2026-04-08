<script setup>
import AdminLayout from '../../../layouts/AdminLayout.vue';
import { ClipboardPlus, Plus, Search, Filter, X, ChevronUp, ChevronDown, Calendar, Hash, Building2, Tag, Eye } from 'lucide-vue-next'
import GoodsIssueModal from '../../../components/admins/reports/goodIssue/GoodsIssueModal.vue'
import GoodsIssueDetailModal from '../../../components/admins/reports/goodIssue/GoodsIssueDetailModal.vue'
import { onMounted, ref, computed, watch } from 'vue';

import { useGoodIssueStore } from '../../../stores/admins/reports/goodissueStore';
import { useCategoryStore } from '../../../stores/admins/categoryStore';
import { useBusinessPartnerStore } from '../../../stores/admins/businessStore';

const goodIssueStore = useGoodIssueStore()
const categoryStore = useCategoryStore()
const businessPartnerStore = useBusinessPartnerStore()

const showModal = ref(false)

const showDetailModal = ref(false)
const selectedIssue = ref(null)

function openDetail(issue) {
    selectedIssue.value = issue
    showDetailModal.value = true
}

const filters = ref({
    code: '',
    businessPartnerCode: '',
    categories: '',
    dateFrom: '',
    dateTo: '',
})

const showFilters = ref(false)
const sortField = ref('issueDate')
const sortDir = ref('desc')

const currentPage = ref(1)
const PAGE_SIZE = 5

onMounted(async () => {
    await goodIssueStore.fetchGoodIssues()
    await categoryStore.fetchCategories()
    await businessPartnerStore.fetchBusinessPartners()
})

const allCategories = computed(() => {
    const set = new Set()
    goodIssueStore.goodIssues?.forEach(g => g.categories?.forEach(c => set.add(c)))
    return [...set].sort()
})

const filteredIssues = computed(() => {
    let data = [...(goodIssueStore.goodIssues || [])]
    if (filters.value.code)
        data = data.filter(g => g.code?.toLowerCase().includes(filters.value.code.toLowerCase()))
    if (filters.value.businessPartnerCode)
        data = data.filter(g => g.businessPartnerCode?.toLowerCase().includes(filters.value.businessPartnerCode.toLowerCase()))
    if (filters.value.categories)
        data = data.filter(g => g.categories?.includes(filters.value.categories))
    if (filters.value.dateFrom)
        data = data.filter(g => new Date(g.issueDate) >= new Date(filters.value.dateFrom))
    if (filters.value.dateTo)
        data = data.filter(g => new Date(g.issueDate) <= new Date(filters.value.dateTo + 'T23:59:59'))
    data.sort((a, b) => {
        let va = a[sortField.value] ?? ''
        let vb = b[sortField.value] ?? ''
        if (sortField.value === 'issueDate') { va = new Date(va); vb = new Date(vb) }
        return sortDir.value === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    return data
})

const totalPages = computed(() => Math.ceil(filteredIssues.value.length / PAGE_SIZE))

const paginatedIssues = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredIssues.value.slice(start, start + PAGE_SIZE)
})

watch(filters, () => { currentPage.value = 1 }, { deep: true })
watch([sortField, sortDir], () => { currentPage.value = 1 })

const activeFilterCount = computed(() =>
    Object.values(filters.value).filter(v => v !== '').length
)

function toggleSort(field) {
    if (sortField.value === field) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    else { sortField.value = field; sortDir.value = 'asc' }
}

function clearFilters() {
    filters.value = { code: '', businessPartnerCode: '', categories: '', dateFrom: '', dateTo: '' }
}

function formatDate(d) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatTime(d) {
    if (!d) return ''
    return new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
    <AdminLayout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">

            <div class="p-4 sm:p-5 text-white flex justify-between items-center" style="
                background: linear-gradient(135deg, #14158C 0%, #1e3a8a 50%, #1d4ed8 100%);
                border-radius: 1rem;
                box-shadow: 0 4px 20px rgba(20, 21, 140, 0.3);">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                        <ClipboardPlus class="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p class="text-white font-semibold text-xl leading-tight">Goods Issue</p>
                        <p class="text-blue-200 text-sm mt-0.5">{{ filteredIssues.length }} รายการ</p>
                    </div>
                </div>
                <button @click="showModal = true"
                    class="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition hover:scale-105 duration-300 flex items-center gap-2 text-sm sm:text-base">
                    <Plus class="w-4 h-4" />
                    <span class="hidden sm:inline">New Goods Issue</span>
                    <span class="sm:hidden">New</span>
                </button>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100">
                    <button @click="showFilters = !showFilters"
                        class="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-700 transition-colors">
                        <Filter class="w-4 h-4" />
                        <span>Filters</span>
                        <span v-if="activeFilterCount > 0"
                            class="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {{ activeFilterCount }}
                        </span>
                        <component :is="showFilters ? ChevronUp : ChevronDown" class="w-4 h-4 text-gray-400 ml-1" />
                    </button>
                    <button v-if="activeFilterCount > 0" @click="clearFilters"
                        class="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                        <X class="w-3.5 h-3.5" /> Clear Filters
                    </button>
                </div>

                <Transition name="slide">
                    <div v-if="showFilters" class="px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        <div class="relative">
                            <label class="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                                <Hash class="w-3.5 h-3.5 text-blue-500" />GI CODE
                            </label>
                            <div class="relative">
                                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input v-model="filters.code" type="text" placeholder="GI..."
                                    class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors" />
                            </div>
                        </div>
                        <div class="relative">
                            <label class="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                                <Building2 class="w-3.5 h-3.5 text-blue-500" />Business Partner
                            </label>
                            <div class="relative">
                                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input v-model="filters.businessPartnerCode" type="text" placeholder="BP..."
                                    class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors" />
                            </div>
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                                <Tag class="w-3.5 h-3.5 text-blue-500" />Category
                            </label>
                            <select v-model="filters.categories"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors">
                                <option value=""></option>
                                <option v-for="cat in allCategories" :key="cat" :value="cat">{{ categoryStore.getCategoryNameByCode(cat) }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                                <Calendar class="w-3.5 h-3.5 text-blue-500" />Start Date
                            </label>
                            <input v-model="filters.dateFrom" type="date"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors" />
                        </div>
                        <div>
                            <label class="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                                <Calendar class="w-3.5 h-3.5 text-blue-500" />End Date
                            </label>
                            <input v-model="filters.dateTo" type="date"
                                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors" />
                        </div>
                    </div>
                </Transition>

                <div class="overflow-x-auto">
                    <table class="w-full min-w-[680px]">
                        <thead>
                            <tr class="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200">
                                <!-- <th class="text-left px-4 sm:px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-10">#</th> -->
                                <th @click="toggleSort('code')" class="text-left px-4 sm:px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-700 select-none transition-colors group">
                                    <div class="flex items-center gap-1.5">
                                        GI CODE
                                        <span class="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <ChevronUp class="w-2.5 h-2.5" :class="sortField === 'code' && sortDir === 'asc' ? 'text-blue-600 opacity-100' : ''" />
                                            <ChevronDown class="w-2.5 h-2.5 -mt-1" :class="sortField === 'code' && sortDir === 'desc' ? 'text-blue-600 opacity-100' : ''" />
                                        </span>
                                    </div>
                                </th>
                                <th @click="toggleSort('issueDate')" class="text-left px-4 sm:px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-700 select-none transition-colors group">
                                    <div class="flex items-center gap-1.5">
                                        Date
                                        <span class="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <ChevronUp class="w-2.5 h-2.5" :class="sortField === 'issueDate' && sortDir === 'asc' ? 'text-blue-600 opacity-100' : ''" />
                                            <ChevronDown class="w-2.5 h-2.5 -mt-1" :class="sortField === 'issueDate' && sortDir === 'desc' ? 'text-blue-600 opacity-100' : ''" />
                                        </span>
                                    </div>
                                </th>
                                <th @click="toggleSort('businessPartnerCode')" class="text-left px-4 sm:px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-700 select-none transition-colors group hidden sm:table-cell">
                                    <div class="flex items-center gap-1.5">
                                        Business Partner
                                        <span class="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <ChevronUp class="w-2.5 h-2.5" :class="sortField === 'businessPartnerCode' && sortDir === 'asc' ? 'text-blue-600 opacity-100' : ''" />
                                            <ChevronDown class="w-2.5 h-2.5 -mt-1" :class="sortField === 'businessPartnerCode' && sortDir === 'desc' ? 'text-blue-600 opacity-100' : ''" />
                                        </span>
                                    </div>
                                </th>
                                <th class="text-left px-4 sm:px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                                <th class="text-left px-4 sm:px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Vendor Ref.</th>
                                <th class="text-center px-4 sm:px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                                <th class="text-center px-4 sm:px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">View More</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <template v-if="paginatedIssues.length > 0">
                                <tr v-for="(issue, idx) in paginatedIssues" :key="issue._id"
                                    class="hover:bg-blue-50/50 transition-colors duration-150 group">
                                    <!-- <td class="px-4 sm:px-5 py-3.5 text-xs text-gray-400 font-medium">
                                        {{ (currentPage - 1) * PAGE_SIZE + idx + 1 }}
                                    </td> -->
                                    <td class="px-4 sm:px-5 py-3.5">
                                        <span class="font-mono text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg group-hover:bg-blue-100 transition-colors whitespace-nowrap">
                                            {{ issue.code }}
                                        </span>
                                    </td>
                                    <td class="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                                        <div class="text-sm font-semibold text-gray-800">{{ formatDate(issue.issueDate) }}</div>
                                        <div class="text-xs text-gray-400 mt-0.5">{{ formatTime(issue.issueDate) }}</div>
                                    </td>
                                    <td class="px-4 sm:px-5 py-3.5 hidden sm:table-cell">
                                        <span class="inline-flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                            <Building2 class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            {{ businessPartnerStore.getBusinessPartnerNameByCode(issue.businessPartnerCode) }}
                                        </span>
                                    </td>
                                    <td class="px-4 sm:px-5 py-3.5 hidden md:table-cell">
                                        <div class="flex flex-wrap gap-1.5">
                                            <span v-for="cat in issue.categories" :key="cat"
                                                class="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                                                {{ categoryStore.getCategoryNameByCode(cat) }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-4 sm:px-5 py-3.5 hidden lg:table-cell">
                                        <span class="text-sm text-gray-600">{{ issue.vendorReference || '-' }}</span>
                                    </td>
                                    <td class="px-4 sm:px-5 py-3.5 text-center">
                                        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                                            :class="issue.items?.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'">
                                            {{ issue.items?.length ?? 0 }}
                                        </span>
                                    </td>
                                    <td class="px-4 sm:px-5 py-3.5 text-center">
                                        <button @click="openDetail(issue)"
                                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-md hover:shadow-blue-200">
                                            <Eye class="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            </template>
                            <tr v-else>
                                <td colspan="8" class="px-5 py-16 text-center">
                                    <div class="flex flex-col items-center gap-3">
                                        <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            <ClipboardPlus class="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p class="text-gray-500 font-semibold">ไม่พบข้อมูล</p>
                                        <p class="text-gray-400 text-sm">ลองปรับเงื่อนไขการกรองใหม่</p>
                                        <button v-if="activeFilterCount > 0" @click="clearFilters"
                                            class="mt-1 text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5">
                                            <X class="w-3.5 h-3.5" /> ล้างตัวกรอง
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="filteredIssues.length > 0"
                    class="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                    <span>
                        แสดง
                        <span class="font-bold text-gray-700">
                            {{ Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredIssues.length) }}–{{ Math.min(currentPage * PAGE_SIZE, filteredIssues.length) }}
                        </span>
                        จาก <span class="font-bold text-gray-700">{{ filteredIssues.length }}</span> รายการ
                        <span v-if="activeFilterCount > 0" class="ml-2 text-blue-600 font-semibold">
                            (กำลังกรองอยู่ {{ activeFilterCount }} เงื่อนไข)
                        </span>
                    </span>

                    <div class="flex items-center gap-1">
                        <button @click="currentPage--" :disabled="currentPage === 1"
                            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            ‹
                        </button>

                        <button v-for="p in totalPages" :key="p" @click="currentPage = p"
                            class="w-7 h-7 rounded-lg border text-xs font-semibold transition-all"
                            :class="p === currentPage
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'">
                            {{ p }}
                        </button>

                        <button @click="currentPage++" :disabled="currentPage === totalPages"
                            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <GoodsIssueModal v-model="showModal" />

        <GoodsIssueDetailModal
            v-model="showDetailModal"
            :issue="selectedIssue"
        />
    </AdminLayout>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
    transition: all 0.25s ease;
    overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
    max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0;
}
.slide-enter-to, .slide-leave-from {
    max-height: 300px; opacity: 1;
}
</style>