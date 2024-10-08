import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);

    // Use try and catch to handle error
    try {
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
    } catch(error){
        // Return a more graceful error response or handle logging
        console.error('Error fetching data from PocketBase:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch customers'
        });
    }
});