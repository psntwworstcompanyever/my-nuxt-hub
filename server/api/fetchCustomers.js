import PocketBase from 'pocketbase';

const config = useRuntimeConfig();
const url = config.apiUrl;
const client = new PocketBase(url);

export default defineEventHandler(async (event) => {
    const records = await client.collection('customers').getFullList({
        sort: 'index'
    });

    // Create options by looping through the list and appending label and value
    const options = records.map(item => ({
        label: item.label,
        value: item.value
    }));

    const schemaObject = {
        $cmp: "FormKit",
        props: {
            name: "customers",
            type: "select",
            id: "customers",
            label: "Customers",
            options: options
        }
    };

    return schemaObject;
});