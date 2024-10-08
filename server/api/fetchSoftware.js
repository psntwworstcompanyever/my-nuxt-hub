import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);
    const records = await client.collection('software').getFullList({
        sort: 'index'
    });

    const schemaList = records.map(item => item.data);

    return schemaList;
});