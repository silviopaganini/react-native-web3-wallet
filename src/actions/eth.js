/* eslint-disable no-console */

import {
    USER_BALANCE,
    USER_LOGIN,
    // ACTIVITY,
    ERROR,
    LOADING
} from '../constants/action-types';
import {load, save} from '../utils/storage';
import {getContract} from './contract';
import {generateAddressFromSeed} from '../utils';

let timeout;

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

// export const getActivity = () => async (dispatch, getState) => {
//     try {
//         const contract = getState().contract.instance;
//         contract.allEvents({from: getState().user.get('coinbase'), fromBlock: 0, toBlock: 'latest'}, (err, events) => {
//             if (err) {
//                 dispatch({type: 'error', payload: err});
//                 return;
//             }
//             dispatch({type: ACTIVITY, payload: events});
//         });
//     } catch (e) {
//         dispatch({type: ERROR, payload: e});
//     }
// };
//
export const checkUserCache = () => async (dispatch) => {
    try {
        const {coinbase, privateKey} = await load('burning:user');
        dispatch({
            type: USER_LOGIN,
            payload: {
                coinbase,
                privateKey
            },
        });

        dispatch(getContract());
    } catch (e) {
        console.log(e);
    }
};

export const userLogin = (mnemonic, pk) => async (dispatch, getState) => {
    clearTimeout(timeout);
    timeout = 0;

    const web3 = getState().web3.instance;

    dispatch({type: LOADING, payload: null});

    try {
        const address = generateAddressFromSeed(mnemonic, pk);
        const account = web3.eth.accounts.privateKeyToAccount(`0x${address.privateKey}`);
        const coinbase = account.address;

        save('burning:user', {coinbase, privateKey: address.privateKey, mnemonic});

        dispatch({
            type: USER_LOGIN,
            payload: {
                coinbase,
                privateKey: address.privateKey
            },
        });

        dispatch(getContract());

    } catch (e) {
        dispatch({type: ERROR, payload: e});
    }
};
