<script setup>
import { ref, onMounted } from 'vue'
import { Settings, Users , FolderCog } from 'lucide-vue-next'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import Swal from 'sweetalert2'
import { useUnitStore } from '../../../stores/admins/unitStore'
import { useCategoryStore } from '../../../stores/admins/categoryStore'
import { useBusinessPartnerStore } from '../../../stores/admins/businessStore'
import { useVendorStore } from '../../../stores/admins/vendorStore'
import { useLocationWhStore } from '../../../stores/admins/locationWhStore'

import CategorySection from '../../../components/admins/settings/CategorySection.vue'
import UnitSection from '../../../components/admins/settings/UnitSection.vue'
import BusinessPartnerSection from '../../../components/admins/settings/BusinessPartnerSection.vue'
import VenderSection from '../../../components/admins/settings/VendorSection.vue'
import LocationWhSection from '../../../components/admins/settings/LocationWhSection.vue'

const unitStore = useUnitStore()
const categoryStore = useCategoryStore()
const businessPartnerStore = useBusinessPartnerStore()
const vendorStore = useVendorStore()
const locationWhStore = useLocationWhStore()

const showModal = ref(false)
const currentSettingType = ref('')
const isEditMode = ref(false)
const editId = ref(null)

const formData = ref({
    name: '',
    description: '',
    tel1: '',
    tel2: '',
    fax: '',
    mobilePhone: '',
    email: '',
    website: '',
    businessType: ''
})

// Modal configurations
const modalConfigs = {
    category: {
        title: 'Add a category',
        nameLabel: 'Name',
        namePlaceholder: 'Ex. Eqipment Instrument',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'More details about this category.'
    },
    unit: {
        title: 'Add counting unit',
        nameLabel: 'Name',
        namePlaceholder: 'Ex. Pcs Set Unit',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'Further details about this unit of measurement.'
    },
    businessPartner: {
        title: 'Add a business partner',
        nameLabel: 'Company Name',
        namePlaceholder: 'Ex. Taikisha ABB',
        descriptionLabel: 'Address',
        descriptionPlaceholder: 'Address, contact number, email.'
    },
    vender: {
        title: 'Add a vender',
        nameLabel: 'Company Name',
        namePlaceholder: 'Ex. Kelvion Tate',
        descriptionLabel: 'Address',
        descriptionPlaceholder: 'Address, contact number, email.',
        typeLabel: 'Type of Vendor'
    },
    locationWh: {
        title: 'Add a location warehouse',
        nameLabel: 'Name',
        namePlaceholder: 'Ex. Warehouse A',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'More details about this location.'
    }
}

// Open modal
const openModal = (type, item = null) => {
    currentSettingType.value = type

    if (item) {
        isEditMode.value = true
        editId.value = item._id

        if (type === 'businessPartner' || type === 'vender') {
            formData.value = {
                name: item.name || '',
                description: item.description || '',
                tel1: item.tel1 || '',
                tel2: item.tel2 || '',
                fax: item.fax || '',
                mobilePhone: item.mobilePhone || '',
                email: item.email || '',
                website: item.website || '',
                businessType: item.businessType || ''
            }
        } else {
            formData.value = {
                name: item.name || '',
                description: item.description || '',
                tel1: '',
                tel2: '',
                fax: '',
                mobilePhone: '',
                email: '',
                website: '',
                businessType: ''
            }
        }

    } else {
        isEditMode.value = false
        editId.value = null
        formData.value = {
            name: '',
            description: '',
            tel1: '',
            tel2: '',
            fax: '',
            mobilePhone: '',
            email: '',
            website: '',
            businessType: ''
        }
    }

    showModal.value = true
}

// Close modal
const closeModal = () => {
    showModal.value = false
    currentSettingType.value = ''
    isEditMode.value = false
    editId.value = null
}

// Submit form
const submitForm = async () => {
    if (!formData.value.name.trim()) {
        await Swal.fire({
            icon: 'warning',
            title: 'Please enter a name'
        })
        return
    }

    const result = await Swal.fire({
        title: 'Confirm submission?',
        text: isEditMode.value
            ? 'Do you want to update this data?'
            : 'Do you want to create this data?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    try {
        const type = currentSettingType.value
        let submitData = {}

        if (type === 'businessPartner' || type === 'vender') {
            submitData = {
                name: formData.value.name,
                description: formData.value.description,
                tel1: formData.value.tel1,
                tel2: formData.value.tel2,
                fax: formData.value.fax,
                mobilePhone: formData.value.mobilePhone,
                email: formData.value.email,
                website: formData.value.website,
                businessType: formData.value.businessType
            }

            let response
            if (type === 'businessPartner') {
                if (isEditMode.value && editId.value) {
                    response = await businessPartnerStore.updateBusinessPartner(editId.value, submitData)
                } else {
                    response = await businessPartnerStore.createBusinessPartner(submitData)
                }
            } else if (type === 'vender') {
                if (isEditMode.value && editId.value) {
                    response = await vendorStore.updateVendor(editId.value, submitData)
                } else {
                    response = await vendorStore.createVendor(submitData)
                }
            }

            if (!response.success) return

        } else if (type === 'category') {
            submitData = {
                name: formData.value.name,
                description: formData.value.description
            }

            let response
            if (isEditMode.value && editId.value) {
                response = await categoryStore.updateCategory(editId.value, submitData)
            } else {
                response = await categoryStore.createCategory(submitData)
            }

            if (!response.success) return

        } else if (type === 'unit') {
            submitData = {
                name: formData.value.name,
                description: formData.value.description
            }

            let response
            if (isEditMode.value && editId.value) {
                response = await unitStore.updateUnit(editId.value, submitData)
            } else {
                response = await unitStore.createUnit(submitData)
            }

            if (!response.success) return
        } else if (type === 'locationWh') {
            submitData = {
                name: formData.value.name,
                description: formData.value.description
            }

            let response
            if (isEditMode.value && editId.value) {
                response = await locationWhStore.updateLocation(editId.value, submitData)
            } else {
                response = await locationWhStore.createLocation(submitData)
            }

            if (!response.success) return
        }

        closeModal()

        await Swal.fire({
            icon: 'success',
            title: isEditMode.value
                ? `Updated ${modalConfigs[type].title} successfully`
                : `Created ${modalConfigs[type].title} successfully`,
            showConfirmButton: false,
            timer: 1500
        })

    } catch (error) {
        console.error('ERROR:', error.response || error.message || error)

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to save data'
        })
    }
}

