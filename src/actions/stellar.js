import {getKeyPair} from '../utils';
import {trustAsset as trustAssetSDK} from '../constants/stellar';
import {claim} from './api';
import {LOADING, LOCAL_STORAGE} from '../constants/action-types';

export const trustAsset = () => async (dispatch, getState) => {
    const {stellar} = getState().user;
    const keyPair = getKeyPair(stellar.sk);
    const {localStorage} = getState().content;
    const {
        statusTrustingStellarAsset,
        statusStellarTokenTrusted,
        errorTrustingStellarAsset
    } = getState().content.data;

    dispatch({
        type: LOADING,
        payload: statusTrustingStellarAsset,
    });


    try {
        if (!localStorage.wolloTrusted) {
            await trustAssetSDK(stellar.pk, keyPair);
            dispatch({
                type: LOADING,
                payload: statusStellarTokenTrusted,
            });

            dispatch({
                type: LOCAL_STORAGE,
                payload: {
                    wolloTrusted: true,
                }
            });
        }

        dispatch(claim());

    } catch (e) {
        console.log(e);
        dispatch({
            type: LOADING,
            payload: errorTrustingStellarAsset,
        });

        setTimeout(dispatch, 6000, {type: LOADING, payload: null});
    }


};
