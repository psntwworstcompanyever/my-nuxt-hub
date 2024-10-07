<script setup>
import { FormKitSchema } from '@formkit/vue'
import { getNode } from '@formkit/core'
import { ref, onMounted } from 'vue'

const { data: boardsData } = await useFetch('/api/fetchBoards');
const { data: customersData } = await useFetch('/api/fetchCustomers');
const { data: mailAddressesData } = await useFetch('/api/fetchMailAddresses');
const { data: popCardData } = await useFetch('/api/fetchPopCard');
const { data: softwareSourceData } = await useFetch('/api/fetchSoftware');
const { data: settingData } = await useFetch('/api/fetchSetting', {
    params: {
        customer: 'Default'
    }
})

// Reconstruct softwareData from source. (softwareSourceData is a reactive value)
const softwareData = reconstructFunction(softwareSourceData.value)

// Hardware node is left empty as it is hard to deal with while loading at the setup phase.
const hardwareData = ref([])

// Handle popup card
const isPopupVisible = ref(false);

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
                                handleIconClick(getNode(child.props.id), getNode('customers'), getNode('popcard'));
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

function handleIconClick(clickedNode, customerNode, popCardNode) {
    const cardContent = {
        pop_specification: clickedNode.props.label,
        pop_illustration: "XXX",
        pop_selected_item: clickedNode.value,
        pop_customer: customerNode.value,
        pop_customer_setting: settingData.value.parameter[clickedNode.props.id],
        pop_recommendation: settingData.value.note[clickedNode.props.id],
    }
    console.log(cardContent)
    // Update the pop card
    popCardNode.input(cardContent);
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
    <div v-show="isPopupVisible" class="popup">
        <FormKit type="group" name="popcard" id="popcard">
            <FormKitSchema :schema="popCardData" />
        </FormKit>
        <button @click="isPopupVisible = false">Close</button>
    </div>
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

.popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    z-index: 1000;
    border: 1px solid #ddd;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
