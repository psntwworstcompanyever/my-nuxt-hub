import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);

    // Use try and catch to handle error
    try {
        const records = await client.collection('boards').getFullList({
            sort: 'index'
        });

        // Map over the records to return only the specific fields
        const formattedRecords = records.map(record => ({
            pcba_sn: record.pcba_sn,
            frame_size: record.frame_size,
            mcu: record.mcu
        }));

        return formattedRecords;

    } catch (error) {
        // Return a more graceful error response or handle logging
        console.error('Error fetching data from PocketBase:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch boards'
        });
    }
});