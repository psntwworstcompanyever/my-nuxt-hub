import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);
    const { pcba_sn } = getQuery(event)

    // Use try and catch to handle error
    try{
        const record = await client.collection('hardware').getFirstListItem(`pcba_sn="${pcba_sn}"`);
        const schemaList = [
            {"$el": "h2", "children": ["Hardware Settings"]},
            {
                "$el": "div",
                "attrs": {
                    "style": "border: 1px solid #ccc; padding: 20px; margin-bottom: 20px;"
                },
                "children": record.data,
            },
        ]
        return schemaList;
    } catch(error){
        // Return a more graceful error response or handle logging
        console.error('Error fetching data from PocketBase:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch hardware'
        });
    }
});
