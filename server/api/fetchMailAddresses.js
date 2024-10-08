import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);

    try {
        // Fetch data from PocketBase with error handling
        const records = await client.collection('mailAddresses').getFullList({
            sort: 'index',
            // You can limit the number of records if necessary
            // perPage: 50 
        });

        // Create options for FormKit schema
        const options = records.map(item => ({
            label: item.label,
            value: item.value
        }));

        // Return the FormKit schema
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

    } catch (error) {
        // Return a more graceful error response or handle logging
        console.error('Error fetching data from PocketBase:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch mail addresses'
        });
    }
});
