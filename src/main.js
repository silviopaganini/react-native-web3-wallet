import './global';
import React from 'react';
import {Provider} from 'react-redux';
import createStore from './store';
import App from './components/app';

export default () => (
    <Provider store={createStore()}>
        <App />
    </Provider>
);