onMounted(() => {
    console.log('API URL:', import.meta.env.VITE_API_URL)
    unitStore.fetchUnits()
    categoryStore.fetchCategories()
    businessPartnerStore.fetchBusinessPartners()
    vendorStore.fetchVendors()
    locationWhStore.fetchLocations()
})
</script>

<template>
    <AdminLayout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

            <div>
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
                            <FolderCog class="w-5 h-5 text-white"/>
                        </div>

                        <div>
                            <p class="text-white font-semibold text-xl">
                                Configure System Information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-7 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 lg:gap-6">
                <CategorySection @open-modal="openModal" class="self-start" />

                <UnitSection @open-modal="openModal" class="self-start" />

                <BusinessPartnerSection @open-modal="openModal" class="self-start" />

                <VenderSection @open-modal="openModal" class="self-start" />

                <LocationWhSection @open-modal="openModal" class="self-start" />

                <div
                    class="bg-white rounded-xl shadow-md border border-gray-100 opacity-50 hover:opacity-75 transition-opacity duration-300">
                    <div class="p-4 sm:p-5 lg:p-6">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-gray-100 rounded-lg">
                                <Settings class="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                            </div>
                            <p class="text-lg sm:text-xl font-semibold text-gray-400">
                                Coming Soon
                            </p>
                        </div>
                        <div class="mt-4 text-sm text-gray-400">
                            Further development in progress...
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal (same as before) -->
        <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
            aria-modal="true">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div
                    class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="flex items-start justify-between">
                            <h3 class="text-xl font-semibold leading-6 text-gray-900" id="modal-title">
                                {{ isEditMode ? `Edit ${modalConfigs[currentSettingType]?.title || 'ข้อมูล'}` :
                                    (modalConfigs[currentSettingType]?.title || 'เพิ่มข้อมูล') }}
                            </h3>

                            <button @click="closeModal"
                                class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none">
                                <X class="h-6 w-6" />
                            </button>
                        </div>

                        <div class="mt-6 space-y-4">
                            <div>
                                <div class="flex gap-1">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        {{ modalConfigs[currentSettingType]?.nameLabel || 'ชื่อ' }}
                                    </label>
                                    <span class="text-red-500">*</span>
                                </div>
                                <input v-model="formData.name" type="text"
                                    :placeholder="modalConfigs[currentSettingType]?.namePlaceholder || 'กรุณากรอกชื่อ'"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    @keyup.enter="submitForm" />
                            </div>

                            <!-- Description Field -->
                            <div v-if="currentSettingType !== 'businessPartner' && currentSettingType !== 'vender' && currentSettingType !== 'locationWh'">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    {{ modalConfigs[currentSettingType]?.descriptionLabel || 'รายละเอียด' }}
                                </label>
                                <textarea v-model="formData.description"
                                    :placeholder="modalConfigs[currentSettingType]?.descriptionPlaceholder || 'กรุณากรอกรายละเอียด'"
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                            </div>
                            <div v-else-if="currentSettingType === 'locationWh'">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea v-model="formData.description"
                                    placeholder="Description of this location"
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                            </div>
                            <div v-else>
                                <label class="block text-md font-medium text-gray-700 mb-2">
                                    <p>General Information</p>
                                </label>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tel 1</label>
                                        <input v-model="formData.tel1" type="text"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tel 2</label>
                                        <input v-model="formData.tel2" type="text"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Fax</label>
                                        <input v-model="formData.fax" type="text"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
                                        <input v-model="formData.mobilePhone" type="text"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                        <input v-model="formData.email" type="email"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                        <input v-model="formData.website" type="text"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div class="col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            {{
                                                currentSettingType === 'vender'
                                                    ? (modalConfigs['vender'].typeLabel || 'Type of Vendor')
                                            : 'Type of Business'
                                            }}
                                        </label>
                                        <select v-model="formData.businessType"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <option value="" disabled selected>Type</option>
                                            <option value="Company">Company</option>
                                            <option value="Private">Private</option>
                                            <option value="Government">Government</option>
                                            <option value="Employee">Employee</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                        <button @click="submitForm" type="button"
                            class="inline-flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto">
                            {{ isEditMode ? 'Update' : 'Save' }}
                        </button>
                        <button @click="closeModal" type="button"
                            class="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-base font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:mt-0 sm:w-auto">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<style scoped>
button {
    transition: all 0.2s ease-in-out;
}

@media (max-width: 640px) {
    button span {
        font-size: 0.875rem;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.bg-white {
    animation: fadeIn 0.3s ease-out;
}
</style>