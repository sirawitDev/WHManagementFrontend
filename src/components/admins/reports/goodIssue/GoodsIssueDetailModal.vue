<script setup>
import {
    X, ClipboardList, Calendar, Building2, Tag, FileText,
    Package, MapPin, Hash, Layers, MessageSquare, User, Clock
} from 'lucide-vue-next'
import { computed, onMounted } from 'vue'
import { useBusinessPartnerStore } from '../../../../stores/admins/businessStore'
import { useCategoryStore } from '../../../../stores/admins/categoryStore'
import { useUnitStore } from '../../../../stores/admins/unitStore'

const props = defineProps({
    modelValue: Boolean,
    issue: Object,
})

const businessPartnerStore = useBusinessPartnerStore()
const categoryStore = useCategoryStore()
const unitStore = useUnitStore()

const emit = defineEmits(['update:modelValue'])

function close() {
    emit('update:modelValue', false)
}

function formatDateTime(d) {
    if (!d) return '-'
    return new Date(d).toLocaleString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
}

function formatDate(d) {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
    })
}

const totalItems = computed(() =>
    props.issue?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0
)

onMounted(async () => {
    await businessPartnerStore.fetchBusinessPartners()
    await categoryStore.fetchCategories()
    await unitStore.fetchUnits()
})
</script>

