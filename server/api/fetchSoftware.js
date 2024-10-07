import PocketBase from 'pocketbase';

const config = useRuntimeConfig();
const url = config.apiUrl;
const client = new PocketBase(url);

export default defineEventHandler(async (event) => {
    const records = await client.collection('software').getFullList({
        sort: 'index'
    });

    const schemaList = records.map(item => item.data);

    return schemaList;
});