/* eslint-disable no-console */

import {
    USER_BALANCE,
    USER_LOGIN,
    LOCAL_STORAGE,
    ERROR,
    LOADING
} from '../constants/action-types';
import {generateAddressFromSeed} from '../utils';

export const getBalance = () => async (dispatch, getState) => {
    try {
        const web3 = getState().web3.instance;
        const contract = getState().contract.instance;
        const balance = await contract.methods.balanceOf(getState().user.get('coinbase')).call();
        dispatch({type: USER_BALANCE, payload: web3.utils.toDecimal(balance)});

    } catch (e) {
        dispatch({type: ERROR, payload: e});
    }

};

export const checkUserCache = () => (dispatch, getState) => {
    console.log('checkUserCache');
    const {localStorage} = getState().content;
    console.log(localStorage);
    if (!localStorage) {
        return;
    }

    const {coinbase, privateKey} = localStorage;
    dispatch({
        type: USER_LOGIN,
        payload: {
            coinbase,
            privateKey
        },
    });

    dispatch(getBalance());
};

export const userLogin = (mnemonic, pk) => async (dispatch, getState) => {
    const web3 = getState().web3.instance;

    dispatch({type: LOADING, payload: null});

    try {
        const address = generateAddressFromSeed(mnemonic, pk);
        const account = web3.eth.accounts.privateKeyToAccount(`0x${address.privateKey}`);
        const coinbase = account.address;

        dispatch({
            type: LOCAL_STORAGE,
            payload: {
                coinbase,
                privateKey: address.privateKey,
                mnemonic
            }
        });

        dispatch({
            type: USER_LOGIN,
            payload: {
                coinbase,
                privateKey: address.privateKey
            },
        });

        dispatch(getBalance());

    } catch (e) {
        dispatch({type: ERROR, payload: e});
    }
};
