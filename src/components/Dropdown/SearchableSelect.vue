<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    // Model binding
    modelValue: {
        type: [String, Number, Object],
        default: null
    },

    // Options array
    options: {
        type: Array,
        required: true,
        default: () => []
    },

    // Option value key (if options are objects)
    valueKey: {
        type: String,
        default: '_id'
    },

    // Option label key (if options are objects)
    labelKey: {
        type: String,
        default: 'name'
    },

    // Label for the field
    label: {
        type: String,
        default: ''
    },

    // Placeholder text
    placeholder: {
        type: String,
        default: ''
    },

    // Search input placeholder
    searchPlaceholder: {
        type: String,
        default: ''
    },

    // Required field indicator
    required: {
        type: Boolean,
        default: false
    },

    // Disabled state
    disabled: {
        type: Boolean,
        default: false
    },

    // Unique name for the dropdown (for multiple instances)
    name: {
        type: String,
        default: 'select'
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

// State
const isOpen = ref(false)
const searchQuery = ref('')

// Computed
const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options
    return props.options.filter(option => {
        const label = getOptionLabel(option).toLowerCase()
        return label.includes(searchQuery.value.toLowerCase())
    })
})

const selectedDisplayValue = computed(() => {
    if (!props.modelValue) return null
    const selected = props.options.find(option => {
        const value = getOptionValue(option)
        return value === props.modelValue
    })
    return selected ? getOptionLabel(selected) : null
})

// Helper methods
const getOptionValue = (option) => {
    if (typeof option === 'object' && option !== null) {
        return option[props.valueKey]
    }
    return option
}

const getOptionLabel = (option) => {
    if (typeof option === 'object' && option !== null) {
        return option[props.labelKey]
    }
    return option
}

const isSelected = (option) => {
    const value = getOptionValue(option)
    return value === props.modelValue
}

const selectOption = (option) => {
    const value = getOptionValue(option)
    emit('update:modelValue', value)
    emit('change', value)
    closeDropdown()
    searchQuery.value = ''
}

const toggleDropdown = () => {
    if (!props.disabled) {
        isOpen.value = !isOpen.value
        if (isOpen.value) {
            // Focus search input when opening
            setTimeout(() => {
                const searchInput = document.querySelector(`.dropdown-${props.name} input`)
                if (searchInput) searchInput.focus()
            }, 100)
        }
    }
}

const closeDropdown = () => {
    isOpen.value = false
    searchQuery.value = ''
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
    const dropdownElement = event.target.closest(`.dropdown-${props.name}`)
    if (!dropdownElement) {
        closeDropdown()
    }
}

// Add click outside listener
if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside)
}

// Clean up
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

// Reset search when dropdown closes
watch(isOpen, (newVal) => {
    if (!newVal) {
        searchQuery.value = ''
    }
})
</script>

<template>
    <div class="searchable-select relative" :class="`dropdown-${name}`">
        <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
            {{ label }} <span v-if="required" class="text-red-500">*</span>
        </label>

        <!-- Dropdown trigger button -->
        <div @click="toggleDropdown"
            class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition"
            :class="{ 'border-blue-500 ring-2 ring-blue-200': isOpen }">
            <span :class="selectedDisplayValue ? 'text-gray-900' : 'text-gray-400'">
                {{ selectedDisplayValue || placeholder || '-- กรุณาเลือก --' }}
            </span>
            <svg class="w-5 h-5 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </div>

        <!-- Dropdown menu -->
        <div v-if="isOpen"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden"
            @click.stop>
            <!-- Search input -->
            <div class="p-2 border-b">
                <input type="text" v-model="searchQuery"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="searchPlaceholder || 'ค้นหา...'" @keyup.esc="closeDropdown">
            </div>

            <!-- Options list -->
            <div class="overflow-y-auto max-h-48">
                <div v-for="option in filteredOptions" :key="getOptionValue(option)" @click="selectOption(option)"
                    class="px-3 py-2 hover:bg-blue-50 cursor-pointer transition"
                    :class="{ 'bg-blue-100': isSelected(option) }">
                    {{ getOptionLabel(option) }}
                </div>

                <!-- No results message -->
                <div v-if="filteredOptions.length === 0" class="px-3 py-2 text-gray-500 text-center">
                    ไม่พบข้อมูล
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.searchable-select {
    width: 100%;
}

.rotate-180 {
    transform: rotate(180deg);
}
</style>