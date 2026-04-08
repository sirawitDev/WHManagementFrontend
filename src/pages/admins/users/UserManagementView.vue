<script setup>
import AdminLayout from "../../../layouts/AdminLayout.vue";
import AddUserModal from "../../../components/admins/AddUserModal.vue";
import EditUserModal from "../../../components/admins/EditUserModal.vue";

import { Users, Search, ChevronUp, ChevronDown, Shield, Phone, Mail, Hash, User, Pencil, Trash2 } from "lucide-vue-next"
import { useUserStore } from "../../../stores/admins/userStore";
import { onMounted, ref, computed } from "vue";

const userStore = useUserStore()
const searchQuery = ref('')
const sortKey = ref('memberId')
const sortAsc = ref(true)

const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedUserId = ref(null)

onMounted(async () => {
    await userStore.fetchUsers()
})

const handleEditUser = (userId) => {
    selectedUserId.value = userId
    showEditModal.value = true
}

const handleUserUpdated = async () => {
    await userStore.fetchUsers()
}

const handleDeleteUser = async (userId, userName) => {
    await userStore.deleteUser(userId, userName)
    await userStore.fetchUsers()
}

const handleUserAdded = async () => {
    await userStore.fetchUsers()
}

const roleColor = (role) => {
    const map = {
        admin: 'role-admin',
        checker: 'role-checker',
        user: 'role-user',
    }
    return map[role] ?? 'role-default'
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric'
    })
}

