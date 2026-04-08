<!-- EditUserModal.vue -->
<script setup>
import { ref, computed, watch } from 'vue'
import { X, User, Mail, Phone, Lock, Briefcase, AlertCircle } from 'lucide-vue-next'
import { useUserStore } from '../../stores/admins/userStore'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'user-updated'])

const userStore = useUserStore()

const formData = ref({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    confirmPassword: ''
})

const errors = ref({})
const isLoading = ref(false)
const isLoadingUser = ref(false)

const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const roleOptions = [
    { value: 'user', label: 'User', bgColor: '#d1fae5', textColor: '#065f46' },
    { value: 'checker', label: 'Checker', bgColor: '#ede9fe', textColor: '#5b21b6' },
    { value: 'admin', label: 'Admin', bgColor: '#fef3c7', textColor: '#92400e' }
]

// Load user data when modal opens
watch(isOpen, async (newVal) => {
    if (newVal && props.userId) {
        await loadUserData()
    } else if (!newVal) {
        resetForm()
    }
})

const loadUserData = async () => {
    isLoadingUser.value = true
    try {
        const result = await userStore.fetchUserById(props.userId)
        if (result.success && result.data) {
            const user = result.data
            formData.value = {
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'user',
                password: '',
                confirmPassword: ''
            }
        }
    } catch (error) {
        console.error('Error loading user:', error)
    } finally {
        isLoadingUser.value = false
    }
}

const validateForm = () => {
    const newErrors = {}

    if (!formData.value.firstname.trim()) {
        newErrors.firstname = 'กรุณากรอกชื่อ'
    }

    if (!formData.value.lastname.trim()) {
        newErrors.lastname = 'กรุณากรอกนามสกุล'
    }

    if (!formData.value.username.trim()) {
        newErrors.username = 'กรุณากรอก username'
    } else if (formData.value.username.length < 3) {
        newErrors.username = 'username ต้องมีอย่างน้อย 3 ตัวอักษร'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.value.username)) {
        newErrors.username = 'username ประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น'
    }

    if (!formData.value.email.trim()) {
        newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }

    if (!formData.value.phone.trim()) {
        newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    } else if (!/^[0-9]{10}$/.test(formData.value.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก'
    }

    // Password validation (only if password is provided)
    if (formData.value.password) {
        if (formData.value.password.length < 6) {
            newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
        }

        if (formData.value.password !== formData.value.confirmPassword) {
            newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
        }
    }

    errors.value = newErrors
    return Object.keys(newErrors).length === 0
}

const handlePhoneInput = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    formData.value.phone = value.slice(0, 10)
}

const resetForm = () => {
    formData.value = {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        phone: '',
        role: 'user',
        password: '',
        confirmPassword: ''
    }
    errors.value = {}
    isLoading.value = false
    isLoadingUser.value = false
}

const handleSubmit = async () => {
    if (!validateForm()) return

    isLoading.value = true

    // Prepare data for API
    const updateData = {
        firstname: formData.value.firstname.trim(),
        lastname: formData.value.lastname.trim(),
        username: formData.value.username.trim(),
        email: formData.value.email.trim(),
        phone: formData.value.phone.trim(),
        role: formData.value.role
    }

    // Only include password if it's provided
    if (formData.value.password) {
        updateData.password = formData.value.password
    }

    const result = await userStore.updateUser(props.userId, updateData)

    if (result.success) {
        emit('user-updated')
        isOpen.value = false
        resetForm()
    }

    isLoading.value = false
}

