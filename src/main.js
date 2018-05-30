import './global';
import React from 'react';
import {Provider} from 'react-redux';
// import {createClient} from 'contentful';
import createStore from './store';
import App from './components/app';

// const SPACE_ID = 'ez6679w6tm3p';
// const ACCESS_TOKEN = '5df8f5cc2ad75d6d30c43edc427d28ff7ef0a5138779a26cd6a87ccc9b6cae31';

// const client = createClient({
//     space: SPACE_ID,
//     accessToken: ACCESS_TOKEN
// });

// const init = async () => {
//     const contentTypes = await client.getContentTypes();
//     const entries = await client.getEntries({
//         content_type: contentTypes.items[0].sys.id
//     });
//
//     render(entries.items[0].fields);
// };
//
// init();

export default () => (
    <Provider store={createStore()}>
        <App />
    </Provider>
);
