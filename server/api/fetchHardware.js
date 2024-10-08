import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);
    const { pcba_sn } = getQuery(event)
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
});