const closeModal = () => {
    if (!isLoading.value) {
        isOpen.value = false
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" class="modal-overlay" @click="closeModal">
            <div class="modal-container" @click.stop>
                <!-- Modal Header -->
                <div class="modal-header">
                    <div class="header-content">
                        <div class="icon-wrapper">
                            <User class="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 class="modal-title">Edit User</h2>
                            <p class="modal-subtitle">Edit User Information</p>
                        </div>
                    </div>
                    <button @click="closeModal" class="close-btn" :disabled="isLoading">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="modal-body">
                    <div v-if="isLoadingUser" class="loading-state">
                        <div class="loading-spinner-large"></div>
                        <p>Loading...</p>
                    </div>

                    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text">Firstname</span>
                                    <span class="required">*</span>
                                </label>
                                <input v-model="formData.firstname" type="text" class="form-input"
                                    :class="{ 'error': errors.firstname }" placeholder="Enter Lastname"
                                    :disabled="isLoading" />
                                <p v-if="errors.firstname" class="error-message">{{ errors.firstname }}</p>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    <span class="label-text">Lastname</span>
                                    <span class="required">*</span>
                                </label>
                                <input v-model="formData.lastname" type="text" class="form-input"
                                    :class="{ 'error': errors.lastname }" placeholder="Enter Lastname"
                                    :disabled="isLoading" />
                                <p v-if="errors.lastname" class="error-message">{{ errors.lastname }}</p>
                            </div>
                        </div>

                        <!-- Username -->
                        <div class="form-group">
                            <label class="form-label">
                                <User class="w-4 h-4" />
                                <span class="label-text">Username</span>
                                <span class="required">*</span>
                            </label>
                            <input v-model="formData.username" type="text" class="form-input"
                                :class="{ 'error': errors.username }" placeholder="Username For Login"
                                :disabled="isLoading" />
                            <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
                            <p class="hint-text">Use only letters, numbers, or underscores (_).</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <Mail class="w-4 h-4" />
                                <span class="label-text">Email</span>
                                <span class="required">*</span>
                            </label>
                            <input v-model="formData.email" type="email" class="form-input"
                                :class="{ 'error': errors.email }" placeholder="example@email.com"
                                :disabled="isLoading" />
                            <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <Phone class="w-4 h-4" />
                                <span class="label-text">Tel</span>
                                <span class="required">*</span>
                            </label>
                            <input v-model="formData.phone" type="tel" class="form-input" @input="handlePhoneInput"
                                :class="{ 'error': errors.phone }" placeholder="0812345678" :disabled="isLoading" />
                            <p v-if="errors.phone" class="error-message">{{ errors.phone }}</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <Briefcase class="w-4 h-4" />
                                <span class="label-text">Role</span>
                            </label>
                            <select v-model="formData.role" class="form-select" :disabled="isLoading">
                                <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
                                    {{ opt.label }}
                                </option>
                            </select>
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" @click="closeModal" class="btn-cancel" :disabled="isLoading">
                        Cancle
                    </button>
                    <button type="button" @click="handleSubmit" :disabled="isLoading" class="btn-submit">
                        <span v-if="isLoading" class="loading-spinner"></span>
                        <span v-else>Save Changes</span>
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease-out;
}

.modal-container {
    background: white;
    border-radius: 1rem;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: slideUp 0.3s ease-out;
}

.modal-header {
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, #14158C 0%, #1e3a8a 50%, #1d4ed8 100%);
    border-radius: 1rem 1rem 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal-title {
    color: white;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
}

.modal-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

.close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem;
    cursor: pointer;
    color: white;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
}

.close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    background: #f8fafc;
    border-radius: 0 0 1rem 1rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
}

.label-text {
    font-weight: 600;
}

.required {
    color: #ef4444;
    margin-left: 0.25rem;
}

.form-input,
.form-select {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.2s;
    background: white;
}

.form-input:focus,
.form-select:focus {
    outline: none;
    border-color: #1d4ed8;
    box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}

.form-input.error,
.form-select.error {
    border-color: #ef4444;
}

.form-input:disabled,
.form-select:disabled {
    background-color: #f1f5f9;
    cursor: not-allowed;
}

.error-message {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

.hint-text {
    color: #94a3b8;
    font-size: 0.7rem;
    margin-top: 0.25rem;
}

.password-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.password-toggle-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.loading-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #64748b;
}

.loading-spinner-large {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    border: 3px solid #e2e8f0;
    border-top-color: #1d4ed8;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-bottom: 1rem;
}

.btn-cancel,
.btn-submit {
    padding: 0.5rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-cancel {
    background: white;
    border: 1px solid #e2e8f0;
    color: #64748b;
}

.btn-cancel:hover:not(:disabled) {
    background: #f1f5f9;
    border-color: #cbd5e1;
}

.btn-cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-submit {
    background: linear-gradient(135deg, #14158C, #1d4ed8);
    color: white;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(20, 21, 140, 0.3);
}

.btn-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 640px) {
    .form-row {
        grid-template-columns: 1fr;
        gap: 0;
    }

    .modal-container {
        max-width: 95%;
        margin: 1rem;
    }

    .modal-header {
        padding: 1rem;
    }

    .modal-body {
        padding: 1rem;
    }
}
</style>