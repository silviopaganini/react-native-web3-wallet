import {Record} from 'immutable';
import {save} from '../utils/storage';
import {
    CONTENT, LOCAL_STORAGE
} from '../constants/action-types';

const initialState = new Record({
    data: {},
    loaded: false,
    localStorage: null,
})();

export default (state = initialState, action) => {
    switch (action.type) {
        case CONTENT:
            return state
                .set('loaded', true)
                .set('data', action.payload);

        case LOCAL_STORAGE: {
            const localStorage = {...state.localStorage, ...action.payload};
            save('burning', localStorage);
            return state
                .set('localStorage', localStorage);
        }


        default:
            return state;
    }
};
