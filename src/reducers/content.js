import {Record} from 'immutable';
import {
    CONTENT,
} from '../constants/action-types';

const initialState = new Record({
    data: {},
    loaded: false,
})();

export default (state = initialState, action) => {
    switch (action.type) {
        case CONTENT: {
            return state
                .set('loaded', true)
                .set('data', action.payload);
        }

        default:
            return state;
    }
};
