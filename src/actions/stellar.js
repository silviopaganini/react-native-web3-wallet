import {getKeyPair} from '../utils';
import {trustAsset as trustAssetSDK} from '../constants/stellar';
import {claim} from './api';
import {LOADING} from '../constants/action-types';

export const trustAsset = () => async (dispatch, getState) => {
    const {stellar} = getState().user;
    const keyPair = getKeyPair(stellar.sk);

    dispatch({
        type: LOADING,
        payload: getState().content.data.statusTrustingStellarAsset,
    });

    try {
        await trustAssetSDK(stellar.pk, keyPair);
        dispatch({
            type: LOADING,
            payload: getState().content.data.statusStellarTokenTrusted,
        });

        dispatch(claim());

    } catch (e) {
        console.log(e);
        dispatch({
            type: LOADING,
            payload: getState().content.data.errorTrustingStellarAsset,
        });

        setTimeout(dispatch, 6000, {type: LOADING, payload: null});
    }


};
