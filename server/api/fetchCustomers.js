import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);
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