import PocketBase from 'pocketbase';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    // Create a new PocketBase client instance for each request
    const client = new PocketBase(config.apiUrl);

    // Use try and catch to handle error
    try {
        const { customer } = getQuery(event);
        const records = await client.collection('setting').getList(1, 50, {
            filter: `customer = "${customer}"`,
        });
        
        if (!records.items.length) {
            throw new Error('No settings found for customer');
        }

        const transformedData = records.items.reduce((acc, item) => {
            acc.parameter[item.specification] = item.parameter;
            acc.note[item.specification] = item.note;
            return acc;
        }, { parameter: {}, note: {} });

        return transformedData;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw new Error('Internal Server Error');
    }
});