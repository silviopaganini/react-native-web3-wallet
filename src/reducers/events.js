import {Record} from 'immutable';
// import { NotificationManager } from 'react-notifications';
import {
    ACTIVITY,
    CLAIM,
    TRANSFER,
    LOADING,
    ERROR,
    BURNED,
} from '../constants/action-types';

const initialState = new Record({
    activity: [],
    claim: null,
    transfer: null,
    loading: null,
    transactionHash: null,
})();

export default (state = initialState, action) => {
    switch (action.type) {
        case ACTIVITY: {
            let events = state.activity.concat([]);
            if (!action.payload.transactionHash) {
                return state;
            }
            if (events.filter(e => e.transactionHash === action.payload.transactionHash).length > 0) {
                return state;
            }
            events = events.concat([action.payload]);
            return state
                .set('activity', events);
        }

        case BURNED:
            return state
                .set('transactionHash', action.payload);

        case ERROR:
            // console.log(action.payload.message || action.payload, action.payload.title || '');
            // NotificationManager.error(action.payload.message || action.payload, action.payload.title || '');
            return state
                .set('loading', action.payload.message);

        case LOADING:
            return state
                .set('loading', action.payload);

        case CLAIM:
            return state
                .set('claim', action.payload);

        case TRANSFER:
            return state
                .set('transfer', action.payload);

        default:
            return state;
    }
};
