import { createStellarKeyPair, getKeyPair } from '../utils';
import { trustAsset as trustAssetSDK } from '../constants/stellar';
import { claim } from './api';
import { STELLAR, LOADING, ERROR } from '../constants/action-types';

export const createStellarAccount = () => dispatch => {
  dispatch({type: STELLAR, payload: createStellarKeyPair()});
};

export const trustAsset = () => async (dispatch, getState) => {
  const { stellar } = getState().user;
  const keyPair = getKeyPair(stellar.sk);

  dispatch({
    type: LOADING,
    payload: getState().content.statusTrustingStellarAsset,
  });

  try {
    await trustAssetSDK(stellar.pk, keyPair);
    dispatch({
      type: LOADING,
      payload: getState().content.statusStellarTokenTrusted,
    });

    dispatch(claim());

  } catch (e) {
    dispatch({
      type: ERROR,
      payload: getState().content.errorTrustingStellarAsset,
    });

    setTimeout(dispatch, 6000, { type: LOADING, payload: null});
  }


};
