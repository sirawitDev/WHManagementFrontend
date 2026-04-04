<script setup>
import { Package, Search, ChevronLeft, ChevronRight, ArrowUpDown, TrendingDown, TrendingUp, RefreshCw, Filter, X } from 'lucide-vue-next'
import AdminLayout from '../../layouts/AdminLayout.vue';
import { useStockReportStore } from '../../stores/admins/reports/stockreportStore';
import { useUnitStore } from '../../stores/admins/unitStore';
import { useLocationWhStore } from '../../stores/admins/locationWhStore';
import { onMounted, ref, computed } from 'vue';

const stockReportStore = useStockReportStore()
const unitStore = useUnitStore()
const locationWhStore = useLocationWhStore()

onMounted(async () => {
    await stockReportStore.fetchStockReports()
    await unitStore.fetchUnits()
    await locationWhStore.fetchLocations()
})

// --- Pagination ---
const itemsPerPage = 5
const currentPage = ref(1)

// --- Filters ---
const searchFields = ref({
    code: '',
    goodIssueCode: '',
    materialCode: '',
    productName: '',
    warehouseLocation: '',
})
const showFilters = ref(false)

const hasActiveFilters = computed(() =>
    Object.values(searchFields.value).some(v => v.trim() !== '')
)

function clearFilters() {
    Object.keys(searchFields.value).forEach(k => searchFields.value[k] = '')
    currentPage.value = 1
}

function warehouseLocationMatches(report, query) {
    const q = query.trim().toLowerCase()
    if (!q) return true
    const code = (report.warehouseLocation || '').toLowerCase()
    const name = (locationWhStore.getLocationNameByCode(report.warehouseLocation) || '').toLowerCase()
    return code.includes(q) || name.includes(q)
}

const filteredReports = computed(() => {
    const reports = stockReportStore.stockReports || []
    return reports.filter(r => {
        const f = searchFields.value
        return (
            (!f.code || r.code?.toLowerCase().includes(f.code.toLowerCase())) &&
            (!f.goodIssueCode || r.goodIssueCode?.toLowerCase().includes(f.goodIssueCode.toLowerCase())) &&
            (!f.materialCode || r.materialCode?.toLowerCase().includes(f.materialCode.toLowerCase())) &&
            (!f.productName || r.productName?.toLowerCase().includes(f.productName.toLowerCase())) &&
            warehouseLocationMatches(r, f.warehouseLocation)
        )
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredReports.value.length / itemsPerPage)))

const paginatedReports = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return filteredReports.value.slice(start, start + itemsPerPage)
})

const pageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const delta = 2
    const pages = []
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i)
    }
    return pages
})

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

// Watch filters to reset page
function onFilterChange() {
    currentPage.value = 1
}

function formatDate(dateStr) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('th-TH', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}
</script>

