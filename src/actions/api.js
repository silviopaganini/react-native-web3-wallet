import {getAPIURL} from '../utils';
import {
    ERROR,
    CLAIM,
    TRANSFER,
    LOADING
} from '../constants/action-types';
import {getBalance} from './eth';
import {trustAsset} from './stellar';
import {load, save} from '../utils/storage';

export const validate = () => async (dispatch, getState) => {
    const {stellar} = getState().user;
    let {transactionHash} = getState().events;

    const loadedInfo = await load('burning');
    if (loadedInfo.transactionHash) {
        transactionHash = loadedInfo.transactionHash;
    }

    console.log('validate');

    dispatch({type: LOADING, payload: 'Finishing Ethereum validation'});

    try {
        let payload;

        if (!(loadedInfo.stellarAccount && loadedInfo.receipt)) {
            payload = await (await fetch(`${getAPIURL()}/claim`, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    tx: transactionHash,
                    pk: stellar.pk,
                })
            })).json();

            if (payload.error) {
                dispatch({type: LOADING, payload: getState().content.data.errorEthereumTransactionInvalid});
                setTimeout(dispatch, 5000, {type: LOADING, payload: null});
                return;
            }

            console.log(payload.stellar);

            loadedInfo.stellarAccount = payload.stellar;
            loadedInfo.receipt = payload.receipt;
            save('burning', loadedInfo);

        } else {
            payload = {
                stellar: loadedInfo.stellarAccount,
                receipt: loadedInfo.receipt,
            };
        }

        console.log(payload);

        dispatch({type: CLAIM, payload});
        dispatch(trustAsset());
    } catch (e) {
        console.log(e);
        dispatch({type: ERROR, payload: e});
    }
};

export const claim = () => async (dispatch, getState) => {
    const {stellar} = getState().user;
    let {transactionHash} = getState().events;

    const loadedInfo = await load('burning');

    if (loadedInfo.transactionHash) {
        transactionHash = loadedInfo.transactionHash;
    }

    dispatch({type: LOADING, payload: getState().content.data.statusValidatingEthereumTransaction});

    try {
        let payload;

        if (!loadedInfo.complete) {
            payload = await (await fetch(`${getAPIURL()}/transfer`, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    tx: transactionHash,
                    pk: stellar.pk,
                })
            })).json();

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

            loadedInfo.transfer = payload;
            save('burning', loadedInfo);

        } else {
            payload = loadedInfo.transfer;
        }

        dispatch({type: TRANSFER, payload});
        dispatch(getBalance());
        // dispatch(getActivity());
        dispatch({type: LOADING, payload: getState().content.data.statusTransferWolloComplete});
        setTimeout(dispatch, 2000, {
            type: LOADING,
            payload: null,
        });

        loadedInfo.complete = true;
        save('burning', loadedInfo);
    } catch (e) {
        console.log(e);
        dispatch({type: ERROR, payload: e});
    }
};
