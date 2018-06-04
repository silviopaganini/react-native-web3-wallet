import {getAPIURL} from '../utils';
import {
    ERROR,
    CLAIM,
    TRANSFER,
    LOADING
} from '../constants/action-types';
import {getBalance} from './eth';
import {trustAsset} from './stellar';

export const validate = () => async (dispatch, getState) => {
    const {stellar} = getState().user;
    const {transactionHash} = getState().events;
    console.log('validate', transactionHash);
    console.log('pk', stellar.pk);

    dispatch({type: LOADING, payload: getState().content.data.statusValidatingEthereumTransaction});

    try {
        const data = await fetch(`${getAPIURL()}/claim`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                tx: transactionHash,
                pk: stellar.pk,
            })
        });

        const payload = await data.json();
        console.log(payload);
        if (payload.error) {
            dispatch({type: LOADING, payload: getState().content.data.errorEthereumTransactionInvalid});
            setTimeout(dispatch, 5000, {type: LOADING, payload: null});
            return;
        }

        dispatch({type: CLAIM, payload});
        dispatch(trustAsset());
    } catch (e) {
        dispatch({type: ERROR, payload: e});
    }
};

export const claim = () => async (dispatch, getState) => {
    const {stellar} = getState().user;
    const {transactionHash} = getState().events;

    dispatch({type: LOADING, payload: getState().content.data.statusValidatingEthereumTransaction});

    try {
        const data = await fetch(`${getAPIURL()}/transfer`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                tx: transactionHash,
                pk: stellar.pk,
            })
        });

        const payload = await data.json();
        console.log(payload);

        if (payload.error) {
            if (payload.error === 1) {
                dispatch({type: LOADING, payload: getState().content.data.errorPaymentAlreadyProcessed});
            } else {
                dispatch({type: LOADING, payload: payload.message});
            }
            setTimeout(dispatch, 2000, {
                type: LOADING,
                payload: null
            });

            return;
        }

        dispatch({type: TRANSFER, payload});
        dispatch(getBalance());
        // dispatch(getActivity());
        dispatch({type: LOADING, payload: getState().content.data.statusTransferWolloComplete});
        setTimeout(dispatch, 2000, {
            type: LOADING,
            payload: null,
        });
    } catch (e) {
        dispatch({type: ERROR, payload: e});
    }
};
