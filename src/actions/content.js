import {createClient} from 'contentful';
import {CONTENT, LOCAL_STORAGE} from '../constants/action-types';
import {
    // clear,
    load
} from '../utils/storage';

const SPACE_ID = 'ez6679w6tm3p';
const ACCESS_TOKEN = '5df8f5cc2ad75d6d30c43edc427d28ff7ef0a5138779a26cd6a87ccc9b6cae31';

const client = createClient({
    space: SPACE_ID,
    accessToken: ACCESS_TOKEN
});

export const loadContent = () => async (dispatch) => {
    console.log('loadContent');
    const contentTypes = await client.getContentTypes();
    const entries = await client.getEntries({
        content_type: contentTypes.items[0].sys.id
    });

    console.log(entries.items[0].fields);

    dispatch({
        type: CONTENT,
        payload: entries.items[0].fields
    });
};

export const loadLocalStorage = () => async (dispatch) => {
    console.log('loadLocalStorage');
    const payload = await load('burning');
    console.log(payload);
    dispatch({
        type: LOCAL_STORAGE,
        payload
    });
};
