import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);

    try {
        const records = await client.collection('software').getFullList({
            sort: 'index'
        });
    
        const schemaList = records.map(item => item.data);
    
        return schemaList;
    } catch(error){
        // Return a more graceful error response or handle logging
        console.error('Error fetching data from PocketBase:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch software'
        });
    }

});