<script setup>
import { FormKitSchema } from '@formkit/vue'
import { getNode } from '@formkit/core'
import { ref, onMounted } from 'vue'

// Load data from the boards table
const route = useRoute();
const useBoard = () => useState('board', () => null);
const board = useBoard();

// If the page is refreshed and state is lost, you could fetch the student data again
// based on the route parameter
if (!board.value && route.params.name) {
    // You could fetch the student data here if needed
    // For now, we'll just show that we lost the data
    console.log('Board data not found for:', route.params.name);
}

const { data: customersData } = await useFetch('/api/fetchCustomers');
const { data: mailAddressesData } = await useFetch('/api/fetchMailAddresses');
const { data: hardwareSourceData } = await useFetch('/api/fetchHardware', {
    params: {
        pcba_sn: board.value.pcba_sn
    }
});
const { data: softwareSourceData } = await useFetch('/api/fetchSoftware');
const { data: settingData } = await useFetch('/api/fetchSetting', {
    params: {
        customer: 'Default'
    }
})

// Reconstruct softwareData and hardwareData from source.
const softwareData = reconstructFunction(softwareSourceData.value)
console.log('softwareData:', JSON.stringify(softwareData, null, 2));
const hardwareData = reconstructFunction(hardwareSourceData.value)

// Handle popup card
const isPopupVisible = ref(false);
const popCardContent = ref([])

// Function to process an array of objects
function reconstructFunction(arr) {
    return arr.map(addMethodToArray);
};

// Function to fetch customer setting data
async function fetchSettingData(payload) {
    const newData = await $fetch('/api/fetchSetting', {
        params: {
            customer: payload
        }
    })
    return newData;
}

const validation = ref({
    validationRules: { validation_function },
});

// Validation Function
function validation_function(node) {
    const user_setting = node.value;
    const customer_setting = settingData.value.parameter[node.name];
    if (user_setting === customer_setting) {
        node.props.suffixIcon = ""; // If it is correct, show nothing.
        return true;
    }
    node.props.suffixIcon = "warning";
    return true;
}

// Factory function that adds a method to an object
function addMethodToArray(obj) {
    // Base cases: return unchanged if not an object we need to process
    if (!obj || typeof obj !== 'object') return obj;
    if (obj.$el === 'h2') return obj;

    // If it’s a div, process its children recursively
    if (obj.$el === 'div') {
        return {
            ...obj,
            children: obj.children.map(child => addMethodToArray(child)) // Recurse into each child
        };
    }

    // If it’s a FormKit component, add the onPrefixIconClick handler
    if (obj.$cmp === 'FormKit') {
        return {
            ...obj, // Fixed: use `obj` instead of `child`
            props: {
                ...obj.props, // Fixed: use `obj.props`
                onPrefixIconClick: () => {
                    handleIconClick(getNode(obj.props.id), getNode('customers')); // Fixed: use `obj.props.id`
                }
            }
        };
    }

    // Default: return unchanged (handles any other schema nodes)
    return obj;
}

function handleIconClick(clickedNode, customerNode) {
    console.log(clickedNode.props)
    // Update pop card content
    popCardContent.value = [
        {
            item: 'Specification',
            description: clickedNode.props.label
        },
        {
            item: 'Illustration',
            description: clickedNode.props.attrs.illustration
        },
        {
            item: "Customer",
            description: customerNode.value
        },
        {
            item: "Customer Setting",
            description: settingData.value.parameter[clickedNode.props.id]
        },
        {
            item: 'Selected Item',
            description: clickedNode.value
        },
        {
            item: 'Note',
            description: settingData.value.note[clickedNode.props.id]
        }
    ]
    // Show the popup
    isPopupVisible.value = true;
}

async function handleSubmit() {
    const headerNode = getNode('header')
    const hardwareNode = getNode('hardware')
    const softwareNode = getNode('software')
    const formData = {
        header: headerNode.value,
        hardware: hardwareNode.value,
        software: softwareNode.value
    }
    console.log(formData)
    try {
        const response = await $fetch('/api/submitForm', {
            method: 'POST',
            body: JSON.stringify(formData), // Make sure to stringify the formData
            headers: {
                'Content-Type': 'application/json' // Set the content type to JSON
            }
        });
        console.log(response);
    } catch (error) {
        console.error('Error submitting form:', error);
    }
}

onMounted(() => {
    const customersNode = getNode('customers');
    const softwareNode = getNode('software');
    customersNode.on('commit', async ({ payload }) => {
        // Fetch new data
        const newSettingData = await fetchSettingData(payload)
        // Update settingData
        settingData.value = newSettingData;
        // To avoid reference bettwen two arrays.
        const deepCopy = JSON.parse(JSON.stringify(settingData.value.parameter))
        // Update softwareNode with the customer settings.
        softwareNode.input(deepCopy)
    })
});

</script>

<template>
    <FormKit type="form" id="myform" @submit="handleSubmit">
        <UButton label="Back to List" @click="navigateTo('/boards')" />
        <h2>Header</h2>
        <div class="header_container">
            <FormKit type="group" name="header" id="header">
                <FormKitSchema :schema="customersData" />
                <FormKitSchema :schema="mailAddressesData" />
            </FormKit>
        </div>
        <FormKit type="group" name="hardware" id="hardware">
            <FormKitSchema :schema="hardwareData" />
        </FormKit>
        <FormKit type="group" name="software" id="software">
            <FormKitSchema :schema="softwareData" :data="validation" />
        </FormKit>
    </FormKit>
    <UModal v-model="isPopupVisible">
        <UTable :rows="popCardContent" />
    </UModal>
</template>

<style>
.formkit-prefix-icon.formkit-icon svg {
    width: 16px;
    height: 16px;
}

.formkit-suffix-icon.formkit-icon svg {
    width: 16px;
    height: 16px;
    color: red;
}

.formkit-prefix-icon.formkit-icon {
    display: inline-block;
}

.formkit-suffix-icon.formkit-icon {
    display: inline-block;
}

.formkit-input {
    border: 1px solid #ccc;
}

.header_container {
    border: 1px solid #ccc;
    padding: 20px;
    margin-bottom: 20px;
}
</style>
