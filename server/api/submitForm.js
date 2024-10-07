// ~/server/api/submitForm.js
import PocketBase from 'pocketbase';

const config = useRuntimeConfig();
const url = config.apiUrl;
const client = new PocketBase(url);

export default defineEventHandler(async (event) => {
    const body = await readBody(event); // Use readBody to parse the JSON body

    const data = {
        "status": "uploaded",
        "form_data": body
    };

    try {
        const record = await client.collection('projects').create(data); // Replace 'submissions' with your collection name

        return {
            success: true,
            data: record,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
});