function formatThaiPhone(phone) {
    const digits = String(phone ?? '').replace(/\D/g, '')
    if (digits.length !== 10) return phone || '-'
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

const getInitials = (firstname, lastname) => {
    return `${firstname?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase()
}

const filteredUsers = computed(() => {
    const q = searchQuery.value.toLowerCase()
    let list = (userStore.users ?? []).filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.memberId?.toLowerCase().includes(q) ||
        u.firstname?.toLowerCase().includes(q) ||
        u.lastname?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    )
    list = [...list].sort((a, b) => {
        const av = a[sortKey.value] ?? ''
        const bv = b[sortKey.value] ?? ''
        return sortAsc.value ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return list
})

const toggleSort = (key) => {
    if (sortKey.value === key) sortAsc.value = !sortAsc.value
    else { sortKey.value = key; sortAsc.value = true }
}
</script>

<template>
    <AdminLayout>
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5">

            <div
                class="header-card p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="icon-wrap">
                        <Users class="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p class="font-bold text-lg sm:text-xl tracking-wide">Users Management</p>
                        <!-- <p class="text-blue-200 text-xs sm:text-sm mt-0.5">
                            ทั้งหมด {{ filteredUsers.length }} รายการ
                        </p> -->
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <div class="search-wrap">
                        <input v-model="searchQuery" type="text" placeholder="Search by Name, Email, or Code..."
                            class="search-input" />
                    </div>

                    <button @click="showAddModal = true" class="add-user-btn">
                        <Users class="w-4 h-4 text-nowrap" />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            <AddUserModal v-model="showAddModal" @user-added="handleUserAdded" />
            <EditUserModal v-model="showEditModal" :user-id="selectedUserId" @user-updated="handleUserUpdated" />

            <div class="table-card">

                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="table-head-row">
                                <!-- <th class="th">#</th> -->
                                <th class="th cursor-pointer select-none" @click="toggleSort('memberId')">
                                    <span class="flex items-center gap-1">
                                        UUID
                                        <span class="sort-icons">
                                            <ChevronUp
                                                :class="['sort-arrow', sortKey === 'memberId' && sortAsc ? 'active' : '']" />
                                            <ChevronDown
                                                :class="['sort-arrow', sortKey === 'memberId' && !sortAsc ? 'active' : '']" />
                                        </span>
                                    </span>
                                </th>
                                <th class="th cursor-pointer select-none" @click="toggleSort('firstname')">
                                    <span class="flex items-center gap-1">
                                        Firstname - Lastname
                                        <span class="sort-icons">
                                            <ChevronUp
                                                :class="['sort-arrow', sortKey === 'firstname' && sortAsc ? 'active' : '']" />
                                            <ChevronDown
                                                :class="['sort-arrow', sortKey === 'firstname' && !sortAsc ? 'active' : '']" />
                                        </span>
                                    </span>
                                </th>
                                <th class="th">Username</th>
                                <th class="th">email</th>
                                <th class="th">tel</th>
                                <th class="th cursor-pointer select-none" @click="toggleSort('role')">
                                    <span class="flex items-center gap-1">
                                        role
                                        <span class="sort-icons">
                                            <ChevronUp
                                                :class="['sort-arrow', sortKey === 'role' && sortAsc ? 'active' : '']" />
                                            <ChevronDown
                                                :class="['sort-arrow', sortKey === 'role' && !sortAsc ? 'active' : '']" />
                                        </span>
                                    </span>
                                </th>
                                <th class="th text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="filteredUsers.length === 0">
                                <td colspan="8" class="empty-state">ไม่พบข้อมูลผู้ใช้</td>
                            </tr>
                            <tr v-for="(user, index) in filteredUsers" :key="user._id" class="table-row">
                                <!-- <td class="td text-slate-400 text-sm">{{ index + 1 }}</td> -->
                                <td class="td">
                                    <span class="member-id">{{ user.memberId }}</span>
                                </td>
                                <td class="td">
                                    <div class="flex items-center gap-2.5">
                                        <div v-if="user.profile_image" class="avatar-img">
                                            <img :src="user.profile_image" alt="avatar"
                                                class="w-full h-full object-cover" />
                                        </div>
                                        <div v-else class="avatar-initials">
                                            {{ getInitials(user.firstname, user.lastname) }}
                                        </div>
                                        <div>
                                            <p class="font-semibold text-slate-800 text-sm leading-tight">
                                                {{ user.firstname }} {{ user.lastname }}
                                            </p>
                                            <p class="text-slate-400 text-xs">{{ user.position }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="td">
                                    <span class="text-slate-600 text-sm font-mono">{{ user.username }}</span>
                                </td>
                                <td class="td">
                                    <span class="text-slate-600 text-sm">{{ user.email || '-' }}</span>
                                </td>
                                <td class="td">
                                    <span class="text-slate-600 text-sm">{{ formatThaiPhone(user.phone) }}</span>
                                </td>
                                <td class="td">
                                    <span :class="['role-badge', roleColor(user.role)]">
                                        {{ user.role }}
                                    </span>
                                </td>
                                <td class="td">
                                    <div class="action-buttons">
                                        <button @click="handleEditUser(user._id)" class="action-btn edit-btn"
                                            title="แก้ไข">
                                            <Pencil class="w-4 h-4" />
                                        </button>
                                        <button
                                            @click="handleDeleteUser(user._id, `${user.firstname} ${user.lastname}`)"
                                            class="action-btn delete-btn" title="ลบ">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="md:hidden divide-y divide-slate-100">
                    <div v-if="filteredUsers.length === 0" class="empty-state">ไม่พบข้อมูลผู้ใช้</div>
                    <div v-for="user in filteredUsers" :key="user._id" class="mobile-card">
                        <div class="flex items-start gap-3">
                            <div v-if="user.profile_image" class="avatar-img-lg">
                                <img :src="user.profile_image" alt="avatar" class="w-full h-full object-cover" />
                            </div>
                            <div v-else class="avatar-initials-lg">
                                {{ getInitials(user.firstname, user.lastname) }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between gap-2">
                                    <p class="font-bold text-slate-800 text-sm truncate">
                                        {{ user.firstname }} {{ user.lastname }}
                                    </p>
                                    <div class="flex items-center gap-1">
                                        <span :class="['role-badge', roleColor(user.role)]">{{ user.role }}</span>
                                        <button @click="handleEditUser(user._id)" class="action-btn-mobile edit-btn"
                                            title="แก้ไข">
                                            <Pencil class="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            @click="handleDeleteUser(user._id, `${user.firstname} ${user.lastname}`)"
                                            class="action-btn-mobile delete-btn" title="ลบ">
                                            <Trash2 class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p class="text-xs text-slate-500 font-mono mt-0.5">@{{ user.username }}</p>

                                <div class="mt-2.5 space-y-1.5">
                                    <div class="mobile-info-row">
                                        <Hash class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span class="text-xs text-slate-600">{{ user.memberId }}</span>
                                    </div>
                                    <div class="mobile-info-row" v-if="user.email">
                                        <Mail class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span class="text-xs text-slate-600 truncate">{{ user.email }}</span>
                                    </div>
                                    <div class="mobile-info-row" v-if="user.phone">
                                        <Phone class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span class="text-xs text-slate-600">{{ formatThaiPhone(user.phone) }}</span>
                                    </div>
                                    <div class="mobile-info-row">
                                        <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span class="text-xs text-slate-500">{{ formatDate(user.createdAt) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </AdminLayout>
</template>

<style scoped>
.header-card {
    background: linear-gradient(135deg, #14158C 0%, #1e3a8a 50%, #1d4ed8 100%);
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(20, 21, 140, 0.3);
}

.icon-wrap {
    width: 2.75rem;
    height: 2.75rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    flex-shrink: 0;
}

.search-wrap {
    position: relative;
    width: 100%;
}

@media (min-width: 640px) {
    .search-wrap {
        width: 260px;
    }
}

.search-input {
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 0.625rem;
    color: white;
    font-size: 0.875rem;
    outline: none;
    transition: background 0.2s, border-color 0.2s;
    backdrop-filter: blur(4px);
}

.search-input::placeholder {
    color: rgba(255, 255, 255, 0.55);
}

.search-input:focus {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.5);
}

.table-card {
    background: white;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.table-head-row {
    background: #f1f5f9;
    border-bottom: 2px solid #e2e8f0;
}

.th {
    padding: 0.75rem 1rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    white-space: nowrap;
    text-align: left;
}

.th.text-center {
    text-align: center;
}

.table-row {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
}

.table-row:last-child {
    border-bottom: none;
}

.table-row:hover {
    background: #f8fafc;
}

.td {
    padding: 0.75rem 1rem;
    vertical-align: middle;
}

.sort-icons {
    display: inline-flex;
    flex-direction: column;
    gap: 0;
}

.sort-arrow {
    width: 0.7rem;
    height: 0.7rem;
    color: #cbd5e1;
}

.sort-arrow.active {
    color: #1d4ed8;
}

.avatar-img,
.avatar-initials {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;
}

.avatar-initials {
    background: linear-gradient(135deg, #14158C, #1d4ed8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: white;
}

.avatar-img-lg,
.avatar-initials-lg {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;
}

.avatar-initials-lg {
    background: linear-gradient(135deg, #14158C, #1d4ed8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: white;
}

/* Member ID */
.member-id {
    font-size: 0.75rem;
    font-weight: 600;
    color: #1d4ed8;
    font-family: monospace;
    background: #eff6ff;
    padding: 0.2rem 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #bfdbfe;
}

.role-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: capitalize;
    white-space: nowrap;
}

.role-admin {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
}

.role-checker {
    background: #ede9fe;
    color: #5b21b6;
    border: 1px solid #ddd6fe;
}

.role-user {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #6ee7b7;
}

.role-default {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
}

.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #94a3b8;
    font-size: 0.875rem;
}

.mobile-card {
    padding: 1rem;
    transition: background 0.15s;
}

.mobile-card:hover {
    background: #f8fafc;
}

.mobile-info-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
}

.action-btn {
    padding: 0.375rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
}

.edit-btn {
    color: #3b82f6;
}

.edit-btn:hover {
    background: #eff6ff;
    transform: scale(1.05);
}

.delete-btn {
    color: #ef4444;
}

.delete-btn:hover {
    background: #fef2f2;
    transform: scale(1.05);
}

.action-btn-mobile {
    padding: 0.25rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
}

.add-user-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 0.625rem;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
    white-space: nowrap;
}

.add-user-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
}

@media (max-width: 768px) {
    .td {
        padding: 0.75rem 0.5rem;
    }

    .action-buttons {
        gap: 0.25rem;
    }
}
</style>