<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" @click="close" />

                <!-- Modal Panel -->
                <div class="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    style="max-height: 95dvh;">

                    <!-- Header -->
                    <div class="shrink-0 px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100"
                        style="background: linear-gradient(135deg, #14158C 0%, #1e3a8a 50%, #1d4ed8 100%);">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                                    <ClipboardList class="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p class="text-white font-bold text-lg leading-tight">Goods Issue Details</p>
                                    <p class="text-blue-200 text-sm font-mono mt-0.5">{{ issue?.code }}</p>
                                </div>
                            </div>
                            <button @click="close"
                                class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0 mt-0.5">
                                <X class="w-4 h-4" />
                            </button>
                        </div>

                        <!-- Stats Strip -->
                        <!-- <div class="mt-4 grid grid-cols-3 gap-2">
                            <div class="bg-white/10 rounded-xl px-3 py-2 text-center">
                                <p class="text-blue-200 text-xs">รายการทั้งหมด</p>
                                <p class="text-white font-bold text-lg leading-tight">{{ issue?.items?.length ?? 0 }}
                                </p>
                            </div>
                            <div class="bg-white/10 rounded-xl px-3 py-2 text-center">
                                <p class="text-blue-200 text-xs">จำนวนรวม</p>
                                <p class="text-white font-bold text-lg leading-tight">{{ totalItems }}</p>
                            </div>
                            <div class="bg-white/10 rounded-xl px-3 py-2 text-center">
                                <p class="text-blue-200 text-xs">หมวดหมู่</p>
                                <p class="text-white font-bold text-lg leading-tight">{{ issue?.categories?.length ?? 0
                                }}</p>
                            </div>
                        </div> -->
                    </div>

                    <!-- Scrollable Body -->
                    <div class="overflow-y-auto flex-1 px-5 sm:px-6 py-5 space-y-5">

                        <!-- General Info -->
                        <section>
                            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">General Information</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                <div class="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                                    <div
                                        class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                        <Calendar class="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-400 font-medium">Issue Date</p>
                                        <p class="text-sm font-semibold text-gray-800 mt-0.5">{{
                                            formatDate(issue?.issueDate) }}</p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                                    <div
                                        class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                        <Building2 class="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-400 font-medium">Business Partner</p>
                                        <p class="text-sm font-semibold text-gray-800 mt-0.5">
                                            <template v-if="issue?.businessPartnerCode">
                                                {{
                                                    businessPartnerStore.getBusinessPartnerNameByCode(issue.businessPartnerCode)
                                                }}
                                                <span class="text-xs font-normal text-gray-500 ml-1 font-mono">({{
                                                    issue.businessPartnerCode }})</span>
                                            </template>
                                            <template v-else>-</template>
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                                    <div
                                        class="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                        <FileText class="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-400 font-medium">Vendor Reference</p>
                                        <p class="text-sm font-semibold text-gray-800 mt-0.5">{{ issue?.vendorReference
                                            || '-' }}</p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                                    <div
                                        class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                        <Tag class="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-400 font-medium">Category</p>
                                        <div class="flex flex-wrap gap-1.5 mt-1.5">
                                            <span v-for="cat in issue?.categories" :key="cat"
                                                class="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                                                {{ categoryStore.getCategoryNameByCode(cat) }}
                                            </span>
                                            <span v-if="!issue?.categories?.length"
                                                class="text-sm text-gray-400">-</span>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="issue?.remark"
                                    class="sm:col-span-2 flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
                                    <div
                                        class="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                        <MessageSquare class="w-4 h-4 text-teal-600" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-400 font-medium">หมายเหตุ</p>
                                        <p class="text-sm text-gray-700 mt-0.5 leading-relaxed">{{ issue?.remark }}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Items Table -->
                        <section>
                            <h3
                                class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Package class="w-3.5 h-3.5" />All Items
                                <span class="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{{
                                    issue?.items?.length ?? 0
                                }}</span>
                            </h3>

                            <div class="rounded-xl border border-gray-200 overflow-hidden">
                                <div class="overflow-x-auto">
                                    <table class="w-full min-w-[520px] text-sm">
                                        <thead>
                                            <tr
                                                class="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200">
                                                <th
                                                    class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    #</th>
                                                <th
                                                    class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Code
                                                </th>
                                                <th
                                                    class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    name</th>
                                                <th
                                                    class="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    quantity
                                                </th>
                                                <th
                                                    class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                    location</th>
                                                <th
                                                    class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                                    remark</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-100">
                                            <tr v-for="(item, i) in issue?.items" :key="item._id"
                                                class="hover:bg-blue-50/40 transition-colors">
                                                <td class="px-4 py-3 text-xs text-gray-400 font-medium">{{ i + 1 }}</td>
                                                <td class="px-4 py-3">
                                                    <span
                                                        class="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">{{
                                                            item.code }}</span>
                                                </td>
                                                <td class="px-4 py-3">
                                                    <p class="font-semibold text-gray-800 text-sm">{{ item.productName
                                                    }}</p>
                                                    <p class="text-xs text-gray-400 mt-0.5">Unit: {{ unitStore.getUnitNameByCode(item.unitId) }}</p>
                                                </td>
                                                <td class="px-4 py-3 text-center">
                                                    <span
                                                        class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-lg">
                                                        {{ item.quantity }}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-3 hidden sm:table-cell">
                                                    <span class="inline-flex items-center gap-1 text-xs text-gray-600">
                                                        <MapPin class="w-3 h-3 text-gray-400 shrink-0" />
                                                        {{ item.warehouseLocation }}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                                                    {{ item.remark || '-' }}
                                                </td>
                                            </tr>
                                            <tr v-if="!issue?.items?.length">
                                                <td colspan="6" class="px-4 py-8 text-center text-gray-400 text-sm">
                                                    ไม่มีรายการ</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        <!-- Timestamps -->
                        <section class="border-t border-gray-100 pt-4">
                            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">System Information</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div class="flex items-center gap-2.5 text-xs text-gray-500">
                                    <Clock class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>Created At: <span class="font-semibold text-gray-700">{{
                                        formatDateTime(issue?.createdAt)
                                    }}</span></span>
                                </div>
                                <div class="flex items-center gap-2.5 text-xs text-gray-500">
                                    <Clock class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>Last Updated: <span class="font-semibold text-gray-700">{{
                                        formatDateTime(issue?.updatedAt)
                                    }}</span></span>
                                </div>
                                <div v-if="issue?.createdBy" class="flex items-center gap-2.5 text-xs text-gray-500">
                                    <User class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>Created By: <span class="font-semibold text-gray-700">{{ issue.createdBy
                                    }}</span></span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div class="shrink-0 px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                        <button @click="close"
                            class="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors duration-200">
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-from .relative {
    transform: translateY(20px) scale(0.97);
    opacity: 0;
}

.modal-fade-leave-to .relative {
    transform: translateY(10px) scale(0.98);
    opacity: 0;
}
</style>