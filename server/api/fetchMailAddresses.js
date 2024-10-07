import PocketBase from 'pocketbase';

const config = useRuntimeConfig();
const url = config.apiUrl;
const client = new PocketBase(url);

export default defineEventHandler(async (event) => {
    const records = await client.collection('mailAddresses').getFullList({
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
            name: "mailAddresses",
            type: "select",
            id: "mailAddresses",
            label: "Mail Addresses",
            options: options
        }
    };

    return schemaObject;
});