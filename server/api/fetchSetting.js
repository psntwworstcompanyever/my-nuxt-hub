import PocketBase from 'pocketbase';

const config = useRuntimeConfig();
const url = config.apiUrl;
const client = new PocketBase(url);

export default defineEventHandler(async (event) => {
    const { customer } = getQuery(event);
    const records = await client.collection('setting').getList(1, 50, {
        filter: `customer = "${customer}"`,
    });

    const transformedData = records.items.reduce((acc, item) => {
        acc.parameter[item.specification] = item.parameter;
        acc.note[item.specification] = item.note;
        return acc;
    }, { parameter: {}, note: {} });

    return transformedData;
});