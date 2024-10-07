import PocketBase from 'pocketbase';

const config = useRuntimeConfig();
const url = config.apiUrl;
const client = new PocketBase(url);

export default defineEventHandler(async (event) => {
    const records = await client.collection('boards').getFullList({
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
            name: "boards",
            type: "select",
            id: "boards",
            label: "Boards",
            options: options
        }
    };
    return schemaObject;
});