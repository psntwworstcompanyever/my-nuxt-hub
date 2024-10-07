<script setup>
import { FormKitSchema } from '@formkit/vue'
import { getNode } from '@formkit/core'
import { ref, onMounted } from 'vue'

const { data: boardsData } = await useFetch('/api/fetchBoards');
const { data: customersData } = await useFetch('/api/fetchCustomers');
const { data: mailAddressesData } = await useFetch('/api/fetchMailAddresses');
const { data: softwareSourceData } = await useFetch('/api/fetchSoftware');

// Reconstruct softwareData from source. (softwareSourceData is a reactive value)
const softwareData = reconstructFunction(softwareSourceData.value)

// Hardware node is left empty as it is hard to deal with while loading at the setup phase.
const hardwareData = ref([])

// Restriction set by Cloudflare. For some reason, I can only left settingData empty at the setup phase.
const settingData = ref([])

// Handle popup card
const isPopupVisible = ref(false);
const popCardContent = ref([])

// Function to process an array of objects
function reconstructFunction(arr) {
    return arr.map(addMethodToArray);
};

// Function to fetch hardware data
async function fetchHardwareData(payload) {
    const newData = await $fetch('/api/fetchHardware', {
        params: {
            pcba_sn: payload
        }
    })
    return newData;
}

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
    if (obj.$el === 'h2') {
        return obj;
    } else if (obj.$el === 'div') {
        return {
            ...obj,
            children: obj.children.map(child => {
                if (child.$cmp === 'FormKit') {
                    return {
                        ...child,
                        props: {
                            ...child.props,
                            onPrefixIconClick: () => {
                                handleIconClick(getNode(child.props.id), getNode('customers'));
                            }
                        }
                    };
                }
                return child;
            })
        };
    }
    return obj;
}

function handleIconClick(clickedNode, customerNode) {
    // Update pop card content
    popCardContent.value = [
        {
            item: 'Specification',
            description: clickedNode.props.label
        },
        {
            item: 'Illustration',
            description: "XXX"
        },
        {
            item: 'Selected Item',
            description: clickedNode.value
        },
        {
            item: "Customer",
            description: customerNode.value
        },
        {
            item: "Customer Setting",
            description: settingData.value.parameter[clickedNode.props.id]
        },
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
    const boardsNode = getNode('boards');
    boardsNode.on('commit', async ({ payload }) => {
        // Fetch new data
        console.log(payload)
        const hardwareSourceData = await fetchHardwareData(payload)
        console.log(hardwareSourceData)
        // Reconstruct hardwareData from source. (hardwareSourceData is not a reactive value)
        const hardwareReconstructData = reconstructFunction(hardwareSourceData)
        // Update it
        hardwareData.value = hardwareReconstructData
        // Lock the boardNode as the change in hardwareData tend to lead to errors.
        boardsNode.props.disabled = true
    });

    const customersNode = getNode('customers');
    const softwareNode = getNode('software');
    customersNode.on('commit', async ({ payload }) => {
        // Fetch new data
        console.log(payload)
        const newSettingData = await fetchSettingData(payload)
        console.log(newSettingData)
        // Update settingData
        settingData.value = newSettingData;
        // To avoid reference bettwen two arrays.
        const deepCopy = JSON.parse(JSON.stringify(settingData.value.parameter));
        // Update softwareNode
        softwareNode.input(deepCopy)
        // Lock the customerNode
        customersNode.props.disabled = true
    })
});

</script>

<template>
    <FormKit type="form" id="form" @submit="handleSubmit">
        <FormKit type="group" name="header" id="header">
            <FormKitSchema :schema="boardsData" />
            <FormKitSchema :schema="customersData" />
            <FormKitSchema :schema="mailAddressesData" />
        </FormKit>
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
</style>