<template>
    <AdminLayout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">

            <!-- Header -->
            <div class="p-4 sm:p-5 text-white flex justify-between items-center header-card">
                <div class="flex items-center gap-3">
                    <div class="icon-wrap">
                        <Package class="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p class="font-bold text-xl tracking-wide">Stock Reports</p>
                        <p class="text-blue-200 text-xs mt-0.5">
                            {{ filteredReports.length }} รายการ
                            <span v-if="hasActiveFilters" class="text-yellow-300">(กรองแล้ว)</span>
                        </p>
                    </div>
                </div>
                <button
                    @click="showFilters = !showFilters"
                    :class="['filter-btn', showFilters ? 'active' : '']"
                >
                    <Filter class="w-4 h-4" />
                    <span class="hidden sm:inline">ตัวกรอง</span>
                    <span v-if="hasActiveFilters" class="filter-badge"></span>
                </button>
            </div>

            <!-- Filter Panel -->
            <Transition name="slide-down">
                <div v-if="showFilters" class="filter-panel">
                    <div class="filter-panel-header">
                        <div class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Filter class="w-4 h-4 text-blue-600" />
                            ค้นหาและกรองข้อมูล
                        </div>
                        <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">
                            <X class="w-3 h-3" /> ล้างทั้งหมด
                        </button>
                    </div>
                    <div class="filter-grid">
                        <div v-for="field in [
                            { key: 'code', label: 'รหัส Stock', placeholder: 'SR2026...' },
                            { key: 'goodIssueCode', label: 'Good Issue Code', placeholder: 'GI...' },
                            { key: 'materialCode', label: 'รหัสวัสดุ', placeholder: '126...' },
                            { key: 'productName', label: 'ชื่อสินค้า', placeholder: 'ค้นหาสินค้า...' },
                            { key: 'warehouseLocation', label: 'คลังสินค้า', placeholder: 'รหัสหรือชื่อคลัง...' },
                        ]" :key="field.key" class="filter-field">
                            <label class="filter-label">{{ field.label }}</label>
                            <div class="input-wrap">
                                <Search class="input-icon" />
                                <input
                                    v-model="searchFields[field.key]"
                                    @input="onFilterChange"
                                    :placeholder="field.placeholder"
                                    class="filter-input"
                                />
                                <button v-if="searchFields[field.key]"
                                    @click="searchFields[field.key] = ''; onFilterChange()"
                                    class="input-clear">
                                    <X class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>

            <!-- Table Card -->
            <div class="table-card">

                <!-- Desktop Table -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="table-head-row">
                                <th class="th">#</th>
                                <th class="th">รหัส Stock</th>
                                <th class="th">Good Issue Code</th>
                                <th class="th">รหัสวัสดุ</th>
                                <th class="th">ชื่อสินค้า</th>
                                <th class="th">ประเภท</th>
                                <th class="th text-right">จำนวน</th>
                                <th class="th text-right">สต็อกก่อน</th>
                                <th class="th text-right">สต็อกปัจจุบัน</th>
                                <th class="th">คลังสินค้า</th>
                                <th class="th">วันที่</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="paginatedReports.length === 0">
                                <td colspan="11" class="empty-state">
                                    <div class="flex flex-col items-center gap-2 py-12 text-slate-400">
                                        <Package class="w-10 h-10 opacity-30" />
                                        <p class="text-sm">ไม่พบข้อมูล</p>
                                    </div>
                                </td>
                            </tr>
                            <tr
                                v-for="(item, idx) in paginatedReports"
                                :key="item._id"
                                class="table-row"
                            >
                                <td class="td text-slate-400 font-mono text-xs">
                                    {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                                </td>
                                <td class="td">
                                    <span class="code-badge">{{ item.code }}</span>
                                </td>
                                <td class="td">
                                    <span class="text-slate-600 font-mono text-xs">{{ item.goodIssueCode || '-' }}</span>
                                </td>
                                <td class="td">
                                    <span class="text-slate-700 font-mono text-xs">{{ item.materialCode }}</span>
                                </td>
                                <td class="td">
                                    <span class="font-medium text-slate-800">{{ item.productName }}</span>
                                </td>
                                <td class="td">
                                    <span :class="['type-badge', item.transactionType === 'ISSUE' ? 'issue' : 'receive']">
                                        <TrendingDown v-if="item.transactionType === 'ISSUE'" class="w-3 h-3" />
                                        <TrendingUp v-else class="w-3 h-3" />
                                        {{ item.transactionType }}
                                    </span>
                                </td>
                                <td class="td text-right">
                                    <span class="font-semibold text-slate-700">{{ item.quantity?.toLocaleString() }}</span>
                                    <span class="text-xs text-slate-400 ml-1">{{ unitStore.getUnitNameByCode(item.unitId) }}</span>
                                </td>
                                <td class="td text-right text-slate-500 font-mono text-xs">{{ item.previousStock?.toLocaleString() }}</td>
                                <td class="td text-right">
                                    <span :class="['stock-num', item.currentStock === 0 ? 'zero' : 'positive']">
                                        {{ item.currentStock?.toLocaleString() }}
                                    </span>
                                </td>
                                <td class="td">
                                    <span class="warehouse-badge">{{ locationWhStore.getLocationNameByCode(item.warehouseLocation) }}</span>
                                </td>
                                <td class="td text-xs text-slate-500 whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Mobile Cards -->
                <div class="md:hidden space-y-3 p-4">
                    <div v-if="paginatedReports.length === 0" class="flex flex-col items-center gap-2 py-10 text-slate-400">
                        <Package class="w-10 h-10 opacity-30" />
                        <p class="text-sm">ไม่พบข้อมูล</p>
                    </div>
                    <div v-for="(item, idx) in paginatedReports" :key="item._id" class="mobile-card">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <span class="code-badge">{{ item.code }}</span>
                                <p class="font-semibold text-slate-800 mt-1.5 text-sm">{{ item.productName }}</p>
                                <p class="text-xs text-slate-500 font-mono mt-0.5">{{ item.materialCode }}</p>
                            </div>
                            <span :class="['type-badge', item.transactionType === 'ISSUE' ? 'issue' : 'receive']">
                                <TrendingDown v-if="item.transactionType === 'ISSUE'" class="w-3 h-3" />
                                <TrendingUp v-else class="w-3 h-3" />
                                {{ item.transactionType }}
                            </span>
                        </div>
                        <div class="grid grid-cols-3 gap-2 mb-3">
                            <div class="stat-chip">
                                <p class="stat-label">จำนวน</p>
                                <p class="stat-val">{{ item.quantity?.toLocaleString() }}</p>
                            </div>
                            <div class="stat-chip">
                                <p class="stat-label">สต็อกก่อน</p>
                                <p class="stat-val text-slate-500">{{ item.previousStock?.toLocaleString() }}</p>
                            </div>
                            <div class="stat-chip">
                                <p class="stat-label">สต็อกปัจจุบัน</p>
                                <p :class="['stat-val', item.currentStock === 0 ? 'text-red-500' : 'text-emerald-600']">
                                    {{ item.currentStock?.toLocaleString() }}
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 text-xs text-slate-500">
                            <span class="flex items-center gap-1"><Package class="w-3 h-3 text-blue-400" /> {{ item.warehouseLocation }}</span>
                            <span>·</span>
                            <span class="font-mono">{{ item.goodIssueCode }}</span>
                            <span>·</span>
                            <span>{{ formatDate(item.createdAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-bar">
                    <div class="text-xs text-slate-500">
                        แสดง {{ Math.min((currentPage - 1) * itemsPerPage + 1, filteredReports.length) }}–{{ Math.min(currentPage * itemsPerPage, filteredReports.length) }}
                        จาก {{ filteredReports.length }} รายการ
                    </div>
                    <div class="flex items-center gap-1">
                        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn nav">
                            <ChevronLeft class="w-4 h-4" />
                        </button>
                        <button v-if="pageNumbers[0] > 1" @click="goToPage(1)" class="page-btn">1</button>
                        <span v-if="pageNumbers[0] > 2" class="text-slate-400 px-1">…</span>
                        <button
                            v-for="p in pageNumbers" :key="p"
                            @click="goToPage(p)"
                            :class="['page-btn', p === currentPage ? 'active' : '']"
                        >{{ p }}</button>
                        <span v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1" class="text-slate-400 px-1">…</span>
                        <button v-if="pageNumbers[pageNumbers.length - 1] < totalPages" @click="goToPage(totalPages)" class="page-btn">{{ totalPages }}</button>
                        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn nav">
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<style scoped>
/* Header */
.header-card {
    background: linear-gradient(135deg, #14158C 0%, #1e3a8a 50%, #1d4ed8 100%);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(20, 21, 140, 0.3);
}
.icon-wrap {
    width: 3rem; height: 3rem;
    background: rgba(255,255,255,0.15);
    border-radius: 0.75rem;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
    flex-shrink: 0;
}
.filter-btn {
    display: flex; align-items: center; gap: 1.5px;
    position: relative;
    padding: 0.5rem 1rem;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: white;
    border-radius: 0.625rem;
    font-size: 0.8rem; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    gap: 0.4rem;
}
.filter-btn:hover, .filter-btn.active {
    background: rgba(255,255,255,0.25);
}
.filter-badge {
    position: absolute; top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #fbbf24;
    border-radius: 50%;
    border: 1.5px solid #1d4ed8;
}

/* Filter Panel */
.filter-panel {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.filter-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
}
.filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
}
.filter-label {
    display: block; font-size: 0.72rem; font-weight: 600;
    color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 0.3rem;
}
.input-wrap { position: relative; }
.input-icon {
    position: absolute; left: 0.6rem; top: 50%; transform: translateY(-50%);
    width: 0.85rem; height: 0.85rem; color: #94a3b8; pointer-events: none;
}
.filter-input {
    width: 100%; padding: 0.45rem 1.8rem 0.45rem 2rem;
    border: 1.5px solid #e2e8f0; border-radius: 0.5rem;
    font-size: 0.8rem; color: #1e293b;
    background: #f8fafc;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
}
.filter-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    background: white;
}
.input-clear {
    position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
    color: #94a3b8; cursor: pointer; padding: 0.1rem;
    background: none; border: none;
    display: flex; align-items: center;
}
.input-clear:hover { color: #ef4444; }
.clear-btn {
    display: flex; align-items: center; gap: 0.25rem;
    font-size: 0.75rem; color: #ef4444; font-weight: 600;
    background: #fef2f2; border: 1px solid #fecaca;
    padding: 0.3rem 0.65rem; border-radius: 0.4rem;
    cursor: pointer; transition: all 0.15s;
}
.clear-btn:hover { background: #fee2e2; }

/* Table Card */
.table-card {
    background: white;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    overflow: hidden;
}
.table-head-row { background: #f1f5f9; border-bottom: 2px solid #e2e8f0; }
.th {
    padding: 0.75rem 1rem;
    font-size: 0.72rem; font-weight: 700;
    color: #475569; text-transform: uppercase; letter-spacing: 0.06em;
    white-space: nowrap;
    text-align: left;
}
.table-row {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #f8fafc; }
.td { padding: 0.8rem 1rem; vertical-align: middle; }

/* Badges */
.code-badge {
    display: inline-block;
    font-size: 0.7rem; font-weight: 700; font-family: monospace;
    color: #1e3a8a; background: #eff6ff;
    border: 1px solid #bfdbfe;
    padding: 0.2rem 0.5rem; border-radius: 0.35rem;
    white-space: nowrap;
}
.type-badge {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.7rem; font-weight: 700;
    padding: 0.25rem 0.55rem; border-radius: 0.4rem;
    white-space: nowrap;
}
.type-badge.issue { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.type-badge.receive { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.stock-num { font-weight: 700; font-size: 0.85rem; }
.stock-num.zero { color: #ef4444; }
.stock-num.positive { color: #16a34a; }
.warehouse-badge {
    display: inline-block; font-size: 0.7rem; font-family: monospace;
    color: #4f46e5; background: #eef2ff;
    border: 1px solid #c7d2fe;
    padding: 0.2rem 0.5rem; border-radius: 0.35rem;
}
.empty-state { text-align: center; }

/* Mobile Cards */
.mobile-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 0.9rem;
    transition: box-shadow 0.2s;
}
.mobile-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.stat-chip {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 0.5rem; padding: 0.5rem 0.6rem; text-align: center;
}
.stat-label { font-size: 0.65rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.stat-val { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin-top: 0.1rem; }

/* Pagination */
.pagination-bar {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
    padding: 0.9rem 1.25rem;
    border-top: 1px solid #f1f5f9;
    background: #f8fafc;
}
.page-btn {
    min-width: 2rem; height: 2rem;
    display: flex; align-items: center; justify-content: center;
    border-radius: 0.45rem;
    font-size: 0.8rem; font-weight: 600;
    border: 1.5px solid #e2e8f0;
    background: white; color: #475569;
    cursor: pointer; transition: all 0.15s;
    padding: 0 0.4rem;
}
.page-btn:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
.page-btn.active { background: #1d4ed8; color: white; border-color: #1d4ed8; }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-btn.nav { background: #f1f5f9; }

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active {
    transition: all 0.25s ease;
    overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
    opacity: 0; transform: translateY(-8px);
}
</style>