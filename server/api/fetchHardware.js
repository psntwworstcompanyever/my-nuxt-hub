import PocketBase from 'pocketbase';

const config = useRuntimeConfig();
const url = config.apiUrl;
const client = new PocketBase(url);

export default defineEventHandler(async (event) => {
    console.time('fetchHardware');
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
    console.timeEnd('fetchHardware');
    return schemaList;
});
