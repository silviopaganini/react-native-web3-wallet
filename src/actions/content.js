import {createClient} from 'contentful';
import {CONTENT} from '../constants/action-types';

const SPACE_ID = 'ez6679w6tm3p';
const ACCESS_TOKEN = '5df8f5cc2ad75d6d30c43edc427d28ff7ef0a5138779a26cd6a87ccc9b6cae31';

const client = createClient({
    space: SPACE_ID,
    accessToken: ACCESS_TOKEN
});

export const loadContent = () => async (dispatch) => {
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
